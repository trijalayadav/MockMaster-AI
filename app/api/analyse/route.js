import Groq from "groq-sdk";

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req) {
    try {
        const { answersText } = await req.json();

        if (!answersText) {
            return Response.json({ error: 'No answers provided' }, { status: 400 });
        }

        const response = await client.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            max_tokens: 1500,
            messages: [
                {
                    role: "system",
                    content: `You are a senior technical interviewer giving holistic feedback after a full mock interview session.
Respond ONLY with a valid JSON object — no markdown, no backticks, no preamble.
Schema:
{
  "overall_score": <1-10>,
  "communication_score": <1-10>,
  "technical_depth_score": <1-10>,
  "confidence_score": <1-10>,
  "overall_summary": "<3-4 sentence holistic assessment>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "improvements": ["<area 1>", "<area 2>", "<area 3>"],
  "per_question": [
    { "index": 0, "score": <1-10>, "highlight": "<one sentence key takeaway>" }
  ],
  "hire_recommendation": "<Strong Yes | Yes | Maybe | No>",
  "hire_reasoning": "<1-2 sentences>"
}`
                },
                {
                    role: "user",
                    content: `Here are all the answers from this mock interview session. Provide holistic feedback:\n\n${answersText}`
                }
            ],
        });

        const raw = response.choices[0].message.content || '';
        const clean = raw.replace(/```json|```/g, '').trim();

        let parsed;
        try {
            parsed = JSON.parse(clean);
        } catch (parseErr) {
            console.error('JSON parse failed. Raw response:', raw);
            return Response.json({ error: 'AI returned invalid JSON' }, { status: 500 });
        }

        return Response.json({ result: parsed });

    } catch (err) {
        console.error('Analyse route error:', err);
        return Response.json(
            { error: err.message || 'Analysis failed' },
            { status: 500 }
        );
    }
}