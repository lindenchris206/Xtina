import React from 'react';
import type { CrewMember } from '../types';

interface CrewMemberCardProps {
  member: CrewMember;
}

const CrewMemberCard: React.FC<CrewMemberCardProps> = ({ member }) => {
  return (
    <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700 hover:border-cyan-500 transition-all duration-300 flex items-start space-x-4">
      <div className="bg-gray-900 p-3 rounded-lg border border-gray-700">
        {/* FIX: member.icon is already a React element (ReactNode) and cannot be used as a component. It should be wrapped to apply styles. */}
        <div className="w-8 h-8 text-cyan-400">{member.icon}</div>
      </div>
      <div>
        <h3 className="font-bold text-white">{member.name}</h3>
        {/* FIX: Property 'role' does not exist on type 'CrewMember'. Displaying specialty instead. */}
        <p className="text-sm text-cyan-400">{member.specialty}</p>
        <p className="text-xs text-gray-400 mt-1">{member.personality}</p>
      </div>
    </div>
  );
};

export default CrewMemberCard;
