'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import {
  Camera, Sparkles, Zap, Brain, Loader2,
  Volume2, VolumeX, CheckCircle, Package,
  Instagram, ShoppingCart, Target, Lightbulb, TrendingUp, Film, Eye,
  Mic, MicOff, Link, DollarSign, BarChart2, RefreshCw, Flame
} from 'lucide-react';
import './globals.css';

// ── Types ─────────────────────────────────────────────────────────
type StageStatus = 'idle' | 'running' | 'streaming' | 'done' | 'error';

interface VibeData {
  aesthetic: string; mood: string; keywords: string[];
  demographic: string; emotion: string; vibeScore: number;
  palette: string[]; category: string;
}

interface ProfitData {
  suggestedPrice: number;
  estimatedCost: number;
  estimatedMargin: number;
  dropshipScore: number;
  dropshipVerdict: string;
  pricingRationale: string;
  platformFit: string[];
}

interface TrendingProduct {
  title: string;
  imageUrl: string;
  source: string;
  score: number;
  url: string;
  category: string;
}

interface Results {
  vibeData: VibeData;
  marketingCopy: string;
  upgradedHooks: string;
  voiceText: string;
  profitData?: ProfitData;
}

interface PipelineState {
  vision: StageStatus;
  copy: StageStatus;
  refine: StageStatus;
  profit: StageStatus;
  complete: boolean;
  totalTokens: number;
}

