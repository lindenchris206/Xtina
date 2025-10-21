import React, { useMemo, useEffect, useState } from 'react';
import { SettingsPanel } from './SettingsPanel';
import { CrewDisplay } from './CrewDisplay';
import { MissionVitals } from './MissionVitals';
import { IDEView } from './IDEView';
import { TaskListView } from './TaskListView';
import { MissionEventLog } from './MissionEventLog';
import { PlayIcon, RefreshIcon, BrainIcon, PauseIcon, StopIcon, FileTextIcon, MicrophoneIcon, HelpIcon, ShareIcon, InboxIcon } from './icons';
import { MissionDebriefView } from './MissionDebriefView';
import { HelpModal } from './HelpModal';
import { CREW_MEMBERS } from '../constants';
import { useMissionContext } from '../hooks/useMissionContext';
import { useVoiceRecognition } from '../hooks/useVoiceRecognition';
import { CommsCenter } from './CommsCenter';
import { AVATARS } from './avatars';

const PRESET_OBJECTIVES = [
    { name: 'React/Vite SPA', objective: 'Create a simple "To-Do List" application using React, Vite, and Tailwind CSS. The app should allow users to add, view, and delete tasks.' },
    { name: 'Express API', objective: 'Develop a basic REST API using Express.js and TypeScript for managing a collection of "books". It should have endpoints for GET, POST, and DELETE.' },
    { name: 'Python Script', objective: 'Write a Python script that fetches the current weather for a given city using an open API (e.g., OpenWeatherMap) and prints a summary to the console.' },
];


