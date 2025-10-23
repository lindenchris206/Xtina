import React from 'react';
import { AIEngineState, AIEngineModel, Agent, KnowledgeBundle } from '../types';
import { CpuChipIcon, UserCircleIcon, BookOpenIcon, XCircleIcon, PlusCircleIcon } from './IconComponents';
import Avatar from './Avatar';

interface EnginePanelProps {
  engineState: AIEngineState;
  onModelChange: (model: AIEngineModel) => void;
  onAssignAgent: (slotIndex: number) => void;
  onUnassignAgent: (slotIndex: number) => void;
  onAssignBundle: (slotIndex: number) => void;
  onUnassignBundle: (slotIndex: number) => void;
  isSelectedForAssignment: 'agent' | 'bundle' | null;
}

const EnginePanel: React.FC<EnginePanelProps> = ({
  engineState,
  onModelChange,
  onAssignAgent,
  onUnassignAgent,
  onAssignBundle,
  onUnassignBundle,
  isSelectedForAssignment,
}) => {

  const Slot = ({ item, onAssign, onUnassign, type }: { item: Agent | KnowledgeBundle | null; onAssign: () => void; onUnassign: () => void; type: 'agent' | 'bundle' }) => {
    const canAssign = isSelectedForAssignment === type && !item;
    
    return (
      <div className="relative h-16">
        {item ? (
          <div className="w-full h-full glass-panel rounded-lg p-2 flex items-center justify-between transition-all duration-300 border border-cyan-500/50">
            <div className="flex items-center space-x-2 overflow-hidden">
                {type === 'agent' ? (
                  <Avatar src={(item as Agent).avatar} size="sm" />
                ) : (
                  <BookOpenIcon className="w-6 h-6 text-cyan-400 flex-shrink-0" />
                )}
                <span className="text-xs text-slate-300 truncate">{item.name}</span>
            </div>
            <button onClick={onUnassign} className="text-slate-500 hover:text-red-500 transition-colors flex-shrink-0">
              <XCircleIcon className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <button
            onClick={onAssign}
            disabled={!canAssign}
            className={`w-full h-full border-2 border-dashed rounded-lg flex items-center justify-center transition-all duration-300
              ${canAssign ? 'border-fuchsia-500 bg-fuchsia-500/10 text-fuchsia-400 cursor-pointer hover:bg-fuchsia-500/20' : 'border-slate-700 text-slate-600'}`}
          >
            <PlusCircleIcon className="w-8 h-8" />
          </button>
        )}
      </div>
    );
  };
  
  return (
    <div className="glass-panel rounded-xl p-4 flex flex-col space-y-4 h-full">
      {/* Header */}
      <div className="flex items-center space-x-3 border-b border-cyan-500/20 pb-3">
        <CpuChipIcon className="w-8 h-8 text-cyan-400" />
        <div>
          <h2 className="font-orbitron text-lg font-bold text-cyan-300">{engineState.name}</h2>
          <select
            value={engineState.model}
            onChange={(e) => onModelChange(e.target.value as AIEngineModel)}
            className="bg-slate-900/50 border border-cyan-500/30 rounded text-cyan-300 text-xs focus:ring-cyan-500 focus:border-cyan-500 p-1"
          >
            {Object.values(AIEngineModel).map(model => <option key={model} value={model}>{model}</option>)}
          </select>
        </div>
      </div>

      {/* Agents */}
      <div>
        <h3 className="flex items-center space-x-2 text-sm font-bold text-slate-400 mb-2">
          <UserCircleIcon className="w-5 h-5" />
          <span>Assigned Agents</span>
        </h3>
        <div className="grid grid-cols-1 gap-2">
          {engineState.agents.map((agent, index) => (
            <Slot 
              key={`agent-${index}`} 
              item={agent}
              type="agent"
              onAssign={() => onAssignAgent(index)}
              onUnassign={() => onUnassignAgent(index)}
            />
          ))}
        </div>
      </div>
      
      {/* Bundles */}
      <div>
        <h3 className="flex items-center space-x-2 text-sm font-bold text-slate-400 mb-2">
          <BookOpenIcon className="w-5 h-5" />
          <span>Knowledge Bundles</span>
        </h3>
        <div className="grid grid-cols-1 gap-2">
          {engineState.bundles.map((bundle, index) => (
            <Slot
              key={`bundle-${index}`}
              item={bundle}
              type="bundle"
              onAssign={() => onAssignBundle(index)}
              onUnassign={() => onUnassignBundle(index)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default EnginePanel;