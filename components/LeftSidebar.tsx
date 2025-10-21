
import React from 'react';
import { Agent } from '../types';
import { ConversationIcon, AgentIcon, NewChatIcon, DeleteIcon } from './icons';

interface LeftSidebarProps {
    conversations: { id: string, title: string }[];
    activeId: string | null;
    onNewChat: () => void;
    onSwitchChat: (id: string) => void;
    onDeleteChat: (id: string) => void;
    agents: Agent[];
    logs: string[];
    onEngineChange: (agentName: string, newEngine: string) => void;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({
    conversations,
    activeId,
    onNewChat,
    onSwitchChat,
    onDeleteChat,
    agents,
    logs,
    onEngineChange
}) => {
  return (
    <div className="h-full flex flex-col gap-6 text-sm">
      <div>
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-bold text-brand-text flex items-center gap-2">
            <ConversationIcon />
            Conversations
          </h2>
          <button onClick={onNewChat} className="p-1.5 rounded-md hover:bg-white/10 transition-colors text-brand-muted" aria-label="Start new chat">
            <NewChatIcon />
          </button>
        </div>
        <ul className="space-y-2">
          {conversations.map(c => (
             <li key={c.id} 
                onClick={() => onSwitchChat(c.id)}
                className={`group p-2 rounded-md cursor-pointer transition-colors text-brand-muted flex justify-between items-center
                    ${c.id === activeId ? 'bg-white/10 text-brand-text' : 'hover:bg-white/5'}
                `}
            >
               <span className="truncate pr-2">{c.title}</span>
               {conversations.length > 1 &&
                 <button 
                    onClick={(e) => { e.stopPropagation(); onDeleteChat(c.id); }}
                    className="p-1 rounded-md text-brand-muted/50 opacity-0 group-hover:opacity-100 hover:bg-red-500/20 hover:text-red-400 transition-opacity"
                    aria-label={`Delete conversation: ${c.title}`}>
                    <DeleteIcon />
                 </button>
               }
             </li>
          ))}
        </ul>
      </div>
      <div>
        <h2 className="font-bold text-brand-text mb-3 flex items-center gap-2">
           <AgentIcon />
           Agents
        </h2>
        <ul className="space-y-4">
          {agents.map(agent => (
            <li key={agent.name}>
              <p className="font-medium text-brand-text">{agent.name}</p>
              <p className="text-xs text-brand-muted mt-1">Specialty: {agent.primarySpecialty}</p>
              <select 
                value={agent.currentEngine} 
                onChange={(e) => onEngineChange(agent.name, e.target.value)}
                className="w-full mt-2 p-1.5 rounded-md bg-white/5 border border-white/10 text-brand-text text-xs focus:outline-none focus:ring-1 focus:ring-brand-accent"
              >
                {(agent.engineOptions || []).map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h2 className="font-bold text-brand-text mb-3">Logs</h2>
        <div className="bg-black/20 p-2 rounded-md h-40 overflow-y-auto text-xs font-mono">
            {logs.map((log, i) => <p key={i} className="text-brand-muted/80">{log}</p>)}
            {logs.length === 0 && <p className="text-brand-muted/50">No logs yet...</p>}
        </div>
      </div>
    </div>
  );
};
