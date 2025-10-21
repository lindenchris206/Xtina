/**
 * @author cel
 * @file components/avatars.tsx
 * @description Defines the different Astra avatar components.
 */
import React from 'react';

const PARTICLE_COUNT = 20;

const Particle: React.FC = () => {
    const xEnd = (Math.random() - 0.5) * 200;
    const yEnd = (Math.random() - 0.5) * 200;
    const duration = 2 + Math.random() * 3;
    const delay = Math.random() * 5;

    const style = {
        '--x-end': `${xEnd}px`,
        '--y-end': `${yEnd}px`,
        '--duration': `${duration}s`,
        '--delay': `${delay}s`,
        top: '50%',
        left: '50%',
    } as React.CSSProperties;

    return <div className="particle" style={style}></div>;
};

// FIX: Exported AstraAvatar to allow direct import in other components, like the new LoginScreen.
export const AstraAvatar: React.FC<{ isTalking?: boolean }> = ({ isTalking }) => {
    return (
       <div className={`astra-avatar ${isTalking ? 'astra-avatar-talking' : 'astra-avatar-idle'}`}>
            <div className="astra-orb">
                <div className="astra-orb-core"></div>
                <div className="astra-orb-ring"></div>
                <div className="astra-orb-ring"></div>
                <div className="astra-orb-ring"></div>
                {/* Particle System */}
                {Array.from({ length: PARTICLE_COUNT }).map((_, i) => <Particle key={i} />)}
            </div>
        </div>
    );
};


const NovaAndroid: React.FC = () => (
     <div className="w-10 h-10 rounded-full bg-gray-900 border-2 border-pink-500 flex items-center justify-center shadow-lg shadow-pink-500/20">
        <svg viewBox="0 0 100 100" className="w-8 h-8">
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

const HeliaHologram: React.FC = () => (
    <div className="w-10 h-10 rounded-full bg-gray-900 border-2 border-teal-400 flex items-center justify-center shadow-lg shadow-teal-500/20">
       <svg viewBox="0 0 100 100" className="w-8 h-8">
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

const GlitchRemix: React.FC = () => (
    <div className="w-10 h-10 rounded-full bg-black border-2 border-green-500 flex items-center justify-center shadow-lg shadow-green-500/20 font-mono text-2xl animate-pulse">
        ?
    </div>
);


interface Avatar {
    name: string;
    component: React.ComponentType<{ isTalking?: boolean }>;
}

export const AVATARS: Record<string, Avatar> = {
    'Astra': { name: 'Astra', component: AstraAvatar },
    'Nova': { name: 'Nova', component: NovaAndroid },
    'Helia': { name: 'Helia', component: HeliaHologram },
    'Glitch': { name: 'Glitch', component: GlitchRemix },
};
// cel