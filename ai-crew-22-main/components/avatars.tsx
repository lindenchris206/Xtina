import React from 'react';

// The main, animated avatar for Astra. This logic was moved from the deleted AnimatedAstra.tsx
const AnimatedAstra: React.FC<{ isSpeaking?: boolean }> = ({ isSpeaking }) => {
    return (
        <div className={`astra-avatar ${isSpeaking ? 'is-talking' : ''}`}>
            <svg width="60" height="60" viewBox="0 0 120 120">
                <defs>
                    <linearGradient id="astra-head-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#a5b4fc" />
                        <stop offset="100%" stopColor="#6366f1" />
                    </linearGradient>
                    <linearGradient id="astra-body-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#1e293b" />
                        <stop offset="100%" stopColor="#0f172a" />
                    </linearGradient>
                    <filter id="astra-glow-filter">
                        <feGaussianBlur stdDeviation="3.5" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* Body */}
                <g className="astra-body">
                    <path d="M 30 110 L 35 80 H 85 L 90 110 H 30 Z" fill="url(#astra-body-grad)" stroke="#a5b4fc" strokeWidth="1.5" />
                    <circle cx="60" cy="80" r="10" fill="#22d3ee" className="astra-glow" filter="url(#astra-glow-filter)" />
                </g>
                
                {/* Head */}
                <g className="astra-head">
                    <path d="M60 10 C 85 10, 100 30, 100 55 C 100 80, 85 90, 60 90 C 35 90, 20 80, 20 55 C 20 30, 35 10, 60 10 Z" fill="url(#astra-head-grad)" />
                    
                    {/* Eye */}
                    <circle cx="60" cy="50" r="12" fill="#0f172a" />
                    <circle cx="60" cy="50" r="8" fill="#22d3ee" className="astra-glow" filter="url(#astra-glow-filter)" />

                    {/* Mouth area */}
                    <path d="M 45 75 Q 60 80, 75 75" stroke="#a5b4fc" strokeWidth="2" fill="none" />
                    <path d="M 45 75 Q 60 80, 75 75" stroke="#22d3ee" strokeWidth="3" fill="none" className="astra-mouth-glow" opacity="0" filter="url(#astra-glow-filter)" />
                </g>
            </svg>
        </div>
    );
};

// Other avatars, modified to match the size and prop signature for interchangeability
const NovaAndroid: React.FC<{ isSpeaking?: boolean }> = () => (
     <div className="w-[60px] h-[60px] rounded-full bg-gray-900 border-2 border-pink-500 flex items-center justify-center shadow-lg shadow-pink-500/20 p-2">
        <svg viewBox="0 0 100 100" className="w-full h-full">
             <defs>
                <linearGradient id="nova-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{ stopColor: '#ec4899', stopOpacity: 1 }} />
                    <stop offset="100%" style={{ stopColor: '#d8b4fe', stopOpacity: 1 }} />
                </linearGradient>
            </defs>
            <rect x="20" y="20" width="60" height="60" rx="10" fill="url(#nova-grad)" />
            <rect x="35" y="45" width="30" height="10" fill="white" />
        </svg>
    </div>
);

const HeliaHologram: React.FC<{ isSpeaking?: boolean }> = () => (
    <div className="w-[60px] h-[60px] rounded-full bg-gray-900 border-2 border-teal-400 flex items-center justify-center shadow-lg shadow-teal-500/20 p-2">
       <svg viewBox="0 0 100 100" className="w-full h-full">
             <defs>
                <linearGradient id="helia-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{ stopColor: '#2dd4bf', stopOpacity: 1 }} />
                    <stop offset="100%" style={{ stopColor: '#67e8f9', stopOpacity: 1 }} />
                </linearGradient>
            </defs>
            <path d="M50 15 L85 50 L50 85 L15 50 Z" fill="url(#helia-grad)" />
            <circle cx="50" cy="50" r="15" fill="rgba(255,255,255,0.3)" />
        </svg>
    </div>
);

const GlitchRemix: React.FC<{ isSpeaking?: boolean }> = () => (
    <div className="w-[60px] h-[60px] rounded-full bg-black border-2 border-green-500 flex items-center justify-center shadow-lg shadow-green-500/20 font-mono text-green-500 text-4xl animate-pulse">
        ?
    </div>
);

interface Avatar {
    name: string;
    component: React.ComponentType<{ isSpeaking?: boolean }>;
}

export const AVATARS: Record<string, Avatar> = {
    'Astra': { name: 'Astra', component: AnimatedAstra },
    'Nova': { name: 'Nova', component: NovaAndroid },
    'Helia': { name: 'Helia', component: HeliaHologram },
    'Glitch': { name: 'Glitch', component: GlitchRemix },
};