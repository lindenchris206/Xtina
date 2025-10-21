import React, { useState, useRef, useCallback } from 'react';
import type { Settings, CrewMember } from '../types';
import { AI_MODEL_OPTIONS, PERSONALITY_OPTIONS } from '../constants';
import { CogIcon, ChevronDownIcon, ChevronUpIcon } from './icons';
import { AVATARS } from './avatars';
import { useMissionContext } from '../hooks/useMissionContext';

export const SettingsPanel: React.FC = () => {
  const { state, dispatch } = useMissionContext();
  const { settings } = state;

  const [isOpen, setIsOpen] = useState(false);
  const [isCrewPersonalizationOpen, setIsCrewPersonalizationOpen] = useState(false);
  const [isModelAssignmentsOpen, setIsModelAssignmentsOpen] = useState(false);
  const importFileInputRef = useRef<HTMLInputElement>(null);

  const onSettingsChange = useCallback((newSettings: Partial<Settings>) => {
    dispatch({ type: 'SET_SETTINGS', payload: newSettings });
  }, [dispatch]);
  
  const handleImportMission = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = JSON.parse(e.target?.result as string);
            dispatch({ type: 'IMPORT_MISSION_STATE', payload: data });
            dispatch({ type: 'ADD_EVENT', payload: { type: 'info', message: 'Mission state imported.', timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) } });
        } catch (error) {
            console.error("Failed to import mission:", error);
            dispatch({ type: 'ADD_EVENT', payload: { type: 'error', message: 'Failed to import mission file. It may be corrupted.', timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) } });
        }
    };
    reader.readAsText(file);
    // Reset file input to allow importing the same file again
    event.target.value = '';
  }, [dispatch]);

  const handleExportMission = useCallback(() => {
    const missionData = {
        ...state
    };
    const blob = new Blob([JSON.stringify(missionData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `astra-mission-${state.plan?.projectName.replace(/\s+/g, '_') || 'export'}.json`;
    a.click();
    URL.revokeObjectURL(url);
    dispatch({ type: 'ADD_EVENT', payload: { type: 'info', message: 'Mission state exported.', timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) } });
  }, [state, dispatch]);

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
  
  const crewSizeOptions = [
      { label: `Core (4)`, value: 4 },
      { label: `Strike Team (8)`, value: 8 },
      { label: `Task Force (12)`, value: 12 },
      { label: `Vanguard (16)`, value: 16 },
      { label: `Legion (${settings.crewConfig.length})`, value: settings.crewConfig.length },
  ];

  return (
    <div className="glassmorphism rounded-xl p-4">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex justify-between items-center w-full"
      >
        <div className="flex items-center gap-3">
            <span className="w-6 h-6 text-cyan-300"><CogIcon/></span>
            <h3 className="text-xl font-orbitron text-indigo-300">Configuration & Settings</h3>
        </div>
        {isOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
      </button>

      {isOpen && (
        <div className="mt-4 pt-4 border-t border-white/10 space-y-6">
          
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
              <div>
                  <label htmlFor="mode" className="block text-sm font-medium text-gray-300 mb-1">Processing Mode</label>
                  <select
                      id="mode"
                      value={settings.mode}
                      onChange={(e) => onSettingsChange({ mode: e.target.value as 'quick' | 'deliberate' })}
                      className="w-full bg-gray-900/50 border border-white/20 rounded-md px-3 py-1.5 focus:ring-cyan-500 focus:border-cyan-500"
                  >
                      <option value="quick">Quick Mode</option>
                      <option value="deliberate">Deliberate Mode</option>
                  </select>
                  <p className="text-xs text-gray-400 mt-1">Quick mode prioritizes speed. Deliberate mode prioritizes quality.</p>
              </div>
          </div>

           {/* Import/Export */}
          <div className="pt-4 border-t border-white/10">
              <h4 className="text-lg font-orbitron text-indigo-300 mb-2">Mission Data</h4>
              <div className="flex gap-4">
                  <input type="file" ref={importFileInputRef} onChange={handleImportMission} className="hidden" accept=".json"/>
                  <button onClick={() => importFileInputRef.current?.click()} className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded transition-colors">Import Mission</button>
                  <button onClick={handleExportMission} className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded transition-colors">Export Mission</button>
              </div>
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
        </div>
      )}
    </div>
  );
};