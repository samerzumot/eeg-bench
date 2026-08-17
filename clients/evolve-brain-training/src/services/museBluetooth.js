// Web Bluetooth API Integration for Muse 2 / Muse S Headbands
// Standard Muse BLE GATT UUIDs:
// Service: 0xfe8d or custom Muse GATT
// EEG Characteristics: TP9 (0x0003), AF7 (0x0004), AF8 (0x0005), TP10 (0x0006)

export class MuseBluetoothService {
  constructor() {
    this.device = null;
    this.server = null;
    this.isConnected = false;
    this.listeners = new Set();
  }

  isSupported() {
    return typeof navigator !== 'undefined' && 'bluetooth' in navigator;
  }

  async connect() {
    if (!this.isSupported()) {
      throw new Error('Web Bluetooth is not supported in this browser. Please use Google Chrome or Microsoft Edge.');
    }

    try {
      this.device = await navigator.bluetooth.requestDevice({
        filters: [{ namePrefix: 'Muse' }],
        optionalServices: [
          '0000fe8d-0000-1000-8000-00805f9b34fb', // Muse Service UUID
          'generic_access',
          'battery_service'
        ]
      });

      this.device.addEventListener('gattserverdisconnected', () => {
        this.isConnected = false;
        this.notifyStatus('disconnected');
      });

      this.server = await this.device.gatt.connect();
      this.isConnected = true;
      this.notifyStatus('connected');
      return true;
    } catch (err) {
      console.warn('Bluetooth connection cancelled or failed:', err);
      throw err;
    }
  }

  disconnect() {
    if (this.device && this.device.gatt.connected) {
      this.device.gatt.disconnect();
    }
    this.isConnected = false;
    this.notifyStatus('disconnected');
  }

  onStatusChange(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notifyStatus(status) {
    for (const cb of this.listeners) {
      cb({ status, isConnected: this.isConnected, deviceName: this.device?.name || 'Muse 2' });
    }
  }
}

export const museBLE = new MuseBluetoothService();
