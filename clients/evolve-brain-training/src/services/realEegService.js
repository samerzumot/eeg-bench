import { MuseClient, channelNames } from 'muse-js';
import { BehaviorSubject, bufferTime, filter } from 'rxjs';

export const eegState$ = new BehaviorSubject({
  focusScore: 50,
  calmScore: 50,
  bandPowers: { delta: 20, theta: 20, alpha: 20, beta: 20 },
  mode: 'connected' // connected, calm, focused, distracted (for mock mode reuse)
});

class RealEegService {
  constructor() {
    this.client = new MuseClient();
    this.isConnected = false;
    this.sub = null;
  }

  async connect() {
    try {
      await this.client.connect();
      await this.client.start();
      this.isConnected = true;
      console.log('Muse connected');

      // Basic processing logic (simplified for demo)
      // We subscribe to EEG readings, buffer them, and calculate a pseudo-focus score
      this.sub = this.client.eegReadings
        .pipe(
          filter(r => r.electrode === channelNames.AF7 || r.electrode === channelNames.AF8), // Frontal lobes for focus
          bufferTime(1000) // 1 second intervals
        )
        .subscribe(readings => {
          if (!readings.length) return;
          
          // In a real application, you would run an FFT to extract Beta and Theta powers.
          // For this Web Bluetooth demo, we'll simulate the feature extraction
          // based on raw signal variance as a proxy for activity
          
          const variance = this.calculateVariance(readings.map(r => r.samples[0] || 0));
          
          // Map variance to a pseudo-focus score (0-100)
          let focusScore = Math.min(100, Math.max(0, 50 + (variance / 100)));
          
          // Introduce a bit of smoothing
          const current = eegState$.getValue();
          focusScore = Math.round((current.focusScore * 0.8) + (focusScore * 0.2));
          
          eegState$.next({
            ...current,
            focusScore: focusScore,
            calmScore: 100 - focusScore + 10 // Inverse relationship proxy
          });
        });
        
    } catch (err) {
      console.error('Muse connection failed:', err);
      throw err;
    }
  }
  
  calculateVariance(arr) {
    if (!arr || arr.length === 0) return 0;
    const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
    return arr.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / arr.length;
  }

  disconnect() {
    if (this.sub) {
      this.sub.unsubscribe();
      this.sub = null;
    }
    if (this.client) {
      this.client.disconnect();
    }
    this.isConnected = false;
  }

  subscribe(callback) {
    const subscription = eegState$.subscribe(callback);
    return () => subscription.unsubscribe();
  }
}

export const realEEG = new RealEegService();
