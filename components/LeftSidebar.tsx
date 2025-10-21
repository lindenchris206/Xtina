
import React, { useState, useEffect } from 'react';
import { Agent } from '../types';
import { getAgents, setAgentEnabled } from '../services/mockApiService';
import { ConversationIcon, AgentIcon } from './icons';

export const LeftSidebar: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>([]);

  useEffect(() => {
    const fetchAgents = async () => {
      const data = await getAgents();
      setAgents(data);
    };
    fetchAgents();
  }, []);

  const handleToggleAgent = async (id: string, enabled: boolean) => {
    const updatedAgent = await setAgentEnabled(id, enabled);
    setAgents(prev => prev.map(a => a.id === id ? updatedAgent : a));
  };
  
  const conversations = [
    {id: '1', title: 'Getting Started with Gemini'},
    {id: '2', title: 'React Project Ideas'},
    {id: '3', title: 'Tailwind CSS Tips'},
  ];

  return (
    <div className="h-full flex flex-col gap-6 text-sm">
      <div>
        <h2 className="font-bold text-brand-text mb-3 flex items-center gap-2">
          <ConversationIcon />
          Conversations
        </h2>
        <ul className="space-y-2">
          {conversations.map(c => (
             <li key={c.id} className="p-2 rounded-md hover:bg-white/5 cursor-pointer transition-colors text-brand-muted">
               {c.title}
             </li>
          ))}
        </ul>
      </div>
      <div>
        <h2 className="font-bold text-brand-text mb-3 flex items-center gap-2">
           <AgentIcon />
           Agents
        </h2>
        <ul className="space-y-3">
          {agents.map(agent => (
            <li key={agent.id}>
              <div className="flex justify-between items-center">
                <span className="font-medium text-brand-text">{agent.name}</span>
                <label className="inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={agent.enabled} onChange={(e) => handleToggleAgent(agent.id, e.target.checked)} className="sr-only peer" />
                  <div className="relative w-11 h-6 bg-gray-600 rounded-full peer peer-focus:ring-2 peer-focus:ring-brand-accent peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-accent"></div>
                </label>
              </div>
              <p className="text-xs text-brand-muted mt-1">{agent.description}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
