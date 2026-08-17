"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { PatientProfile } from "@/lib/evolve/patientStore";
import { EegTelemetryState, BrainStateMode, mockEeg } from "@/lib/evolve/mockEegService";

interface NeurofeedbackEngineProps {
  patient: PatientProfile;
  onFinishSession: (inZonePercent: number) => void;
  onBackToDashboard: () => void;
  onOpenDemo?: () => void;
}

export function NeurofeedbackEngine({
  patient,
  onFinishSession,
  onBackToDashboard,
  onOpenDemo,
}: NeurofeedbackEngineProps) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);

  const [videoSource, setVideoSource] = useState<"youtube" | "local">("youtube");
  const [eegState, setEegState] = useState<EegTelemetryState>(() => ({
    focusScore: 86,
    calmScore: 84,
    targetCoherence: 85,
    mode: "ilf_flow",
    signalQuality: { tp9: "optimal", af7: "optimal", af8: "optimal", tp10: "optimal" },
    bandPowers: { delta: 12, theta: 14, alpha: 48, beta: 20, gamma: 4 },
    optimalResponseFrequencyHz: patient.optimalResponseFrequencyHz || 0.005,
    infraLowSlowWaveVal: 0.72,
    athena: {
      eogBlinkFilterActive: true,
      emgClenchDetected: false,
      imuHeadStabilityPercent: 98,
      hrvAutonomicCoherence: 0.86,
      dcPotentialOffsetMv: -4.2,
    },
    modulation: {
      brightnessPct: 100,
      blurPx: 0,
      apertureScale: 1.0,
      volumePct: 100,
      isInZone: true,
    },
    rawSamples: { tp9: [], af7: [], af8: [], tp10: [], ilfSlowWave: [] },
  }));

  // Session state
  const [isSessionActive, setIsSessionActive] = useState<boolean>(true);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(15 * 60);
  const [inZoneSeconds, setInZoneSeconds] = useState<number>(0);
  const [totalElapsedSeconds, setTotalElapsedSeconds] = useState<number>(0);
  const [isDone, setIsDone] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [origin, setOrigin] = useState<string>("https://evolvebraintraining.vercel.app");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
  }, []);

  // Subscribe to EEG telemetry service
  useEffect(() => {
    mockEeg.setOptimalResponseFrequency(patient.optimalResponseFrequencyHz || 0.005);
    mockEeg.start(45);
    const unsubscribe = mockEeg.subscribe((state) => {
      setEegState(state);
    });
    return () => {
      unsubscribe();
    };
  }, [patient.optimalResponseFrequencyHz]);

  // Send command to YouTube iframe safely
  const sendYouTubeCommand = useCallback((func: string, args: any[] = []) => {
    try {
      if (iframeRef.current && iframeRef.current.contentWindow) {
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({ event: "command", func, args }),
          "*"
        );
      }
    } catch {
      // Ignore cross-origin postMessage errors
    }
  }, []);

  // Video modulation effect (brightness, blur, audio volume, play/pause)
  useEffect(() => {
    if (videoSource === "youtube") {
      if (isSessionActive && !isDone) {
        sendYouTubeCommand("playVideo");
        if (isMuted) {
          sendYouTubeCommand("mute");
        } else {
          sendYouTubeCommand("unMute");
          sendYouTubeCommand("setVolume", [Math.max(15, eegState.modulation.volumePct)]);
        }
      } else {
        sendYouTubeCommand("pauseVideo");
      }
    } else {
      const vid = localVideoRef.current;
      if (vid) {
        if (isSessionActive && !isDone) {
          if (vid.paused) vid.play().catch(() => {});
          vid.muted = isMuted;
          if (!isMuted) {
            vid.volume = Math.min(1.0, Math.max(0.1, eegState.modulation.volumePct / 100));
          }
        } else {
          if (!vid.paused) vid.pause();
        }
      }
    }
  }, [isSessionActive, isDone, eegState.modulation.volumePct, isMuted, videoSource, sendYouTubeCommand]);

  // Session timer
  useEffect(() => {
    if (!isSessionActive || isDone) return;

    const timer = setInterval(() => {
      setTotalElapsedSeconds((prev) => prev + 1);
      if (eegState.modulation.isInZone) {
        setInZoneSeconds((prev) => prev + 1);
      }

      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsDone(true);
          setIsSessionActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isSessionActive, isDone, eegState.modulation.isInZone]);

  const inZonePercent =
    totalElapsedSeconds > 0 ? Math.round((inZoneSeconds / totalElapsedSeconds) * 100) : 0;

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleStartSession = () => {
    setIsSessionActive(true);
    setIsDone(false);
    sendYouTubeCommand("playVideo");
  };

  const handlePauseSession = () => {
    setIsSessionActive(false);
    sendYouTubeCommand("pauseVideo");
  };

  const handleTriggerState = (mode: BrainStateMode) => {
    mockEeg.setMode(mode);
    if (videoSource === "youtube") {
      sendYouTubeCommand("playVideo");
    }
  };

  // Dynamic visual filter applied to the video frame
  const visualFilterStyle = {
    filter: `brightness(${eegState.modulation.brightnessPct}%) blur(${eegState.modulation.blurPx}px)`,
    transform: `scale(${eegState.modulation.apertureScale})`,
    transition: "all 0.35s ease-out",
  };

  const youtubeEmbedUrl = `https://www.youtube.com/embed/cC9r0jHF-Fw?enablejsapi=1&start=901&autoplay=1&mute=${isMuted ? 1 : 0}&controls=1&rel=0&playsinline=1&origin=${origin}`;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Header & Patient Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-surface border border-border">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToDashboard}
            className="p-1.5 rounded-lg border border-border hover:bg-white transition-all text-text-secondary hover:text-text-primary"
            title="Return to Dashboard"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-text-primary">
                Daily Neurofeedback Session
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 font-medium">
                {patient.name} · {patient.indication}
              </span>
            </div>
            <p className="text-xs text-text-secondary">
              Dr. Upasana Gala&apos;s Calming & Focus Protocol
            </p>
          </div>
        </div>

        {/* Player controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Sound toggle */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`btn text-xs py-1.5 px-3 rounded-lg border flex items-center gap-1.5 transition-all ${
              !isMuted
                ? "bg-teal-50 border-teal-300 text-teal-800 font-medium"
                : "bg-white border-border text-text-secondary hover:text-text-primary"
            }`}
          >
            {!isMuted ? (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
                </svg>
                <span>Sound: Active</span>
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                  <line x1="23" y1="9" x2="17" y2="15" />
                  <line x1="17" y1="9" x2="23" y2="15" />
                </svg>
                <span>Sound: Muted</span>
              </>
            )}
          </button>

          {/* Session Play / Pause */}
          {!isSessionActive ? (
            <button
              onClick={handleStartSession}
              className="btn btn-primary text-xs py-2 px-4 font-semibold shadow-sm flex items-center gap-1.5"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              <span>Resume Session</span>
            </button>
          ) : (
            <button
              onClick={handlePauseSession}
              className="btn btn-outline text-xs py-2 px-4 font-semibold flex items-center gap-1.5"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="4" width="4" height="16" />
                <rect x="14" y="4" width="4" height="16" />
              </svg>
              <span>Pause</span>
            </button>
          )}

          {/* Video track switch */}
          <button
            onClick={() => setVideoSource(videoSource === "youtube" ? "local" : "youtube")}
            className="btn btn-outline text-xs py-1.5 px-2.5 text-text-secondary"
            title="Switch between YouTube therapy video and ambient nature loop"
          >
            {videoSource === "youtube" ? "Switch to Nature Loop" : "Switch to YouTube (15:01)"}
          </button>
        </div>
      </div>

      {/* Main Video Therapy Frame */}
      <div className="relative rounded-2xl overflow-hidden bg-black border border-border-strong shadow-xl">
        {/* Simple Friendly Telemetry Badge */}
        <div className="absolute top-4 left-4 right-4 z-30 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
          <div className="pointer-events-auto flex items-center gap-2.5 px-4 py-2 rounded-xl bg-black/80 backdrop-blur-md border border-white/15 text-white shadow-lg">
            <span
              className={`w-3 h-3 rounded-full ${
                eegState.modulation.isInZone
                  ? "bg-teal-400 animate-pulse shadow-[0_0_10px_#2dd4bf]"
                  : "bg-amber-400 shadow-[0_0_10px_#f59e0b]"
              }`}
            />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide leading-tight">
                {eegState.modulation.isInZone
                  ? "In The Zone (Optimal Focus & Calm)"
                  : "Gentle Reminder: Relax & Breathe"}
              </p>
              <p className="text-[11px] text-white/75 font-sans mt-0.5">
                {eegState.modulation.isInZone
                  ? "Video is bright and clear · Keep holding this relaxed state"
                  : "Video is gently softening · Take a slow, deep breath to refocus"}
              </p>
            </div>
          </div>

          <div className="pointer-events-auto flex items-center gap-3 px-4 py-2 rounded-xl bg-black/80 backdrop-blur-md border border-white/15 text-white text-xs font-data shadow-lg">
            <div>
              <span className="text-white/60 text-[10px] block">Time Left</span>
              <span className="font-semibold text-white text-sm">{formatTime(secondsRemaining)}</span>
            </div>
            <div className="h-6 w-[1px] bg-white/20 mx-1" />
            <div>
              <span className="text-white/60 text-[10px] block">Time In Zone</span>
              <span className="font-semibold text-teal-400 text-sm">
                {formatTime(inZoneSeconds)} ({inZonePercent}%)
              </span>
            </div>
          </div>
        </div>

        {/* Video Container with Dynamic CSS Filter & Protective Glass Overlay */}
        <div className="relative aspect-video w-full overflow-hidden bg-black flex items-center justify-center select-none">
          {videoSource === "youtube" ? (
            <iframe
              ref={iframeRef}
              src={`https://www.youtube-nocookie.com/embed/cC9r0jHF-Fw?enablejsapi=1&start=901&autoplay=1&mute=${isMuted ? 1 : 0}&controls=0&disablekb=1&fs=0&rel=0&iv_load_policy=3&modestbranding=1&playsinline=1&origin=${origin}`}
              title="Dr. Gala Neurofeedback Therapy Video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              className="w-full h-full border-0 pointer-events-none transition-all duration-300 ease-out"
              style={visualFilterStyle}
            />
          ) : (
            <video
              ref={localVideoRef}
              src="/evolve/therapy-flow.mp4"
              autoPlay
              loop
              muted={isMuted}
              playsInline
              className="w-full h-full object-cover pointer-events-none transition-all duration-300 ease-out"
              style={visualFilterStyle}
            />
          )}

          {/* Protective Transparent Interactive Shield (User is purely a consumer) */}
          <div className="absolute inset-0 z-20 bg-transparent cursor-default pointer-events-auto" />
        </div>

        {/* Bottom Simple Status Bar */}
        <div className="p-3 bg-surface border-t border-border flex flex-wrap items-center justify-between gap-3 text-xs text-text-secondary">
          <div className="flex items-center gap-2">
            <span className="font-medium text-text-primary">Therapy Video:</span>
            <span>https://youtu.be/cC9r0jHF-Fw (at 15:01)</span>
          </div>

          <div className="flex items-center gap-3 font-medium">
            <span>Video Clarity: <strong className="text-text-primary">{eegState.modulation.brightnessPct}%</strong></span>
            <span>Softness Blur: <strong className="text-text-primary">{eegState.modulation.blurPx}px</strong></span>
          </div>
        </div>
      </div>

      {/* Interactive Demonstration Controls (Simple, Friendly & Human) */}
      <div className="card p-5 border-border-strong space-y-4">
        <div className="border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
            <h3 className="text-sm font-semibold text-text-primary">
              Live Neurofeedback Demo Controls
            </h3>
            <span className="text-[10px] px-2 py-0.5 rounded bg-teal-50 border border-teal-200 text-teal-800 font-medium">
              Interactive Test
            </span>
          </div>
          <p className="text-xs text-text-secondary mt-0.5">
            Click any button below to see how the video automatically blurs, dims, or clears in response to brain states:
          </p>
        </div>

        {/* 4 User-Friendly State Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            {
              mode: "ilf_flow" as BrainStateMode,
              title: "Focused & In-Zone",
              score: "88% Focus",
              effect: "Video Stays 100% Bright & Sharp",
              activeClass: "bg-teal-50 border-teal-500 text-teal-900 ring-1 ring-teal-400",
            },
            {
              mode: "deep_calm" as BrainStateMode,
              title: "Calm & Relaxed",
              score: "94% Calm",
              effect: "Video Stays 100% Bright & Clear",
              activeClass: "bg-teal-50 border-teal-500 text-teal-900 ring-1 ring-teal-400",
            },
            {
              mode: "attentional_drift" as BrainStateMode,
              title: "Losing Focus / Mind Wandering",
              score: "34% Focus",
              effect: "Video Dims & Gently Blurs (5px)",
              activeClass: "bg-amber-50 border-amber-500 text-amber-900 ring-1 ring-amber-400",
            },
            {
              mode: "somatic_tension" as BrainStateMode,
              title: "Stress / Jaw Clench",
              score: "24% Calm",
              effect: "Video Dims to 25% & Blurs (8px)",
              activeClass: "bg-rose-50 border-rose-500 text-rose-900 ring-1 ring-rose-400",
            },
          ].map((btn) => {
            const isCurrent = eegState.mode === btn.mode;
            return (
              <button
                key={btn.mode}
                onClick={() => handleTriggerState(btn.mode)}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  isCurrent
                    ? btn.activeClass
                    : "bg-surface border-border hover:border-border-strong hover:bg-white text-text-primary"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold">{btn.title}</span>
                  <span className="text-[11px] font-mono">{btn.score}</span>
                </div>
                <div className="text-[11px] text-text-secondary mt-1">
                  {btn.effect}
                </div>
              </button>
            );
          })}
        </div>

        {/* Continuous Slider */}
        <div className="pt-2 border-t border-border">
          <div className="p-3.5 rounded-xl bg-surface border border-border">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-medium text-text-primary">Live Focus Level Slider:</span>
              <span className="font-data font-bold text-accent">{eegState.focusScore}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="98"
              value={eegState.focusScore}
              onChange={(e) => {
                mockEeg.setManualScores(Number(e.target.value), eegState.calmScore);
                if (videoSource === "youtube") {
                  sendYouTubeCommand("playVideo");
                }
              }}
              className="w-full accent-accent cursor-pointer"
            />
            <div className="flex items-center justify-between text-[10px] text-text-secondary mt-1">
              <span>10% (Blurred & Dim)</span>
              <span>65% (Threshold)</span>
              <span>100% (Crisp & Bright)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Session Completion Modal */}
      {isDone && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fade-in">
          <div className="card max-w-md w-full p-8 bg-white border border-border-strong shadow-2xl text-center space-y-5">
            <div className="w-12 h-12 rounded-full bg-teal-50 border border-teal-200 mx-auto flex items-center justify-center text-teal-700">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>

            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-accent font-semibold">
                TODAY&apos;S SESSION FINISHED
              </span>
              <h3 className="text-xl font-light text-text-primary mt-1">
                Great Job, {patient.name}!
              </h3>
              <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                You maintained focused flow for <strong>{inZonePercent}%</strong> of today&apos;s session. Your results have been saved to Dr. Gala&apos;s clinic portal.
              </p>
            </div>

            <button
              onClick={() => {
                setIsDone(false);
                onFinishSession(inZonePercent);
              }}
              className="btn btn-primary w-full py-2.5 text-xs font-semibold"
            >
              Save & Return to Dashboard →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
