
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
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [showStats, setShowStats] = useState(true);
  const [showLogs, setShowLogs] = useState(true);
  
  const menuRef = useRef<HTMLDivElement>(null);
  const activeScene = state.scenes.find(s => s.id === state.activeSceneId) || state.scenes[0];

  useEffect(() => {
    deviceManager.getCameras().then(setCameras);
    
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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

  const createNewScene = () => {
    const newScene: Scene = {
      id: `s-${Date.now()}`,
      name: `Scene: ${state.scenes.length + 1}`,
      sources: []
    };
    setState(prev => ({ ...prev, scenes: [...prev.scenes, newScene], activeSceneId: newScene.id }));
    addLog("Created new scene.");
    setActiveMenu(null);
  };

  const deleteActiveScene = () => {
    if (state.scenes.length <= 1) {
      addLog("Cannot delete the last scene.");
      return;
    }
    const newScenes = state.scenes.filter(s => s.id !== state.activeSceneId);
    setState(prev => ({ ...prev, scenes: newScenes, activeSceneId: newScenes[0].id }));
    addLog("Deleted scene.");
    setActiveMenu(null);
  };

  const toggleMenu = (menu: string) => {
    setActiveMenu(activeMenu === menu ? null : menu);
  };

  const MenuDropdown = ({ items }: { items: { label: string; action: () => void; shortcut?: string; variant?: 'default' | 'danger' }[] }) => (
    <div className="absolute top-full left-0 mt-1 w-56 bg-zinc-900/95 backdrop-blur-xl border border-zinc-800 rounded-xl shadow-2xl py-2 z-[60] overflow-hidden">
      {items.map((item, idx) => (
        <button
          key={idx}
          onClick={() => {
            item.action();
            setActiveMenu(null);
          }}
          className={`w-full flex items-center justify-between px-4 py-2.5 text-[11px] font-medium transition-colors ${item.variant === 'danger' ? 'text-red-400 hover:bg-red-500/10' : 'text-zinc-300 hover:bg-zinc-800 hover:text-white'}`}
        >
          <span>{item.label}</span>
          {item.shortcut && <span className="text-[9px] text-zinc-600 font-mono">{item.shortcut}</span>}
        </button>
      ))}
    </div>
  );

  return (
    <div className="flex flex-col h-screen bg-[#09090b] text-zinc-100 overflow-hidden font-sans select-none">
      {/* Top Header */}
      <header className="h-12 border-b border-zinc-800 flex items-center justify-between px-6 bg-zinc-900/80 backdrop-blur-md z-50">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center font-black text-sm shadow-lg shadow-blue-500/20">G</div>
            <span className="font-bold text-sm tracking-tight">GeminiCast <span className="text-zinc-500 font-medium ml-1">Pro v1.2</span></span>
          </div>
          <nav className="flex gap-1 text-[11px] font-bold uppercase tracking-wider text-zinc-500" ref={menuRef}>
            <div className="relative">
              <button 
                onClick={() => toggleMenu('file')}
                className={`px-3 py-1.5 rounded-lg transition-all ${activeMenu === 'file' ? 'bg-zinc-800 text-white border border-white/20' : 'hover:text-white'}`}
              >File</button>
              {activeMenu === 'file' && (
                <MenuDropdown items={[
                  { label: 'New Profile', action: () => addLog('Creating new profile...') },
                  { label: 'Import Profile', action: () => addLog('Open file picker...') },
                  { label: 'Export Profile', action: () => addLog('Saving profile.json...') },
                  { label: 'Settings', action: () => setIsSettingsOpen(true), shortcut: 'Ctrl+,' },
                  { label: 'Exit', action: () => window.close(), variant: 'danger' }
                ]} />
              )}
            </div>
            <div className="relative">
              <button 
                onClick={() => toggleMenu('edit')}
                className={`px-3 py-1.5 rounded-lg transition-all ${activeMenu === 'edit' ? 'bg-zinc-800 text-white border border-white/20' : 'hover:text-white'}`}
              >Edit</button>
              {activeMenu === 'edit' && (
                <MenuDropdown items={[
                  { label: 'Undo', action: () => {}, shortcut: 'Ctrl+Z' },
                  { label: 'Redo', action: () => {}, shortcut: 'Ctrl+Y' },
                  { label: 'New Scene', action: createNewScene },
                  { label: 'Delete Scene', action: deleteActiveScene, variant: 'danger' },
                  { label: 'Copy Scene Link', action: () => addLog('Copied scene hash.') }
                ]} />
              )}
            </div>
            <div className="relative">
              <button 
                onClick={() => toggleMenu('view')}
                className={`px-3 py-1.5 rounded-lg transition-all ${activeMenu === 'view' ? 'bg-zinc-800 text-white border border-white/20' : 'hover:text-white'}`}
              >View</button>
              {activeMenu === 'view' && (
                <MenuDropdown items={[
                  { label: showStats ? 'Hide Feedback Stats' : 'Show Feedback Stats', action: () => setShowStats(!showStats) },
                  { label: showLogs ? 'Hide System Logs' : 'Show System Logs', action: () => setShowLogs(!showLogs) },
                  { label: 'Reset UI Layout', action: () => { setShowStats(true); setShowLogs(true); } },
                  { label: 'Toggle Fullscreen', action: () => {}, shortcut: 'F11' }
                ]} />
              )}
            </div>
            <div className="relative">
              <button 
                onClick={() => toggleMenu('tools')}
                className={`px-3 py-1.5 rounded-lg transition-all ${activeMenu === 'tools' ? 'bg-zinc-800 text-white border border-white/20' : 'hover:text-white'}`}
              >Tools</button>
              {activeMenu === 'tools' && (
                <MenuDropdown items={[
                  { label: 'Virtual Camera', action: () => addLog('Virtual camera driver enabled.') },
                  { label: 'AI Scene Switcher', action: () => addLog('Configuring AI patterns...') },
                  { label: 'Check for Updates', action: () => addLog('Checking GitHub releases...') },
                  { label: 'Output Timer', action: () => {} }
                ]} />
              )}
            </div>
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
          
          <div className="flex-1 flex flex-col gap-6">
            {showStats && (
              <div className="h-24 bg-zinc-900 border border-zinc-800 rounded-2xl p-4 shadow-xl flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Output Stats</h3>
                  <div className="flex gap-6 text-[10px] font-mono">
                    <span className="text-zinc-400">FPS: <span className={state.isStreaming ? 'text-green-400' : 'text-zinc-600'}>{state.isStreaming ? '60.0' : '0.0'}</span></span>
                    <span className="text-zinc-400">Bitrate: <span className={state.isStreaming ? 'text-blue-400' : 'text-zinc-600'}>{state.stats.bitrate} kb/s</span></span>
                    <span className="text-zinc-400">Dropped: <span className="text-zinc-600">0 (0.0%)</span></span>
                  </div>
                </div>
                <div className="w-1/3 bg-zinc-950 h-8 rounded-lg overflow-hidden flex items-center px-4">
                  <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 w-[14%]" />
                  </div>
                  <span className="ml-4 text-[9px] font-mono text-zinc-500">CPU 14.2%</span>
                </div>
              </div>
            )}
            
            {showLogs && (
              <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl flex flex-col min-h-0">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-500">System Log</h3>
                  <button onClick={() => setState(prev => ({ ...prev, logs: [`[System] Log cleared.`] }))} className="text-[9px] text-zinc-600 hover:text-zinc-400 transition-colors">Clear All</button>
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
            )}
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
             <button onClick={() => addLog("AI Assistant activated in monitor mode.")} className="w-full py-3 bg-white text-zinc-900 rounded-xl font-black text-xs uppercase hover:bg-zinc-200 transition-all shadow-xl shadow-white/10">Configure AI</button>
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
