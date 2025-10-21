import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { LeftSidebar } from './components/LeftSidebar';
import { ChatWindow } from './components/ChatWindow';
import { RightSidebar } from './components/RightSidebar';
import { Composer } from './components/Composer';
import { useChat } from './hooks/useChat';
import { Agent, Task } from './types';
import io from 'socket.io-client';
import { AnimatedBackground } from './components/AnimatedBackground';
import { CommandPalette } from './components/CommandPalette';
import { AgentEditorModal } from './components/AgentEditorModal';

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
    addMessage,
  } = useChat();

  const [agents, setAgents] = useState<Agent[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);

  const handleTaskRequest = async (prompt: string) => {
    try {
      await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
    } catch (error) {
      console.error('Failed to create task:', error);
      addMessage({
        id: `err_${Date.now()}`,
        role: 'system',
        text: `Error: Could not start task. ${error instanceof Error ? error.message : ''}`,
        ts: new Date().toISOString()
      });
    }
  };

  const handleSendMessage = (text: string) => {
    const isCommand = text.toLowerCase().startsWith('/crew ') || text.toLowerCase().startsWith('/council ');
    
    if (isCommand) {
      handleTaskRequest(text);
      addMessage({
        id: `cmd_${Date.now()}`,
        role: 'user',
        text: `Command issued: ${text}`,
        ts: new Date().toISOString()
      });
    } else {
      sendMessage(text);
    }
  };

  const playAudio = async (text: string) => {
    if (isSpeaking) return;
    if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const audioContext = audioContextRef.current;
    
    setIsSpeaking(true);
    try {
        const response = await fetch('/api/speak', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text })
        });
        if (!response.ok) throw new Error('Failed to fetch audio from server.');

        const audioData = await response.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(audioData);

        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContext.destination);
        source.start(0);

        source.onended = () => {
            setIsSpeaking(false);
        };
    } catch (error) {
        console.error("Audio playback error:", error);
        setIsSpeaking(false);
    }
  };

  const updateAgentInState = (updatedAgent: Agent) => {
    setAgents(prev => prev.map(a => a.name === updatedAgent.name ? updatedAgent : a));
  };

  useEffect(() => {
    fetch('/api/agents')
      .then(res => res.json())
      .then(data => setAgents(data.agents || []))
      .catch(err => console.error("Failed to fetch agents:", err));
      
    const socket = io();

    socket.on('connect', () => console.log('Connected to backend orchestrator.'));
    socket.on('agents', (allAgents: Agent[]) => setAgents(allAgents));
    socket.on('tasks', (allTasks: Task[]) => setTasks(allTasks));
    socket.on('agent-update', updateAgentInState);

    socket.on('task-update', (updatedTask: Task) => {
      setTasks(prev => {
        const existing = prev.find(t => t.id === updatedTask.id);
        if (existing) return prev.map(t => t.id === updatedTask.id ? updatedTask : t);
        return [...prev, updatedTask];
      });

      if (updatedTask.status === 'done' && updatedTask.output) {
        addMessage({
          id: `task_${updatedTask.id}`,
          role: 'ai',
          text: `Task complete: ${updatedTask.title}\n\n${updatedTask.output.content}`.trim(),
          imageUrl: updatedTask.output.type === 'image' ? updatedTask.output.content : undefined,
          councilMessages: updatedTask.output.type === 'council' ? updatedTask.output.councilMessages : undefined,
          ts: new Date().toISOString()
        });
      }
    });

    socket.on('log', (log: { message: string, time: string }) => {
      setLogs(prev => [`${new Date(log.time).toLocaleTimeString()} - ${log.message}`, ...prev].slice(0, 100));
    });

    return () => {
      socket.disconnect();
    };
  }, [addMessage]);

  const handleEngineChange = async (agentName: string, newEngine: string) => {
    try {
      const res = await fetch(`/api/agents/${agentName}/engine`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ engine: newEngine })
      });
      if (res.ok) updateAgentInState(await res.json());
    } catch (error) {
      console.error('Failed to update agent engine', error);
    }
  };

  const handleAgentUpdate = async (agent: Agent, specialties: { primary: string, secondaries: string[] }) => {
    try {
        const res = await fetch(`/api/agents/${agent.name}/specialties`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(specialties),
        });
        if (res.ok) {
            updateAgentInState(await res.json());
            setEditingAgent(null);
        } else {
            console.error('Failed to save agent specialties');
        }
    } catch (error) {
        console.error('Error saving agent specialties', error);
    }
  };

  const handleCommand = (command: string) => {
      if (command.startsWith('theme:')) {
          const newTheme = command.split(':')[1];
          document.documentElement.setAttribute('data-theme', newTheme);
      }
      if (command === 'new_chat') startNewConversation();
      if (command === 'new_task') handleSendMessage('/crew ');

      setIsPaletteOpen(false);
  };
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsPaletteOpen(prev => !prev);
      } else if (e.key === 'Escape') {
        setIsPaletteOpen(false);
        setEditingAgent(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);


  return (
    <>
      <AnimatedBackground />
      {isPaletteOpen && <CommandPalette onCommand={handleCommand} onClose={() => setIsPaletteOpen(false)} />}
      {editingAgent && <AgentEditorModal agent={editingAgent} onSave={handleAgentUpdate} onClose={() => setEditingAgent(null)} />}
      
      <div className="app grid grid-cols-[220px_1fr_280px] grid-rows-[64px_1fr_auto] gap-3 h-screen p-3 md:grid-cols-[220px_1fr] sm:grid-cols-1 sm:grid-rows-[64px_auto_1fr_auto]">
        <Header />
        
        <aside className="left glassmorphism rounded-lg p-3 overflow-y-auto scrollbar-thin hidden sm:hidden md:block">
          <LeftSidebar 
              conversations={conversationsSummary}
              activeId={activeConversationId}
              onNewChat={startNewConversation}
              onSwitchChat={switchConversation}
              onDeleteChat={deleteConversation}
              agents={agents}
              logs={logs}
              onEngineChange={handleEngineChange}
              onEditAgent={setEditingAgent}
          />
        </aside>

        <main className="main glassmorphism rounded-lg p-3 flex flex-col min-w-0">
          <ChatWindow 
            messages={messages} 
            currentAiMessage={currentAiMessage} 
            tasks={tasks} 
            isSpeaking={isSpeaking}
            onSpeak={playAudio}
          />
        </main>
        
        <aside className="right glassmorphism rounded-lg p-3 overflow-y-auto scrollbar-thin hidden lg:block">
          <RightSidebar agents={agents} tasks={tasks} onAgentsUpdate={setAgents} />
        </aside>

        <footer className="col-span-full">
          <Composer onSend={handleSendMessage} onInterrupt={interrupt} streaming={streaming} />
        </footer>
      </div>
    </>
  );
};

export default App;