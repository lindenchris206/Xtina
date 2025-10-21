import React, { useState } from 'react';
import { FileManager } from './FileManager';
import { CodeEditor } from './CodeEditor';
import { GitPanel } from './GitPanel';
import { ArchitectureDiagram } from './ArchitectureDiagram';
import type { ProjectFile } from '../types';
import { GitCommitIcon } from './icons';
import { useMissionContext } from '../hooks/useMissionContext';

interface IDEViewProps {
  projectFiles: ProjectFile[];
  selectedFile: ProjectFile | null;
  onFileSelect: (file: ProjectFile) => void;
  onFileContentChange: (path: string, content: string) => void;
}

type ActiveTab = 'files' | 'git';

export const IDEView: React.FC<IDEViewProps> = ({ projectFiles, selectedFile, onFileSelect, onFileContentChange }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('files');
  const { state, dispatch } = useMissionContext();
  const { gitState, missionStatus } = state;

  const handleCommit = () => {
    if (gitState.staged.length === 0) {
      alert("No changes staged for commit.");
      return;
    }
    const message = prompt("Enter commit message:");
    if (message && message.trim()) {
      dispatch({ type: 'GIT_COMMIT', payload: message });
    }
  };
  
  const isGitDisabled = missionStatus === 'executing' || missionStatus === 'planning';

  const renderContent = () => {
      if (!selectedFile) {
          return (
             <div className="flex items-center justify-center h-full bg-gray-900/70 rounded-md">
                <p className="text-gray-500">Select a file to view its content</p>
            </div>
          );
      }
      if (selectedFile.imageUrl) {
          return (
             <div className="flex items-center justify-center h-full bg-gray-900/70 rounded-md p-4">
                  <img src={selectedFile.imageUrl} alt={selectedFile.name} className="max-w-full max-h-full object-contain rounded-md" />
            </div>
          )
      }
      if (selectedFile.name.endsWith('.md')) {
          return <ArchitectureDiagram content={selectedFile.content} />
      }
      return (
          <CodeEditor 
            fileName={selectedFile?.path || null}
            fileContent={selectedFile?.content || null}
            onContentChange={(newContent) => {
                if (selectedFile) {
                onFileContentChange(selectedFile.path, newContent);
                }
            }}
        />
      );
  };

  return (
    <div className="grid grid-cols-12 gap-4 h-[500px]">
      <div className="col-span-12 md:col-span-3 h-full flex flex-col">
        <div className="flex border-b border-gray-700">
            <button 
                onClick={() => setActiveTab('files')}
                className={`px-4 py-2 text-sm font-medium ${activeTab === 'files' ? 'text-cyan-300 border-b-2 border-cyan-300' : 'text-gray-400'}`}
            >
                Files
            </button>
            <button 
                onClick={() => setActiveTab('git')}
                className={`px-4 py-2 text-sm font-medium ${activeTab === 'git' ? 'text-cyan-300 border-b-2 border-cyan-300' : 'text-gray-400'}`}
            >
                Git
            </button>
        </div>
         <div className="flex-grow min-h-0">
            {activeTab === 'files' ? (
                <FileManager 
                    files={projectFiles} 
                    onFileSelect={onFileSelect}
                    selectedFilePath={selectedFile?.path || null} 
                />
            ) : (
                <GitPanel gitState={gitState} />
            )}
        </div>
      </div>
      <div className="col-span-12 md:col-span-9 h-full flex flex-col">
         <div className="flex-shrink-0 bg-gray-800/50 p-2 rounded-t-md flex justify-between items-center">
             <h4 className="text-sm font-mono text-cyan-300">{selectedFile?.path || 'No file selected'}</h4>
              {gitState.initialized && activeTab === 'git' && (
                 <div className="flex items-center gap-2">
                     <button
                        onClick={() => dispatch({ type: 'GIT_STAGE_ALL' })}
                        disabled={gitState.modified.length === 0 || isGitDisabled}
                        className="text-xs bg-cyan-600 hover:bg-cyan-500 disabled:bg-gray-600 text-white font-bold py-1 px-2 rounded"
                    >
                        Stage All ({gitState.modified.length})
                    </button>
                     <button
                        onClick={handleCommit}
                        disabled={gitState.staged.length === 0 || isGitDisabled}
                        className="flex items-center gap-1 text-xs bg-green-600 hover:bg-green-500 disabled:bg-gray-600 text-white font-bold py-1 px-2 rounded"
                    >
                        <GitCommitIcon /> Commit ({gitState.staged.length})
                    </button>
                 </div>
             )}
             {!gitState.initialized && activeTab === 'git' && (
                 <button
                    onClick={() => dispatch({ type: 'GIT_INIT' })}
                    disabled={isGitDisabled}
                    className="text-xs bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-600 text-white font-bold py-1 px-2 rounded"
                >
                    Initialize Git Repo
                </button>
             )}
         </div>
          <div className="flex-grow min-h-0">
            {renderContent()}
         </div>
      </div>
    </div>
  );
};