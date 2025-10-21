import React from 'react';
import { FileSystemNode } from '../../types';
import CodeEditor from '../editors/CodeEditor';
import EditorPlaceholder from '../editors/EditorPlaceholder';
import Welcome from '../editors/Welcome';

interface MainPanelProps {
  activeFile: FileSystemNode | null;
}

const MainPanel: React.FC<MainPanelProps> = ({ activeFile }) => {
  const renderEditor = () => {
    if (!activeFile) {
      return <Welcome />;
    }

    switch (activeFile.fileType) {
      case 'code':
      case 'document':
        return <CodeEditor file={activeFile} />;
      case 'image':
        return <EditorPlaceholder type="Image Editor" />;
      case 'video':
        return <EditorPlaceholder type="Video Editor" />;
      case 'pdf':
        return <EditorPlaceholder type="PDF Editor" />;
      case 'terminal':
          return <EditorPlaceholder type="Terminal" />;
      default:
        return <EditorPlaceholder type="Unsupported File" message={`Cannot open ${activeFile.name}`} />;
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-gray-900 overflow-hidden">
        {activeFile && (
            <div className="bg-gray-800 px-4 py-2 text-sm border-b border-gray-700">
                {activeFile.name}
            </div>
        )}
      <div className="flex-1 p-4 overflow-auto">
        {renderEditor()}
      </div>
    </div>
  );
};

export default MainPanel;
