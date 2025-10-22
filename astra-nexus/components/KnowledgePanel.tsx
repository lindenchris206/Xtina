import React from 'react';
import { KnowledgeBundle } from '../types';
import KnowledgeBundleCard from './KnowledgeBundleCard';
import { BookOpenIcon } from './IconComponents';

interface KnowledgePanelProps {
  bundles: KnowledgeBundle[];
  selectedBundleId: string | null;
  onSelectBundle: (bundle: KnowledgeBundle) => void;
  onViewBundleContents: (bundle: KnowledgeBundle) => void;
}

const KnowledgePanel: React.FC<KnowledgePanelProps> = ({ bundles, selectedBundleId, onSelectBundle, onViewBundleContents }) => {
  return (
    <div className="glass-panel rounded-xl p-4 flex flex-col h-full">
      <h3 className="font-orbitron text-md font-bold text-cyan-300 flex items-center space-x-2 border-b border-cyan-500/20 pb-2 mb-3">
        <BookOpenIcon className="w-5 h-5" />
        <span>Knowledge Bundles</span>
      </h3>
      <div className="overflow-y-auto pr-2 space-y-2 flex-grow">
        {bundles.map(bundle => (
          <KnowledgeBundleCard
            key={bundle.id}
            bundle={bundle}
            onClick={() => onSelectBundle(bundle)}
            onViewContents={() => onViewBundleContents(bundle)}
            isSelected={selectedBundleId === bundle.id}
          />
        ))}
      </div>
    </div>
  );
};

export default KnowledgePanel;
