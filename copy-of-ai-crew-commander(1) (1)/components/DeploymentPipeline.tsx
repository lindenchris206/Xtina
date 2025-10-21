import React, { useEffect } from 'react';
import { useMission } from '../context/MissionContext';
import { CheckIcon, LoadingIcon, XIcon } from './icons';

const getStatusIcon = (status: 'pending' | 'running' | 'success' | 'failed') => {
    switch(status) {
        case 'running': return <span className="text-yellow-400"><LoadingIcon/></span>;
        case 'success': return <span className="text-green-400"><CheckIcon/></span>;
        case 'failed': return <span className="text-red-400"><XIcon/></span>;
        case 'pending':
        default: return <span className="text-gray-500">-</span>;
    }
}

export const DeploymentPipeline: React.FC = () => {
    const { appState, setAppState } = useMission();
    const { deploymentLogs, deploymentStatus } = appState;

    const handleClose = () => {
        if (deploymentStatus === 'success' || deploymentStatus === 'failed') {
            // FIX: The setAppState from context is a dispatch function and expects an action object, not a function.
            setAppState({ type: 'RESET_DEPLOYMENT' });
        }
    }

    const isFinished = deploymentStatus === 'success' || deploymentStatus === 'failed';

    return (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
            <div className="w-full max-w-2xl bg-gray-900 rounded-xl border border-purple-500/50 flex flex-col glassmorphism shadow-2xl shadow-purple-500/20">
                <div className="flex justify-between items-center p-3 border-b border-white/10">
                     <h3 className="text-lg font-orbitron text-purple-300">Deployment Pipeline (via Aquila)</h3>
                     {isFinished && <button onClick={handleClose} className="p-1 rounded-full hover:bg-white/10"><XIcon /></button>}
                </div>
                <div className="p-4 font-mono text-sm max-h-96 overflow-y-auto scrollbar-thin">
                    {deploymentLogs.map((log, index) => (
                        <div key={index} className="flex items-center gap-3">
                            <div className="w-5 h-5 flex items-center justify-center">{getStatusIcon(log.status)}</div>
                            <span className={log.status === 'running' ? 'text-yellow-300' : log.status === 'success' ? 'text-green-300' : log.status === 'failed' ? 'text-red-400' : 'text-gray-400'}>
                                {log.step}
                            </span>
                        </div>
                    ))}
                </div>
                <div className="p-3 border-t border-white/10 text-center">
                    {deploymentStatus === 'running' && <p className="text-yellow-300 animate-pulse">Deployment in progress...</p>}
                    {deploymentStatus === 'success' && <p className="text-green-300 font-bold">Deployment Successful!</p>}
                    {deploymentStatus === 'failed' && <p className="text-red-400 font-bold">Deployment Failed!</p>}
                </div>
            </div>
        </div>
    );
}
