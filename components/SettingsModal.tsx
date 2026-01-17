
import React from 'react';
import { Profile, Encoder } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: Profile;
  onSave: (profile: Profile) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, profile, onSave }) => {
  if (!isOpen) return null;

  const encoders: Encoder[] = ['libx264', 'h264_nvenc', 'h264_qsv', 'h264_videotoolbox'];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
          <h2 className="text-xl font-bold">Stream Settings</h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase">Stream Platform</label>
              <select className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 transition-all">
                <option value="youtube">YouTube</option>
                <option value="twitch">Twitch</option>
                <option value="facebook">Facebook</option>
                <option value="custom">Custom RTMP</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase">Server URL</label>
              <input type="text" defaultValue={profile.rtmpUrl} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-500 uppercase">Stream Key</label>
            <input type="password" placeholder="Paste your stream key here..." className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
          </div>

          <hr className="border-zinc-800" />

          <div className="grid grid-cols-2 gap-6">
             <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase">Encoder</label>
              <select className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 transition-all">
                {encoders.map(e => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase">Bitrate (Kbps)</label>
              <input type="number" defaultValue={profile.encoderSettings.bitrate} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase">Output FPS</label>
              <select className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 outline-none">
                <option value="30">30</option>
                <option value="60">60</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase">Preset</label>
              <select className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 outline-none">
                <option value="ultrafast">Ultrafast</option>
                <option value="veryfast">Veryfast</option>
                <option value="fast">Fast</option>
                <option value="medium">Medium</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase">Keyframe (s)</label>
              <input type="number" defaultValue="2" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 outline-none" />
            </div>
          </div>
        </div>

        <div className="p-6 bg-zinc-950 border-t border-zinc-800 flex justify-end gap-3">
          <button onClick={onClose} className="px-6 py-2 rounded-lg font-medium text-zinc-400 hover:text-white transition-colors">Cancel</button>
          <button onClick={onClose} className="px-6 py-2 rounded-lg font-bold bg-blue-600 hover:bg-blue-500 text-white transition-all">Save Changes</button>
        </div>
      </div>
    </div>
  );
};
