

import React, { useState, useEffect, useCallback } from 'react';
import ImageUploader from './components/ImageUploader';
import ResultDisplay from './components/ResultDisplay';
import LoadingSpinner from './components/LoadingSpinner';
import { analyzeBrokenObject, getApiKey } from './services/geminiService';
import type { AnalysisResult } from './types';
import { APP_TITLE, API_KEY_ERROR_MESSAGE } from './constants';

const Header: React.FC = () => (
  <header className="py-10 md:py-12 text-center relative z-10">
    <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-500 to-sky-400 animate-hue-rotate">
      {APP_TITLE}
    </h1>
    <p className="mt-4 text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto">
      Got something broken? Snap a pic, and let our AI tell you if it's fixable, how to repair it, and estimate the cost in INR.
    </p>
    <style>{`
      @keyframes hue-rotate {
        0% { filter: hue-rotate(0deg); }
        50% { filter: hue-rotate(20deg); }
        100% { filter: hue-rotate(0deg); }
      }
      .animate-hue-rotate {
        animation: hue-rotate 5s ease-in-out infinite;
      }
    `}</style>
  </header>
);

const AlertTriangleIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
    </svg>
);

const App: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [apiKeyError, setApiKeyError] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string | undefined>(undefined);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    const key = getApiKey();
    if (key) {
      setApiKey(key);
      setApiKeyError(null);
    } else {
      setApiKeyError(API_KEY_ERROR_MESSAGE);
    }
  }, []);

  const handleImageSelect = useCallback((file: File, base64: string) => {
    setSelectedFile(file);
    setImageBase64(base64);
    setAnalysisResult(null); 
    setShowResults(false);
    setError(null);
  }, []);

  const handleAnalyze = useCallback(async () => {
    if (!selectedFile || !imageBase64) {
      setError("Please select an image first.");
      return;
    }
    if (!apiKey) {
      setApiKeyError(API_KEY_ERROR_MESSAGE);
      return;
    }

    setIsLoading(true);
    setShowResults(false);
    setError(null);
    setAnalysisResult(null);

    // Short delay for visual feedback before API call
    await new Promise(resolve => setTimeout(resolve, 300));

    try {
      const result = await analyzeBrokenObject(imageBase64, selectedFile.type, apiKey);
      setAnalysisResult(result);
      setShowResults(true);
      if (result.error) {
        if (result.error.toLowerCase().includes("api key") || result.error.toLowerCase().includes("permission denied")) {
            setApiKeyError(result.error);
            setError(null);
        } else {
            setError(result.error);
        }
      }
    } catch (err) {
      console.error("Analysis error in App.tsx:", err);
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred during analysis.";
      setError(errorMessage);
      setAnalysisResult({ isFixable: null, error: errorMessage });
      setShowResults(true);
    } finally {
      setIsLoading(false);
    }
  }, [selectedFile, imageBase64, apiKey]);

  const canAnalyze = !!selectedFile && !!imageBase64 && !isLoading && !!apiKey;

  const PlaceholderContent: React.FC = () => (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-slate-900/60 backdrop-blur-md border border-slate-700/50 rounded-xl shadow-2xl transition-all duration-500 ease-out opacity-0 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
       <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-24 h-24 text-slate-600 mb-6 opacity-70">
        <path strokeLinecap="round" strokeLinejoin="round" d="m21 7.5-2.25-1.313M21 7.5v7.5M21 7.5V15m-4.5-.75L15 15.75M3 7.5l2.25-1.313M3 7.5v7.5M3 7.5V15m4.5-.75L9 15.75m-3-8.25A2.25 2.25 0 0 0 7.5 15h9a2.25 2.25 0 0 0 2.25-2.25V7.5A2.25 2.25 0 0 0 16.5 5.25h-9A2.25 2.25 0 0 0 3 7.5Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0 1 12 4.5c-1.857 0-3.579.46-5.038 1.257L9 9.75M15 9.75 9.038 7.286" />
      </svg>
      <h3 className="text-xl font-semibold text-slate-200 mb-2">Your Item's Fate Awaits</h3>
      <p className="text-slate-400">Upload an image of a broken item, and our AI will analyze its repair potential.</p>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col items-center p-4 sm:p-6 md:p-8 selection:bg-purple-500 selection:text-white relative z-0">
      <div className="w-full max-w-6xl">
        <Header />

        {apiKeyError && (
            <div className="my-6 p-5 bg-red-900/70 backdrop-blur-sm border border-red-700 text-yellow-200 rounded-xl shadow-lg flex items-start space-x-3 transition-all duration-300 ease-out opacity-0 animate-fade-in">
                <AlertTriangleIcon className="w-10 h-10 text-red-400 flex-shrink-0 mt-1" />
                <div>
                    <h3 className="text-lg font-semibold text-red-300">API Key Configuration Required</h3>
                    <p className="text-sm text-red-400">{apiKeyError.includes(API_KEY_ERROR_MESSAGE) ? API_KEY_ERROR_MESSAGE : apiKeyError}</p>
                    <p className="mt-1 text-xs text-red-500">Please ensure the <code className="bg-red-800/50 px-1.5 py-0.5 rounded text-red-300 font-mono">API_KEY</code> environment variable is correctly set and accessible.</p>
                </div>
            </div>
        )}

        {error && !apiKeyError && ( 
            <div className="my-4 p-4 bg-red-900/70 backdrop-blur-sm border border-red-700 text-red-300 rounded-lg text-center transition-all duration-300 ease-out opacity-0 animate-fade-in">
                <p>{error}</p>
            </div>
        )}
        
        <main className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* Left Column: Uploader and Action */}
          <div className="space-y-6 p-6 bg-slate-900/60 backdrop-blur-md border border-slate-700/50 rounded-xl shadow-2xl transition-all duration-500 ease-out opacity-0 animate-fade-in-up">
            <ImageUploader onImageSelect={handleImageSelect} disabled={isLoading} hasApiKey={!!apiKey} />
            {selectedFile && (
              <div className="mt-6">
                <button
                  onClick={handleAnalyze}
                  disabled={!canAnalyze}
                  className={`w-full px-8 py-3.5 text-base font-semibold rounded-lg transition-all duration-300 ease-in-out flex items-center justify-center
                              focus:outline-none focus:ring-4 focus:ring-purple-500/50
                              ${canAnalyze 
                                ? 'bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-700 hover:from-purple-700 hover:via-indigo-700 hover:to-blue-800 text-white shadow-lg hover:shadow-purple-500/40 active:scale-95 btn-glow btn-glow-hover' 
                                : 'bg-slate-700 text-slate-500 cursor-not-allowed'}`}
                  aria-label={isLoading ? "Analyzing object, please wait" : "Analyze uploaded object"}
                  aria-live={isLoading ? "assertive" : "polite"} // Added for better accessibility during loading
                >
                  {isLoading && (
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  {isLoading ? 'Analyzing...' : 'Analyze Object'}
                </button>
              </div>
            )}
             {!selectedFile && apiKey && (
                <p className="text-sm text-center text-slate-400 pt-2">
                    Select an image above to begin the analysis.
                </p>
             )}
          </div>

          {/* Right Column: Results or Placeholder */}
          <div className="md:sticky md:top-8">
            {isLoading && (
              <div role="status" aria-live="polite" className="flex justify-center items-center h-full p-8 bg-slate-900/60 backdrop-blur-md border border-slate-700/50 rounded-xl shadow-2xl transition-all duration-300 ease-out opacity-0 animate-fade-in">
                <LoadingSpinner />
              </div>
            )}
            {!isLoading && showResults && analysisResult && (
              <div className="transition-all duration-500 ease-out opacity-0 animate-fade-in-up" style={{animationDelay: '0.1s'}}>
                <ResultDisplay result={analysisResult} />
              </div>
            )}
            {!isLoading && !showResults && (
                <PlaceholderContent />
            )}
          </div>
        </main>

        <footer className="mt-16 mb-8 text-center relative z-10">
            <p className="text-sm text-slate-500">
                Karthikeya With Google Gemini. Results are AI-generated estimates With API key.
            </p>
             <p className="text-xs text-slate-600 mt-1">
                ImgTrash &copy; {new Date().getFullYear()}
            </p>
            <p className="text-xs text-slate-500 mt-2">
                Developed by <a 
                    href="https://karthikeyacoder.vercel.app" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-purple-400 hover:text-purple-300 underline hover:no-underline transition-colors duration-200"
                >
                    Karthikeya
                </a>
            </p>
        </footer>
      </div>
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default App;
