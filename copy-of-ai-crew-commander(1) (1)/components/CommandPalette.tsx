import React, { useState, useEffect, useMemo } from 'react';
import { useMission } from '../context/MissionContext';
import { SearchIcon, CodeIcon, DashboardIcon, SettingsIcon, RosterIcon, CommsIcon, InboxIcon, BrowserIcon, UploadCloudIcon, PaletteIcon, XIcon } from './icons';
import type { ApplicationName } from '../types';

interface Command {
    id: string;
    title: string;
    category: string;
    icon: React.ReactNode;
    action: () => void;
}

export const CommandPalette: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { setAppState, setSettings, settings, addSpecialCommand } = useMission();
    const [search, setSearch] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);

    const commands: Command[] = useMemo(() => [
        // FIX: The setAppState from context is a dispatch function and expects an action object, not a function.
        { id: 'nav-dashboard', title: 'Go to Dashboard', category: 'Navigation', icon: <DashboardIcon />, action: () => setAppState({ type: 'SET_ACTIVE_APP', payload: 'dashboard' }) },
        { id: 'nav-ide', title: 'Go to IDE', category: 'Navigation', icon: <CodeIcon />, action: () => setAppState({ type: 'SET_ACTIVE_APP', payload: 'ide' }) },
        { id: 'nav-comms', title: 'Go to Crew Comms', category: 'Navigation', icon: <CommsIcon />, action: () => setAppState({ type: 'SET_ACTIVE_APP', payload: 'comms' }) },
        { id: 'nav-roster', title: 'Go to Crew Roster', category: 'Navigation', icon: <RosterIcon />, action: () => setAppState({ type: 'SET_ACTIVE_APP', payload: 'roster' }) },
        { id: 'nav-email', title: 'Go to Email Client', category: 'Navigation', icon: <InboxIcon />, action: () => setAppState({ type: 'SET_ACTIVE_APP', payload: 'email' }) },
        { id: 'nav-browser', title: 'Go to Browser', category: 'Navigation', icon: <BrowserIcon />, action: () => setAppState({ type: 'SET_ACTIVE_APP', payload: 'browser' }) },
        { id: 'nav-settings', title: 'Go to Settings', category: 'Navigation', icon: <SettingsIcon />, action: () => setAppState({ type: 'SET_ACTIVE_APP', payload: 'settings' }) },
        { id: 'action-deploy', title: 'Deploy Project', category: 'Actions', icon: <UploadCloudIcon />, action: () => addSpecialCommand({ type: 'DEPLOY_PROJECT', issuedBy: 'user' }) },
        { id: 'theme-astra', title: 'Switch to Astra Theme', category: 'Theme', icon: <PaletteIcon />, action: () => setSettings(s => ({ ...s, theme: 'astra' })) },
        { id: 'theme-nebula', title: 'Switch to Nebula Theme', category: 'Theme', icon: <PaletteIcon />, action: () => setSettings(s => ({ ...s, theme: 'nebula' })) },
        { id: 'theme-starship', title: 'Switch to Starship Theme', category: 'Theme', icon: <PaletteIcon />, action: () => setSettings(s => ({ ...s, theme: 'starship' })) },
    ], [setAppState, setSettings, addSpecialCommand]);

    const filteredCommands = useMemo(() => {
        if (!search) return commands;
        return commands.filter(cmd => cmd.title.toLowerCase().includes(search.toLowerCase()) || cmd.category.toLowerCase().includes(search.toLowerCase()));
    }, [search, commands]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length);
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex(prev => (prev + 1) % filteredCommands.length);
            } else if (e.key === 'Enter') {
                e.preventDefault();
                const command = filteredCommands[selectedIndex];
                if (command) {
                    command.action();
                    onClose();
                }
            } else if (e.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [filteredCommands, selectedIndex, onClose]);
    
    useEffect(() => {
        setSelectedIndex(0);
    }, [search]);

    return (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-start justify-center pt-20 p-4">
            <div className="w-full max-w-2xl bg-gray-900 rounded-xl border border-purple-500/50 flex flex-col glassmorphism shadow-2xl shadow-purple-500/20"
                 role="dialog" aria-modal="true">
                <div className="flex items-center gap-3 p-3 border-b border-white/10">
                    <span className="w-5 h-5 text-gray-400"><SearchIcon /></span>
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Type a command or search..."
                        className="w-full bg-transparent text-lg focus:outline-none"
                        autoFocus
                    />
                     <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10"><XIcon /></button>
                </div>
                <div className="p-2 max-h-96 overflow-y-auto scrollbar-thin">
                    {filteredCommands.length > 0 ? (
                        <ul>
                            {filteredCommands.map((cmd, index) => (
                                <li key={cmd.id}>
                                    <button 
                                        onClick={() => { cmd.action(); onClose(); }}
                                        className={`w-full text-left flex items-center justify-between p-3 rounded-md transition-colors ${selectedIndex === index ? 'bg-indigo-500/50' : 'hover:bg-indigo-500/20'}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="w-5 h-5 text-cyan-400">{cmd.icon}</span>
                                            <span>{cmd.title}</span>
                                        </div>
                                        <span className="text-xs text-gray-400">{cmd.category}</span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-center text-gray-400 p-4">No commands found.</p>
                    )}
                </div>
            </div>
        </div>
    );
};
