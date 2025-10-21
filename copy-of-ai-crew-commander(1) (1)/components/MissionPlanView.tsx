/**
 * @author cel
 * @file components/MissionPlanView.tsx
 * @description Renders a compact view of the mission plan.
 */
import React from 'react';
import type { PrioritizedTask, DeliberationStep } from '../types';
// FIX: Corrected import path for constants.
import { CREW_MEMBERS } from '../constants.tsx';
import { useMission } from '../context/MissionContext';
import { ClockIcon, LoadingIcon, CheckCircleIcon, ExclamationTriangleIcon } from './icons';

interface MissionPlanViewProps {
    tasks: PrioritizedTask[];
    deliberation?: DeliberationStep[];
}

const priorityMap: Record<number, { label: string; color: string; }> = {
  1: { label: 'High', color: 'bg-red-500/50 text-red-300' },
  2: { label: 'Medium', color: 'bg-yellow-500/50 text-yellow-300' },
  3: { label: 'Low', color: 'bg-blue-500/50 text-blue-300' },
};

const statusMap: Record<PrioritizedTask['status'], { icon: React.ReactNode; color: string; border: string }> = {
    pending: { icon: <ClockIcon />, color: 'text-gray-400', border: 'border-gray-600/50' },
    working: { icon: <LoadingIcon />, color: 'text-yellow-400', border: 'border-yellow-500/50' },
    complete: { icon: <CheckCircleIcon />, color: 'text-green-400', border: 'border-green-500/50' },
    error: { icon: <ExclamationTriangleIcon />, color: 'text-red-400', border: 'border-red-500/50' },
};

export const MissionPlanView: React.FC<MissionPlanViewProps> = ({ tasks, deliberation }) => {
    const { updateTaskPriority } = useMission();
    
    return (
        <div className="border-l-2 border-cyan-500/30 pl-4 my-4 space-y-2">
            <h4 className="text-sm font-bold text-cyan-400">Plan of Attack:</h4>
            {tasks.map((task, index) => {
                const memberInfo = CREW_MEMBERS.find(m => m.name === task.member);
                const priorityInfo = priorityMap[task.priority] || priorityMap[2];
                const statusInfo = statusMap[task.status] || statusMap.pending;
                
                return (
                    <div key={task.id} className={`flex items-start gap-3 text-xs p-2 rounded-md bg-gray-900/50 border ${statusInfo.border}`}>
                        <div className={`flex-shrink-0 w-5 h-5 ${statusInfo.color} mt-0.5`}>
                            {statusInfo.icon}
                        </div>
                        <div className="flex-grow">
                            <p className="font-semibold text-gray-300">{task.id + 1}. {task.task}</p>
                            <div className="flex items-center gap-2 mt-1">
                                <p className="text-gray-400 text-[10px] flex items-center gap-1">
                                   <span className="w-3 h-3 text-cyan-400">{memberInfo?.icon}</span>
                                   {task.member}
                                </p>
                                {task.dependencies && task.dependencies.length > 0 && (
                                    <p className="text-yellow-400 text-[10px]">
                                        Depends on: {task.dependencies.map(depId => `#${depId + 1}`).join(', ')}
                                    </p>
                                )}
                            </div>
                        </div>
                         <div className="relative group flex-shrink-0">
                             <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${priorityInfo.color} cursor-pointer`}>
                                {priorityInfo.label} Priority
                            </div>
                            <div className="absolute top-full right-0 mt-1 hidden group-hover:block bg-gray-800 border border-white/10 rounded-md shadow-lg z-10 p-1">
                                {[1, 2, 3].map(p => (
                                    <button 
                                        key={p} 
                                        onClick={() => updateTaskPriority(index, p)}
                                        className="block w-full text-left px-3 py-1 text-xs hover:bg-indigo-500/50 rounded"
                                    >
                                       Set to {priorityMap[p].label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};