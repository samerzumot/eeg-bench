import React from 'react';
import { Stethoscope, User, Bluetooth, Play } from 'lucide-react';

export function Header({ activeTab, setActiveTab, eegState, bleStatus, onConnectBLE, onOpenDemo }) {
  const isBleConnected = bleStatus?.isConnected;
  const focus = eegState?.focusScore || 85;

  return (
    <header className="sticky top-0 z-50 bg-[#0A0A0A]/95 backdrop-blur-md border-b border-[#222222] text-[#EDEDED]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        
        {/* Single Crisp Header Logo & Clinical Branding */}
        <div 
          className="flex items-center gap-3 cursor-pointer group" 
          onClick={() => setActiveTab('client')}
        >
          <img 
            src="/evolve-logo.webp" 
            alt="Evolve Brain Training" 
            className="h-8 w-auto object-contain brightness-110"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
          <div className="border-l border-[#333333] pl-3 py-0.5">
            <span className="text-sm font-semibold tracking-tight text-[#EDEDED] font-sans group-hover:text-emerald-400 transition-colors block">
              Evolve Brain Training
            </span>
            <span className="text-[10px] text-[#888888] font-mono block">
              Dr. Upasana Gala · Dubai & Abu Dhabi
            </span>
          </div>
        </div>

        {/* Center: Simplified Therapy Navigation Tabs */}
        <div className="nav-tab-group font-mono">
          <button
            onClick={() => setActiveTab('client')}
            className={`nav-tab-btn ${activeTab === 'client' ? 'active' : ''}`}
          >
            <User className="w-3.5 h-3.5" />
            <span>My Therapy</span>
          </button>

          <button
            onClick={() => setActiveTab('session')}
            className={`nav-tab-btn ${activeTab === 'session' ? 'active' : ''}`}
          >
            <Play className="w-3.5 h-3.5" />
            <span>Live Session</span>
          </button>

          <button
            onClick={() => setActiveTab('clinician')}
            className={`nav-tab-btn ${activeTab === 'clinician' ? 'active' : ''}`}
          >
            <Stethoscope className="w-3.5 h-3.5" />
            <span>Dr. Gala Portal</span>
          </button>
        </div>

        {/* Right: Demo & Hardware Link */}
        <div className="flex items-center gap-2.5">
          {onOpenDemo && (
            <button
              onClick={onOpenDemo}
              className="btn text-xs py-1.5 px-3 font-mono bg-emerald-950/60 border border-emerald-700/80 text-emerald-300 hover:bg-emerald-900/60 flex items-center gap-1.5 transition-all shadow-xs"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-semibold">Interactive Demo</span>
            </button>
          )}

          <button
            onClick={onConnectBLE}
            className={`btn text-xs py-1.5 px-3 font-mono transition-all ${
              isBleConnected
                ? 'bg-emerald-950 border border-emerald-600 text-emerald-300'
                : 'bg-[#161616] border border-[#333333] text-[#EDEDED] hover:bg-[#222222]'
            }`}
          >
            <Bluetooth className="w-3.5 h-3.5 text-emerald-400" />
            <span>{isBleConnected ? 'Muse Linked' : 'Connect Muse'}</span>
          </button>
        </div>

      </div>
    </header>
  );
}
