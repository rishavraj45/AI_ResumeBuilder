import React, { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {ArrowLeft,UploadCloud,FileText,X,LoaderCircle,ShieldCheck,Target,CheckCircle2,AlertCircle,RotateCcw,Briefcase,Sparkles} from 'lucide-react'
import api from '../configs/api'
import toast from 'react-hot-toast'

const ATSChecker = () => {

    const fileInputRef = useRef(null)

    const [file, setFile] = useState(null)
    const [jobDescription, setJobDescription] = useState('')
    const [dragActive, setDragActive] = useState(false)
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState(null)

    const validateFile = (selectedFile) => {
        if (!selectedFile) return false

        const allowedExtensions = ['pdf', 'docx', 'txt']
        const extension = selectedFile.name.split('.').pop().toLowerCase()

        if (!allowedExtensions.includes(extension)) {
            toast.error('Please upload a PDF, DOCX or TXT file.')
            return false
        }

        if (selectedFile.size > 5 * 1024 * 1024) {
            toast.error('File size must be less than 5 MB.')
            return false
        }

        setFile(selectedFile)
        setResult(null)

        return true
    }

    const handleFileChange = (e) => {
        const selectedFile = e.target.files?.[0]

        if (selectedFile) {
            validateFile(selectedFile)
        }

        e.target.value = ''
    }

    const handleDragOver = (e) => {
        e.preventDefault()
        setDragActive(true)
    }

    const handleDragLeave = (e) => {
        e.preventDefault()
        setDragActive(false)
    }

    const handleDrop = (e) => {
        e.preventDefault()
        setDragActive(false)

        const droppedFile = e.dataTransfer.files?.[0]

        if (droppedFile) {
            validateFile(droppedFile)
        }
    }

    const removeFile = () => {
        setFile(null)
        setResult(null)

        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    const checkATSScore = async () => {

        if (!file) {
            toast.error('Please upload your resume first.')
            return
        }

        try {
            setLoading(true)
            setResult(null)

            const formData = new FormData()

            formData.append('resume', file)
            formData.append('jobDescription', jobDescription)

            const { data } = await api.post(
                '/api/ats/check',
                formData
            )

            if (data.success) {
                setResult(data)
                toast.success('Resume analyzed successfully!')
            } else {
                toast.error(data.message || 'Analysis failed.')
            }

        } catch (error) {
            console.error('ATS Checker Error:', error)

            toast.error(
                error.response?.data?.message ||
                'Unable to analyze your resume. Please try again.'
            )
        } finally {
            setLoading(false)
        }
    }

    const getRating = (score) => {
        if (score >= 85) {
            return {
                label: 'Excellent',
                color: 'text-green-600',
                bg: 'bg-green-50',
                message: 'Your resume demonstrates strong ATS readiness. Keep refining it for your target role.'
            }
        }

        if (score >= 70) {
            return {
                label: 'Good',
                color: 'text-green-600',
                bg: 'bg-green-50',
                message: 'Your resume has a good foundation. A few improvements can make it stronger.'
            }
        }

        if (score >= 50) {
            return {
                label: 'Average',
                color: 'text-yellow-600',
                bg: 'bg-yellow-50',
                message: 'Your resume needs some improvements to become more ATS-friendly.'
            }
        }

        if (score >= 30) {
            return {
                label: 'Needs Improvement',
                color: 'text-orange-600',
                bg: 'bg-orange-50',
                message: 'Several important areas need attention. Review the suggestions below.'
            }
        }

        return {
            label: 'Poor',
            color: 'text-red-600',
            bg: 'bg-red-50',
            message: 'Your resume needs significant improvements. Start with the basic sections and content.'
        }
    }

    const formatCategory = (key) => {
        const labels = {
            contactInformation: 'Contact Information',
            resumeSections: 'Resume Sections',
            contentQuality: 'Content Quality',
            achievements: 'Achievements & Impact',
            skills: 'Technical Skills',
            jobDescriptionMatch: 'Job Description Match',
            readability: 'Readability & Formatting'
        }

        return labels[key] || key
    }

    const resetChecker = () => {
        setFile(null)
        setJobDescription('')
        setResult(null)

        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }

        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const rating = result ? getRating(result.score) : null

    return (
        <div className="min-h-screen bg-slate-50">

            {/* Navbar */}
            <nav className="flex items-center justify-between px-6 md:px-16 py-5 bg-white border-b border-slate-100">

                <Link to="/" className="flex items-center gap-2">
                    <img src="/logo.svg" alt="Resume Logo" className="h-10" />
                </Link>

                <Link
                    to="/"
                    className="flex items-center gap-2 text-sm text-slate-600 hover:text-green-600 transition"
                >
                    <ArrowLeft size={17} />
                    Back to Home
                </Link>

            </nav>

            <main className="max-w-5xl mx-auto px-5 py-12 md:py-16">

                {/* Heading */}
                <div className="text-center mb-10">

                    <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm mb-5">
                        <ShieldCheck size={17} />
                        Free ATS Resume Analysis
                    </div>

                    <h1 className="text-3xl md:text-5xl font-semibold text-slate-900">
                        Check Your Resume's
                        <span className="text-green-600"> ATS Score</span>
                    </h1>

                    <p className="text-slate-500 max-w-2xl mx-auto mt-4 leading-relaxed">
                        Upload your existing resume and discover how well it
                        performs against important ATS-readiness criteria.
                        Get actionable suggestions to improve it.
                    </p>

                </div>

                {!result ? (

                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-9">

                        {/* Upload Section */}
                        <div className="mb-8">

                            <div className="flex items-center gap-2 mb-4">
                                <FileText className="text-green-600" size={21} />
                                <h2 className="font-semibold text-slate-800 text-lg">
                                    Upload Your Resume
                                </h2>
                            </div>

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".pdf,.docx,.txt"
                                onChange={handleFileChange}
                                className="hidden"
                            />

                            {!file ? (

                                <div
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                    onClick={() => fileInputRef.current?.click()}
                                    className={`border-2 border-dashed rounded-xl p-10 md:p-14 text-center cursor-pointer transition
                                    ${dragActive
                                            ? 'border-green-500 bg-green-50'
                                            : 'border-slate-300 hover:border-green-500 hover:bg-green-50/40'
                                        }`}
                                >

                                    <div className="size-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-5">
                                        <UploadCloud size={30} className="text-green-600" />
                                    </div>

                                    <h3 className="text-lg font-medium text-slate-800">
                                        Drag and drop your resume here
                                    </h3>

                                    <p className="text-slate-500 text-sm mt-2">
                                        or click to browse files
                                    </p>

                                    <p className="text-xs text-slate-400 mt-5">
                                        Supported formats: PDF, DOCX, TXT (Max 5 MB)
                                    </p>

                                </div>

                            ) : (

                                <div className="flex items-center justify-between gap-4 border border-green-200 bg-green-50/60 rounded-xl p-5">

                                    <div className="flex items-center gap-4 min-w-0">

                                        <div className="size-12 bg-white rounded-lg flex items-center justify-center shrink-0">
                                            <FileText className="text-green-600" size={25} />
                                        </div>

                                        <div className="min-w-0">
                                            <p className="font-medium text-slate-800 truncate">
                                                {file.name}
                                            </p>

                                            <p className="text-xs text-slate-500 mt-1">
                                                {(file.size / (1024 * 1024)).toFixed(2)} MB
                                            </p>
                                        </div>

                                    </div>

                                    <button
                                        onClick={removeFile}
                                        className="text-slate-400 hover:text-red-500 transition"
                                        aria-label="Remove resume"
                                    >
                                        <X size={21} />
                                    </button>

                                </div>

                            )}

                        </div>

                        {/* Job Description */}
                        <div className="mb-8">

                            <div className="flex items-center gap-2 mb-3">
                                <Briefcase className="text-green-600" size={21} />

                                <h2 className="font-semibold text-slate-800 text-lg">
                                    Target Job Description
                                </h2>

                                <span className="text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded-full">
                                    Optional
                                </span>
                            </div>

                            <textarea
                                value={jobDescription}
                                onChange={(e) => setJobDescription(e.target.value)}
                                placeholder="Paste the job description here to check how well your resume matches the required skills and keywords..."
                                rows={6}
                                className="w-full p-4 border border-slate-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none resize-y text-sm text-slate-700"
                            />

                            <p className="text-xs text-slate-400 mt-2">
                                Adding a job description enables job-specific keyword matching.
                            </p>

                        </div>

                        {/* Submit */}
                        <button
                            onClick={checkATSScore}
                            disabled={!file || loading}
                            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-medium py-4 rounded-xl flex items-center justify-center gap-2 transition"
                        >

                            {loading ? (
                                <>
                                    <LoaderCircle size={20} className="animate-spin" />
                                    Analyzing Your Resume...
                                </>
                            ) : (
                                <>
                                    <Sparkles size={19} />
                                    Check ATS Score
                                </>
                            )}

                        </button>

                        <p className="text-xs text-center text-slate-400 mt-4">
                            Your resume is analyzed for this request and is not saved to your resume database.
                        </p>

                    </div>

                ) : (

                    /* Results Section */
                    <div className="space-y-7">

                        {/* Overall Score */}
                        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-7 md:p-10">

                            <div className="text-center">

                                <div className="flex items-center justify-center gap-2 text-green-600 mb-3">
                                    <CheckCircle2 size={20} />
                                    <span className="font-medium text-sm">
                                        Analysis Completed
                                    </span>
                                </div>

                                <h2 className="text-2xl font-semibold text-slate-800">
                                    Your ATS Resume Score
                                </h2>

                                <div className="relative size-48 mx-auto my-8 rounded-full flex items-center justify-center"
                                    style={{
                                        background: `conic-gradient(#16a34a ${result.score * 3.6}deg, #e2e8f0 0deg)`
                                    }}
                                >

                                    <div className="size-40 bg-white rounded-full flex flex-col items-center justify-center">
                                        <span className="text-5xl font-bold text-slate-800">
                                            {result.score}
                                        </span>
                                        <span className="text-sm text-slate-400">
                                            out of 100
                                        </span>
                                    </div>

                                </div>

                                <span className={`inline-block px-5 py-2 rounded-full font-semibold ${rating.bg} ${rating.color}`}>
                                    {rating.label}
                                </span>

                                <p className="text-slate-500 max-w-xl mx-auto mt-4 text-sm leading-relaxed">
                                    {rating.message}
                                </p>

                            </div>

                        </div>

                        {/* Score Breakdown */}
                        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 md:p-8">

                            <h2 className="text-xl font-semibold text-slate-800 mb-6">
                                Score Breakdown
                            </h2>

                            <div className="space-y-6">

                                {Object.entries(result.breakdown).map(([key, item]) => (

                                    <div key={key}>

                                        <div className="flex items-center justify-between gap-3 mb-2">

                                            <span className="text-sm font-medium text-slate-700">
                                                {formatCategory(key)}
                                            </span>

                                            <span className="text-sm font-semibold text-slate-800">
                                                {item.score}/{item.maxScore}
                                            </span>

                                        </div>

                                        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">

                                            <div
                                                className="h-full bg-green-500 rounded-full transition-all duration-700"
                                                style={{
                                                    width: `${(item.score / item.maxScore) * 100}%`
                                                }}
                                            />

                                        </div>

                                    </div>

                                ))}

                            </div>

                        </div>

                        {/* Suggestions */}
                        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 md:p-8">

                            <div className="flex items-center gap-3 mb-6">
                                <div className="size-10 rounded-lg bg-yellow-50 flex items-center justify-center">
                                    <Target className="text-yellow-600" size={22} />
                                </div>

                                <div>
                                    <h2 className="text-xl font-semibold text-slate-800">
                                        Improvement Suggestions
                                    </h2>
                                    <p className="text-sm text-slate-500">
                                        Actionable recommendations for your resume
                                    </p>
                                </div>
                            </div>

                            {result.suggestions?.length > 0 ? (

                                <div className="space-y-4">

                                    {result.suggestions.map((suggestion, index) => (

                                        <div key={index} className="flex gap-3 items-start">

                                            <AlertCircle
                                                size={19}
                                                className="text-yellow-500 shrink-0 mt-0.5"
                                            />

                                            <p className="text-sm text-slate-600 leading-relaxed">
                                                {suggestion}
                                            </p>

                                        </div>

                                    ))}

                                </div>

                            ) : (

                                <p className="text-sm text-green-600">
                                    Great work! No major suggestions were identified.
                                </p>

                            )}

                        </div>

                        {/* Detected Skills */}
                        {result.breakdown.skills?.detected?.length > 0 && (

                            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 md:p-8">

                                <h2 className="text-lg font-semibold text-slate-800 mb-4">
                                    Detected Technical Skills
                                </h2>

                                <div className="flex flex-wrap gap-2">

                                    {result.breakdown.skills.detected.map((skill, index) => (

                                        <span
                                            key={index}
                                            className="px-3 py-2 bg-green-50 text-green-700 rounded-lg text-sm"
                                        >
                                            {skill}
                                        </span>

                                    ))}

                                </div>

                            </div>

                        )}

                        {/* Job Matching */}
                        {result.breakdown.jobDescriptionMatch?.matchPercentage !== null &&
                            result.breakdown.jobDescriptionMatch?.matchPercentage !== undefined && (

                                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 md:p-8">

                                    <h2 className="text-lg font-semibold text-slate-800 mb-4">
                                        Job Description Matching
                                    </h2>

                                    <p className="text-3xl font-bold text-green-600 mb-2">
                                        {result.breakdown.jobDescriptionMatch.matchPercentage}%
                                    </p>

                                    <p className="text-sm text-slate-500 mb-5">
                                        Keyword coverage based on the supplied job description.
                                    </p>

                                    <div className="mb-5">
                                        <p className="text-sm font-medium text-slate-700 mb-2">
                                            Matched Keywords
                                        </p>

                                        <div className="flex flex-wrap gap-2">
                                            {result.breakdown.jobDescriptionMatch.matchedKeywords.map((keyword, index) => (
                                                <span key={index} className="bg-green-50 text-green-700 px-3 py-1.5 rounded-lg text-xs">
                                                    {keyword}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {result.breakdown.jobDescriptionMatch.missingKeywords.length > 0 && (
                                        <div>
                                            <p className="text-sm font-medium text-slate-700 mb-2">
                                                Keywords Not Detected
                                            </p>

                                            <div className="flex flex-wrap gap-2">
                                                {result.breakdown.jobDescriptionMatch.missingKeywords.map((keyword, index) => (
                                                    <span key={index} className="bg-red-50 text-red-600 px-3 py-1.5 rounded-lg text-xs">
                                                        {keyword}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                </div>
                            )}

                        {/* Analyze Again */}
                        <div className="flex justify-center pt-3">

                            <button
                                onClick={resetChecker}
                                className="flex items-center gap-2 px-7 py-3 bg-green-600 hover:bg-green-700 text-white rounded-full transition"
                            >
                                <RotateCcw size={17} />
                                Analyze Another Resume
                            </button>

                        </div>

                    </div>

                )}

                {/* Footer Note */}
                <div className="flex items-center justify-center gap-2 text-xs text-slate-400 mt-10 text-center">
                    <ShieldCheck size={15} />
                    ATS score is an estimated assessment, not a guarantee of selection.
                </div>

            </main>

        </div>
    )
}

export default ATSChecker
