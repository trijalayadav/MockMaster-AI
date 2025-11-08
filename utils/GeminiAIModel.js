// Save this file as: utils/GeminiAIModel.js
// Install dependency: npm install @google/generative-ai

import { GoogleGenerativeAI } from "@google/generative-ai";

async function generateInterviewQuestions(formData) {
    // Verify API key
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    const questionCount = process.env.NEXT_PUBLIC_INTERVIEW_QUESTION_COUNT || 5;

    console.log("=== DEBUG INFO ===");
    console.log("API Key exists:", !!apiKey);
    console.log("API Key length:", apiKey?.length || 0);
    console.log("API Key first 10 chars:", apiKey?.substring(0, 10) || "NOT FOUND");
    console.log("Question Count:", questionCount);
    console.log("==================");

    if (!apiKey) {
        console.error("ERROR: NEXT_PUBLIC_GEMINI_API_KEY is not set in environment variables");
        alert("API Key is missing! Please check your .env.local file");
        return {
            questions: [
                {
                    id: 1,
                    question: "API Key Missing",
                    answer: "Please set NEXT_PUBLIC_GEMINI_API_KEY in your .env.local file",
                },
            ],
        };
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    // ✅ Prioritize working model first
    const modelNames = [
        "gemini-2.5-flash", // confirmed working
        "gemini-2.0-flash",
        "gemini-2.0-pro",
        "gemini-1.5-flash",
        "gemini-1.5-pro",
        "gemini-pro",
        "gemini-1.5-flash-001",
        "gemini-1.5-pro-001",
        "models/gemini-1.5-flash",
        "models/gemini-1.5-pro",
    ];

    let lastError = null;

    for (const modelName of modelNames) {
        try {
            console.log(`Trying model: ${modelName}`);
            const model = genAI.getGenerativeModel({ model: modelName });

            const prompt = `Generate ${questionCount} interview questions and answers for the following job position:
Job Role: ${formData.role}
Job Description/Tech Stack: ${formData.description}
Years of Experience: ${formData.experience}

Please provide the response ONLY as a JSON object in this exact format (no markdown, no extra text):
{
  "questions": [
    {
      "id": 1,
      "question": "Question text here",
      "answer": "Sample answer here"
    }
  ]
}

Generate exactly ${questionCount} questions. Make the questions appropriate for someone with ${formData.experience} years of experience.`;

            const result = await model.generateContent(prompt);
            const response = result.response;
            const textResponse = response.text();

            console.log("Raw AI Response:", textResponse);

            // ✅ Clean and prepare text for JSON parsing
            let cleanedResponse = textResponse
                .replace(/```json/gi, "")
                .replace(/```/g, "")
                .replace(/[\u201C\u201D]/g, '"') // replace smart quotes
                .trim();

            // ✅ Try to extract JSON safely
            let interviewData;
            const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                interviewData = JSON.parse(jsonMatch[0]);
            } else {
                interviewData = JSON.parse(cleanedResponse);
            }

            console.log("✓ Successfully generated interview questions with model:", modelName);
            console.log("Generated Interview Questions and Answers:");
            console.log(JSON.stringify(interviewData, null, 2));

            return interviewData;
        } catch (error) {
            console.warn(`Model ${modelName} failed:`, error.message);
            lastError = error;
            // Try next model
        }
    }

    // ❌ If all models fail
    console.error("All models failed. Last error:", lastError);
    alert("Failed to generate interview questions. Please try again later.");

    return {
        questions: [
            {
                id: 1,
                question: "Error generating questions",
                answer: `Failed to generate questions. Error: ${lastError?.message || "Unknown error"}`,
            },
        ],
    };
}

export default generateInterviewQuestions;
