
import React from 'react';
import { ChatMessage } from '../types';
import { TimelineIcon } from './icons';

interface RightSidebarProps {
  messages: ChatMessage[];
}

export const RightSidebar: React.FC<RightSidebarProps> = ({ messages }) => {
  return (
    <div>
      <h2 className="font-bold text-brand-text mb-4 flex items-center gap-2">
        <TimelineIcon />
        Timeline
      </h2>
      <div className="relative border-l-2 border-white/10 pl-6 space-y-6">
        {messages.map((msg, index) => (
          <div key={msg.id} className="relative">
            <div className={`absolute -left-[33px] top-1 w-4 h-4 rounded-full ${msg.role === 'user' ? 'bg-blue-400' : 'bg-brand-accent'}`}></div>
            <p className={`font-bold ${msg.role === 'user' ? 'text-blue-300' : 'text-purple-300'}`}>{msg.role === 'user' ? 'You' : 'AI'}</p>
            <p className="text-xs text-brand-muted">{new Date(msg.ts).toLocaleString()}</p>
            <p className="text-sm mt-1 text-brand-text/80 truncate">{msg.text}</p>
          </div>
        ))}
         {messages.length === 0 && <p className="text-sm text-brand-muted">No messages yet.</p>}
      </div>
    </div>
  );
};
