
import React from 'react';
import { Agent, AgentStatus } from '../types';

interface AgentCardProps {
  agent: Agent;
}

const statusStyles = {
  [AgentStatus.ONLINE]: {
    color: 'text-green-400',
    borderColor: 'border-green-500/50',
    glow: 'shadow-[0_0_10px_rgba(74,222,128,0.5)]',
  },
  [AgentStatus.WORKING]: {
    color: 'text-blue-400',
    borderColor: 'border-blue-500/50',
    glow: 'shadow-[0_0_10px_rgba(96,165,250,0.5)]',
  },
  [AgentStatus.IDLE]: {
    color: 'text-gray-400',
    borderColor: 'border-gray-500/50',
    glow: 'shadow-[0_0_10px_rgba(156,163,175,0.3)]',
  },
  [AgentStatus.ERROR]: {
    color: 'text-red-400',
    borderColor: 'border-red-500/50',
    glow: 'shadow-[0_0_10px_rgba(248,113,113,0.6)]',
  },
};

const AgentCard: React.FC<AgentCardProps> = ({ agent }) => {
  const styles = statusStyles[agent.status];
  const cpuColor = agent.cpuUsage > 80 ? 'bg-red-500' : agent.cpuUsage > 50 ? 'bg-yellow-500' : 'bg-green-500';

  return (
    <div className={`glass-card p-4 rounded-lg border ${styles.borderColor} ${styles.glow} transition-all duration-300 hover:scale-105 hover:border-pink-500/50`}>
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-orbitron font-bold text-white">{agent.name}</h3>
          <p className="text-xs text-purple-300">{agent.type}</p>
        </div>
        <div className={`text-xs font-bold uppercase px-2 py-1 rounded ${styles.color} bg-black/30`}>
          {agent.status}
        </div>
      </div>
      <p className="text-xs text-gray-300 mt-3 h-10 overflow-hidden">{agent.task}</p>
      <div className="mt-4">
        <div className="flex justify-between items-center text-xs text-gray-400 mb-1">
          <span>CPU Usage</span>
          <span>{agent.cpuUsage}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-1.5">
          <div className={`${cpuColor} h-1.5 rounded-full`} style={{ width: `${agent.cpuUsage}%` }}></div>
        </div>
      </div>
    </div>
  );
};

export default AgentCard;
