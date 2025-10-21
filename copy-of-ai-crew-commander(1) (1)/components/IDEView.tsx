

/**
 * @author cel
 * @file components/IDEView.tsx
 * @description The Integrated Development Environment view, combining file manager and editor/terminal.
 */
import React, { useState, useMemo } from 'react';
import { FileManager } from './FileManager';
import { FileViewer } from './CodeEditor';
import { Terminal } from './Terminal';
import { useMission } from '../context/MissionContext';
import { CodeIcon, TerminalIcon } from './icons';
import { InstructionPanel } from './InstructionPanel';

interface IDEViewProps {
  onFileContentChange: (filename: string, newContent: string) => void;
}

export const IDEView: React.FC<IDEViewProps> = ({ onFileContentChange }) => {
  const { appState, activeFile, setActiveFile } = useMission();
  const { generatedFiles: files } = appState;
  const [searchTerm, setSearchTerm] = useState('');
  const [activeView, setActiveView] = useState<'editor' | 'terminal'>('editor');

  const filteredFiles = useMemo(() => {
    if (!searchTerm.trim()) {
      return files;
    }
    const lowercasedTerm = searchTerm.toLowerCase();
    return files.filter(file =>
      file.filename.toLowerCase().includes(lowercasedTerm) ||
      ((file.mimeType?.startsWith('text/') || !file.mimeType) && file.content.toLowerCase().includes(lowercasedTerm))
    );
  }, [files, searchTerm]);
  
  return (
    <div className="flex flex-row gap-4 h-full">
      {/* Left Sidebar: File Manager */}
      <div className="w-1/3 max-w-md flex-shrink-0 h-full">
        <FileManager 
          files={filteredFiles} 
          onFileSelect={setActiveFile} 
          activeFilename={activeFile?.filename}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          totalFileCount={files.length}
        />
      </div>

      {/* Main Content: Editor/Terminal */}
      <div className="flex-grow flex flex-col glassmorphism rounded-xl overflow-hidden h-full">
        <div className="p-4 pb-0">
          <InstructionPanel title="IDE Overview" storageKey="ide-instructions-v2">
            <p>Manage project files on the left. Use the AI tools in the editor toolbar for code assistance, or switch to the Terminal for command-line operations.</p>
          </InstructionPanel>
        </div>
        <div className="flex-shrink-0 flex justify-start items-center border-b border-white/10 px-4">
          <button 
            onClick={() => setActiveView('editor')}
            className={`flex items-center gap-2 px-4 py-2 text-sm transition-colors border-b-2 ${activeView === 'editor' ? 'border-cyan-400 text-cyan-300' : 'border-transparent text-gray-400 hover:text-white'}`}
          >
            <span className="w-4 h-4"><CodeIcon /></span> Editor
          </button>
          <button 
            onClick={() => setActiveView('terminal')}
            className={`flex items-center gap-2 px-4 py-2 text-sm transition-colors border-b-2 ${activeView === 'terminal' ? 'border-cyan-400 text-cyan-300' : 'border-transparent text-gray-400 hover:text-white'}`}
          >
            <span className="w-4 h-4"><TerminalIcon /></span> Terminal
          </button>
        </div>
        <div className="flex-grow min-h-0 bg-gray-900/50">
          {activeView === 'editor' ? (
            <FileViewer onContentChange={onFileContentChange} />
          ) : (
            <Terminal />
          )}
        </div>
      </div>
    </div>
  );
};