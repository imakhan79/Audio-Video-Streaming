
export interface DeviceInfo {
  id: string;
  label: string;
}

export class DeviceManager {
  public async getCameras(): Promise<DeviceInfo[]> {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      return devices
        .filter(d => d.kind === 'videoinput')
        .map(d => ({ id: d.deviceId, label: d.label || 'Unknown Camera' }));
    } catch (e) {
      console.error("Device discovery failed", e);
      return [];
    }
  }

  public async getMicrophones(): Promise<DeviceInfo[]> {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      return devices
        .filter(d => d.kind === 'audioinput')
        .map(d => ({ id: d.deviceId, label: d.label || 'Unknown Microphone' }));
    } catch (e) {
      return [];
    }
  }

  public async getStream(deviceId: string): Promise<MediaStream | null> {
    try {
      return await navigator.mediaDevices.getUserMedia({
        video: { deviceId: { exact: deviceId } },
        audio: false
      });
    } catch (e) {
      return null;
    }
  }
}

export const deviceManager = new DeviceManager();
