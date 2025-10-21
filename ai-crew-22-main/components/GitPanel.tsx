import React from 'react';
import type { GitState } from '../types';
import { GitBranchIcon } from './icons';

interface GitPanelProps {
  gitState: GitState;
}

export const GitPanel: React.FC<GitPanelProps> = ({ gitState }) => {
    
  if (!gitState.initialized) {
    return (
        <div className="bg-gray-900/70 p-4 rounded-md h-full flex items-center justify-center text-center">
            <div>
                <GitBranchIcon />
                <p className="text-sm text-gray-400 mt-2">Git repository not initialized.</p>
                <p className="text-xs text-gray-500">Click "Initialize Git Repo" in the header to start tracking changes.</p>
            </div>
        </div>
    );
  }

  return (
    <div className="bg-gray-900/70 p-2 rounded-md h-full overflow-y-auto scrollbar-thin flex flex-col">
      <div className="flex-shrink-0">
          <div>
            <h4 className="text-sm font-bold text-green-400 mb-1 px-2">Staged Changes ({gitState.staged.length})</h4>
            {gitState.staged.length > 0 ? (
                <ul className="text-xs space-y-1">
                    {gitState.staged.map(file => (
                        <li key={file} className="bg-green-900/30 px-2 py-1 rounded truncate">
                            <span className="text-green-300">A</span> {file}
                        </li>
                    ))}
                </ul>
            ) : <p className="text-xs text-gray-500 px-2">No changes staged.</p>}
          </div>

          <div className="mt-3">
            <h4 className="text-sm font-bold text-yellow-400 mb-1 px-2">Modified Files ({gitState.modified.length})</h4>
            {gitState.modified.length > 0 ? (
                <ul className="text-xs space-y-1">
                    {gitState.modified.map(file => (
                        <li key={file} className="bg-yellow-900/30 px-2 py-1 rounded truncate">
                            <span className="text-yellow-300">M</span> {file}
                        </li>
                    ))}
                </ul>
            ) : <p className="text-xs text-gray-500 px-2">No modified files.</p>}
          </div>
      </div>
      
      <div className="mt-3 pt-3 border-t border-gray-700 flex-grow min-h-0">
         <h4 className="text-sm font-bold text-cyan-400 mb-2 px-2">Commit History</h4>
         <div className="h-full overflow-y-auto scrollbar-thin pr-1">
             {gitState.commits.length > 0 ? (
                 <ul className="text-xs space-y-2">
                     {gitState.commits.map(commit => (
                         <li key={commit.hash} className="bg-gray-800/50 p-2 rounded">
                             <p className="font-mono text-cyan-300">commit {commit.hash}</p>
                             <p className="text-gray-300 my-1">{commit.message}</p>
                             <p className="text-gray-500">{new Date(commit.timestamp).toLocaleString()}</p>
                         </li>
                     ))}
                 </ul>
             ) : <p className="text-xs text-gray-500 px-2">No commits yet.</p>}
         </div>
      </div>

    </div>
  );
};