import React from 'react';
import type { ProjectFile } from '../types';
import { FileIcon, FolderIcon, ChevronDownIcon, ChevronRightIcon } from './icons';

interface FileManagerProps {
  files: ProjectFile[];
  onFileSelect: (file: ProjectFile) => void;
  selectedFilePath: string | null;
}

interface FileTreeProps {
  node: ProjectFile;
  onFileSelect: (file: ProjectFile) => void;
  selectedFilePath: string | null;
  level: number;
}

const FileTreeNode: React.FC<FileTreeProps> = ({ node, onFileSelect, selectedFilePath, level }) => {
  const [isOpen, setIsOpen] = React.useState(true);
  const isSelected = selectedFilePath === node.path;

  if (node.isFolder) {
    return (
      <div>
        <div 
          className="flex items-center cursor-pointer hover:bg-gray-700/50 px-2 py-1 rounded"
          style={{ paddingLeft: `${level * 1}rem` }}
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <ChevronDownIcon className="w-4 h-4 mr-1"/> : <ChevronRightIcon className="w-4 h-4 mr-1"/>}
          <FolderIcon className="w-4 h-4 mr-2 text-cyan-400"/>
          <span className="text-sm text-gray-300">{node.name}</span>
        </div>
        {isOpen && node.children && (
          <div>
            {node.children.map(child => (
              <FileTreeNode key={child.path} node={child} onFileSelect={onFileSelect} selectedFilePath={selectedFilePath} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div 
      className={`flex items-center cursor-pointer hover:bg-gray-700/50 px-2 py-1 rounded ${isSelected ? 'bg-cyan-900/50' : ''}`}
      style={{ paddingLeft: `${level * 1}rem` }}
      onClick={() => onFileSelect(node)}
    >
      <FileIcon className="w-4 h-4 mr-2 text-gray-400"/>
      <span className="text-sm text-gray-300">{node.name}</span>
    </div>
  );
};


export const FileManager: React.FC<FileManagerProps> = ({ files, onFileSelect, selectedFilePath }) => {
  return (
    <div className="bg-gray-900/70 p-2 rounded-md h-full overflow-y-auto scrollbar-thin">
      <h4 className="text-sm font-bold text-gray-400 mb-2 px-2">Project Files</h4>
      {files.map(file => (
        <FileTreeNode key={file.path} node={file} onFileSelect={onFileSelect} selectedFilePath={selectedFilePath} level={0} />
      ))}
    </div>
  );
};
