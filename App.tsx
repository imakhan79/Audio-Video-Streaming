
import React, { useState, useEffect, useCallback } from 'react';
import { Scene, Source, AppState, StreamStats } from './types';
import { INITIAL_SCENES, DEFAULT_PROFILE } from './constants';
import { Preview } from './components/Preview';
import { AudioMixer } from './components/AudioMixer';
import { ControlPanel } from './components/ControlPanel';
import { streamEngine } from './services/streamEngine';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    scenes: INITIAL_SCENES,
    activeSceneId: INITIAL_SCENES[0].id,
    isStreaming: false,
    isRecording: false,
    stats: {
      fps: 0,
      bitrate: 0,
      droppedFrames: 0,
      cpuUsage: 12,
      gpuUsage: 8,
      uptime: '00:00:00'
    },
    currentProfile: DEFAULT_PROFILE,
    logs: []
  });

  const [activeTab, setActiveTab] = useState<'scenes' | 'sources'>('scenes');

  const activeScene = state.scenes.find(s => s.id === state.activeSceneId) || state.scenes[0];

  const handleToggleStream = useCallback(async () => {
    if (state.isStreaming) {
      streamEngine.stopStreaming();
      setState(prev => ({ ...prev, isStreaming: false }));
    } else {
      const success = await streamEngine.startStreaming(state.currentProfile, activeScene);
      if (success) {
        setState(prev => ({ ...prev, isStreaming: true }));
      }
    }
  }, [state.isStreaming, state.currentProfile, activeScene]);

  const handleToggleRecord = useCallback(async () => {
    if (state.isRecording) {
      setState(prev => ({ ...prev, isRecording: false }));
    } else {
      await streamEngine.startRecording(state.currentProfile, activeScene);
      setState(prev => ({ ...prev, isRecording: true }));
    }
  }, [state.isRecording, state.currentProfile, activeScene]);

  const updateSource = (sourceId: string, updates: Partial<Source>) => {
    setState(prev => ({
      ...prev,
      scenes: prev.scenes.map(scene => ({
        ...scene,
        sources: scene.sources.map(src => 
          src.id === sourceId ? { ...src, ...updates } : src
        )
      }))
    }));
  };

  const addSource = (type: Source['type']) => {
    const newSource: Source = {
      id: `source-${Date.now()}`,
      name: `New ${type}`,
      type,
      visible: true,
      locked: false,
      x: 100,
      y: 100,
      width: 400,
      height: 300,
      volume: 100,
      muted: false,
      zIndex: activeScene.sources.length
    };

    setState(prev => ({
      ...prev,
      scenes: prev.scenes.map(s => 
        s.id === state.activeSceneId 
          ? { ...s, sources: [...s.sources, newSource] }
          : s
      )
    }));
  };

  // Mock stats update
  useEffect(() => {
    const interval = setInterval(() => {
      if (state.isStreaming || state.isRecording) {
        setState(prev => ({
          ...prev,
          stats: {
            ...prev.stats,
            bitrate: state.isStreaming ? 4500 + Math.floor(Math.random() * 200) : 0,
            cpuUsage: 15 + Math.floor(Math.random() * 10),
            gpuUsage: 10 + Math.floor(Math.random() * 5),
          }
        }));
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [state.isStreaming, state.isRecording]);

  return (
    <div className="flex flex-col h-screen bg-[#09090b] text-zinc-100 overflow-hidden select-none">
      {/* Top Header */}
      <header className="h-12 border-b border-zinc-800 flex items-center justify-between px-4 bg-zinc-900/50 backdrop-blur-md z-50">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center font-bold text-xs">G</div>
            <span className="font-bold text-sm tracking-tight">GeminiCast <span className="text-zinc-500 font-normal">v1.2.0</span></span>
          </div>
          <nav className="flex gap-4 text-xs font-medium text-zinc-400">
            <button className="hover:text-white transition-colors">File</button>
            <button className="hover:text-white transition-colors">Edit</button>
            <button className="hover:text-white transition-colors">View</button>
            <button className="hover:text-white transition-colors">Profile</button>
            <button className="hover:text-white transition-colors">Help</button>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-3 py-1 rounded bg-zinc-800 border border-zinc-700 text-[10px] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            RTMP Connected
          </div>
          <button className="p-1.5 hover:bg-zinc-800 rounded-full text-zinc-400 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex overflow-hidden p-4 gap-4">
        {/* Left Side: Scenes & Sources */}
        <div className="w-80 flex flex-col gap-4">
          {/* Tabs Container */}
          <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden flex flex-col shadow-lg">
            <div className="flex bg-zinc-950 border-b border-zinc-800">
              <button 
                onClick={() => setActiveTab('scenes')}
                className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${activeTab === 'scenes' ? 'text-white border-b-2 border-blue-500 bg-zinc-900' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                Scenes
              </button>
              <button 
                onClick={() => setActiveTab('sources')}
                className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${activeTab === 'sources' ? 'text-white border-b-2 border-blue-500 bg-zinc-900' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                Sources
              </button>
            </div>

            <div className="flex-1 p-3 overflow-y-auto">
              {activeTab === 'scenes' ? (
                <div className="space-y-1">
                  {state.scenes.map(scene => (
                    <button
                      key={scene.id}
                      onClick={() => setState(prev => ({ ...prev, activeSceneId: scene.id }))}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all group ${state.activeSceneId === scene.id ? 'bg-blue-600 text-white shadow-lg' : 'hover:bg-zinc-800 text-zinc-400'}`}
                    >
                      <span className="text-sm font-medium">{scene.name}</span>
                      <svg className={`w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity ${state.activeSceneId === scene.id ? 'opacity-100' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>
                    </button>
                  ))}
                  <button className="w-full mt-2 py-2 flex items-center justify-center gap-2 rounded-lg border border-dashed border-zinc-700 text-zinc-500 hover:border-zinc-500 hover:text-zinc-300 text-xs transition-all">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    New Scene
                  </button>
                </div>
              ) : (
                <div className="space-y-1">
                   {activeScene.sources.length === 0 ? (
                     <div className="flex flex-col items-center justify-center h-40 text-zinc-600">
                        <svg className="w-10 h-10 mb-2 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <p className="text-xs">No sources in this scene</p>
                     </div>
                   ) : (
                    activeScene.sources.sort((a,b) => b.zIndex - a.zIndex).map(source => (
                      <div 
                        key={source.id} 
                        className="flex items-center gap-3 px-3 py-2 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 border border-transparent hover:border-zinc-700 transition-all cursor-pointer group"
                      >
                        <button onClick={() => updateSource(source.id, { visible: !source.visible })} className={`text-zinc-500 hover:text-white ${!source.visible ? 'opacity-50' : ''}`}>
                          {source.visible ? (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                          ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" /></svg>
                          )}
                        </button>
                        <span className="flex-1 text-xs font-medium truncate">{source.name}</span>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => updateSource(source.id, { locked: !source.locked })} className="text-zinc-500 hover:text-white">
                             {source.locked ? (
                               <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 00-2 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                             ) : (
                               <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 00-2 2z" /></svg>
                             )}
                          </button>
                          <button className="text-zinc-500 hover:text-red-400">
                             <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </div>
                      </div>
                    ))
                   )}
                </div>
              )}
            </div>
            
            <div className="p-2 bg-zinc-950 flex gap-2 border-t border-zinc-800">
              <button 
                onClick={() => addSource('webcam')}
                className="flex-1 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-xs font-bold transition-all"
              >
                +
              </button>
              <button className="p-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-xs transition-all">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </button>
            </div>
          </div>

          {/* Audio Mixer Container */}
          <div className="h-1/3 bg-zinc-900 border border-zinc-800 rounded-xl p-4 shadow-lg">
             <AudioMixer sources={activeScene.sources} onUpdateSource={updateSource} />
          </div>
        </div>

        {/* Center: Canvas Preview */}
        <div className="flex-1 flex flex-col gap-4">
          <Preview scene={activeScene} isStreaming={state.isStreaming} />
          
          {/* Timeline / Scene Transitions */}
          <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col shadow-lg">
             <div className="flex items-center justify-between mb-2">
               <h3 className="text-xs font-semibold text-zinc-500 uppercase">Scene Transitions</h3>
               <span className="text-xs text-blue-400 font-medium">Cut (Instant)</span>
             </div>
             <div className="flex-1 border-2 border-dashed border-zinc-800 rounded-lg flex items-center justify-center text-zinc-600 text-sm italic">
                Drag sources here to keyframe animations
             </div>
          </div>
        </div>

        {/* Right Side: Controls & Tools */}
        <div className="w-80 flex flex-col gap-4">
          <ControlPanel 
            isStreaming={state.isStreaming}
            isRecording={state.isRecording}
            onToggleStream={handleToggleStream}
            onToggleRecord={handleToggleRecord}
            onOpenSettings={() => {}}
            stats={state.stats}
          />

          <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl p-4 shadow-lg overflow-hidden flex flex-col">
            <h3 className="text-xs font-semibold text-zinc-500 uppercase mb-3">System Log</h3>
            <div className="flex-1 bg-black/40 rounded-lg p-3 font-mono text-[10px] overflow-y-auto space-y-1">
               <div className="text-zinc-500">[14:22:01] Loading hardware acceleration...</div>
               <div className="text-green-500">[14:22:02] NVENC detected: GeForce RTX 4080</div>
               <div className="text-zinc-400">[14:22:02] RTMP handshake initialized</div>
               <div className="text-zinc-500">[14:22:03] Loading Scene: {activeScene.name}</div>
               {state.isStreaming && <div className="text-red-400 animate-pulse">[14:23:44] STREAMING LIVE: 4.5 Mbps</div>}
               <div className="text-zinc-600">--- END OF LOG ---</div>
            </div>
          </div>

          {/* AI Feature Panel (GeminiCast unique feature) */}
          <div className="bg-gradient-to-br from-indigo-900 to-purple-900 border border-white/10 rounded-xl p-4 shadow-xl">
             <div className="flex items-center gap-2 mb-2">
               <div className="p-1 bg-white/20 rounded">
                 <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
               </div>
               <span className="text-xs font-bold text-white">AI Stream Assistant</span>
             </div>
             <p className="text-[10px] text-white/70 mb-3">Gemini is monitoring your chat and can auto-generate highlights or captions.</p>
             <button className="w-full py-2 bg-white text-indigo-900 rounded-lg text-xs font-bold hover:bg-white/90 transition-all">
                Enable AI Overlay
             </button>
          </div>
        </div>
      </main>

      {/* Footer Status Bar */}
      <footer className="h-8 bg-blue-600 flex items-center px-4 justify-between text-[10px] font-bold text-white">
        <div className="flex gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
            LIVE: {state.stats.uptime}
          </div>
          <div>REC: {state.isRecording ? '00:12:44' : '00:00:00'}</div>
        </div>
        <div className="flex gap-4">
          <div>CPU: {state.stats.cpuUsage}%</div>
          <div>FPS: {state.isStreaming ? '60.00' : '30.00'}</div>
          <div>KB/s: {state.stats.bitrate}</div>
        </div>
      </footer>
    </div>
  );
};

export default App;
