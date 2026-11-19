import express from "express";
import multer from "multer";
import path from "path";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import mammoth from "mammoth";

import calculateATSScore from "../utils/atsScorer.js";

const atsRouter = express.Router();

// Store uploaded files in memory instead of saving them on the server.
const storage = multer.memoryStorage();

const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024
    },
    fileFilter: (req, file, cb) => {

        const extension = path.extname(file.originalname).toLowerCase();

        const allowedExtensions = [".pdf", ".docx", ".txt"];

        if (allowedExtensions.includes(extension)) {
            cb(null, true);
        } else {
            cb(new Error("Only PDF, DOCX and TXT files are supported."));
        }
    }
});

// POST /api/ats/check
atsRouter.post("/check", (req, res) => {

    upload.single("resume")(req, res, async (error) => {

        if (error) {
            return res.status(400).json({
                success: false,
                message: error.code === "LIMIT_FILE_SIZE"
                    ? "Resume size must be less than 5 MB."
                    : error.message
            });
        }

        try {

            // Check uploaded file
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: "Please upload your resume."
                });
            }

            const extension = path.extname(
                req.file.originalname
            ).toLowerCase();

            let extractedText = "";

            // Extract text from PDF
            if (extension === ".pdf") {

    const loadingTask = pdfjsLib.getDocument({
        data: new Uint8Array(req.file.buffer)
    });

    const pdfDocument = await loadingTask.promise;

    const pages = [];

    for (let i = 1; i <= pdfDocument.numPages; i++) {

        const page = await pdfDocument.getPage(i);

        const textContent = await page.getTextContent();

        const pageText = textContent.items
            .map(item => item.str)
            .join(" ");

        pages.push(pageText);
    }

    extractedText = pages.join("\n");

    await loadingTask.destroy();
}

            // Extract text from DOCX
            else if (extension === ".docx") {

                const docxData = await mammoth.extractRawText({
                    buffer: req.file.buffer
                });

                extractedText = docxData.value;

            }

            // Read TXT file
            else if (extension === ".txt") {

                extractedText = req.file.buffer.toString("utf-8");

            }

            // Validate extracted content
            if (!extractedText || extractedText.trim().length < 50) {

                return res.status(400).json({
                    success: false,
                    message: "Unable to extract sufficient text from this resume. If it is a scanned PDF, please upload a text-based PDF or DOCX."
                });

            }

            // Optional job description
            const jobDescription = typeof req.body.jobDescription === "string"
                ? req.body.jobDescription.slice(0, 30000)
                : "";

            // Calculate ATS score
            const result = calculateATSScore(
                extractedText,
                jobDescription
            );

            // Send response
            return res.status(200).json({
                ...result,
                fileName: req.file.originalname
            });

        } catch (error) {

            console.error("ATS Analysis Error:", error);

            return res.status(500).json({
                success: false,
                message: "Something went wrong while analyzing the resume."
            });

        }

    });

});

export default atsRouter;
