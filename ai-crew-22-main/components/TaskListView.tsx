import React from 'react';
import type { PrioritizedTask, DeliberationStep } from '../types';
import { CREW_MEMBERS } from '../constants';
import { RefreshIcon } from './icons';
import { useMissionContext } from '../hooks/useMissionContext';

interface TaskListViewProps {
    tasks: PrioritizedTask[];
    deliberation: DeliberationStep[];
}

export const TaskListView: React.FC<TaskListViewProps> = ({ tasks, deliberation }) => {
    const { state, dispatch } = useMissionContext();
    const { missionStatus, currentTaskIndex, failedTaskIndex } = state;

    const handleRetry = () => {
        if (failedTaskIndex !== null) {
            dispatch({ type: 'RESUME_MISSION' }); // Resumes from the failed task index
        }
    };
    
    const handleSkip = () => {
        if (failedTaskIndex !== null) {
            const nextIndex = failedTaskIndex + 1;
             // Dispatch a special event that the context can listen for
            dispatch({ type: 'ADD_EVENT', payload: { type: 'warning', message: `Skipping failed task #${failedTaskIndex + 1}. Proceeding to task #${nextIndex + 1}.`, agent: 'Commander', timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) }});
            if (nextIndex >= tasks.length) {
                // If the skipped task was the last one, the mission is now complete.
                dispatch({ type: 'MISSION_COMPLETE' });
            }
        }
    };

    return (
        <div className="border-l-2 border-cyan-500/30 pl-4 my-4 space-y-2">
            
            {deliberation.length > 0 && (
                 <>
                    <h4 className="text-sm font-bold text-cyan-400">Deliberation Log:</h4>
                    <div className="text-xs p-2 rounded-md bg-gray-900/50 border border-gray-600 space-y-2">
                        {deliberation.map((step, index) => (
                             <p key={index} className="text-gray-400">
                                <span className="font-bold text-indigo-300">{step.agent}: </span>
                                {step.thought}
                            </p>
                        ))}
                    </div>
                 </>
            )}

            <h4 className="text-sm font-bold text-cyan-400 mt-4">Plan of Attack:</h4>
            {tasks.map((task, index) => {
                const memberInfo = CREW_MEMBERS.find(m => m.name === task.member);
                const isCurrent = (missionStatus === 'executing' || missionStatus === 'paused') && index === currentTaskIndex;
                const isComplete = (missionStatus === 'executing' || missionStatus === 'paused' || missionStatus === 'complete') && index < currentTaskIndex;
                const isFailed = (missionStatus === 'error') && index === failedTaskIndex;

                let statusStyles = 'bg-gray-900/50 border-gray-600';
                if (isCurrent) statusStyles = 'bg-yellow-900/50 border-yellow-500 animate-pulse';
                if (isComplete) statusStyles = 'bg-green-900/30 border-green-700 opacity-60';
                if (isFailed) statusStyles = 'bg-red-900/50 border-red-500';
                
                return (
                    <div key={index} className={`flex items-start gap-3 text-xs p-2 rounded-md border transition-all ${statusStyles}`}>
                        <div className="flex-shrink-0 w-5 h-5 text-cyan-400 mt-0.5">
                            {memberInfo?.icon}
                        </div>
                        <div className="flex-grow">
                            <p className="font-semibold text-gray-300">{index + 1}. {task.task}</p>
                            <p className="text-gray-400 text-[10px] mt-1">Assigned to: {task.member}</p>
                            {task.dependencies && task.dependencies.length > 0 && (
                                <p className="text-yellow-400 text-[10px] mt-1">
                                    Depends on: {task.dependencies.map(dep => `#${dep + 1}`).join(', ')}
                                </p>
                            )}
                        </div>
                        {isFailed && (
                            <div className="flex-shrink-0 flex items-center gap-2">
                                <button onClick={handleRetry} className="flex items-center gap-1 text-xs bg-yellow-600 hover:bg-yellow-500 text-white font-bold py-1 px-2 rounded">
                                    <RefreshIcon className="w-3 h-3"/> Retry
                                </button>
                                 <button onClick={handleSkip} className="text-xs bg-gray-600 hover:bg-gray-500 text-white font-bold py-1 px-2 rounded">
                                    Skip
                                </button>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};