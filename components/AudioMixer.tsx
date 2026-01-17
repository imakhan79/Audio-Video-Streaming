
import React from 'react';
import { Source } from '../types';

interface AudioMixerProps {
  sources: Source[];
  onUpdateSource: (id: string, updates: Partial<Source>) => void;
}

export const AudioMixer: React.FC<AudioMixerProps> = ({ sources, onUpdateSource }) => {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Audio Mixer</h3>
        <button className="text-zinc-500 hover:text-zinc-300">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto space-y-4 pr-2">
        {sources.length === 0 ? (
          <div className="text-zinc-600 text-xs text-center py-8">No audio sources detected</div>
        ) : (
          sources.map(source => (
            <div key={source.id} className="bg-zinc-900/50 p-3 rounded-lg border border-zinc-800">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-medium text-zinc-300 truncate w-24">{source.name}</span>
                <span className="text-[10px] text-zinc-500">{source.volume}%</span>
              </div>
              
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => onUpdateSource(source.id, { muted: !source.muted })}
                  className={`p-1.5 rounded transition-colors ${source.muted ? 'bg-red-500/20 text-red-500' : 'bg-zinc-800 text-zinc-400 hover:text-white'}`}
                >
                  {source.muted ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" /></svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
                  )}
                </button>
                
                <div className="flex-1 h-8 bg-zinc-950 rounded flex items-center px-2 relative overflow-hidden">
                  <input 
                    type="range"
                    min="0"
                    max="100"
                    value={source.volume}
                    onChange={(e) => onUpdateSource(source.id, { volume: parseInt(e.target.value) })}
                    className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                  {/* Dynamic VU Meter Simulation */}
                  <div 
                    className="absolute top-0 left-0 h-full bg-green-500/20 pointer-events-none transition-all duration-75" 
                    style={{ width: source.muted ? '0%' : `${Math.random() * source.volume}%` }}
                  />
                </div>
              </div>
              
              <div className="mt-2 flex gap-1">
                <div className="flex-1 h-1 bg-zinc-950 rounded overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 opacity-30" />
                </div>
              </div>
            </div>
          ))}
        )}
      </div>
    </div>
  );
};
