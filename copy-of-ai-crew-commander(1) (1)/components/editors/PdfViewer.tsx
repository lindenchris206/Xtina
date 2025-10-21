import React from 'react';
import type { GeneratedFile } from '../../types';
import { useMission } from '../../context/MissionContext';
import { FileTextIcon, SparklesIcon } from '../icons';

interface PdfViewerProps {
    file: GeneratedFile;
}

export const PdfViewer: React.FC<PdfViewerProps> = ({ file }) => {
    const { injectTask } = useMission();

    const handlePdfAction = (prompt: string) => {
        injectTask({
            member: 'Eridanus',
            task: `${prompt} for the PDF file '${file.filename}'.`,
            priority: 1,
            dependencies: [],
        });
    };

    return (
        <div className="relative w-full h-full flex flex-col">
            <div className="flex-shrink-0 p-2 bg-gray-800 text-center text-sm text-gray-300">
                Viewing: {file.filename}
            </div>
            <iframe 
                src={file.content} 
                title={file.filename} 
                className="w-full h-full border-0" 
            />
            <div className="absolute bottom-2 left-2 right-2 flex items-center justify-center gap-2 p-2 glassmorphism rounded-lg">
                <button 
                    onClick={() => handlePdfAction('Extract all text content')}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-500 rounded-md transition-colors shadow-lg"
                    title="Extract Text">
                    <span className="w-4 h-4"><FileTextIcon /></span> Extract Text
                </button>
                <button 
                    onClick={() => { const p = window.prompt(`What analysis should Eridanus perform on "${file.filename}"? (e.g., summarize, extract key points)`); if (p) handlePdfAction(p); }}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm bg-red-700 hover:bg-red-600 rounded-md transition-colors shadow-lg"
                    title="Perform Custom Analysis">
                    <span className="w-4 h-4"><SparklesIcon /></span> Analyze...
                </button>
            </div>
        </div>
    );
};