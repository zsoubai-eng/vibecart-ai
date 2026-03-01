import { Mistral } from '@mistralai/mistralai';
import { NextResponse } from 'next/server';

async function tryWithKey(apiKey: string, imageUrl: string) {
    const client = new Mistral({ apiKey });

    // ── STEP 1: Pixtral Vision — Extract full brand DNA ──
    const vibeResponse = await client.chat.complete({
        model: 'pixtral-large-latest',
        messages: [
            {
                role: 'user',
                content: [
                    {
                        type: 'text',
                        text: `You are an elite brand strategist and visual psychologist.

Analyze this product image in extreme detail and return a JSON object with this exact structure:
{
  "aesthetic": "One sentence describing the core aesthetic",
  "mood": "One word mood (e.g. Cozy, Fierce, Luxurious, Playful, Minimalist)",
  "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
  "demographic": "One sentence: age, lifestyle, core values of target buyer",
  "emotion": "The primary emotion this product evokes in 3 words",
  "vibeScore": 85,
  "palette": ["#HEX1", "#HEX2", "#HEX3", "#HEX4"],
  "category": "Product category in 2 words"
}

The vibeScore (0-100) measures raw commercial marketability based on visual appeal, trend alignment, and emotional resonance.
The palette should be 4 hex colors that visually complement this product's aesthetic for branding.
Return ONLY the JSON, no other text.`,
                    },
                    { type: 'image_url', imageUrl: { url: imageUrl } } as { type: 'image_url'; imageUrl: { url: string } },
                ],
            },
        ],
    });

    let vibeData: {
        aesthetic: string;
        mood: string;
        keywords: string[];
        demographic: string;
        emotion: string;
        vibeScore: number;
        palette: string[];
        category: string;
    };

    try {
        const raw = (vibeResponse.choices?.[0]?.message?.content as string) || '{}';
        const jsonMatch = raw.match(/\{[\s\S]*\}/);
        vibeData = JSON.parse(jsonMatch ? jsonMatch[0] : raw);
    } catch {
        vibeData = {
            aesthetic: 'Modern and versatile',
            mood: 'Premium',
            keywords: ['Stylish', 'Quality', 'Functional', 'Modern', 'Elegant'],
            demographic: 'Style-conscious adults aged 25-40 who value quality',
            emotion: 'Inspired, confident, elevated',
            vibeScore: 75,
            palette: ['#1a1a2e', '#16213e', '#8b5cf6', '#e2d4f0'],
            category: 'Lifestyle Product',
        };
    }

    // ── STEP 2: Mistral Large — Multi-platform copy suite ──
    const copyResponse = await client.chat.complete({
        model: 'mistral-large-latest',
        messages: [
            {
                role: 'system',
                content: `You are an elite viral copywriter who has launched products for Apple, Glossier, and Supreme.
You understand that great copy sells a feeling, not a feature.
Your output is always structured, punchy, and conversion-focused.`,
            },
            {
                role: 'user',
                content: `Product Brand DNA:
- Aesthetic: ${vibeData.aesthetic}
- Mood: ${vibeData.mood}
- Keywords: ${vibeData.keywords.join(', ')}  
- Target Buyer: ${vibeData.demographic}
- Emotion evoked: ${vibeData.emotion}
- Category: ${vibeData.category}

Generate complete multi-platform marketing copy in this exact markdown format:

### 🏷️ Brand Name
One premium brand name for this product (2-4 words, feels like a real brand)

### 📦 Amazon Title
A high-converting Amazon product title (max 200 chars, keyword-rich)

### 📖 Vibe Description  
Exactly 3 sentences. Each sells the lifestyle, not the product. Make the reader feel something.

### 🎣 TikTok / Reels Hooks
Three ultra-punchy hooks (max 8 words each, scroll-stopping, emotional):
1. 
2.
3.

### 📸 Instagram Caption
One caption with emojis (2-3 lines + 5 relevant hashtags)

### 🎯 Facebook Ad Headline
One headline (max 40 chars) + one description line (max 125 chars)

### 💡 Unique Selling Point
One sentence that captures why this product is different from everything else.`,
            },
        ],
    });

    const rawCopy = copyResponse.choices?.[0]?.message?.content as string;

    // ── STEP 3: Self-refine — Mistral critiques and improves the copy ──
    const refinedResponse = await client.chat.complete({
        model: 'mistral-large-latest',
        messages: [
            {
                role: 'system',
                content: `You are a ruthless creative director at a top-tier ad agency. 
Your job is to take good copy and make it EXCEPTIONAL.
Be specific about improvements. Then rewrite the TikTok hooks only (the most important part) to be 30% more viral.`,
            },
            {
                role: 'user',
                content: `Here is marketing copy for a ${vibeData.mood.toLowerCase()} ${vibeData.category}:

${rawCopy}

Critique the 3 TikTok hooks only. What makes them stronger or weaker? 
Then rewrite ALL 3 hooks to be more surprising, emotional, and scroll-stopping.
Format your response as:
**Upgraded Hooks:**
1. [hook]
2. [hook]
3. [hook]`,
            },
        ],
    });

    const refinedCopy = refinedResponse.choices?.[0]?.message?.content as string;

    // Extract upgraded hooks from refinement
    const hookMatch = refinedCopy.match(/\*\*Upgraded Hooks:\*\*[\s\S]*?(?=\n\n|$)/);
    const upgradedHooks = hookMatch ? hookMatch[0] : '';

    return {
        vibeData,
        marketingCopy: rawCopy,
        upgradedHooks,
        voiceText: extractHooksForVoice(rawCopy, upgradedHooks),
    };
}

function extractHooksForVoice(copy: string, refined: string): string {
    // Use upgraded hooks for voice if available, otherwise extract from original
    if (refined) {
        const lines = refined.split('\n').filter(l => /^\d\./.test(l.trim()));
        if (lines.length >= 2) {
            return lines.map(l => l.replace(/^\d\.\s*/, '').trim()).join('. ');
        }
    }
    const hookSection = copy.match(/TikTok[^`]*?(\d\.[^\n]+\n\d\.[^\n]+\n\d\.[^\n]+)/i);
    return hookSection
        ? hookSection[1].replace(/^\d\.\s*/gm, '').trim()
        : copy.slice(0, 300);
}

export async function POST(request: Request) {
    try {
        const { imageUrl } = await request.json();
        if (!imageUrl) {
            return NextResponse.json({ error: 'Image URL is required' }, { status: 400 });
        }

        const keys = [
            process.env.MISTRAL_API_KEY_HACKATHON,
            process.env.MISTRAL_API_KEY,
        ].filter(Boolean) as string[];

        let lastError: Error | null = null;

        for (let i = 0; i < keys.length; i++) {
            try {
                const result = await tryWithKey(keys[i], imageUrl);
                console.log(`✅ Success with key ${i === 0 ? 'hackathon' : 'personal'}`);
                return NextResponse.json({ success: true, ...result });
            } catch (err) {
                console.warn(`⚠️ Key ${i} failed:`, String(err).slice(0, 120));
                lastError = err as Error;
            }
        }

        return NextResponse.json(
            { error: `All API keys failed. ${lastError?.message}` },
            { status: 500 }
        );
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
