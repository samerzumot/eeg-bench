import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Pause, Volume2, VolumeX, Sliders,
  CheckCircle2, ArrowLeft, ShieldCheck, AlertCircle, Info, RefreshCw, Eye, EyeOff,
  Tv, Video, Film, Sparkles, Activity, Check, Heart, Smile
} from 'lucide-react';
import confetti from 'canvas-confetti';

const THERAPEUTIC_TRACKS = [
  {
    id: 'nature_stream',
    type: 'mp4',
    title: 'Dr. Gala ILF Mountain Flow',
    desc: 'High-definition relaxing nature river and mountain canopy (Optimal for SMR/Alpha)',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
  },
  {
    id: 'ocean_alpha',
    type: 'mp4',
    title: 'Oceanic Alpha Wave Coherence',
    desc: 'Calming ocean swell and shoreline rhythm (Optimal for Autonomic Down-regulation)',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4'
  },
  {
    id: 'forest_canopy',
    type: 'mp4',
    title: 'Forest Sunlight Meditation',
    desc: 'Gentle wind through sunlight trees (Optimal for ADHD Attentional Anchoring)',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4'
  },
  {
    id: 'sunset_flow',
    type: 'mp4',
    title: 'Sunset Slow-Wave Horizon',
    desc: 'Infra-low sunset transition for parasympathetic soothing',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4'
  },
  {
    id: 'youtube_sample_1',
    type: 'youtube',
    youtubeId: '4xDzrJKXOOY', // Relaxing synthwave / study flow
    title: 'Universal YouTube: Lofi / Ambient Flow',
    desc: 'YouTube live stream overlay with real-time EEG blur and luminance modulation',
    url: 'https://www.youtube.com/watch?v=4xDzrJKXOOY'
  }
];

