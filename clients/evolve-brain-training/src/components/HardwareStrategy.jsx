import React from 'react';
import { Briefcase, DollarSign, Cpu, TrendingUp } from 'lucide-react';

export function HardwareStrategy() {
  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8 space-y-6 text-[#EDEDED] font-sans">
      <div className="p-6 sm:p-8 rounded-xl bg-[#111111] border border-[#222222] shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-emerald-400" />
          <h2 className="text-xl font-light text-[#EDEDED] tracking-tight">
            Hardware Deployment Strategy · Evolve Brain Training
          </h2>
        </div>
        <p className="text-xs text-[#888888] leading-relaxed max-w-2xl font-sans">
          Clinical EEG hardware recommendations and at-home deployment economics for continuous patient neurofeedback under Dr. Upasana Gala.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-xs font-mono">
          <div className="bg-[#000000] p-4 rounded-xl border border-[#222222] space-y-2">
            <Cpu className="w-4 h-4 text-emerald-400" />
            <h3 className="font-semibold text-[#EDEDED] font-sans">Muse 2 / Muse S</h3>
            <p className="text-[#888888] text-[11px] font-sans">
              4-Channel EEG (TP9, AF7, AF8, TP10). Consumer accessible with clinical signal quality for SMR, Alpha, and Theta operant conditioning.
            </p>
          </div>

          <div className="bg-[#000000] p-4 rounded-xl border border-[#222222] space-y-2">
            <DollarSign className="w-4 h-4 text-amber-400" />
            <h3 className="font-semibold text-[#EDEDED] font-sans">Clinic Rental Model</h3>
            <p className="text-[#888888] text-[11px] font-sans">
              Low barrier entry with clinic hardware rental or patient device ownership with recurring protocol licensing.
            </p>
          </div>

          <div className="bg-[#000000] p-4 rounded-xl border border-[#222222] space-y-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <h3 className="font-semibold text-[#EDEDED] font-sans">Clinical Adherence</h3>
            <p className="text-[#888888] text-[11px] font-sans">
              Real-time synchronization ensures patients maintain prescribed protocols between in-clinic visits in Dubai.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
