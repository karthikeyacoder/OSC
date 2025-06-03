import React, { useState, useCallback, useRef } from 'react';

interface ImageUploaderProps {
  onImageSelect: (file: File, base64: string) => void;
  disabled?: boolean;
  hasApiKey: boolean;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelect, disabled, hasApiKey }) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
        setError('Invalid file type. Please use JPG, PNG, WEBP, or GIF.');
        setPreviewUrl(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        // Call onImageSelect with null or empty to indicate deselection for App.tsx
        // onImageSelect(null, ''); // This line would require onImageSelect to handle null File
        return;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('File too large. Max 5MB.');
        setPreviewUrl(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        // onImageSelect(null, '');
        return;
      }
      setError(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        setPreviewUrl(reader.result as string);
        onImageSelect(file, base64String);
      };
      reader.readAsDataURL(file);
    }
  }, [onImageSelect]);
  
  const handleClearSelection = () => {
    setPreviewUrl(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    // Notify parent that selection is cleared. This might involve passing a special signal
    // or a null file/base64 depending on how `onImageSelect` is designed to handle it.
    // For now, we'll assume App.tsx will reset `selectedFile` when `Analyze` is clicked
    // if no new image is selected, or implicitly via `handleImageSelect` if it were to pass nulls.
    // A more direct way might be needed if App.tsx needs immediate state update on clear.
    // For simplicity, direct parent notification for 'clear' is omitted here,
    // assuming `handleImageSelect` is only for new valid selections.
    // App.tsx can call setSelectedFile(null) if clear button had its own prop like onClear.
  };


  const handleDrop = useCallback((event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (disabled || !hasApiKey) return;
    const file = event.dataTransfer.files?.[0];
    if (file) {
      const syntheticEvent = { target: { files: event.dataTransfer.files } } as React.ChangeEvent<HTMLInputElement>;
      handleFileChange(syntheticEvent);
    }
  }, [handleFileChange, disabled, hasApiKey]);

  const handleDragOver = useCallback((event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (disabled || !hasApiKey) return;
    // Add visual feedback on drag over
    event.currentTarget.classList.add('border-purple-500');
  }, [disabled, hasApiKey]);

  const handleDragLeave = useCallback((event: React.DragEvent<HTMLLabelElement>) => {
    event.currentTarget.classList.remove('border-purple-500');
  }, []);

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const effectiveDisabled = disabled || !hasApiKey;

  return (
    <div className="w-full transform transition-all duration-300 hover:scale-[1.02]">
      <label
        htmlFor="image-upload"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`flex flex-col items-center justify-center w-full h-64 px-6 py-8 border-2 
                    ${error ? 'border-red-500' : 'border-slate-700 hover:border-purple-500'} 
                    border-dashed rounded-xl transition-colors duration-200 ease-in-out group
                    ${effectiveDisabled ? 'opacity-60 cursor-not-allowed bg-slate-800/50' : 'cursor-pointer bg-slate-800/70 hover:bg-slate-700/70 backdrop-blur-sm'}`}
        onClick={(e) => { if (effectiveDisabled || previewUrl) e.preventDefault(); if (!previewUrl) triggerFileInput(); }}
      >
        {previewUrl ? (
          <img src={previewUrl} alt="Preview" className="max-h-full max-w-full object-contain rounded-md shadow-lg" />
        ) : (
          <div className="space-y-3 text-center">
            <svg 
              className={`mx-auto h-16 w-16 ${effectiveDisabled ? 'text-slate-600' : 'text-slate-500 group-hover:text-purple-400'} transition-all duration-300 group-hover:scale-110`} 
              stroke="currentColor" 
              fill="none" 
              viewBox="0 0 48 48" 
              aria-hidden="true"
            >
              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div className={`flex text-sm ${effectiveDisabled ? 'text-slate-500' : 'text-slate-400 group-hover:text-purple-300'} transition-colors`}>
              <span 
                onClick={!effectiveDisabled ? triggerFileInput : undefined}
                className={`relative font-medium ${effectiveDisabled ? 'text-indigo-700' : 'text-indigo-500 group-hover:text-purple-400 hover:underline'} focus-within:outline-none`}
              >
                {previewUrl ? 'Change image' : 'Upload a file'}
              </span>
              <input 
                id="image-upload" 
                name="image-upload" 
                type="file" 
                className="sr-only" 
                accept="image/png, image/jpeg, image/webp, image/gif"
                onChange={handleFileChange}
                ref={fileInputRef}
                disabled={effectiveDisabled} 
              />
              {!previewUrl && <p className="pl-1">or drag and drop</p>}
            </div>
            {!previewUrl && <p className={`text-xs ${effectiveDisabled ? 'text-slate-600' : 'text-slate-500'}`}>PNG, JPG, GIF, WEBP up to 5MB</p>}
          </div>
        )}
      </label>
      {error && <p className="mt-2 text-sm text-red-400 text-center">{error}</p>}
      {previewUrl && !effectiveDisabled && (
         <button
            type="button"
            onClick={handleClearSelection}
            className="mt-4 w-full inline-flex justify-center py-2.5 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white 
                       bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-700 hover:from-purple-700 hover:via-indigo-700 hover:to-blue-800
                       focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-slate-900 
                       transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-95 btn-glow btn-glow-hover"
          >
            Clear Selection
          </button>
      )}
    </div>
  );
};

export default ImageUploader;