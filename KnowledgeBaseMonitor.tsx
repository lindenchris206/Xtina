
import React, { useState } from 'react';
import { KnowledgeModule } from '../types';
import { Database } from './icons/Icons';

const initialModules: KnowledgeModule[] = [
    { id: 'flatware', name: 'Sterling & Flatware Library', active: true, size: 256 },
    { id: 'instruments', name: 'Musical Instruments (Flutes)', active: true, size: 128 },
    { id: 'watches', name: 'Watches & Jewelry', active: true, size: 512 },
    { id: 'electronics', name: 'Electronics & Gaming', active: false, size: 384 },
    { id: 'clothing', name: 'High-end Clothing', active: false, size: 192 },
];

const KnowledgeBaseMonitor: React.FC = () => {
    const [modules, setModules] = useState<KnowledgeModule[]>(initialModules);

    const toggleModule = (id: string) => {
        setModules(
            modules.map(m => (m.id === id ? { ...m, active: !m.active } : m))
        );
    };
    
    const totalMemory = modules.reduce((acc, m) => acc + (m.active ? m.size : 0), 0);

    return (
        <div className="glass-card p-4 rounded-lg h-80 flex flex-col">
            <h2 className="text-xl font-orbitron font-bold text-white mb-4 flex items-center"><Database className="w-6 h-6 mr-2 text-purple-400" />Knowledge Modules</h2>
            <div className="space-y-3 flex-1 overflow-y-auto pr-2">
                {modules.map(module => (
                    <div key={module.id} className="flex items-center justify-between text-sm">
                        <div className="flex items-center">
                            <div className={`w-2 h-2 rounded-full mr-3 ${module.active ? 'bg-green-400 animate-pulse' : 'bg-gray-500'}`}></div>
                            <div>
                                <p className="text-gray-200">{module.name}</p>
                                <p className="text-xs text-gray-500">{module.size} MB</p>
                            </div>
                        </div>
                        <button onClick={() => toggleModule(module.id)} className={`px-3 py-1 text-xs rounded-full transition-colors ${module.active ? 'bg-red-500/80 hover:bg-red-500' : 'bg-green-500/80 hover:bg-green-500'}`}>
                            {module.active ? 'Unload' : 'Load'}
                        </button>
                    </div>
                ))}
            </div>
            <div className="mt-4 pt-4 border-t border-purple-500/20">
                 <p className="text-sm text-center text-gray-300">Total Active Memory: <span className="font-bold text-pink-400">{totalMemory} MB</span></p>
            </div>
        </div>
    );
};

export default KnowledgeBaseMonitor;
