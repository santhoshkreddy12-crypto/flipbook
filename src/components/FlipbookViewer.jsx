import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import HTMLFlipBook from 'react-pageflip';
import * as pdfjsLib from 'pdfjs-dist';

// Use CDN for worker to avoid Vite dev/build bundling issues which cause infinite hanging
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

const Page = forwardRef(({ pageNum, pdf, width, height }, ref) => {
  const canvasRef = useRef(null);
  const [rendered, setRendered] = useState(false);

  useEffect(() => {
    let renderTask;
    let isMounted = true;
    
    // HTMLFlipbook mounts all pages at once. rendering immediately.
    const renderPage = async () => {
      if (!pdf || !canvasRef.current || rendered) return;
      try {
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: 1 });
        
        // Scale appropriately for crispness
        const displayScale = Math.min((width - 40) / viewport.width, (height - 40) / viewport.height);
        const scaledViewport = page.getViewport({ scale: displayScale * 2 }); // High-DPI scale for canvas
        
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d', { willReadFrequently: true });
        
        canvas.height = scaledViewport.height;
        canvas.width = scaledViewport.width;
        
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.objectFit = 'contain';
        
        renderTask = page.render({
          canvasContext: context,
          viewport: scaledViewport
        });
        
        await renderTask.promise;
        if (isMounted) setRendered(true);
      } catch (err) {
        if (err.name === 'RenderingCancelledException') return;
        console.error("Error rendering page", err);
      }
    };
    
    renderPage();
    
    return () => {
      isMounted = false;
      if (renderTask) renderTask.cancel();
    }
  }, [pageNum, pdf, width, height, rendered]);

  // Texture and lighting calculation
  const isLeft = pageNum % 2 === 0;
  
  // Creates a highly authentic vintage paper feel with subtle noise and a spine crease shadow
  const paperBackground = {
    backgroundColor: '#f5ecd8',
    backgroundImage: `
      linear-gradient(to ${isLeft ? 'left' : 'right'}, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.02) 4%, rgba(0,0,0,0) 10%, rgba(0,0,0,0) 100%),
      url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.08'/%3E%3C/svg%3E")
    `,
    backgroundBlendMode: 'multiply',
    boxShadow: isLeft ? 'inset -1px 0 5px rgba(0,0,0,0.1)' : 'inset 1px 0 5px rgba(0,0,0,0.1)'
  };

  return (
    <div 
      className="page flex flex-col justify-center items-center py-4 relative border-r border-[#d3c6ab]/30" 
      ref={ref} 
      data-density={pageNum === 1 || pageNum === pdf.numPages ? "hard" : "soft"}
      style={paperBackground}
    >
      <div className="flex-1 w-full flex items-center justify-center p-6 h-full relative">
        {/* mix-blend-multiply forces the PDF's white background to vanish, printing the text directly into our paper texture */}
        <canvas 
          ref={canvasRef} 
          className="max-w-full max-h-full z-10 relative" 
          style={{ mixBlendMode: 'multiply', filter: 'contrast(1.1) sepia(0.2)' }}
        />
        
        {/* {!rendered && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-0" style={{ opacity: 0.5 }}>
            <span className="text-[#8a7b66] text-xs font-semibold font-serif">Loading page {pageNum}...</span>
          </div>
        )} */}
      </div>
      
      {/* Vintage Page number indicator */}
      {rendered && (
        <div className={`absolute bottom-3 text-xs text-[#8a7b66] font-serif font-bold tracking-widest ${isLeft ? 'left-6' : 'right-6'}`}>
          — {pageNum} —
        </div>
      )}
    </div>
  );
});

// Calculate responsive dimensions
const maxBookWidth = 500;
const maxBookHeight = 700;

const FlipbookViewer = forwardRef(({ file, onPageChange, onLoadSuccess, width, height }, ref) => {
  const [pdf, setPdf] = useState(null);
  const [numPages, setNumPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const bookRef = useRef();

  useImperativeHandle(ref, () => ({
    pageFlip: () => bookRef.current?.pageFlip()
  }));

  useEffect(() => {
    let loadingTask;
    let objectUrl;
    let isMounted = true;

    const loadPdf = async () => {
      setLoading(true);
      try {
        objectUrl = URL.createObjectURL(file);
        loadingTask = pdfjsLib.getDocument(objectUrl);
        const loadedPdf = await loadingTask.promise;
        
        if (isMounted) {
          setPdf(loadedPdf);
          setNumPages(loadedPdf.numPages);
          onLoadSuccess(loadedPdf.numPages);
        }
      } catch (err) {
        console.error("Failed to load PDF", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    if (file) {
      loadPdf();
    }

    return () => {
      isMounted = false;
      if (loadingTask) loadingTask.destroy();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    }
  }, [file, onLoadSuccess]);

  const onFlip = (e) => {
    // e.data is the current page index
    onPageChange(e.data);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full">
        <div className="text-xl text-blue-400 font-semibold animate-pulse">Loading Document...</div>
      </div>
    );
  }

  if (!pdf) return null;

  const pagesArray = Array.from({ length: numPages }, (_, i) => i + 1);

  return (
    <div className="flex items-center justify-center w-full h-full relative perspective-[2000px]">
      <HTMLFlipBook 
        width={width}
        height={height}
        size="fixed"
        minWidth={315}
        maxWidth={maxBookWidth}
        minHeight={400}
        maxHeight={maxBookHeight}
        maxShadowOpacity={0.5}
        showCover={true}
        mobileScrollSupport={true}
        onFlip={onFlip}
        ref={bookRef}
        className="flipbook mx-auto"
        style={{ margin: '0 auto', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)' }}
      >
        {pagesArray.map((pageNum) => (
          <Page 
            key={pageNum} 
            pageNum={pageNum} 
            pdf={pdf} 
            width={width} 
            height={height} 
          />
        ))}
      </HTMLFlipBook>
    </div>
  );
});

export default FlipbookViewer;
