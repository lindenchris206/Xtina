import React from 'react';
import type { MissionDebrief } from '../types';

interface MissionDebriefViewProps {
    debrief: MissionDebrief;
}

export const MissionDebriefView: React.FC<MissionDebriefViewProps> = ({ debrief }) => {
    return (
        <div className="border-t-2 border-green-500/30 pt-3 mt-3 text-xs">
            <h4 className="text-sm font-bold text-green-400 mb-2">Mission Debrief: {debrief.projectName}</h4>
            <p className="text-gray-300 mb-3 italic">{debrief.summary}</p>
            <div className="grid grid-cols-2 gap-2">
                <div>
                    <p className="font-semibold text-gray-400">Tasks Completed:</p>
                    <p className="text-green-300">{debrief.tasksCompleted}</p>
                </div>
                 <div>
                    <p className="font-semibold text-gray-400">Files Created/Modified:</p>
                    <p className="text-green-300">{debrief.filesCreated}</p>
                </div>
                 <div>
                    <p className="font-semibold text-gray-400">Final Compute Cost:</p>
                    <p className="text-green-300">{debrief.finalCost.toLocaleString()} Units</p>
                </div>
                <div>
                    <p className="font-semibold text-gray-400">Lead Agents:</p>
                    <p className="text-green-300 truncate">{debrief.collaborators.join(', ')}</p>
                </div>
            </div>
        </div>
    );
};
