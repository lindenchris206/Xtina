import React, { useState, useMemo } from 'react';
import { useMission } from '../context/MissionContext';
import type { CrewMember, CrewMemberStatus } from '../types';
import { XpIcon } from './icons';

const parseKnowledgeBase = (kb: string) => {
    return kb.split('\n').filter(line => line.trim() !== '').map(line => {
        const match = line.match(/\*\*(.*?):\*\*\s*(.*)/);
        if (match) {
            return { type: 'header' as const, title: match[1], content: match[2] };
        }
        return { type: 'item' as const, content: line };
    });
};

const CrewDetailPanel: React.FC<{ member: CrewMember, status: CrewMemberStatus }> = ({ member, status }) => {
    const [activeTab, setActiveTab] = useState<'skills' | 'knowledge'>('skills');
    const parsedSkills = useMemo(() => parseKnowledgeBase(member.knowledgeBase), [member.knowledgeBase]);

    const xpForNextLevel = 100 * Math.pow(2, status.level - 1);
    const xpProgress = (status.xp / xpForNextLevel) * 100;

    return (
        <div className="flex flex-col h-full">
            <div className="p-4 border-b border-white/10 flex-shrink-0">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 text-cyan-400 flex-shrink-0">{member.icon}</div>
                    <div>
                        <h2 className="text-2xl font-orbitron text-cyan-300">{member.name}</h2>
                        <p className="text-indigo-300">{member.specialty}</p>
                    </div>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-3 text-xs text-center">
                    <div className="bg-gray-900/50 p-2 rounded">
                        <p className="font-bold text-gray-300">{member.secondarySpecialty}</p>
                        <p className="text-gray-500">Secondary</p>
                    </div>
                    <div className="bg-gray-900/50 p-2 rounded">
                        <p className="font-bold text-gray-300">{member.personality}</p>
                        <p className="text-gray-500">Personality</p>
                    </div>
                    <div className="bg-gray-900/50 p-2 rounded">
                        <p className="font-bold text-gray-300 truncate">{member.simulatedModel}</p>
                        <p className="text-gray-500">Model</p>
                    </div>
                </div>
                <div className="mt-3">
                     <div className="flex items-center gap-2 text-sm text-yellow-300 font-semibold mb-1">
                         <span className="w-4 h-4"><XpIcon/></span> Level {status.level}
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2.5" title={`XP: ${status.xp} / ${xpForNextLevel}`}>
                        <div className="bg-yellow-400 h-2.5 rounded-full" style={{ width: `${xpProgress}%` }}></div>
                    </div>
                </div>
            </div>
            
            <div className="flex-shrink-0 border-b border-white/10">
                <button onClick={() => setActiveTab('skills')} className={`px-4 py-2 text-sm ${activeTab === 'skills' ? 'text-cyan-300 bg-gray-900/50' : 'text-gray-400'}`}>Foundational Skills</button>
                <button onClick={() => setActiveTab('knowledge')} className={`px-4 py-2 text-sm ${activeTab === 'knowledge' ? 'text-cyan-300 bg-gray-900/50' : 'text-gray-400'}`}>Learned Knowledge</button>
            </div>

            <div className="flex-grow p-4 overflow-y-auto scrollbar-thin">
                {activeTab === 'skills' ? (
                    <div className="space-y-3">
                        {parsedSkills.map((item, index) => {
                             if (item.type === 'header') {
                                return (
                                    <div key={index}>
                                        <h4 className="font-bold text-indigo-300">{item.title}:</h4>
                                        <p className="text-sm text-gray-300 pl-2">{item.content}</p>
                                    </div>
                                );
                            }
                            return <p key={index} className="text-sm text-gray-400">{item.content}</p>;
                        })}
                    </div>
                ) : (
                    <pre className="text-xs whitespace-pre-wrap font-mono text-gray-300">{member.knowledgeBase}</pre>
                )}
            </div>
        </div>
    );
};

export const RosterView: React.FC = () => {
    const { settings, appState } = useMission();
    const [selectedMember, setSelectedMember] = useState<CrewMember>(settings.crewConfig[0]);

    const crewList = settings.crewConfig;

    if (!selectedMember) {
        return <div className="p-6 text-center text-gray-500">No crew configured.</div>;
    }

    return (
        <div className="glassmorphism rounded-xl h-full flex">
            <div className="w-1/3 max-w-sm border-r border-white/10 p-2 overflow-y-auto scrollbar-thin">
                 <h3 className="text-xl font-orbitron text-indigo-300 p-2">Crew Roster</h3>
                 <div className="space-y-1">
                     {crewList.map(member => (
                         <button 
                             key={member.name}
                             onClick={() => setSelectedMember(member)}
                             className={`w-full flex items-center gap-3 p-2 rounded-md text-left transition-colors ${selectedMember.name === member.name ? 'bg-indigo-600/50' : 'hover:bg-gray-700/50'}`}
                         >
                            <span className="w-8 h-8 text-cyan-400 flex-shrink-0">{member.icon}</span>
                            <div>
                                <p className="font-semibold text-sm">{member.name}</p>
                                <p className="text-xs text-gray-400 truncate">{member.specialty}</p>
                            </div>
                         </button>
                     ))}
                 </div>
            </div>
            <div className="w-2/3">
                <CrewDetailPanel 
                    member={selectedMember} 
                    status={appState.crewStatuses[selectedMember.name] || { status: 'idle', progress: 0, xp: 0, level: 1 }}
                />
            </div>
        </div>
    );
};