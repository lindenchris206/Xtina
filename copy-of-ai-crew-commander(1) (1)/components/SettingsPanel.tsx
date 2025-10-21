/**
 * @author cel
 * @file components/SettingsPanel.tsx
 * @description Renders the main settings configuration panel.
 */
import React, { useState, useRef } from 'react';
import type { Settings, CrewMember, AppState, User } from '../types';
// FIX: Corrected import path for constants.
import { AI_MODEL_OPTIONS, PERSONALITY_OPTIONS } from '../constants.tsx';
import { ChevronDownIcon, ChevronUpIcon, TrashIcon, XIcon, SaveIcon, CheckIcon } from './icons';
import { AVATARS } from './avatars';
import { useMission } from '../context/MissionContext';


const AddUserModal: React.FC<{ user?: User, onClose: () => void, onSave: (user: Omit<User, 'id' | 'passwordHash'> & { password?: string }) => void }> = ({ user, onClose, onSave }) => {
    const [username, setUsername] = useState(user?.username || '');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<'admin' | 'user'>(user?.role || 'user');

    const handleSave = () => {
        if (username && (password || user)) { // Password required for new users
            onSave({ username, password, role });
            onClose();
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-gray-800 rounded-xl border border-white/20 glassmorphism">
                <div className="flex justify-between items-center p-4 border-b border-white/10">
                    <h3 className="text-lg font-orbitron text-indigo-300">{user ? 'Edit' : 'Add'} User</h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10"><XIcon /></button>
                </div>
                <div className="p-4 space-y-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Username</label>
                        <input type="text" value={username} onChange={e => setUsername(e.target.value)} className="w-full bg-gray-900/50 border border-white/20 rounded-md px-3 py-2 text-sm" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Password {user ? '(leave blank to keep unchanged)' : ''}</label>
                        <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-gray-900/50 border border-white/20 rounded-md px-3 py-2 text-sm" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Role</label>
                         <select value={role} onChange={e => setRole(e.target.value as 'admin' | 'user')} className="w-full bg-gray-900/50 border border-white/20 rounded-md px-3 py-1.5 focus:ring-cyan-500 focus:border-cyan-500">
                             <option value="user">User</option>
                             <option value="admin">Admin</option>
                         </select>
                    </div>
                </div>
                 <div className="p-3 flex justify-end gap-3 bg-black/20 rounded-b-xl">
                    <button onClick={onClose} className="px-4 py-2 text-sm bg-gray-600 hover:bg-gray-500 rounded-md">Cancel</button>
                    <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 text-sm bg-cyan-600 hover:bg-cyan-500 rounded-md">
                        <SaveIcon /> Save User
                    </button>
                </div>
            </div>
        </div>
    )
}

const UserAdministrationPanel: React.FC = () => {
    const { users, addUser, deleteUser } = useMission();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleSaveUser = (user: Omit<User, 'id' | 'passwordHash'> & { password?: string }) => {
        addUser(user.username, user.password || '', user.role);
    };

    return (
        <div className="pt-4 border-t border-white/10">
            <div className="flex justify-between items-center">
                <h4 className="text-lg font-orbitron text-indigo-300">User Administration</h4>
                <button onClick={() => setIsModalOpen(true)} className="px-4 py-1.5 text-sm bg-cyan-600 hover:bg-cyan-500 rounded-md font-semibold">
                    Add User
                </button>
            </div>
            <div className="mt-3 space-y-2 max-h-48 overflow-y-auto scrollbar-thin pr-2">
                {users.map(user => (
                    <div key={user.id} className="bg-gray-900/50 p-2 rounded-md flex justify-between items-center text-sm">
                        <div>
                            <p className="font-semibold text-gray-200">{user.username} <span className="text-xs text-gray-400 capitalize">({user.role})</span></p>
                        </div>
                        <div className="flex gap-2">
                             <button onClick={() => deleteUser(user.id)} className="p-2 text-xs bg-red-800 hover:bg-red-700 rounded"><TrashIcon/></button>
                        </div>
                    </div>
                ))}
            </div>
            {isModalOpen && <AddUserModal onClose={() => setIsModalOpen(false)} onSave={handleSaveUser} />}
        </div>
    );
};


interface SettingsPanelProps {
  settings: Settings;
  onSettingsChange: (newSettings: Partial<Settings>) => void;
  onImport: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ 
    settings, 
    onSettingsChange, 
    onImport, 
}) => {
  const { appState, currentUser, resetSession, archiveCurrentMission, deleteArchivedMission, restoreArchivedMission } = useMission();
  const [isCrewPersonalizationOpen, setIsCrewPersonalizationOpen] = useState(false);
  const [isModelAssignmentsOpen, setIsModelAssignmentsOpen] = useState(false);
  const importFileInputRef = useRef<HTMLInputElement>(null);

  const handleCrewModelChange = (memberName: string, model: string) => {
    const newAssignments = { ...settings.crewModelAssignments, [memberName]: model };
    onSettingsChange({ crewModelAssignments: newAssignments });
  };
  
  const handleCrewConfigChange = (memberName: string, field: keyof CrewMember, value: string) => {
    const newCrewConfig = settings.crewConfig.map(member => 
      member.name === memberName ? { ...member, [field]: value } : member
    );
    onSettingsChange({ crewConfig: newCrewConfig });
  };
  
  const handleExport = () => {
    const stateToSave = { appState, settings };
    const blob = new Blob([JSON.stringify(stateToSave, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aic-session-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const crewSizeOptions = [
      { label: `Core (4)`, value: 4 },
      { label: `Strike Team (8)`, value: 8 },
      { label: `Task Force (12)`, value: 12 },
      { label: `Vanguard (16)`, value: 16 },
      { label: `Legion (${settings.crewConfig.length})`, value: settings.crewConfig.length },
  ];
  
  const modeTooltips = {
    quick: "Fastest response time. Astra generates a plan directly.",
    deep_thinking: "Astra takes more time to generate a more detailed and robust plan.",
    deliberations: "Astra's plan is reviewed and critiqued by key crew members before being finalized."
  }

  return (
    <div className="space-y-6">
      
      {/* General Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <div>
              <label htmlFor="theme" className="block text-sm font-medium text-gray-300 mb-1">UI Theme</label>
              <select
                  id="theme"
                  value={settings.theme}
                  onChange={(e) => onSettingsChange({ theme: e.target.value as Settings['theme'] })}
                  className="w-full bg-gray-900/50 border border-white/20 rounded-md px-3 py-1.5 focus:ring-cyan-500 focus:border-cyan-500"
              >
                  <option value="astra">Astra Default</option>
                  <option value="nebula">Nebula Pink</option>
                  <option value="starship">Starship Green</option>
              </select>
          </div>
           <div>
              <label htmlFor="crewSize" className="block text-sm font-medium text-gray-300 mb-1">Crew Size</label>
              <select
                  id="crewSize"
                  value={settings.crewSize}
                  onChange={(e) => onSettingsChange({ crewSize: parseInt(e.target.value, 10) })}
                  className="w-full bg-gray-900/50 border border-white/20 rounded-md px-3 py-1.5 focus:ring-cyan-500 focus:border-cyan-500"
              >
                {crewSizeOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
          </div>
          <div>
              <label htmlFor="avatar" className="block text-sm font-medium text-gray-300 mb-1">Astra's Avatar</label>
              <select
                  id="avatar"
                  value={settings.astraAvatar}
                  onChange={(e) => onSettingsChange({ astraAvatar: e.target.value })}
                  className="w-full bg-gray-900/50 border border-white/20 rounded-md px-3 py-1.5 focus:ring-cyan-500 focus:border-cyan-500"
              >
                {Object.values(AVATARS).map(avatar => (
                    <option key={avatar.name} value={avatar.name}>{avatar.name}</option>
                ))}
              </select>
          </div>
          <div title={modeTooltips[settings.mode]}>
              <label htmlFor="mode" className="block text-sm font-medium text-gray-300 mb-1">Processing Mode</label>
              <select
                  id="mode"
                  value={settings.mode}
                  onChange={(e) => onSettingsChange({ mode: e.target.value as Settings['mode'] })}
                  className="w-full bg-gray-900/50 border border-white/20 rounded-md px-3 py-1.5 focus:ring-cyan-500 focus:border-cyan-500"
              >
                  <option value="quick">Quick Mode</option>
                  <option value="deep_thinking">Deep Thinking</option>
                  <option value="deliberations">Deliberations</option>
              </select>
          </div>
          <div className="flex items-center justify-between col-span-1 md:col-span-2 bg-gray-900/30 p-2 rounded-md">
            <label htmlFor="enableVoice" className="text-sm font-medium text-gray-300">Enable Astra's Voice</label>
             <button
                id="enableVoice"
                onClick={() => onSettingsChange({ enableVoice: !settings.enableVoice })}
                className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${settings.enableVoice ? 'bg-cyan-500' : 'bg-gray-600'}`}
             >
                <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${settings.enableVoice ? 'translate-x-6' : 'translate-x-1'}`} />
             </button>
          </div>
      </div>

       {currentUser?.role === 'admin' && <UserAdministrationPanel />}

       {/* Mission Data & Archive */}
      <div className="pt-4 border-t border-white/10">
          <h4 className="text-lg font-orbitron text-indigo-300 mb-2">Mission Data</h4>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              <input type="file" ref={importFileInputRef} onChange={onImport} className="hidden" accept=".json"/>
              <button onClick={() => importFileInputRef.current?.click()} className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded transition-colors">Import Mission</button>
              <button onClick={handleExport} className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded transition-colors">Export Mission</button>
              <button onClick={archiveCurrentMission} className="flex-1 lg:col-span-1 bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 px-4 rounded transition-colors">Archive Mission</button>
          </div>
          {appState.archivedMissions.length > 0 && (
            <div className="mt-4">
                <h5 className="text-md font-orbitron text-indigo-300 mb-2">Mission Archive</h5>
                <div className="space-y-2 max-h-40 overflow-y-auto scrollbar-thin pr-2">
                    {appState.archivedMissions.map(mission => (
                        <div key={mission.id} className="bg-gray-900/50 p-2 rounded-md flex justify-between items-center text-sm">
                            <div>
                                <p className="font-semibold text-gray-200">{mission.name}</p>
                                <p className="text-xs text-gray-400">{new Date(mission.date).toLocaleString()}</p>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => restoreArchivedMission(mission.id)} className="px-3 py-1 text-xs bg-green-600 hover:bg-green-500 rounded">Restore</button>
                                <button onClick={() => deleteArchivedMission(mission.id)} className="p-2 text-xs bg-red-800 hover:bg-red-700 rounded"><TrashIcon/></button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
          )}
      </div>
      
       {/* Crew Personalization */}
      <div className="pt-4 border-t border-white/10">
          <button onClick={() => setIsCrewPersonalizationOpen(!isCrewPersonalizationOpen)} className="flex justify-between items-center w-full">
            <h4 className="text-lg font-orbitron text-indigo-300">Crew Personalization</h4>
            {isCrewPersonalizationOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
          </button>
          {isCrewPersonalizationOpen && (
            <div className="mt-3 space-y-4">
               <p className="text-xs text-gray-400">Customize the secondary skills and personalities of your crew members.</p>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-64 overflow-y-auto scrollbar-thin pr-2">
                 {settings.crewConfig.map(member => (
                   <div key={member.name} className="p-3 bg-gray-900/30 rounded-lg">
                       <p className="font-bold text-sm text-gray-300 mb-2">{member.name}</p>
                       <div>
                           <label htmlFor={`${member.name}-secondary-specialty`} className="block text-xs font-medium text-gray-400 mb-1">Secondary Specialty</label>
                           <input
                               type="text"
                               id={`${member.name}-secondary-specialty`}
                               value={member.secondarySpecialty}
                               onChange={(e) => handleCrewConfigChange(member.name, 'secondarySpecialty', e.target.value)}
                               className="w-full bg-gray-900/50 border border-white/20 rounded-md px-2 py-1 text-xs"
                           />
                       </div>
                       <div className="mt-2">
                           <label htmlFor={`${member.name}-personality`} className="block text-xs font-medium text-gray-400 mb-1">Personality</label>
                           <select
                               id={`${member.name}-personality`}
                               value={member.personality}
                               onChange={(e) => handleCrewConfigChange(member.name, 'personality', e.target.value)}
                               className="w-full bg-gray-900/50 border border-white/20 rounded-md px-2 py-1 text-xs"
                           >
                               {PERSONALITY_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                           </select>
                       </div>
                   </div>
               ))}
               </div>
            </div>
          )}
      </div>

      {/* Crew Model Assignments */}
      <div className="pt-4 border-t border-white/10">
        <button onClick={() => setIsModelAssignmentsOpen(!isModelAssignmentsOpen)} className="flex justify-between items-center w-full">
            <h4 className="text-lg font-orbitron text-indigo-300">Crew Model Assignments</h4>
            {isModelAssignmentsOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
        </button>
        {isModelAssignmentsOpen && (
          <div className="mt-3">
            <p className="text-xs text-gray-400 mb-3">Assign specific AI models to each crew member role. This only affects the active crew.</p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-64 overflow-y-auto scrollbar-thin pr-2">
                {settings.crewConfig.map(member => (
                    <div key={member.name}>
                        <label htmlFor={`${member.name}-model`} className="block text-sm font-medium text-gray-300 mb-1 truncate">{member.name}</label>
                        <select
                            id={`${member.name}-model`}
                            value={settings.crewModelAssignments[member.name] || ''}
                            onChange={(e) => handleCrewModelChange(member.name, e.target.value)}
                            className="w-full bg-gray-900/50 border border-white/20 rounded-md px-3 py-1.5 text-xs focus:ring-cyan-500 focus:border-cyan-500"
                        >
                          {(AI_MODEL_OPTIONS[member.specialty] || AI_MODEL_OPTIONS['Default']).map(model => (
                              <option key={model} value={model}>{model}</option>
                          ))}
                        </select>
                    </div>
                ))}
            </div>
          </div>
        )}
      </div>

       {/* Danger Zone */}
       <div className="mt-6 pt-4 border-t border-white/10">
            <h4 className="text-lg font-orbitron text-red-400 mb-2">Danger Zone</h4>
            <button onClick={resetSession} className="w-full bg-red-800 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-colors">
                Reset Current Session
            </button>
            <p className="text-xs text-gray-500 mt-1 text-center">This will clear the current mission, chat, and files, but keep your settings and profile.</p>
       </div>
    </div>
  );
};
// cel