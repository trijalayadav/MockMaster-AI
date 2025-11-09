// Save this file as: utils/GeminiAIModel.js
// Install dependency: npm install @google/generative-ai

import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini AI
const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

let genAI = null;
let chatSession = null;

if (apiKey) {
    try {
        genAI = new GoogleGenerativeAI(apiKey);

        // Use gemini-2.5-flash - the current stable model (Gemini 1.5 models are retired)
        const chatModel = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
        });

        chatSession = chatModel.startChat({
            generationConfig: {
                temperature: 0.9,
                topP: 1,
                topK: 1,
                maxOutputTokens: 2048,
            },
            history: [],
        });

        console.log("✓ Gemini AI chat session initialized successfully with gemini-2.5-flash");
    } catch (error) {
        console.error("Failed to initialize Gemini AI chat session:", error);
    }
} else {
    console.warn("⚠️ NEXT_PUBLIC_GEMINI_API_KEY not found - AI features will be disabled");
}

// Export chat session for interview feedback
export { chatSession };

// Generate interview questions function
async function generateInterviewQuestions(formData) {
    const questionCount = process.env.NEXT_PUBLIC_INTERVIEW_QUESTION_COUNT || 5;

    console.log("=== DEBUG INFO ===");
    console.log("API Key exists:", !!apiKey);
    console.log("API Key length:", apiKey?.length || 0);
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

    if (!genAI) {
        genAI = new GoogleGenerativeAI(apiKey);
    }

    // Updated model list - Gemini 1.5 models are retired, use Gemini 2.5
    const modelNames = [
        "gemini-2.5-flash",      // Primary - fastest and most efficient
        "gemini-2.5-pro",        // More powerful for complex tasks
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

            // Clean and prepare text for JSON parsing
            let cleanedResponse = textResponse
                .replace(/```json/gi, "")
                .replace(/```/g, "")
                .replace(/[\u201C\u201D]/g, '"')
                .trim();

            // Try to extract JSON safely
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

    // If all models fail
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