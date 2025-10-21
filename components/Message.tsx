import React from 'react';
import { ChatMessage, CouncilMessage } from '../types';
import { UserIcon, AiIcon, LoadingIcon, SpeakIcon, AgentIcon } from './icons';

interface MessageProps {
  message: ChatMessage;
  isStreaming?: boolean;
  onSpeak: (text: string) => void;
}

const CodeBlock: React.FC<{ content: string }> = ({ content }) => (
    <pre className="bg-black/30 p-3 rounded-md font-mono text-sm text-cyan-200 overflow-x-auto my-2">
        <code>{content}</code>
    </pre>
);

const ImageDisplay: React.FC<{ url: string }> = ({ url }) => (
    <div className="mt-2 border border-white/10 rounded-lg overflow-hidden">
        <img src={url} alt="Generated content" className="max-w-full h-auto" />
    </div>
);

const CouncilView: React.FC<{ messages: CouncilMessage[] }> = ({ messages }) => (
    <div className="mt-3 border-t border-white/10 pt-3 space-y-3">
        <h4 className="text-xs font-bold font-orbitron text-[rgb(var(--color-accent))]">COUNCIL DELIBERATION</h4>
        {messages.map((msg, idx) => (
            <div key={idx} className="bg-black/20 p-2 rounded-md">
                <p className="text-xs font-semibold text-[rgb(var(--color-primary))] flex items-center gap-1.5"><AgentIcon/>{msg.agentName}</p>
                <p className="text-xs text-[rgb(var(--color-text-muted))] mt-1 whitespace-pre-wrap">{msg.response}</p>
            </div>
        ))}
    </div>
);

export const Message: React.FC<MessageProps> = ({ message, isStreaming = false, onSpeak }) => {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';

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

  if (isSystem) {
    return (
      <div className="text-center text-xs text-[rgb(var(--color-text-muted))] italic py-2">
        {message.text}
      </div>
    );
  }

  return (
    <div className={`flex gap-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && <div className="flex-shrink-0 w-8 h-8 bg-[rgb(var(--color-primary))] rounded-full flex items-center justify-center text-black"><AiIcon /></div>}
      
      <div className={`group max-w-[76%] p-3 rounded-xl shadow-lg relative font-mono text-sm ${isUser ? 'ml-auto bg-gradient-to-r from-[rgba(255,255,255,0.02)] to-[rgba(255,255,255,0.01)] border border-white/10' : 'bg-gradient-to-r from-[rgba(var(--color-secondary),0.1)] to-[rgba(var(--color-secondary),0.02)] border-l-4 border-[rgb(var(--color-secondary))]'}`}>
        <div className="whitespace-pre-wrap leading-relaxed text-[rgb(var(--color-text))]">
            {renderText(message.text)}
            {message.imageUrl && <ImageDisplay url={message.imageUrl} />}
            {isStreaming && <LoadingIcon className="inline-block ml-2 animate-spin"/>}
            {message.councilMessages && <CouncilView messages={message.councilMessages} />}
        </div>

        <div className="flex justify-end items-center mt-2">
           {!isUser && !isStreaming && message.text && (
             <button onClick={() => onSpeak(message.text)} className="p-1 rounded-md text-[rgb(var(--color-text-muted))] opacity-0 group-hover:opacity-100 hover:bg-white/10 transition-opacity" aria-label="Speak message">
                <SpeakIcon />
             </button>
           )}
          <div className="text-xs text-[rgb(var(--color-text-muted))] ml-auto">
            {new Date(message.ts).toLocaleTimeString()}
          </div>
        </div>
      </div>

      {isUser && <div className="flex-shrink-0 w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-[rgb(var(--color-text))]"><UserIcon/></div>}
    </div>
  );
};