/**
 * @author cel
 * @file components/CrewDisplay.tsx
 * @description Renders the grid of crew members and their statuses.
 */
import React from 'react';
import type { CrewMember, CrewMemberStatus } from '../types';
import { XpIcon } from './icons';
import { useMission } from '../context/MissionContext';

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
  training: { bg: 'bg-purple-700', text: 'text-purple-200', label: 'TRAINING' },
  complete: { bg: 'bg-green-600', text: 'text-green-200', label: 'COMPLETE' },
  error: { bg: 'bg-red-600', text: 'text-red-200', label: 'ERROR' },
};

export const CrewDisplay: React.FC<CrewDisplayProps> = ({ crew, activeCrewNames, statuses, modelAssignments }) => {
  const { trainCrewMember } = useMission();
  
  return (
    <div className="p-4 glassmorphism rounded-xl">
      <h3 className="text-2xl font-orbitron text-indigo-300 mb-4">Crew Roster & Status</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {crew.map((member) => {
          const isActive = activeCrewNames.includes(member.name);
          const statusInfo = statuses[member.name] || { status: 'idle', progress: 0, xp: 0, level: 1 };
          const style = statusStyles[statusInfo.status];
          const assignedModel = modelAssignments[member.name] || member.simulatedModel;
          const statusLabel = statusInfo.status === 'working' 
            ? 'WORKING...'
            : statusInfo.status === 'assisting'
            ? 'ASSISTING...'
            : statusInfo.status === 'training'
            ? 'TRAINING...'
            : style.label;

          const xpForNextLevel = 100 * Math.pow(2, statusInfo.level - 1);
          const xpProgress = (statusInfo.xp / xpForNextLevel) * 100;

          return (
            <div 
              key={member.name} 
              className={`relative group p-3 bg-gray-900/50 rounded-lg border border-white/10 transition-all duration-300 flex flex-col justify-between ${isActive ? 'hover:bg-gray-800/70 hover:scale-105' : 'opacity-40'}`}
              title={!isActive ? `${member.name} (Inactive)` : member.name}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                        <span className="w-6 h-6 text-cyan-400 flex-shrink-0">{member.icon}</span>
                        <p className="font-bold text-sm text-gray-200 truncate">{member.name}</p>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-yellow-300 bg-yellow-900/50 px-1.5 py-0.5 rounded-full">
                         <span className="w-3 h-3"><XpIcon/></span> Lvl {statusInfo.level}
                    </div>
                </div>
                <div className="text-xs h-10">
                    <p className="font-medium text-gray-300 truncate" title={member.specialty}>{member.specialty}</p>
                    <p className="text-gray-500 truncate" title={member.secondarySpecialty}>{member.secondarySpecialty}</p>
                </div>
                <p className="text-[10px] text-indigo-300 bg-indigo-900/50 rounded px-1 py-0.5 mt-1 truncate">Model: {assignedModel}</p>
              </div>
              <div className="mt-2">
                 {statusInfo.status === 'idle' && isActive ? (
                    <button onClick={() => trainCrewMember(member.name)} className="w-full text-xs font-bold text-center px-2 py-0.5 rounded-full bg-purple-800 hover:bg-purple-700 text-purple-200 transition-colors">
                        Train (+50 XP)
                    </button>
                ) : (
                    <div className={`text-xs font-bold text-center px-2 py-0.5 rounded-full ${style.bg} ${style.text} truncate`}>
                        {statusLabel}
                    </div>
                )}
                <div className="w-full bg-gray-700 rounded-full h-1.5 mt-2" title={`Task Progress: ${statusInfo.progress.toFixed(0)}%`}>
                  <div
                    className={`${
                      statusInfo.status === 'working' ? 'bg-yellow-400' : 
                      statusInfo.status === 'assisting' ? 'bg-blue-400' :
                      statusInfo.status === 'training' ? 'bg-purple-400 animate-pulse' :
                      statusInfo.status === 'complete' ? 'bg-green-500' : 
                      statusInfo.status === 'error' ? 'bg-red-500' : 
                      'bg-gray-500'
                    } h-1.5 rounded-full transition-all duration-500`}
                    style={{ width: `${statusInfo.progress}%` }}
                  ></div>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-1.5 mt-1" title={`XP: ${statusInfo.xp} / ${xpForNextLevel}`}>
                    <div className="bg-yellow-400 h-1.5 rounded-full transition-all duration-500" style={{ width: `${xpProgress}%` }}></div>
                </div>
              </div>
              
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
// cel
