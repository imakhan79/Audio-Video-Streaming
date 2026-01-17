
import { Profile, Scene, EncoderSettings } from './types';

export const DEFAULT_ENCODER: EncoderSettings = {
  encoder: 'libx264',
  bitrate: 4500,
  fps: 60,
  resolution: '1920x1080',
  preset: 'veryfast',
  keyframeInterval: 2,
};

export const INITIAL_PROFILE: Profile = {
  id: 'p-default',
  name: 'Standard 1080p',
  platform: 'youtube',
  rtmpUrl: 'rtmp://a.rtmp.youtube.com/live2',
  streamKey: '',
  encoderSettings: DEFAULT_ENCODER,
  recordPath: './recordings',
  recordFormat: 'mp4',
};

export const INITIAL_SCENES: Scene[] = [
  {
    id: 's-1',
    name: 'Scene: Gameplay',
    sources: [
      {
        id: 'bg-1',
        name: 'Screen Capture',
        type: 'screen',
        visible: true,
        locked: true,
        x: 0,
        y: 0,
        width: 1920,
        height: 1080,
        volume: 80,
        muted: false,
        zIndex: 0
      }
    ]
  },
  {
    id: 's-2',
    name: 'Scene: Just Chatting',
    sources: []
  }
];
