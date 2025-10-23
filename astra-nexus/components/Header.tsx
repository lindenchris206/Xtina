import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-panel border-b border-cyan-500/30">
      <div className="container mx-auto px-4 py-3">
        <h1 className="text-2xl font-orbitron font-bold text-cyan-400 neon-text-cyan tracking-widest uppercase">
          Astra Nexus
        </h1>
      </div>
    </header>
  );
};

export default Header;