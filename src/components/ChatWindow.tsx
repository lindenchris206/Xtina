import React, { useRef, useEffect, useState } from 'react';
import { ChatMessage, Task } from '../types';
import { Message } from './Message';
import { Avatar } from './Avatar';

interface ChatWindowProps {
  messages: ChatMessage[];
  currentAiMessage: string;
  tasks: Task[];
  isSpeaking: boolean;
  onSpeak: (text: string) => void;
}

const WorkflowCanvas: React.FC<{ tasks: Task[] }> = ({ tasks }) => {
  return (
    <div className="flex-1 overflow-y-auto p-4 text-sm scrollbar-thin">
        <h2 className="text-lg font-bold text-[rgb(var(--color-text))] mb-4 font-orbitron">Workflow Canvas</h2>
        <div className="space-y-4">
        {tasks.map(task => (
            <div key={task.id} className="bg-white/5 p-4 rounded-lg border-l-4 border-[rgb(var(--color-primary))] space-y-2">
                <div className="flex justify-between items-start">
                    <p className="font-bold text-[rgb(var(--color-text))] pr-4">{task.title || `Task ${task.id}`}</p>
                    <span className={`flex-shrink-0 px-2 py-0.5 text-xs rounded-full font-mono ${
                        task.status === 'done' ? 'bg-green-500/20 text-green-400' : 
                        task.status === 'running' ? 'bg-amber-500/20 text-amber-400' : 
                        task.status === 'failed' ? 'bg-red-500/20 text-red-400' :
                        'bg-gray-500/20 text-gray-400'
                    }`}>
                        {task.status}
                    </span>
                </div>
                <p className="text-xs text-[rgb(var(--color-text-muted))]">Assigned to: <span className="font-semibold text-white/70">{task.assignedAgent || 'N/A'}</span></p>
                {task.prompt && (
                    <p className="text-sm text-[rgb(var(--color-text-muted))] pt-2 border-t border-white/10 whitespace-pre-wrap">
                        {task.prompt}
                    </p>
                )}
            </div>
        ))}
        {tasks.length === 0 && <p className="text-center text-[rgb(var(--color-text-muted))] py-10">No tasks in the workflow yet.</p>}
        </div>
    </div>
  );
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ messages, currentAiMessage, tasks, isSpeaking, onSpeak }) => {
  const [activeView, setActiveView] = useState<'chat' | 'workflow'>('chat');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (activeView === 'chat') {
      scrollToBottom();
    }
  }, [messages, currentAiMessage, activeView]);
  
  const lastMessage = messages[messages.length-1];
  const floatingDate = lastMessage ? new Date(lastMessage.ts).toLocaleDateString() : new Date().toLocaleDateString();

  return (
    <div className="h-full flex flex-col min-h-0">
        <div className="flex items-start">
            <div className="flex-1">
                <div className="flex border-b border-white/10 mb-2">
                    <button 
                        onClick={() => setActiveView('chat')}
                        className={`py-2 px-4 text-sm font-medium font-orbitron ${activeView === 'chat' ? 'text-[rgb(var(--color-accent))] border-b-2 border-[rgb(var(--color-accent))]' : 'text-[rgb(var(--color-text-muted))]'}`}
                    >
                        Chat
                    </button>
                    <button 
                        onClick={() => setActiveView('workflow')}
                        className={`py-2 px-4 text-sm font-medium font-orbitron ${activeView === 'workflow' ? 'text-[rgb(var(--color-accent))] border-b-2 border-[rgb(var(--color-accent))]' : 'text-[rgb(var(--color-text-muted))]'}`}
                    >
                        Workflow
                    </button>
                </div>
            </div>
            <div className="w-40 h-32 ml-4 -mt-4">
                <Avatar isSpeaking={isSpeaking} />
            </div>
        </div>
        
        {activeView === 'chat' ? (
            <div className="flex-1 overflow-y-auto p-2 relative scrollbar-thin">
                <div className="sticky top-2 left-1/2 -translate-x-1/2 bg-[rgba(5,10,15,0.6)] text-[rgb(var(--color-text-muted))] px-3 py-1.5 rounded-full z-10 text-xs border border-white/5 w-fit">
                    {floatingDate}
                </div>
                <div className="flex flex-col gap-4 mt-4">
                    {messages.map((msg) => (
                    <Message key={msg.id} message={msg} onSpeak={onSpeak} />
                    ))}
                    {currentAiMessage && (
                        <Message message={{id: 'streaming', role: 'ai', text: currentAiMessage, ts: new Date().toISOString()}} isStreaming={true} onSpeak={() => {}} />
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>
        ) : (
            <WorkflowCanvas tasks={tasks} />
        )}
    </div>
  );
};