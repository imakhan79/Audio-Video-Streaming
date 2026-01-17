
import { Profile, Scene } from './types';

export const DEFAULT_ENCODER_SETTINGS = {
  encoder: 'x264' as const,
  bitrate: 4500,
  rateControl: 'CBR' as const,
  preset: 'veryfast',
  keyframeInterval: 2,
  resolution: '1920x1080',
  fps: 60,
};

export const DEFAULT_PROFILE: Profile = {
  id: 'default',
  name: 'YouTube High Def',
  platform: 'youtube',
  streamKey: '',
  rtmpUrl: 'rtmp://a.rtmp.youtube.com/live2',
  encoderSettings: DEFAULT_ENCODER_SETTINGS,
};

export const INITIAL_SCENES: Scene[] = [
  {
    id: 'scene-1',
    name: 'Main Scene',
    sources: [
      {
        id: 'source-bg',
        name: 'Background Gradient',
        type: 'color',
        visible: true,
        locked: true,
        x: 0,
        y: 0,
        width: 1920,
        height: 1080,
        volume: 0,
        muted: true,
        contentUrl: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
        zIndex: 0,
      }
    ],
  },
  {
    id: 'scene-2',
    name: 'Just Chatting',
    sources: [],
  },
  {
    id: 'scene-3',
    name: 'Be Right Back',
    sources: [],
  }
];
