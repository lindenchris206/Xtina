import React, { useState, useEffect, useRef } from 'react';
import type { GeneratedFile } from '../../types';
import { SaveIcon, SparklesIcon } from '../icons';
import { useMission } from '../../context/MissionContext';

interface WordProcessorProps {
    file: GeneratedFile;
    onSave: (filename: string, newContent: string) => void;
}

export const WordProcessor: React.FC<WordProcessorProps> = ({ file, onSave }) => {
    const { injectTask } = useMission();
    const editorRef = useRef<HTMLDivElement>(null);
    const [isDirty, setIsDirty] = useState(false);

    useEffect(() => {
        if (editorRef.current) {
            // This is a simple way to handle HTML content. A real-world app might need sanitization.
            editorRef.current.innerHTML = file.content;
            setIsDirty(false);
        }
    }, [file]);

    const handleSave = () => {
        if (editorRef.current) {
            onSave(file.filename, editorRef.current.innerHTML);
            setIsDirty(false);
        }
    };
    
    const execCmd = (command: string) => {
        document.execCommand(command, false, undefined);
        editorRef.current?.focus();
        setIsDirty(true);
    };
    
    const handleAiTask = (taskDescription: string) => {
        injectTask({
            member: 'Isabella',
            task: `${taskDescription} for the document '${file.filename}'. The output should be the improved text.`,
            priority: 2,
            dependencies: [],
        });
    };

    const handleInput = () => {
        if (!isDirty) setIsDirty(true);
    };

    return (
        <div className="flex flex-col h-full bg-gray-100 text-gray-900">
            <div className="flex-shrink-0 p-2 bg-gray-200 border-b border-gray-300 flex justify-between items-center text-sm flex-wrap gap-2">
                <div className="flex items-center gap-2">
                    <span className="font-bold mr-2">Formatting</span>
                    <button onClick={() => execCmd('bold')} className="px-2 py-1 font-bold">B</button>
                    <button onClick={() => execCmd('italic')} className="px-2 py-1 italic">I</button>
                    <button onClick={() => execCmd('underline')} className="px-2 py-1 underline">U</button>
                    <div className="h-4 w-px bg-gray-400 mx-1"></div>
                    <button onClick={() => execCmd('insertUnorderedList')} className="px-2 py-1">UL</button>
                    <button onClick={() => execCmd('insertOrderedList')} className="px-2 py-1">OL</button>
                </div>
                <div className="flex items-center gap-2">
                    <span className="font-bold mr-2 text-indigo-600">AI Tools</span>
                    <button onClick={() => handleAiTask('Improve the writing')} className="flex items-center gap-1.5 px-2 py-1 text-xs bg-indigo-500 hover:bg-indigo-600 text-white rounded-md"><SparklesIcon/> Improve Writing</button>
                    <button onClick={() => handleAiTask('Summarize the content')} className="flex items-center gap-1.5 px-2 py-1 text-xs bg-indigo-500 hover:bg-indigo-600 text-white rounded-md"><SparklesIcon/> Summarize</button>
                </div>
                 <button onClick={handleSave} disabled={!isDirty} className="flex items-center gap-1.5 px-3 py-1 text-xs bg-blue-600 hover:bg-blue-500 text-white rounded-md transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed">
                    <SaveIcon />
                    Save Changes
                </button>
            </div>
            <div 
                ref={editorRef}
                onInput={handleInput}
                contentEditable={true}
                className="flex-grow p-4 overflow-y-auto focus:outline-none scrollbar-thin"
                style={{ caretColor: 'black' }}
            />
        </div>
    );
};