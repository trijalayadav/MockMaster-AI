// Save this file as: utils/GroqAIModel.js
// Install dependency: npm install groq-sdk

import Groq from "groq-sdk";

const apiKey = process.env.GROQ_API_KEY;

let groq = null;
let chatSession = null;

// Groq Models - LLaMA 3.3 70B is recommended for best quality
const GROQ_MODELS = {
    llama3_70b: "llama-3.3-70b-versatile",      // Recommended - Best balance
    llama3_8b: "llama-3.1-8b-instant",          // Fastest
    mixtral: "mixtral-8x7b-32768",              // Alternative option
};

const SELECTED_MODEL = GROQ_MODELS.llama3_70b;

if (apiKey) {
    try {
        groq = new Groq({
            apiKey: apiKey,
            dangerouslyAllowBrowser: true // Required for Next.js client-side
        });

        chatSession = {
            conversationHistory: [],

            async sendMessage(prompt) {
                try {
                    this.conversationHistory.push({
                        role: "user",
                        content: prompt
                    });

                    const completion = await groq.chat.completions.create({
                        messages: this.conversationHistory,
                        model: SELECTED_MODEL,
                        temperature: 0.7,
                        max_tokens: 2048,
                        top_p: 0.95,
                    });

                    const assistantMessage = completion.choices[0]?.message?.content || "";

                    this.conversationHistory.push({
                        role: "assistant",
                        content: assistantMessage
                    });

                    // Return in Gemini-compatible format
                    return {
                        response: {
                            text: () => assistantMessage
                        }
                    };
                } catch (error) {
                    console.error("Groq API Error:", error);
                    throw error;
                }
            },

            clearHistory() {
                this.conversationHistory = [];
            }
        };

        console.log("✓ Groq AI chat session initialized with", SELECTED_MODEL);
    } catch (error) {
        console.error("Failed to initialize Groq:", error);
    }
} else {
    console.warn("⚠️ GROQ_API_KEY not found - AI features will be disabled");
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
    console.log("Model:", SELECTED_MODEL);
    console.log("==================");

    if (!apiKey) {
        console.error("ERROR: GROQ_API_KEY is not set in environment variables");
        alert("API Key is missing! Please check your .env.local file");
        return {
            questions: [
                {
                    id: 1,
                    question: "API Key Missing",
                    answer: "Please set GROQ_API_KEY in your .env.local file",
                },
            ],
        };
    }

    if (!groq) {
        groq = new Groq({
            apiKey: apiKey,
            dangerouslyAllowBrowser: true
        });
    }

    try {
        console.log(`Using Groq model: ${SELECTED_MODEL}`);

        const prompt = `You are an expert technical interviewer. Generate ${questionCount} interview questions and answers for the following job position:

Job Role: ${formData.role}
Job Description/Tech Stack: ${formData.description}
Years of Experience: ${formData.experience}

CRITICAL INSTRUCTIONS:
- Respond ONLY with valid JSON
- No markdown formatting (no \`\`\`json tags)
- No code blocks
- No explanations before or after the JSON
- Start directly with { and end with }

Required JSON format:
{
  "questions": [
    {
      "id": 1,
      "question": "Question text here",
      "answer": "Sample answer here"
    }
  ]
}

Generate exactly ${questionCount} questions appropriate for someone with ${formData.experience} years of experience. Make questions challenging and relevant to the tech stack mentioned.`;

        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "You are a JSON-only response bot. Always return valid JSON with no markdown formatting."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            model: SELECTED_MODEL,
            temperature: 0.7,
            max_tokens: 2048,
            response_format: { type: "json_object" } // Force JSON output
        });

        const textResponse = completion.choices[0]?.message?.content || "{}";
        console.log("Raw Groq Response:", textResponse);

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

        console.log("✓ Successfully generated interview questions with Groq");
        console.log("Generated Interview Questions and Answers:");
        console.log(JSON.stringify(interviewData, null, 2));

        return interviewData;
    } catch (error) {
        console.error("Groq generation failed:", error);

        // Provide helpful error messages
        if (error.message?.includes("API key")) {
            alert("Invalid API key. Please check your GROQ_API_KEY in .env.local");
        } else if (error.message?.includes("rate limit")) {
            alert("Rate limit exceeded. Please wait a moment and try again.");
        } else {
            alert("Failed to generate interview questions. Please try again later.");
        }

        return {
            questions: [
                {
                    id: 1,
                    question: "Error generating questions",
                    answer: `Failed to generate questions. Error: ${error?.message || "Unknown error"}`,
                },
            ],
        };
    }
}

export default generateInterviewQuestions;