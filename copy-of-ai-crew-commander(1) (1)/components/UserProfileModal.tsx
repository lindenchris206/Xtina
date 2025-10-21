import React, { useState } from 'react';
import { useMission } from '../context/MissionContext';
import { XIcon, SaveIcon } from './icons';
import type { UserProfile } from '../types';

interface UserProfileModalProps {
    onClose: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ onClose }) => {
    const { appState, updateUserProfile } = useMission();
    const [profile, setProfile] = useState<UserProfile>(appState.userProfile);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setProfile(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = () => {
        updateUserProfile(profile);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-gray-800 rounded-xl border border-white/20 glassmorphism">
                <div className="flex justify-between items-center p-4 border-b border-white/10">
                    <h3 className="text-lg font-orbitron text-indigo-300">User Profile</h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10"><XIcon /></button>
                </div>
                <div className="p-4 space-y-4">
                    <div>
                        <label htmlFor="fullName" className="block text-sm font-medium text-gray-300 mb-1">Full Name</label>
                        <input type="text" id="fullName" name="fullName" value={profile.fullName} onChange={handleChange} className="w-full bg-gray-900/50 border border-white/20 rounded-md px-3 py-2 text-sm" />
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                        <input type="email" id="email" name="email" value={profile.email} onChange={handleChange} className="w-full bg-gray-900/50 border border-white/20 rounded-md px-3 py-2 text-sm" />
                    </div>
                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-1">General Username</label>
                        <input type="text" id="username" name="username" value={profile.username} onChange={handleChange} className="w-full bg-gray-900/50 border border-white/20 rounded-md px-3 py-2 text-sm" />
                    </div>
                     <div>
                        <label htmlFor="githubUsername" className="block text-sm font-medium text-gray-300 mb-1">GitHub Username</label>
                        <input type="text" id="githubUsername" name="githubUsername" value={profile.githubUsername} onChange={handleChange} className="w-full bg-gray-900/50 border border-white/20 rounded-md px-3 py-2 text-sm" />
                    </div>
                </div>
                <div className="p-3 flex justify-end gap-3 bg-black/20 rounded-b-xl">
                    <button onClick={onClose} className="px-4 py-2 text-sm bg-gray-600 hover:bg-gray-500 rounded-md">Cancel</button>
                    <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 text-sm bg-cyan-600 hover:bg-cyan-500 rounded-md">
                        <SaveIcon /> Save Profile
                    </button>
                </div>
            </div>
        </div>
    );
};
