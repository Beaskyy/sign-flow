"use client";

import React, { useEffect, useRef, useState } from "react";
import pako from "pako";
import { initRenderer, destroyRenderer } from "@/lib/avatar/renderer";
import { parseMotionPayload } from "@/lib/avatar/api-utils";
import {
  loadFrames,
  play,
  pause,
  togglePlay,
  restart,
  seekTo,
  setSpeed,
  setOnFrameChange,
  tick as animatorTick,
} from "@/lib/avatar/animator";

const LandmarkAvatar = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showUpload, setShowUpload] = useState(true);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [totalFrames, setTotalFrames] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [info, setInfo] = useState({ glosses: "", frames: "0", duration: "—" });
  const [toast, setToast] = useState<{ msg: string; type: string } | null>(null);

  // Toast helper
  const showToast = (msg: string, type = "") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    if (containerRef.current) {
      initRenderer(containerRef.current).then(() => {
        showToast("Ready — drop a JSON file to start!", "success");
      });
    }

    const animLoop = () => {
      animatorTick();
      requestAnimationFrame(animLoop);
    };
    const reqId = requestAnimationFrame(animLoop);

    setOnFrameChange((idx, total) => {
      setCurrentFrame(idx);
      setTotalFrames(total);
    });

    return () => {
      cancelAnimationFrame(reqId);
      destroyRenderer();
    };
  }, []);

  const handleFileAction = async (file: File) => {
    if (!file.name.endsWith(".json")) {
      showToast("Please upload a .json file", "error");
      return;
    }

    try {
      const text = await file.text();
      const data = JSON.parse(text);
      processData(data);
    } catch (err: any) {
      showToast("Failed to parse JSON: " + err.message, "error");
    }
  };

  const processData = (data: any) => {
    try {
      const motionData = parseMotionPayload(data);
      if (!motionData || !motionData.sequence || motionData.sequence.length === 0) {
        showToast("No valid motion frames found in the JSON", "error");
        return;
      }

      const frames = motionData.sequence;
      const glosses = data.glosses || null;

      loadFrames(frames);
      setTotalFrames(frames.length);
      setShowUpload(false);
      setIsPlaying(true);
      play();

      // Update info
      const durSec = frames.length >= 2 
        ? (((frames[frames.length - 1].timestamp_ms || (frames.length - 1) * 33) - (frames[0].timestamp_ms || 0)) / 1000).toFixed(1)
        : "—";
      
      setInfo({
        glosses: glosses ? glosses.join(" → ") : "—",
        frames: String(frames.length),
        duration: durSec !== "—" ? `${durSec}s` : "—",
      });

      showToast(`Loaded ${frames.length} frames — press play!`, "success");
    } catch (err: any) {
      showToast("Failed to process data: " + err.message, "error");
    }
  };

  const handlePlayToggle = () => {
    const playing = togglePlay();
    setIsPlaying(playing);
  };

  const handleRestart = () => {
    restart();
    play();
    setIsPlaying(true);
  };

  const handleTimelineChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    seekTo(val);
    setCurrentFrame(val);
  };

  const handleSpeedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setSpeed(val);
    setPlaybackSpeed(val);
  };

  return (
    <div className="relative w-full h-full bg-[#0b0d11] overflow-hidden font-sans text-white select-none">
      {/* Renderer Container */}
      <div id="pixi-container" ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Upload Overlay */}
      {showUpload && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#0b0d11]/80 backdrop-blur-sm transition-all duration-500">
          <div 
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add("scale-105", "border-[#6C63FF]"); }}
            onDragLeave={(e) => { e.preventDefault(); e.currentTarget.classList.remove("scale-105", "border-[#6C63FF]"); }}
            onDrop={(e) => { e.preventDefault(); e.currentTarget.classList.remove("scale-105", "border-[#6C63FF]"); const file = e.dataTransfer.files[0]; if (file) handleFileAction(file); }}
            className="group relative flex flex-col items-center justify-center w-[400px] h-[260px] border-2 border-dashed border-white/20 rounded-[2rem] bg-white/5 hover:bg-white/10 hover:border-white/40 transition-all cursor-pointer overflow-hidden"
          >
            <div className="mb-6 w-16 h-16 rounded-full bg-[#6C63FF]/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg className="w-8 h-8 text-[#6C63FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Drop your landmark JSON</h3>
            <p className="text-white/50 text-sm">or click to browse files</p>
            <input type="file" ref={fileInputRef} className="hidden" accept=".json" onChange={(e) => e.target.files?.[0] && handleFileAction(e.target.files[0])} />
          </div>
        </div>
      )}

      {/* Info Panel */}
      {!showUpload && (
        <div className="absolute top-6 left-6 z-40 flex flex-col gap-3 p-5 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 shadow-2xl animate-in fade-in slide-in-from-left-4">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-wider text-white/40 mb-1">Gloss Sequence</span>
            <div className="text-sm font-medium text-[#6C63FF] leading-tight">{info.glosses}</div>
          </div>
          <div className="flex gap-6 mt-1">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-wider text-white/40 mb-0.5">Frames</span>
              <span className="text-sm tabular-nums">{info.frames}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-wider text-white/40 mb-0.5">Duration</span>
              <span className="text-sm tabular-nums">{info.duration}</span>
            </div>
          </div>
        </div>
      )}

      {/* Controls Bar */}
      {!showUpload && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 flex flex-col w-full max-w-[800px] px-6 animate-in fade-in slide-in-from-bottom-4">
          <div className="relative group mb-6 px-4 py-3 rounded-full bg-black/40 backdrop-blur-md border border-white/10 shadow-2xl flex items-center gap-4">
            <button onClick={handlePlayToggle} className="w-12 h-12 flex items-center justify-center rounded-full bg-[#6C63FF] hover:bg-[#7b73ff] hover:scale-105 active:scale-95 transition-all text-white shadow-[0_0_20px_rgba(108,99,255,0.4)]">
              {isPlaying ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 4h4v16H6zm8 0h4v16h-4z"/></svg>
              ) : (
                <svg className="w-6 h-6 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
              )}
            </button>

            <button onClick={handleRestart} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors text-white/70 hover:text-white">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            </button>

            <div className="flex-1 flex flex-col justify-center">
               <input 
                type="range" 
                min="0" 
                max={totalFrames - 1} 
                value={currentFrame} 
                onChange={handleTimelineChange}
                className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-[#6C63FF] hover:accent-[#7b73ff]"
               />
               <div className="flex justify-between mt-2 px-0.5">
                  <span className="text-[10px] font-medium text-white/30 tabular-nums">{currentFrame + 1} / {totalFrames}</span>
               </div>
            </div>

            <div className="flex items-center gap-3 pl-2 border-l border-white/10">
              <span className="text-[10px] font-bold text-white/40 w-5">Speed</span>
              <input 
                type="range" 
                min="0.1" 
                max="2" 
                step="0.1" 
                value={playbackSpeed} 
                onChange={handleSpeedChange}
                className="w-20 h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-[#6C63FF]"
              />
              <span className="text-[11px] font-bold text-[#6C63FF] min-w-[30px] tabular-nums">{playbackSpeed.toFixed(1)}×</span>
            </div>

            <button 
              onClick={() => { setShowUpload(true); pause(); setIsPlaying(false); }}
              className="ml-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider bg-white/5 hover:bg-white/15 transition-all text-white/60 hover:text-white"
            >
              New
            </button>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className={`absolute bottom-28 left-1/2 -translate-x-1/2 z-[60] px-6 py-3 rounded-2xl shadow-2xl backdrop-blur-xl border border-white/10 flex items-center gap-3 animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-300 ${toast.type === "error" ? "bg-red-500/20 text-red-100" : "bg-[#6C63FF]/20 text-blue-100"}`}>
          {toast.type === "success" ? (
             <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
          ) : (
             <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          )}
          <span className="text-sm font-medium">{toast.msg}</span>
        </div>
      )}
    </div>
  );
};

export default LandmarkAvatar;
