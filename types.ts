
export type SourceType = 'webcam' | 'screen' | 'window' | 'image' | 'media';
export type Platform = 'youtube' | 'twitch' | 'facebook' | 'custom';
export type Encoder = 'libx264' | 'h264_nvenc' | 'h264_qsv' | 'h264_videotoolbox' | 'h264_amf';

export interface Source {
  id: string;
  name: string;
  type: SourceType;
  visible: boolean;
  locked: boolean;
  x: number;
  y: number;
  width: number;
  height: number;
  volume: number;
  muted: boolean;
  deviceId?: string; // For webcam/mic
  filePath?: string; // For images/videos
  zIndex: number;
}

export interface Scene {
  id: string;
  name: string;
  sources: Source[];
}

export interface EncoderSettings {
  encoder: Encoder;
  bitrate: number; // in kbps
  fps: number;
  resolution: string; // "1920x1080"
  preset: string;
  keyframeInterval: number;
}

export interface Profile {
  id: string;
  name: string;
  platform: Platform;
  rtmpUrl: string;
  streamKey: string;
  encoderSettings: EncoderSettings;
  recordPath: string;
  recordFormat: 'mp4' | 'mkv' | 'flv';
}

export interface StreamStats {
  status: 'idle' | 'starting' | 'live' | 'error';
  uptime: string;
  bitrate: number;
  fps: number;
  droppedFrames: number;
  cpuUsage: number;
}

export interface AppState {
  scenes: Scene[];
  activeSceneId: string;
  isStreaming: boolean;
  isRecording: boolean;
  currentProfile: Profile;
  stats: StreamStats;
  logs: string[];
}
