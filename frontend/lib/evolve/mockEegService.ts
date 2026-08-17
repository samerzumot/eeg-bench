export type BrainStateMode = "ilf_flow" | "deep_calm" | "somatic_tension" | "attentional_drift" | "manual";

export interface SignalQuality {
  tp9: "optimal" | "good" | "poor";
  af7: "optimal" | "good" | "poor";
  af8: "optimal" | "good" | "poor";
  tp10: "optimal" | "good" | "poor";
}

export interface BandPowers {
  delta: number; // 0.5 - 4 Hz
  theta: number; // 4 - 8 Hz
  alpha: number; // 8 - 12 Hz
  beta: number;  // 12 - 30 Hz (SMR / Beta)
  gamma: number; // 30 - 45 Hz
}

export interface MuseAthenaTelemetry {
  eogBlinkFilterActive: boolean;
  emgClenchDetected: boolean;
  imuHeadStabilityPercent: number; // 0 - 100%
  hrvAutonomicCoherence: number;   // 0.0 - 1.0
  dcPotentialOffsetMv: number;     // Slow cortical DC potential in mV
}

export interface GradedModulationParams {
  brightnessPct: number; // 25% - 100%
  blurPx: number;        // 0px - 8px
  apertureScale: number; // 0.92 - 1.0
  volumePct: number;     // 0% - 100%
  isInZone: boolean;
}

export interface EegTelemetryState {
  focusScore: number;
  calmScore: number;
  targetCoherence: number;
  mode: BrainStateMode;
  signalQuality: SignalQuality;
  bandPowers: BandPowers;
  optimalResponseFrequencyHz: number; // e.g. 0.005 Hz (ILF slow-wave)
  infraLowSlowWaveVal: number;        // Continuous slow wave point (-1.0 to +1.0)
  athena: MuseAthenaTelemetry;
  modulation: GradedModulationParams;
  rawSamples: {
    tp9: number[];
    af7: number[];
    af8: number[];
    tp10: number[];
    ilfSlowWave: number[]; // Infra-low frequency slow cortical potential trace
  };
}

export class MockEegService {
  private listeners: Set<(state: EegTelemetryState) => void> = new Set();
  private timer: NodeJS.Timeout | null = null;
  private isRunning: boolean = false;
  private time: number = 0;
  private isManual: boolean = false;
  private orfHz: number = 0.005; // Default 0.005 Hz ILF

  private state: EegTelemetryState = {
    focusScore: 86,
    calmScore: 84,
    targetCoherence: 85,
    mode: "ilf_flow",
    signalQuality: {
      tp9: "optimal",
      af7: "optimal",
      af8: "optimal",
      tp10: "optimal",
    },
    bandPowers: {
      delta: 12.4,
      theta: 14.8,
      alpha: 48.2,
      beta: 20.6,
      gamma: 4.0,
    },
    optimalResponseFrequencyHz: 0.005,
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
    rawSamples: {
      tp9: [],
      af7: [],
      af8: [],
      tp10: [],
      ilfSlowWave: [],
    },
  };

  constructor() {
    this.initBuffer();
  }

  private initBuffer() {
    for (let i = 0; i < 100; i++) {
      this.state.rawSamples.tp9.push(0);
      this.state.rawSamples.af7.push(0);
      this.state.rawSamples.af8.push(0);
      this.state.rawSamples.tp10.push(0);
      this.state.rawSamples.ilfSlowWave.push(0.5);
    }
  }

  public setOptimalResponseFrequency(hz: number) {
    this.orfHz = Math.max(0.0005, Math.min(0.05, hz));
    this.state.optimalResponseFrequencyHz = this.orfHz;
    this.notify();
  }

