import React, { useState } from 'react';
import { FileSystemNode } from '../../types';
import { mockFileSystem } from '../../data/mockFileSystem';
import { FolderIcon, FileIcon, ChevronDownIcon, ChevronRightIcon } from '../icons';

interface FileExplorerProps {
  onFileSelect: (file: FileSystemNode) => void;
}

const FileExplorer: React.FC<FileExplorerProps> = ({ onFileSelect }) => {
  return (
    <div className="p-2 h-full overflow-y-auto scrollbar-thin">
      <TreeNode node={mockFileSystem} onFileSelect={onFileSelect} defaultOpen />
    </div>
  );
};

const TreeNode: React.FC<{ node: FileSystemNode; onFileSelect: (file: FileSystemNode) => void; defaultOpen?: boolean }> = ({ node, onFileSelect, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const isFolder = node.type === 'folder';

  const handleToggle = () => {
    if (isFolder) {
      setIsOpen(!isOpen);
    } else {
      onFileSelect(node);
    }
  };

  return (
    <div className="text-sm">
      <div
        className="flex items-center p-1.5 rounded cursor-pointer hover:bg-gray-700"
        onClick={handleToggle}
      >
        {isFolder ? (
          <>
            {isOpen ? <ChevronDownIcon /> : <ChevronRightIcon />}
            <FolderIcon className="mx-1 text-indigo-400" />
          </>
        ) : (
          <FileIcon className="ml-5 mr-1 text-gray-400" />
        )}
        <span>{node.name}</span>
      </div>
      {isFolder && isOpen && (
        <div className="pl-4 border-l border-gray-700">
          {node.children?.map(child => (
            <TreeNode key={child.name} node={child} onFileSelect={onFileSelect} />
          ))}
        </div>
      )}
    </div>
  );
};

export default FileExplorer;
