import React, { useState, useEffect, useRef } from 'react';
import { useMission } from '../context/MissionContext';
import { useDraggable } from '../hooks/useDraggable';
import type { CrewMember } from '../types';
import { LoadingIcon, SearchIcon, SendIcon, MicrophoneIcon } from './icons';

// Check for SpeechRecognition API
const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
const isSpeechRecognitionSupported = !!SpeechRecognition;

interface AstraAssistantWidgetProps {
    avatar: React.ComponentType<{ isTalking?: boolean }>;
}

export const AstraAssistantWidget: React.FC<AstraAssistantWidgetProps> = ({ avatar: AvatarComponent }) => {
    const { ref, position, onMouseDown } = useDraggable();
    const { appState, processUserCommand, activeCrew, settings } = useMission();
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
            recognition.stop();
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

    const isAstraThinking = appState.messages[appState.messages.length - 1]?.isLoading || false;
    const isAstra = settings.astraAvatar === 'Astra';

    return (
        <div
            ref={ref}
            style={{ top: position.y, left: position.x }}
            className="fixed z-50 glassmorphism rounded-xl shadow-2xl shadow-purple-500/20 w-80 border border-purple-500/30"
        >
            <div 
                className="flex items-center p-3 cursor-grab astra-avatar-idle"
                onMouseDown={onMouseDown}
            >
                <div className="w-16 h-16">
                    <div className={isAstraThinking ? 'astra-avatar-talking' : 'astra-avatar-idle'}>
                        <AvatarComponent {...(isAstra && { isTalking: isAstraThinking })} />
                    </div>
                </div>
                <h3 className="ml-3 font-orbitron text-lg text-purple-300">Astra</h3>
            </div>
            <div className="p-3 border-t border-white/10 space-y-2">
                 <form onSubmit={handleCommandSubmit}>
                    <div className="relative flex items-center gap-1">
                         <input
                            type="text"
                            value={commandInput}
                            onChange={(e) => setCommandInput(e.target.value)}
                            placeholder={isListening ? "Listening..." : "Your command, Commander..."}
                            className="w-full bg-gray-900/50 border border-white/20 rounded-md pl-4 pr-10 py-2 text-sm focus:ring-cyan-500 focus:border-cyan-500"
                            disabled={isProcessing}
                        />
                        <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1">
                            <button type="button" onClick={toggleListening} className={`p-1.5 rounded-md transition-colors ${isListening ? 'bg-red-600 animate-pulse' : 'bg-gray-700 hover:bg-gray-600'}`}>
                                <MicrophoneIcon />
                            </button>
                            <button type="submit" className="p-1.5 rounded-md bg-gray-700 hover:bg-gray-600 disabled:opacity-50" disabled={isProcessing || !commandInput.trim()}>
                                {isProcessing ? <LoadingIcon/> : <SendIcon />}
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
                            placeholder="Web Search..."
                            className="w-full bg-gray-900/50 border border-white/20 rounded-md pl-4 pr-10 py-2 text-xs focus:ring-indigo-500 focus:border-indigo-500"
                        />
                         <button type="submit" className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400">
                           <SearchIcon />
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};