  public setMode(mode: BrainStateMode) {
    this.isManual = false;
    this.state.mode = mode;

    switch (mode) {
      case "ilf_flow":
        this.state.focusScore = 88;
        this.state.calmScore = 86;
        this.state.bandPowers = { delta: 10.0, theta: 13.5, alpha: 46.0, beta: 26.5, gamma: 4.0 };
        this.state.athena.emgClenchDetected = false;
        this.state.athena.imuHeadStabilityPercent = 98;
        this.state.athena.hrvAutonomicCoherence = 0.88;
        break;
      case "deep_calm":
        this.state.focusScore = 80;
        this.state.calmScore = 94;
        this.state.bandPowers = { delta: 12.0, theta: 15.0, alpha: 60.0, beta: 10.0, gamma: 3.0 };
        this.state.athena.emgClenchDetected = false;
        this.state.athena.imuHeadStabilityPercent = 99;
        this.state.athena.hrvAutonomicCoherence = 0.94;
        break;
      case "somatic_tension":
        // Somatic jaw clench / high-beta hyperarousal
        this.state.focusScore = 40;
        this.state.calmScore = 24;
        this.state.bandPowers = { delta: 14.0, theta: 15.0, alpha: 10.0, beta: 52.0, gamma: 9.0 };
        this.state.athena.emgClenchDetected = true;
        this.state.athena.imuHeadStabilityPercent = 82;
        this.state.athena.hrvAutonomicCoherence = 0.38;
        break;
      case "attentional_drift":
        // Mid-frontal theta surge / attentional lapse
        this.state.focusScore = 34;
        this.state.calmScore = 46;
        this.state.bandPowers = { delta: 24.0, theta: 48.0, alpha: 16.0, beta: 8.0, gamma: 4.0 };
        this.state.athena.emgClenchDetected = false;
        this.state.athena.imuHeadStabilityPercent = 88;
        this.state.athena.hrvAutonomicCoherence = 0.52;
        break;
      case "manual":
        break;
    }

    this.state.targetCoherence = Math.round((this.state.focusScore + this.state.calmScore) / 2);
    this.updateModulation();
    this.notify();
  }

  public setManualScores(focus?: number, calm?: number) {
    this.isManual = true;
    this.state.mode = "manual";
    if (focus !== undefined) {
      this.state.focusScore = Math.min(100, Math.max(0, Math.round(focus)));
    }
    if (calm !== undefined) {
      this.state.calmScore = Math.min(100, Math.max(0, Math.round(calm)));
    }
    this.state.targetCoherence = Math.round((this.state.focusScore + this.state.calmScore) / 2);

    const alpha = Math.round(15 + this.state.calmScore * 0.45);
    const beta = Math.round(10 + this.state.focusScore * 0.35);
    const theta = Math.round(40 - this.state.focusScore * 0.25);
    const delta = Math.round(25 - this.state.calmScore * 0.15);
    const gamma = 5;

    this.state.bandPowers = { delta, theta, alpha, beta, gamma };
    this.updateModulation();
    this.notify();
  }

  public start(intervalMs: number = 40) {
    if (this.isRunning) return;
    this.isRunning = true;

    this.timer = setInterval(() => {
      this.time += 0.04;
      this.generateStep();
      this.notify();
    }, intervalMs);
  }

