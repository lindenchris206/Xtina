import React from 'react';
import { useMissionContext } from '../hooks/useMissionContext';

export const MissionVitals: React.FC = () => {
    const { state } = useMissionContext();
    const { plan, missionStatus, totalComputeUnits } = state;

    const costPerTask = 150; // Simulated "Compute Units"
    const timePerTask = 5; // Simulated "Seconds"
    
    const totalTasks = plan?.tasks.length || 0;
    const estimatedCost = totalTasks * costPerTask;
    const estimatedTime = totalTasks * timePerTask;

    const getStatusInfo = () => {
        switch(missionStatus) {
            case 'idle': return { text: 'Awaiting Orders', color: 'text-gray-400' };
            case 'planning': return { text: 'Planning...', color: 'text-yellow-400 animate-pulse' };
            case 'awaiting_approval': return { text: 'Awaiting Approval', color: 'text-yellow-400' };
            case 'executing': return { text: 'Executing', color: 'text-green-400 animate-pulse' };
            case 'paused': return { text: 'Paused', color: 'text-yellow-400' };
            case 'complete': return { text: 'Complete', color: 'text-green-400' };
            case 'error': return { text: 'Error', color: 'text-red-500' };
            default: return { text: 'Unknown', color: 'text-gray-500' };
        }
    };

    const statusInfo = getStatusInfo();

    return (
        <div className="p-4 glassmorphism rounded-xl">
            <h3 className="text-2xl font-orbitron text-indigo-300 mb-4">Mission Vitals</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                    <p className="text-sm text-gray-400">Status</p>
                    <p className={`text-xl font-bold ${statusInfo.color}`}>{statusInfo.text}</p>
                </div>
                <div>
                    <p className="text-sm text-gray-400">Compute Units</p>
                    <p className="text-xl font-bold text-cyan-300">{totalComputeUnits.toLocaleString()}</p>
                </div>
                <div>
                    <p className="text-sm text-gray-400">Est. ETA (sec)</p>
                    <p className="text-xl font-bold text-cyan-300">{plan ? estimatedTime : '---'}</p>
                </div>
            </div>
        </div>
    );
};
