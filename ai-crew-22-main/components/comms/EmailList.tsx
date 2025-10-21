import React, { useMemo } from 'react';
import type { Email, EmailFolderName } from '../../types';

interface EmailListProps {
    emails: Email[];
    selectedAccountId: string | null;
    selectedFolder: EmailFolderName | null;
    selectedEmailId: string | null;
    onSelectEmail: (emailId: string | null) => void;
}

export const EmailList: React.FC<EmailListProps> = ({ emails, selectedAccountId, selectedFolder, selectedEmailId, onSelectEmail }) => {

    const filteredEmails = useMemo(() => {
        return emails
            .filter(e => e.accountId === selectedAccountId && e.folder === selectedFolder)
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }, [emails, selectedAccountId, selectedFolder]);

    if (!selectedFolder) {
        return (
             <div className="p-4 glassmorphism rounded-xl h-full flex items-center justify-center">
                <p className="text-gray-500">Select a folder to view emails.</p>
            </div>
        )
    }

    return (
        <div className="glassmorphism rounded-xl h-full flex flex-col">
             <div className="p-4 border-b border-white/10 flex-shrink-0">
                 <h3 className="text-xl font-orbitron text-indigo-300">{selectedFolder}</h3>
                 <p className="text-xs text-gray-400">{filteredEmails.length} messages</p>
             </div>
             <div className="flex-grow overflow-y-auto scrollbar-thin">
                {filteredEmails.length > 0 ? (
                    <ul>
                        {filteredEmails.map(email => (
                            <li key={email.id}>
                                <button
                                    onClick={() => onSelectEmail(email.id)}
                                    className={`w-full text-left p-3 border-b border-white/10 transition-colors ${
                                        selectedEmailId === email.id ? 'bg-cyan-900/50' : 'hover:bg-gray-800/50'
                                    }`}
                                >
                                    <div className="flex justify-between items-start">
                                        <p className={`font-bold text-sm truncate ${email.isRead ? 'text-gray-400' : 'text-white'}`}>
                                            {email.from.name}
                                        </p>
                                        {!email.isRead && (
                                            <span className="w-2 h-2 bg-cyan-400 rounded-full flex-shrink-0 mt-1.5 ml-2"></span>
                                        )}
                                    </div>
                                    <p className={`text-sm truncate mt-1 ${email.isRead ? 'text-gray-300' : 'text-white'}`}>{email.subject}</p>
                                    <p className="text-xs text-gray-500 mt-1 truncate">
                                        {email.body.substring(0, 100)}...
                                    </p>
                                </button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="h-full flex items-center justify-center">
                         <p className="text-gray-500">No emails in this folder.</p>
                    </div>
                )}
             </div>
        </div>
    );
};
