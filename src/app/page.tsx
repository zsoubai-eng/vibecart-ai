'use client';

import { useState, useRef } from 'react';
import {
  Camera, Sparkles, Zap, Brain, Loader2,
  Volume2, VolumeX, CheckCircle, Package,
  Instagram, ShoppingCart, Target, Lightbulb, TrendingUp, Film
} from 'lucide-react';
import './globals.css';

interface VibeData {
  aesthetic: string;
  mood: string;
  keywords: string[];
  demographic: string;
  emotion: string;
  vibeScore: number;
  palette: string[];
  category: string;
}

interface Results {
  vibeData: VibeData;
  marketingCopy: string;
  upgradedHooks: string;
  voiceText: string;
}

function parseSection(text: string, heading: string): string {
  // Match ### headings that contain the keyword anywhere (handles emojis too)
  const regex = new RegExp(`###[^\n]*${heading}[^\n]*\n([\s\S]*?)(?=###|$)`, 'i');
  const match = text.match(regex);
  if (!match) return '';
  // Clean up the result — remove leading/trailing blank lines
  return match[1].trim();
}

function formatMarkdown(text: string) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/^---$/gim, '<hr/>')
    .replace(/^(\d+)\. (.*$)/gim, '<li>$2</li>')
    .replace(/^[-*] (.*$)/gim, '<li>$1</li>')
    .replace(/\n\n/g, '<br/><br/>')
    .replace(/\n/g, '<br/>');
}

