
import React from 'react';
import { AgentType } from '../types';

interface AvatarProps {
  name: string;
  role: AgentType.LEADER | AgentType.CONCIERGE;
  imageUrl: string;
  status: 'ONLINE' | 'IDLE';
}

const Avatar: React.FC<AvatarProps> = ({ name, role, imageUrl, status }) => {
  const isLeader = role === AgentType.LEADER;
  const statusColor = status === 'ONLINE' ? 'bg-green-400' : 'bg-blue-400';

  return (
    <div className="p-3 glass-card rounded-lg flex items-center space-x-3 glowing-border">
      <div className="relative">
        <img src={imageUrl} alt={name} className="w-12 h-12 rounded-full border-2 border-purple-400" />
        <span className={`absolute bottom-0 right-0 block h-3 w-3 rounded-full ${statusColor} ring-2 ring-gray-800`}></span>
      </div>
      <div>
        <h3 className={`font-orbitron font-bold ${isLeader ? 'text-pink-400' : 'text-blue-300'}`}>{name}</h3>
        <p className="text-xs text-gray-400">{role}</p>
      </div>
    </div>
  );
};

export default Avatar;
