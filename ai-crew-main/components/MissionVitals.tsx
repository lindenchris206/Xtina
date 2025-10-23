import React from 'react';
import type { Plan, MissionStatus } from '../types';
import { useMission } from '../context/MissionContext';

interface MissionVitalsProps {
    plan: Plan | null;
    status: MissionStatus;
}

export const MissionVitals: React.FC<MissionVitalsProps> = ({ plan, status }) => {
    const { completedTasks } = useMission();
    const costPerTask = 150; // Simulated "Compute Units"
    const timePerTask = 5; // Simulated "Seconds"
    
    const totalTasks = plan?.tasks.length || 0;
    const estimatedCost = totalTasks * costPerTask;
    const estimatedTime = totalTasks * timePerTask;
    const currentCost = completedTasks * costPerTask;

    const getStatusInfo = () => {
        switch(status) {
            case 'idle': return { text: 'Awaiting Orders', color: 'text-gray-400' };
            case 'planning': return { text: 'Planning...', color: 'text-yellow-400 animate-pulse' };
            case 'awaiting_approval': return { text: 'Awaiting Approval', color: 'text-yellow-400' };
            case 'executing': return { text: `Executing (${completedTasks}/${totalTasks})`, color: 'text-green-400 animate-pulse' };
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
                    <p className="text-xl font-bold text-cyan-300">
                        {status === 'executing' || status === 'complete' 
                            ? `${currentCost.toLocaleString()} / ${estimatedCost.toLocaleString()}`
                            : plan ? estimatedCost.toLocaleString() : '---'
                        }
                    </p>
                </div>
                <div>
                    <p className="text-sm text-gray-400">Est. ETA (sec)</p>
                    <p className="text-xl font-bold text-cyan-300">{plan ? estimatedTime : '---'}</p>
                </div>
            </div>
        </div>
    );
};