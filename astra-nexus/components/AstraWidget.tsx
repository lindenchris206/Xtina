import React from 'react';

const AstraWidget: React.FC = () => {
  return (
    <button
      className="fixed bottom-16 right-6 z-50 h-16 w-16 rounded-full glass-panel border border-cyan-500/30 flex items-center justify-center
                 hover:border-fuchsia-500 transition-colors duration-300 neon-glow group"
      aria-label="Astra Assistant"
    >
      <div className="h-8 w-8 rounded-full bg-cyan-400 group-hover:bg-fuchsia-400 transition-colors duration-300
                    animate-pulse group-hover:animate-none shadow-[0_0_15px_5px] shadow-cyan-500/50 group-hover:shadow-fuchsia-500/50">
      </div>
    </button>
  );
};

export default AstraWidget;