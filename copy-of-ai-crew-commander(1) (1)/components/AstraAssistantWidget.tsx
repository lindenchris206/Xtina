/**
 * @author cel
 * @file components/AstraAssistantWidget.tsx
 * @description The draggable floating widget for interacting with Astra.
 */
import React, { useState, useEffect, useRef } from 'react';
import { useMission } from '../context/MissionContext';
import { useDraggable } from '../hooks/useDraggable';
import { LoadingIcon, SearchIcon, SendIcon, MicrophoneIcon, VolumeUpIcon, VolumeOffIcon } from './icons';

// Check for SpeechRecognition API
const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
const isSpeechRecognitionSupported = !!SpeechRecognition;

interface AstraAssistantWidgetProps {
    avatar: React.ComponentType<{ isTalking?: boolean }>;
    isTalking: boolean;
}

export const AstraAssistantWidget: React.FC<AstraAssistantWidgetProps> = ({ avatar: AvatarComponent, isTalking }) => {
    const { ref, position, onMouseDown } = useDraggable();
    const { appState, processUserCommand, activeCrew, settings, setSettings } = useMission();
    const [commandInput, setCommandInput] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [isListening, setIsListening] = useState(false);
    
    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        if (!isSpeechRecognitionSupported) {
            console.log("Speech recognition not supported by this browser.");
            return;
        }

        recognitionRef.current = new SpeechRecognition();
        const recognition = recognitionRef.current;
        recognition.continuous = false;
        recognition.lang = 'en-US';
        recognition.interimResults = false;

        recognition.onresult = (event: any) => {
            const transcript = event.results[event.results.length - 1][0].transcript.trim();
            setCommandInput(transcript);
            // Automatically submit after successful recognition
            if (transcript) {
                processUserCommand(transcript, activeCrew);
            }
            setIsListening(false);
        };

        recognition.onerror = (event: any) => {
            console.error('Speech recognition error', event.error);
            setIsListening(false);
        };
        
        recognition.onend = () => {
            if (isListening) {
                 // Restart if it stops prematurely
                recognition.start();
            }
        };

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, [isListening, activeCrew, processUserCommand]);

    const toggleListening = () => {
        if (!isSpeechRecognitionSupported) return;
        
        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
        } else {
            recognitionRef.current?.start();
            setIsListening(true);
        }
    };
    
    const toggleVoice = () => {
        setSettings(prev => ({ ...prev, enableVoice: !prev.enableVoice }));
    };

    const handleCommandSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!commandInput.trim() || isProcessing) return;
        
        setIsProcessing(true);
        await processUserCommand(commandInput, activeCrew);
        setCommandInput('');
        setIsProcessing(false);
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchInput.trim()) return;
        window.open(`https://www.google.com/search?q=${encodeURIComponent(searchInput)}`, '_blank');
        setSearchInput('');
    };

    return (
        <div
            ref={ref}
            style={{ top: position.y, left: position.x }}
            className="fixed z-50 glassmorphism rounded-xl shadow-2xl shadow-[rgba(var(--color-secondary-accent),0.2)] w-80 border border-[rgba(var(--color-primary-accent),0.3)]"
        >
            <div 
                className="flex items-center justify-between p-3"
            >
                <div className="flex items-center cursor-grab" onMouseDown={onMouseDown}>
                    <div className="w-16 h-16">
                        <AvatarComponent isTalking={isTalking} />
                    </div>
                    <h3 className="ml-3 font-orbitron text-lg text-[rgb(var(--color-text-header))]">{settings.astraAvatar}</h3>
                </div>
                <button
                    onClick={toggleVoice}
                    className="p-2 rounded-full hover:bg-white/10 transition-colors"
                    title={settings.enableVoice ? 'Mute Voice' : 'Unmute Voice'}
                >
                    <span className="w-5 h-5 block">
                        {settings.enableVoice ? <VolumeUpIcon /> : <VolumeOffIcon />}
                    </span>
                </button>
            </div>
            <div className="p-3 border-t border-white/10 space-y-2">
                 <form onSubmit={handleCommandSubmit}>
                    <div className="relative flex items-center gap-1">
                         <input
                            type="text"
                            value={commandInput}
                            onChange={(e) => setCommandInput(e.target.value)}
                            placeholder={isListening ? "Listening..." : "Your command, cel..."}
                            className="w-full bg-gray-900/50 border border-white/20 rounded-md pl-4 pr-10 py-2 text-sm focus:ring-cyan-500 focus:border-cyan-500"
                            disabled={isProcessing}
                        />
                        <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1">
                            <button type="button" onClick={toggleListening} className={`rounded-md transition-colors flex items-center justify-center w-6 h-6 ${isListening ? 'bg-red-600 animate-pulse' : 'bg-gray-700 hover:bg-gray-600'}`}>
                                <span className="w-4 h-4 block"><MicrophoneIcon /></span>
                            </button>
                            <button type="submit" className="rounded-md bg-gray-700 hover:bg-gray-600 transition-colors flex items-center justify-center w-6 h-6">
                                {/* FIX: The SendIcon component does not accept a className prop. It is now wrapped in a div with the required styles. */}
                                {isProcessing ? <LoadingIcon className="w-4 h-4" /> : <div className="w-4 h-4"><SendIcon /></div>}
                            </button>
                        </div>
                    </div>
                </form>
                 <form onSubmit={handleSearchSubmit}>
                    <div className="relative">
                         <input
                            type="text"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            placeholder="Search the web..."
                            className="w-full bg-gray-900/50 border border-white/20 rounded-md pl-4 pr-10 py-2 text-sm focus:ring-cyan-500 focus:border-cyan-500"
                        />
                         <button type="submit" className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-white">
                            <SearchIcon className="w-4 h-4" />
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};