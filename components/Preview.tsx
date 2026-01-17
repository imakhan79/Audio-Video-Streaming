
import React, { useEffect, useRef } from 'react';
import { Scene, Source } from '../types';

interface PreviewProps {
  scene: Scene;
  isStreaming: boolean;
}

export const Preview: React.FC<PreviewProps> = ({ scene, isStreaming }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const render = () => {
      // Clear canvas with a dark background
      ctx.fillStyle = '#09090b';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Render sources in Z-order
      const sortedSources = [...scene.sources].sort((a, b) => a.zIndex - b.zIndex);
      
      sortedSources.forEach(source => {
        if (!source.visible) return;

        ctx.save();
        
        if (source.type === 'color') {
          ctx.fillStyle = source.contentUrl || '#3f3f46';
          ctx.fillRect(source.x, source.y, source.width, source.height);
        } else {
          // Placeholder for other types
          ctx.strokeStyle = '#3b82f6';
          ctx.lineWidth = 2;
          ctx.strokeRect(source.x, source.y, source.width, source.height);
          
          ctx.fillStyle = 'rgba(59, 130, 246, 0.2)';
          ctx.fillRect(source.x, source.y, source.width, source.height);
          
          ctx.fillStyle = '#fff';
          ctx.font = '24px Inter';
          ctx.fillText(source.name, source.x + 10, source.y + 30);
        }
        
        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [scene]);

  return (
    <div className="relative w-full aspect-video bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden shadow-2xl group">
      <canvas 
        ref={canvasRef} 
        width={1920} 
        height={1080}
        className="w-full h-full object-contain"
      />
      
      {/* Overlay Status */}
      <div className="absolute top-4 left-4 flex gap-2">
        {isStreaming && (
          <div className="flex items-center gap-2 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse">
            <span className="w-2 h-2 bg-white rounded-full"></span>
            LIVE
          </div>
        )}
        <div className="bg-black/60 backdrop-blur-md text-zinc-300 px-3 py-1 rounded-full text-xs border border-white/10">
          Preview: {scene.name}
        </div>
      </div>

      <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="bg-black/80 backdrop-blur-md p-2 rounded-lg border border-white/10 flex gap-2">
          <button className="p-1 hover:bg-white/10 rounded"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg></button>
          <button className="p-1 hover:bg-white/10 rounded"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg></button>
        </div>
      </div>
    </div>
  );
};
