
import React from 'react';
import { ChatMessage } from '../types';
import { UserIcon, AiIcon, LoadingIcon } from './icons';

interface MessageProps {
  message: ChatMessage;
  isStreaming?: boolean;
}

const CodeBlock: React.FC<{ content: string }> = ({ content }) => (
    <pre className="bg-black/30 p-3 rounded-md font-mono text-sm text-blue-200 overflow-x-auto my-2">
        <code>{content}</code>
    </pre>
);

export const Message: React.FC<MessageProps> = ({ message, isStreaming = false }) => {
  const isUser = message.role === 'user';

  const renderText = (text: string) => {
    const parts = text.split(/(```[\s\S]*?```)/g);
    return parts.map((part, index) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        const code = part.slice(3, -3).trim();
        return <CodeBlock key={index} content={code} />;
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div className={`flex gap-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && <div className="flex-shrink-0 w-8 h-8 bg-brand-accent rounded-full flex items-center justify-center text-white"><AiIcon /></div>}
      
      <div className={`max-w-[76%] p-3 rounded-xl shadow-lg relative text-sm font-mono ${isUser ? 'ml-auto bg-gradient-to-r from-[rgba(255,255,255,0.02)] to-[rgba(255,255,255,0.01)] border border-white/10' : 'bg-gradient-to-r from-brand-accent-glow to-[rgba(124,92,255,0.02)] border-l-4 border-brand-accent'}`}>
        <div className="whitespace-pre-wrap leading-relaxed">
            {renderText(message.text)}
            {isStreaming && <LoadingIcon className="inline-block ml-2 animate-spin"/>}
        </div>
        <div className="text-xs text-brand-muted/70 mt-2 text-right">
          {new Date(message.ts).toLocaleTimeString()}
        </div>
      </div>

      {isUser && <div className="flex-shrink-0 w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-brand-text"><UserIcon/></div>}
    </div>
  );
};
