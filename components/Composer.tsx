import React, { useState, useRef, useEffect } from 'react';
import { SendIcon, InterruptIcon } from './icons';

interface ComposerProps {
  onSend: (message: string) => void;
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
    <div className="composer flex gap-2 items-end bg-[rgb(var(--color-bg-panel))] p-2.5 rounded-lg border border-white/5">
      <textarea
        ref={textareaRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Chat with Renee, or use /crew [your command] for the team..."
        className="flex-1 min-h-[44px] max-h-40 resize-none p-2 rounded-md bg-transparent border border-white/10 text-[rgb(var(--color-text))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-primary))] transition-shadow font-mono"
        rows={1}
      />
      
      {streaming ? (
        <button
          onClick={onInterrupt}
          className="bg-red-600 text-white w-24 h-[44px] rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-opacity-90 transition-colors"
        >
          <InterruptIcon />
          Stop
        </button>
      ) : (
        <button
          onClick={handleSend}
          className="bg-[rgb(var(--color-primary))] text-black w-24 h-[44px] rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-opacity-90 transition-colors"
        >
          <SendIcon />
          Send
        </button>
      )}
    </div>
  );
};