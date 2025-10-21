
import React, { useState } from 'react';
import { useMission } from '../context/MissionContext';
import type { APIKey } from '../types';
import { KeyIcon, TrashIcon, XIcon, SaveIcon } from './icons';

interface APIKeyModalProps {
    apiKey?: APIKey;
    onSave: (apiKey: APIKey) => void;
    onClose: () => void;
}

const APIKeyModal: React.FC<APIKeyModalProps> = ({ apiKey, onSave, onClose }) => {
    const [service, setService] = useState(apiKey?.service || '');
    const [key, setKey] = useState(apiKey?.key || '');

    const handleSave = () => {
        if (service && key) {
            onSave({ id: apiKey?.id || `key_${Date.now()}`, service, key });
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-gray-800 rounded-xl border border-white/20 glassmorphism">
                <div className="flex justify-between items-center p-4 border-b border-white/10">
                    <h3 className="text-lg font-orbitron text-indigo-300">{apiKey ? 'Edit' : 'Add'} API Key</h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10"><XIcon /></button>
                </div>
                <div className="p-4 space-y-4">
                     <div>
                        <label htmlFor="service" className="block text-sm font-medium text-gray-300 mb-1">Service Name</label>
                        <input type="text" id="service" value={service} onChange={e => setService(e.target.value)} placeholder="e.g., GitHub, OpenAI" className="w-full bg-gray-900/50 border border-white/20 rounded-md px-3 py-2 text-sm" />
                    </div>
                     <div>
                        <label htmlFor="key" className="block text-sm font-medium text-gray-300 mb-1">API Key</label>
                        <input type="password" id="key" value={key} onChange={e => setKey(e.target.value)} placeholder="Paste your API key here" className="w-full bg-gray-900/50 border border-white/20 rounded-md px-3 py-2 text-sm" />
                    </div>
                </div>
                 <div className="p-3 flex justify-end gap-3 bg-black/20 rounded-b-xl">
                    <button onClick={onClose} className="px-4 py-2 text-sm bg-gray-600 hover:bg-gray-500 rounded-md">Cancel</button>
                    <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 text-sm bg-cyan-600 hover:bg-cyan-500 rounded-md">
                        <SaveIcon /> Save Key
                    </button>
                </div>
            </div>
        </div>
    );
};


export const APIKeyManager: React.FC = () => {
    const { appState, updateUserProfile } = useMission();
    const { apiKeys } = appState.userProfile;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingKey, setEditingKey] = useState<APIKey | undefined>(undefined);

    const handleSaveKey = (keyToSave: APIKey) => {
        const existingIndex = apiKeys.findIndex(k => k.id === keyToSave.id);
        let newKeys = [...apiKeys];
        if (existingIndex > -1) {
            newKeys[existingIndex] = keyToSave;
        } else {
            newKeys.push(keyToSave);
        }
        updateUserProfile({ apiKeys: newKeys });
        setIsModalOpen(false);
        setEditingKey(undefined);
    };

    const handleDeleteKey = (keyId: string) => {
        if (window.confirm('Are you sure you want to delete this API key?')) {
            updateUserProfile({ apiKeys: apiKeys.filter(k => k.id !== keyId) });
        }
    };

    const handleAddNew = () => {
        setEditingKey(undefined);
        setIsModalOpen(true);
    };
    
    const handleEdit = (key: APIKey) => {
        setEditingKey(key);
        setIsModalOpen(true);
    };

    return (
        <div className="p-4 glassmorphism rounded-xl h-full flex flex-col">
            <div className="flex-shrink-0 flex justify-between items-center mb-4">
                <h3 className="text-2xl font-orbitron text-indigo-300 flex items-center gap-3"><span className="w-7 h-7"><KeyIcon /></span>API Key Manager</h3>
                <button onClick={handleAddNew} className="px-4 py-2 text-sm bg-cyan-600 hover:bg-cyan-500 rounded-md font-semibold">
                    Add New Key
                </button>
            </div>
            <div className="flex-grow overflow-y-auto scrollbar-thin pr-2">
                {apiKeys.length === 0 ? (
                    <div className="text-center text-gray-400 py-8">No API keys stored.</div>
                ) : (
                    <div className="space-y-3">
                        {apiKeys.map(key => (
                            <div key={key.id} className="bg-gray-900/50 p-3 rounded-lg flex justify-between items-center">
                                <div>
                                    <p className="font-bold text-gray-200">{key.service}</p>
                                    <p className="text-xs text-gray-400 font-mono">****...{key.key.slice(-4)}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => handleEdit(key)} className="px-3 py-1.5 text-xs bg-indigo-600 hover:bg-indigo-500 rounded-md">Edit</button>
                                    <button onClick={() => handleDeleteKey(key.id)} className="p-2 text-red-400 hover:bg-red-800/50 rounded-md"><TrashIcon /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            {isModalOpen && <APIKeyModal apiKey={editingKey} onSave={handleSaveKey} onClose={() => setIsModalOpen(false)} />}
        </div>
    );
};
