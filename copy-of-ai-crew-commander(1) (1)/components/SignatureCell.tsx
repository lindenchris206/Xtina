import React, { useState, useEffect } from 'react';
import { useMission } from '../context/MissionContext';
import { SaveIcon } from './icons';

export const SignatureCell: React.FC = () => {
    const { appState, updateAuthorSignature } = useMission();
    const [signature, setSignature] = useState(appState.authorSignature);
    const [isDirty, setIsDirty] = useState(false);

    useEffect(() => {
        setSignature(appState.authorSignature);
        setIsDirty(false);
    }, [appState.authorSignature]);

    const handleSave = () => {
        updateAuthorSignature(signature);
        setIsDirty(false);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSignature(e.target.value);
        setIsDirty(true);
    };
    
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSave();
            e.currentTarget.blur();
        }
    };

    return (
        <div className="p-4 glassmorphism rounded-xl h-full flex flex-col justify-between">
            <div>
                <h3 className="text-xl font-orbitron text-[rgb(var(--color-text-header))] mb-2">Author's Signature</h3>
                <p className="text-xs text-gray-400 mb-4">Leave your mark on this session, Commander. This signature will be saved.</p>
            </div>
            <div className="relative">
                 <div className="flex items-center bg-gray-900/50 border border-white/10 rounded-md p-2">
                     <span className="text-[rgb(var(--color-primary-accent))] font-mono text-sm">sign@astra:~$</span>
                     <input
                        type="text"
                        value={signature}
                        onChange={handleChange}
                        onKeyDown={handleKeyDown}
                        onBlur={handleSave}
                        placeholder="Enter your signature..."
                        className="flex-grow bg-transparent focus:outline-none ml-2 text-sm text-gray-200 font-mono"
                        maxLength={50}
                    />
                     <div className="terminal-cursor" />
                 </div>
                 {isDirty && <span className="absolute -top-2 -right-2 text-xs text-yellow-300 bg-yellow-800/80 px-2 py-0.5 rounded-full animate-pulse">Unsaved</span>}
            </div>
        </div>
    );
};