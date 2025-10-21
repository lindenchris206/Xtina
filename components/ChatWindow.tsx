
import React, { useRef, useEffect, useState } from 'react';
import { ChatMessage, Task } from '../types';
import { Message } from './Message';

interface ChatWindowProps {
  messages: ChatMessage[];
  currentAiMessage: string;
  tasks: Task[];
}

const WorkflowCanvas: React.FC<{ tasks: Task[] }> = ({ tasks }) => {
  return (
    <div className="flex-1 overflow-y-auto p-2 text-sm">
        <h2 className="text-lg font-bold text-brand-text mb-4">Workflow Canvas</h2>
        <div className="space-y-3">
        {tasks.map(task => (
            <div key={task.id} className="bg-white/5 p-3 rounded-lg border-l-4 border-cyan-400">
                <p className="font-bold text-brand-text">{task.title || `Task ${task.id}`}</p>
                <p className="text-xs text-brand-muted">Agent: {task.assignedAgent || 'N/A'}</p>
                <p className={`text-xs font-mono mt-1 ${task.status === 'done' ? 'text-green-400' : 'text-amber-400'}`}>
                    Status: {task.status}
                </p>
            </div>
        ))}
        {tasks.length === 0 && <p className="text-brand-muted">No tasks in the workflow yet.</p>}
        </div>
    </div>
  );
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ messages, currentAiMessage, tasks }) => {
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
    <div className="h-full flex flex-col">
        <div className="flex-shrink-0 flex border-b border-white/10 mb-2">
            <button 
                onClick={() => setActiveView('chat')}
                className={`py-2 px-4 text-sm font-medium ${activeView === 'chat' ? 'text-brand-accent border-b-2 border-brand-accent' : 'text-brand-muted'}`}
            >
                Chat
            </button>
            <button 
                onClick={() => setActiveView('workflow')}
                className={`py-2 px-4 text-sm font-medium ${activeView === 'workflow' ? 'text-brand-accent border-b-2 border-brand-accent' : 'text-brand-muted'}`}
            >
                Workflow
            </button>
        </div>
        
        {activeView === 'chat' ? (
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
        ) : (
            <WorkflowCanvas tasks={tasks} />
        )}
    </div>
  );
};
