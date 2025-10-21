import React, { useState } from 'react';
import FileExplorer from '../components/file-explorer/FileExplorer';
import MainPanel from '../components/main-panel/MainPanel';
import AssistantPanel from '../components/assistant-panel/AssistantPanel';
import { FileSystemNode } from '../types';

const ProjectStudio: React.FC = () => {
  const [activeFile, setActiveFile] = useState<FileSystemNode | null>(null);

  return (
    <div className="flex w-full h-full bg-gray-900 text-gray-100">
      {/* Left Panel: File Explorer */}
      <div className="w-64 bg-gray-800/50 border-r border-gray-700/50 p-2">
        <h1 className="text-lg font-bold p-2 text-indigo-400">AI Crew Commander</h1>
        <FileExplorer onFileSelect={setActiveFile} />
      </div>

      {/* Middle Panel: Editors */}
      <div className="flex-1 flex flex-col">
        <MainPanel activeFile={activeFile} />
      </div>

      {/* Right Panel: AI Assistant */}
      <div className="w-96 bg-gray-800/50 border-l border-gray-700/50 flex flex-col">
        <AssistantPanel />
      </div>
    </div>
  );
};

export default ProjectStudio;
