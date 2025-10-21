import React, { useState, useMemo } from 'react';
import type { MissionEvent } from '../types';
import { useMission } from '../context/MissionContext';
import { CheckCircleIcon, FileIcon, UserIcon, PlayCircleIcon, FlagIcon, ExclamationTriangleIcon, ChevronDownIcon } from './icons';

const EVENT_TYPES: MissionEvent['type'][] = ['TASK_COMPLETE', 'FILE_CREATED', 'COMMAND_ISSUED', 'MISSION_START', 'MISSION_COMPLETE', 'ERROR'];

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
    const [filter, setFilter] = useState<string>('ALL');

    const filteredEvents = useMemo(() => {
        if (filter === 'ALL') return missionEvents;
        return missionEvents.filter(event => event.type === filter);
    }, [filter, missionEvents]);
    
    return (
        <div className="p-4 glassmorphism rounded-xl h-full flex flex-col">
            <div className="flex-shrink-0 flex justify-between items-center mb-4">
                <h3 className="text-xl font-orbitron text-[rgb(var(--color-text-header))]">Event Feed</h3>
                <div className="relative">
                    <select 
                        value={filter} 
                        onChange={e => setFilter(e.target.value)}
                        className="appearance-none bg-gray-800/70 border border-white/20 rounded-md px-3 py-1 text-xs pr-8"
                    >
                        <option value="ALL">All Events</option>
                        {EVENT_TYPES.map(type => (
                            <option key={type} value={type}>{type.replace(/_/g, ' ').toLowerCase()}</option>
                        ))}
                    </select>
                    <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none w-5 h-5 text-gray-400">
                        <ChevronDownIcon />
                    </span>
                </div>
            </div>
            <div className="flex-grow overflow-y-auto scrollbar-thin -mr-2 pr-2">
                {filteredEvents.length === 0 ? (
                     <p className="text-center text-gray-500 text-sm h-full flex items-center justify-center">
                         {filter === 'ALL' ? 'No mission events recorded.' : `No events of type "${filter.toLowerCase().replace('_', ' ')}".`}
                    </p>
                ) : (
                    <div className="space-y-3">
                        {filteredEvents.map(event => (
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