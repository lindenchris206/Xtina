import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useMission } from './context/MissionContext';
import { AstraAssistantWidget } from './components/AstraAssistantWidget';
import { AVATARS } from './components/avatars';
import { DeploymentPipeline } from './components/DeploymentPipeline';
import { UserProfileModal } from './components/UserProfileModal';
import { DashboardView, CommsView, TimelineView, IntelView, SettingsView } from './components/ApplicationViews';
import { RosterView } from './components/RosterView';
import { EmailClientView } from './components/EmailClientView';
import { IDEView } from './components/IDEView';
import { SimulatedBrowser } from './components/SimulatedBrowser';
import { APIKeyManager } from './components/APIKeyManager';
import { LoginScreen } from './components/LoginScreen';
import { GlobalSearchBar } from './components/GlobalSearchBar';
import { Sidebar } from './components/Sidebar';
import { CommandPalette } from './components/CommandPalette';
import type { ApplicationName, CrewMember, GeneratedFile } from './types';

interface SearchResult {
    type: 'file' | 'crew';
    item: GeneratedFile | CrewMember;
}

export default function App() {
    const { appState, settings, updateFileContent, setAppState, logout, currentUser, setActiveFile, setActiveCommsChannel } = useMission();
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
    const searchContainerRef = useRef<HTMLDivElement>(null);

    const searchResults: SearchResult[] = useMemo(() => {
        if (!searchQuery.trim()) return [];

        const lowercasedQuery = searchQuery.toLowerCase();
        const files = appState.generatedFiles
            .filter(file => file.filename.toLowerCase().includes(lowercasedQuery))
            .map(item => ({ type: 'file' as const, item }));

        const crew = settings.crewConfig
            .filter(member => member.name.toLowerCase().includes(lowercasedQuery) || member.specialty.toLowerCase().includes(lowercasedQuery))
            .map(item => ({ type: 'crew' as const, item }));

        return [...files, ...crew];
    }, [searchQuery, appState.generatedFiles, settings.crewConfig]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
                setIsSearchFocused(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

     useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsCommandPaletteOpen(prev => !prev);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const handleAppSelect = (appName: ApplicationName) => {
        setAppState(prev => ({ ...prev, activeApp: appName }));
    };

    const handleSearchResultClick = (result: SearchResult) => {
        if (result.type === 'file') {
            setAppState(prev => ({ ...prev, activeApp: 'ide' }));
            setActiveFile(result.item as GeneratedFile);
        } else if (result.type === 'crew') {
            setAppState(prev => ({ ...prev, activeApp: 'comms' }));
            setActiveCommsChannel((result.item as CrewMember).name);
        }
        setSearchQuery('');
        setIsSearchFocused(false);
    };
    
    if (!currentUser) {
        return <LoginScreen />;
    }

    const renderActiveApp = (app: ApplicationName) => {
        switch (app) {
            case 'ide': return <IDEView onFileContentChange={updateFileContent} />;
            case 'browser': return <SimulatedBrowser />;
            case 'api_keys': return <APIKeyManager />;
            case 'comms': return <CommsView />;
            case 'email': return <EmailClientView />;
            case 'timeline': return <TimelineView />;
            case 'intel': return <IntelView />;
            case 'roster': return <RosterView />;
            case 'settings': return <SettingsView />;
            case 'dashboard':
            default: return <DashboardView />;
        }
    };
    
    const activeAppTitle = appState.activeApp.charAt(0).toUpperCase() + appState.activeApp.slice(1);
    const AvatarComponent = AVATARS[settings.astraAvatar]?.component || AVATARS['Astra'].component;

    return (
        <div className={`theme-${settings.theme} bg-transparent text-white min-h-screen font-sans flex`}>
            <Sidebar 
                activeApp={appState.activeApp} 
                onAppSelect={handleAppSelect} 
                onProfileClick={() => setIsProfileModalOpen(true)}
                onLogout={logout}
            />

            <main className="flex-1 flex flex-col h-screen">
                <header className="flex-shrink-0 flex items-center justify-between gap-6 p-4 border-b border-white/10 bg-black/10">
                    <h1 className="text-xl font-orbitron text-[rgb(var(--color-text-header))]">
                        AI Crew Commander / <span className="text-white capitalize">{appState.activeApp}</span>
                    </h1>
                     <div ref={searchContainerRef} className="flex-1 max-w-lg" onFocus={() => setIsSearchFocused(true)}>
                        <GlobalSearchBar
                            searchQuery={searchQuery}
                            onSearchQueryChange={setSearchQuery}
                            results={searchResults}
                            onResultClick={handleSearchResultClick}
                            isFocused={isSearchFocused}
                            onClear={() => {
                                setSearchQuery('');
                                setIsSearchFocused(false);
                            }}
                        />
                    </div>
                     <button onClick={() => setIsCommandPaletteOpen(true)} className="text-xs text-gray-400 border border-gray-600 rounded px-2 py-1 hover:bg-gray-700">
                        Cmd+K
                    </button>
                </header>
                
                <div className="flex-grow min-h-0 p-4 lg:p-6 overflow-y-auto scrollbar-thin">
                   {renderActiveApp(appState.activeApp)}
                </div>
            </main>
            
            <AstraAssistantWidget avatar={AvatarComponent} />
            
            {appState.deploymentStatus !== 'idle' && <DeploymentPipeline />}
            {isProfileModalOpen && <UserProfileModal onClose={() => setIsProfileModalOpen(false)} />}
            {isCommandPaletteOpen && <CommandPalette onClose={() => setIsCommandPaletteOpen(false)} />}
        </div>
    );
}