// ── Helpers ───────────────────────────────────────────────────────
function parseSection(text: string, heading: string): string {
  const regex = new RegExp(`###[^\\n]*${heading}[^\\n]*\\n([\\s\\S]*?)(?=###|$)`, 'i');
  const match = text.match(regex);
  if (!match) return '';
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

// ── Pipeline Stage Component ──────────────────────────────────────
function PipelineStage({
  number, icon, label, sublabel, status, streamText,
}: {
  number: number; icon: string; label: string; sublabel: string;
  status: StageStatus; streamText?: string;
}) {
  const statusIcon = {
    idle: <span className="stage-dot stage-dot-idle" />,
    running: <span className="stage-dot stage-dot-pulse" />,
    streaming: <span className="stage-dot stage-dot-stream" />,
    done: <CheckCircle size={14} color="#10b981" />,
    error: <span className="stage-dot stage-dot-error" />,
  }[status];

  const statusLabel = {
    idle: 'Queue', running: 'Running…', streaming: 'Generating…', done: 'Done', error: 'Error',
  }[status];

  const isActive = status === 'running' || status === 'streaming';
  const isDone = status === 'done';

  return (
    <div className={`pipeline-stage ${isActive ? 'pipeline-stage-active' : ''} ${isDone ? 'pipeline-stage-done' : ''}`}>
      <div className="pipeline-stage-header">
        <div className="pipeline-step-num">{number}</div>
        <span className="pipeline-icon">{icon}</span>
        <div className="pipeline-stage-info">
          <div className="pipeline-stage-label">{label}</div>
          <div className="pipeline-stage-sublabel">{sublabel}</div>
        </div>
        <div className="pipeline-stage-status">
          {statusIcon}
          <span className="pipeline-status-text" style={{
            color: isDone ? '#10b981' : isActive ? '#a78bfa' : '#52525b'
          }}>{statusLabel}</span>
        </div>
      </div>
      {streamText && (status === 'streaming' || status === 'done') && (
        <div className="pipeline-stream-text">
          {streamText.slice(-300)}
          {status === 'streaming' && <span className="cursor-blink">▋</span>}
        </div>
      )}
    </div>
  );
}

// ── Dropship Profit Card ──────────────────────────────────────────
function ProfitCard({ profit }: { profit: ProfitData }) {
  const scoreColor = profit.dropshipScore >= 8 ? '#10b981' : profit.dropshipScore >= 6 ? '#f59e0b' : profit.dropshipScore >= 4 ? '#f97316' : '#ef4444';
  return (
    <div className="profit-card">
      <div className="profit-card-header">
        <div className="result-icon"><DollarSign size={17} color="#10b981" /></div>
        <div>
          <h3>💰 Dropship Profit Engine</h3>
          <span>CFO Formula · AliExpress cost model</span>
        </div>
        <div className="profit-verdict" style={{ borderColor: scoreColor, color: scoreColor }}>
          {profit.dropshipVerdict}
        </div>
      </div>
      <div className="profit-grid">
        <div className="profit-metric">
          <div className="profit-metric-label">Suggested Retail</div>
          <div className="profit-metric-value" style={{ color: '#10b981' }}>${profit.suggestedPrice}</div>
        </div>
        <div className="profit-metric">
          <div className="profit-metric-label">Est. Cost (AliExpress)</div>
          <div className="profit-metric-value">${profit.estimatedCost}</div>
        </div>
        <div className="profit-metric">
          <div className="profit-metric-label">Gross Margin</div>
          <div className="profit-metric-value" style={{ color: '#f59e0b' }}>{profit.estimatedMargin}%</div>
        </div>
        <div className="profit-metric">
          <div className="profit-metric-label">Dropship Score</div>
          <div className="profit-metric-value" style={{ color: scoreColor }}>{profit.dropshipScore}/10</div>
        </div>
      </div>
      <div className="profit-rationale">{profit.pricingRationale}</div>
      <div className="profit-platforms">
        <span className="profit-platform-label">Best Channels:</span>
        {profit.platformFit?.map((p, i) => (
          <span key={i} className="profit-platform-tag">{p}</span>
        ))}
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────
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
  const [streamCopy, setStreamCopy] = useState('');
  const [streamRefine, setStreamRefine] = useState('');
  const [vibePreview, setVibePreview] = useState<VibeData | null>(null);
  const [pipeline, setPipeline] = useState<PipelineState>({
    vision: 'idle', copy: 'idle', refine: 'idle', profit: 'idle', complete: false, totalTokens: 0,
  });
  // ── Voxtral Voice Input ─────────────────────────────────────────
  const [inputMode, setInputMode] = useState<'url' | 'voice'>('url');
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [transcribing, setTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  // ── Trending Products ───────────────────────────────────────────
  const [trending, setTrending] = useState<TrendingProduct[]>([]);
  const [trendingLoading, setTrendingLoading] = useState(false);
  const [showTrending, setShowTrending] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // ── Load Trending on Mount ────────────────────────────────────
  useEffect(() => {
    fetchTrending();
  }, []);

  const fetchTrending = async () => {
    setTrendingLoading(true);
    try {
      const res = await fetch('/api/trending');
      const data = await res.json();
      if (data.success) setTrending(data.products);
    } catch { /* silent fail */ }
    finally { setTrendingLoading(false); }
  };

  // ── SSE Event Handler ─────────────────────────────────────────
  const handlePipelineEvent = useCallback((event: {
    stage: string; status?: string; data?: VibeData | Results | ProfitData;
    chunk?: string; tokens?: number; totalTokens?: number; error?: string;
    message?: string;
  }) => {
    switch (event.stage) {
      case 'vision':
        if (event.status === 'running') setPipeline(p => ({ ...p, vision: 'running' }));
        else if (event.status === 'done') {
          setVibePreview(event.data as VibeData);
          setPipeline(p => ({ ...p, vision: 'done' }));
        }
        break;
      case 'copy':
        if (event.status === 'running') setPipeline(p => ({ ...p, copy: 'running' }));
        if (event.status === 'streaming') setStreamCopy(prev => prev + (event.chunk || ''));
        if (event.status === 'done') setPipeline(p => ({ ...p, copy: 'done' }));
        break;
      case 'refine':
        if (event.status === 'running') setPipeline(p => ({ ...p, refine: 'running' }));
        if (event.status === 'streaming') setStreamRefine(prev => prev + (event.chunk || ''));
        if (event.status === 'done') setPipeline(p => ({ ...p, refine: 'done' }));
        break;
      case 'profit':
        if (event.status === 'running') setPipeline(p => ({ ...p, profit: 'running' }));
        if (event.status === 'done') setPipeline(p => ({ ...p, profit: 'done' }));
        break;
      case 'complete': {
        const resultData = event.data as Results;
        setResults(resultData);
        setPipeline(p => ({ ...p, complete: true, totalTokens: event.totalTokens || 0 }));
        setLoading(false);
        break;
      }
      case 'error':
        setError(event.error || 'Unknown error');
        setLoading(false);
        setPipeline(p => ({
          ...p,
          vision: p.vision === 'running' ? 'error' : p.vision,
          copy: p.copy === 'running' ? 'error' : p.copy,
          refine: p.refine === 'running' ? 'error' : p.refine,
          profit: p.profit === 'running' ? 'error' : p.profit,
        }));
        break;
    }
  }, []);

  // ── Voxtral Recording ─────────────────────────────────────────
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4';
      const recorder = new MediaRecorder(stream, { mimeType });
      chunksRef.current = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      recorder.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        const blob = new Blob(chunksRef.current, { type: mimeType });
        await transcribeBlob(blob, mimeType);
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      setTranscript('');
    } catch {
      setError('Microphone access denied. Please allow microphone permissions.');
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  const transcribeBlob = async (blob: Blob, mimeType: string) => {
    setTranscribing(true);
    try {
      const formData = new FormData();
      formData.append('audio', blob, `recording.${mimeType.includes('webm') ? 'webm' : 'mp4'}`);
      const res = await fetch('/api/transcribe', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.transcript) setTranscript(data.transcript);
      else throw new Error(data.error || 'Transcription failed');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Voxtral transcription failed');
    } finally {
      setTranscribing(false);
    }
  };

  // ── Streaming Analyze ─────────────────────────────────────────
  const scanVibe = async () => {
    const hasUrl = inputMode === 'url' && imageUrl;
    const hasVoice = inputMode === 'voice' && transcript;
    if (!hasUrl && !hasVoice) return;
    setLoading(true);
    setError('');
    setResults(null);
    setVideoScript('');
    setStreamCopy('');
    setStreamRefine('');
    setVibePreview(null);
    setShowTrending(false);
    if (inputMode === 'url') setPreviewImg(imageUrl);
    setPipeline({ vision: 'idle', copy: 'idle', refine: 'idle', profit: 'idle', complete: false, totalTokens: 0 });

    try {
      const response = await fetch('/api/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: inputMode === 'url' ? imageUrl : '',
          productDescription: inputMode === 'voice' ? transcript : undefined,
        }),
      });

      if (!response.body) throw new Error('No response stream');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try { handlePipelineEvent(JSON.parse(line.slice(6))); } catch { /* skip */ }
          }
        }
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Stream failed');
      setLoading(false);
    }
  };

  // ── Voice ─────────────────────────────────────────────────────
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
      const audio = new Audio(`data:${data.mimeType};base64,${data.audio}`);
      audioRef.current?.pause();
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

  const stopVoice = () => { audioRef.current?.pause(); setIsPlaying(false); };

  // ── Video Script ──────────────────────────────────────────────
  const generateScript = async () => {
    if (!results) return;
    setScriptLoading(true);
    try {
      const response = await fetch('/api/script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vibeData: results.vibeData, marketingCopy: results.marketingCopy }),
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

  const vibeScore = results?.vibeData?.vibeScore ?? vibePreview?.vibeScore ?? 0;
  const scoreColor = vibeScore >= 80 ? '#10b981' : vibeScore >= 60 ? '#f59e0b' : '#ef4444';
  const activePipeline = loading || (pipeline.vision !== 'idle' && !pipeline.complete);

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
            4 AI Models · 6 Platforms · Real-time Streaming · Voice
          </div>
          <h1>
            Raw image.<br />
            <span className="accent">Viral brand.</span>
          </h1>
          <p>
            Drop any product image <em>or describe it by voice</em>. Four chained Mistral models extract brand DNA,
            stream 3-style viral copy, run a Stark Analyst critique, then calculate your dropship profit margin.
          </p>

          {/* INPUT CARD */}
          <div className="upload-card">
            {previewImg && !loading && results && inputMode === 'url' && (
              <div className="preview-image-wrap">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={previewImg} alt="Product" className="preview-image" onError={() => setPreviewImg('')} />
              </div>
            )}

            {/* MODE TOGGLE */}
            <div className="input-mode-toggle">
              <button
                className={`mode-btn ${inputMode === 'url' ? 'mode-btn-active' : ''}`}
                onClick={() => { setInputMode('url'); setError(''); }}
              >
                <Link size={13} /> Image URL
              </button>
              <button
                className={`mode-btn ${inputMode === 'voice' ? 'mode-btn-active mode-btn-voice' : ''}`}
                onClick={() => { setInputMode('voice'); setError(''); }}
              >
                <Mic size={13} /> Voice Describe
                <span className="mode-badge-new">Voxtral</span>
              </button>
            </div>

            {inputMode === 'url' ? (
              <>
                <div className="upload-icon-wrap">
                  <Camera size={26} color="#a78bfa" strokeWidth={1.5} />
                </div>
                <h2>Analyze Product Aesthetic</h2>
                <p>Paste a direct image URL — or pick a trending product below</p>
                <div className="input-wrap">
                  <input
                    type="text"
                    className="url-input"
                    placeholder="https://example.com/product-image.jpg"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !loading && scanVibe()}
                  />
                </div>

                {/* 🔥 TRENDING PRODUCTS BUTTON */}
                <button
                  className="btn-trending"
                  onClick={() => { setShowTrending(!showTrending); if (!trending.length) fetchTrending(); }}
                  disabled={trendingLoading}
                >
                  {trendingLoading
                    ? <><Loader2 size={14} className="spinner" /> Loading trends…</>
                    : <><Flame size={14} /> {showTrending ? 'Hide' : 'Trending Products'}</>
                  }
                </button>

                {/* TRENDING GRID */}
                {showTrending && trending.length > 0 && (
                  <div className="trending-grid">
                    <div className="trending-header">
                      <Flame size={13} color="#f59e0b" />
                      <span>Trending Now — click to auto-fill</span>
                      <button className="trending-refresh" onClick={fetchTrending} disabled={trendingLoading}>
                        <RefreshCw size={12} /> Refresh
                      </button>
                    </div>
                    {trending.map((product, i) => (
                      <button
                        key={i}
                        className="trending-item"
                        onClick={() => {
                          setImageUrl(product.imageUrl);
                          setShowTrending(false);
                        }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={product.imageUrl}
                          alt={product.title}
                          className="trending-thumb"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                        <div className="trending-item-info">
                          <div className="trending-item-title">{product.title}</div>
                          <div className="trending-item-meta">
                            <span className="trending-source">{product.source}</span>
                            <span className="trending-category">{product.category}</span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="upload-icon-wrap" style={{ background: isRecording ? 'rgba(239,68,68,0.15)' : 'rgba(139,92,246,0.1)', borderColor: isRecording ? 'rgba(239,68,68,0.4)' : undefined }}>
                  {isRecording ? <MicOff size={26} color="#ef4444" /> : <Mic size={26} color="#a78bfa" strokeWidth={1.5} />}
                </div>
                <h2>Describe Your Product</h2>
                <p>Speak naturally — Voxtral AI transcribes your description in real-time</p>

                <div className="voice-record-area">
                  {transcript ? (
                    <div className="transcript-display">
                      <div className="transcript-label">✅ Voxtral Transcript</div>
                      <div className="transcript-text">{transcript}</div>
                      <button className="transcript-clear" onClick={() => setTranscript('')}>× Clear</button>
                    </div>
                  ) : transcribing ? (
                    <div className="transcribing-state">
                      <Loader2 size={18} className="spinner" color="#a78bfa" />
                      <span>Voxtral transcribing…</span>
                    </div>
                  ) : (
                    <div className="record-hint">
                      {isRecording ? '🔴 Recording… click to stop' : 'Example: "A luxury black watch with gold details and minimalist packaging"'}
                    </div>
                  )}
                </div>

                <button
                  className={`btn-mic ${isRecording ? 'btn-mic-stop' : ''}`}
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={transcribing}
                >
                  {isRecording ? (
                    <><MicOff size={18} /> Stop Recording</>
                  ) : (
                    <><Mic size={18} /> {transcript ? 'Re-record' : 'Start Recording'}</>
                  )}
                </button>
              </>
            )}

            <button
              className="btn-primary"
              onClick={scanVibe}
              disabled={loading || (inputMode === 'url' ? !imageUrl : !transcript)}
              style={{ marginTop: inputMode === 'voice' ? '0.75rem' : undefined }}
            >
              {loading ? (
                <><Loader2 size={18} className="spinner" /> Streaming AI pipeline…</>
              ) : (
                <><Sparkles size={18} /> Generate Full Brand Suite</>
              )}
            </button>
            {error && <div className="error-box">⚠ {error}</div>}
          </div>

          {/* STATS */}
          {!results && !loading && (
            <div className="stats-row">
              {[
                { value: '4', label: 'AI Models Chained' },
                { value: '6', label: 'Platforms Generated' },
                { value: '3', label: 'Hook Style Variants' },
                { value: '💰', label: 'Profit Calculator' },
              ].map((s, i) => (
                <div className="stat" key={i}>
                  <div className="stat-value">{s.value}</div>
                  <div className="stat-label">{s.label}</div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── LIVE PIPELINE PANEL ── */}
        {activePipeline && (
          <section className="pipeline-section">
            <div className="pipeline-panel">
              <div className="pipeline-header">
                <div className="pipeline-title">
                  <Eye size={16} color="#a78bfa" />
                  Live AI Pipeline
                </div>
                <div className="pipeline-meta">
                  {pipeline.totalTokens > 0 && (
                    <span className="token-count">{pipeline.totalTokens.toLocaleString()} tokens</span>
                  )}
                  <span className="pipeline-pulse" />
                </div>
              </div>

              <div className="pipeline-stages">
                <PipelineStage
                  number={1} icon="🔬" label="Pixtral / Mistral Vision" sublabel="Brand DNA · structured JSON extraction"
                  status={pipeline.vision}
                  streamText={vibePreview ? `Vibe: ${vibePreview.vibeScore}/100 · ${vibePreview.mood} · ${vibePreview.keywords?.slice(0, 3).join(', ')}` : undefined}
                />
                <PipelineStage
                  number={2} icon="✍️" label="Mistral Large" sublabel="3-style hook suite · 6-platform copy · streaming"
                  status={pipeline.copy}
                  streamText={streamCopy}
                />
                <PipelineStage
                  number={3} icon="⚡" label="Stark Analyst" sublabel="First-principles critique · hook refinement"
                  status={pipeline.refine}
                  streamText={streamRefine}
                />
                <PipelineStage
                  number={4} icon="💰" label="CFO Profit Engine" sublabel="AliExpress cost model · dropship viability"
                  status={pipeline.profit}
                />
                <PipelineStage
                  number={5} icon="🎤" label="ElevenLabs" sublabel="Premium voice synthesis · Rachel model"
                  status={results ? 'done' : 'idle'}
                />
              </div>
            </div>
          </section>
        )}

        {/* ── RESULTS ── */}
        {results && (
          <section className="results-section">
            {/* VIBE SCORE BAR */}
            <div className="vibe-score-card">
              <div className="vibe-score-left">
                <div className="vibe-score-label">Vibe Score</div>
                <div className="vibe-score-number" style={{ color: scoreColor }}>
                  {results.vibeData.vibeScore}<span>/100</span>
                </div>
                <div className="vibe-mood">{results.vibeData.mood}</div>
              </div>
              <div className="vibe-score-center">
                <div className="vibe-bar-bg">
                  <div className="vibe-bar-fill" style={{ width: `${results.vibeData.vibeScore}%`, background: scoreColor }} />
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
                    <div key={i} className="palette-chip" style={{ background: color }} title={color} />
                  ))}
                </div>
                <div className="palette-hex">
                  {results.vibeData.palette?.map((c, i) => (
                    <span key={i} className="hex-label">{c}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* TOKEN STATS */}
            {pipeline.totalTokens > 0 && (
              <div className="token-stats-bar">
                <Sparkles size={13} color="#a78bfa" />
                <span><strong>{pipeline.totalTokens.toLocaleString()}</strong> tokens across 4 Mistral model calls</span>
                <span className="token-stat-pill">Vision ✓</span>
                <span className="token-stat-pill">3-Style Copy ✓</span>
                <span className="token-stat-pill">Stark Refined ✓</span>
                <span className="token-stat-pill">Profit ✓</span>
              </div>
            )}

            {/* 💰 DROPSHIP PROFIT CARD */}
            {results.profitData && <ProfitCard profit={results.profitData} />}

            {/* VOICE BANNER */}
            <div className="voice-banner">
              <div className="voice-banner-left">
                <div className="voice-icon">🎤</div>
                <div>
                  <div className="voice-title">ElevenLabs AI Voiceover</div>
                  <div className="voice-subtitle">Hear your Stark-refined viral hooks read by a premium AI voice</div>
                </div>
              </div>
              <div className="voice-actions">
                {isPlaying ? (
                  <button className="btn-voice-stop" onClick={stopVoice}>
                    <VolumeX size={16} /> Stop
                  </button>
                ) : (
                  <button className="btn-voice-play" onClick={generateVoice} disabled={voiceLoading}>
                    {voiceLoading ? <><Loader2 size={16} className="spinner" /> Generating…</> : <><Volume2 size={16} /> Play Voiceover</>}
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
                    <span>Mistral Vision Analysis</span>
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

              {/* STARK UPGRADED HOOKS */}
              <div className="result-card card-glow">
                <div className="result-card-header">
                  <div className="result-icon"><Zap size={17} color="#f59e0b" /></div>
                  <div>
                    <h3>⚡ Stark-Refined Viral Hooks</h3>
                    <span>First Principles critique — 3 styles upgraded</span>
                  </div>
                </div>
                <div className="result-content" dangerouslySetInnerHTML={{ __html: formatMarkdown(results.upgradedHooks || '') }} />
              </div>
            </div>

            {/* PLATFORM SUITE */}
            <div className="platform-title">
              <TrendingUp size={18} color="#a78bfa" />
              6-Platform Copy Suite · 3 Hook Styles
            </div>
            <div className="platform-grid">
              <div className="platform-card">
                <div className="platform-header"><ShoppingCart size={16} color="#f59e0b" /><span>Amazon Listing</span></div>
                <div className="platform-content" dangerouslySetInnerHTML={{ __html: formatMarkdown(parseSection(results.marketingCopy, 'Amazon')) || '<em>See full copy below</em>' }} />
              </div>
              <div className="platform-card">
                <div className="platform-header"><Package size={16} color="#8b5cf6" /><span>Vibe Description</span></div>
                <div className="platform-content" dangerouslySetInnerHTML={{ __html: formatMarkdown(parseSection(results.marketingCopy, 'Vibe Description')) || '<em>See full copy below</em>' }} />
              </div>
              <div className="platform-card" style={{ gridColumn: '1 / -1' }}>
                <div className="platform-header"><BarChart2 size={16} color="#ec4899" /><span>🎣 TikTok Hooks — 3 Styles</span></div>
                <div className="platform-content" dangerouslySetInnerHTML={{ __html: formatMarkdown(parseSection(results.marketingCopy, 'TikTok')) || '<em>See full copy below</em>' }} />
              </div>
              <div className="platform-card">
                <div className="platform-header"><Instagram size={16} color="#ec4899" /><span>Instagram Caption</span></div>
                <div className="platform-content" dangerouslySetInnerHTML={{ __html: formatMarkdown(parseSection(results.marketingCopy, 'Instagram')) || '<em>See full copy below</em>' }} />
              </div>
              <div className="platform-card">
                <div className="platform-header"><Target size={16} color="#3b82f6" /><span>Facebook Ad</span></div>
                <div className="platform-content" dangerouslySetInnerHTML={{ __html: formatMarkdown(parseSection(results.marketingCopy, 'Facebook')) || '<em>See full copy below</em>' }} />
              </div>
              <div className="platform-card platform-brand">
                <div className="platform-header"><Lightbulb size={16} color="#10b981" /><span>Brand Name</span></div>
                <div className="platform-content brand-name-text" dangerouslySetInnerHTML={{ __html: formatMarkdown(parseSection(results.marketingCopy, 'Brand Name')) || '<em>See full copy below</em>' }} />
              </div>
              <div className="platform-card">
                <div className="platform-header"><CheckCircle size={16} color="#06b6d4" /><span>Unique Selling Point</span></div>
                <div className="platform-content" dangerouslySetInnerHTML={{ __html: formatMarkdown(parseSection(results.marketingCopy, 'Unique Selling')) || '<em>See full copy below</em>' }} />
              </div>
            </div>

            {/* VIDEO SCRIPT */}
            <div style={{ marginBottom: '1.25rem' }}>
              {!videoScript ? (
                <button className="btn-script" onClick={generateScript} disabled={scriptLoading}>
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
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>Mistral Large — Shot-by-shot director notes</span>
                    </div>
                  </div>
                  <div className="result-content script-content" dangerouslySetInnerHTML={{ __html: formatMarkdown(videoScript) }} />
                </div>
              )}
            </div>

            {/* TRY AGAIN */}
            <div className="try-again-banner">
              <CheckCircle size={16} color="#10b981" />
              <span>Analysis complete — paste a new URL or pick a trending product above</span>
            </div>
          </section>
        )}

        {/* HOW IT WORKS */}
        {!results && !loading && (
          <section style={{ maxWidth: 960, margin: '3rem auto 0', padding: '0 2rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem' }}>
              {[
                { icon: '🔬', title: 'Pixtral Extracts Brand DNA', desc: 'Visual JSON extraction: vibe score, palette, demographics, mood — from a single image or voice description.' },
                { icon: '✍️', title: '3-Style Hook Suite', desc: 'Informative, Controversial, and Value-Add hooks for every platform. Token-by-token streaming.' },
                { icon: '⚡', title: 'Stark Analyst Refines', desc: 'First Principles critique — Elon Musk meets Steve Jobs. The hooks get surgically upgraded for virality.' },
                { icon: '💰', title: 'Dropship Profit Engine', desc: 'CFO Formula calculates suggested retail price, AliExpress cost, gross margin, and dropship viability score.' },
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
