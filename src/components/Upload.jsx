import React, { useCallback, useState } from 'react';
import { UploadCloud } from 'lucide-react';

const Upload = ({ onFileUpload }) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'application/pdf') {
        onFileUpload(file);
      } else {
        alert("Please upload a valid PDF file.");
      }
    }
  }, [onFileUpload]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
       const file = e.target.files[0];
      if (file.type === 'application/pdf') {
        onFileUpload(file);
      } else {
        alert("Please upload a valid PDF file.");
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-panel/80 backdrop-blur-md rounded-2xl shadow-2xl border border-border-soft w-full max-w-md mx-auto transition-all hover:shadow-blue-500/10">
      <div 
        className={`w-full h-56 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${isDragOver ? 'border-blue-500 bg-blue-500/10 scale-105' : 'border-border-soft hover:border-blue-400 hover:bg-panel-hover'}`}
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => document.getElementById('pdf-upload')?.click()}
      >
        <UploadCloud className={`w-16 h-16 mb-4 transition-colors ${isDragOver ? 'text-blue-400' : 'text-muted'}`} />
        <p className="text-main font-semibold text-lg">Click or drag PDF here</p>
        <p className="text-muted text-sm mt-2 font-medium">Local processing • No uploads</p>
        <input 
          id="pdf-upload" 
          type="file" 
          accept="application/pdf" 
          className="hidden" 
          onChange={handleFileChange}
        />
      </div>
    </div>
  );
};

export default Upload;
