import React, { useState } from 'react';
import { FileSystemNode } from '../../types';

interface CodeEditorProps {
  file: FileSystemNode;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ file }) => {
  const [content, setContent] = useState(`// Displaying content for ${file.name}\n\nconsole.log("Hello, AI Crew Commander!");`);

  return (
    <textarea
      value={content}
      onChange={(e) => setContent(e.target.value)}
      className="w-full h-full bg-gray-800 text-gray-200 font-mono text-sm p-4 rounded-md focus:outline-none resize-none"
    />
  );
};

export default CodeEditor;