export default function Home() {
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [voiceLoading, setVoiceLoading] = useState(false);
  const [scriptLoading, setScriptLoading] = useState(false);
  const [results, setResults] = useState<Results | null>(null);
  const [videoScript, setVideoScript] = useState('');
  const [error, setError] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [previewImg, setPreviewImg] = useState('');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const scanVibe = async () => {
    if (!imageUrl) return;
    setLoading(true);
    setError('');
    setResults(null);
    setPreviewImg(imageUrl);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to analyze image');
      setResults(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const generateVoice = async () => {
    if (!results?.voiceText) return;
    setVoiceLoading(true);
    try {
      const response = await fetch('/api/voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: results.voiceText }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      const audioSrc = `data:${data.mimeType};base64,${data.audio}`;
      if (audioRef.current) {
        audioRef.current.pause();
      }
      const audio = new Audio(audioSrc);
      audioRef.current = audio;
      audio.onended = () => setIsPlaying(false);
      audio.play();
      setIsPlaying(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Voice generation failed');
    } finally {
      setVoiceLoading(false);
    }
  };

  const stopVoice = () => {
    audioRef.current?.pause();
    setIsPlaying(false);
  };

  const generateScript = async () => {
    if (!results) return;
    setScriptLoading(true);
    try {
      const response = await fetch('/api/script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vibeData: results.vibeData,
          marketingCopy: results.marketingCopy,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setVideoScript(data.script);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Script generation failed');
    } finally {
      setScriptLoading(false);
    }
  };

  const vibeScore = results?.vibeData?.vibeScore ?? 0;
  const scoreColor = vibeScore >= 80 ? '#10b981' : vibeScore >= 60 ? '#f59e0b' : '#ef4444';

  return (
    <>
      {/* NAVBAR */}
      <nav className="navbar">
        <div className="nav-logo">
          <Sparkles size={18} color="#a78bfa" />
          Vibe<span>Cart</span> AI
          <span className="nav-badge">Mistral × ElevenLabs</span>
        </div>
        <div className="nav-links">
          <a href="https://mistral.ai" className="nav-link" target="_blank" rel="noreferrer">Mistral AI</a>
          <a href="https://elevenlabs.io" className="nav-link" target="_blank" rel="noreferrer">ElevenLabs</a>
        </div>
      </nav>

      <main>
        {/* HERO */}
        <section className="hero">
          <div className="hero-eyebrow">
            <Sparkles size={12} />
            3 AI Models · 6 Platforms · Real-time Voice
          </div>
          <h1>
            Raw image.<br />
            <span className="accent">Viral brand.</span>
          </h1>
          <p>
            Drop any product image. Three chained Mistral models extract its brand DNA,
            write copy for 6 platforms, refine it for virality — then ElevenLabs voices it.
          </p>

          {/* INPUT CARD */}
          <div className="upload-card">
            {previewImg && !loading && results && (
              <div className="preview-image-wrap">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={previewImg} alt="Product" className="preview-image" onError={() => setPreviewImg('')} />
              </div>
            )}
            <div className="upload-icon-wrap">
              <Camera size={26} color="#a78bfa" strokeWidth={1.5} />
            </div>
            <h2>Analyze Product Aesthetic</h2>
            <p>Paste a direct image URL from any product listing</p>

            <div className="input-wrap">
              <input
                type="text"
                className="url-input"
                placeholder="https://example.com/product-image.jpg"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && scanVibe()}
              />
            </div>
            <button className="btn-primary" onClick={scanVibe} disabled={loading || !imageUrl}>
              {loading ? (
                <><Loader2 size={18} className="spinner" /> Running 3-model AI pipeline…</>
              ) : (
                <><Sparkles size={18} /> Generate Full Brand Suite</>
              )}
            </button>
            {error && <div className="error-box">⚠ {error}</div>}
          </div>

          {/* STATS */}
          {!results && (
            <div className="stats-row">
              {[
                { value: '3', label: 'AI Models Chained' },
                { value: '6', label: 'Platforms Generated' },
                { value: '🎤', label: 'ElevenLabs Voice' },
              ].map((s, i) => (
                <div className="stat" key={i}>
                  <div className="stat-value">{s.value}</div>
                  <div className="stat-label">{s.label}</div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── RESULTS ── */}
        {results && (
          <section className="results-section">

            {/* VIBE SCORE BAR */}
            <div className="vibe-score-card">
              <div className="vibe-score-left">
                <div className="vibe-score-label">Vibe Score</div>
                <div className="vibe-score-number" style={{ color: scoreColor }}>
                  {results.vibeData.vibeScore}
                  <span>/100</span>
                </div>
                <div className="vibe-mood">{results.vibeData.mood}</div>
              </div>
              <div className="vibe-score-center">
                <div className="vibe-bar-bg">
                  <div
                    className="vibe-bar-fill"
                    style={{ width: `${results.vibeData.vibeScore}%`, background: scoreColor }}
                  />
                </div>
                <div className="vibe-keywords">
                  {results.vibeData.keywords?.map((k, i) => (
                    <span key={i} className="vibe-tag">{k}</span>
                  ))}
                </div>
              </div>
              <div className="vibe-score-right">
                <div className="palette-label">Brand Palette</div>
                <div className="palette-chips">
                  {results.vibeData.palette?.map((color, i) => (
                    <div
                      key={i}
                      className="palette-chip"
                      style={{ background: color }}
                      title={color}
                    />
                  ))}
                </div>
                <div className="palette-hex">
                  {results.vibeData.palette?.map((c, i) => (
                    <span key={i} className="hex-label">{c}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* VOICE BANNER */}
            <div className="voice-banner">
              <div className="voice-banner-left">
                <div className="voice-icon">🎤</div>
                <div>
                  <div className="voice-title">ElevenLabs AI Voiceover</div>
                  <div className="voice-subtitle">Hear your viral hooks read by a premium AI voice</div>
                </div>
              </div>
              <div className="voice-actions">
                {isPlaying ? (
                  <button className="btn-voice-stop" onClick={stopVoice}>
                    <VolumeX size={16} /> Stop
                  </button>
                ) : (
                  <button className="btn-voice-play" onClick={generateVoice} disabled={voiceLoading}>
                    {voiceLoading ? (
                      <><Loader2 size={16} className="spinner" /> Generating…</>
                    ) : (
                      <><Volume2 size={16} /> Play Voiceover</>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* MAIN GRID */}
            <div className="results-grid">
              {/* VIBE DNA CARD */}
              <div className="result-card">
                <div className="result-card-header">
                  <div className="result-icon"><Brain size={17} color="#a78bfa" /></div>
                  <div>
                    <h3>Brand DNA</h3>
                    <span>Mistral Pixtral Vision Analysis</span>
                  </div>
                </div>
                <div className="dna-grid">
                  <div className="dna-item">
                    <div className="dna-label">Aesthetic</div>
                    <div className="dna-value">{results.vibeData.aesthetic}</div>
                  </div>
                  <div className="dna-item">
                    <div className="dna-label">Emotion Evoked</div>
                    <div className="dna-value">{results.vibeData.emotion}</div>
                  </div>
                  <div className="dna-item" style={{ gridColumn: '1 / -1' }}>
                    <div className="dna-label">Target Buyer</div>
                    <div className="dna-value">{results.vibeData.demographic}</div>
                  </div>
                </div>
              </div>

              {/* UPGRADED HOOKS */}
              <div className="result-card card-glow">
                <div className="result-card-header">
                  <div className="result-icon"><Zap size={17} color="#f59e0b" /></div>
                  <div>
                    <h3>🔥 AI-Refined Viral Hooks</h3>
                    <span>Self-refined by Mistral Creative Director</span>
                  </div>
                </div>
                <div
                  className="result-content"
                  dangerouslySetInnerHTML={{ __html: formatMarkdown(results.upgradedHooks || '') }}
                />
              </div>
            </div>

            {/* PLATFORM SUITE */}
            <div className="platform-title">
              <TrendingUp size={18} color="#a78bfa" />
              6-Platform Copy Suite
            </div>
            <div className="platform-grid">
              {/* Amazon */}
              <div className="platform-card">
                <div className="platform-header">
                  <ShoppingCart size={16} color="#f59e0b" />
                  <span>Amazon Listing</span>
                </div>
                <div
                  className="platform-content"
                  dangerouslySetInnerHTML={{
                    __html: formatMarkdown(parseSection(results.marketingCopy, 'Amazon')) || '<em>See full copy below</em>'
                  }}
                />
              </div>

              {/* Vibe Description */}
              <div className="platform-card">
                <div className="platform-header">
                  <Package size={16} color="#8b5cf6" />
                  <span>Vibe Description</span>
                </div>
                <div
                  className="platform-content"
                  dangerouslySetInnerHTML={{
                    __html: formatMarkdown(parseSection(results.marketingCopy, 'Vibe Description')) || '<em>See full copy below</em>'
                  }}
                />
              </div>

              {/* Instagram */}
              <div className="platform-card">
                <div className="platform-header">
                  <Instagram size={16} color="#ec4899" />
                  <span>Instagram Caption</span>
                </div>
                <div
                  className="platform-content"
                  dangerouslySetInnerHTML={{
                    __html: formatMarkdown(parseSection(results.marketingCopy, 'Instagram')) || '<em>See full copy below</em>'
                  }}
                />
              </div>

              {/* Facebook */}
              <div className="platform-card">
                <div className="platform-header">
                  <Target size={16} color="#3b82f6" />
                  <span>Facebook Ad</span>
                </div>
                <div
                  className="platform-content"
                  dangerouslySetInnerHTML={{
                    __html: formatMarkdown(parseSection(results.marketingCopy, 'Facebook')) || '<em>See full copy below</em>'
                  }}
                />
              </div>

              {/* Brand Name */}
              <div className="platform-card platform-brand">
                <div className="platform-header">
                  <Lightbulb size={16} color="#10b981" />
                  <span>Brand Name</span>
                </div>
                <div
                  className="platform-content brand-name-text"
                  dangerouslySetInnerHTML={{
                    __html: formatMarkdown(parseSection(results.marketingCopy, 'Brand Name')) || '<em>See full copy below</em>'
                  }}
                />
              </div>

              {/* UVP */}
              <div className="platform-card">
                <div className="platform-header">
                  <CheckCircle size={16} color="#06b6d4" />
                  <span>Unique Selling Point</span>
                </div>
                <div
                  className="platform-content"
                  dangerouslySetInnerHTML={{
                    __html: formatMarkdown(parseSection(results.marketingCopy, 'Unique Selling')) || '<em>See full copy below</em>'
                  }}
                />
              </div>
            </div>

            {/* VIDEO SCRIPT SECTION */}
            <div style={{ marginBottom: '1.25rem' }}>
              {!videoScript ? (
                <button
                  className="btn-script"
                  onClick={generateScript}
                  disabled={scriptLoading}
                >
                  {scriptLoading ? (
                    <><Loader2 size={18} className="spinner" /> Writing your 30-second video script…</>
                  ) : (
                    <><Film size={18} /> Generate 30-Second TikTok/Reels Video Script</>
                  )}
                </button>
              ) : (
                <div className="script-card">
                  <div className="result-card-header" style={{ marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
                    <div className="result-icon"><Film size={17} color="#ec4899" /></div>
                    <div>
                      <h3 style={{ color: 'var(--text)', fontSize: '0.9rem', fontWeight: 700 }}>🎬 30-Second Video Script</h3>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>Mistral Large 3 — Shot-by-shot director notes</span>
                    </div>
                  </div>
                  <div
                    className="result-content script-content"
                    dangerouslySetInnerHTML={{ __html: formatMarkdown(videoScript) }}
                  />
                </div>
              )}
            </div>

            {/* TRY AGAIN */}
            <div className="try-again-banner">
              <CheckCircle size={16} color="#10b981" />
              <span>Analysis complete — paste a new URL above to analyze another product</span>
            </div>
          </section>
        )}

        {/* HOW IT WORKS — only shown before any results */}
        {!results && !loading && (
          <section style={{ maxWidth: 960, margin: '3rem auto 0', padding: '0 2rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
              {[
                { icon: '🔬', title: 'Pixtral Extracts Brand DNA', desc: 'Our vision model reads color, texture, lighting, and vibe — outputting a structured brand identity + vibe score.' },
                { icon: '✍️', title: 'Mistral Large Writes Copy × 2', desc: 'First call generates 6-platform copy. Second call acts as a creative director and self-refines the viral hooks.' },
                { icon: '🎤', title: 'ElevenLabs Voices the Hooks', desc: 'The AI-refined hooks are voiced by a premium ElevenLabs model — ready to drop into your next TikTok reel.' },
              ].map((step, i) => (
                <div key={i} className="result-card" style={{ textAlign: 'center', padding: '2rem 1.5rem' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>{step.icon}</div>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f1f0ff', marginBottom: '0.6rem', letterSpacing: '-0.02em' }}>{step.title}</h3>
                  <p style={{ fontSize: '0.83rem', color: '#71717a', lineHeight: 1.65 }}>{step.desc}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </>
  );
}