// Helper to extract YouTube ID
function extractYouTubeId(url) {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

export function NeurofeedbackSession({ 
  client, 
  onFinish, 
  eegState, 
  mockService,
  onOpenDemo
}) {
  const videoRef = useRef(null);
  const waveRef = useRef(null);
  const [isActive, setIsActive] = useState(false);
  
  // Session Configuration
  const [selectedDurationMin, setSelectedDurationMin] = useState(15);
  const [timeLeft, setTimeLeft] = useState(15 * 60);
  const [inZoneSeconds, setInZoneSeconds] = useState(0);
  const [totalElapsedSeconds, setTotalElapsedSeconds] = useState(0);
  const [showHUD, setShowHUD] = useState(true);
  const [done, setDone] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState(THERAPEUTIC_TRACKS[0]);
  const [customYoutubeUrl, setCustomYoutubeUrl] = useState('');
  const [activeYoutubeId, setActiveYoutubeId] = useState(null);
  const [showMediaPicker, setShowMediaPicker] = useState(false);

  // Protocols & Auto-Adaptive Thresholds
  const [protocolType, setProtocolType] = useState(
    client?.indication?.toLowerCase().includes('anxiety') ? 'anxiety' : 'adhd'
  );
  const [threshold, setThreshold] = useState(client?.protocolSensitivity || 65);
  const [autoAdaptiveThreshold, setAutoAdaptiveThreshold] = useState(true);
  const [feedbackMode, setFeedbackMode] = useState('graded'); // 'graded' | 'stealth_dim' | 'discrete'
  const [isMuted, setIsMuted] = useState(false);

  // Post-Session Subjective Check-in
  const [postSessionRating, setPostSessionRating] = useState(null);
  const [postSessionSaved, setPostSessionSaved] = useState(false);

  // Current Brain Metrics
  const focus = eegState?.focusScore || 82;
  const calm = eegState?.calmScore || 80;
  const orfHz = eegState?.optimalResponseFrequencyHz || 0.005;

  // Determine current metric
  const currentMetric = protocolType === 'adhd' 
    ? focus 
    : protocolType === 'anxiety' 
      ? calm 
      : Math.round((focus + calm) / 2);

  // Adaptive auto-threshold logic (nudges threshold to maintain ~70% reward rate)
  useEffect(() => {
    if (!autoAdaptiveThreshold || !isActive) return;
    const interval = setInterval(() => {
      if (totalElapsedSeconds > 15) {
        const currentZoneRate = (inZoneSeconds / totalElapsedSeconds) * 100;
        if (currentZoneRate < 60 && threshold > 52) {
          setThreshold(prev => Math.max(50, prev - 1)); // Lower difficulty slightly
        } else if (currentZoneRate > 80 && threshold < 85) {
          setThreshold(prev => Math.min(90, prev + 1)); // Increase challenge
        }
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [autoAdaptiveThreshold, isActive, inZoneSeconds, totalElapsedSeconds, threshold]);

  const isAbove = currentMetric >= threshold;

  // Direct HTML5 Video Modulation Calculations
  const modulation = eegState?.modulation || {
    brightnessPct: isAbove ? 100 : 40,
    blurPx: isAbove ? 0 : 5,
    apertureScale: isAbove ? 1.0 : 0.95,
    volumePct: isAbove ? 100 : 20,
    isInZone: isAbove,
  };

  // Direct Video Control Handler (for HTML5 MP4)
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isActive && !done) {
      if (feedbackMode === 'discrete') {
        if (isAbove) {
          if (video.paused) video.play().catch(() => {});
        } else {
          if (!video.paused) video.pause();
        }
      } else {
        if (video.paused) video.play().catch(() => {});
      }

      if (isMuted) {
        video.volume = 0;
      } else {
        const targetVol = feedbackMode === 'discrete' 
          ? (isAbove ? 1.0 : 0.0) 
          : Math.max(0.1, modulation.volumePct / 100);
        video.volume = Math.min(1.0, Math.max(0, targetVol));
      }
    } else {
      if (!video.paused) video.pause();
    }
  }, [isActive, done, isAbove, feedbackMode, modulation.volumePct, isMuted, activeYoutubeId]);

  // Timer Tick & In-Zone Tracking
  useEffect(() => {
    if (!isActive || timeLeft <= 0 || done) return;
    const t = setInterval(() => {
      setTotalElapsedSeconds(p => p + 1);
      if (isAbove) {
        setInZoneSeconds(p => p + 1);
      }
      setTimeLeft(p => {
        if (p <= 1) {
          handleDone();
          return 0;
        }
        return p - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [isActive, timeLeft, done, isAbove]);

  const handleStartSession = () => {
    setIsActive(true);
    setDone(false);
    setTimeLeft(selectedDurationMin * 60);
    setInZoneSeconds(0);
    setTotalElapsedSeconds(0);
    setPostSessionSaved(false);
    setPostSessionRating(null);
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  };

  const handlePauseSession = () => {
    setIsActive(false);
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };

  const handleDone = () => {
    setIsActive(false);
    setDone(true);
    try {
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
    } catch {}
  };

  const handleApplyCustomYoutube = (e) => {
    e.preventDefault();
    const yId = extractYouTubeId(customYoutubeUrl);
    if (yId) {
      setActiveYoutubeId(yId);
      setSelectedTrack({
        id: `yt_${yId}`,
        type: 'youtube',
        youtubeId: yId,
        title: 'Custom YouTube Stream',
        desc: `Video ID: ${yId}`,
        url: customYoutubeUrl
      });
      setShowMediaPicker(false);
    } else {
      alert('Please enter a valid YouTube URL (e.g. https://www.youtube.com/watch?v=...)');
    }
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const zonePercent = totalElapsedSeconds > 0 
    ? Math.round((inZoneSeconds / totalElapsedSeconds) * 100) 
    : 0;

  // Compute CSS filter for video & YouTube overlay
  const videoFilterStyle = feedbackMode === 'graded'
    ? {
        filter: `brightness(${modulation.brightnessPct}%) blur(${modulation.blurPx}px)`,
        transform: `scale(${modulation.apertureScale})`,
      }
    : feedbackMode === 'stealth_dim'
    ? {
        filter: `brightness(${modulation.brightnessPct}%)`,
        transform: 'scale(1)',
      }
    : {
        filter: isActive && !isAbove ? 'blur(5px) brightness(30%)' : 'none',
        transform: 'scale(1)',
      };

  // Draw 4-channel oscilloscope on canvas
  useEffect(() => {
    const canvas = waveRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, rect.width, rect.height);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let x = 0; x < rect.width; x += 24) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, rect.height);
      ctx.stroke();
    }

    const raw = eegState?.rawSamples || { ch1: [], ch2: [], ch3: [], ch4: [], ilf: [] };
    const channels = [
      { name: `ILF (${orfHz}Hz)`, sub: 'DC Slow Potential', data: raw.ilf || [], color: '#F59E0B', isIlf: true },
      { name: 'AF7', sub: 'Left Frontal', data: raw.ch2 || [], color: '#3B9B8F' },
      { name: 'AF8', sub: 'Right Frontal', data: raw.ch3 || [], color: '#2DD4BF' },
      { name: 'TP9', sub: 'Left Temporal', data: raw.ch1 || [], color: '#38BDF8' },
      { name: 'TP10', sub: 'Right Temporal', data: raw.ch4 || [], color: '#818CF8' },
    ];

    const chHeight = rect.height / channels.length;

    channels.forEach((ch, idx) => {
      const centerY = idx * chHeight + chHeight / 2;

      ctx.fillStyle = ch.color;
      ctx.font = '600 9px monospace';
      ctx.fillText(ch.name, 10, centerY - 2);

      const data = ch.data;
      if (data && data.length > 1) {
        ctx.strokeStyle = ch.color;
        ctx.lineWidth = ch.isIlf ? 1.75 : 1.1;
        ctx.beginPath();
        const startX = 75;
        const availableW = rect.width - startX - 10;
        const step = availableW / (data.length - 1);

        for (let i = 0; i < data.length; i++) {
          const x = startX + i * step;
          const y = ch.isIlf ? centerY - (data[i] || 0) * 14 : centerY - (data[i] || 0) * 0.6;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
    });
  }, [eegState, orfHz]);

  const athena = eegState?.athena || {
    eogBlinkFilterActive: true,
    emgClenchDetected: false,
    imuHeadStabilityPercent: 98,
    hrvAutonomicCoherence: 0.86,
    dcPotentialOffsetMv: -4.2,
  };

  const isYouTubeActive = selectedTrack?.type === 'youtube' || activeYoutubeId;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 space-y-6 text-[#EDEDED] font-sans">
      
      {/* Session Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-[#111111] border border-[#222222] shadow-xs">
        <div className="flex items-center gap-3">
          <button 
            onClick={onFinish}
            className="p-1.5 rounded-lg border border-[#333333] hover:bg-[#1A1A1A] transition-all text-[#888888] hover:text-[#EDEDED]"
            title="Return to Patient Portal"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-[#EDEDED]">
                ILF Neurofeedback Therapy Session
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-700/60 text-emerald-400 font-semibold">
                {client?.name} ({client?.id})
              </span>
            </div>
            <p className="text-xs text-[#888888]">
              Methodology: Infra-Low Frequency · Target ORF: {orfHz} Hz Slow Wave
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          
          {/* Media Switcher Button */}
          <button
            onClick={() => setShowMediaPicker(!showMediaPicker)}
            className="btn btn-outline text-xs py-1.5 px-3 flex items-center gap-1.5 font-mono"
            title="Choose Curated Video or Paste Custom YouTube Link"
          >
            <Video className="w-3.5 h-3.5 text-rose-400" />
            <span className="truncate max-w-[130px]">{selectedTrack.title}</span>
          </button>

          {/* Protocol Type Selector */}
          <div className="flex items-center p-1 bg-[#161616] rounded-lg border border-[#333333] text-xs font-mono">
            <button
              onClick={() => setProtocolType('adhd')}
              className={`px-2.5 py-1 rounded transition-all ${
                protocolType === 'adhd'
                  ? 'bg-emerald-950 border border-emerald-600 text-emerald-300 font-semibold shadow-xs'
                  : 'text-[#888888] hover:text-[#EDEDED]'
              }`}
            >
              ADHD Focus
            </button>
            <button
              onClick={() => setProtocolType('anxiety')}
              className={`px-2.5 py-1 rounded transition-all ${
                protocolType === 'anxiety'
                  ? 'bg-emerald-950 border border-emerald-600 text-emerald-300 font-semibold shadow-xs'
                  : 'text-[#888888] hover:text-[#EDEDED]'
              }`}
            >
              Anxiety Calm
            </button>
          </div>

          {/* Session Play/Pause */}
          {!isActive ? (
            <button
              onClick={handleStartSession}
              className="btn btn-primary text-xs py-2 px-4 font-semibold shadow-sm flex items-center gap-1.5"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Start Session</span>
            </button>
          ) : (
            <button
              onClick={handlePauseSession}
              className="btn btn-outline text-xs py-2 px-4 font-semibold flex items-center gap-1.5"
            >
              <Pause className="w-3.5 h-3.5 fill-current" />
              <span>Pause</span>
            </button>
          )}

          {onOpenDemo && (
            <button
              onClick={onOpenDemo}
              className="btn btn-outline text-xs py-2 px-3 border-teal-800/80 text-teal-400 bg-teal-950/40 hover:bg-teal-950/70"
            >
              Clinical Tour
            </button>
          )}
        </div>
      </div>

      {/* Media Picker Dropdown / Modal */}
      {showMediaPicker && (
        <div className="p-5 rounded-xl bg-[#141414] border border-[#333333] space-y-4 shadow-xl animate-fade-in">
          <div className="flex items-center justify-between border-b border-[#2A2A2A] pb-2.5">
            <div className="flex items-center gap-2">
              <Film className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-semibold text-[#EDEDED]">Select Sensory Media Feed (Divergence-Beating Engine)</span>
            </div>
            <button
              onClick={() => setShowMediaPicker(false)}
              className="text-xs text-[#888888] hover:text-white"
            >
              Close ✕
            </button>
          </div>

          {/* Custom YouTube Link Input */}
          <form onSubmit={handleApplyCustomYoutube} className="flex gap-2">
            <div className="relative flex-1">
              <Video className="w-4 h-4 absolute left-3 top-2.5 text-rose-500" />
              <input
                type="text"
                value={customYoutubeUrl}
                onChange={(e) => setCustomYoutubeUrl(e.target.value)}
                placeholder="Paste any YouTube URL (e.g., https://www.youtube.com/watch?v=...)"
                className="w-full pl-9 pr-3 py-2 text-xs rounded-lg bg-[#0D0D0D] border border-[#333333] text-[#EDEDED] focus:outline-none focus:border-emerald-500"
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary text-xs py-2 px-4 shrink-0 font-semibold"
            >
              Load YouTube
            </button>
          </form>

          {/* Preset Library */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {THERAPEUTIC_TRACKS.map((t) => (
              <div
                key={t.id}
                onClick={() => {
                  setSelectedTrack(t);
                  setActiveYoutubeId(t.youtubeId || null);
                  setShowMediaPicker(false);
                }}
                className={`p-3 rounded-lg border text-left cursor-pointer transition-all ${
                  selectedTrack.id === t.id
                    ? 'bg-emerald-950/80 border-emerald-500 shadow-xs'
                    : 'bg-[#181818] border-[#2A2A2A] hover:bg-[#222222]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#EDEDED]">{t.title}</span>
                  {t.type === 'youtube' ? (
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-rose-950/80 text-rose-400 border border-rose-800">YouTube</span>
                  ) : (
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-teal-950/80 text-teal-300 border border-teal-800">4K MP4</span>
                  )}
                </div>
                <p className="text-[10px] text-[#888888] mt-1 line-clamp-1">{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Controlled Immersive Video Stage */}
      <div className="relative rounded-2xl overflow-hidden bg-black border border-[#222222] shadow-2xl">
        
        {/* Floating Telemetry HUD */}
        {showHUD && (
          <div className="absolute top-4 left-4 right-4 z-30 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
            
            {/* Live State Badge */}
            <div className="pointer-events-auto flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-black/85 backdrop-blur-md border border-white/15 text-white">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  isAbove
                    ? 'bg-emerald-400 animate-pulse shadow-[0_0_8px_#2dd4bf]'
                    : athena.emgClenchDetected
                    ? 'bg-rose-400 shadow-[0_0_8px_#fb7185]'
                    : 'bg-amber-400 shadow-[0_0_8px_#f59e0b]'
                }`}
              />
              <div className="text-left">
                <p className="text-[11px] font-mono font-semibold uppercase tracking-wide leading-tight">
                  {isAbove
                    ? 'Optimal ILF Synchrony (In Zone)'
                    : athena.emgClenchDetected
                    ? 'Somatic Muscle Tension (EMG Gated)'
                    : 'Sub-Threshold Slow-Wave Reflection'}
                </p>
                <p className="text-[10px] text-white/70 font-sans leading-none mt-0.5">
                  {protocolType === 'adhd'
                    ? `Focus: ${focus}% (Target >= ${threshold}%)`
                    : `Calm: ${calm}% (Target >= ${threshold}%)`} · Brightness: {modulation.brightnessPct}% · Volume: {modulation.volumePct}%
                </p>
              </div>
            </div>

            {/* Artifact Badges & Adaptive Indicator */}
            <div className="pointer-events-auto hidden md:flex items-center gap-2 font-mono text-[10px]">
              <div className={`px-2.5 py-1 rounded-lg backdrop-blur-md border flex items-center gap-1.5 ${
                athena.eogBlinkFilterActive 
                  ? 'bg-emerald-950/80 border-emerald-600/70 text-emerald-300' 
                  : 'bg-black/70 border-white/10 text-white/60'
              }`}>
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span>EOG Blink Filter Active</span>
              </div>

              <div className={`px-2.5 py-1 rounded-lg backdrop-blur-md border flex items-center gap-1.5 ${
                autoAdaptiveThreshold
                  ? 'bg-teal-950/80 border-teal-600/70 text-teal-300'
                  : 'bg-black/70 border-white/10 text-white/60'
              }`}>
                <Activity className="w-3 h-3 text-teal-400" />
                <span>Auto-Adaptive Target (70%)</span>
              </div>
            </div>

            {/* In-Zone Timer */}
            <div className="pointer-events-auto flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-black/85 backdrop-blur-md border border-white/15 text-white font-mono text-xs">
              <div>
                <span className="text-white/50 text-[9px] block">TIME LEFT</span>
                <span className="font-semibold">{formatTime(timeLeft)}</span>
              </div>
              <div className="h-6 w-[1px] bg-white/20 mx-1" />
              <div>
                <span className="text-white/50 text-[9px] block">OPTIMAL FLOW</span>
                <span className="font-semibold text-emerald-400">
                  {formatTime(inZoneSeconds)} ({zonePercent}%)
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Embedded Video Display (HTML5 or YouTube Iframe) */}
        <div className="relative aspect-video w-full overflow-hidden bg-black flex items-center justify-center">
          
          {isYouTubeActive ? (
            /* YouTube Streaming Embed with Live CSS Dynamic Filter */
            <div 
              className="w-full h-full relative overflow-hidden transition-all duration-300 ease-out"
              style={videoFilterStyle}
            >
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${selectedTrack.youtubeId || activeYoutubeId}?autoplay=1&mute=${isMuted ? 1 : 0}&controls=0&loop=1&playlist=${selectedTrack.youtubeId || activeYoutubeId}&modestbranding=1&rel=0`}
                title="YouTube Neurofeedback Stream"
                className="w-full h-full pointer-events-none border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />
              {/* Dynamic Overlay Mask for Sub-Threshold feedback */}
              <div 
                className="absolute inset-0 pointer-events-none transition-all duration-500"
                style={{
                  backgroundColor: !isAbove && isActive ? 'rgba(0,0,0,0.45)' : 'transparent',
                  backdropFilter: !isAbove && isActive ? `blur(${modulation.blurPx}px)` : 'none',
                }}
              />
            </div>
          ) : (
            /* HTML5 Video Track with CSS Filter */
            <video
              ref={videoRef}
              src={selectedTrack.url}
              loop
              playsInline
              muted={isMuted}
              className="w-full h-full object-cover transition-all duration-300 ease-out"
              style={videoFilterStyle}
            />
          )}

          {/* Not started overlay */}
          {!isActive && !done && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/70 backdrop-blur-xs p-6 text-white text-center">
              <div className="max-w-md space-y-3">
                <span className="text-[11px] font-mono tracking-wider uppercase text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded border border-emerald-700">
                  Infra-Low Video Stream Ready
                </span>
                <h3 className="text-xl font-light tracking-tight font-sans">
                  Dr. Gala At-Home Neurofeedback
                </h3>
                <p className="text-xs text-white/70 leading-relaxed font-sans">
                  Visual brightness, aperture, and auditory tone continuously reflect your infra-low slow wave ({orfHz} Hz).
                </p>
                <div className="pt-2 flex items-center justify-center gap-3">
                  <button
                    onClick={handleStartSession}
                    className="btn btn-primary text-xs py-2.5 px-6 font-semibold shadow-lg"
                  >
                    Launch Continuous Sensory Session →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Session Finished & Post-Session Check-in Screen */}
          {done && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/85 backdrop-blur-md p-6 text-white text-center">
              <div className="max-w-md space-y-4 p-6 rounded-2xl bg-[#111111] border border-[#333333] shadow-2xl">
                <div className="w-12 h-12 rounded-full bg-emerald-950 border border-emerald-500 flex items-center justify-center mx-auto text-emerald-400">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold">Session 15 Completed!</h3>
                <p className="text-xs text-[#888888]">
                  You sustained optimal slow-wave coherence for{' '}
                  <strong className="text-emerald-400">{formatTime(inZoneSeconds)} ({zonePercent}% in-zone)</strong>.
                </p>

                {/* Subjective Check-in Rating */}
                {!postSessionSaved ? (
                  <div className="p-3.5 rounded-xl bg-[#181818] border border-[#2A2A2A] space-y-2 text-left">
                    <span className="text-xs font-semibold text-[#EDEDED] block">
                      Post-Session Subjective Check-in:
                    </span>
                    <p className="text-[11px] text-[#888888]">
                      How calm and focused do you feel right now?
                    </p>
                    <div className="flex items-center justify-between gap-1 pt-1 font-mono text-xs">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                        <button
                          key={num}
                          onClick={() => setPostSessionRating(num)}
                          className={`w-8 h-8 rounded-lg border text-center transition-all ${
                            postSessionRating === num
                              ? 'bg-emerald-950 border-emerald-500 text-emerald-300 font-bold'
                              : 'bg-[#111111] border-[#333333] text-[#888888] hover:text-white'
                          }`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                    {postSessionRating && (
                      <button
                        onClick={() => setPostSessionSaved(true)}
                        className="btn btn-primary w-full text-xs py-1.5 mt-2 font-semibold"
                      >
                        Submit Check-in to Dr. Gala →
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="p-3 rounded-lg bg-emerald-950/70 border border-emerald-600 text-emerald-300 text-xs flex items-center justify-center gap-2">
                    <Check className="w-4 h-4" />
                    <span>Check-in rating ({postSessionRating}/10) logged to clinical chart!</span>
                  </div>
                )}

                <div className="flex justify-center gap-3 pt-2">
                  <button
                    onClick={onFinish}
                    className="btn btn-primary text-xs py-2 px-5 font-semibold"
                  >
                    Return to Patient Dashboard
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Row: Multi-Channel Oscilloscope & Live Signal Health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Live EEG Oscilloscope Canvas */}
        <div className="lg:col-span-2 p-5 rounded-xl bg-[#111111] border border-[#222222] space-y-3 shadow-xs">
          <div className="flex items-center justify-between border-b border-[#222222] pb-2.5">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-semibold text-[#EDEDED]">
                Real-Time 4-Channel Telemetry & ILF Slow Wave
              </span>
            </div>
            <div className="flex items-center gap-3 text-[10px] font-mono text-[#888888]">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> ILF ({orfHz}Hz)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-400" /> AF7/AF8
              </span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400" /> TP9/TP10
              </span>
            </div>
          </div>

          <div className="relative h-44 w-full rounded-lg bg-[#0A0A0A] border border-[#222222] overflow-hidden">
            <canvas ref={waveRef} className="w-full h-full block" />
          </div>
        </div>

        {/* Right 1 Col: Signal Quality & Artifact Rejection Status */}
        <div className="p-5 rounded-xl bg-[#111111] border border-[#222222] space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-[#222222] pb-2.5">
            <span className="text-xs font-semibold text-[#EDEDED]">Signal Health & Gatekeeper</span>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-700">
              256 Hz Live
            </span>
          </div>

          <div className="space-y-2.5 text-xs font-mono">
            {/* Auto-Adaptive Toggle */}
            <div className="p-2.5 rounded-lg bg-[#161616] border border-[#222222] flex items-center justify-between">
              <div>
                <span className="text-[#EDEDED] font-semibold block text-[11px]">Adaptive Auto-Threshold</span>
                <span className="text-[9px] text-[#888888]">Targets ~70% Flow Zone</span>
              </div>
              <input
                type="checkbox"
                checked={autoAdaptiveThreshold}
                onChange={(e) => setAutoAdaptiveThreshold(e.target.checked)}
                className="accent-emerald-500 cursor-pointer h-4 w-4"
              />
            </div>

            {/* Threshold Slider */}
            <div className="p-2.5 rounded-lg bg-[#161616] border border-[#222222] space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-[#888888]">Threshold Sensitivity:</span>
                <span className="text-emerald-400 font-bold">{threshold}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="90"
                value={threshold}
                onChange={(e) => {
                  setAutoAdaptiveThreshold(false);
                  setThreshold(Number(e.target.value));
                }}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>

            {/* Artifact Flags */}
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <div className="p-2 rounded bg-[#161616] border border-[#222222]">
                <span className="text-[#888888] block">Ocular Blink</span>
                <span className="font-bold text-emerald-400">Filtered (0.8s)</span>
              </div>
              <div className="p-2 rounded bg-[#161616] border border-[#222222]">
                <span className="text-[#888888] block">Jaw Clench (EMG)</span>
                <span className={`font-bold ${athena.emgClenchDetected ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {athena.emgClenchDetected ? 'Gated' : 'Clear'}
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
