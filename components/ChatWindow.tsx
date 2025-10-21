
import React, { useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { Message } from './Message';

interface ChatWindowProps {
  messages: ChatMessage[];
  currentAiMessage: string;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ messages, currentAiMessage }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, currentAiMessage]);
  
  const lastMessage = messages[messages.length-1];
  const floatingDate = lastMessage ? new Date(lastMessage.ts).toLocaleDateString() : new Date().toLocaleDateString();

  return (
    <div className="flex-1 overflow-y-auto p-2 relative">
       <div className="sticky top-2 left-1/2 -translate-x-1/2 bg-[rgba(5,10,15,0.6)] text-brand-muted px-3 py-1.5 rounded-full z-10 text-xs border border-white/5 w-fit">
         {floatingDate}
       </div>
      <div className="flex flex-col gap-4 mt-4">
        {messages.map((msg) => (
          <Message key={msg.id} message={msg} />
        ))}
        {currentAiMessage && (
            <Message message={{id: 'streaming', role: 'ai', text: currentAiMessage, ts: new Date().toISOString()}} isStreaming={true} />
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};
