import React, { useRef, useEffect } from 'react';
import type { Message } from '../types';
import { UserIcon, LoadingIcon, FileIcon } from './icons';
import { TaskListView } from './TaskListView';
import { MissionDebriefView } from './MissionDebriefView';
import { useMission } from '../context/MissionContext';
import { AVATARS } from './avatars';

const useSmoothScroll = (dep: any) => {
    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (ref.current) {
            ref.current.scrollTo({
                top: ref.current.scrollHeight,
                behavior: 'smooth',
            });
        }
    }, [dep]);
    return ref;
};

export const CommanderLog: React.FC = () => {
    const { appState, addSpecialCommand, settings } = useMission();
    const { messages } = appState;
    const messageListRef = useSmoothScroll(messages);
    
    const AvatarComponent = AVATARS[settings.astraAvatar]?.component || AVATARS['Astra'].component;

    const handleSkipTask = () => {
        addSpecialCommand({ type: 'SKIP_TASK', issuedBy: 'user' });
    };

    const renderMessageContent = (msg: Message) => {
        const textParts = msg.text.split(/(\*\*.*?\*\*|\*.*?\*)/g).map((part, index) => {
            if (part.startsWith('**') && part.endsWith('**')) return <strong key={index}>{part.slice(2, -2)}</strong>;
            if (part.startsWith('*') && part.endsWith('*')) return <em key={index}>{part.slice(1, -1)}</em>;
            return part.split(/(\n)/g).map((line, lineIndex) => line === '\n' ? <br key={`${index}-${lineIndex}`} /> : line);
        });

        return (
            <>
                <div className="flex items-center gap-2">
                    <p className="text-sm whitespace-pre-wrap">{textParts}</p>
                    {msg.isLoading && <LoadingIcon />}
                </div>
                {msg.tasks && msg.tasks.length > 0 && <TaskListView tasks={msg.tasks} deliberation={msg.deliberation || []} />}
                {(msg.isPlanApproval) && (
                    <div className="mt-4 text-center text-xs text-yellow-300">
                        <p>Plan is awaiting your approval, Commander.</p>
                        <p>Use the floating widget to issue the 'approve' command.</p>
                    </div>
                )}
                {msg.missionDebrief && <MissionDebriefView debrief={msg.missionDebrief} />}
                {msg.failedTask && (
                     <div className="mt-4">
                        <button onClick={handleSkipTask} className="bg-yellow-600 hover:bg-yellow-500 text-white font-bold py-2 px-4 rounded transition-colors w-full">
                            Skip Failed Task
                        </button>
                    </div>
                )}
            </>
        );
    };

    const isAstraCurrentlySpeaking = messages.length > 0 && messages[messages.length - 1].isLoading && messages[messages.length - 1].sender === 'astra';
    const isAstra = settings.astraAvatar === 'Astra';

    return (
        <div className="glassmorphism rounded-xl shadow-2xl flex flex-row h-full items-center p-4 gap-4">
            <div className="w-48 h-48 flex-shrink-0">
                <div className={isAstraCurrentlySpeaking ? 'astra-avatar-talking' : 'astra-avatar-idle'}>
                    <AvatarComponent {...(isAstra && { isTalking: isAstraCurrentlySpeaking })} />
                </div>
            </div>
            <div ref={messageListRef} className="flex-1 self-stretch space-y-4 overflow-y-auto scrollbar-thin pr-2">
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex items-start gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                        {msg.sender === 'crew' && <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center p-2 text-indigo-300">{msg.senderIcon}</div>}
                        
                        <div className={`max-w-xl p-3 rounded-lg ${
                            msg.isError ? 'bg-red-800/80 border border-red-500' :
                            msg.sender === 'user' ? 'bg-indigo-600' : 
                            'bg-gray-700/80 border border-white/10'
                        }`}>
                            {msg.sender === 'crew' && <p className="font-bold text-xs text-indigo-300 mb-1">{msg.senderName}</p>}
                            {renderMessageContent(msg)}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};