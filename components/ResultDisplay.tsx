import React from 'react';
import type { AnalysisResult, RepairMethod } from '../types';

interface ResultDisplayProps {
  result: AnalysisResult | null;
  imagePreviewUrl?: string | null;
}

const FixableChip: React.FC<{ isFixable: AnalysisResult['isFixable'] }> = ({ isFixable }) => {
  let baseClasses = 'inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-full transition-all duration-300 shadow-md';
  let bgColor = 'bg-slate-700/80 border border-slate-600';
  let textColor = 'text-slate-300';
  let text = 'Status Unknown';
  let IconComponent: React.ElementType | null = null;

  const QuestionIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
    </svg>
  );
  const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
    </svg>
  );
  const XMarkIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
  );

  if (isFixable === true) {
    bgColor = 'bg-green-600/30 border border-green-500/70 backdrop-blur-sm';
    textColor = 'text-green-300';
    text = 'Fixable';
    IconComponent = CheckIcon;
  } else if (isFixable === false) {
    bgColor = 'bg-red-600/30 border border-red-500/70 backdrop-blur-sm';
    textColor = 'text-red-300';
    text = 'Not Fixable';
    IconComponent = XMarkIcon;
  } else if (isFixable === 'maybe') {
    bgColor = 'bg-yellow-600/30 border border-yellow-500/70 backdrop-blur-sm';
    textColor = 'text-yellow-300';
    text = 'Maybe Fixable';
    IconComponent = QuestionIcon;
  } else {
     IconComponent = QuestionIcon;
  }

  return (
    <span className={`${baseClasses} ${bgColor} ${textColor}`}>
      {IconComponent && <IconComponent />}
      {text}
    </span>
  );
};

const WrenchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2 text-purple-400">
    <path strokeLinecap="round" strokeLinejoin="round" d="m11.42 15.17.07-.07a.75.75 0 0 1 1.06 0l.07.07S15 17.642 15 20a5 5 0 0 1-10 0c0-2.358.62-4.736.62-4.736l.07-.07a.75.75 0 0 1 1.06 0Zm0 0L10.5 14.25M11.42 15.17l2.472-2.472a.75.75 0 0 0 0-1.06l-3.182-3.182a.75.75 0 0 0-1.06 0l-2.472 2.472L3 8.25l1.5-1.5L6 5.25l1.5 1.5L9 8.25l3.75-3.75L13.5 3l1.5 1.5L16.5 6l1.5 1.5L19.5 9l-3.75 3.75Z" />
  </svg>
);

const RupeeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2 text-green-400">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 8.25H9m6 3H9m3 6l-3-3h1.5a3 3 0 1 0 0-6M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </svg>
);

const InfoIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2 text-slate-400">
        <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
    </svg>
);


const ResultDisplay: React.FC<ResultDisplayProps> = ({ result }) => {
  if (!result) {
    return null;
  }

  if (result.error) {
    return (
      <div className="mt-0 md:mt-0 p-6 bg-red-900/70 backdrop-blur-sm border border-red-700 rounded-xl shadow-2xl">
        <div className="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 mr-4 text-red-400 flex-shrink-0">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
          </svg>
          <div>
            <h3 className="text-xl font-semibold text-red-300">Analysis Failed</h3>
            <p className="text-red-400 text-sm mt-1">{result.error}</p>
          </div>
        </div>
      </div>
    );
  }
  
  if (result.isFixable === null) {
     return (
      <div className="mt-0 md:mt-0 p-6 bg-slate-900/60 backdrop-blur-md border border-slate-700/50 rounded-xl shadow-2xl text-center">
        <p className="text-slate-400">Awaiting analysis results...</p>
      </div>
    );
  }

  return (
    <div className="mt-0 md:mt-0 p-6 bg-slate-900/60 backdrop-blur-md border border-slate-700/50 rounded-xl shadow-2xl space-y-6 transform transition-all duration-300 hover:shadow-purple-500/20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-700/70">
        <h3 className="text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">
          {result.objectName ? result.objectName : 'Analysis Result'}
        </h3>
        <FixableChip isFixable={result.isFixable} />
      </div>

      {result.confidenceScore && (
        <div className="pb-4 border-b border-slate-700/70">
            <p className="text-xs text-slate-500 uppercase font-semibold tracking-wider mb-1">Confidence</p>
            <p className="text-sm text-slate-200">{result.confidenceScore}</p>
        </div>
      )}

      {result.fixabilityReason && (
        <div className="pb-4 border-b border-slate-700/70">
          <h4 className="flex items-center text-sm text-slate-500 uppercase font-semibold tracking-wider mb-1.5">
            <InfoIcon /> Reasoning
          </h4>
          <p className="text-slate-300 leading-relaxed text-sm">{result.fixabilityReason}</p>
        </div>
      )}

      {result.isFixable && result.repairMethods && result.repairMethods.length > 0 && (
        <div className="pb-4 border-b border-slate-700/70">
          <h4 className="flex items-center text-sm text-slate-500 uppercase font-semibold tracking-wider mb-2.5">
            <WrenchIcon /> Suggested Repair Methods
          </h4>
          <ul className="space-y-3">
            {result.repairMethods.map((item: RepairMethod, index: number) => (
              <li key={index} className="p-4 bg-slate-800/70 rounded-lg shadow-md border border-slate-700 hover:border-purple-500/50 transition-all duration-200 hover:shadow-purple-500/10">
                <p className="font-semibold text-indigo-300">{item.method}</p>
                <p className="text-sm text-slate-400 mt-1">{item.description}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {result.isFixable && result.estimatedCost && (
        <div>
          <h4 className="flex items-center text-sm text-slate-500 uppercase font-semibold tracking-wider mb-1.5">
            <RupeeIcon /> Estimated Repair Cost
          </h4>
          <p className="text-3xl font-bold text-green-400">{result.estimatedCost}</p>
        </div>
      )}

      {!result.isFixable && !result.fixabilityReason && result.isFixable !== null && (
         <p className="text-slate-400 text-sm">The AI determined this item is not fixable. No specific reason was provided.</p>
      )}
       {result.isFixable === true && (!result.repairMethods || result.repairMethods.length === 0) && !result.estimatedCost && (
         <p className="text-slate-400 text-sm">The AI determined this item is fixable, but did not provide specific repair methods or cost estimates.</p>
      )}
    </div>
  );
};

export default ResultDisplay;