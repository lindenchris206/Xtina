import React from 'react';
import type { MissionEvent } from '../types';
import { useMission } from '../context/MissionContext';
import { CheckIcon, FileIcon, UserIcon, CheckCircleIcon, PlayCircleIcon, FlagIcon, ExclamationTriangleIcon } from './icons'; // Assuming new icons are added

const EventIcon: React.FC<{ type: MissionEvent['type'] }> = ({ type }) => {
    const iconClass = "w-4 h-4";
    switch(type) {
        case 'TASK_COMPLETE': return <span className={`text-green-400 ${iconClass}`}><CheckCircleIcon /></span>;
        case 'FILE_CREATED': return <span className={`text-cyan-400 ${iconClass}`}><FileIcon /></span>;
        case 'COMMAND_ISSUED': return <span className={`text-indigo-400 ${iconClass}`}><UserIcon /></span>;
        case 'MISSION_START': return <span className={`text-yellow-400 ${iconClass}`}><PlayCircleIcon /></span>;
        case 'MISSION_COMPLETE': return <span className={`text-purple-400 ${iconClass}`}><FlagIcon /></span>;
        case 'ERROR': return <span className={`text-red-400 ${iconClass}`}><ExclamationTriangleIcon /></span>;
        default: return null;
    }
};


export const EventFeed: React.FC = () => {
    const { appState } = useMission();
    const { missionEvents } = appState;
    
    return (
        <div className="p-4 glassmorphism rounded-xl h-full flex flex-col">
            <h3 className="text-xl font-orbitron text-[rgb(var(--color-text-header))] mb-4 flex-shrink-0">Mission Event Feed</h3>
            <div className="flex-grow overflow-y-auto scrollbar-thin -mr-2 pr-2">
                {missionEvents.length === 0 ? (
                     <p className="text-center text-gray-500 text-sm h-full flex items-center justify-center">No mission events recorded yet.</p>
                ) : (
                    <div className="space-y-3">
                        {missionEvents.map(event => (
                             <div key={event.id} className="flex items-start gap-3 text-sm">
                                <EventIcon type={event.type} />
                                <div className="flex-grow">
                                    <p className="text-gray-300">
                                        {event.author && <span className="font-semibold text-white">{event.author} </span>}
                                        {event.text}
                                    </p>
                                    <p className="text-xs text-gray-500">{new Date(event.timestamp).toLocaleTimeString()}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};