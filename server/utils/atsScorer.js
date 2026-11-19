
const normalizeText = (text) => {
    return text
        .toLowerCase()
        .replace(/[^\w\s+#.-]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
};

const escapeRegex = (value) => {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

const containsTerm = (text, term) => {
    const escaped = escapeRegex(term.toLowerCase());

    return new RegExp(
        `(^|[^a-z0-9])${escaped}($|[^a-z0-9])`,
        "i"
    ).test(text);
};

// Extract useful keywords instead of every word from the JD.
const extractJobWords = (description) => {
    const stopWords = new Set([
        "the", "and", "for", "with", "you", "your",
        "are", "our", "will", "this", "that", "from",
        "have", "has", "who", "what", "work", "role",
        "job", "team", "their", "they", "all", "can",
        "to", "of", "in", "on", "is", "a", "an",
        "as", "at", "by", "or", "be", "we", "it",
        "years", "year", "must", "should", "ability",
        "good", "strong", "excellent", "knowledge",
        "skills", "experience", "preferred", "required",
        "responsibilities", "requirements", "candidate",
        "including", "using", "work", "working",
        "develop", "development", "understanding"
    ]);

    return [
        ...new Set(
            normalizeText(description)
                .split(/\s+/)
                .filter(word =>
                    word.length > 2 &&
                    !stopWords.has(word)
                )
        )
    ];
};

const calculateATSScore = (resumeText, jobDescription = "") => {

    const text = normalizeText(resumeText);
    const wordCount = text.split(/\s+/).filter(Boolean).length;

    const suggestions = [];
    const breakdown = {};

    // 1. Contact Information - 10 points
    let contactScore = 0;

    if (/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(resumeText)) {
        contactScore += 4;
    } else {
        suggestions.push("Add a valid professional email address.");
    }

    if (/\+?\d[\d\s().-]{7,}\d/.test(resumeText)) {
        contactScore += 3;
    } else {
        suggestions.push("Add your contact number.");
    }

    if (/\b(linkedin|github|portfolio)\b/i.test(resumeText)) {
        contactScore += 3;
    } else {
        suggestions.push("Add relevant LinkedIn, GitHub or portfolio links.");
    }

    breakdown.contactInformation = {
        score: contactScore,
        maxScore: 10
    };

    // 2. Resume Sections - 20 points
    const sections = [
        { name: "Education", regex: /\b(education|academic background|qualifications)\b/i },
        { name: "Experience", regex: /\b(experience|employment|work history|internship)\b/i },
        { name: "Skills", regex: /\b(skills|technical skills|technologies|competencies)\b/i },
        { name: "Projects", regex: /\b(projects|personal projects|academic projects)\b/i },
        { name: "Achievements", regex: /\b(achievements|certifications|awards|accomplishments)\b/i }
    ];

    const detectedSections = [];

    sections.forEach(section => {
        if (section.regex.test(resumeText)) {
            detectedSections.push(section.name);
        } else {
            suggestions.push(
                `Consider adding a clearly labelled ${section.name} section if relevant to your profile.`
            );
        }
    });

    const sectionScore = detectedSections.length * 4;

    breakdown.resumeSections = {
        score: sectionScore,
        maxScore: 20,
        detected: detectedSections
    };

    // 3. Content Quality and Length - 15 points
    let contentScore = 0;

    if (wordCount >= 250 && wordCount <= 1000) {
        contentScore += 10;
    } else if (wordCount >= 150 && wordCount < 250) {
        contentScore += 7;
        suggestions.push(
            "Add more relevant details about your education, experience and projects."
        );
    } else if (wordCount > 1000 && wordCount <= 1200) {
        contentScore += 7;
        suggestions.push(
            "Consider removing repetitive or irrelevant information."
        );
    } else {
        contentScore += 3;
        suggestions.push(
            "Review your resume length and keep the content concise and relevant."
        );
    }

    if (detectedSections.length >= 4) {
        contentScore += 5;
    }

    breakdown.contentQuality = {
        score: contentScore,
        maxScore: 15,
        wordCount
    };

    // 4. Achievements and Action Verbs - 15 points
    const actionVerbs = [
        "developed", "implemented", "designed", "created",
        "built", "optimized", "managed", "led", "improved",
        "engineered", "automated", "analyzed", "delivered",
        "reduced", "increased", "launched", "integrated",
        "deployed", "maintained", "collaborated", "achieved"
    ];

    const detectedActionVerbs = actionVerbs.filter(verb =>
        containsTerm(text, verb)
    );

    // Count measurable results rather than arbitrary numbers.
    const quantifiedResults = resumeText.match(
        /\b\d+(?:\.\d+)?\s*(?:%|percent|x|users|customers|projects|hours|days|seconds|ms|k|million|billion)\b/gi
    ) || [];

    const achievementScore =
        Math.min(detectedActionVerbs.length, 8) +
        Math.min(quantifiedResults.length, 7);

    if (detectedActionVerbs.length < 3) {
        suggestions.push(
            "Start bullet points with action verbs such as Developed, Implemented, Optimized and Designed."
        );
    }

    if (quantifiedResults.length < 2) {
        suggestions.push(
            "Include measurable results, percentages or numbers wherever you can demonstrate actual impact."
        );
    }

    breakdown.achievements = {
        score: achievementScore,
        maxScore: 15,
        actionVerbCount: detectedActionVerbs.length,
        quantifiedResults: quantifiedResults.length
    };

    // 5. Technical Skills - 15 points
    const technicalSkills = [
        "javascript", "typescript", "python", "java", "c++",
        "react", "node.js", "express", "mongodb", "sql",
        "mysql", "postgresql", "redis", "html", "css",
        "tailwind", "docker", "kubernetes", "aws", "git",
        "rest api", "machine learning", "deep learning",
        "data structures", "algorithms", "next.js",
        "spring boot", "fastapi", "django", "linux",
        "firebase", "tensorflow", "pytorch", "figma",
        "excel", "power bi", "tableau"
    ];

    const detectedSkills = technicalSkills.filter(skill =>
        containsTerm(text, skill)
    );

    const skillsScore = Math.min(detectedSkills.length, 15);

    if (detectedSkills.length < 5) {
        suggestions.push(
            "Include a dedicated technical skills section with relevant technologies you actually know."
        );
    }

    breakdown.skills = {
        score: skillsScore,
        maxScore: 15,
        detected: detectedSkills
    };

    // 6. Job Description Matching - 15 points
    let matchedKeywords = [];
    let missingKeywords = [];
    let keywordScore = 8;
    let matchPercentage = null;

    if (jobDescription.trim()) {

        const jobWords = extractJobWords(jobDescription);

        matchedKeywords = jobWords.filter(keyword =>
            containsTerm(text, keyword)
        );

        missingKeywords = jobWords.filter(keyword =>
            !matchedKeywords.includes(keyword)
        );

        matchPercentage = jobWords.length
            ? Math.round(
                (matchedKeywords.length / jobWords.length) * 100
            )
            : 0;

        keywordScore = Math.round(matchPercentage * 0.15);

        if (missingKeywords.length > 0) {
            suggestions.push(
                `Review these job-description keywords that were not detected: ${missingKeywords.slice(0, 10).join(", ")}. Add only those that genuinely match your experience.`
            );
        }
    } else {
        suggestions.push(
            "Paste a target job description to receive a job-specific keyword matching analysis."
        );
    }

    breakdown.jobDescriptionMatch = {
        score: keywordScore,
        maxScore: 15,
        matchedKeywords: matchedKeywords.slice(0, 30),
        missingKeywords: missingKeywords.slice(0, 30),
        matchPercentage
    };

    // 7. Readability and Text Structure - 10 points
    const lines = resumeText
        .split(/\r?\n/)
        .map(line => line.trim())
        .filter(Boolean);

    const bulletCount = (
        resumeText.match(/^[ \t]*(?:[•●▪◦*-]|\d+[.)])\s+/gm) || []
    ).length;

    let readabilityScore = 0;

    if (lines.length >= 10) {
        readabilityScore += 3;
    } else {
        suggestions.push(
            "Use clearly separated lines and headings to improve text readability."
        );
    }

    if (bulletCount >= 3) {
        readabilityScore += 3;
    } else {
        suggestions.push(
            "Use consistent bullet points to organize your experience and projects."
        );
    }

    const averageLineLength = lines.length
        ? lines.reduce((total, line) => total + line.length, 0) / lines.length
        : 0;

    if (averageLineLength > 0 && averageLineLength <= 150) {
        readabilityScore += 2;
    }

    if (wordCount > 0 && wordCount <= 1200) {
        readabilityScore += 2;
    }

    breakdown.readability = {
        score: readabilityScore,
        maxScore: 10,
        lineCount: lines.length,
        bulletCount
    };

    // Final Score
    const score = Math.min(
        Object.values(breakdown).reduce(
            (total, item) => total + item.score, 0
        ),
        100
    );

    let rating;

    if (score >= 85) {
        rating = "Excellent";
    } else if (score >= 70) {
        rating = "Good";
    } else if (score >= 50) {
        rating = "Average";
    } else if (score >= 30) {
        rating = "Needs Improvement";
    } else {
        rating = "Poor";
    }

    return {
        success: true,
        score,
        rating,
        breakdown,
        suggestions: [...new Set(suggestions)],
        analysis: {
            wordCount,
            detectedSections,
            detectedSkills,
            hasJobDescription: Boolean(jobDescription.trim())
        }
    };
};

export default calculateATSScore;
