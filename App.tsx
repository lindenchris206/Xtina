import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { LeftSidebar } from './components/LeftSidebar';
import { ChatWindow } from './components/ChatWindow';
import { RightSidebar } from './components/RightSidebar';
import { Composer } from './components/Composer';
import { useChat } from './hooks/useChat';
import { Agent, Task } from './types';
import io from 'socket.io-client';

// API calls are now relative, removing the dependency on a hardcoded 'localhost:3001'.
// This fixes "Failed to fetch" errors in deployed or proxied environments.

const App: React.FC = () => {
  const {
    messages,
    sendMessage,
    interrupt,
    streaming,
    currentAiMessage,
    conversationsSummary,
    activeConversationId,
    startNewConversation,
    switchConversation,
    deleteConversation,
  } = useChat();

  const [agents, setAgents] = useState<Agent[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  
  useEffect(() => {
    // Initial data fetch from relative path
    fetch('/api/agents')
      .then(res => res.json())
      .then(data => setAgents(data.agents || []))
      .catch(err => console.error("Failed to fetch agents:", err));
      
    // Setup socket connection to the same host that serves the page
    const socket = io();

    socket.on('connect', () => {
      console.log('Connected to backend orchestrator.');
    });

    socket.on('agents', (allAgents: Agent[]) => setAgents(allAgents));
    socket.on('tasks', (allTasks: Task[]) => setTasks(allTasks));

    socket.on('agent-update', (updatedAgent: Agent) => {
      setAgents(prev => prev.map(a => a.name === updatedAgent.name ? updatedAgent : a));
    });

    socket.on('task-update', (updatedTask: Task) => {
      setTasks(prev => {
        const existing = prev.find(t => t.id === updatedTask.id);
        if (existing) {
          return prev.map(t => t.id === updatedTask.id ? updatedTask : t);
        }
        return [...prev, updatedTask];
      });
    });

    socket.on('log', (log: { message: string, time: string }) => {
      setLogs(prev => [`${new Date(log.time).toLocaleTimeString()} - ${log.message}`, ...prev]);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleExport = () => {
    const text = messages.map(m =>
      `${m.role === 'user' ? 'You' : 'AI'}: ${m.text}\n[${new Date(m.ts).toLocaleString()}]\n\n`
    ).join('');
    const blob = new Blob([text], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'xtina-chat.txt';
    a.click();
    URL.revokeObjectURL(a.href);
  };
  
  const handleEngineChange = async (agentName: string, newEngine: string) => {
    try {
      // API call to relative path
      await fetch(`/api/agents/${agentName}/engine`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ engine: newEngine })
      });
      // The websocket 'agent-update' will handle the state change
    } catch (error) {
      console.error('Failed to update agent engine', error);
    }
  };

  return (
    <div className="app grid grid-cols-[260px_1fr_320px] grid-rows-[64px_1fr_auto] gap-3 h-screen p-3 font-sans lg:grid-cols-[260px_1fr_320px] md:grid-cols-[260px_1fr] sm:grid-cols-1 sm:grid-rows-[64px_1fr_auto]">
      <Header onExport={handleExport} />
      
      <aside className="left bg-brand-panel rounded-lg p-3 overflow-y-auto hidden sm:hidden md:block">
        <LeftSidebar 
            conversations={conversationsSummary}
            activeId={activeConversationId}
            onNewChat={startNewConversation}
            onSwitchChat={switchConversation}
            onDeleteChat={deleteConversation}
            agents={agents}
            logs={logs}
            onEngineChange={handleEngineChange}
        />
      </aside>

      <main className="main bg-gradient-to-b from-[rgba(255,255,255,0.02)] to-[rgba(255,255,255,0.01)] rounded-lg p-3 flex flex-col min-w-0">
        <ChatWindow messages={messages} currentAiMessage={currentAiMessage} tasks={tasks} />
      </main>
      
      <aside className="right bg-brand-panel rounded-lg p-3 overflow-y-auto hidden lg:block">
        <RightSidebar tasks={tasks} />
      </aside>

      <footer className="grid-column:1/-1 col-span-full">
        <Composer onSend={sendMessage} onInterrupt={interrupt} streaming={streaming} />
      </footer>
    </div>
  );
};

export default App;