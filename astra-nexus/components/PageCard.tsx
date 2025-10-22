import React from 'react';
import { PageModule } from '../types';

interface PageCardProps {
  page: PageModule;
  isSelected: boolean;
}

const PageCard: React.FC<PageCardProps> = ({ page, isSelected }) => {
  const Icon = page.icon;
  const selectedClass = isSelected 
    ? 'ring-2 ring-fuchsia-500 neon-glow-magenta shadow-fuchsia-500/50 bg-fuchsia-500/10' 
    : 'ring-1 ring-cyan-500/30 hover:bg-cyan-500/10';

  return (
    <div
      className={`w-full h-full glass-panel p-4 rounded-xl ${selectedClass} transition-all duration-300 cursor-pointer flex flex-col items-center justify-center gap-3 text-center`}
    >
      <Icon className={`w-16 h-16 transition-colors duration-300 ${isSelected ? 'text-fuchsia-400' : 'text-cyan-400'}`} />
      <h3 className={`font-orbitron text-lg font-bold transition-colors duration-300 ${isSelected ? 'text-fuchsia-300' : 'text-cyan-300'}`}>
        {page.name}
      </h3>
    </div>
  );
};

export default PageCard;