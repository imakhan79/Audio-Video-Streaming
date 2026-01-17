
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Scene, Source, AppState, StreamStats } from './types';
import { INITIAL_SCENES, INITIAL_PROFILE } from './constants';
import { Preview } from './components/Preview';
import { AudioMixer } from './components/AudioMixer';
import { ControlPanel } from './components/ControlPanel';
import { SettingsModal } from './components/SettingsModal';
import { streamEngine } from './services/streamEngine';
import { deviceManager, DeviceInfo } from './services/deviceManager';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    scenes: INITIAL_SCENES,
    activeSceneId: INITIAL_SCENES[0].id,
    isStreaming: false,
    isRecording: false,
    currentProfile: INITIAL_PROFILE,
    stats: {
      status: 'idle',
      uptime: '00:00:00',
      bitrate: 0,
      fps: 0,
      droppedFrames: 0,
      cpuUsage: 0,
    },
    logs: [`[System] Welcome to GeminiCast.`, `[System] Checking for hardware encoders...`],
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [cameras, setCameras] = useState<DeviceInfo[]>([]);
  const [activeTab, setActiveTab] = useState<'scenes' | 'sources'>('scenes');
  
  const activeScene = state.scenes.find(s => s.id === state.activeSceneId) || state.scenes[0];

  useEffect(() => {
    deviceManager.getCameras().then(setCameras);
  }, []);

  const addLog = useCallback((msg: string) => {
    setState(prev => ({
      ...prev,
      logs: [...prev.logs.slice(-49), `[${new Date().toLocaleTimeString()}] ${msg}`]
    }));
  }, []);

  const handleToggleStream = useCallback(async () => {
    if (state.isStreaming) {
      streamEngine.stop();
      addLog("Streaming stopped by user.");
      setState(prev => ({ ...prev, isStreaming: false, stats: { ...prev.stats, status: 'idle' } }));
    } else {
      addLog("Starting stream process...");
      streamEngine.start(state.currentProfile, activeScene, addLog);
      setState(prev => ({ ...prev, isStreaming: true, stats: { ...prev.stats, status: 'live' } }));
    }
  }, [state.isStreaming, state.currentProfile, activeScene, addLog]);

  const handleToggleRecord = useCallback(() => {
    if (state.isRecording) {
      addLog("Recording saved to " + state.currentProfile.recordPath);
      setState(prev => ({ ...prev, isRecording: false }));
    } else {
      addLog("Recording started...");
      setState(prev => ({ ...prev, isRecording: true }));
    }
  }, [state.isRecording, state.currentProfile, addLog]);

  const updateSource = (sourceId: string, updates: Partial<Source>) => {
    setState(prev => ({
      ...prev,
      scenes: prev.scenes.map(s => ({
        ...s,
        sources: s.sources.map(src => src.id === sourceId ? { ...src, ...updates } : src)
      }))
    }));
  };

  const addSource = async (type: Source['type']) => {
    let name = `New ${type}`;
    let deviceId = '';
    
    if (type === 'webcam' && cameras.length > 0) {
      name = cameras[0].label;
      deviceId = cameras[0].id;
    }

    const newSource: Source = {
      id: `src-${Date.now()}`,
      name,
      type,
      visible: true,
      locked: false,
      x: 50,
      y: 50,
      width: type === 'webcam' ? 640 : 1920,
      height: type === 'webcam' ? 480 : 1080,
      volume: 100,
      muted: false,
      zIndex: activeScene.sources.length,
      deviceId
    };

    setState(prev => ({
      ...prev,
      scenes: prev.scenes.map(s => s.id === state.activeSceneId ? { ...s, sources: [...s.sources, newSource] } : s)
    }));
    addLog(`Added source: ${name}`);
  };

  return (
    <div className="flex flex-col h-screen bg-[#09090b] text-zinc-100 overflow-hidden font-sans select-none">
      {/* Top Header */}
      <header className="h-12 border-b border-zinc-800 flex items-center justify-between px-6 bg-zinc-900/80 backdrop-blur-md z-50">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center font-black text-sm shadow-lg shadow-blue-500/20">G</div>
            <span className="font-bold text-sm tracking-tight">GeminiCast <span className="text-zinc-500 font-medium ml-1">Pro v1.2</span></span>
          </div>
          <nav className="flex gap-6 text-[11px] font-bold uppercase tracking-wider text-zinc-500">
            <button className="hover:text-white transition-colors">File</button>
            <button className="hover:text-white transition-colors">Edit</button>
            <button className="hover:text-white transition-colors">View</button>
            <button className="hover:text-white transition-colors">Tools</button>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <div className={`px-3 py-1 rounded-full text-[10px] font-bold border flex items-center gap-2 transition-all ${state.isStreaming ? 'bg-red-500/10 border-red-500/50 text-red-500' : 'bg-green-500/10 border-green-500/50 text-green-500'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${state.isStreaming ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`}></span>
            {state.isStreaming ? 'LIVE' : 'READY'}
          </div>
          <button onClick={() => setIsSettingsOpen(true)} className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-all">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          </button>
        </div>
      </header>

      {/* Main UI */}
      <main className="flex-1 flex overflow-hidden p-6 gap-6">
        {/* Left Bar */}
        <div className="w-80 flex flex-col gap-6">
          <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden flex flex-col shadow-xl">
             <div className="flex bg-zinc-950/50 p-1 border-b border-zinc-800">
               <button 
                onClick={() => setActiveTab('scenes')}
                className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${activeTab === 'scenes' ? 'bg-zinc-800 text-white shadow' : 'text-zinc-500 hover:text-zinc-300'}`}
               >Scenes</button>
               <button 
                onClick={() => setActiveTab('sources')}
                className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${activeTab === 'sources' ? 'bg-zinc-800 text-white shadow' : 'text-zinc-500 hover:text-zinc-300'}`}
               >Sources</button>
             </div>
             
             <div className="flex-1 p-4 overflow-y-auto space-y-2">
                {activeTab === 'scenes' ? (
                  state.scenes.map(s => (
                    <button 
                      key={s.id}
                      onClick={() => setState(prev => ({ ...prev, activeSceneId: s.id }))}
                      className={`w-full text-left px-4 py-3 rounded-xl transition-all font-medium text-sm flex items-center justify-between group ${state.activeSceneId === s.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-zinc-800/50 text-zinc-400 hover:bg-zinc-800'}`}
                    >
                      {s.name}
                      <svg className={`w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity ${state.activeSceneId === s.id ? 'opacity-100' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>
                    </button>
                  ))
                ) : (
                  activeScene.sources.map(src => (
                    <div key={src.id} className="flex items-center gap-3 px-3 py-2.5 bg-zinc-800/50 border border-zinc-700/50 rounded-xl group hover:border-zinc-600 transition-all">
                      <button onClick={() => updateSource(src.id, { visible: !src.visible })} className={`transition-colors ${src.visible ? 'text-blue-500' : 'text-zinc-600'}`}>
                         {src.visible ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg> : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" /></svg>}
                      </button>
                      <span className="flex-1 text-[11px] font-bold truncate">{src.name}</span>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button onClick={() => updateSource(src.id, { locked: !src.locked })} className="text-zinc-600 hover:text-white transition-colors">
                            {src.locked ? <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 00-2 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg> : <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 00-2 2z" /></svg>}
                         </button>
                      </div>
                    </div>
                  ))
                )}
             </div>

             <div className="p-3 bg-zinc-950/50 flex gap-2 border-t border-zinc-800">
                <button onClick={() => addSource('webcam')} className="flex-1 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-[10px] font-bold uppercase transition-all">+ Device</button>
                <button onClick={() => addSource('screen')} className="flex-1 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-[10px] font-bold uppercase transition-all">+ Screen</button>
             </div>
          </div>

          <div className="h-64 bg-zinc-900 border border-zinc-800 rounded-2xl p-4 shadow-xl">
            <AudioMixer sources={activeScene.sources} onUpdateSource={updateSource} />
          </div>
        </div>

        {/* Center Canvas */}
        <div className="flex-1 flex flex-col gap-6">
          <Preview scene={activeScene} isStreaming={state.isStreaming} />
          
          <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl flex flex-col">
            <div className="flex items-center justify-between mb-4">
               <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Live Feedback & Debug</h3>
               <div className="flex items-center gap-4 text-[10px] font-mono text-zinc-400">
                  <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div> FPS: {state.isStreaming ? '60.0' : '0.0'}</span>
                  <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-green-500"></div> Bitrate: {state.stats.bitrate} kb/s</span>
               </div>
            </div>
            <div className="flex-1 bg-black/50 rounded-xl p-4 font-mono text-[11px] text-zinc-400 overflow-y-auto space-y-1.5 border border-zinc-800/50 scrollbar-thin">
               {state.logs.map((log, i) => (
                 <div key={i} className={log.includes('[Engine]') ? 'text-blue-400/80' : log.includes('error') ? 'text-red-400' : ''}>
                    {log}
                 </div>
               ))}
               <div className="animate-pulse">_</div>
            </div>
          </div>
        </div>

        {/* Right Bar */}
        <div className="w-80 flex flex-col gap-6">
          <ControlPanel 
            isStreaming={state.isStreaming}
            isRecording={state.isRecording}
            onToggleStream={handleToggleStream}
            onToggleRecord={handleToggleRecord}
            onOpenSettings={() => setIsSettingsOpen(true)}
            stats={state.stats}
          />
          
          <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-all">
               <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>
             </div>
             <h4 className="text-xs font-black uppercase tracking-widest mb-2 text-blue-400">Pro Feature</h4>
             <h3 className="text-lg font-bold mb-4 leading-tight">AI Scene Switcher</h3>
             <p className="text-xs text-zinc-400 mb-6">Let Gemini detect your focus and automatically switch scenes based on gameplay or interaction.</p>
             <button className="w-full py-3 bg-white text-zinc-900 rounded-xl font-black text-xs uppercase hover:bg-zinc-200 transition-all shadow-xl shadow-white/10">Configure AI</button>
          </div>

          <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl">
             <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-4">Quick Shortcuts</h3>
             <div className="space-y-3">
                {[
                  { k: 'F1', d: 'Switch to Gameplay' },
                  { k: 'F2', d: 'Switch to Chatting' },
                  { k: 'Ctrl+S', d: 'Start Stream' },
                  { k: 'Ctrl+R', d: 'Start Recording' },
                ].map(item => (
                  <div key={item.k} className="flex items-center justify-between">
                    <span className="text-xs text-zinc-400">{item.d}</span>
                    <kbd className="px-2 py-0.5 bg-zinc-800 border border-zinc-700 rounded text-[10px] font-bold text-zinc-200">{item.k}</kbd>
                  </div>
                ))}
             </div>
          </div>
        </div>
      </main>

      <footer className="h-8 bg-blue-600 px-6 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider shadow-lg shadow-blue-500/50">
         <div className="flex gap-6">
            <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div> Live: {state.stats.uptime}</span>
            <span className="opacity-70">Rec: {state.isRecording ? '00:04:12' : '00:00:00'}</span>
         </div>
         <div className="flex gap-6">
            <span>CPU: 14.2%</span>
            <span>Mem: 452MB</span>
            <span>DROPPED: 0 (0.0%)</span>
         </div>
      </footer>

      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        profile={state.currentProfile}
        onSave={(p) => setState(prev => ({ ...prev, currentProfile: p }))}
      />
    </div>
  );
};

export default App;
