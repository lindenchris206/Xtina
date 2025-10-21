import React from 'react';
import { useMissionContext } from '../hooks/useMissionContext';
import { AccountList } from './comms/AccountList';
import { EmailList } from './comms/EmailList';
import { EmailView } from './comms/EmailView';

export const CommsCenter: React.FC = () => {
    const { state, dispatch } = useMissionContext();
    const { commsState } = state;

    const selectedEmail = commsState.emails.find(e => e.id === commsState.selectedEmailId) || null;

    const handleSelectEmail = (emailId: string | null) => {
        // A single action now handles both selecting and marking as read within the reducer.
        dispatch({ type: 'COMMS_SELECT_EMAIL', payload: { emailId }});
    };

    return (
        <div className="grid grid-cols-12 gap-4 h-[calc(100vh-160px)]">
            {/* Left Pane: Accounts and Folders */}
            <div className="col-span-12 md:col-span-2">
                <AccountList
                    accounts={commsState.accounts}
                    emails={commsState.emails}
                    selectedAccountId={commsState.selectedAccountId}
                    selectedFolder={commsState.selectedFolder}
                    onSelectFolder={(accountId, folderName) => dispatch({ type: 'COMMS_SELECT_FOLDER', payload: { accountId, folderName }})}
                    onCompose={() => dispatch({ type: 'COMMS_START_COMPOSE', payload: { mode: 'new' } })}
                />
            </div>

            {/* Middle Pane: Email List */}
            <div className="col-span-12 md:col-span-4">
                <EmailList
                    emails={commsState.emails}
                    selectedAccountId={commsState.selectedAccountId}
                    selectedFolder={commsState.selectedFolder}
                    selectedEmailId={commsState.selectedEmailId}
                    onSelectEmail={handleSelectEmail}
                />
            </div>

            {/* Right Pane: Email Viewer / Composer */}
            <div className="col-span-12 md:col-span-6">
                <EmailView
                    selectedEmail={selectedEmail}
                    isComposing={commsState.isComposing}
                    composeFields={commsState.composeFields}
                    dispatch={dispatch}
                />
            </div>
        </div>
    );
};