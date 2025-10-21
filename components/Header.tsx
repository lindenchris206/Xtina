
import React from 'react';
import { ExportIcon, LogoIcon } from './icons';

interface HeaderProps {
  onExport: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onExport }) => {
  return (
    <header className="col-span-full bg-gradient-to-r from-[rgba(255,255,255,0.02)] to-[rgba(255,255,255,0.01)] rounded-lg px-4 flex items-center">
      <div className="logo font-bold text-lg flex gap-2 items-center text-brand-text">
        <LogoIcon />
        <span>Xtina 2.0</span>
      </div>
      <div className="ml-auto flex gap-2">
        <button
          onClick={onExport}
          className="bg-brand-accent text-white py-2 px-4 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-opacity-90 transition-colors"
        >
          <ExportIcon />
          <span>Export .txt</span>
        </button>
      </div>
    </header>
  );
};
