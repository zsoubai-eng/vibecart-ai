import { Mistral } from '@mistralai/mistralai';
import { NextRequest } from 'next/server';

// ── SSE Helpers ───────────────────────────────────────────────────────────────
function sseEvent(data: object): Uint8Array {
    return new TextEncoder().encode(`data: ${JSON.stringify(data)}\n\n`);
}

// ── VibeData type shared between both pipeline paths ──────────────────────────
type VibeData = {
    aesthetic: string; mood: string; keywords: string[];
    demographic: string; emotion: string; vibeScore: number;
    palette: string[]; category: string;
};

const VIBE_FALLBACK: VibeData = {
    aesthetic: 'Modern and versatile design', mood: 'Premium',
    keywords: ['Stylish', 'Quality', 'Functional', 'Modern', 'Elegant'],
    demographic: 'Style-conscious adults aged 25–40 who value craftsmanship',
    emotion: 'Inspired, confident, elevated',
    vibeScore: 78,
    palette: ['#1a1a2e', '#2d2d44', '#8b5cf6', '#e2d4f0'],
    category: 'Lifestyle Product',
};

// ── Copy prompt ───────────────────────────────────────────────────────────────
function copyPrompt(vibe: VibeData): string {
    return `Product Brand DNA:
- Aesthetic: ${vibe.aesthetic}
- Mood: ${vibe.mood}
- Keywords: ${vibe.keywords.join(', ')}
- Target Buyer: ${vibe.demographic}
- Emotion evoked: ${vibe.emotion}
- Category: ${vibe.category}

Generate complete multi-platform marketing copy in this EXACT markdown format:

### 🏷️ Brand Name
One premium brand name (2-4 words, feels like a real luxury/lifestyle brand)

### 📦 Amazon Title
High-converting title (max 200 chars, keyword-rich, structured for search)

### 📖 Vibe Description
Exactly 3 sentences. Each sells the lifestyle, not the product. Make the reader feel something deep.

### 🎣 TikTok / Reels Hooks
Three ultra-punchy hooks (max 8 words each, scroll-stopping, emotionally charged):
1. 
2.
3.

### 📸 Instagram Caption
One caption with emojis (2-3 lines + 5 relevant hashtags separated by spaces)

### 🎯 Facebook Ad Headline
Headline: [max 40 chars]
Description: [max 125 chars — urgency + benefit]

### 💡 Unique Selling Point
One sentence. Why this product is irreplaceable.`;
}

