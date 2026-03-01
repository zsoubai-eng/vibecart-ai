import { NextResponse } from 'next/server';

// Voxtral transcription via Mistral API
// Uses voxtral-mini for fast, accurate audio transcription
export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const audioFile = formData.get('audio') as File;

        if (!audioFile) {
            return NextResponse.json({ error: 'Audio file is required' }, { status: 400 });
        }

        const apiKeys = [
            process.env.MISTRAL_API_KEY_HACKATHON,
            process.env.MISTRAL_API_KEY,
        ].filter(Boolean) as string[];

        let lastError: Error | null = null;

        for (const apiKey of apiKeys) {
            try {
                // Convert File to ArrayBuffer then to base64
                const arrayBuffer = await audioFile.arrayBuffer();
                const base64Audio = Buffer.from(arrayBuffer).toString('base64');
                const mimeType = audioFile.type || 'audio/webm';

                // Call Mistral Voxtral API for transcription
                const response = await fetch('https://api.mistral.ai/v1/audio/transcriptions', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${apiKey}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        model: 'voxtral-mini-2507',
                        audio: {
                            type: 'base64',
                            data: base64Audio,
                            media_type: mimeType,
                        },
                    }),
                });

                if (!response.ok) {
                    const errText = await response.text();
                    throw new Error(`Voxtral API error ${response.status}: ${errText}`);
                }

                const data = await response.json();
                const transcript = data.text || data.transcript || '';

                return NextResponse.json({ success: true, transcript });
            } catch (err) {
                console.warn('Voxtral key failed:', String(err).slice(0, 100));
                lastError = err as Error;
            }
        }

        return NextResponse.json({ error: String(lastError) }, { status: 500 });
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
