import { NextResponse } from 'next/server';

// ElevenLabs text-to-speech API
// Voice: "Rachel" - warm, professional female voice (voice_id: 21m00Tcm4TlvDq8ikWAM)
// Or "Adam" - deep, authoritative male voice (voice_id: pNInz6obpgDQGcFmaJgB)
const VOICE_ID = '21m00Tcm4TlvDq8ikWAM'; // Rachel - premium, warm voice

export async function POST(request: Request) {
    try {
        const { text } = await request.json();

        if (!text) {
            return NextResponse.json({ error: 'Text is required' }, { status: 400 });
        }

        const apiKey = process.env.ELEVENLABS_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: 'ElevenLabs API key not configured' }, { status: 500 });
        }

        // Call ElevenLabs TTS API
        const response = await fetch(
            `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
            {
                method: 'POST',
                headers: {
                    'Accept': 'audio/mpeg',
                    'Content-Type': 'application/json',
                    'xi-api-key': apiKey,
                },
                body: JSON.stringify({
                    text,
                    model_id: 'eleven_multilingual_v2',
                    voice_settings: {
                        stability: 0.4,
                        similarity_boost: 0.85,
                        style: 0.6,
                        use_speaker_boost: true,
                    },
                }),
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error('ElevenLabs error:', errorText);
            return NextResponse.json(
                { error: `ElevenLabs API error: ${response.status} - ${errorText}` },
                { status: response.status }
            );
        }

        // Stream audio back to client
        const audioBuffer = await response.arrayBuffer();
        const base64Audio = Buffer.from(audioBuffer).toString('base64');

        return NextResponse.json({
            success: true,
            audio: base64Audio,
            mimeType: 'audio/mpeg',
        });

    } catch (error) {
        console.error('Voice generation error:', error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
