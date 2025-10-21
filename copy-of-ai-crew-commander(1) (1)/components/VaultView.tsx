/**
 * @author cel
 * @file components/VaultView.tsx
 * @description A view to manage saved credentials.
 */
import React, { useState } from 'react';
import { useMission } from '../context/MissionContext';
import { LockClosedIcon, TrashIcon, CopyIcon, CheckIcon } from './icons';
import type { Credential } from '../types';

const VaultView: React.FC = () => {
    const { appState, setAppState } = useMission();
    const { credentials } = appState.userProfile;
    const [copyStatus, setCopyStatus] = useState<Record<string, 'user' | 'pass' | null>>({});

    const handleDelete = (id: string) => {
        if (window.confirm('Are you sure you want to delete this credential?')) {
            setAppState({ type: 'DELETE_CREDENTIAL', payload: id });
        }
    };

    const handleCopy = (id: string, type: 'user' | 'pass') => {
        const credential = credentials.find(c => c.id === id);
        if (!credential) return;

        const value = type === 'user' ? credential.username : credential.password;
        if (value) {
            navigator.clipboard.writeText(value);
            setCopyStatus({ [id]: type });
            setTimeout(() => setCopyStatus(s => ({ ...s, [id]: null })), 2000);
        }
    };

    return (
        <div className="p-4 glassmorphism rounded-xl h-full flex flex-col">
            <div className="flex-shrink-0 flex justify-between items-center mb-4">
                <h3 className="text-2xl font-orbitron text-indigo-300 flex items-center gap-3">
                    <span className="w-7 h-7"><LockClosedIcon /></span>Credential Vault
                </h3>
            </div>
            <p className="text-xs text-gray-400 mb-4 flex-shrink-0">
                Credentials saved by Serpens during browser automation tasks are stored here.
            </p>

            <div className="flex-grow overflow-y-auto scrollbar-thin pr-2">
                {credentials.length === 0 ? (
                    <div className="text-center text-gray-400 py-8">The vault is empty. Serpens will add credentials here after successful account creation tasks.</div>
                ) : (
                    <div className="space-y-3">
                        {credentials.map(cred => (
                            <div key={cred.id} className="bg-gray-900/50 p-3 rounded-lg flex justify-between items-center glow-on-hover">
                                <div>
                                    <p className="font-bold text-cyan-300">{cred.url.replace(/_/g, '-')}.sim.dev</p>
                                    <p className="text-sm text-gray-300 font-mono mt-1">
                                        Username: {cred.username}
                                    </p>
                                    <p className="text-sm text-gray-300 font-mono mt-1">
                                        Password: {cred.password ? '•'.repeat(cred.password.length) : 'N/A'}
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                     <button onClick={() => handleCopy(cred.id, 'user')} title="Copy Username" className="p-2 text-xs bg-gray-600 hover:bg-gray-500 rounded-md">
                                        {copyStatus[cred.id] === 'user' ? <CheckIcon /> : <CopyIcon />}
                                     </button>
                                     {cred.password &&
                                     <button onClick={() => handleCopy(cred.id, 'pass')} title="Copy Password" className="p-2 text-xs bg-gray-600 hover:bg-gray-500 rounded-md">
                                        {copyStatus[cred.id] === 'pass' ? <CheckIcon /> : <CopyIcon />}
                                     </button>
                                     }
                                    <button onClick={() => handleDelete(cred.id)} title="Delete Credential" className="p-2 text-red-400 hover:bg-red-800/50 rounded-md"><TrashIcon /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default VaultView;
