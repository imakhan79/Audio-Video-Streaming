
import React from 'react';
import { StreamStats } from '../types';

interface ControlPanelProps {
  isStreaming: boolean;
  isRecording: boolean;
  onToggleStream: () => void;
  onToggleRecord: () => void;
  onOpenSettings: () => void;
  stats: StreamStats;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  isStreaming,
  isRecording,
  onToggleStream,
  onToggleRecord,
  onOpenSettings,
  stats
}) => {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <button 
          onClick={onToggleStream}
          className={`flex flex-col items-center justify-center py-6 px-4 rounded-2xl transition-all ${isStreaming ? 'bg-red-600 shadow-xl shadow-red-600/20 scale-[0.98]' : 'bg-zinc-800 hover:bg-zinc-700'}`}
        >
          <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
          <span className="text-[10px] font-black uppercase tracking-widest">{isStreaming ? 'Stop Stream' : 'Go Live'}</span>
        </button>

        <button 
          onClick={onToggleRecord}
          className={`flex flex-col items-center justify-center py-6 px-4 rounded-2xl transition-all ${isRecording ? 'bg-blue-600 shadow-xl shadow-blue-600/20 scale-[0.98]' : 'bg-zinc-800 hover:bg-zinc-700'}`}
        >
          <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <span className="text-[10px] font-black uppercase tracking-widest">{isRecording ? 'Stop Recording' : 'Record'}</span>
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button 
          className="flex items-center justify-center gap-2 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl transition-all"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
          <span className="text-[9px] font-black uppercase tracking-widest">Virtual Cam</span>
        </button>
        <button 
          onClick={onOpenSettings}
          className="flex items-center justify-center gap-2 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl transition-all"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
          <span className="text-[9px] font-black uppercase tracking-widest">Settings</span>
        </button>
      </div>
    </div>
  );
};
