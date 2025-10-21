import React from 'react';

// FIX: Populating file with necessary content and logic.
interface CodeEditorProps {
  fileName: string | null;
  fileContent: string | null;
  onContentChange: (newContent: string) => void;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({ fileName, fileContent, onContentChange }) => {
  if (fileContent === null) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-900/70 rounded-md">
        <p className="text-gray-500">Select a file to view its content</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-900/70 rounded-md">
      <div className="bg-gray-800/50 p-2 rounded-t-md">
        <h4 className="text-sm font-mono text-cyan-300">{fileName}</h4>
      </div>
      <textarea
        value={fileContent || ''}
        onChange={(e) => onContentChange(e.target.value)}
        className="flex-grow w-full bg-transparent p-2 text-sm font-mono text-gray-300 resize-none focus:outline-none scrollbar-thin"
        spellCheck="false"
      />
    </div>
  );
};