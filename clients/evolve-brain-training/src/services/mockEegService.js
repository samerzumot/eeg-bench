// Simulated EEG & Infra-Low Frequency (ILF) Signal Engine
// Simulates 4-channel EEG (AF7, AF8, TP9, TP10) at 256Hz + DC Slow Cortical Potential (0.0001 - 0.05 Hz)
// Specifically calibrated for Dr. Upasana Gala's ILF Neurofeedback & Othmer Method.

export class MockEEGService {
  constructor() {
    this.listeners = new Set();
    this.isRunning = false;
    this.timer = null;
    this.sampleRate = 256;
    this.time = 0;
    this.isManual = false;
    this.orfHz = 0.005; // Default 0.005 Hz Optimal Response Frequency

    this.state = {
      focusScore: 86,
      calmScore: 84,
      targetCoherence: 85,
      mode: 'ilf_flow', // 'ilf_flow' | 'deep_calm' | 'somatic_tension' | 'attentional_drift' | 'manual'
      optimalResponseFrequencyHz: 0.005,
      infraLowSlowWaveVal: 0.72,
      signalQuality: {
        tp9: 'optimal',
        af7: 'optimal',
        af8: 'optimal',
        tp10: 'optimal',
      },
      bandPowers: {
        delta: 12.4,
        theta: 14.8,
        alpha: 48.2,
        beta: 20.6,
        gamma: 4.0,
      },
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
        ch1: [], // TP9
        ch2: [], // AF7
        ch3: [], // AF8
        ch4: [], // TP10
        ilf: [], // Slow Cortical Potential
      }
    };

