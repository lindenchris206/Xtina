import React from 'react';
import { useMission } from '../context/MissionContext';
import { getMockPage } from './simulated/MockPages';
import { LoadingIcon } from './icons';

export const SimulatedBrowser: React.FC = () => {
    const { appState } = useMission();
    const { currentURL, isLoading, formValues, activeElement } = appState.browserState;
    
    const PageComponent = getMockPage(currentURL);

    return (
        <div className="w-full h-full bg-gray-800 rounded-lg overflow-hidden border border-white/10 flex flex-col glassmorphism">
            <div className="flex-shrink-0 p-2 bg-gray-900 flex items-center gap-2 border-b border-white/10">
                <div className="flex gap-1.5">
                    <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                    <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
                    <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                </div>
                <div className="flex-grow bg-gray-700 rounded-full px-4 py-1 text-xs text-gray-300 flex items-center">
                    {isLoading && <span className="mr-2"><LoadingIcon/></span>}
                    https://{currentURL.replace(/_/g, '-')}.sim.dev
                </div>
            </div>
            <div className="flex-grow bg-gray-700/50 overflow-y-auto scrollbar-thin">
                <PageComponent formValues={formValues} activeElement={activeElement} />
            </div>
        </div>
    );
};
