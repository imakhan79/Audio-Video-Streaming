
export type SourceType = 'webcam' | 'screen' | 'window' | 'image' | 'color' | 'media';

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
  deviceId?: string;
  contentUrl?: string;
  zIndex: number;
}

export interface Scene {
  id: string;
  name: string;
  sources: Source[];
}

export interface StreamStats {
  fps: number;
  bitrate: number;
  droppedFrames: number;
  cpuUsage: number;
  gpuUsage: number;
  uptime: string;
}

export interface EncoderSettings {
  encoder: 'x264' | 'h264_nvenc' | 'h264_qsv' | 'h264_amf';
  bitrate: number;
  rateControl: 'CBR' | 'VBR';
  preset: string;
  keyframeInterval: number;
  resolution: string;
  fps: number;
}

export interface Profile {
  id: string;
  name: string;
  platform: 'youtube' | 'twitch' | 'facebook' | 'custom';
  streamKey: string;
  rtmpUrl: string;
  encoderSettings: EncoderSettings;
}

export interface AppState {
  scenes: Scene[];
  activeSceneId: string;
  isStreaming: boolean;
  isRecording: boolean;
  stats: StreamStats;
  currentProfile: Profile;
  logs: string[];
}
