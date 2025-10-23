import React, { useState, useEffect, useRef } from 'react';
import type { CrewMember } from '../types';
import { useMission } from '../context/MissionContext';
import { SendIcon, LoadingIcon } from './icons';

// Basic markdown to HTML renderer
const renderMarkdown = (text: string) => {
    if (!text) return '';
    let html = text
        .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mt-2 text-indigo-300">$1</h3>')
        .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold mt-3 text-cyan-300">$1</h2>')
        .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-4 text-cyan-200">$1</h1>')
        .replace(/\*\*(.*?)\*\*/gim, '<strong class="text-white">$1</strong>')
        .replace(/\*(.*?)\*/gim, '<em>$1</em>')
        .replace(/`([^`]+)`/gim, '<code class="text-xs bg-gray-900 px-1 py-0.5 rounded">$1</code>')
        .replace(/^\* (.*$)/gim, '<ul>\n<li class="ml-4 list-disc">$1</li>\n</ul>')
        .replace(/\n/g, '<br />');
    return html.replace(/<\/ul><br \/><ul>/g, ''); // Fix for multiple list items
}

const KnowledgeBaseViewer: React.FC<{ member: CrewMember }> = ({ member }) => {
    return (
        <div className="flex flex-col h-full">
            <div className="p-3 border-b border-white/10">
                 <h3 className="text-lg font-orbitron text-indigo-300">Knowledge Base</h3>
                 <p className="text-xs text-gray-400">Learnings for {member.name}</p>
            </div>
            <div 
                className="p-4 flex-grow overflow-y-auto scrollbar-thin text-sm text-gray-300"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(member.knowledgeBase) }}
            />
        </div>
    )
}

export const CrewChat: React.FC<{ activeCrew: CrewMember[] }> = ({ activeCrew }) => {
    const { appState, sendMessageToCrew, setActiveCommsChannel } = useMission();
    const [selectedMember, setSelectedMember] = useState<CrewMember>(
        activeCrew.find(m => m.name === appState.activeCommsChannel) || activeCrew[0]
    );
    const [message, setMessage] = useState('');
    const chatLogRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const member = activeCrew.find(m => m.name === appState.activeCommsChannel);
        if (member) {
            setSelectedMember(member);
        } else if (activeCrew.length > 0) {
            // Fallback to the first crew member if the active channel is invalid
            setSelectedMember(activeCrew[0]);
        }
    }, [appState.activeCommsChannel, activeCrew]);

    const chatHistory = appState.crewChat[selectedMember.name] || [];

    useEffect(() => {
        if (chatLogRef.current) {
            chatLogRef.current.scrollTop = chatLogRef.current.scrollHeight;
        }
    }, [chatHistory]);
    
    const handleMemberSelect = (member: CrewMember) => {
        setSelectedMember(member);
        setActiveCommsChannel(member.name);
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim()) return;
        sendMessageToCrew(selectedMember.name, message);
        setMessage('');
    };

    if (!selectedMember) {
        return (
            <div className="glassmorphism rounded-xl h-full flex items-center justify-center">
                <p className="text-gray-400">No active crew members available for communication.</p>
            </div>
        );
    }

    return (
        <div className="glassmorphism rounded-xl h-full flex">
            <div className="w-1/4 max-w-xs border-r border-white/10 p-2">
                <h3 className="text-lg font-orbitron text-indigo-300 p-2">Direct Comms</h3>
                <div className="space-y-1">
                    {activeCrew.map(member => (
                        <button 
                            key={member.name}
                            onClick={() => handleMemberSelect(member)}
                            className={`w-full flex items-center gap-3 p-2 rounded-md text-left transition-colors ${selectedMember.name === member.name ? 'bg-indigo-600/50' : 'hover:bg-gray-700/50'}`}
                        >
                            <span className="w-6 h-6 text-cyan-400">{member.icon}</span>
                            <div>
                                <p className="font-semibold text-sm">{member.name}</p>
                                <p className="text-xs text-gray-400">{member.specialty}</p>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
            <div className="w-1/2 flex flex-col border-r border-white/10">
                <div className="p-3 border-b border-white/10 flex items-center gap-3">
                    <span className="w-8 h-8 text-cyan-400">{selectedMember.icon}</span>
                    <div>
                        <h3 className="text-lg font-semibold">{selectedMember.name}</h3>
                        <p className="text-sm text-gray-400">{selectedMember.personality}</p>
                    </div>
                </div>
                <div ref={chatLogRef} className="flex-grow p-4 space-y-4 overflow-y-auto scrollbar-thin">
                    {chatHistory.map(msg => (
                        <div key={msg.id} className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                            {msg.sender !== 'user' && (
                                <div className="w-8 h-8 text-cyan-400 flex-shrink-0">{selectedMember.icon}</div>
                            )}
                             <div className={`max-w-xl p-3 rounded-lg text-sm ${
                                msg.sender === 'user' ? 'bg-indigo-600' : 'bg-gray-800'
                            }`}>
                                <p className="whitespace-pre-wrap">{msg.text}</p>
                                {msg.isLoading && <LoadingIcon />}
                            </div>
                        </div>
                    ))}
                </div>
                <div className="p-3 border-t border-white/10">
                    <form onSubmit={handleSubmit} className="relative">
                        <input
                            type="text"
                            value={message}
                            onChange={e => setMessage(e.target.value)}
                            placeholder={`Message ${selectedMember.name}...`}
                            className="w-full bg-gray-900/50 border border-white/20 rounded-md pl-4 pr-12 py-2 text-sm"
                        />
                        <button type="submit" className="absolute inset-y-0 right-0 flex items-center pr-3 text-cyan-400 hover:text-cyan-300">
                            <SendIcon/>
                        </button>
                    </form>
                </div>
            </div>
            <div className="w-1/2">
                <KnowledgeBaseViewer member={selectedMember} />
            </div>
        </div>
    );
};