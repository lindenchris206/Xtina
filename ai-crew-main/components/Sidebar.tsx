import React from 'react';
import type { ApplicationName } from '../types';
import { BrowserIcon, CodeIcon, DashboardIcon, UserCircleIcon, KeyIcon, TimelineIcon, CommsIcon, IntelIcon, SettingsIcon, LogoutIcon, RosterIcon, InboxIcon } from './icons';

interface SidebarProps {
    activeApp: ApplicationName;
    onAppSelect: (app: ApplicationName) => void;
    onProfileClick: () => void;
    onLogout: () => void;
}

const apps: { name: ApplicationName, icon: React.ReactNode, label: string }[] = [
    { name: 'dashboard', icon: <DashboardIcon />, label: 'Dashboard' },
    { name: 'ide', icon: <CodeIcon />, label: 'IDE' },
    { name: 'browser', icon: <BrowserIcon />, label: 'Browser' },
    { name: 'timeline', icon: <TimelineIcon />, label: 'Timeline' },
    { name: 'roster', icon: <RosterIcon />, label: 'Crew Roster' },
    { name: 'comms', icon: <CommsIcon />, label: 'Crew Chat' },
    { name: 'email', icon: <InboxIcon />, label: 'Email' },
    { name: 'intel', icon: <IntelIcon />, label: 'Intel DB' },
    { name: 'settings', icon: <SettingsIcon />, label: 'Settings' },
    { name: 'api_keys', icon: <KeyIcon />, label: 'API Keys' },
];

export const Sidebar: React.FC<SidebarProps> = ({ activeApp, onAppSelect, onProfileClick, onLogout }) => {
    return (
        <nav className="flex flex-col items-center gap-2 p-3 bg-black/30 border-r border-white/10">
            <div className="font-orbitron text-2xl font-bold text-[rgb(var(--color-primary-accent))] mb-4">
                A
            </div>
            
            <div className="flex flex-col gap-2 flex-grow">
                {apps.map(app => (
                    <button
                        key={app.name}
                        onClick={() => onAppSelect(app.name)}
                        className={`w-14 h-14 flex items-center justify-center rounded-xl transition-all duration-300 relative group ${activeApp === app.name ? 'bg-[rgba(var(--color-primary-accent),0.8)] scale-110 shadow-lg' : 'bg-gray-800/50 hover:bg-[rgba(var(--color-secondary-accent),0.5)]'}`}
                        title={app.label}
                    >
                        <span className="w-7 h-7">{app.icon}</span>
                        <span className="absolute left-full ml-4 bg-gray-900 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                            {app.label}
                        </span>
                    </button>
                ))}
            </div>

            <div className="flex flex-col gap-2">
                <button
                    onClick={onProfileClick}
                    className="w-14 h-14 flex items-center justify-center rounded-xl bg-gray-800/50 hover:bg-[rgba(var(--color-secondary-accent),0.5)] transition-colors group relative"
                    title="User Profile"
                >
                    <span className="w-7 h-7"><UserCircleIcon/></span>
                    <span className="absolute left-full ml-4 bg-gray-900 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">Profile</span>
                </button>
                <button
                    onClick={onLogout}
                    className="w-14 h-14 flex items-center justify-center rounded-xl bg-gray-800/50 hover:bg-red-500/50 transition-colors group relative"
                    title="Logout"
                >
                    <span className="w-7 h-7"><LogoutIcon/></span>
                    <span className="absolute left-full ml-4 bg-gray-900 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">Logout</span>
                </button>
            </div>
        </nav>
    );
};