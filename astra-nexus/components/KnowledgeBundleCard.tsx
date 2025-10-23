import React from 'react';
import { KnowledgeBundle } from '../types';
import { BookOpenIcon } from './IconComponents';

interface KnowledgeBundleCardProps {
  bundle: KnowledgeBundle;
  onClick?: () => void;
  onViewContents?: () => void;
  isSelected?: boolean;
}

const KnowledgeBundleCard: React.FC<KnowledgeBundleCardProps> = ({ bundle, onClick, onViewContents, isSelected = false }) => {
  const selectedClass = isSelected ? 'ring-2 ring-fuchsia-500 neon-glow shadow-fuchsia-500/50' : 'ring-1 ring-cyan-500/30';

  const handleViewClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onViewContents?.();
  };

  return (
    <div
      onClick={onClick}
      className={`w-full glass-panel p-3 rounded-lg ${selectedClass} transition-all duration-300 hover:bg-cyan-500/10 cursor-pointer text-left`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-grow overflow-hidden">
          <h4 className="font-orbitron text-sm font-bold text-cyan-300 truncate">{bundle.name}</h4>
          <p className="text-xs text-slate-400 truncate mt-1">{bundle.description}</p>
        </div>
        {onViewContents && (
          <button
            onClick={handleViewClick}
            className="ml-2 flex-shrink-0 text-slate-400 hover:text-cyan-300 transition-colors p-1"
            aria-label="View contents"
          >
            <BookOpenIcon className="w-5 h-5" />
          </button>
        )}
      </div>
      <div className="text-xs text-slate-500 mt-2 flex justify-between items-center">
        <span>{bundle.contentCount} items</span>
        <span>Updated: {bundle.lastUpdated}</span>
      </div>
    </div>
  );
};

export default KnowledgeBundleCard;
