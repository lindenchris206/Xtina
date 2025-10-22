import React, { useState } from 'react';
import { useMission } from '../context/MissionContext';
import { CrewDisplay } from './CrewDisplay';
import { MissionVitals } from './MissionVitals';
import { SignatureCell } from './SignatureCell';
import { SettingsPanel } from './SettingsPanel';
import { CrewChat } from './CrewChat';
import { MissionTimeline } from './MissionTimeline';
import { KnowledgeBase } from './KnowledgeBase';
import { CommanderLog } from './CommanderLog';
import { EventFeed } from './EventFeed';
import { LoadingIcon, IntelIcon, LinkIcon } from './icons';
import { CREW_MEMBERS } from '../constants';

// --- New Full-Page View Components ---

export const CommsView: React.FC = () => {
    const { activeCrew } = useMission();
    return (
        <div className="h-full">
            <CrewChat activeCrew={activeCrew} />
        </div>
    );
};

export const TimelineView: React.FC = () => {
    const { appState } = useMission();
    return (
        <div className="h-full">
            <MissionTimeline plan={appState.plan} />
        </div>
    );
};

export const IntelView: React.FC = () => {
    const { appState, updateKnowledgeBase, researchResult, performResearch } = useMission();
    const [researchQuery, setResearchQuery] = useState('');
    const [isResearching, setIsResearching] = useState(false);
    const researcher = CREW_MEMBERS.find(c => c.specialty === 'Research');

    const handleResearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!researchQuery.trim() || isResearching) return;
        setIsResearching(true);
        try {
            await performResearch(researchQuery);
        } catch (error) {
            console.error("Research failed:", error);
        }
        setIsResearching(false);
    };

    const handleAppendToKB = () => {
        if (researchResult?.summary) {
            const newContent = `${appState.knowledgeBase}\n\n## Research on: ${researchQuery}\n\n${researchResult.summary}`;
            updateKnowledgeBase(newContent.trim());
            alert("Intel appended to Knowledge Base.");
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
            <div className="glassmorphism rounded-xl p-4 flex flex-col">
                <div className="flex-shrink-0">
                    <h3 className="text-2xl font-orbitron text-indigo-300 flex items-center gap-3 mb-2">
                        <span className="w-8 h-8 text-cyan-400">{researcher?.icon}</span>
                        <div>
                            Intel & Research
                            <p className="text-xs font-sans text-gray-400">Task {researcher?.name || 'Researcher'} to gather intel from online sources.</p>
                        </div>
                    </h3>
                    <form onSubmit={handleResearch} className="flex gap-2">
                        <input
                            type="text"
                            value={researchQuery}
                            onChange={e => setResearchQuery(e.target.value)}
                            placeholder="Enter research topic..."
                            className="w-full bg-gray-900/50 border border-white/20 rounded-md px-4 py-2 text-sm focus:ring-cyan-500 focus:border-cyan-500"
                            disabled={isResearching}
                        />
                        <button type="submit" className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-md font-semibold disabled:bg-gray-600" disabled={isResearching}>
                            {isResearching ? <LoadingIcon /> : "Research"}
                        </button>
                    </form>
                </div>

                <div className="flex-grow mt-4 overflow-y-auto scrollbar-thin pr-2">
                    {isResearching && (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400">
                            <LoadingIcon />
                            <p className="mt-2 animate-pulse">{researcher?.name || 'Researcher'} is gathering intel...</p>
                        </div>
                    )}
                    {researchResult && (
                        <div className="space-y-4">
                            <div>
                                <h4 className="font-orbitron text-cyan-300 text-lg">Research Summary</h4>
                                <p className="text-sm text-gray-300 whitespace-pre-wrap mt-1 bg-gray-900/50 p-3 rounded-md">{researchResult.summary}</p>
                            </div>
                            {researchResult.sources.length > 0 && (
                                <div>
                                    <h4 className="font-orbitron text-cyan-300 text-lg">Sources</h4>
                                    <div className="space-y-2 mt-1">
                                        {researchResult.sources.map((source, index) => (
                                            <a key={index} href={source.uri} target="_blank" rel="noopener noreferrer" className="flex items-start gap-2 text-sm p-2 bg-gray-900/50 rounded-md hover:bg-indigo-500/50">
                                                <span className="w-4 h-4 text-indigo-300 mt-0.5 flex-shrink-0"><LinkIcon/></span>
                                                <span className="text-indigo-300 underline truncate" title={source.uri}>{source.title || source.uri}</span>
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                             <button onClick={handleAppendToKB} className="w-full mt-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-md font-semibold">
                                Append Summary to Knowledge Base
                            </button>
                        </div>
                    )}
                </div>
            </div>
            <div className="h-full">
                <KnowledgeBase />
            </div>
        </div>
    );
};


export const SettingsView: React.FC = () => {
    const { appState, settings, setSettings } = useMission();

    const handleSettingsChange = (newSettings: Partial<typeof settings>) => {
        setSettings(prev => ({ ...prev, ...newSettings }));
    };

    return (
        <div className="h-full overflow-y-auto scrollbar-thin">
            <div className="max-w-4xl mx-auto glassmorphism rounded-xl p-6">
                 <SettingsPanel 
                    settings={settings} 
                    onSettingsChange={handleSettingsChange} 
                    onExport={() => {}} 
                    onImport={() => {}}
                    onArchive={() => {}}
                    archivedMissions={appState.archivedMissions}
                    onRestoreMission={() => {}}
                    onDeleteMission={() => {}}
                />
            </div>
        </div>
    );
};


// --- Redesigned Main Dashboard View ---

export const DashboardView: React.FC = () => {
    const { appState, settings, activeCrew } = useMission();
    
    return (
        <div className="h-full grid grid-cols-1 lg:grid-cols-3 grid-rows-3 gap-6">
            <div className="lg:col-span-2 row-span-1">
                 <CommanderLog />
            </div>
             <div className="lg:col-span-1 row-span-3">
                 <EventFeed />
            </div>
             <div className="lg:col-span-1 row-span-1">
                <MissionVitals plan={appState.plan} status={appState.missionStatus} />
            </div>
             <div className="lg:col-span-1 row-span-1">
                 <SignatureCell />
            </div>
             <div className="lg:col-span-2 row-span-2">
                 <CrewDisplay crew={settings.crewConfig} activeCrewNames={activeCrew.map(c => c.name)} statuses={appState.crewStatuses} modelAssignments={settings.crewModelAssignments} />
            </div>
        </div>
    )
};