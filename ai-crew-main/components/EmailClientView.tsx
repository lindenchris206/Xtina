import React, { useState, useMemo, useRef, useEffect } from 'react';
import { MOCK_EMAILS } from '../services/mockData';
import type { Email } from '../types';
import { InboxIcon, SendIcon, DraftsIcon, TrashIcon, ArchiveIcon, ReplyIcon, ComposeIcon, ClockIcon, XIcon, SearchIcon, SparklesIcon, LoadingIcon } from './icons';
import { categorizeEmail, draftEmailReply, summarizeEmail, findContactEmail } from '../services/geminiService';

const EmailComposeModal: React.FC<{
    email?: Partial<Email>;
    onClose: () => void;
    onSend: (email: Omit<Email, 'id' | 'date' | 'read' | 'tags' | 'folder'>) => void;
}> = ({ email, onClose, onSend }) => {
    const [recipient, setRecipient] = useState(email?.recipient || '');
    const [subject, setSubject] = useState(email?.subject || '');
    const [body, setBody] = useState(email?.body || '');
    const [fromAccount, setFromAccount] = useState(email?.account || 'work');
    const [isFindingEmail, setIsFindingEmail] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSend({
            sender: 'Commander',
            senderEmail: `commander@${fromAccount}.ai`,
            recipient,
            subject,
            body,
            account: fromAccount
        });
    };
    
    const handleFindEmail = async () => {
        const name = prompt("Enter the person's full name:");
        if (!name) return;
        const company = prompt("Enter their company (optional):");
        setIsFindingEmail(true);
        const foundEmail = await findContactEmail(name, company || undefined);
        setRecipient(foundEmail);
        setIsFindingEmail(false);
    }

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-2xl bg-gray-800 rounded-xl border border-white/20 flex flex-col glassmorphism">
                <div className="flex justify-between items-center p-3 border-b border-white/10">
                    <h3 className="text-lg font-orbitron text-indigo-300">Compose Message</h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10"><XIcon /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-4 flex-grow flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                         <label htmlFor="fromAccount" className="text-sm text-gray-400">From:</label>
                         <select id="fromAccount" value={fromAccount} onChange={e => setFromAccount(e.target.value)} className="bg-gray-900/50 border border-white/20 rounded-md px-2 py-1 text-sm">
                            <option value="work">Work</option>
                            <option value="gmail">Gmail</option>
                            <option value="yahoo">Yahoo</option>
                         </select>
                    </div>
                    <div className="relative">
                        <input type="email" value={recipient} onChange={e => setRecipient(e.target.value)} placeholder="To" required className="w-full bg-gray-900/50 border border-white/20 rounded-md px-3 py-2 text-sm pr-10" />
                        <button type="button" onClick={handleFindEmail} title="Find contact email with AI" className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-cyan-400">
                           {isFindingEmail ? <LoadingIcon/> : <SearchIcon />}
                        </button>
                    </div>
                    <input type="text" value={subject} onChange={e => setSubject(e.target.value)} placeholder="Subject" required className="w-full bg-gray-900/50 border border-white/20 rounded-md px-3 py-2 text-sm" />
                    <textarea value={body} onChange={e => setBody(e.target.value)} placeholder="Your message..." required className="w-full flex-grow bg-gray-900/50 border border-white/20 rounded-md px-3 py-2 text-sm resize-none scrollbar-thin" rows={10}></textarea>
                    <div className="flex justify-end">
                        <button type="submit" className="px-5 py-2 text-sm bg-cyan-600 hover:bg-cyan-500 rounded-md transition-colors font-semibold flex items-center gap-2">
                           <SendIcon /> Send
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const ToastNotification: React.FC<{
    message: string;
    action?: { label: string, onClick: () => void };
    onClose: () => void;
}> = ({ message, action, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 6000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-gray-800 border border-white/20 rounded-lg shadow-2xl p-3 flex items-center gap-4 animate-pulse z-[100]">
            <p className="text-sm text-gray-200">{message}</p>
            {action && (
                <button onClick={action.onClick} className="text-sm font-bold text-cyan-400 hover:text-cyan-300">
                    {action.label}
                </button>
            )}
        </div>
    );
};

