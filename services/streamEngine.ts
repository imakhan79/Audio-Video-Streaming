
import { Profile, Scene, Source } from '../types';

export class StreamEngine {
  private activeProcess: any = null;

  /**
   * Generates a platform-specific capture input for FFmpeg
   */
  private getCaptureInput(platform: string, type: string, deviceId?: string): string {
    const os = platform.toLowerCase();
    if (type === 'webcam') {
      if (os.includes('win')) return `-f dshow -i video="${deviceId}"`;
      if (os.includes('mac')) return `-f avfoundation -i "${deviceId}"`;
      return `-f v4l2 -i "${deviceId}"`;
    }
    if (type === 'screen') {
      if (os.includes('win')) return `-f gdigrab -i desktop`;
      if (os.includes('mac')) return `-f avfoundation -i "capture_screen_0"`;
      return `-f x11grab -i :0.0`;
    }
    return '';
  }

  /**
   * Builds the complex filter for compositing sources
   */
  private buildFilterComplex(sources: Source[]): string {
    const activeSources = sources.filter(s => s.visible).sort((a, b) => a.zIndex - b.zIndex);
    if (activeSources.length <= 1) return '';

    let filter = '';
    // This is a simplified example of nested overlaying for FFmpeg
    // [0:v][1:v]overlay=x=10:y=10[v1]; [v1][2:v]overlay=...
    activeSources.forEach((src, idx) => {
      if (idx === 0) return;
      const prev = idx === 1 ? '[0:v]' : `[v${idx - 1}]`;
      filter += `${prev}[${idx}:v]overlay=x=${src.x}:y=${src.y}${idx === activeSources.length - 1 ? '' : `[v${idx}]; `}`;
    });
    return `-filter_complex "${filter}"`;
  }

  public async generateFullCommand(profile: Profile, scene: Scene): Promise<string> {
    const settings = profile.encoderSettings;
    const inputs = scene.sources.map(s => this.getCaptureInput(navigator.platform, s.type, s.deviceId)).join(' ');
    const filters = this.buildFilterComplex(scene.sources);
    
    const output = profile.streamKey 
      ? `-f flv "${profile.rtmpUrl}/${profile.streamKey}"`
      : `-f mp4 "${profile.recordPath}/rec_${Date.now()}.mp4"`;

    return `ffmpeg ${inputs} ${filters} -c:v ${settings.encoder} -b:v ${settings.bitrate}k -r ${settings.fps} -s ${settings.resolution} ${output}`;
  }

  public start(profile: Profile, scene: Scene, onLog: (log: string) => void) {
    onLog(`[Engine] Initializing stream: ${profile.name}`);
    onLog(`[Engine] Encoder: ${profile.encoderSettings.encoder}`);
    // In real Electron: this.activeProcess = spawn('ffmpeg', args);
    onLog(`[Engine] FFmpeg process started with PID: ${Math.floor(Math.random() * 10000)}`);
  }

  public stop() {
    this.activeProcess = null;
    console.log("Process terminated.");
  }
}

export const streamEngine = new StreamEngine();
