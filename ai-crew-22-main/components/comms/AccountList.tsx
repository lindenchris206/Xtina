import React from 'react';
import { Email, EmailAccount, EmailFolderName } from '../../types';
import { InboxIcon, FileTextIcon } from '../icons';

interface AccountListProps {
    accounts: EmailAccount[];
    emails: Email[];
    selectedAccountId: string | null;
    selectedFolder: EmailFolderName | null;
    onSelectFolder: (accountId: string, folderName: EmailFolderName) => void;
    onCompose: () => void;
}

const FOLDER_ORDER: EmailFolderName[] = ['Inbox', 'Sent', 'Drafts', 'Trash'];

export const AccountList: React.FC<AccountListProps> = ({ accounts, emails, selectedAccountId, selectedFolder, onSelectFolder, onCompose }) => {
    
    const getUnreadCount = (accountId: string, folderName: EmailFolderName) => {
        return emails.filter(e => e.accountId === accountId && e.folder === folderName && !e.isRead).length;
    };

    return (
        <div className="p-4 glassmorphism rounded-xl h-full flex flex-col">
            <h3 className="text-xl font-orbitron text-indigo-300 mb-4">Accounts</h3>
            <button
                onClick={onCompose}
                className="w-full mb-4 bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded transition-colors flex items-center justify-center gap-2"
            >
                <FileTextIcon className="w-4 h-4" />
                Compose
            </button>
            <div className="flex-grow overflow-y-auto scrollbar-thin space-y-4">
                {accounts.map(account => (
                    <div key={account.id}>
                        <h4 className="font-bold text-sm text-gray-300 truncate" title={account.email}>{account.name}</h4>
                        <ul className="mt-2 space-y-1">
                            {FOLDER_ORDER.map(folderName => {
                                const isSelected = selectedAccountId === account.id && selectedFolder === folderName;
                                const unreadCount = getUnreadCount(account.id, folderName);
                                return (
                                    <li key={folderName}>
                                        <button
                                            onClick={() => onSelectFolder(account.id, folderName)}
                                            className={`w-full text-left text-sm px-3 py-1.5 rounded flex justify-between items-center transition-colors ${
                                                isSelected ? 'bg-cyan-800/70 text-white' : 'text-gray-400 hover:bg-gray-700/50 hover:text-gray-200'
                                            }`}
                                        >
                                            <span className="flex items-center gap-2">
                                                <InboxIcon className="w-4 h-4" /> {folderName}
                                            </span>
                                            {unreadCount > 0 && (
                                                <span className="bg-red-500 text-white text-xs font-bold rounded-full px-2 py-0.5">
                                                    {unreadCount}
                                                </span>
                                            )}
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                ))}
            </div>
        </div>
    );
};
