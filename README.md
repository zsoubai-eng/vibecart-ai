# VibeCart AI 🛒✨

> **Mistral Worldwide Hackathon 2026** — Online Edition &nbsp;·&nbsp; [**🚀 Live Demo →**](https://vibecart-ai.vercel.app)

<br/>

**Drop a product image. Get a complete viral brand in 30 seconds.**

VibeCart AI chains **4 AI models** to extract a product's aesthetic DNA, stream 3-style viral copy, run a first-principles critique by a Stark Analyst persona, calculate dropship profitability — and voice the whole thing with ElevenLabs.

---

## 🎬 Demo

> **Try it live:** [vibecart-ai.vercel.app](https://vibecart-ai.vercel.app)

**Test image:**
```
https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800
```
Paste it in → click **Generate Full Brand Suite** → watch 4 AI stages fire in real-time.

---

## ⚡ 3 Power-Ups (Hackathon Additions)

### 🔥 Power-Up 1 — Trending Product Scraper
- Scrapes Reddit product subreddits (r/BuyItForLife, r/EDC, r/shutupandtakemymoney) for viral product ideas
- Curated Unsplash fallbacks guarantee it **never fails**
- Click any trending item → **auto-fills** the image URL instantly
- Inspired by `AI_Shorts_Project` Reddit daily content generator

### 💰 Power-Up 2 — Dropship Profit Engine (CFO Formula)
- **Stage 4** of the pipeline — runs after copy generation
- Calculates: Suggested Retail Price · AliExpress Cost · Gross Margin % · Dropship Score /10
- Issues a verdict: 🔥 High Potential / ✅ Solid Pick / ⚠️ Competitive / ❌ Low Margin
- Recommends best sales channels (TikTok Shop, Instagram Shopping, Amazon FBA)
- Inspired by `dropship-intelligence` CFO Formula

### 🎣 Power-Up 3 — 3-Style Hook System (Stark Analyst)
- Every product gets **3 distinct viral hook angles**, not just one:
  - **📰 Informative** — curiosity gap + aspirational benefit
  - **🔥 Controversial** — pattern interrupt + social proof trigger
  - **💎 Value-Add** — clear desire + emotional identity signal
- Stage 3 persona: **Stark Analyst** (Elon Musk + Steve Jobs + McKinsey)
- Inspired by `X_CONTENT_MACHINE` prompt templates

---

## 🏗️ 4-Stage Real-Time Pipeline

```
Input: Image URL  ──or──  Voice Description (Voxtral)
         │
         ▼
┌────────────────────────────────┐
│  STAGE 1 · Pixtral Vision      │  pixtral-large-latest
│  Brand DNA Extraction          │  JSON: vibe score, palette,
│                                │  keywords, mood, demographic
└───────────────┬────────────────┘
                │ Structured brand JSON
                ▼
┌────────────────────────────────┐
│  STAGE 2 · Mistral Large       │  mistral-large-latest (streaming)
│  3-Style Hook Suite            │  📰 Informative · 🔥 Controversial
│  6-Platform Copy               │  💎 Value-Add · Amazon · Instagram
│                                │  Facebook · TikTok · Brand Name · UVP
└───────────────┬────────────────┘
                │ Raw copy streams token-by-token to UI
                ▼
┌────────────────────────────────┐
│  STAGE 3 · Stark Analyst       │  mistral-large-latest (streaming)
│  First Principles Critique     │  Elon Musk + Steve Jobs + McKinsey
│  Hook Refinement               │  Surgically upgrades all 3 hook styles
└───────────────┬────────────────┘
                │ Refined, viral-optimized hooks
                ▼
┌────────────────────────────────┐
│  STAGE 4 · CFO Profit Engine   │  mistral-large-latest
│  Dropship Calculator           │  Retail price · AliExpress cost
│                                │  Margin % · Score /10 · Verdict
└───────────────┬────────────────┘
                │ Full results object
                ▼
┌────────────────────────────────┐
│  ElevenLabs TTS (on-demand)    │  eleven_multilingual_v2
│  Premium Voice Synthesis       │  Rachel voice · 0.85 stability
└────────────────────────────────┘
```

**Everything streams in real-time via Server-Sent Events (SSE).** You watch each stage complete live — no loading spinners, no waiting for the full response.

---

## 🎤 Voice Input — Voxtral

Switch to **Voice Describe** mode, record yourself describing a product, and our `voxtral-mini` transcription converts it to text before feeding the pipeline. Works without an image URL — just speak and go.

---

## 🚀 Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router + API Routes) |
| AI Vision | Mistral **Pixtral Large** (`pixtral-large-latest`) |
| AI Copy × 2 | Mistral **Large 3** (`mistral-large-latest`, streaming) |
| AI Profit | Mistral **Large 3** (`mistral-large-latest`, JSON mode) |
| AI Voice Input | Mistral **Voxtral Mini** (`voxtral-mini-2507`) |
| Voice Output | **ElevenLabs** (`eleven_multilingual_v2`, Rachel) |
| Streaming | Server-Sent Events (SSE) — real-time token streaming |
| Styling | Vanilla CSS — glassmorphism, dark mode, micro-animations |
| Deployment | **Vercel** (Edge-ready) |

---

## 🏆 Prize Tracks Targeted

| Track | Why We Win |
|---|---|
| **Best Use of Mistral Models** | 4 distinct Mistral model calls chained in one SSE pipeline: Pixtral Vision → Large Copy → Large Refine → Large Profit |
| **Best Voice Use Case (ElevenLabs)** | Refined Stark hooks → premium AI voice → plays in one click |
| **Best Voxtral Integration** | Voice-to-product-brief using `voxtral-mini` transcription |
| **Best Overall / Global Winner** | Real e-commerce problem · polished UI · 3 integrated power-ups · production-deployed |

---

## 💡 Why This Wins

1. **Real problem, massive market** — 500M+ e-commerce sellers worldwide struggle with product copy. VibeCart AI eliminates 3-4 hours of copywriting work in 30 seconds.

2. **Technical depth** — 4 chained model calls, SSE streaming architecture, Reddit scraper, ElevenLabs voice, all running on Vercel Edge.

3. **Self-improving output** — The Stark Analyst loop means the AI critiques its own output and surgically rewrites it. The second pass is always better than the first.

4. **Business-ready output** — Not just copy. Profit margins, dropship viability scores, platform recommendations. A product brief + marketing brief + financial brief in one click.

5. **Premium UI** — Glassmorphism dark theme, animated pipeline stages, token counter, live streaming, color palette chips, vibe score bar. Feels like a real product.

---

## 🛠️ Setup

```bash
git clone https://github.com/zsoubai-eng/vibecart-ai
cd vibecart-ai
npm install

# Create .env.local with your API keys
MISTRAL_API_KEY=your_mistral_key
ELEVENLABS_API_KEY=your_elevenlabs_key

npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🎬 How to Test (Judge's Walkthrough)

1. Go to [vibecart-ai.vercel.app](https://vibecart-ai.vercel.app)
2. Click **🔥 Trending Products** → pick any product from the grid → URL auto-fills
3. Click **Generate Full Brand Suite**
4. Watch all 5 pipeline stages fire sequentially with live streaming
5. Scroll to see: **Vibe Score** · **Profit Engine card** · **3-Style Hooks** · **6-Platform copy**
6. Click **Play Voiceover** → hear ElevenLabs voice the Stark-refined hooks
7. Click **Generate 30-Second TikTok/Reels Script** for a shot-by-shot director brief

---

## 📁 Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── stream/route.ts      # 4-stage SSE pipeline (core engine)
│   │   ├── trending/route.ts    # Reddit scraper + curated fallbacks
│   │   ├── transcribe/route.ts  # Voxtral audio → text
│   │   ├── voice/route.ts       # ElevenLabs TTS
│   │   └── script/route.ts      # 30-sec video script generator
│   ├── globals.css              # Full premium CSS system (~1500 lines)
│   ├── layout.tsx
│   └── page.tsx                 # Main UI + all components (~875 lines)
```

---

## 👤 Builder

Built solo in **72 hours** during the **Mistral Worldwide Hackathon 2026** — Online Edition.

- GitHub: [@zsoubai-eng](https://github.com/zsoubai-eng)
- Live: [vibecart-ai.vercel.app](https://vibecart-ai.vercel.app)

---

*Powered by [Mistral AI](https://mistral.ai) · [ElevenLabs](https://elevenlabs.io) · Deployed on [Vercel](https://vercel.com)*