const FolderList: React.FC<{ onSelect: (folder: string) => void; activeFolder: string; }> = ({ onSelect, activeFolder }) => {
    const folders = [
        { name: 'Inbox', icon: <InboxIcon /> },
        { name: 'Sent', icon: <SendIcon /> },
        { name: 'Scheduled', icon: <ClockIcon /> },
        { name: 'Drafts', icon: <DraftsIcon /> },
        { name: 'Archive', icon: <ArchiveIcon /> },
        { name: 'Trash', icon: <TrashIcon /> },
    ];
    return (
        <div className="pt-2">
        {folders.map(folder => (
            <button 
                key={folder.name} 
                onClick={() => onSelect(folder.name)}
                className={`w-full flex items-center gap-3 px-4 py-2 text-sm rounded-md transition-colors ${activeFolder === folder.name ? 'bg-indigo-600/50 text-white' : 'text-gray-300 hover:bg-gray-700/50'}`}
            >
                <span className="w-5 h-5">{folder.icon}</span> {folder.name}
            </button>
        ))}
        </div>
    );
};

const EmailList: React.FC<{ emails: Email[]; onSelect: (email: Email) => void; activeEmailId?: string }> = ({ emails, onSelect, activeEmailId }) => {
    if (emails.length === 0) {
        return <div className="p-6 text-center text-gray-500">This folder is empty.</div>;
    }
    return (
        <div className="overflow-y-auto scrollbar-thin h-full">
            {emails.map(email => (
                <div 
                    key={email.id} 
                    onClick={() => onSelect(email)}
                    className={`p-3 border-b border-white/10 cursor-pointer ${activeEmailId === email.id ? 'bg-indigo-900/50' : 'hover:bg-gray-800/50'}`}
                >
                    <div className="flex justify-between items-start">
                        <p className={`font-semibold ${!email.read ? 'text-cyan-300' : 'text-gray-200'}`}>{email.sender}</p>
                        <p className="text-xs text-gray-400">{new Date(email.date).toLocaleDateString()}</p>
                    </div>
                    <p className={`text-sm truncate ${!email.read ? 'text-white' : 'text-gray-300'}`}>{email.subject}</p>
                    <div className="flex items-center gap-1 mt-1">
                        {email.tags.map(tag => (
                            <span key={tag} className="text-[10px] bg-gray-600 px-1.5 py-0.5 rounded-full">{tag}</span>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

const EmailDetail: React.FC<{ email: Email | null; onReply: (email: Email) => void; }> = ({ email, onReply }) => {
    const [aiResponse, setAiResponse] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setAiResponse('');
    }, [email]);

    const handleAiAction = async (action: 'summarize' | 'reply' | 'categorize') => {
        if (!email) return;
        setIsLoading(true);
        setAiResponse('');
        try {
            let response = '';
            if (action === 'summarize') {
                response = `**Summary:**\n${await summarizeEmail(email.body)}`;
            } else if (action === 'categorize') {
                const category = await categorizeEmail(email.body);
                response = `**Suggested Category:** ${category}`;
            } else if (action === 'reply') {
                const instruction = prompt("How should I reply to this email?");
                if (instruction) {
                    response = `**Draft Reply:**\n${await draftEmailReply(email.body, instruction)}`;
                } else {
                    setIsLoading(false);
                    return;
                }
            }
            setAiResponse(response);
        } catch (error) {
            setAiResponse(`Error: Could not process AI request. ${(error as Error).message}`);
        }
        setIsLoading(false);
    };

    if (!email) return <div className="p-6 text-center text-gray-500">Select an email to read</div>;

    return (
        <div className="flex flex-col h-full">
            <div className="p-4 border-b border-white/10">
                <h3 className="text-lg font-bold text-cyan-300">{email.subject}</h3>
                <div className="text-sm mt-1">
                    <p className="text-gray-300">From: {email.sender} &lt;{email.senderEmail}&gt;</p>
                    <p className="text-gray-400">To: {email.recipient}</p>
                </div>
                 <button onClick={() => onReply(email)} className="mt-3 flex items-center gap-2 px-3 py-1.5 text-xs bg-gray-700 hover:bg-gray-600 rounded-md transition-colors"><ReplyIcon /> Reply</button>
            </div>
            <div className="p-4 flex-grow overflow-y-auto scrollbar-thin whitespace-pre-wrap text-gray-200">
                {email.body}
            </div>
            {aiResponse && (
                <div className="p-4 border-t border-white/10 bg-gray-900/50">
                     <p className="text-xs font-bold text-indigo-300 mb-2">Astra's Analysis:</p>
                     <p className="text-sm whitespace-pre-wrap">{aiResponse.split(/(\*\*.*?\*\*)/g).map((part, i) => part.startsWith('**') ? <strong key={i}>{part.slice(2,-2)}</strong> : part)}</p>
                </div>
            )}
            <div className="p-2 border-t border-white/10 flex gap-2 justify-center">
                <button disabled={isLoading} onClick={() => handleAiAction('summarize')} className="px-3 py-1.5 text-xs bg-indigo-600 hover:bg-indigo-500 rounded-md transition-colors disabled:bg-gray-600">Summarize</button>
                <button disabled={isLoading} onClick={() => handleAiAction('reply')} className="px-3 py-1.5 text-xs bg-indigo-600 hover:bg-indigo-500 rounded-md transition-colors disabled:bg-gray-600">Draft AI Reply</button>
                <button disabled={isLoading} onClick={() => handleAiAction('categorize')} className="px-3 py-1.5 text-xs bg-indigo-600 hover:bg-indigo-500 rounded-md transition-colors disabled:bg-gray-600">Categorize</button>
            </div>
        </div>
    );
};

export const EmailClientView: React.FC = () => {
    const [emails, setEmails] = useState<Email[]>(MOCK_EMAILS);
    const [activeAccount, setActiveAccount] = useState('work');
    const [activeFolder, setActiveFolder] = useState('Inbox');
    const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
    const [isComposeOpen, setIsComposeOpen] = useState(false);
    const [composeEmail, setComposeEmail] = useState<Partial<Email> | undefined>(undefined);
    const [toast, setToast] = useState<{ id: string; message: string; action?: { label: string; onClick: () => void; } } | null>(null);
    const [isOrganizing, setIsOrganizing] = useState(false);
    const sendTimeoutRef = useRef<Map<string, number>>(new Map());

    const accounts = ['work', 'gmail', 'yahoo'];

    useEffect(() => {
        return () => {
            sendTimeoutRef.current.forEach(timeoutId => clearTimeout(timeoutId));
        };
    }, []);
    
    useEffect(() => {
        const firstEmail = emails.find(e => e.account === activeAccount && e.folder.toLowerCase() === activeFolder.toLowerCase()) || null;
        setSelectedEmail(firstEmail);
    }, [activeAccount, activeFolder, emails])

    const confirmSend = (emailId: string) => {
        setEmails(prev => prev.map(e => e.id === emailId ? { ...e, folder: 'sent', sendAt: undefined } : e));
        sendTimeoutRef.current.delete(emailId);
    };
    
    const handleUndoSend = (emailId: string) => {
        const timeoutId = sendTimeoutRef.current.get(emailId);
        if (timeoutId) clearTimeout(timeoutId);
        sendTimeoutRef.current.delete(emailId);
        
        setEmails(prev => prev.map(e => e.id === emailId ? { ...e, folder: 'drafts', sendAt: undefined } : e));
        setToast(null);
    };

    const handleSendEmail = (emailData: Omit<Email, 'id' | 'date' | 'read' | 'tags' | 'folder'>) => {
        const newEmail: Email = {
            ...emailData,
            id: `email_${Date.now()}`,
            date: new Date().toISOString(),
            read: true,
            tags: [],
            folder: 'scheduled',
            sendAt: Date.now() + 60 * 60 * 1000,
        };

        setEmails(prev => [...prev, newEmail]);
        setIsComposeOpen(false);

        const toastId = `toast_${newEmail.id}`;
        setToast({
            id: toastId,
            message: 'Message scheduled. Will send in 60 minutes.',
            action: { label: 'Undo', onClick: () => handleUndoSend(newEmail.id) }
        });

        // Simulate the long delay. For demo, it's 60 seconds.
        const timeoutId = window.setTimeout(() => {
            confirmSend(newEmail.id);
            if (toast?.id === toastId) setToast(null);
        }, 60 * 1000);
        sendTimeoutRef.current.set(newEmail.id, timeoutId);
    };
    
    const handleCompose = () => {
        setComposeEmail({ account: activeAccount });
        setIsComposeOpen(true);
    };

    const handleReply = (emailToReply: Email) => {
        setComposeEmail({
            recipient: emailToReply.senderEmail,
            subject: `Re: ${emailToReply.subject}`,
            body: `\n\n--- Original Message ---\n${emailToReply.body}`,
            account: emailToReply.account,
        });
        setIsComposeOpen(true);
    };
    
    const handleAiOrganize = async () => {
        setIsOrganizing(true);
        const unreadEmails = emails.filter(e => !e.read && e.account === activeAccount && e.folder === 'inbox');
        const updates = await Promise.all(unreadEmails.map(async email => {
            const category = await categorizeEmail(email.body);
            const newTags = [...email.tags];
            if (!newTags.includes(category.toLowerCase())) {
                newTags.push(category.toLowerCase());
            }
            return { id: email.id, tags: newTags };
        }));

        setEmails(currentEmails => currentEmails.map(email => {
            const update = updates.find(u => u.id === email.id);
            return update ? { ...email, tags: update.tags } : email;
        }));
        setIsOrganizing(false);
    };

    const filteredEmails = useMemo(() => {
        return emails
            .filter(e => e.account === activeAccount && e.folder.toLowerCase() === activeFolder.toLowerCase())
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [emails, activeFolder, activeAccount]);

    const handleSelectEmail = (email: Email) => {
        setSelectedEmail(email);
        if (!email.read) {
            setEmails(prev => prev.map(e => e.id === email.id ? {...e, read: true} : e));
        }
    };

    return (
        <div className="relative h-full">
            <div className="glassmorphism rounded-xl shadow-2xl flex h-full">
                <div className="w-1/5 border-r border-white/10 p-2 flex flex-col">
                    <button onClick={handleCompose} className="w-full flex items-center justify-center gap-3 px-4 py-2 text-sm bg-cyan-600 hover:bg-cyan-500 rounded-md transition-colors font-semibold">
                        <span className="w-5 h-5"><ComposeIcon/></span> Compose
                    </button>
                    <div className="mt-2 border-t border-white/10 pt-2">
                         {accounts.map(acc => (
                            <button key={acc} onClick={() => setActiveAccount(acc)} className={`w-full text-left px-4 py-1.5 text-sm rounded capitalize ${activeAccount === acc ? 'bg-indigo-500/50 font-semibold' : 'hover:bg-white/10'}`}>
                                {acc}
                            </button>
                         ))}
                    </div>
                    <div className="mt-2 border-t border-white/10">
                        <FolderList onSelect={setActiveFolder} activeFolder={activeFolder} />
                    </div>
                </div>
                <div className="w-2/5 border-r border-white/10 flex flex-col">
                    <div className="p-2 border-b border-white/10 flex-shrink-0">
                         <button onClick={handleAiOrganize} disabled={isOrganizing} className="w-full flex items-center justify-center gap-2 px-3 py-1.5 text-xs bg-indigo-600 hover:bg-indigo-500 rounded-md transition-colors disabled:bg-gray-600">
                             {isOrganizing ? <LoadingIcon/> : <SparklesIcon />} {isOrganizing ? 'Organizing...' : 'AI Organize Inbox'}
                         </button>
                    </div>
                    <EmailList emails={filteredEmails} onSelect={handleSelectEmail} activeEmailId={selectedEmail?.id} />
                </div>
                <div className="w-2/5">
                    <EmailDetail email={selectedEmail} onReply={handleReply} />
                </div>
            </div>
            {isComposeOpen && <EmailComposeModal email={composeEmail} onClose={() => setIsComposeOpen(false)} onSend={handleSendEmail} />}
            {toast && <ToastNotification message={toast.message} action={toast.action} onClose={() => setToast(null)} />}
        </div>
    );
};