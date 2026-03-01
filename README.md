# VibeCart AI 🛒✨

> **Mistral Worldwide Hackathon 2026** — Online Edition

**Transform any raw product image into a complete viral brand identity in seconds.**

VibeCart AI chains 3 AI models to extract a product's aesthetic DNA, generate multi-platform marketing copy, self-refine it for virality, and voice it with ElevenLabs — all in one seamless pipeline.

## 🎯 What It Does

Drop any product image URL → VibeCart AI gives you:

| Output | Powered By |
|--------|------------|
| Vibe Score (0-100) + Brand Palette | Mistral Pixtral Large (Vision) |
| 5 mood keywords + target demographic | Mistral Pixtral Large (Vision) |
| Amazon title, Instagram caption, Facebook Ad, TikTok hooks | Mistral Large 3 |
| AI-refined viral hooks (self-critique loop) | Mistral Large 3 (2nd call) |
| 30-second TikTok/Reels video script | Mistral Large 3 (3rd call) |
| Professional voiceover of the hooks | ElevenLabs (Rachel voice) |

## 🏗️ Architecture

```
User Input (Image URL)
       │
       ▼
┌─────────────────────────┐
│  Mistral Pixtral Large  │  ← Vision model: extracts brand DNA
│  pixtral-large-latest   │    (vibe score, palette, keywords, demographic)
└────────────┬────────────┘
             │ Structured JSON brand data
             ▼
┌─────────────────────────┐
│  Mistral Large 3        │  ← Copywriter: 6-platform marketing suite
│  mistral-large-latest   │    (Amazon, Instagram, Facebook, TikTok, Brand Name, UVP)
└────────────┬────────────┘
             │ Raw copy
             ▼
┌─────────────────────────┐
│  Mistral Large 3        │  ← Creative Director: self-refines hooks
│  mistral-large-latest   │    (critiques + rewrites for virality)
└────────────┬────────────┘
             │ Refined hooks text
             ▼
┌─────────────────────────┐
│  ElevenLabs TTS         │  ← Voice talent: professional audio output
│  eleven_multilingual_v2 │    (Rachel voice, 0.85 stability)
└─────────────────────────┘
```

## 🚀 Tech Stack

- **Framework:** Next.js 16 (App Router + API Routes)
- **AI — Vision:** Mistral Pixtral Large (`pixtral-large-latest`)
- **AI — Text × 2:** Mistral Large 3 (`mistral-large-latest`)
- **AI — Voice:** ElevenLabs (`eleven_multilingual_v2`, Rachel voice)
- **Styling:** Vanilla CSS with glassmorphism + micro-animations
- **Deployment:** Vercel

## 🏆 Prize Tracks Targeted

- **Best Vibe Usage (Mistral)** — The entire app is built around extracting and selling "vibe"
- **Best Voice Use Case (ElevenLabs)** — Full voice pipeline: refined copy → premium audio output
- **Global Online Winner** — Technical depth (3-model chain), real business value, polished UI

## 💡 Why This Wins

1. **Real problem, real users** — Every dropshipper and e-commerce seller struggles with product copy. This eliminates hours of work in seconds.
2. **Technical depth** — 3 chained Mistral model calls + ElevenLabs + structured JSON extraction
3. **Self-improving output** — The creative director loop means the output is always better than a single pass
4. **Polished demo** — Glassmorphism UI, animated vibe score bar, color palette chips, working voice playback

## 🛠️ Setup

```bash
git clone https://github.com/zsoubai-eng/vibecart-ai
cd vibecart-ai
npm install

# Create .env.local
echo "MISTRAL_API_KEY=your_key" > .env.local
echo "ELEVENLABS_API_KEY=your_key" >> .env.local

npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 🎬 How to Test

1. Paste any product image URL (AliExpress, manufacturer, Pinterest, etc.)
2. Click "Generate Full Brand Suite"
3. Wait ~15s for the 3-model pipeline to complete
4. Explore the Vibe Score, Brand Palette, 6-platform copy
5. Click **"Play Voiceover"** to hear ElevenLabs voice the hooks

## 📁 Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── analyze/route.ts   # Pixtral + Mistral Large × 2
│   │   ├── voice/route.ts     # ElevenLabs TTS
│   │   └── script/route.ts   # Video script generator
│   ├── globals.css            # Full premium CSS system
│   ├── layout.tsx
│   └── page.tsx              # Main UI with all components
```

## 👤 Team

Built solo during the **Mistral Worldwide Hackathon 2026** — Online Edition.

---

*Powered by [Mistral AI](https://mistral.ai) · [ElevenLabs](https://elevenlabs.io)*
