
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
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col justify-between shadow-lg h-full">
      <div className="grid grid-cols-2 gap-3 mb-6">
        <button 
          onClick={onToggleStream}
          className={`flex flex-col items-center justify-center p-4 rounded-xl transition-all ${isStreaming ? 'bg-red-600 shadow-[0_0_20px_rgba(220,38,38,0.4)]' : 'bg-zinc-800 hover:bg-zinc-700'}`}
        >
          <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
          <span className="text-[10px] font-bold uppercase tracking-tighter">
            {isStreaming ? 'Stop Stream' : 'Go Live'}
          </span>
        </button>

        <button 
          onClick={onToggleRecord}
          className={`flex flex-col items-center justify-center p-4 rounded-xl transition-all ${isRecording ? 'bg-blue-600 shadow-[0_0_20px_rgba(37,99,235,0.4)]' : 'bg-zinc-800 hover:bg-zinc-700'}`}
        >
          <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
          <span className="text-[10px] font-bold uppercase tracking-tighter">
            {isRecording ? 'Stop Rec' : 'Record'}
          </span>
        </button>

        <button 
          className="flex flex-col items-center justify-center p-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 transition-all"
        >
          <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
          <span className="text-[10px] font-bold uppercase tracking-tighter">Virtual Cam</span>
        </button>

        <button 
          onClick={onOpenSettings}
          className="flex flex-col items-center justify-center p-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 transition-all"
        >
          <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          <span className="text-[10px] font-bold uppercase tracking-tighter">Settings</span>
        </button>
      </div>

      <div className="space-y-3 pt-4 border-t border-zinc-800">
        <div className="flex justify-between items-center text-[11px]">
          <span className="text-zinc-500 font-medium">Uptime</span>
          <span className="text-zinc-200 font-mono">{stats.uptime}</span>
        </div>
        <div className="flex justify-between items-center text-[11px]">
          <span className="text-zinc-500 font-medium">Bitrate</span>
          <span className="text-zinc-200 font-mono">{stats.bitrate} kb/s</span>
        </div>
        <div className="flex justify-between items-center text-[11px]">
          <span className="text-zinc-500 font-medium">CPU Usage</span>
          <div className="flex items-center gap-2">
            <div className="w-16 h-1.5 bg-zinc-950 rounded-full overflow-hidden">
               <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${stats.cpuUsage}%` }} />
            </div>
            <span className="text-zinc-200 font-mono w-6">{stats.cpuUsage}%</span>
          </div>
        </div>
        <div className="flex justify-between items-center text-[11px]">
          <span className="text-zinc-500 font-medium">Dropped Frames</span>
          <span className={`${stats.droppedFrames > 0 ? 'text-red-400' : 'text-zinc-500'}`}>{stats.droppedFrames} (0.0%)</span>
        </div>
      </div>
    </div>
  );
};
