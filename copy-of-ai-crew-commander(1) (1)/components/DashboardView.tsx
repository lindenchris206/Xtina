

/**
 * @author cel
 * @file components/DashboardView.tsx
 * @description Renders the main dashboard layout.
 */
import React from 'react';
import { useMission } from '../context/MissionContext';
import { CommanderLog } from './CommanderLog';
import { CrewDisplay } from './CrewDisplay';
import { EventFeed } from './EventFeed';
import { MissionVitals } from './MissionVitals';
import { SignatureCell } from './SignatureCell';
import { InstructionPanel } from './InstructionPanel';

export const DashboardView: React.FC = () => {
    const { appState, settings, activeCrew } = useMission();
    
    return (
        <div className="h-full overflow-y-auto scrollbar-thin">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 <div className="md:col-span-2 lg:col-span-3">
                     <InstructionPanel title="Welcome, Commander!" storageKey="dashboard-instructions-v2">
                         <p>This is your command center. Issue your project objective to Astra in the floating widget on the right to get started.</p>
                         <p className="mt-1 text-xs text-gray-400">You can monitor your crew's status, review the event feed, and see mission vitals below.</p>
                     </InstructionPanel>
                </div>
                <div className="md:col-span-2 lg:col-span-2 row-span-1 min-h-[250px]">
                     <CommanderLog />
                </div>
                 <div className="lg:col-span-1 row-span-1 lg:row-span-3 min-h-[300px] lg:min-h-0">
                     <EventFeed />
                </div>
                 <div className="md:col-span-1 lg:col-span-1 row-span-1 min-h-[180px]">
                    <MissionVitals plan={appState.plan} status={appState.missionStatus} />
                </div>
                 <div className="md:col-span-1 lg:col-span-1 row-span-1 min-h-[180px]">
                     <SignatureCell />
                </div>
                 <div className="md:col-span-2 lg:col-span-2 row-span-1 lg:row-span-2 min-h-[400px]">
                     <CrewDisplay crew={settings.crewConfig} activeCrewNames={activeCrew.map(c => c.name)} statuses={appState.crewStatuses} modelAssignments={settings.crewModelAssignments} />
                </div>
            </div>
        </div>
    )
};