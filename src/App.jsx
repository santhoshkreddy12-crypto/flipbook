import React, { useState, useRef, useEffect, useCallback } from 'react';
import Upload from './components/Upload';
import FlipbookViewer from './components/FlipbookViewer';
import Controls from './components/Controls';
import { BookOpen, Moon, Sun, Coffee, Highlighter } from 'lucide-react';

function App() {
  const [file, setFile] = useState(null);
  const [pageNum, setPageNum] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [dimensions, setDimensions] = useState({ width: 400, height: 600 });
  const [theme, setTheme] = useState('dark');
  const [markerMode, setMarkerMode] = useState(false);
  const [markerColor, setMarkerColor] = useState('rgba(253, 224, 71, 0.5)'); // yellow highlight
  const [rotation, setRotation] = useState(0);
  const bookRef = useRef(null);
  // const [audio] = useState(() => new Audio('/page-flip.wav'));

  // Theme toggle logic
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const cycleTheme = () => {
    setTheme(prev => {
      if (prev === 'dark') return 'sepia';
      if (prev === 'sepia') return 'light';
      return 'dark';
    });
  };

  useEffect(() => {
    const updateDimensions = () => {
      const isMobile = window.innerWidth < 768;
      const width = isMobile ? window.innerWidth - 40 : Math.min(window.innerWidth / 2 - 50, 550);
      const height = isMobile ? window.innerHeight - 200 : Math.min(window.innerHeight - 150, 800);
      setDimensions({ width, height });
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const handleFileUpload = (uploadedFile) => {
    setFile(uploadedFile);
    setPageNum(1);
  };

  // const playFlipSound = () => {
  //   try {
  //     audio.currentTime = 0;
  //     audio.volume = 0.6;
  //     audio.play().catch(e => console.log("Audio play suppressed by browser"));
  //   } catch (e) {
  //     console.log("Audio not available");
  //   }
  // };

  const handlePageChange = useCallback((newPageIndices) => {
    let current_page = newPageIndices;
    if (Array.isArray(newPageIndices)) {
      current_page = newPageIndices[0];
    }
    setPageNum(current_page + 1);
    
  }, []);

  const handleLoadSuccess = useCallback((pagesCount) => {
    setTotalPages(pagesCount);
  }, []);

  const goNext = () => {
    if (bookRef.current && bookRef.current.pageFlip()) {
      bookRef.current.pageFlip().flipNext();
    }
  };

  const goPrev = () => {
    if (bookRef.current && bookRef.current.pageFlip()) {
      bookRef.current.pageFlip().flipPrev();
    }
  };

  const resetFile = () => {
    setFile(null);
    setTotalPages(0);
    setPageNum(0);
  };

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error("Error attempting to enable fullscreen", err);
      });
    } else {
      document.exitFullscreen();
    }
  };

  const handleZoomIn = () => {
    setDimensions(prev => ({ width: prev.width * 1.1, height: prev.height * 1.1 }));
  };

  const handleZoomOut = () => {
    setDimensions(prev => ({ width: prev.width * 0.9, height: prev.height * 0.9 }));
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  return (
    <div className="min-h-[100dvh] bg-base text-main overflow-hidden flex flex-col font-sans relative selection:bg-blue-500/30 transition-colors duration-500">
      <header className="p-4 border-b border-border-soft bg-base/80 backdrop-blur-md z-10 flex items-center justify-between shadow-sm relative">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600 rounded-lg shadow-lg shadow-blue-500/30 text-white">
            <BookOpen className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">
            PDF Flipbook
          </h1>
        </div>
        
        <div className="flex items-center gap-4">
          <button onClick={cycleTheme} className="p-2 rounded-full border border-border-soft bg-panel hover:bg-panel-hover text-muted hover:text-main transition shadow-sm outline-none cursor-pointer">
            {theme === 'dark' && <Moon className="w-5 h-5" />}
            {theme === 'sepia' && <Coffee className="w-5 h-5" />}
            {theme === 'light' && <Sun className="w-5 h-5" />}
          </button>

          {file && (
            <button 
              onClick={resetFile}
              className="px-4 py-2 text-sm font-medium bg-panel hover:bg-panel-hover text-muted hover:text-main rounded-lg transition border border-border-soft outline-none cursor-pointer hidden sm:block shadow-sm"
            >
              Upload Another
            </button>
          )}
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center relative overflow-hidden bg-base">
        {!file ? (
          <div className="w-full px-4 animate-in fade-in zoom-in duration-500">
            <h2 className="text-3xl md:text-5xl font-extrabold text-center mb-10 text-main tracking-tight">
              Turn your PDFs into <br className="md:hidden" />
              <span className="text-blue-500 relative inline-block mt-2">
                Interactive Books
                <span className="absolute bottom-0 left-0 w-full h-1 bg-blue-500 rounded-full opacity-50 blur-[2px]"></span>
              </span>
            </h2>
            <Upload onFileUpload={handleFileUpload} />
          </div>
        ) : (
          <div className="w-full h-full flex-1 flex flex-col items-center justify-center relative z-0 py-8 px-4 animate-in fade-in duration-700">
            <div className="transition-transform duration-500 ease-in-out" style={{ transform: `rotate(${rotation}deg)` }}>
              <FlipbookViewer 
                file={file} 
                onPageChange={handlePageChange}
                onLoadSuccess={handleLoadSuccess}
                width={dimensions.width}
                height={dimensions.height}
                markerMode={markerMode}
                markerColor={markerColor}
                ref={bookRef}
              />
            </div>
          </div>
        )}
      </main>

      {file && totalPages > 0 && (
        <Controls 
          pageNum={pageNum} 
          totalPages={totalPages} 
          onPrev={goPrev} 
          onNext={goNext}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onFullscreen={handleFullscreen}
          onRotate={handleRotate}
          markerMode={markerMode}
          setMarkerMode={setMarkerMode}
          markerColor={markerColor}
          setMarkerColor={setMarkerColor}
        />
      )}
    </div>
  );
}

export default App;
