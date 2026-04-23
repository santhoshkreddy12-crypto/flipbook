import React from 'react';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize, Highlighter, RotateCw } from 'lucide-react';

const MARKER_COLORS = [
  { value: 'rgba(253, 224, 71, 0.5)', bg: 'bg-yellow-400' },
  { value: 'rgba(134, 239, 172, 0.5)', bg: 'bg-green-400' },
  { value: 'rgba(249, 168, 212, 0.5)', bg: 'bg-pink-400' },
  { value: 'rgba(147, 197, 253, 0.5)', bg: 'bg-blue-400' }
];

const Controls = ({ pageNum, totalPages, onPrev, onNext, onZoomIn, onZoomOut, onFullscreen, onRotate, markerMode, setMarkerMode, markerColor, setMarkerColor }) => {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-panel/90 backdrop-blur-md px-6 py-3 rounded-full shadow-2xl border border-border-soft z-50 transition-all hover:bg-panel">
      
      <button className="text-muted hover:text-main p-2 rounded-full hover:bg-panel-hover transition cursor-pointer" onClick={onZoomOut} title="Zoom Out">
        <ZoomOut className="w-5 h-5" />
      </button>
      <button className="text-muted hover:text-main p-2 rounded-full hover:bg-panel-hover transition cursor-pointer" onClick={onZoomIn} title="Zoom In">
        <ZoomIn className="w-5 h-5" />
      </button>

      <div className="w-px h-6 bg-border-soft mx-1"></div>

      <button 
        onClick={onPrev}
        className="flex items-center justify-center text-white bg-blue-600 hover:bg-blue-500 active:scale-95 disabled:bg-ring-focus disabled:text-main/50 p-2 rounded-full transition shadow-lg shadow-blue-500/20 cursor-pointer"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      
      <div className="flex flex-col items-center justify-center min-w-[80px]">
        <span className="text-sm font-semibold tracking-wider text-main">
          {pageNum} <span className="text-muted font-normal">/ {totalPages}</span>
        </span>
      </div>

      <button 
        onClick={onNext}
        className="flex items-center justify-center text-white bg-blue-600 hover:bg-blue-500 active:scale-95 disabled:bg-ring-focus disabled:text-main/50 p-2 rounded-full transition shadow-lg shadow-blue-500/20 cursor-pointer"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      <div className="w-px h-6 bg-border-soft mx-1"></div>
      
      <button className="text-muted hover:text-main p-2 rounded-full hover:bg-panel-hover transition cursor-pointer" onClick={onFullscreen} title="Fullscreen">
        <Maximize className="w-5 h-5" />
      </button>

      <button className="text-muted hover:text-main p-2 rounded-full hover:bg-panel-hover transition cursor-pointer" onClick={onRotate} title="Rotate Screen">
        <RotateCw className="w-5 h-5" />
      </button>

      <div className="w-px h-6 bg-border-soft mx-1"></div>

      <div className="flex items-center gap-2">
        <button 
          className={`p-2 rounded-full transition cursor-pointer ${markerMode ? 'bg-yellow-400/20 text-yellow-600' : 'text-muted hover:bg-panel-hover hover:text-main'}`} 
          onClick={() => setMarkerMode(!markerMode)} 
          title="Highlight Mode"
        >
          <Highlighter className="w-5 h-5" />
        </button>
        
        {markerMode && (
          <div className="flex gap-1 animate-in fade-in slide-in-from-left-2 ml-1">
            {MARKER_COLORS.map(c => (
               <button
                 key={c.value}
                 onClick={() => setMarkerColor(c.value)}
                 className={`w-5 h-5 rounded-full ${c.bg} transition-transform ${markerColor === c.value ? 'scale-125 ring-2 ring-white shadow-md' : 'hover:scale-110 opacity-70'} cursor-pointer`}
               />
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default Controls;
