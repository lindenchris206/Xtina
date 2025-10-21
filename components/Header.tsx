import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="col-span-full glassmorphism rounded-xl px-4 flex items-center">
      <div className="logo font-bold text-lg flex gap-3 items-center text-text-main font-orbitron">
        <div className="w-3 h-5 bg-primary rounded-[3px] shadow-[0_0_10px_rgba(var(--color-primary-val),0.7)]"></div>
        <span>AI Crew Commander</span>
      </div>
    </header>
  );
};