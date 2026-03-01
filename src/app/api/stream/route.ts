import { Mistral } from '@mistralai/mistralai';
import { NextRequest } from 'next/server';

// ── SSE Helper ────────────────────────────────────────────────────────────────
function sseEvent(data: object): Uint8Array {
    return new TextEncoder().encode(`data: ${JSON.stringify(data)}\n\n`);
}

// ── Types ─────────────────────────────────────────────────────────────────────
type VibeData = {
    aesthetic: string; mood: string; keywords: string[];
    demographic: string; emotion: string; vibeScore: number;
    palette: string[]; category: string;
};

type ProfitData = {
    suggestedPrice: number;
    estimatedCost: number;
    estimatedMargin: number;
    dropshipScore: number;
    dropshipVerdict: string;
    pricingRationale: string;
    platformFit: string[];
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

// ── Power-Up 1: 3-Style Hook Prompt (from X_CONTENT_MACHINE Stark Templates) ─
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

### 🎣 TikTok / Reels Hooks — 3 STYLES
Generate 3 hooks per style (max 8 words each). Emotionally charged, scroll-stopping:

**📰 Informative Style** (educate + intrigue):
1. 
2.
3.

**🔥 Controversial Style** (pattern interrupt + opinion):
1. 
2.
3.

**💎 Value-Add Style** (clear benefit + desire):
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

// ── Power-Up 2: Stark Analyst Refine Prompt (from X_CONTENT_MACHINE) ─────────
function refinePrompt(vibe: VibeData, fullCopy: string): string {
    return `You are the Stark Analyst — a blend of Elon Musk's first principles, Steve Jobs' aesthetic obsession, and McKinsey's data precision.

You just generated this brand copy for a ${vibe.mood.toLowerCase()} ${vibe.category}:

${fullCopy}

YOUR MISSION: Pick the single BEST hook from each of the 3 styles (Informative, Controversial, Value-Add).
Then rewrite all 3 chosen hooks to be 40% more viral — more surprising, more emotionally resonant, more scroll-stopping.

Rules:
- Max 8 words per hook
- Use pattern interrupts and curiosity gaps
- Hit the emotion of "${vibe.emotion}"
- Think: what would stop someone cold while doom-scrolling at 2AM?

Format EXACTLY as:

**Stark Critique:**
[One sentence per style: what was strong, what failed]

**🔥 Final Upgraded Hooks:**
📰 Informative: [rewritten hook]
🔥 Controversial: [rewritten hook]
💎 Value-Add: [rewritten hook]

**💡 Stark Verdict:**
[One bold sentence: what is this product's single killer angle?]`;
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
                // STAGE 1 — Vision: Pixtral (image) OR Mistral (voice text)
                // ══════════════════════════════════════════════════════════════
                let vibeData: VibeData;

                if (imageUrl) {
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
                    } catch { vibeData = VIBE_FALLBACK; }
                } else {
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
                // STAGE 2 — Mistral Large: 3-Style Copy Suite (STREAMING)
                // ══════════════════════════════════════════════════════════════
                push({ stage: 'copy', status: 'running', message: 'Mistral Large generating 3-style hook suite + 6 platforms…' });

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
                // STAGE 3 — Stark Analyst Refinement (STREAMING)
                // ══════════════════════════════════════════════════════════════
                push({ stage: 'refine', status: 'running', message: 'Stark Analyst upgrading hooks — First Principles mode…' });

                let refinedCopy = '';
                let refineTokens = 0;

                const refineStream = client.chat.stream({
                    model: 'mistral-large-latest',
                    messages: [
                        {
                            role: 'system',
                            content: `You are the Stark Analyst — a ruthless blend of Elon Musk's first principles thinking, Steve Jobs' premium aesthetics, and McKinsey's data precision. Your standard: if it doesn't stop the scroll in 0.3 seconds, it fails. No fluff. All impact.`,
                        },
                        { role: 'user', content: refinePrompt(vibeData, fullCopy) },
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

                // ══════════════════════════════════════════════════════════════
                // STAGE 4 — Dropship Profit Calculator (Power-Up from dropship-intelligence)
                // ══════════════════════════════════════════════════════════════
                push({ stage: 'profit', status: 'running', message: 'CFO Formula calculating dropship viability & pricing…' });

                let profitData: ProfitData = {
                    suggestedPrice: 0, estimatedCost: 0, estimatedMargin: 0,
                    dropshipScore: 0, dropshipVerdict: '', pricingRationale: '', platformFit: [],
                };

                try {
                    const profitResponse = await client.chat.complete({
                        model: 'mistral-large-latest',
                        messages: [{
                            role: 'user',
                            content: `You are a CFO and e-commerce dropshipping expert. Analyze this product for dropshipping viability.

Product DNA:
- Category: ${vibeData.category}
- Keywords: ${vibeData.keywords.join(', ')}
- Aesthetic: ${vibeData.aesthetic}
- Target Buyer: ${vibeData.demographic}
- Vibe Score: ${vibeData.vibeScore}/100
- Mood: ${vibeData.mood}

Apply the CFO Formula: SuggestedRetailPrice = (EstimatedAliExpressCost × 3.5) rounded to nearest .99
Dropship Score (0-10): based on margin potential, impulse buy factor, shipping weight, competition level, and vibe score.

Return ONLY valid JSON:
{
  "suggestedPrice": 49.99,
  "estimatedCost": 12.50,
  "estimatedMargin": 67,
  "dropshipScore": 8.2,
  "dropshipVerdict": "🔥 High Potential" | "✅ Solid Pick" | "⚠️ Competitive Market" | "❌ Low Margin",
  "pricingRationale": "One sentence explaining the price point",
  "platformFit": ["TikTok Shop", "Instagram Shopping", "Amazon FBA"]
}

dropshipVerdict rules: score ≥ 8 = "🔥 High Potential", score ≥ 6 = "✅ Solid Pick", score ≥ 4 = "⚠️ Competitive Market", else "❌ Low Margin"
platformFit: 2-3 best sales channels for this product. Return ONLY JSON.`,
                        }],
                    });

                    const raw = profitResponse.choices?.[0]?.message?.content as string;
                    profitData = JSON.parse(raw.replace(/```json|```/g, '').trim());
                } catch {
                    // Fallback profit data
                    const basePrice = Math.round(vibeData.vibeScore * 0.8 + 20);
                    profitData = {
                        suggestedPrice: basePrice - 0.01,
                        estimatedCost: Math.round(basePrice / 3.5 * 100) / 100,
                        estimatedMargin: 65,
                        dropshipScore: Math.round(vibeData.vibeScore / 12),
                        dropshipVerdict: vibeData.vibeScore >= 80 ? '🔥 High Potential' : '✅ Solid Pick',
                        pricingRationale: `Priced for ${vibeData.demographic.split(' ').slice(0, 4).join(' ')} with strong impulse-buy potential.`,
                        platformFit: ['TikTok Shop', 'Instagram Shopping', 'Amazon FBA'],
                    };
                }

                push({ stage: 'profit', status: 'done', data: profitData });

                // ── Extract voice text ────────────────────────────────────────
                const hookSection = refinedCopy.match(/🔥 Final Upgraded Hooks[\s\S]*?(?=\n\n\*\*|$)/);
                const upgradedHooks = hookSection ? hookSection[0] : refinedCopy.slice(-600);
                const hookLines = upgradedHooks.split('\n').filter(l => /[📰🔥💎]/.test(l));
                const voiceText = hookLines.length >= 2
                    ? hookLines.map(l => l.replace(/^[📰🔥💎]\s*\w+:\s*/, '').replace(/\[|\]/g, '').trim()).join('. ')
                    : fullCopy.slice(0, 300);

                // ══════════════════════════════════════════════════════════════
                // COMPLETE
                // ══════════════════════════════════════════════════════════════
                push({
                    stage: 'complete',
                    totalTokens: copyTokens + refineTokens,
                    data: { vibeData, marketingCopy: fullCopy, upgradedHooks, voiceText, profitData },
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
