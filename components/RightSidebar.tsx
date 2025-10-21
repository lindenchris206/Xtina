import React, { useState } from 'react';
import { Agent } from '../types';
import { FileIcon, AgentIcon } from './icons';

interface RightSidebarProps {
  agents: Agent[];
  tasks: any[]; // Kept for future use, but focus is now file management
  onAgentsUpdate: (agents: Agent[]) => void;
}

const FileManager: React.FC<{ agents: Agent[], onAgentsUpdate: (agents: Agent[]) => void }> = ({ agents, onAgentsUpdate }) => {
    const [file, setFile] = useState<File | null>(null);
    const [selectedAgent, setSelectedAgent] = useState<string>(agents[0]?.name || '');
    const [status, setStatus] = useState('');

    const handleUpload = async () => {
        if (!file || !selectedAgent) return;
        setStatus('Uploading & processing...');
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch(`/api/agents/${selectedAgent}/knowledge`, {
                method: 'POST',
                body: formData
            });
            const updatedAgent = await res.json();
            if (res.ok) {
                setStatus(`Knowledge '${file.name}' added to ${selectedAgent}.`);
                // Update the parent state
                const updatedAgents = agents.map(a => a.name === selectedAgent ? updatedAgent : a);
                onAgentsUpdate(updatedAgents);
                setFile(null);
            } else {
                throw new Error(updatedAgent.error || 'Upload failed');
            }
        } catch (err: any) {
            setStatus(`Error: ${err.message}`);
        }
    };

    return (
        <div className="text-sm">
            <h2 className="font-bold text-[rgb(var(--color-accent))] mb-3 flex items-center gap-2 font-orbitron">
                <FileIcon />
                Knowledge Base
            </h2>
            <div className="bg-black/20 p-3 rounded-lg border border-white/5 space-y-3">
                <p className="text-xs text-[rgb(var(--color-text-muted))]">Upload a file to an agent's knowledge base.</p>
                <input 
                    type="file" 
                    onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                    className="text-xs text-[rgb(var(--color-text-muted))] w-full file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-[rgb(var(--color-secondary))] file:text-white hover:file:bg-opacity-80"
                />
                <select 
                    value={selectedAgent}
                    onChange={(e) => setSelectedAgent(e.target.value)}
                    className="w-full p-1.5 rounded-md bg-white/5 border border-white/10 text-[rgb(var(--color-text))] text-xs focus:outline-none focus:ring-1 focus:ring-[rgb(var(--color-primary))]"
                >
                    {agents.map(a => <option key={a.name} value={a.name}>{a.name}</option>)}
                </select>
                <button 
                    onClick={handleUpload} 
                    disabled={!file || !selectedAgent}
                    className="w-full bg-[rgb(var(--color-primary))] text-black py-2 rounded-lg font-bold text-sm hover:bg-opacity-90 transition-colors disabled:bg-gray-500/50 disabled:cursor-not-allowed"
                >
                    Upload Knowledge
                </button>
                {status && <p className="text-xs text-center text-[rgb(var(--color-text-muted))] mt-2">{status}</p>}
            </div>

            <div className="mt-4">
                {agents.filter(a => a.knowledgeBundles.length > 0).map(agent => (
                    <div key={agent.name} className="mb-3">
                        <h3 className="font-semibold text-xs text-[rgb(var(--color-text))] flex items-center gap-1.5">
                            <AgentIcon/> {agent.name}
                        </h3>
                        <ul className="mt-1 space-y-1">
                            {agent.knowledgeBundles.map(kb => (
                                <li key={kb.name} className="text-xs text-[rgb(var(--color-text-muted))] bg-black/20 px-2 py-1 rounded-md truncate">
                                    {kb.name}
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </div>
    );
};


export const RightSidebar: React.FC<RightSidebarProps> = ({ agents, tasks, onAgentsUpdate }) => {
  return (
    <div className="space-y-6">
      <FileManager agents={agents} onAgentsUpdate={onAgentsUpdate} />
      {/* Task panel could be added back here if needed */}
    </div>
  );
};