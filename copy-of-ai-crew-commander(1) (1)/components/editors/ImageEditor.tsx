import React, { useState, useRef, useEffect } from 'react';
import type { GeneratedFile } from '../../types';
import { useMission } from '../../context/MissionContext';
import { PaletteIcon, BrightnessIcon, ContrastIcon, GrayscaleIcon, SaveIcon, WandIcon } from '../icons';

interface ImageEditorProps {
    file: GeneratedFile;
    onContentChange: (filename: string, newContent: string) => void;
}

export const ImageEditor: React.FC<ImageEditorProps> = ({ file, onContentChange }) => {
    const { injectTask } = useMission();
    const [filters, setFilters] = useState({ brightness: 100, contrast: 100, grayscale: 0, sepia: 0, saturate: 100, invert: 0 });
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (canvas && ctx) {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.src = file.content;
            img.onload = () => {
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.filter = `brightness(${filters.brightness}%) contrast(${filters.contrast}%) grayscale(${filters.grayscale}%) sepia(${filters.sepia}%) saturate(${filters.saturate}%) invert(${filters.invert}%)`;
                ctx.drawImage(img, 0, 0);
            };
        }
    }, [file, filters]);

    const handleImageEditPrompt = (promptText: string) => {
        injectTask({
            member: 'Lyra',
            task: `${promptText} for the image '${file.filename}'.`,
            priority: 1,
            dependencies: [],
            imageInput: file.content,
        });
    };
    
    const saveChanges = () => {
        const canvas = canvasRef.current;
        if (canvas) {
            const dataUrl = canvas.toDataURL(file.mimeType);
            onContentChange(file.filename, dataUrl);
        }
    };

    return (
        <div className="w-full h-full flex items-stretch p-2 bg-gray-800/50 gap-2">
            <div className="flex-grow flex items-center justify-center w-full h-full overflow-hidden bg-black/30 rounded-lg">
                <canvas ref={canvasRef} className="max-w-full max-h-full object-contain" />
            </div>

            <div className="flex-shrink-0 w-64 p-3 glassmorphism rounded-lg flex flex-col gap-4">
                <h3 className="text-lg font-orbitron text-indigo-300">Image Controls</h3>
                
                <div className="space-y-3 text-xs">
                    <div className="flex items-center gap-2"><span className="w-4 h-4" title="Brightness"><BrightnessIcon /></span><input type="range" min="50" max="200" value={filters.brightness} onChange={e => setFilters(f => ({...f, brightness: +e.target.value}))} className="w-full" /><span className="w-10 text-right font-mono">{filters.brightness}%</span></div>
                    <div className="flex items-center gap-2"><span className="w-4 h-4" title="Contrast"><ContrastIcon /></span><input type="range" min="50" max="200" value={filters.contrast} onChange={e => setFilters(f => ({...f, contrast: +e.target.value}))} className="w-full" /><span className="w-10 text-right font-mono">{filters.contrast}%</span></div>
                    <div className="flex items-center gap-2"><span className="w-4 h-4" title="Grayscale"><GrayscaleIcon /></span><input type="range" min="0" max="100" value={filters.grayscale} onChange={e => setFilters(f => ({...f, grayscale: +e.target.value}))} className="w-full" /><span className="w-10 text-right font-mono">{filters.grayscale}%</span></div>
                    <div className="flex items-center gap-2"><span className="w-4 h-4" title="Sepia">🎨</span><input type="range" min="0" max="100" value={filters.sepia} onChange={e => setFilters(f => ({...f, sepia: +e.target.value}))} className="w-full" /><span className="w-10 text-right font-mono">{filters.sepia}%</span></div>
                    <div className="flex items-center gap-2"><span className="w-4 h-4" title="Saturate">💧</span><input type="range" min="0" max="200" value={filters.saturate} onChange={e => setFilters(f => ({...f, saturate: +e.target.value}))} className="w-full" /><span className="w-10 text-right font-mono">{filters.saturate}%</span></div>
                    <div className="flex items-center gap-2"><span className="w-4 h-4" title="Invert">🔄</span><input type="range" min="0" max="100" value={filters.invert} onChange={e => setFilters(f => ({...f, invert: +e.target.value}))} className="w-full" /><span className="w-10 text-right font-mono">{filters.invert}%</span></div>
                </div>

                <button onClick={() => setFilters({ brightness: 100, contrast: 100, grayscale: 0, sepia: 0, saturate: 100, invert: 0 })}
                    className="w-full px-3 py-1.5 text-xs bg-gray-700 hover:bg-gray-600 rounded-md transition-colors">
                    Reset Filters
                </button>
                
                <div className="border-t border-white/10 my-1" />
                
                <button onClick={saveChanges} className="w-full flex items-center justify-center gap-2 px-3 py-1.5 text-sm bg-cyan-600 hover:bg-cyan-500 rounded-md transition-colors shadow-lg"><span className="w-4 h-4"><SaveIcon /></span> Save Filter Changes</button>

                <div className="border-t border-white/10 my-1" />
                
                <h3 className="text-sm font-orbitron text-indigo-300">Premium AI Tools</h3>
                <div className="space-y-2">
                     <button onClick={() => handleImageEditPrompt('Remove the background')} className="w-full flex items-center justify-center gap-2 px-3 py-1.5 text-sm bg-pink-600 hover:bg-pink-500 rounded-md transition-colors shadow-lg"><span className="w-4 h-4"><WandIcon /></span> Remove Background</button>
                     <button onClick={() => handleImageEditPrompt('Upscale the image to 2x size')} className="w-full flex items-center justify-center gap-2 px-3 py-1.5 text-sm bg-pink-600 hover:bg-pink-500 rounded-md transition-colors shadow-lg"><span className="w-4 h-4"><WandIcon /></span> AI Upscale</button>
                     <button onClick={() => { const p = prompt(`Describe the changes you want Lyra to make to "${file.filename}":`); if (p) handleImageEditPrompt(p); }} className="w-full flex items-center justify-center gap-2 px-3 py-1.5 text-sm bg-gray-700 hover:bg-gray-600 rounded-md transition-colors"><span className="w-4 h-4"><PaletteIcon /></span> Custom Edit...</button>
                </div>
            </div>
        </div>
    );
};