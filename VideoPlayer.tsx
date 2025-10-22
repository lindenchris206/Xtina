import React from 'react';
import type { GeneratedFile } from '../../types';
import { useMission } from '../../context/MissionContext';
import { VideoIcon, FileTextIcon, SparklesIcon } from '../icons';

interface VideoPlayerProps {
    file: GeneratedFile;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ file }) => {
    const { injectTask } = useMission();

    const handleVideoTask = (taskDescription: string, member: string = 'Caelus') => {
        injectTask({
            member: member,
            task: `${taskDescription} for the video file '${file.filename}'.`,
            priority: 1,
            dependencies: [],
        });
    };

    return (
        <div className="relative w-full h-full flex flex-col items-center justify-center p-2 bg-black">
            <video src={file.content} controls className="max-w-full max-h-full object-contain">
                Your browser does not support the video tag.
            </video>
            <div className="absolute bottom-2 left-2 right-2 flex items-center justify-center gap-2 p-2 glassmorphism rounded-lg">
                <button 
                    onClick={() => handleVideoTask('Generate a compelling thumbnail image')}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm bg-purple-600 hover:bg-purple-500 rounded-md transition-colors shadow-lg"
                    title="Generate Thumbnail">
                    <span className="w-4 h-4"><SparklesIcon /></span> Thumbnail
                </button>
                 <button 
                    onClick={() => handleVideoTask('Transcribe the audio content', 'Eridanus')}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-500 rounded-md transition-colors shadow-lg"
                    title="Transcribe Audio">
                    <span className="w-4 h-4"><FileTextIcon /></span> Transcribe
                </button>
                <button 
                    onClick={() => handleVideoTask('Summarize the video content', 'Eridanus')}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-500 rounded-md transition-colors shadow-lg"
                    title="Summarize Video">
                    <span className="w-4 h-4"><FileTextIcon /></span> Summary
                </button>
                <button 
                    onClick={() => { const p = prompt(`Describe edits for Caelus to apply to "${file.filename}":`); if (p) handleVideoTask(p); }}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-700 hover:bg-gray-600 rounded-md transition-colors shadow-lg"
                    title="Request Custom Edit">
                    <span className="w-4 h-4"><VideoIcon /></span> Custom Edit...
                </button>
            </div>
        </div>
    );
};