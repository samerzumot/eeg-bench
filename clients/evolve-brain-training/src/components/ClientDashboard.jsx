import React, { useState } from 'react';
import { 
  Play, CheckCircle2, Award, TrendingUp, 
  Share2, Check, Sparkles, Brain, Flame
} from 'lucide-react';

export function ClientDashboard({ 
  client, 
  clients,
  onSelectClient,
  onStartSession, 
  isHeadbandConnected,
  onOpenDemo
}) {
  const [copied, setCopied] = useState(false);
  const compliancePercent = Math.round((client.completedSessions / client.totalPrescribed) * 100);

  const handleCopyShareLink = () => {
    const url = `${window.location.origin}/?patient=${client.id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const isAnxiety = client.indication.toLowerCase().includes('anxiety');

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 space-y-6 text-[#EDEDED] font-sans">
      
      {/* Patient Switcher & Clinical Context Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-[#111111] border border-[#222222] shadow-xs">
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-[#888888]">Active Patient:</span>
          <select 
            value={client.id}
            onChange={(e) => onSelectClient && onSelectClient(e.target.value)}
            className="bg-[#161616] border border-[#333333] text-[#EDEDED] font-semibold rounded-md px-2.5 py-1 text-xs focus:outline-none focus:border-[#555555]"
          >
            {clients?.map(c => (
              <option key={c.id} value={c.id}>
                {c.name} — {c.indication} ({c.id})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          {onOpenDemo && (
            <button
              onClick={onOpenDemo}
              className="btn btn-pill-subtle text-[11px] font-mono py-1 px-3 flex items-center gap-1.5 border-emerald-800/80 text-emerald-300 bg-emerald-950/40 hover:bg-emerald-950/80"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Doctor Demo Tour</span>
            </button>
          )}

          <button
            onClick={handleCopyShareLink}
            className="btn btn-pill-subtle text-[11px] font-mono py-1 px-3 flex items-center gap-1.5"
            title="Copy shareable link for this patient"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5 text-[#888888]" />}
            <span>{copied ? 'Link Copied!' : 'Share Patient Link'}</span>
          </button>
        </div>
      </div>

      {/* Hero: Welcome & Dr. Upasana Gala's Prescription */}
      <section className="p-6 sm:p-8 rounded-xl bg-[#111111] border border-[#222222] shadow-xs space-y-6">
        
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-800/60 text-[11px] font-mono text-emerald-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Infra-Low Frequency (ILF) Protocol · Supervised Continuation</span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-light tracking-tight text-[#EDEDED]">
              Welcome back, {client.name}
            </h1>
            
            <p className="text-xs sm:text-sm text-[#888888] leading-relaxed">
              Your personalized at-home neurofeedback protocol prescribed by <strong>Dr. Upasana Gala</strong> (Founder & Managing Director of Evolve Brain Training) is ready.
            </p>
          </div>

          {/* Dr. Gala Profile Badge */}
          <div className="flex items-center gap-3.5 p-3 rounded-xl bg-[#161616] border border-[#222222] shrink-0">
            <div className="w-14 h-14 rounded-full overflow-hidden border border-emerald-500/40 shadow-xs shrink-0">
              <img 
                src="/dr-upasana-gala.png" 
                alt="Dr. Upasana Gala" 
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-[#EDEDED]">Dr. Upasana Gala</span>
                <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950/60 px-1 py-0.2 rounded border border-emerald-800/50">BCN / QEEG-D</span>
              </div>
              <p className="text-[10px] text-[#888888]">Founder, Evolve Brain Training</p>
              <p className="text-[9px] text-[#666666] font-mono">Dubai Healthcare City · Abu Dhabi</p>
            </div>
          </div>
        </div>

        {/* Doctor's Prescription Guidance Note */}
        <div className="p-4 rounded-lg bg-[#000000] border border-[#222222] space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-mono">
            <span className="text-[#888888] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Dr. Gala's Clinical Note & Protocol Guidance:
            </span>
            <span className="text-[#666666]">{client.protocol}</span>
          </div>
          <p className="text-xs text-[#CCCCCC] font-sans italic leading-relaxed">
            &ldquo;{client.doctorNote}&rdquo;
          </p>
        </div>

        {/* Action Button */}
        <div className="flex flex-wrap items-center gap-4 pt-2">
          <button
            onClick={onStartSession}
            className="btn btn-primary text-xs font-semibold py-3 px-6 shadow-md flex items-center gap-2"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Start Today's Neurofeedback Session</span>
          </button>
          <span className="text-xs text-[#888888] font-mono">
            Target: 15 min · Continuous Graded Sensory Flow
          </span>
        </div>

      </section>

      {/* Adherence & Training Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Completed Sessions', value: `${client.completedSessions}/${client.totalPrescribed}`, sub: `${compliancePercent}% Completed` },
          { label: 'Training Streak', value: `${client.streakDays} Days`, sub: 'Daily Protocol Adherence' },
          { label: 'Slow-Wave Stability', value: `+${client.gainPercent}%`, sub: 'vs. Baseline QEEG' },
          { label: 'Current Score', value: `${client.currentAvg}/100`, sub: `Baseline: ${client.baselineScore}` },
        ].map(stat => (
          <div key={stat.label} className="p-5 rounded-xl bg-[#111111] border border-[#222222] text-center shadow-xs">
            <span className="text-xs text-[#888888] block">{stat.label}</span>
            <span className="text-2xl font-light font-mono text-emerald-400 block mt-1">
              {stat.value}
            </span>
            <span className="text-[10px] text-[#666666] font-mono block mt-0.5">
              {stat.sub}
            </span>
          </div>
        ))}
      </div>

    </div>
  );
}
