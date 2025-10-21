import React, { useState, useEffect } from 'react';
import { ChipIcon } from './icons';

const useFluctuatingValue = (base: number, range: number, interval: number) => {
    const [value, setValue] = useState(base);
    useEffect(() => {
        const timer = setInterval(() => {
            setValue(base + (Math.random() - 0.5) * range);
        }, interval);
        return () => clearInterval(timer);
    }, [base, range, interval]);
    return value;
}

export const ResourceMonitor: React.FC = () => {
    const cpu = useFluctuatingValue(25, 10, 1500);
    const gpu = useFluctuatingValue(40, 20, 2000);
    const network = useFluctuatingValue(10, 5, 1000);
    const credits = useFluctuatingValue(85, 4, 3000);

    const renderBar = (label: string, value: number, color: string) => (
        <div>
            <div className="flex justify-between items-center text-xs text-gray-400 mb-1">
                <span>{label}</span>
                <span className="font-mono">{value.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                    className={`${color} h-2 rounded-full transition-all duration-500`} 
                    style={{ width: `${value}%` }}
                />
            </div>
        </div>
    );

    return (
        <div className="p-4 glassmorphism rounded-xl">
            <h3 className="text-xl font-orbitron text-indigo-300 mb-4 flex items-center gap-3"><span className="w-6 h-6"><ChipIcon/></span> System Resources</h3>
            <div className="space-y-3">
                {renderBar('CPU Utilization', cpu, 'bg-cyan-500')}
                {renderBar('GPU Processing', gpu, 'bg-purple-500')}
                {renderBar('Network Load', network, 'bg-green-500')}
                {renderBar('API Credits', credits, 'bg-yellow-500')}
            </div>
        </div>
    );
};
