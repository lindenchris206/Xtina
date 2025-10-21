import React from 'react';
import type { CrewMember, CrewMemberStatus } from '../types';

interface CrewDisplayProps {
  crew: CrewMember[];
  activeCrewNames: string[];
  statuses: Record<string, CrewMemberStatus>;
  modelAssignments: Record<string, string>;
}

const statusStyles = {
  idle: { bg: 'bg-gray-700', text: 'text-gray-300', label: 'IDLE' },
  working: { bg: 'bg-yellow-600', text: 'text-yellow-200', label: 'WORKING' },
  assisting: { bg: 'bg-blue-600', text: 'text-blue-200', label: 'ASSISTING' },
  complete: { bg: 'bg-green-600', text: 'text-green-200', label: 'COMPLETE' },
  error: { bg: 'bg-red-600', text: 'text-red-200', label: 'ERROR' },
};

export const CrewDisplay: React.FC<CrewDisplayProps> = ({ crew, activeCrewNames, statuses, modelAssignments }) => {
  return (
    <div className="p-4 glassmorphism rounded-xl">
      <h3 className="text-2xl font-orbitron text-indigo-300 mb-4">Crew Roster & Status</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {crew.map((member) => {
          const isActive = activeCrewNames.includes(member.name);
          const statusInfo = statuses[member.name] || { status: 'idle', progress: 0 };
          const style = statusStyles[statusInfo.status];
          const assignedModel = modelAssignments[member.name] || member.simulatedModel;
          const isWorking = statusInfo.status === 'working';
          const statusLabel = isWorking 
            ? 'WORKING...'
            : statusInfo.status === 'assisting'
            ? 'ASSISTING...'
            : style.label;

          const animationClass = isWorking ? 'animate-pulse border-yellow-400 shadow-lg shadow-yellow-500/20' : 'border-white/10';

          return (
            <div 
              key={member.name} 
              className={`relative group p-3 bg-gray-900/50 rounded-lg border transition-all duration-300 flex flex-col justify-between ${animationClass} ${isActive ? 'hover:bg-gray-800/70 hover:scale-105' : 'opacity-40'}`}
              title={!isActive ? `${member.name} (Inactive)` : member.name}
            >
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="w-6 h-6 text-cyan-400">{member.icon}</span>
                  <p className="font-bold text-sm text-gray-200 truncate">{member.name}</p>
                </div>
                <p className="text-xs text-gray-400 h-10">{member.specialty}</p>
                <p className="text-[10px] text-indigo-300 bg-indigo-900/50 rounded px-1 py-0.5 mt-1 truncate">Model: {assignedModel}</p>
              </div>
              <div className="mt-2">
                <div className={`text-xs font-bold text-center px-2 py-0.5 rounded-full ${style.bg} ${style.text} truncate`}>
                  {statusLabel}
                </div>
                <div className="w-full bg-gray-700 rounded-full h-1.5 mt-2">
                  <div
                    className={`${
                      statusInfo.status === 'working' ? 'bg-yellow-400' : 
                      statusInfo.status === 'assisting' ? 'bg-blue-400' :
                      statusInfo.status === 'complete' ? 'bg-green-500' : 
                      statusInfo.status === 'error' ? 'bg-red-500' : 
                      'bg-gray-500'
                    } h-1.5 rounded-full transition-all duration-500 ease-in-out`}
                    style={{ width: `${statusInfo.progress}%` }}
                  ></div>
                </div>
              </div>
              
              {/* Tooltip for active statuses */}
              {(statusInfo.status === 'working' || statusInfo.status === 'error' || statusInfo.status === 'assisting') && statusInfo.currentTask && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs p-2 text-xs text-white bg-gray-800 border border-white/20 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 invisible group-hover:visible z-10 pointer-events-none">
                  <p className="font-bold mb-1">{statusInfo.status === 'error' ? 'Error Details:' : statusInfo.status === 'assisting' ? 'Assisting On:' : 'Current Task:'}</p>
                  <p>{statusInfo.currentTask}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
