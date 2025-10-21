import React, { useState } from 'react';
import { Agent } from '../types';
import { DeleteIcon } from './icons';

interface AgentEditorModalProps {
  agent: Agent;
  onSave: (agent: Agent, specialties: { primary: string, secondaries: string[] }) => void;
  onClose: () => void;
}

export const AgentEditorModal: React.FC<AgentEditorModalProps> = ({ agent, onSave, onClose }) => {
  const [primary, setPrimary] = useState(agent.primarySpecialty);
  const [secondaries, setSecondaries] = useState(agent.secondarySpecialties || []);
  const [newSecondary, setNewSecondary] = useState('');

  const handleAddSecondary = () => {
    if (newSecondary && !secondaries.includes(newSecondary)) {
      setSecondaries([...secondaries, newSecondary]);
      setNewSecondary('');
    }
  };

  const handleRemoveSecondary = (spec: string) => {
    setSecondaries(secondaries.filter(s => s !== spec));
  };
  
  const handleSave = () => {
    onSave(agent, { primary, secondaries });
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center">
      <div className="w-full max-w-md glassmorphism rounded-lg shadow-2xl p-6 border border-white/10">
        <h2 className="font-orbitron text-lg text-[rgb(var(--color-accent))]">Edit Agent: {agent.name}</h2>
        <p className="text-sm text-[rgb(var(--color-text-muted))] mt-1 mb-4">{agent.description}</p>
        
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-[rgb(var(--color-text-muted))]">Primary Specialty</label>
            <input
              type="text"
              value={primary}
              onChange={e => setPrimary(e.target.value)}
              className="w-full mt-1 p-2 rounded-md bg-white/5 border border-white/10 text-[rgb(var(--color-text))] focus:outline-none focus:ring-1 focus:ring-[rgb(var(--color-primary))]"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-[rgb(var(--color-text-muted))]">Secondary Specialties</label>
            <div className="flex flex-wrap gap-2 mt-1">
              {secondaries.map(spec => (
                <div key={spec} className="bg-[rgb(var(--color-secondary))] text-white/90 text-xs px-2 py-1 rounded-full flex items-center gap-1.5">
                  {spec}
                  <button onClick={() => handleRemoveSecondary(spec)} className="hover:text-red-300">
                    <DeleteIcon width={12} height={12} />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-2">
              <input
                type="text"
                value={newSecondary}
                onChange={e => setNewSecondary(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddSecondary()}
                placeholder="Add new specialty..."
                className="flex-1 p-2 rounded-md bg-white/5 border border-white/10 text-[rgb(var(--color-text))] focus:outline-none focus:ring-1 focus:ring-[rgb(var(--color-primary))]"
              />
              <button onClick={handleAddSecondary} className="px-4 bg-[rgb(var(--color-primary))] text-black font-semibold rounded-md text-sm">Add</button>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
            <button onClick={onClose} className="px-4 py-2 rounded-md bg-white/10 text-white hover:bg-white/20">Cancel</button>
            <button onClick={handleSave} className="px-4 py-2 rounded-md bg-[rgb(var(--color-accent))] text-black font-bold">Save Changes</button>
        </div>
      </div>
    </div>
  );
};