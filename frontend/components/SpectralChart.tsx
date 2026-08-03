"use client";

interface BandPower {
  band: string;
  power: number;
  normMin: number;
  normMax: number;
  color: string;
}

interface SpectralChartProps {
  bands: BandPower[];
}

export function SpectralChart({ bands }: SpectralChartProps) {
  const maxPower = Math.max(...bands.map((b) => Math.max(b.power, b.normMax))) * 1.2;

  return (
    <div className="card p-6">
      <h3 className="text-base font-medium text-text-primary mb-4">
        Spectral Power Distribution
      </h3>
      <div className="space-y-4">
        {bands.map((band) => {
          const widthPercent = (band.power / maxPower) * 100;
          const normMinPct = (band.normMin / maxPower) * 100;
          const normMaxPct = (band.normMax / maxPower) * 100;
          const isAbnormal = band.power < band.normMin || band.power > band.normMax;

          return (
            <div key={band.band}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-sm"
                    style={{ backgroundColor: band.color }}
                  />
                  <span className="text-sm text-text-primary font-medium">{band.band}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-data text-sm text-text-primary">
                    {band.power.toFixed(1)} μV²/Hz
                  </span>
                  {isAbnormal && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 font-medium">
                      Outside norm
                    </span>
                  )}
                </div>
              </div>
              <div className="relative h-6 bg-surface rounded-md overflow-hidden">
                {/* Normative range */}
                <div
                  className="absolute top-0 h-full bg-green-50 border-l border-r border-green-200"
                  style={{
                    left: `${normMinPct}%`,
                    width: `${normMaxPct - normMinPct}%`,
                  }}
                />
                {/* Actual power bar */}
                <div
                  className="absolute top-1 bottom-1 left-0 rounded transition-all duration-700 ease-out"
                  style={{
                    width: `${widthPercent}%`,
                    backgroundColor: isAbnormal ? "#f59e0b" : band.color,
                  }}
                />
              </div>
              <div className="flex justify-between mt-0.5">
                <span className="text-[10px] text-text-secondary/60">0</span>
                <span className="text-[10px] text-text-secondary/60">
                  Norm: {band.normMin.toFixed(1)}–{band.normMax.toFixed(1)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
