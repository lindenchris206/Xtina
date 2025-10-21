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

  const handleTaskRequest = async (prompt: string) => {
    try {
      await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      // Task updates will come via WebSocket
    } catch (error) {
      console.error('Failed to create task:', error);
      addMessage({
        id: `err_${Date.now()}`,
        role: 'ai',
        text: `Error: Could not start task. ${error instanceof Error ? error.message : ''}`,
        ts: new Date().toISOString()
      });
    }
  };

  const handleSendMessage = (text: string) => {
    // If message starts with /crew, it's a task for the backend orchestrator.
    // Otherwise, it's a direct chat with the lead AI (Renee) via the frontend service.
    if (text.toLowerCase().startsWith('/crew ')) {
      const prompt = text.substring(6);
      handleTaskRequest(prompt);
      // Also add a message to the UI to show the command was issued.
      addMessage({
        id: `cmd_${Date.now()}`,
        role: 'user',
        text: `Command issued to crew: ${prompt}`,
        ts: new Date().toISOString()
      });
    } else {
      sendMessage(text); // This is the useChat hook's sendMessage
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

  useEffect(() => {
    fetch('/api/agents')
      .then(res => res.json())
      .then(data => setAgents(data.agents || []))
      .catch(err => console.error("Failed to fetch agents:", err));
      
    const socket = io();

    socket.on('connect', () => console.log('Connected to backend orchestrator.'));
    socket.on('agents', (allAgents: Agent[]) => setAgents(allAgents));
    socket.on('tasks', (allTasks: Task[]) => setTasks(allTasks));

    socket.on('agent-update', (updatedAgent: Agent) => {
      setAgents(prev => prev.map(a => a.name === updatedAgent.name ? updatedAgent : a));
    });

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
          text: `Task complete: ${updatedTask.title}\n\n${updatedTask.output.type === 'text' ? updatedTask.output.content : ''}`.trim(),
          imageUrl: updatedTask.output.type === 'image' ? updatedTask.output.content : undefined,
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
      await fetch(`/api/agents/${agentName}/engine`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ engine: newEngine })
      });
    } catch (error) {
      console.error('Failed to update agent engine', error);
    }
  };

  return (
    <>
      <AnimatedBackground />
      <div className="app grid grid-cols-[260px_1fr_320px] grid-rows-[64px_1fr_auto] gap-3 h-screen p-3 lg:grid-cols-[260px_1fr_320px] md:grid-cols-[260px_1fr] sm:grid-cols-1 sm:grid-rows-[64px_auto_1fr_auto]">
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
          <RightSidebar tasks={tasks} />
        </aside>

        <footer className="col-span-full">
          <Composer onSend={handleSendMessage} onInterrupt={interrupt} streaming={streaming} />
        </footer>
      </div>
    </>
  );
};

export default App;