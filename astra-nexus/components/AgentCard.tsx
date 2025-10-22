import React from 'react';
import { Agent } from '../types';
import Avatar from './Avatar';

interface AgentCardProps {
  agent: Agent;
  onClick?: () => void;
  isSelected?: boolean;
}

const AgentCard: React.FC<AgentCardProps> = ({ agent, onClick, isSelected = false }) => {
  const selectedClass = isSelected ? 'ring-2 ring-fuchsia-500 neon-glow shadow-fuchsia-500/50' : 'ring-1 ring-cyan-500/30';

  return (
    <div
      onClick={onClick}
      className={`w-full glass-panel p-3 rounded-lg ${selectedClass} transition-all duration-300 hover:bg-cyan-500/10 cursor-pointer`}
    >
      <div className="flex items-center space-x-3">
        <Avatar src={agent.avatar} size="md" alt={agent.name} />
        <div>
          <h4 className="font-orbitron text-sm font-bold text-cyan-300">{agent.name}</h4>
          <p className="text-xs text-slate-400">{agent.role}</p>
        </div>
      </div>
    </div>
  );
};

export default AgentCard;