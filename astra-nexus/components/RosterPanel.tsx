
import React from 'react';
import { Agent } from '../types';
import AgentCard from './AgentCard';
import { UserCircleIcon } from './IconComponents';

interface RosterPanelProps {
  agents: Agent[];
  selectedAgentId: string | null;
  onSelectAgent: (agent: Agent) => void;
}

const RosterPanel: React.FC<RosterPanelProps> = ({ agents, selectedAgentId, onSelectAgent }) => {
  return (
    <div className="glass-panel rounded-xl p-4 flex flex-col h-full">
      <h3 className="font-orbitron text-md font-bold text-cyan-300 flex items-center space-x-2 border-b border-cyan-500/20 pb-2 mb-3">
        <UserCircleIcon className="w-5 h-5" />
        <span>Agent Roster</span>
      </h3>
      <div className="overflow-y-auto pr-2 space-y-2 flex-grow">
        {agents.map(agent => (
          <AgentCard
            key={agent.id}
            agent={agent}
            onClick={() => onSelectAgent(agent)}
            isSelected={selectedAgentId === agent.id}
          />
        ))}
      </div>
    </div>
  );
};

export default RosterPanel;
