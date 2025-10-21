import React, { useState } from 'react';
import { Task } from '../types';
import { TimelineIcon } from './icons';

interface RightSidebarProps {
  tasks: Task[];
}

const FileUploader: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [status, setStatus] = useState('');

    const handleUpload = async () => {
        if (!file) return;
        setStatus('Uploading...');
        const formData = new FormData();
        formData.append('file', file);
        try {
            // Use relative path for API endpoint to fix "Failed to fetch" errors.
            const res = await fetch('/api/file/upload', {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            if (res.ok) {
                setStatus(`Success! Saved as ${data.savedAs}`);
            } else {
                throw new Error(data.error || 'Upload failed');
            }
        } catch (err: any) {
            setStatus(`Error: ${err.message}`);
        }
    };

    return (
        <div className="text-sm">
            <h2 className="font-bold text-brand-text mb-3">File Manager</h2>
            <div className="bg-white/5 p-3 rounded-lg">
                <input 
                    type="file" 
                    onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                    className="text-xs text-brand-muted file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-brand-accent/20 file:text-brand-accent hover:file:bg-brand-accent/30"
                />
                <button 
                    onClick={handleUpload} 
                    disabled={!file}
                    className="w-full bg-brand-accent text-white py-2 mt-3 rounded-lg font-bold text-sm hover:bg-opacity-90 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
                >
                    Upload
                </button>
                {status && <p className="text-xs text-brand-muted mt-2">{status}</p>}
            </div>
        </div>
    );
};

const TasksPanel: React.FC<{ tasks: Task[] }> = ({ tasks }) => {
    return (
        <div className="text-sm">
            <h2 className="font-bold text-brand-text mb-3">Tasks</h2>
            <ul className="space-y-2">
                {tasks.slice().reverse().map(task => (
                    <li key={task.id} className="bg-white/5 p-2 rounded-md">
                        <p className="font-medium text-brand-text truncate">{task.title || `Task ${task.id}`}</p>
                        <p className="text-xs text-brand-muted">Agent: {task.assignedAgent || 'N/A'}</p>
                        <p className={`text-xs font-mono ${task.status === 'done' ? 'text-green-400' : 'text-amber-400'}`}>
                            {task.status}
                        </p>
                    </li>
                ))}
                {tasks.length === 0 && <p className="text-xs text-brand-muted">No active tasks.</p>}
            </ul>
        </div>
    );
};


export const RightSidebar: React.FC<RightSidebarProps> = ({ tasks }) => {
  return (
    <div className="space-y-6">
      <FileUploader />
      <TasksPanel tasks={tasks} />
    </div>
  );
};