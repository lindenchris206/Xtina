import React, { useState, useEffect } from 'react';

const colorStyles: { [key: string]: { bg: string; text: string; shadow: string } } = {
    cyan: {
        bg: 'bg-cyan-500',
        text: 'text-cyan-300',
        shadow: 'shadow-cyan-500/50'
    },
    fuchsia: {
        bg: 'bg-fuchsia-500',
        text: 'text-fuchsia-300',
        shadow: 'shadow-fuchsia-500/50'
    },
    lime: {
        bg: 'bg-lime-500',
        text: 'text-lime-300',
        shadow: 'shadow-lime-500/50'
    }
};


const SystemMonitor: React.FC = () => {
    const [cpu, setCpu] = useState(0);
    const [ram, setRam] = useState(0);
    const [gpu, setGpu] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCpu(Math.random() * 80 + 10);
            setRam(Math.random() * 70 + 20);
            setGpu(Math.random() * 90 + 5);
        }, 2000);

        return () => clearInterval(interval);
    }, []);

    const StatBar = ({ label, value, color }: { label: string, value: number, color: 'cyan' | 'fuchsia' | 'lime' }) => {
        const styles = colorStyles[color];
        return (
            <div className="w-full">
                <div className="flex justify-between items-baseline text-xs font-mono">
                    <span className="text-slate-400">{label}</span>
                    <span className={`font-bold ${styles.text}`}>{value.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-slate-900/50 rounded-full h-1.5 mt-1 border border-slate-700">
                    <div
                        className={`${styles.bg} h-1.5 rounded-full neon-glow ${styles.shadow} transition-all duration-500`}
                        style={{ width: `${value}%` }}
                    ></div>
                </div>
            </div>
        )
    };

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-50 glass-panel border-t border-cyan-500/30">
        <div className="container mx-auto px-4 py-2">
            <div className="grid grid-cols-3 gap-6 items-center">
                <StatBar label="CPU" value={cpu} color="cyan" />
                <StatBar label="RAM" value={ram} color="fuchsia" />
                <StatBar label="GPU" value={gpu} color="lime" />
            </div>
        </div>
    </footer>
  );
};

export default SystemMonitor;