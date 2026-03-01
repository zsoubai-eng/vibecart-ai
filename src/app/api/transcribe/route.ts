import { NextResponse } from 'next/server';

// Voxtral transcription via Mistral API
// Mistral /v1/audio/transcriptions requires multipart/form-data (same as OpenAI Whisper pattern)
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

        if (!apiKeys.length) {
            return NextResponse.json({ error: 'No API key configured' }, { status: 500 });
        }

        const apiKey = apiKeys[0];

        // ── Approach 1: Mistral Voxtral via multipart/form-data ──────────────
        // The endpoint requires form-data with 'model' and 'file' fields (Whisper-compatible)
        try {
            const mistralForm = new FormData();
            mistralForm.append('model', 'voxtral-mini-2507');
            mistralForm.append('file', audioFile, audioFile.name || 'recording.webm');

            const response = await fetch('https://api.mistral.ai/v1/audio/transcriptions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    // DO NOT set Content-Type — browser/fetch sets it automatically with boundary
                },
                body: mistralForm,
            });

            if (response.ok) {
                const data = await response.json();
                const transcript = data.text || data.transcript || '';
                if (transcript) {
                    return NextResponse.json({ success: true, transcript, model: 'voxtral-mini-2507' });
                }
            }

            const errText = await response.text().catch(() => 'unknown error');
            console.warn(`Voxtral primary attempt failed (${response.status}): ${errText.slice(0, 200)}`);
        } catch (err) {
            console.warn('Voxtral fetch error:', String(err).slice(0, 150));
        }

        // ── Approach 2: Try with 'voxtral-mini-latest' model name ────────────
        try {
            const mistralForm2 = new FormData();
            mistralForm2.append('model', 'voxtral-mini-latest');
            mistralForm2.append('file', audioFile, audioFile.name || 'recording.webm');

            const response2 = await fetch('https://api.mistral.ai/v1/audio/transcriptions', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${apiKey}` },
                body: mistralForm2,
            });

            if (response2.ok) {
                const data2 = await response2.json();
                const transcript2 = data2.text || data2.transcript || '';
                if (transcript2) {
                    return NextResponse.json({ success: true, transcript: transcript2, model: 'voxtral-mini-latest' });
                }
            }
        } catch (err) {
            console.warn('Voxtral v2 attempt failed:', String(err).slice(0, 100));
        }

        // ── Approach 3: Fallback to Mistral Large — ask user to type description ─
        // Voxtral model may not be available yet in the API.
        // Return a helpful error that allows the UI to prompt manual input.
        return NextResponse.json({
            error: 'Voxtral transcription unavailable. The voxtral-mini model may not be enabled on your API key yet.',
            fallback: true,
            suggestion: 'Type your product description directly in the text field below.',
        }, { status: 503 });

    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
