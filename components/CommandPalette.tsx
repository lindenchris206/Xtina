import React, { useState, useEffect, useRef } from 'react';

interface Command {
  id: string;
  name: string;
  action: string;
  category: string;
}

const commands: Command[] = [
  { id: 'new_chat', name: 'Start New Chat', action: 'new_chat', category: 'General' },
  { id: 'new_task', name: 'New Crew Task...', action: 'new_task', category: 'General' },
  { id: 'theme_commander', name: 'Switch Theme: Commander', action: 'theme:commander', category: 'Appearance' },
  { id: 'theme_hacker', name: 'Switch Theme: Hacker', action: 'theme:hacker', category: 'Appearance' },
  { id: 'theme_nebula', name: 'Switch Theme: Nebula', action: 'theme:nebula', category: 'Appearance' },
];

interface CommandPaletteProps {
  onCommand: (action: string) => void;
  onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ onCommand, onClose }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const paletteRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredCommands = query
    ? commands.filter(c => c.name.toLowerCase().includes(query.toLowerCase()))
    : commands;
    
  useEffect(() => {
      inputRef.current?.focus();
      
      const handleClickOutside = (event: MouseEvent) => {
          if (paletteRef.current && !paletteRef.current.contains(event.target as Node)) {
              onClose();
          }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => (prev + 1) % filteredCommands.length);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if(filteredCommands[selectedIndex]) {
                onCommand(filteredCommands[selectedIndex].action);
            }
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [filteredCommands, selectedIndex, onCommand]);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-start pt-20">
      <div ref={paletteRef} className="w-full max-w-lg glassmorphism rounded-lg shadow-2xl overflow-hidden">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Type a command or search..."
          className="w-full p-4 bg-transparent text-lg text-[rgb(var(--color-text))] focus:outline-none border-b border-white/10"
        />
        <ul className="max-h-80 overflow-y-auto p-2">
          {filteredCommands.length > 0 ? filteredCommands.map((cmd, index) => (
            <li
              key={cmd.id}
              onClick={() => onCommand(cmd.action)}
              className={`p-3 rounded-md cursor-pointer flex justify-between items-center text-sm ${
                index === selectedIndex ? 'bg-[rgb(var(--color-primary))] text-black' : 'text-[rgb(var(--color-text-muted))] hover:bg-white/5'
              }`}
            >
              <span>{cmd.name}</span>
              <span className={`text-xs ${index === selectedIndex ? 'text-black/50' : 'text-[rgb(var(--color-text-muted))]'}`}>{cmd.category}</span>
            </li>
          )) : (
              <li className="p-4 text-center text-sm text-[rgb(var(--color-text-muted))]">No commands found.</li>
          )}
        </ul>
      </div>
    </div>
  );
};