    this.initBuffer();
  }

  initBuffer() {
    for (let i = 0; i < 100; i++) {
      this.state.rawSamples.ch1.push(0);
      this.state.rawSamples.ch2.push(0);
      this.state.rawSamples.ch3.push(0);
      this.state.rawSamples.ch4.push(0);
      this.state.rawSamples.ilf.push(0.5);
    }
  }

  setOptimalResponseFrequency(hz) {
    this.orfHz = Math.max(0.0005, Math.min(0.05, hz));
    this.state.optimalResponseFrequencyHz = this.orfHz;
    this.notify();
  }

  setMode(mode) {
    this.isManual = false;
    this.state.mode = mode;

    switch (mode) {
      case 'ilf_flow':
      case 'focused':
        this.state.focusScore = 88;
        this.state.calmScore = 86;
        this.state.bandPowers = { delta: 10.0, theta: 13.5, alpha: 46.0, beta: 26.5, gamma: 4.0 };
        this.state.athena.emgClenchDetected = false;
        this.state.athena.imuHeadStabilityPercent = 98;
        this.state.athena.hrvAutonomicCoherence = 0.88;
        break;
      case 'deep_calm':
      case 'calm':
        this.state.focusScore = 80;
        this.state.calmScore = 94;
        this.state.bandPowers = { delta: 12.0, theta: 15.0, alpha: 60.0, beta: 10.0, gamma: 3.0 };
        this.state.athena.emgClenchDetected = false;
        this.state.athena.imuHeadStabilityPercent = 99;
        this.state.athena.hrvAutonomicCoherence = 0.94;
        break;
      case 'somatic_tension':
      case 'anxious':
        this.state.focusScore = 40;
        this.state.calmScore = 24;
        this.state.bandPowers = { delta: 14.0, theta: 15.0, alpha: 10.0, beta: 52.0, gamma: 9.0 };
        this.state.athena.emgClenchDetected = true;
        this.state.athena.imuHeadStabilityPercent = 82;
        this.state.athena.hrvAutonomicCoherence = 0.38;
        break;
      case 'attentional_drift':
      case 'distracted':
        this.state.focusScore = 34;
        this.state.calmScore = 46;
        this.state.bandPowers = { delta: 24.0, theta: 48.0, alpha: 16.0, beta: 8.0, gamma: 4.0 };
        this.state.athena.emgClenchDetected = false;
        this.state.athena.imuHeadStabilityPercent = 88;
        this.state.athena.hrvAutonomicCoherence = 0.52;
        break;
    }

    this.state.targetCoherence = Math.round((this.state.focusScore + this.state.calmScore) / 2);
    this.updateModulation();
    this.notify();
  }

  setManualScores(focus, calm) {
    this.isManual = true;
    this.state.mode = 'manual';
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

  start(intervalMs = 40) {
    if (this.isRunning) return;
    this.isRunning = true;

    this.timer = setInterval(() => {
      this.time += 0.04;
      this.generateStep();
      this.notify();
    }, intervalMs);
  }

  stop() {
    this.isRunning = false;
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  subscribe(callback) {
    this.listeners.add(callback);
    callback({ ...this.state });
    return () => this.listeners.delete(callback);
  }

  updateModulation() {
    const coherence = this.state.targetCoherence;
    const threshold = 65;

    if (coherence >= threshold) {
      const surplus = (coherence - threshold) / (100 - threshold);
      this.state.modulation = {
        brightnessPct: Math.round(85 + surplus * 15),
        blurPx: 0,
        apertureScale: Number((0.98 + surplus * 0.02).toFixed(3)),
        volumePct: Math.round(85 + surplus * 15),
        isInZone: true,
      };
    } else {
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

  notify() {
    for (const cb of this.listeners) {
      cb({
        ...this.state,
        signalQuality: { ...this.state.signalQuality },
        bandPowers: { ...this.state.bandPowers },
        athena: { ...this.state.athena },
        modulation: { ...this.state.modulation },
        rawSamples: {
          ch1: [...this.state.rawSamples.ch1],
          ch2: [...this.state.rawSamples.ch2],
          ch3: [...this.state.rawSamples.ch3],
          ch4: [...this.state.rawSamples.ch4],
          ilf: [...this.state.rawSamples.ilf],
        }
      });
    }
  }

  generateStep() {
    const t = this.time;
    const slowFreq = this.orfHz;
    const slowWaveVal = Math.sin(t * slowFreq * Math.PI * 2) * 0.8 + Math.sin(t * slowFreq * 0.45 * Math.PI * 2) * 0.2;
    this.state.infraLowSlowWaveVal = slowWaveVal;
    this.state.athena.dcPotentialOffsetMv = Number((-4.0 + slowWaveVal * 3.5).toFixed(2));

    if (!this.isManual) {
      const slowDrift = slowWaveVal * 4.0;
      const microNoise = (Math.random() - 0.5) * 2.0;

      if (this.state.mode === 'ilf_flow' || this.state.mode === 'focused') {
        this.state.focusScore = Math.min(98, Math.max(72, Math.round(87 + slowDrift + microNoise)));
        this.state.calmScore = Math.min(96, Math.max(70, Math.round(85 + slowDrift * 0.8)));
      } else if (this.state.mode === 'deep_calm' || this.state.mode === 'calm') {
        this.state.focusScore = Math.min(88, Math.max(68, Math.round(78 + slowDrift * 0.5)));
        this.state.calmScore = Math.min(99, Math.max(82, Math.round(93 + slowDrift + microNoise)));
      } else if (this.state.mode === 'somatic_tension' || this.state.mode === 'anxious') {
        this.state.focusScore = Math.min(54, Math.max(22, Math.round(38 + slowDrift)));
        this.state.calmScore = Math.min(38, Math.max(14, Math.round(24 + slowDrift + microNoise)));
      } else if (this.state.mode === 'attentional_drift' || this.state.mode === 'distracted') {
        this.state.focusScore = Math.min(48, Math.max(18, Math.round(34 + slowDrift + microNoise)));
        this.state.calmScore = Math.min(58, Math.max(28, Math.round(44 + slowDrift)));
      }
      this.state.targetCoherence = Math.round((this.state.focusScore + this.state.calmScore) / 2);
    }

    this.updateModulation();

    const alphaAmp = (this.state.calmScore / 100) * 36;
    const betaAmp = (this.state.focusScore / 100) * 22;
    const thetaAmp = Math.max(6, 32 - (this.state.focusScore / 100) * 26);

    const s1 = Math.sin(t * 10 * Math.PI * 2) * alphaAmp + Math.sin(t * 16 * Math.PI * 2) * betaAmp + (Math.random() - 0.5) * 4.5;
    const s2 = Math.sin(t * 10.1 * Math.PI * 2 + 0.4) * alphaAmp + Math.sin(t * 16.2 * Math.PI * 2) * betaAmp + (Math.random() - 0.5) * 4.0;
    const s3 = Math.sin(t * 9.9 * Math.PI * 2 + 0.9) * alphaAmp + Math.sin(t * 15.8 * Math.PI * 2) * betaAmp + (Math.random() - 0.5) * 4.0;
    const s4 = Math.sin(t * 10.2 * Math.PI * 2 + 1.4) * alphaAmp + Math.sin(t * 16.5 * Math.PI * 2) * betaAmp + Math.sin(t * 5.2 * Math.PI * 2) * thetaAmp + (Math.random() - 0.5) * 4.5;

    this.state.rawSamples.ch1.push(s1);
    this.state.rawSamples.ch2.push(s2);
    this.state.rawSamples.ch3.push(s3);
    this.state.rawSamples.ch4.push(s4);
    this.state.rawSamples.ilf.push(slowWaveVal);

    if (this.state.rawSamples.ch1.length > 120) {
      this.state.rawSamples.ch1.shift();
      this.state.rawSamples.ch2.shift();
      this.state.rawSamples.ch3.shift();
      this.state.rawSamples.ch4.shift();
      this.state.rawSamples.ilf.shift();
    }
  }
}

export const mockEEG = new MockEEGService();
