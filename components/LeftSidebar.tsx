import React from 'react';
import { Agent } from '../types';
import { ConversationIcon, AgentIcon, NewChatIcon, DeleteIcon, LogIcon } from './icons';

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
    <div className="h-full flex flex-col gap-4 text-sm">
      {/* Conversations Panel */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <h2 className="font-bold text-[rgb(var(--color-accent))] flex items-center gap-2 font-orbitron">
            <ConversationIcon />
            Conversations
          </h2>
          <button onClick={onNewChat} className="p-1.5 rounded-md hover:bg-white/10 transition-colors text-[rgb(var(--color-text-muted))]" aria-label="Start new chat">
            <NewChatIcon />
          </button>
        </div>
        <ul className="space-y-1.5">
          {conversations.map(c => (
             <li key={c.id} 
                onClick={() => onSwitchChat(c.id)}
                className={`group p-2 rounded-md cursor-pointer transition-colors text-[rgb(var(--color-text-muted))] flex justify-between items-center
                    ${c.id === activeId ? 'bg-white/10 text-[rgb(var(--color-text))]' : 'hover:bg-white/5'}
                `}
            >
               <span className="truncate pr-2">{c.title}</span>
               {conversations.length > 1 &&
                 <button 
                    onClick={(e) => { e.stopPropagation(); onDeleteChat(c.id); }}
                    className="p-1 rounded-md text-[rgb(var(--color-text-muted))] opacity-0 group-hover:opacity-100 hover:bg-red-500/20 hover:text-red-400 transition-opacity"
                    aria-label={`Delete conversation: ${c.title}`}>
                    <DeleteIcon />
                 </button>
               }
             </li>
          ))}
        </ul>
      </div>

      {/* Agents Panel */}
      <div className="flex flex-col min-h-0">
        <h2 className="font-bold text-[rgb(var(--color-accent))] mb-2 flex items-center gap-2 font-orbitron">
           <AgentIcon />
           AI Crew Roster
        </h2>
        <ul className="space-y-3 overflow-y-auto scrollbar-thin pr-1">
          {agents.map(agent => (
            <li key={agent.name} className="p-2 bg-black/20 rounded-md border border-white/5">
              <p className="font-medium text-[rgb(var(--color-text))] text-xs">{agent.name}</p>
              <p className="text-[10px] text-[rgb(var(--color-text-muted))] mt-0.5 truncate" title={agent.description}>
                {agent.description}
              </p>
              <p className="text-[10px] text-[rgb(var(--color-text-muted))] mt-0.5">Specialty: {agent.primarySpecialty}</p>
              <select 
                defaultValue={agent.currentEngine} 
                onChange={(e) => onEngineChange(agent.name, e.target.value)}
                className="w-full mt-1.5 p-1 rounded-md bg-white/5 border border-white/10 text-[rgb(var(--color-text))] text-[10px] focus:outline-none focus:ring-1 focus:ring-[rgb(var(--color-primary))]"
              >
                {(agent.engineOptions || []).map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </li>
          ))}
        </ul>
      </div>

      {/* Logs Panel */}
      <div className="mt-auto flex-shrink-0">
        <h2 className="font-bold text-[rgb(var(--color-accent))] mb-2 flex items-center gap-2 font-orbitron">
          <LogIcon />
          System Logs
        </h2>
        <div className="bg-black/20 p-2 rounded-md h-32 overflow-y-auto scrollbar-thin text-xs font-mono">
            {logs.map((log, i) => <p key={i} className="text-[rgb(var(--color-text-muted))] text-[10px] leading-relaxed">{log}</p>)}
            {logs.length === 0 && <p className="text-[rgb(var(--color-text-muted))]">Awaiting commands...</p>}
        </div>
      </div>
    </div>
  );
};