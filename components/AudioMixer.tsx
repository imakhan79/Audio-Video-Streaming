
import React, { useState, useEffect } from 'react';
import { Source } from '../types';

interface AudioMixerProps {
  sources: Source[];
  onUpdateSource: (id: string, updates: Partial<Source>) => void;
}

export const AudioMixer: React.FC<AudioMixerProps> = ({ sources, onUpdateSource }) => {
  const [levels, setLevels] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    const interval = setInterval(() => {
      const newLevels: { [key: string]: number } = {};
      sources.forEach(s => {
        if (!s.muted) {
          // Simulate dynamic noise
          newLevels[s.id] = (s.volume / 100) * (60 + Math.random() * 40);
        } else {
          newLevels[s.id] = 0;
        }
      });
      setLevels(newLevels);
    }, 100);
    return () => clearInterval(interval);
  }, [sources]);

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Audio Mixer</h3>
        <button className="text-zinc-600 hover:text-white transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 space-y-4 scrollbar-thin">
        {sources.filter(s => s.type === 'webcam' || s.type === 'screen').map(s => (
          <div key={s.id} className="space-y-2">
            <div className="flex justify-between items-center px-1">
              <span className="text-[10px] font-bold text-zinc-300 truncate w-32">{s.name}</span>
              <span className="text-[9px] font-mono text-zinc-500">{s.volume}%</span>
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={() => onUpdateSource(s.id, { muted: !s.muted })}
                className={`p-1.5 rounded-lg transition-all ${s.muted ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'bg-zinc-800 text-zinc-500 hover:text-white'}`}
              >
                {s.muted ? <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" /></svg> : <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>}
              </button>

              <div className="flex-1 h-2 bg-zinc-950 rounded-full relative overflow-hidden">
                <div 
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 opacity-80 transition-all duration-75"
                  style={{ width: `${levels[s.id] || 0}%` }}
                />
                <input 
                  type="range"
                  min="0" max="100"
                  value={s.volume}
                  onChange={(e) => onUpdateSource(s.id, { volume: parseInt(e.target.value) })}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
