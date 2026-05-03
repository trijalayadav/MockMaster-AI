import Groq from "groq-sdk";

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req) {
    try {
        const formData = await req.formData();
        const file = formData.get('file');

        if (!file) {
            return Response.json({ error: 'No file uploaded' }, { status: 400 });
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // ✅ Detect mime type and use correct extension
        const mimeType = file.type || 'audio/webm';
        const extension = mimeType.includes('mp4') ? 'mp4'
                        : mimeType.includes('ogg') ? 'ogg'
                        : 'webm';

        const audioFile = new File([buffer], `answer.${extension}`, { type: mimeType });

        const transcription = await client.audio.transcriptions.create({
            file: audioFile,
            model: 'whisper-large-v3-turbo', // ✅ more reliable than whisper-large-v3
            language: 'en',
        });

        return Response.json({ text: transcription.text });

    } catch (err) {
        console.error('Transcription route error:', err);
        return Response.json(
            { error: err.message || 'Transcription failed' },
            { status: 500 }
        );
    }
}