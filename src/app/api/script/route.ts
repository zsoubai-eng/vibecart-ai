import { Mistral } from '@mistralai/mistralai';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { vibeData, marketingCopy } = await request.json();

        const keys = [
            process.env.MISTRAL_API_KEY_HACKATHON,
            process.env.MISTRAL_API_KEY,
        ].filter(Boolean) as string[];

        let lastError: Error | null = null;

        for (const key of keys) {
            try {
                const client = new Mistral({ apiKey: key });

                const response = await client.chat.complete({
                    model: 'mistral-large-latest',
                    messages: [
                        {
                            role: 'system',
                            content: `You are a world-class social media video director who has directed ads for Nike, Apple, and Gymshark.
You write tight, punchy, emotionally resonant video scripts for 15-30 second TikTok and Instagram Reels.
Every second counts. Every word must earn its place.`,
                        },
                        {
                            role: 'user',
                            content: `Create a complete 30-second TikTok/Reels video script for this product:

Brand Vibe: ${vibeData.mood} — ${vibeData.aesthetic}
Target Audience: ${vibeData.demographic}
Emotion: ${vibeData.emotion}
Keywords: ${vibeData.keywords?.join(', ')}

From this copy:
${marketingCopy}

Write a DETAILED shot-by-shot video script in this EXACT format:

## 🎬 30-Second Video Script

**HOOK (0-3s)**
Shot: [describe the exact visual shot]
Text Overlay: [exact text on screen]
Voiceover: [exact words spoken]

**PROBLEM (3-8s)**
Shot: [describe the exact visual shot]
Text Overlay: [exact text on screen]
Voiceover: [exact words spoken]

**REVEAL (8-18s)**
Shot: [describe the exact visual shot — the product hero moment]
Text Overlay: [exact text on screen]
Voiceover: [exact words spoken]

**SOCIAL PROOF (18-24s)**
Shot: [brief lifestyle shot showing the product in use]
Text Overlay: [exact text on screen]
Voiceover: [exact words spoken]

**CTA (24-30s)**
Shot: [product close-up or brand logo]
Text Overlay: [Call to action text]
Voiceover: [exact closing line]

---
**🎵 Music Vibe:** [describe the ideal background music energy]
**📱 Format:** Vertical 9:16
**🎨 Color Grade:** [describe the visual color treatment]`,
                        },
                    ],
                });

                const script = response.choices?.[0]?.message?.content as string;
                return NextResponse.json({ success: true, script });
            } catch (err) {
                lastError = err as Error;
            }
        }

        return NextResponse.json({ error: String(lastError) }, { status: 500 });
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
