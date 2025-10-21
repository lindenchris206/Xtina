/**
 * @author cel
 * @file components/EmailClientView.tsx
 * @description A simulated email client application view.
 */
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useMission } from '../context/MissionContext';
import { MOCK_EMAILS } from '../services/mockData';
import type { Email, EmailAccount } from '../types';
import { InboxIcon, SendIcon, DraftsIcon, TrashIcon, ArchiveIcon, ReplyIcon, ComposeIcon, ClockIcon, XIcon, SearchIcon, SparklesIcon, LoadingIcon, SettingsIcon } from './icons';
import { categorizeEmail, draftEmailReply, summarizeEmail, findContactEmail } from '../services/geminiService';
import { InstructionPanel } from './InstructionPanel';

// Sub-components...
const ToastNotification: React.FC<{ message: string; action?: { label: string, onClick: () => void }; onClose: () => void; }> = ({ message, action, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 6000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-gray-800 border border-white/20 rounded-lg shadow-2xl p-3 flex items-center gap-4 animate-pulse z-[100]">
            <p className="text-sm text-gray-200">{message}</p>
            {action && <button onClick={action.onClick} className="text-sm font-bold text-cyan-400 hover:text-cyan-300">{action.label}</button>}
        </div>
    );
};

const EmailDetail: React.FC<{ email: Email | null; onReply: (email: Email) => void; onRetract: (emailId: string) => void; }> = ({ email, onReply, onRetract }) => {
    const [aiResponse, setAiResponse] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => { setAiResponse(''); }, [email]);

    const handleAiAction = async (action: 'summarize' | 'reply' | 'categorize') => {
        if (!email) return;
        setIsLoading(true);
        setAiResponse('');
        try {
            let response = '';
            if (action === 'summarize') response = `**Summary:**\n${await summarizeEmail(email.body)}`;
            else if (action === 'categorize') response = `**Suggested Category:** ${await categorizeEmail(email.body)}`;
            else if (action === 'reply') {
                const instruction = prompt("How should I reply to this email?");
                if (instruction) response = `**Draft Reply:**\n${await draftEmailReply(email.body, instruction)}`;
                else { setIsLoading(false); return; }
            }
            setAiResponse(response);
        } catch (error) { setAiResponse(`Error: Could not process AI request. ${(error as Error).message}`); }
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
                <div className="mt-3 flex gap-2">
                    <button onClick={() => onReply(email)} className="flex items-center gap-2 px-3 py-1.5 text-xs bg-gray-700 hover:bg-gray-600 rounded-md transition-colors"><ReplyIcon /> Reply</button>
                    {email.folder === 'sent' && (
                        <button onClick={() => onRetract(email.id)} className="flex items-center gap-2 px-3 py-1.5 text-xs bg-red-800 hover:bg-red-700 rounded-md transition-colors">Retract Message</button>
                    )}
                </div>
            </div>
            <div className="p-4 flex-grow overflow-y-auto scrollbar-thin whitespace-pre-wrap text-gray-200" dangerouslySetInnerHTML={{__html: email.body.replace(/\n/g, '<br/>')}}/>
            {aiResponse && (
                <div className="p-4 border-t border-white/10 bg-gray-900/50">
                    <p className="text-xs font-bold text-indigo-300 mb-2">Astra's Analysis:</p>
                    <p className="text-sm whitespace-pre-wrap">{aiResponse.split(/(\*\*.*?\*\*)/g).map((part, i) => part.startsWith('**') ? <strong key={i}>{part.slice(2, -2)}</strong> : part)}</p>
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

// Main View...
const EmailClientView: React.FC = () => {
    const { appState, updateUserProfile, addEmailAccount, updateEmailAccount, deleteEmailAccount, updateEmailSettings } = useMission();
    const { emailAccounts, emailSettings } = appState.userProfile;
    const [emails, setEmails] = useState<Email[]>(MOCK_EMAILS);
    const [activeAccountId, setActiveAccountId] = useState<string | 'all'>('all');
    const [activeFolder, setActiveFolder] = useState<Email['folder']>('inbox');
    const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
    const [modals, setModals] = useState({ compose: false, settings: false });
    const [composeEmail, setComposeEmail] = useState<Partial<Email> | undefined>(undefined);
    const [toast, setToast] = useState<{ id: string; message: string; action?: { label: string; onClick: () => void; } } | null>(null);
    const [isOrganizing, setIsOrganizing] = useState(false);
    const sendTimeoutRef = useRef<Map<string, number>>(new Map());

    useEffect(() => { return () => { sendTimeoutRef.current.forEach(timeoutId => clearTimeout(timeoutId)); }; }, []);

    useEffect(() => {
        const firstEmail = emails.find(e => (activeAccountId === 'all' || e.accountId === activeAccountId) && e.folder === activeFolder) || null;
        setSelectedEmail(firstEmail);
    }, [activeAccountId, activeFolder, emails]);

    const handleSendEmail = (emailData: Omit<Email, 'id' | 'date' | 'read' | 'tags' | 'folder' | 'sendAt'>) => {
        const account = emailAccounts.find(a => a.id === emailData.accountId);
        if(!account) return;

        const newEmail: Email = { ...emailData, id: `email_${Date.now()}`, date: new Date().toISOString(), read: true, tags: [], folder: 'scheduled', sendAt: Date.now() + (emailSettings.undoSendTime * 1000), body: `${emailData.body}\n\n--\n${account.signature}`};
        setEmails(prev => [newEmail, ...prev]);
        setModals(m => ({...m, compose: false}));
        setComposeEmail(undefined);

        const timeoutId = window.setTimeout(() => { setEmails(p => p.map(e => e.id === newEmail.id ? { ...e, folder: 'sent', sendAt: undefined } : e)); sendTimeoutRef.current.delete(newEmail.id); }, emailSettings.undoSendTime * 1000);
        sendTimeoutRef.current.set(newEmail.id, timeoutId);
        
        setToast({ id: newEmail.id, message: "Message sending...", action: { label: 'Undo', onClick: () => handleUndoSend(newEmail.id) } });
    };

    const handleUndoSend = (emailId: string) => {
        const timeoutId = sendTimeoutRef.current.get(emailId);
        if (timeoutId) clearTimeout(timeoutId);
        sendTimeoutRef.current.delete(emailId);
        setEmails(prev => prev.map(e => e.id === emailId ? { ...e, folder: 'drafts', sendAt: undefined } : e));
        setToast(null);
    };

    const handleRetract = (emailId: string) => {
        if(confirm("Retract this message? This will move it to your drafts folder.")) {
            setEmails(prev => prev.map(e => e.id === emailId ? {...e, folder: 'drafts'} : e));
            // FIX: The toast state object does not have an 'onClose' property. The ToastNotification component handles its own timeout.
            setToast({ id: `retract_${emailId}`, message: "Message retracted." });
        }
    }
    
    const handleReply = (email: Email) => {
        const account = emailAccounts.find(a => a.id === email.accountId);
        if (!account) return;
        setComposeEmail({ recipient: email.senderEmail, subject: `Re: ${email.subject}`, body: `\n\n--- Original Message ---\nFrom: ${email.sender}\nDate: ${new Date(email.date).toLocaleString()}\n\n${email.body}`, accountId: email.accountId });
        setModals(m => ({...m, compose: true}));
    };

    const filteredEmails = useMemo(() => {
        return emails.filter(e => (activeAccountId === 'all' || e.accountId === activeAccountId) && e.folder === activeFolder)
                     .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [emails, activeAccountId, activeFolder]);
    
    const organizeEmails = async () => {
        setIsOrganizing(true);
        const inbox = emails.filter(e => e.folder === 'inbox');
        const organizedEmails = await Promise.all(inbox.map(async (email) => {
            const category = await categorizeEmail(email.body);
            const newTags = Array.from(new Set([...email.tags, category.toLowerCase()]));
            return { ...email, tags: newTags };
        }));
        setEmails(prev => prev.map(e => organizedEmails.find(o => o.id === e.id) || e));
        setIsOrganizing(false);
    };

    const handleSelectEmail = (email: Email) => {
        setSelectedEmail(email);
        if (!email.read) setEmails(prev => prev.map(e => e.id === email.id ? { ...e, read: true } : e));
    };

    return (
        <div className="glassmorphism rounded-xl h-full flex flex-col">
            <div className="p-4 pb-0 flex-shrink-0">
                <InstructionPanel title="Email Client Guide" storageKey="email-instructions-v2">
                    <p>Manage multiple accounts from the sidebar. Use the <span className="text-indigo-300 font-semibold">'AI Organize Inbox'</span> button for automatic tagging, or try the <span className="text-indigo-300 font-semibold">'AI Contact Finder'</span> in the compose window.</p>
                </InstructionPanel>
            </div>
            <div className="flex-grow flex min-h-0">
                <Sidebar accounts={emailAccounts} activeAccountId={activeAccountId} onAccountSelect={setActiveAccountId} activeFolder={activeFolder} onFolderSelect={setActiveFolder} onOrganize={organizeEmails} isOrganizing={isOrganizing} onCompose={() => { setComposeEmail(undefined); setModals(m => ({...m, compose: true})); }} onSettings={() => setModals(m => ({...m, settings: true}))} />
                <div className="w-1/3 border-r border-white/10 flex flex-col"><EmailList emails={filteredEmails} onSelect={handleSelectEmail} activeEmailId={selectedEmail?.id} showAccountIndicator={activeAccountId === 'all'} accounts={emailAccounts} /></div>
                <div className="flex-grow"><EmailDetail email={selectedEmail} onReply={handleReply} onRetract={handleRetract} /></div>
            </div>
            {modals.compose && <EmailComposeModal email={composeEmail} onClose={() => setModals(m => ({...m, compose: false}))} onSend={handleSendEmail} />}
            {modals.settings && <EmailSettingsModal onClose={() => setModals(m => ({...m, settings: false}))} />}
            {toast && <ToastNotification message={toast.message} action={toast.action} onClose={() => setToast(null)} />}
        </div>
    );
};

const Sidebar: React.FC<{
    accounts: EmailAccount[], activeAccountId: string, onAccountSelect: (id: string | 'all') => void,
    activeFolder: string, onFolderSelect: (folder: Email['folder']) => void, onOrganize: () => void, isOrganizing: boolean,
    onCompose: () => void, onSettings: () => void
}> = ({ accounts, activeAccountId, onAccountSelect, activeFolder, onFolderSelect, onOrganize, isOrganizing, onCompose, onSettings }) => (
    <div className="w-64 border-r border-white/10 flex flex-col">
        <div className="p-4 border-b border-white/10 flex justify-between items-center">
            <h2 className="text-xl font-orbitron text-cyan-300">Email Client</h2>
            <button onClick={onSettings} className="p-2 hover:bg-white/10 rounded-full"><SettingsIcon/></button>
        </div>
        <div className="flex-grow p-2 overflow-y-auto scrollbar-thin">
            <button onClick={onCompose} className="w-full flex items-center justify-center gap-2 mb-2 px-4 py-2 text-sm bg-cyan-600 hover:bg-cyan-500 rounded-md font-semibold"><ComposeIcon /> Compose</button>
            <div className="mt-4">
                <h3 className="px-2 text-xs font-bold text-gray-400 uppercase">Accounts</h3>
                <AccountList accounts={accounts} activeId={activeAccountId} onSelect={onAccountSelect} />
            </div>
            <div className="mt-4">
                <h3 className="px-2 text-xs font-bold text-gray-400 uppercase">Folders</h3>
                <FolderList onSelect={onFolderSelect} activeFolder={activeFolder} />
            </div>
        </div>
        <div className="p-3 border-t border-white/10">
            <button onClick={onOrganize} disabled={isOrganizing} className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-500 rounded-md font-semibold disabled:bg-gray-600">
                {isOrganizing ? <LoadingIcon /> : <SparklesIcon />} {isOrganizing ? 'Organizing...' : 'AI Organize Inbox'}
            </button>
        </div>
    </div>
);

const AccountList: React.FC<{ accounts: EmailAccount[], activeId: string, onSelect: (id: string | 'all') => void }> = ({ accounts, activeId, onSelect }) => {
    const accountButtons = [{id: 'all', service: 'all', email: 'All Accounts'}, ...accounts];
    return (
        <div className="pt-1">
            {accountButtons.map(acc => (
                <button key={acc.id} onClick={() => onSelect(acc.id)} className={`w-full flex items-center gap-3 px-2 py-1.5 text-sm rounded-md transition-colors ${activeId === acc.id ? 'bg-indigo-600/50 text-white' : 'text-gray-300 hover:bg-gray-700/50'}`}>
                    <span className={`email-service-dot email-service-dot-${acc.service}`}></span> <span className="truncate">{acc.email}</span>
                </button>
            ))}
        </div>
    );
};

const FolderList: React.FC<{ onSelect: (folder: Email['folder']) => void; activeFolder: string; }> = ({ onSelect, activeFolder }) => {
    const folders: { name: string, icon: React.ReactNode, id: Email['folder']}[] = [ { name: 'Inbox', icon: <InboxIcon />, id: 'inbox' }, { name: 'Sent', icon: <SendIcon />, id: 'sent' }, { name: 'Scheduled', icon: <ClockIcon />, id: 'scheduled'}, { name: 'Drafts', icon: <DraftsIcon />, id: 'drafts' }, { name: 'Archive', icon: <ArchiveIcon />, id: 'archive' }, { name: 'Trash', icon: <TrashIcon />, id: 'trash' } ];
    return (
        <div className="pt-1">
            {folders.map(folder => (
                <button key={folder.id} onClick={() => onSelect(folder.id)} className={`w-full flex items-center gap-3 px-2 py-1.5 text-sm rounded-md transition-colors ${activeFolder === folder.id ? 'bg-indigo-600/50 text-white' : 'text-gray-300 hover:bg-gray-700/50'}`}>
                    <span className="w-5 h-5">{folder.icon}</span> {folder.name}
                </button>
            ))}
        </div>
    );
};

const EmailList: React.FC<{ emails: Email[]; onSelect: (email: Email) => void; activeEmailId?: string; showAccountIndicator: boolean; accounts: EmailAccount[] }> = ({ emails, onSelect, activeEmailId, showAccountIndicator, accounts }) => {
    if (emails.length === 0) return <div className="p-6 text-center text-gray-500">This folder is empty.</div>;
    return (
        <div className="overflow-y-auto scrollbar-thin h-full">
            {emails.map(email => {
                const account = accounts.find(a => a.id === email.accountId);
                return (
                    <div key={email.id} onClick={() => onSelect(email)} className={`p-3 border-b border-white/10 cursor-pointer ${activeEmailId === email.id ? 'bg-indigo-900/50' : 'hover:bg-gray-800/50'}`}>
                        <div className="flex justify-between items-start">
                            <p className={`font-semibold truncate ${!email.read ? 'text-cyan-300' : 'text-gray-200'}`}>{email.sender}</p>
                            <p className="text-xs text-gray-400 flex-shrink-0 ml-2">{new Date(email.date).toLocaleDateString()}</p>
                        </div>
                        <p className={`text-sm truncate ${!email.read ? 'text-white' : 'text-gray-300'}`}>{email.subject}</p>
                        <div className="flex items-center gap-2 mt-1">
                            {showAccountIndicator && account && <span className={`email-service-dot email-service-dot-${account.service}`}></span>}
                            {email.tags.map(tag => <span key={tag} className="text-[10px] bg-gray-600 px-1.5 py-0.5 rounded-full">{tag}</span>)}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

const EmailComposeModal: React.FC<{ email?: Partial<Email>; onClose: () => void; onSend: (email: Omit<Email, 'id' | 'date' | 'read' | 'tags' | 'folder' | 'sendAt'>) => void; }> = ({ email, onClose, onSend }) => {
    const { appState } = useMission();
    const { emailAccounts } = appState.userProfile;
    const [recipient, setRecipient] = useState(email?.recipient || '');
    const [subject, setSubject] = useState(email?.subject || '');
    const [body, setBody] = useState(email?.body || '');
    const [fromAccountId, setFromAccountId] = useState(email?.accountId || emailAccounts[0]?.id || '');
    const [isFindingEmail, setIsFindingEmail] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSend({ sender: 'cel', senderEmail: emailAccounts.find(a=>a.id === fromAccountId)?.email || '', recipient, subject, body, accountId: fromAccountId });
    };
    
    const handleFindEmail = async () => {
        const name = prompt("Enter the person's full name:"); if (!name) return;
        const company = prompt("Enter their company (optional):");
        const city = prompt("Enter their city (optional):");
        const state = prompt("Enter their state (optional):");
        setIsFindingEmail(true);
        const foundEmail = await findContactEmail(name, company || undefined, city || undefined, state || undefined);
        setRecipient(foundEmail);
        setIsFindingEmail(false);
    }

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-2xl bg-gray-800 rounded-xl border border-white/20 flex flex-col glassmorphism">
                <div className="flex justify-between items-center p-3 border-b border-white/10"><h3 className="text-lg font-orbitron text-indigo-300">Compose Message</h3><button onClick={onClose} className="p-1 rounded-full hover:bg-white/10"><XIcon /></button></div>
                <form onSubmit={handleSubmit} className="p-4 flex-grow flex flex-col gap-3">
                    <div className="flex items-center gap-2"><label htmlFor="fromAccount" className="text-sm text-gray-400">From:</label><select id="fromAccount" value={fromAccountId} onChange={e => setFromAccountId(e.target.value)} className="bg-gray-900/50 border border-white/20 rounded-md px-2 py-1 text-sm">{emailAccounts.map(acc => <option key={acc.id} value={acc.id}>{acc.email}</option>)}</select></div>
                    <div className="relative"><input type="email" value={recipient} onChange={e => setRecipient(e.target.value)} placeholder="To" required className="w-full bg-gray-900/50 border border-white/20 rounded-md px-3 py-2 text-sm pr-10" /><button type="button" onClick={handleFindEmail} title="Find contact email with AI" className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-cyan-400">{isFindingEmail ? <LoadingIcon className="w-4 h-4" /> : <SearchIcon className="w-4 h-4" />}</button></div>
                    <input type="text" value={subject} onChange={e => setSubject(e.target.value)} placeholder="Subject" required className="w-full bg-gray-900/50 border border-white/20 rounded-md px-3 py-2 text-sm" />
                    <textarea value={body} onChange={e => setBody(e.target.value)} placeholder="Your message..." required className="w-full flex-grow bg-gray-900/50 border border-white/20 rounded-md px-3 py-2 text-sm resize-none scrollbar-thin" rows={10}></textarea>
                    <div className="flex justify-end"><button type="submit" className="px-5 py-2 text-sm bg-cyan-600 hover:bg-cyan-500 rounded-md transition-colors font-semibold flex items-center gap-2"><SendIcon /> Send</button></div>
                </form>
            </div>
        </div>
    );
};

const EmailSettingsModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { appState, updateEmailSettings, updateEmailAccount, addEmailAccount, deleteEmailAccount } = useMission();
    const { emailAccounts, emailSettings } = appState.userProfile;

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-2xl bg-gray-800 rounded-xl border border-white/20 flex flex-col glassmorphism">
                <div className="flex justify-between items-center p-4 border-b border-white/10"><h3 className="text-lg font-orbitron text-indigo-300">Email Settings</h3><button onClick={onClose} className="p-1 rounded-full hover:bg-white/10"><XIcon /></button></div>
                <div className="p-4 space-y-6 flex-grow overflow-y-auto scrollbar-thin">
                    <div>
                        <h4 className="font-bold text-gray-200 mb-2">General Settings</h4>
                        <label className="flex items-center justify-between text-sm"><span>Undo Send Delay</span><select value={emailSettings.undoSendTime} onChange={e => updateEmailSettings({ undoSendTime: parseInt(e.target.value, 10)})} className="bg-gray-900/50 border border-white/20 rounded px-2 py-1"><option value={5}>5 seconds</option><option value={10}>10 seconds</option><option value={20}>20 seconds</option><option value={30}>30 seconds</option></select></label>
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-200 mb-2">Account Management</h4>
                        <div className="space-y-2">
                        {emailAccounts.map(acc => (
                            <div key={acc.id} className="bg-gray-900/50 p-2 rounded">
                                <p className="font-semibold text-cyan-300">{acc.email}</p>
                                <textarea value={acc.signature} onChange={e => updateEmailAccount({...acc, signature: e.target.value})} placeholder="Signature..." className="w-full bg-gray-700/50 border border-white/10 rounded mt-1 px-2 py-1 text-xs resize-none" rows={2}/>
                                <button onClick={() => deleteEmailAccount(acc.id)} className="text-xs text-red-400 hover:underline mt-1">Delete Account</button>
                            </div>
                        ))}
                        </div>
                        <button onClick={() => addEmailAccount({service: 'hotmail', email: 'new_user@hotmail.com', signature: ''})} className="text-sm text-cyan-400 hover:underline mt-3">Add Account (Simulated)</button>
                    </div>
                </div>
                <div className="p-3 bg-black/20 flex justify-end"><button onClick={onClose} className="px-4 py-2 text-sm bg-gray-600 hover:bg-gray-500 rounded-md">Close</button></div>
            </div>
        </div>
    );
}

export default EmailClientView;