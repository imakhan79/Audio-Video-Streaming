
import React, { useEffect, useRef, useState } from 'react';
import { Scene, Source } from '../types';
import { deviceManager } from '../services/deviceManager';

interface PreviewProps {
  scene: Scene;
  isStreaming: boolean;
}

export const Preview: React.FC<PreviewProps> = ({ scene, isStreaming }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement }>({});

  useEffect(() => {
    // Cleanup old streams
    // Explicitly cast to HTMLVideoElement[] to avoid 'unknown' type errors when accessing srcObject
    (Object.values(videoRefs.current) as HTMLVideoElement[]).forEach(v => {
      if (v.srcObject) (v.srcObject as MediaStream).getTracks().forEach(t => t.stop());
    });
    videoRefs.current = {};

    // Prepare streams for all visible webcam sources
    scene.sources.forEach(async (src) => {
      if (src.type === 'webcam' && src.deviceId && src.visible) {
        const stream = await deviceManager.getStream(src.deviceId);
        if (stream) {
          const video = document.createElement('video');
          video.srcObject = stream;
          video.play();
          videoRefs.current[src.id] = video;
        }
      }
    });
  }, [scene.sources]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frame: number;
    const render = () => {
      ctx.fillStyle = '#09090b';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const sorted = [...scene.sources].sort((a, b) => a.zIndex - b.zIndex);
      
      sorted.forEach(src => {
        if (!src.visible) return;

        ctx.save();
        if (src.type === 'webcam' && videoRefs.current[src.id]) {
          const v = videoRefs.current[src.id];
          ctx.drawImage(v, src.x, src.y, src.width, src.height);
        } else if (src.type === 'screen') {
          ctx.fillStyle = '#1e1b4b';
          ctx.fillRect(src.x, src.y, src.width, src.height);
          ctx.strokeStyle = '#3b82f6';
          ctx.setLineDash([10, 5]);
          ctx.strokeRect(src.x, src.y, src.width, src.height);
          ctx.fillStyle = '#fff';
          ctx.font = '32px font-sans';
          ctx.fillText("Primary Screen Capture", src.x + 40, src.y + 60);
        }
        ctx.restore();
      });

      frame = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(frame);
  }, [scene.sources]);

  return (
    <div className="relative w-full aspect-video bg-zinc-950 rounded-2xl border border-zinc-800 overflow-hidden shadow-2xl group cursor-crosshair">
      <canvas 
        ref={canvasRef} 
        width={1920} 
        height={1080} 
        className="w-full h-full object-contain"
      />
      
      <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10 text-[10px] font-black uppercase tracking-widest text-zinc-300">
        Program: {scene.name}
      </div>

      {isStreaming && (
        <div className="absolute top-4 right-4 flex items-center gap-2 bg-red-600 px-4 py-1.5 rounded-full text-[10px] font-black text-white shadow-lg shadow-red-600/30">
          <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
          LIVE ENCODING
        </div>
      )}

      {/* Resize handles simulation */}
      <div className="absolute inset-0 border-2 border-blue-500/20 pointer-events-none group-hover:border-blue-500/50 transition-all"></div>
    </div>
  );
};
