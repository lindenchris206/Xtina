import React, { useState, useEffect } from 'react';
import { OfflineEngine, DownloadStatus } from '../types';
import { CheckCircleIcon } from './IconComponents';

interface EngineDownloadCardProps {
  engine: OfflineEngine;
}

const EngineDownloadCard: React.FC<EngineDownloadCardProps> = ({ engine }) => {
  const [status, setStatus] = useState<DownloadStatus>('idle');
  const [progress, setProgress] = useState(0);

  // Fix: Replaced NodeJS.Timeout with an inferred, browser-compatible type for the interval ID,
  // and corrected the useEffect structure to prevent calling clearInterval with an uninitialized variable.
  useEffect(() => {
    if (status === 'downloading') {
      const interval = setInterval(() => {
        setProgress(prev => {
          const next = prev + Math.random() * 10;
          if (next >= 100) {
            clearInterval(interval);
            setStatus('downloaded');
            return 100;
          }
          return next;
        });
      }, 250);
      return () => clearInterval(interval);
    }
  }, [status]);

  const handleDownload = () => {
    if (status === 'idle') {
      setStatus('downloading');
    }
  };

  const renderButtonContent = () => {
    switch (status) {
      case 'idle':
        return `Download (${engine.size})`;
      case 'downloading':
        return (
          <div className="w-full bg-slate-900/50 rounded-full h-2.5 border border-slate-700 overflow-hidden">
            <div
              className="bg-cyan-500 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        );
      case 'downloaded':
        return (
          <div className="flex items-center justify-center gap-2">
            <CheckCircleIcon className="w-5 h-5" />
            <span>Downloaded</span>
          </div>
        );
    }
  };

  return (
    <div className="glass-panel rounded-lg p-4 flex items-center justify-between gap-4 text-left">
      <div className="flex-grow">
        <h3 className="font-orbitron text-md text-cyan-300">{engine.name}</h3>
        <p className="text-sm text-slate-400">{engine.description}</p>
      </div>
      <div className="w-48 flex-shrink-0">
        <button
          onClick={handleDownload}
          disabled={status !== 'idle'}
          className={`w-full h-10 rounded-md font-bold text-sm transition-all duration-300 flex items-center justify-center
            ${status === 'idle' && 'bg-cyan-600/50 hover:bg-cyan-500/50 text-cyan-200 border border-cyan-500'}
            ${status === 'downloading' && 'bg-transparent text-slate-400 cursor-default'}
            ${status === 'downloaded' && 'bg-green-600/30 text-green-300 border border-green-500 cursor-default'}
          `}
        >
          {renderButtonContent()}
        </button>
      </div>
    </div>
  );
};

export default EngineDownloadCard;