export const AstraUI: React.FC = () => {
    const { state, dispatch } = useMissionContext();
    const [isHelpOpen, setIsHelpOpen] = useState(false);
    const [activeView, setActiveView] = useState<'mission' | 'comms'>('mission');

    const {
        settings, missionObjective, missionStatus, plan, missionDebrief,
        projectFiles, selectedFile, crewStatuses, missionEvents, isAstraSpeaking
    } = state;

    const { isListening, transcript, startListening, stopListening, hasRecognitionSupport } = useVoiceRecognition();
    
    useEffect(() => {
        if (transcript) {
            dispatch({ type: 'SET_MISSION_OBJECTIVE', payload: transcript });
        }
    }, [transcript, dispatch]);

    const handleMicClick = () => {
        if (isListening) {
            stopListening();
        } else {
            startListening(missionObjective);
        }
    };

    const handleShare = async () => {
        if (!state.plan) return;

        const missionDataString = JSON.stringify(state, null, 2);
        const missionBlob = new Blob([missionDataString], { type: 'application/json' });
        const safeProjectName = state.plan.projectName.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'mission';
        const missionFile = new File([missionBlob], `${safeProjectName}.json`, { type: 'application/json' });

        const shareData = {
            title: 'AI WORKCREW Mission',
            text: `Check out my mission progress for "${state.plan.projectName}"! You can import this file to view the state.`,
            files: [missionFile],
        };

        if (navigator.share && navigator.canShare && navigator.canShare({ files: [missionFile] })) {
            try {
                await navigator.share(shareData);
                dispatch({ type: 'ADD_EVENT', payload: { type: 'info', agent: 'System', message: 'Mission shared successfully.', timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) } });
            } catch (error: any) {
                if (error.name !== 'AbortError') {
                    console.error('Share failed:', error);
                    dispatch({ type: 'ADD_EVENT', payload: { type: 'error', agent: 'System', message: `Mission sharing failed: ${error.message}`, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) } });
                }
            }
        } else {
            try {
                await navigator.clipboard.writeText(missionDataString);
                dispatch({ type: 'ADD_EVENT', payload: { type: 'success', agent: 'System', message: 'Web Share not supported. Mission state copied to clipboard!', timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) } });
            } catch (err) {
                console.error('Failed to copy mission state:', err);
                dispatch({ type: 'ADD_EVENT', payload: { type: 'error', agent: 'System', message: 'Failed to copy mission state to clipboard.', timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) } });
            }
        }
    };


    const activeCrew = useMemo(() => settings.crewConfig.slice(0, settings.crewSize), [settings.crewConfig, settings.crewSize]);

    const renderMissionContent = () => {
        switch (missionStatus) {
            case 'idle':
                return (
                     <div className="text-center py-8">
                        <div className="inline-block p-4 bg-gray-900/50 rounded-full border border-cyan-500/50 mb-4">
                            <BrainIcon />
                        </div>
                        <h3 className="text-xl font-orbitron text-indigo-300">Welcome, Commander</h3>
                        <p className="text-sm text-gray-400 mt-2">Define your objective, or select a preset to begin.</p>
                        <div className="flex gap-2 justify-center mt-4">
                            {PRESET_OBJECTIVES.map(p => (
                                <button key={p.name} onClick={() => dispatch({ type: 'SET_MISSION_OBJECTIVE', payload: p.objective })} className="text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 font-bold py-1 px-3 rounded-full transition-colors">
                                    {p.name}
                                </button>
                            ))}
                        </div>
                    </div>
                );
            case 'complete':
                 return missionDebrief ? <MissionDebriefView debrief={missionDebrief} /> : null;
            case 'error':
                 return (
                    <div className="text-center py-8">
                         <h3 className="text-xl font-orbitron text-red-400">Mission Failure</h3>
                         <p className="text-sm text-gray-400 mt-2">An error occurred. Check the event log and task list for details and recovery options.</p>
                     </div>
                 );
            default: // 'planning', 'awaiting_approval', 'executing', 'paused'
                return plan && (
                    <div className="mt-4">
                        <h3 className="text-xl font-orbitron text-indigo-300">{plan.projectName}</h3>
                        <p className="text-sm text-gray-400 italic my-2">{plan.summary}</p>
                        <TaskListView tasks={plan.tasks} deliberation={plan.deliberation} />
                    </div>
                );
        }
    };

    const renderActionButtons = () => {
        if (missionStatus === 'complete' || missionStatus === 'error') {
            return (
                 <button
                    onClick={() => dispatch({ type: 'START_NEW_MISSION' })}
                    className="flex items-center justify-center gap-2 flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded transition-colors"
                >
                    <RefreshIcon />
                    Start New Mission
                </button>
            );
        }
         if (missionStatus === 'executing' || missionStatus === 'paused') {
            return (
                <div className="flex gap-4">
                    <button
                        onClick={() => dispatch({ type: missionStatus === 'executing' ? 'PAUSE_MISSION' : 'RESUME_MISSION' })}
                        className="flex items-center justify-center gap-2 flex-1 bg-yellow-600 hover:bg-yellow-500 text-white font-bold py-2 px-4 rounded transition-colors"
                    >
                        {missionStatus === 'executing' ? <><PauseIcon /> Pause</> : <><PlayIcon /> Resume</>}
                    </button>
                    <button
                        onClick={() => {
                            if (window.confirm("Are you sure you want to abort the mission? All progress will be lost.")) {
                                dispatch({ type: 'ABORT_MISSION' });
                            }
                        }}
                        className="flex items-center justify-center gap-2 flex-1 bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-4 rounded transition-colors"
                    >
                        <StopIcon /> Abort Mission
                    </button>
                </div>
            );
        }
        return (
            <div className="flex gap-4">
                <button
                    onClick={() => dispatch({ type: 'START_PLANNING' })}
                    disabled={missionStatus === 'planning' || !missionObjective.trim()}
                    className="flex items-center justify-center gap-2 flex-1 bg-cyan-600 hover:bg-cyan-500 disabled:bg-gray-600 text-white font-bold py-2 px-4 rounded transition-colors"
                >
                    {missionStatus === 'planning' ? 'Planning...' : 'Generate Plan'}
                </button>
                <button
                    onClick={() => dispatch({ type: 'APPROVE_PLAN' })}
                    disabled={missionStatus !== 'awaiting_approval'}
                    className="flex items-center justify-center gap-2 flex-1 bg-green-600 hover:bg-green-500 disabled:bg-gray-600 text-white font-bold py-2 px-4 rounded transition-colors"
                >
                    <PlayIcon />
                    Approve & Execute
                </button>
            </div>
        );
    };

    const AvatarComponent = AVATARS[settings.astraAvatar]?.component || AVATARS['Astra'].component;

    return (
        <div className={`min-h-screen bg-gray-900 text-white font-sans theme-${settings.theme}`}>
            <div className="container mx-auto p-4 space-y-4">
                <header className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <AvatarComponent isSpeaking={isAstraSpeaking} />
                        <div>
                            <h1 className="text-3xl font-orbitron text-cyan-300">Chris' AI WORKCREW</h1>
                            <p className="text-sm text-gray-400">Project ASTRA: Autonomous Swarm Task-force for Rapid Accomplishment</p>
                        </div>
                    </div>
                     <div className="flex items-center gap-2">
                        <button
                            onClick={() => setActiveView(activeView === 'mission' ? 'comms' : 'mission')}
                            className={`flex items-center gap-2 font-bold py-2 px-4 rounded transition-colors ${activeView === 'comms' ? 'bg-indigo-600 text-white' : 'bg-gray-700 hover:bg-gray-600 text-white'}`}
                            title="Comms Center"
                        >
                            <InboxIcon /> {activeView === 'comms' ? 'Mission Control' : 'Comms'}
                        </button>
                        <button
                            onClick={handleShare}
                            disabled={!state.plan}
                            className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 text-white font-bold py-2 px-4 rounded transition-colors"
                            title="Share Mission"
                        >
                            <ShareIcon/>
                        </button>
                        <button
                            onClick={() => setIsHelpOpen(true)}
                            className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded transition-colors"
                            title="Help & Documentation"
                        >
                            <HelpIcon/>
                        </button>
                        {missionStatus === 'complete' && activeView === 'mission' && (
                             <button
                                onClick={() => dispatch({ type: 'ADD_EVENT', payload: { type: 'info', agent: 'System', message: 'GENERATE_README', timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) }})} 
                                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded transition-colors"
                            >
                                <FileTextIcon/>
                                README
                            </button>
                        )}
                        {activeView === 'mission' && (
                             <button
                                onClick={() => dispatch({ type: 'ADD_EVENT', payload: { type: 'info', message: 'DOWNLOAD_PROJECT', timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) }})}
                                disabled={projectFiles.length === 0}
                                className="bg-green-600 hover:bg-green-500 disabled:bg-gray-600 text-white font-bold py-2 px-4 rounded transition-colors"
                            >
                                Download Project
                            </button>
                        )}
                    </div>
                </header>

                {activeView === 'mission' ? (
                    <>
                        <main className="grid grid-cols-12 gap-4">
                            {/* Left Column */}
                            <div className="col-span-12 lg:col-span-3 space-y-4">
                                <SettingsPanel />
                                <MissionVitals />
                            </div>

                            {/* Center Column */}
                            <div className="col-span-12 lg:col-span-6 space-y-4">
                                <div className="p-4 glassmorphism rounded-xl">
                                    <h3 className="text-2xl font-orbitron text-indigo-300 mb-4">Mission Control</h3>
                                    <div className="space-y-4">
                                        <div className="relative">
                                            <textarea
                                                value={missionObjective}
                                                onChange={(e) => dispatch({ type: 'SET_MISSION_OBJECTIVE', payload: e.target.value })}
                                                placeholder="Enter your high-level mission objective here..."
                                                className="w-full h-24 bg-gray-900/50 border border-white/20 rounded-md p-2 focus:ring-cyan-500 focus:border-cyan-500 resize-none pr-10"
                                                disabled={missionStatus !== 'idle'}
                                            />
                                            {hasRecognitionSupport && (
                                                <button
                                                    onClick={handleMicClick}
                                                    title={isListening ? 'Stop Listening' : 'Start Listening'}
                                                    className={`absolute right-2 top-2 p-1 rounded-full transition-colors ${
                                                        isListening 
                                                        ? 'text-red-500 bg-red-900/50 animate-mic-pulse' 
                                                        : 'text-gray-400 hover:bg-gray-700'
                                                    }`}
                                                    disabled={missionStatus !== 'idle'}
                                                >
                                                    <MicrophoneIcon />
                                                </button>
                                            )}
                                        </div>
                                        {renderActionButtons()}
                                    </div>
                                    
                                    {renderMissionContent()}
                                </div>

                                <div className="p-4 glassmorphism rounded-xl h-96 flex flex-col">
                                    <h3 className="text-2xl font-orbitron text-indigo-300 mb-4">Mission Event Log</h3>
                                     <div className="flex-grow overflow-y-auto scrollbar-thin">
                                        <MissionEventLog events={missionEvents} />
                                    </div>
                                </div>

                            </div>
                            
                            {/* Right Column */}
                            <div className="col-span-12 lg:col-span-3 space-y-4">
                                <CrewDisplay crew={CREW_MEMBERS} activeCrewNames={activeCrew.map(c => c.name)} statuses={crewStatuses} modelAssignments={settings.crewModelAssignments} />
                            </div>
                        </main>
                        
                        {/* Bottom Section - IDE */}
                        <section>
                            <IDEView 
                                projectFiles={projectFiles} 
                                selectedFile={selectedFile} 
                                onFileSelect={(file) => dispatch({ type: 'SELECT_FILE', payload: file })}
                                onFileContentChange={(path, content) => dispatch({ type: 'UPDATE_FILE_CONTENT', payload: { path, newContent: content }})}
                            />
                        </section>
                    </>
                ) : (
                    <CommsCenter />
                )}


                {isHelpOpen && <HelpModal onClose={() => setIsHelpOpen(false)} />}
            </div>
        </div>
    );
};