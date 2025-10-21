import React from 'react';
import { MissionAction, Email, CommsState } from '../../types';
import { BrainIcon, FileTextIcon } from '../icons';

interface EmailViewProps {
    selectedEmail: Email | null;
    isComposing: boolean;
    composeFields: CommsState['composeFields'];
    dispatch: React.Dispatch<MissionAction>;
}

export const EmailView: React.FC<EmailViewProps> = ({ selectedEmail, isComposing, composeFields, dispatch }) => {
    
    const handleAiDraftReply = () => {
        if (!selectedEmail) return;
        dispatch({ type: 'ADD_EVENT', payload: { type: 'info', agent: 'Vela', message: 'Analyzing request and drafting a reply...', timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) } });
        dispatch({ type: 'COMMS_START_COMPOSE', payload: { mode: 'reply', email: selectedEmail } });
        
        setTimeout(() => {
            const aiReply = `Hi ${selectedEmail.from.name},\n\nThanks for reaching out. I've reviewed your message regarding "${selectedEmail.subject}".\n\n[Your thoughts here...]\n\nBest regards,\nChris`;
            dispatch({ type: 'COMMS_UPDATE_COMPOSE_FIELD', payload: { field: 'body', value: aiReply }});
            dispatch({ type: 'ADD_EVENT', payload: { type: 'success', agent: 'Vela', message: 'Reply draft generated.', timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) } });
        }, 1500);
    };

    const handleAiImproveWriting = () => {
        dispatch({ type: 'ADD_EVENT', payload: { type: 'info', agent: 'Eridanus', message: 'Refining text for clarity and impact...', timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) } });
        
        setTimeout(() => {
            const improvedText = composeFields.body.replace(/\b(Thanks)\b/gi, 'Thank you for your correspondence') + "\n\n(Text refined by Eridanus)";
            dispatch({ type: 'COMMS_UPDATE_COMPOSE_FIELD', payload: { field: 'body', value: improvedText } });
            dispatch({ type: 'ADD_EVENT', payload: { type: 'success', agent: 'Eridanus', message: 'Text improved.', timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) } });
        }, 1500);
    }

    const renderViewer = () => {
        if (!selectedEmail) return (
            <div className="h-full flex items-center justify-center text-center">
                <div>
                    <FileTextIcon className="mx-auto w-12 h-12 text-gray-600" />
                    <p className="text-gray-500 mt-2">Select an email to read</p>
                </div>
            </div>
        );

        return (
            <div className="h-full flex flex-col">
                <header className="p-4 border-b border-white/10 flex-shrink-0">
                    <h2 className="text-lg font-bold text-gray-200">{selectedEmail.subject}</h2>
                    <div className="text-xs text-gray-400 mt-2">
                        <p><strong>From:</strong> {selectedEmail.from.name} &lt;{selectedEmail.from.email}&gt;</p>
                        <p><strong>To:</strong> {selectedEmail.to.map(t => t.email).join(', ')}</p>
                        <p><strong>Date:</strong> {new Date(selectedEmail.timestamp).toLocaleString()}</p>
                    </div>
                </header>
                 <div className="flex-grow p-4 overflow-y-auto scrollbar-thin text-sm text-gray-300 whitespace-pre-wrap">
                    {selectedEmail.body}
                </div>
                <footer className="p-3 border-t border-white/10 flex-shrink-0 flex gap-2">
                     <button
                        onClick={() => dispatch({ type: 'COMMS_START_COMPOSE', payload: { mode: 'reply', email: selectedEmail }})}
                        className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded transition-colors"
                    >
                        Reply
                    </button>
                    <button
                        onClick={handleAiDraftReply}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded transition-colors"
                    >
                        <BrainIcon className="w-4 h-4" /> AI Draft Reply
                    </button>
                </footer>
            </div>
        );
    };

    const renderComposer = () => {
        return (
            <div className="h-full flex flex-col">
                 <header className="p-4 border-b border-white/10 flex-shrink-0">
                    <input 
                        type="text"
                        placeholder="To"
                        value={composeFields.to}
                        onChange={(e) => dispatch({ type: 'COMMS_UPDATE_COMPOSE_FIELD', payload: { field: 'to', value: e.target.value } })}
                        className="w-full bg-transparent text-sm text-gray-300 focus:outline-none pb-2 border-b border-gray-600"
                    />
                     <input 
                        type="text"
                        placeholder="Subject"
                        value={composeFields.subject}
                        onChange={(e) => dispatch({ type: 'COMMS_UPDATE_COMPOSE_FIELD', payload: { field: 'subject', value: e.target.value } })}
                        className="w-full bg-transparent text-sm text-gray-200 font-bold focus:outline-none pt-2"
                    />
                 </header>
                 <div className="flex-grow p-2">
                    <textarea 
                        placeholder="Compose your message..."
                        value={composeFields.body}
                        onChange={(e) => dispatch({ type: 'COMMS_UPDATE_COMPOSE_FIELD', payload: { field: 'body', value: e.target.value } })}
                        className="w-full h-full bg-transparent text-sm text-gray-300 resize-none focus:outline-none p-2 scrollbar-thin"
                    />
                </div>
                <footer className="p-3 border-t border-white/10 flex-shrink-0 flex justify-between">
                     <div className="flex gap-2">
                        <button
                            onClick={() => dispatch({ type: 'COMMS_SEND_EMAIL' })}
                            className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded transition-colors"
                        >
                            Send
                        </button>
                        <button
                            onClick={() => dispatch({ type: 'COMMS_DISCARD_COMPOSE' })}
                            className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded transition-colors"
                        >
                            Discard
                        </button>
                     </div>
                     <button
                        onClick={handleAiImproveWriting}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded transition-colors"
                    >
                        <BrainIcon className="w-4 h-4" /> AI Improve
                    </button>
                </footer>
            </div>
        )
    };

    return (
        <div className="glassmorphism rounded-xl h-full">
            {isComposing ? renderComposer() : renderViewer()}
        </div>
    );
};