  public stop() {
    this.isRunning = false;
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  public subscribe(callback: (state: EegTelemetryState) => void): () => void {
    this.listeners.add(callback);
    callback({ ...this.state });
    return () => {
      this.listeners.delete(callback);
    };
  }

  private updateModulation() {
    const coherence = this.state.targetCoherence;
    const threshold = 65; // baseline nominal threshold

    if (coherence >= threshold) {
      // In-zone: Full clarity & smooth flow
      const surplus = (coherence - threshold) / (100 - threshold);
      this.state.modulation = {
        brightnessPct: Math.round(85 + surplus * 15),
        blurPx: 0,
        apertureScale: Number((0.98 + surplus * 0.02).toFixed(3)),
        volumePct: Math.round(85 + surplus * 15),
        isInZone: true,
      };
    } else {
      // Sub-threshold: Continuous graded visual reflection without startle
      const deficit = (threshold - coherence) / threshold;
      const brightness = Math.max(25, Math.round(80 - deficit * 55));
      const blur = Math.min(8, Math.round(deficit * 8));
      const aperture = Math.max(0.92, Number((0.98 - deficit * 0.06).toFixed(3)));
      const volume = Math.max(15, Math.round(80 - deficit * 65));

      this.state.modulation = {
        brightnessPct: brightness,
        blurPx: blur,
        apertureScale: aperture,
        volumePct: volume,
        isInZone: false,
      };
    }
  }

  private notify() {
    const snapshot: EegTelemetryState = {
      ...this.state,
      signalQuality: { ...this.state.signalQuality },
      bandPowers: { ...this.state.bandPowers },
      athena: { ...this.state.athena },
      modulation: { ...this.state.modulation },
      rawSamples: {
        tp9: [...this.state.rawSamples.tp9],
        af7: [...this.state.rawSamples.af7],
        af8: [...this.state.rawSamples.af8],
        tp10: [...this.state.rawSamples.tp10],
        ilfSlowWave: [...this.state.rawSamples.ilfSlowWave],
      },
    };
    for (const cb of this.listeners) {
      cb(snapshot);
    }
  }

  private generateStep() {
    const t = this.time;

    // Synthesize Infra-Low Frequency (0.001 - 0.05 Hz) slow wave
    const slowFreq = this.orfHz;
    const slowWaveVal = Math.sin(t * slowFreq * Math.PI * 2) * 0.8 + Math.sin(t * slowFreq * 0.45 * Math.PI * 2) * 0.2;
    this.state.infraLowSlowWaveVal = slowWaveVal;
    this.state.athena.dcPotentialOffsetMv = Number((-4.0 + slowWaveVal * 3.5).toFixed(2));

    if (!this.isManual) {
      const slowDrift = slowWaveVal * 4.0;
      const microNoise = (Math.random() - 0.5) * 2.0;

      if (this.state.mode === "ilf_flow") {
        this.state.focusScore = Math.min(98, Math.max(72, Math.round(87 + slowDrift + microNoise)));
        this.state.calmScore = Math.min(96, Math.max(70, Math.round(85 + slowDrift * 0.8)));
      } else if (this.state.mode === "deep_calm") {
        this.state.focusScore = Math.min(88, Math.max(68, Math.round(78 + slowDrift * 0.5)));
        this.state.calmScore = Math.min(99, Math.max(82, Math.round(93 + slowDrift + microNoise)));
      } else if (this.state.mode === "somatic_tension") {
        this.state.focusScore = Math.min(54, Math.max(22, Math.round(38 + slowDrift)));
        this.state.calmScore = Math.min(38, Math.max(14, Math.round(24 + slowDrift + microNoise)));
      } else if (this.state.mode === "attentional_drift") {
        this.state.focusScore = Math.min(48, Math.max(18, Math.round(34 + slowDrift + microNoise)));
        this.state.calmScore = Math.min(58, Math.max(28, Math.round(44 + slowDrift)));
      }
      this.state.targetCoherence = Math.round((this.state.focusScore + this.state.calmScore) / 2);
    }

    this.updateModulation();

    // 4 standard EEG channels with realistic amplitude envelopes
    const alphaAmp = (this.state.calmScore / 100) * 36;
    const betaAmp = (this.state.focusScore / 100) * 22;
    const thetaAmp = Math.max(6, 32 - (this.state.focusScore / 100) * 26);

    const s1 =
      Math.sin(t * 10 * Math.PI * 2) * alphaAmp +
      Math.sin(t * 16 * Math.PI * 2) * betaAmp +
      Math.sin(t * 5.5 * Math.PI * 2) * thetaAmp +
      (Math.random() - 0.5) * 4.5;

    const s2 =
      Math.sin(t * 10.1 * Math.PI * 2 + 0.4) * alphaAmp +
      Math.sin(t * 16.2 * Math.PI * 2) * betaAmp +
      (Math.random() - 0.5) * 4.0;

    const s3 =
      Math.sin(t * 9.9 * Math.PI * 2 + 0.9) * alphaAmp +
      Math.sin(t * 15.8 * Math.PI * 2) * betaAmp +
      (Math.random() - 0.5) * 4.0;

    const s4 =
      Math.sin(t * 10.2 * Math.PI * 2 + 1.4) * alphaAmp +
      Math.sin(t * 16.5 * Math.PI * 2) * betaAmp +
      Math.sin(t * 5.2 * Math.PI * 2) * thetaAmp +
      (Math.random() - 0.5) * 4.5;

    this.state.rawSamples.tp9.push(s1);
    this.state.rawSamples.af7.push(s2);
    this.state.rawSamples.af8.push(s3);
    this.state.rawSamples.tp10.push(s4);
    this.state.rawSamples.ilfSlowWave.push(slowWaveVal);

    if (this.state.rawSamples.tp9.length > 120) {
      this.state.rawSamples.tp9.shift();
      this.state.rawSamples.af7.shift();
      this.state.rawSamples.af8.shift();
      this.state.rawSamples.tp10.shift();
      this.state.rawSamples.ilfSlowWave.shift();
    }
  }
}

export const mockEeg = new MockEegService();
