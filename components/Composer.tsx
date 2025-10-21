
import React, { useState, useRef, useEffect } from 'react';
import { SendIcon, InterruptIcon } from './icons';

interface ComposerProps {
  onSend: (message: string, interrupt?: boolean) => void;
  onInterrupt: () => void;
  streaming: boolean;
}

export const Composer: React.FC<ComposerProps> = ({ onSend, onInterrupt, streaming }) => {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (input.trim()) {
      onSend(input.trim());
      setInput('');
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  return (
    <div className="composer flex gap-2 items-end bg-brand-panel p-2.5 rounded-lg">
      <textarea
        ref={textareaRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type a message... (Shift+Enter = newline)"
        className="flex-1 min-h-[44px] max-h-40 resize-none p-2 rounded-md bg-transparent border border-white/10 text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-accent transition-shadow"
        rows={1}
      />
      <div className="flex flex-col gap-2">
        <button
          onClick={handleSend}
          disabled={streaming}
          className="bg-brand-accent text-white w-24 h-[44px] rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-opacity-90 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
        >
          <SendIcon />
          Send
        </button>
        <button
          onClick={onInterrupt}
          disabled={!streaming}
          className="bg-red-600 text-white w-24 h-[44px] rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-opacity-90 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
        >
          <InterruptIcon />
          Interrupt
        </button>
      </div>
    </div>
  );
};
