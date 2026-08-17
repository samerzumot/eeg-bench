import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Pause, Volume2, VolumeX, Sliders,
  CheckCircle2, ArrowLeft, ShieldCheck, AlertCircle, Info, RefreshCw, Eye, EyeOff
} from 'lucide-react';
import confetti from 'canvas-confetti';

const THERAPEUTIC_TRACKS = [
  {
    id: 'nature_stream',
    title: 'Dr. Gala ILF Mountain Flow',
    desc: 'High-definition relaxing nature river and mountain canopy (Optimal for SMR/Alpha)',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
  },
  {
    id: 'ocean_alpha',
    title: 'Oceanic Alpha Wave Coherence',
    desc: 'Calming ocean swell and shoreline rhythm (Optimal for Autonomic Down-regulation)',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4'
  },
  {
    id: 'forest_canopy',
    title: 'Forest Sunlight Meditation',
    desc: 'Gentle wind through sunlight trees (Optimal for ADHD Attentional Anchoring)',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4'
  },
  {
    id: 'sunset_flow',
    title: 'Sunset Slow-Wave Horizon',
    desc: 'Infra-low sunset transition for parasympathetic soothing',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4'
  }
];

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
  const [customUrl, setCustomUrl] = useState('');
  const [showTrackPicker, setShowTrackPicker] = useState(false);

  // Protocols & Thresholds
  const [protocolType, setProtocolType] = useState(
    client?.indication?.toLowerCase().includes('anxiety') ? 'anxiety' : 'adhd'
  );
  const [threshold, setThreshold] = useState(client?.protocolSensitivity || 65);
  const [feedbackMode, setFeedbackMode] = useState('graded'); // 'graded' | 'stealth_dim' | 'discrete'
  const [isMuted, setIsMuted] = useState(false);

  // Current Brain Metrics
  const focus = eegState?.focusScore || 82;
  const calm = eegState?.calmScore || 80;
  const orfHz = eegState?.optimalResponseFrequencyHz || 0.005;

  // Determine if patient meets target protocol threshold
  const currentMetric = protocolType === 'adhd' 
    ? focus 
    : protocolType === 'anxiety' 
      ? calm 
      : Math.round((focus + calm) / 2);

  const isAbove = currentMetric >= threshold;

  // Direct HTML5 Video Modulation Calculations
  const modulation = eegState?.modulation || {
    brightnessPct: isAbove ? 100 : 40,
    blurPx: isAbove ? 0 : 5,
    apertureScale: isAbove ? 1.0 : 0.95,
    volumePct: isAbove ? 100 : 20,
    isInZone: isAbove,
  };

  // Direct Video Control Handler
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
        // Continuous Graded Mode: Video plays continuously, visual filters & volume modulate smoothly
        if (video.paused) {
          video.play().catch(() => {});
        }
      }

      // Audio volume modulation
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
  }, [isActive, done, isAbove, feedbackMode, modulation.volumePct, isMuted]);

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

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const zonePercent = totalElapsedSeconds > 0 
    ? Math.round((inZoneSeconds / totalElapsedSeconds) * 100) 
    : 0;

  // Compute CSS filter for video element
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
        filter: isActive && !isAbove ? 'blur(4px) brightness(35%)' : 'none',
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

    // Background grid
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

  const bandPowers = eegState?.bandPowers || { delta: 12, theta: 14, alpha: 48, beta: 20, gamma: 4 };

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
          {/* Protocol Type Selector */}
          <div className="flex items-center p-1 bg-[#161616] rounded-lg border border-[#333333] text-xs font-mono">
            <button
              onClick={() => setProtocolType('adhd')}
              className={`px-2.5 py-1 rounded transition-all ${
                protocolType === 'adhd'
                  ? 'bg-[#2E6F65] text-white font-semibold shadow-xs'
                  : 'text-[#888888] hover:text-[#EDEDED]'
              }`}
            >
              ADHD Focus
            </button>
            <button
              onClick={() => setProtocolType('anxiety')}
              className={`px-2.5 py-1 rounded transition-all ${
                protocolType === 'anxiety'
                  ? 'bg-[#2E6F65] text-white font-semibold shadow-xs'
                  : 'text-[#888888] hover:text-[#EDEDED]'
              }`}
            >
              Anxiety Calm
            </button>
          </div>

          {/* Feedback Mode */}
          <div className="flex items-center p-1 bg-[#161616] rounded-lg border border-[#333333] text-xs font-mono">
            <button
              onClick={() => setFeedbackMode('graded')}
              className={`px-2.5 py-1 rounded transition-all ${
                feedbackMode === 'graded'
                  ? 'bg-[#2E6F65] text-white font-semibold shadow-xs'
                  : 'text-[#888888] hover:text-[#EDEDED]'
              }`}
              title="Continuous graded luminance, aperture and volume"
            >
              Graded Flow
            </button>
            <button
              onClick={() => setFeedbackMode('discrete')}
              className={`px-2.5 py-1 rounded transition-all ${
                feedbackMode === 'discrete'
                  ? 'bg-[#2E6F65] text-white font-semibold shadow-xs'
                  : 'text-[#888888] hover:text-[#EDEDED]'
              }`}
              title="Operant Play/Pause"
            >
              Play/Pause
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
                    ? 'Somatic Muscle Tension (Gated)'
                    : 'Sub-Threshold Slow-Wave Reflection'}
                </p>
                <p className="text-[10px] text-white/70 font-sans leading-none mt-0.5">
                  {protocolType === 'adhd'
                    ? `Focus: ${focus}% (Threshold >= ${threshold}%)`
                    : `Calm: ${calm}% (Threshold >= ${threshold}%)`} · Brightness: {modulation.brightnessPct}% · Volume: {modulation.volumePct}%
                </p>
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

        {/* Embedded HTML5 Video Stream with Real-time CSS Filter */}
        <div className="relative aspect-video w-full overflow-hidden bg-black flex items-center justify-center">
          <video
            ref={videoRef}
            src={selectedTrack.url}
            loop
            playsInline
            muted={isMuted}
            className="w-full h-full object-cover transition-all duration-300 ease-out"
            style={videoFilterStyle}
          />

          {/* Not started overlay */}
          {!isActive && !done && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/70 backdrop-blur-xs p-6 text-white text-center">
              <div className="max-w-md space-y-3">
                <span className="text-[11px] font-mono tracking-wider uppercase text-amber-400 bg-amber-950/80 px-2.5 py-1 rounded border border-amber-600">
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
                    Begin Session
                  </button>
                  <button
                    onClick={() => setShowTrackPicker(!showTrackPicker)}
                    className="btn btn-outline text-xs py-2.5 px-4"
                  >
                    Select Video Track
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Track Picker Drawer */}
          {showTrackPicker && (
            <div className="absolute inset-0 z-30 bg-black/85 backdrop-blur-md p-6 flex flex-col justify-center max-w-lg mx-auto">
              <h4 className="text-sm font-semibold text-[#EDEDED] mb-3">
                Choose Therapeutic Video Stream
              </h4>
              <div className="space-y-2">
                {THERAPEUTIC_TRACKS.map(t => (
                  <div
                    key={t.id}
                    onClick={() => {
                      setSelectedTrack(t);
                      setShowTrackPicker(false);
                    }}
                    className={`p-3 rounded-lg border text-left cursor-pointer transition-all ${
                      selectedTrack.id === t.id
                        ? 'bg-[#1A332F] border-emerald-500 text-white'
                        : 'bg-[#141414] border-[#333333] hover:bg-[#1C1C1C]'
                    }`}
                  >
                    <span className="text-xs font-semibold block">{t.title}</span>
                    <span className="text-[11px] text-[#888888] block mt-0.5">{t.desc}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setShowTrackPicker(false)}
                className="mt-4 text-xs text-[#888888] hover:text-[#EDEDED] text-center"
              >
                Close
              </button>
            </div>
          )}
        </div>

        {/* Athena Telemetry Status Bar */}
        <div className="p-3 bg-[#0A0C10] border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-white/80">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] text-white/50 uppercase">Athena Sensor Fusion:</span>
            <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              EOG Blink Rejection: Active
            </span>
            <span
              className={`px-2 py-0.5 rounded border text-[10px] flex items-center gap-1 ${
                athena.emgClenchDetected
                  ? 'bg-rose-950/60 border-rose-600 text-rose-400 font-bold'
                  : 'bg-white/5 border-white/10 text-emerald-400'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${athena.emgClenchDetected ? 'bg-rose-400' : 'bg-emerald-400'}`} />
              EMG Somatic Inhibit: {athena.emgClenchDetected ? 'Jaw Clench Filtered' : 'Relaxed'}
            </span>
            <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] text-emerald-400">
              6-Axis IMU Stillness: {athena.imuHeadStabilityPercent}%
            </span>
            <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] text-emerald-400">
              HRV Autonomic: {athena.hrvAutonomicCoherence}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] text-amber-400">DC Slow Potential:</span>
            <span className="font-semibold text-white font-mono">{athena.dcPotentialOffsetMv} mV</span>
          </div>
        </div>
      </div>

      {/* Multi-Channel Oscilloscope & Band Spectrum */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-5 rounded-xl bg-[#111111] border border-[#222222] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-semibold text-[#EDEDED]">
                Multi-Channel Oscilloscope & ILF Slow Wave
              </h3>
              <p className="text-xs text-[#888888]">
                Infra-low potential ({orfHz} Hz) + 4-channel telemetry (AF7, AF8, TP9, TP10)
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              {[0.002, 0.005, 0.012, 0.020].map(hz => (
                <button
                  key={hz}
                  onClick={() => mockService?.setOptimalResponseFrequency(hz)}
                  className={`text-[10px] font-mono px-2 py-0.5 rounded border transition-all ${
                    orfHz === hz
                      ? 'bg-amber-950/80 border-amber-600 text-amber-400 font-semibold'
                      : 'bg-[#161616] border-[#333333] text-[#888888] hover:text-[#EDEDED]'
                  }`}
                >
                  {hz}Hz
                </button>
              ))}
            </div>
          </div>
          <div className="h-44">
            <canvas ref={waveRef} className="w-full h-full block rounded-lg" />
          </div>
        </div>

        {/* 5-Band Spectral Power Distribution */}
        <div className="p-5 rounded-xl bg-[#111111] border border-[#222222] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-[#EDEDED]">Frequency Power Bands</h3>
            <span className="text-[10px] font-mono text-[#888888]">Welch PSD</span>
          </div>

          <div className="space-y-2.5 font-mono text-xs">
            {[
              { label: 'Delta (0.5–4 Hz)', val: bandPowers.delta, color: 'bg-slate-500' },
              { label: 'Theta (4–8 Hz)', val: bandPowers.theta, color: bandPowers.theta > 25 ? 'bg-amber-500' : 'bg-blue-500' },
              { label: 'Alpha (8–12 Hz)', val: bandPowers.alpha, color: 'bg-emerald-400' },
              { label: 'Beta / SMR (12–30 Hz)', val: bandPowers.beta, color: 'bg-cyan-400' },
              { label: 'Gamma (30–45 Hz)', val: bandPowers.gamma, color: 'bg-indigo-400' },
            ].map(b => (
              <div key={b.label} className="p-2 rounded-lg bg-[#161616] border border-[#222222]">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-[#888888]">{b.label}</span>
                  <span className="font-semibold text-[#EDEDED]">{Math.round(b.val)}%</span>
                </div>
                <div className="w-full bg-[#222222] rounded-full h-1.5 mt-1 overflow-hidden">
                  <div
                    className={`${b.color} h-full rounded-full transition-all duration-300`}
                    style={{ width: `${Math.min(100, b.val * 1.8)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Live Presentation Simulator Controls (Clean, Minimalist, No Emojis) */}
      <div className="p-5 rounded-xl bg-[#111111] border border-[#333333] shadow-xs space-y-4 font-mono text-xs">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#222222] pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-semibold text-[#EDEDED] font-sans text-sm">
                Live State Controller & Simulator
              </span>
              <span className="text-[10px] text-[#888888] bg-[#161616] px-2 py-0.5 rounded border border-[#222222]">
                Instant Response Demo
              </span>
            </div>
            <p className="text-xs text-[#888888] mt-0.5 font-sans">
              Click any clinical state or drag continuous sliders to evaluate immediate video blur, dimming, and audio modulation
            </p>
          </div>
        </div>

        {/* 4 State Trigger Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { 
              mode: 'ilf_flow', 
              title: 'Balanced ILF Flow', 
              score: '88%',
              desc: '100% Brightness & Volume',
              cls: 'bg-emerald-950/70 text-emerald-300 border-emerald-600' 
            },
            { 
              mode: 'deep_calm', 
              title: 'Deep Parasympathetic Calm', 
              score: '94%',
              desc: 'High Alpha Synchrony',
              cls: 'bg-cyan-950/70 text-cyan-300 border-cyan-600' 
            },
            { 
              mode: 'attentional_drift', 
              title: 'Attentional Theta Drift', 
              score: '34%',
              desc: 'Graded Dim & Blur Triggered',
              cls: 'bg-amber-950/70 text-amber-300 border-amber-600' 
            },
            { 
              mode: 'somatic_tension', 
              title: 'Somatic Muscle Tension', 
              score: '24%',
              desc: 'EMG Jaw Inhibit Active',
              cls: 'bg-rose-950/70 text-rose-300 border-rose-600' 
            }
          ].map(b => (
            <button
              key={b.mode}
              onClick={() => mockService?.setMode(b.mode)}
              className={`p-3 rounded-xl border text-left transition-all ${
                eegState?.mode === b.mode ? b.cls + ' shadow-xs font-semibold' : 'bg-[#161616] text-[#EDEDED] border-[#222222] hover:bg-[#202020]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold">{b.title}</span>
                <span className="text-[11px] font-bold">{b.score}</span>
              </div>
              <span className="text-[10px] text-[#888888] block mt-1">{b.desc}</span>
            </button>
          ))}
        </div>

        {/* Live Manual Sliders */}
        <div className="pt-2 border-t border-[#222222] grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-3 rounded-xl bg-[#161616] border border-[#222222]">
            <div className="flex items-center justify-between text-xs mb-1.5 font-sans">
              <span className="text-[#888888]">Continuous Focus Score:</span>
              <span className="font-bold text-[#EDEDED] font-mono">{focus}%</span>
            </div>
            <input 
              type="range" 
              min="10" 
              max="98" 
              value={focus} 
              onChange={(e) => mockService?.setManualScores(Number(e.target.value), calm)}
              className="w-full accent-emerald-500 cursor-pointer"
            />
          </div>

          <div className="p-3 rounded-xl bg-[#161616] border border-[#222222]">
            <div className="flex items-center justify-between text-xs mb-1.5 font-sans">
              <span className="text-[#888888]">Continuous Calm Score:</span>
              <span className="font-bold text-[#EDEDED] font-mono">{calm}%</span>
            </div>
            <input 
              type="range" 
              min="10" 
              max="98" 
              value={calm} 
              onChange={(e) => mockService?.setManualScores(focus, Number(e.target.value))}
              className="w-full accent-cyan-500 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Completion Modal */}
      {done && (
        <div className="fixed inset-0 z-50 bg-[#000000]/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="max-w-md w-full p-8 rounded-xl bg-[#111111] border border-[#333333] shadow-2xl text-center space-y-6">
            <div className="w-14 h-14 rounded-full bg-emerald-950/80 border border-emerald-600 mx-auto flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <div>
              <span className="text-[11px] uppercase tracking-widest text-emerald-400 font-mono font-semibold">
                NEUROPLASTIC TARGET MET
              </span>
              <h3 className="text-2xl font-light text-[#EDEDED] tracking-tight font-sans mt-1">
                Therapy Session Complete
              </h3>
              <p className="text-xs text-[#888888] mt-1.5 leading-relaxed font-sans">
                You maintained optimal slow-wave flow for <strong>{zonePercent}%</strong> of today&apos;s prescribed session.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2.5 font-mono">
              <div className="bg-[#000000] border border-[#222222] rounded-lg p-3 text-center">
                <span className="text-[9px] text-[#888888] uppercase block">In Zone</span>
                <span className="text-xl font-bold text-emerald-400">{zonePercent}%</span>
              </div>
              <div className="bg-[#000000] border border-[#222222] rounded-lg p-3 text-center">
                <span className="text-[9px] text-[#888888] uppercase block">Avg Focus</span>
                <span className="text-xl font-bold text-[#EDEDED]">{focus}%</span>
              </div>
              <div className="bg-[#000000] border border-[#222222] rounded-lg p-3 text-center">
                <span className="text-[9px] text-[#888888] uppercase block">Avg Calm</span>
                <span className="text-xl font-bold text-[#EDEDED]">{calm}%</span>
              </div>
            </div>

            <button 
              onClick={() => {
                setDone(false);
                onFinish();
              }}
              className="btn btn-primary w-full py-3 rounded-lg text-xs font-semibold"
            >
              Save Record & Return to Portal →
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