// ── STREAMING PIPELINE ROUTE ──────────────────────────────────────────────────
export async function POST(request: NextRequest) {
    const { imageUrl, productDescription } = await request.json();

    if (!imageUrl && !productDescription) {
        return new Response(
            `data: ${JSON.stringify({ stage: 'error', error: 'Image URL or product description is required' })}\n\n`,
            { status: 400, headers: { 'Content-Type': 'text/event-stream' } }
        );
    }

    const readableStream = new ReadableStream({
        async start(controller) {
            const push = (data: object) => {
                try { controller.enqueue(sseEvent(data)); } catch { /* stream closed */ }
            };

            try {
                // ── API Key ──────────────────────────────────────────────────
                const keys = [
                    process.env.MISTRAL_API_KEY_HACKATHON,
                    process.env.MISTRAL_API_KEY,
                ].filter(Boolean) as string[];

                if (!keys.length) throw new Error('No API key configured. Set MISTRAL_API_KEY in .env.local');
                const client = new Mistral({ apiKey: keys[0] });

                // ══════════════════════════════════════════════════════════════
                // STAGE 1 — Vision: Pixtral (image URL) OR Mistral (voice text)
                // ══════════════════════════════════════════════════════════════
                let vibeData: VibeData;

                if (imageUrl) {
                    // ── Image mode: Pixtral Large ────────────────────────────
                    push({ stage: 'vision', status: 'running', message: 'Pixtral Large reading visual DNA…' });

                    const vibeResponse = await client.chat.complete({
                        model: 'pixtral-large-latest',
                        messages: [{
                            role: 'user',
                            content: [
                                {
                                    type: 'text',
                                    text: `You are an elite brand strategist and visual psychologist.
Analyze this product image in extreme detail. Return ONLY a valid JSON object:
{"aesthetic":"...","mood":"...","keywords":["k1","k2","k3","k4","k5"],"demographic":"...","emotion":"...","vibeScore":88,"palette":["#HEX1","#HEX2","#HEX3","#HEX4"],"category":"..."}
vibeScore (0-100): commercial marketability. palette: 4 real hex codes. Return ONLY JSON.`,
                                },
                                {
                                    type: 'image_url',
                                    imageUrl: { url: imageUrl },
                                } as { type: 'image_url'; imageUrl: { url: string } },
                            ],
                        }],
                    });

                    try {
                        const raw = vibeResponse.choices?.[0]?.message?.content as string;
                        vibeData = JSON.parse(raw.replace(/```json|```/g, '').trim());
                    } catch {
                        vibeData = VIBE_FALLBACK;
                    }
                } else {
                    // ── Voice mode: Mistral Large from Voxtral transcript ────
                    push({ stage: 'vision', status: 'running', message: 'Mistral Large analyzing voice description…' });

                    const textVibeResponse = await client.chat.complete({
                        model: 'mistral-large-latest',
                        messages: [{
                            role: 'user',
                            content: `You are an elite brand strategist. Based on this product voice description, create brand DNA JSON:

Product: "${productDescription}"

Return ONLY a valid JSON (no markdown):
{"aesthetic":"One sentence visual aesthetic","mood":"Single evocative word","keywords":["k1","k2","k3","k4","k5"],"demographic":"Target buyer one sentence","emotion":"Three comma-separated emotions","vibeScore":82,"palette":["#HEX1","#HEX2","#HEX3","#HEX4"],"category":"Two-word category"}

Infer the palette from the product's implied color story. vibeScore 0-100: commercial appeal.`,
                        }],
                    });

                    try {
                        const raw = textVibeResponse.choices?.[0]?.message?.content as string;
                        vibeData = JSON.parse(raw.replace(/```json|```/g, '').trim());
                    } catch {
                        vibeData = {
                            aesthetic: 'Elegant and refined', mood: 'Luxurious',
                            keywords: ['Premium', 'Exclusive', 'Minimal', 'Refined', 'Timeless'],
                            demographic: 'Discerning adults aged 28–45',
                            emotion: 'Desire, exclusivity, pride',
                            vibeScore: 82,
                            palette: ['#0a0a0a', '#c9a84c', '#f5f5f0', '#2c2c2c'],
                            category: 'Luxury Accessory',
                        };
                    }
                }

                push({ stage: 'vision', status: 'done', data: vibeData });

                // ══════════════════════════════════════════════════════════════
                // STAGE 2 — Mistral Large: 6-Platform Copy (STREAMING)
                // ══════════════════════════════════════════════════════════════
                push({ stage: 'copy', status: 'running', message: 'Mistral Large generating 6-platform copy suite…' });

                let fullCopy = '';
                let copyTokens = 0;

                const copyStream = client.chat.stream({
                    model: 'mistral-large-latest',
                    messages: [
                        {
                            role: 'system',
                            content: `You are an elite viral copywriter who has launched campaigns for Apple, Glossier, and Supreme.
You understand that great copy sells a feeling, not a feature.
Your output is always structured, emotionally resonant, and conversion-focused.
You write with precision — every word earns its place.`,
                        },
                        { role: 'user', content: copyPrompt(vibeData) },
                    ],
                });

                for await (const chunk of await copyStream) {
                    const token = chunk.data.choices?.[0]?.delta?.content as string | undefined;
                    if (token) {
                        fullCopy += token;
                        copyTokens++;
                        push({ stage: 'copy', status: 'streaming', chunk: token, tokens: copyTokens });
                    }
                }

                push({ stage: 'copy', status: 'done', tokens: copyTokens });

                // ══════════════════════════════════════════════════════════════
                // STAGE 3 — Mistral Large: Self-Refinement (STREAMING)
                // ══════════════════════════════════════════════════════════════
                push({ stage: 'refine', status: 'running', message: 'Creative Director self-refining viral hooks…' });

                let refinedCopy = '';
                let refineTokens = 0;

                const refineStream = client.chat.stream({
                    model: 'mistral-large-latest',
                    messages: [
                        {
                            role: 'system',
                            content: `You are a ruthless creative director at the world's most awarded ad agency.
Your standard: if it doesn't stop the scroll in 0.3 seconds, it fails.
You critique precisely and rewrite surgically. No fluff. All impact.`,
                        },
                        {
                            role: 'user',
                            content: `You just wrote this copy for a ${vibeData.mood.toLowerCase()} ${vibeData.category}:

${fullCopy}

Your job: critique the 3 TikTok/Reels hooks. What specifically makes each one strong or weak?
Then rewrite ALL 3 hooks to be 30% more viral — more surprising, more emotional, more scroll-stopping.

Rules: max 8 words per hook. Use pattern interrupts. Create curiosity gaps. Hit the emotion of "${vibeData.emotion}".

Format EXACTLY as:
**Critique:**
[your brutal critique of each hook]

**Upgraded Hooks:**
1. [rewritten hook]
2. [rewritten hook]
3. [rewritten hook]`,
                        },
                    ],
                });

                for await (const chunk of await refineStream) {
                    const token = chunk.data.choices?.[0]?.delta?.content as string | undefined;
                    if (token) {
                        refinedCopy += token;
                        refineTokens++;
                        push({ stage: 'refine', status: 'streaming', chunk: token, tokens: refineTokens });
                    }
                }

                push({ stage: 'refine', status: 'done', tokens: refineTokens });

                // ── Extract voice text ────────────────────────────────────────
                const hookSection = refinedCopy.match(/\*\*Upgraded Hooks:\*\*[\s\S]*?(?=\n\n\*\*|$)/);
                const upgradedHooks = hookSection ? hookSection[0] : refinedCopy.slice(-400);
                const hookLines = upgradedHooks.split('\n').filter(l => /^\d\./.test(l.trim()));
                const voiceText = hookLines.length >= 2
                    ? hookLines.map(l => l.replace(/^\d\.\s*/, '').replace(/\[|\]/g, '').trim()).join('. ')
                    : fullCopy.slice(0, 300);

                // ══════════════════════════════════════════════════════════════
                // COMPLETE
                // ══════════════════════════════════════════════════════════════
                push({
                    stage: 'complete',
                    totalTokens: copyTokens + refineTokens,
                    data: { vibeData, marketingCopy: fullCopy, upgradedHooks, voiceText },
                });

            } catch (error) {
                push({ stage: 'error', error: String(error) });
            } finally {
                try { controller.close(); } catch { /* already closed */ }
            }
        },
    });

    return new Response(readableStream, {
        headers: {
            'Content-Type': 'text/event-stream; charset=utf-8',
            'Cache-Control': 'no-cache, no-transform',
            'Connection': 'keep-alive',
            'X-Accel-Buffering': 'no',
            'X-Content-Type-Options': 'nosniff',
        },
    });
}
