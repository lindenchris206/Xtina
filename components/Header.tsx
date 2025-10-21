import React from 'react';
import { LogoIcon } from './icons';

export const Header: React.FC = () => {
  return (
    <header className="col-span-full glassmorphism rounded-lg px-4 flex items-center">
      <div className="logo font-bold text-lg flex gap-3 items-center text-[rgb(var(--color-text))] font-orbitron">
        <LogoIcon />
        <span>AI Crew Commander</span>
      </div>
    </header>
  );
};
