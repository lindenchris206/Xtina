
import React from 'react';
import { Header } from './components/Header';
import { LeftSidebar } from './components/LeftSidebar';
import { ChatWindow } from './components/ChatWindow';
import { RightSidebar } from './components/RightSidebar';
import { Composer } from './components/Composer';
import { useChat } from './hooks/useChat';

const App: React.FC = () => {
  const {
    messages,
    sendMessage,
    interrupt,
    streaming,
    currentAiMessage,
  } = useChat();

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

  return (
    <div className="app grid grid-cols-[260px_1fr_320px] grid-rows-[64px_1fr_auto] gap-3 h-screen p-3 font-sans lg:grid-cols-[260px_1fr_320px] md:grid-cols-[260px_1fr] sm:grid-cols-1 sm:grid-rows-[64px_1fr_auto]">
      <Header onExport={handleExport} />
      
      <aside className="left bg-brand-panel rounded-lg p-3 overflow-y-auto hidden sm:hidden md:block">
        <LeftSidebar />
      </aside>

      <main className="main bg-gradient-to-b from-[rgba(255,255,255,0.02)] to-[rgba(255,255,255,0.01)] rounded-lg p-3 flex flex-col min-w-0">
        <ChatWindow messages={messages} currentAiMessage={currentAiMessage} />
      </main>
      
      <aside className="right bg-brand-panel rounded-lg p-3 overflow-y-auto hidden lg:block">
        <RightSidebar messages={messages} />
      </aside>

      <footer className="grid-column:1/-1 col-span-full">
        <Composer onSend={sendMessage} onInterrupt={interrupt} streaming={streaming} />
      </footer>
    </div>
  );
};

export default App;
