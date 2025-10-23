import React, { useEffect, useRef } from 'react';
import { useAICrew } from '../contexts/AICrewContext';

const TerminalPanel: React.FC = () => {
    const { logs } = useAICrew();
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [logs]);

  return (
    <div className="glass-panel rounded-xl p-4 flex flex-col h-full">
      <div className="flex justify-between items-center border-b border-cyan-500/20 pb-2 mb-3">
        <h3 className="font-orbitron text-md font-bold text-cyan-300">Mission Log | Terminal</h3>
        <div className="flex space-x-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
        </div>
      </div>
      <div ref={scrollRef} className="overflow-y-auto flex-grow font-mono text-xs pr-2">
        {logs.map((log, index) => (
            <p key={index} className="mb-1">
                <span className="text-slate-500 mr-2">{log.time}</span>
                <span className={`${log.color} font-bold mr-2`}>[{log.source}]</span>
                <span className="text-slate-300">{log.message}</span>
            </p>
        ))}
      </div>
      <div className="mt-3 flex items-center border-t border-cyan-500/20 pt-3">
        <span className="text-lime-400 mr-2">{'>'}</span>
        <input 
            type="text" 
            placeholder="Enter command..."
            className="w-full bg-transparent text-lime-300 focus:outline-none placeholder-slate-600"
        />
      </div>
    </div>
  );
};

export default TerminalPanel;