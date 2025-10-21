import React from 'react';
import type { PrioritizedTask } from '../types';
import { useMission } from '../context/MissionContext';
import { CREW_MEMBERS } from '../constants.tsx';
import { XIcon, ClockIcon, LoadingIcon, CheckCircleIcon, ExclamationTriangleIcon } from './icons';

interface TaskDetailModalProps {
    task: PrioritizedTask;
    onClose: () => void;
}

const priorityMap: Record<number, { label: string; color: string; }> = {
  1: { label: 'High', color: 'bg-red-500/50 text-red-300' },
  2: { label: 'Medium', color: 'bg-yellow-500/50 text-yellow-300' },
  3: { label: 'Low', color: 'bg-blue-500/50 text-blue-300' },
};

const statusMap: Record<PrioritizedTask['status'], { label: string; icon: React.ReactNode; color: string }> = {
    pending: { label: 'Pending', icon: <ClockIcon />, color: 'text-gray-400' },
    working: { label: 'In Progress', icon: <LoadingIcon />, color: 'text-yellow-400' },
    complete: { label: 'Complete', icon: <CheckCircleIcon />, color: 'text-green-400' },
    error: { label: 'Error', icon: <ExclamationTriangleIcon />, color: 'text-red-400' },
};

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ task, onClose }) => {
    const { appState } = useMission();
    const member = CREW_MEMBERS.find(m => m.name === task.member);
    const priorityInfo = priorityMap[task.priority];
    const statusInfo = statusMap[task.status];

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-lg bg-gray-800 rounded-xl border border-white/20 flex flex-col glassmorphism">
                <div className="flex justify-between items-center p-4 border-b border-white/10">
                    <h3 className="text-lg font-orbitron text-indigo-300">Task Detail: #{task.id + 1}</h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10"><XIcon /></button>
                </div>

                <div className="p-4 space-y-4">
                    <div>
                        <label className="text-xs font-semibold text-gray-400">Task Description</label>
                        <p className="p-3 bg-gray-900/50 rounded-md mt-1">{task.task}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-semibold text-gray-400">Assigned To</label>
                            <div className="flex items-center gap-2 p-2 bg-gray-900/50 rounded-md mt-1">
                                <span className="w-6 h-6 text-cyan-400">{member?.icon}</span>
                                <span className="font-semibold">{member?.name}</span>
                            </div>
                        </div>
                         <div>
                            <label className="text-xs font-semibold text-gray-400">Status</label>
                             <div className={`flex items-center gap-2 p-2 bg-gray-900/50 rounded-md mt-1 font-semibold ${statusInfo.color}`}>
                                <span className="w-5 h-5">{statusInfo.icon}</span>
                                <span className="capitalize">{statusInfo.label}</span>
                            </div>
                        </div>
                         <div>
                            <label className="text-xs font-semibold text-gray-400">Priority</label>
                             <div className={`p-2 rounded-md mt-1 text-center font-bold text-sm ${priorityInfo.color}`}>
                                {priorityInfo.label}
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-gray-400">Dependencies</label>
                            <div className="p-2 bg-gray-900/50 rounded-md mt-1 h-10 overflow-y-auto scrollbar-thin">
                                {task.dependencies.length > 0 ? (
                                    task.dependencies.map(depId => (
                                        <span key={depId} className="inline-block bg-gray-700 text-gray-300 px-2 py-0.5 rounded-full text-xs mr-1">
                                            #{depId + 1}
                                        </span>
                                    ))
                                ) : (
                                    <p className="text-sm text-gray-500">None</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                 <div className="p-3 flex justify-end gap-3 bg-black/20 rounded-b-xl">
                    <button onClick={onClose} className="px-4 py-2 text-sm bg-gray-600 hover:bg-gray-500 rounded-md">Close</button>
                </div>
            </div>
        </div>
    );
};