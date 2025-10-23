import React, { useState } from 'react';
import { useMission } from '../context/MissionContext';
import { SaveIcon } from './icons';

// Basic markdown to HTML renderer
const renderMarkdown = (text: string) => {
    let html = text
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')
        .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/gim, '<em>$1</em>')
        .replace(/`([^`]+)`/gim, '<code>$1</code>')
        .replace(/^\* (.*$)/gim, '<ul>\n<li>$1</li>\n</ul>')
        .replace(/\n/g, '<br />');
    return html.replace(/<\/ul><br \/><ul>/g, ''); // Fix for multiple list items
}

export const KnowledgeBase: React.FC = () => {
    const { appState, updateKnowledgeBase } = useMission();
    const [isEditing, setIsEditing] = useState(false);
    const [content, setContent] = useState(appState.knowledgeBase);

    const handleSave = () => {
        updateKnowledgeBase(content);
        setIsEditing(false);
    };

    return (
        <div className="glassmorphism rounded-xl h-full flex flex-col">
            <div className="p-3 border-b border-white/10 flex justify-between items-center">
                <h3 className="text-2xl font-orbitron text-indigo-300">Project Knowledge Base</h3>
                {isEditing ? (
                    <button onClick={handleSave} className="flex items-center gap-2 px-3 py-1.5 text-sm bg-cyan-600 hover:bg-cyan-500 rounded-md">
                        <SaveIcon /> Save
                    </button>
                ) : (
                    <button onClick={() => setIsEditing(true)} className="px-3 py-1.5 text-sm bg-indigo-600 hover:bg-indigo-500 rounded-md">
                        Edit
                    </button>
                )}
            </div>
            <div className="flex-grow p-4 overflow-y-auto scrollbar-thin">
                {isEditing ? (
                    <textarea
                        value={content}
                        onChange={e => setContent(e.target.value)}
                        className="w-full h-full bg-gray-900/50 border border-white/10 rounded-md p-2 text-sm font-mono resize-none"
                    />
                ) : (
                    <div 
                        className="prose prose-invert prose-sm"
                        dangerouslySetInnerHTML={{ __html: renderMarkdown(appState.knowledgeBase) }}
                    />
                )}
            </div>
        </div>
    );
};