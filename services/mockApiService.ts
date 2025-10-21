import { Agent } from '../types';

// Fix: Add the required 'secondarySpecialties' property to the mock agent objects to match the 'Agent' type definition.
let agentsRegistry: Agent[] = [
  { id: 'agent-logger', name: 'Logger Agent', primarySpecialty: 'logging', description: 'Collects logs', secondarySpecialties: [], knowledgeBundles: [], enabled: true },
  { id: 'agent-media', name: 'Media Processor', primarySpecialty: 'media', description: 'Processes media', secondarySpecialties: [], knowledgeBundles: [], enabled: false }
];

const delay = <T,>(data: T): Promise<T> => new Promise(res => setTimeout(() => res(data), 300));

export const getAgents = async (): Promise<Agent[]> => {
    return delay([...agentsRegistry]);
};

export const setAgentEnabled = async (id: string, enabled: boolean): Promise<Agent> => {
    const agent = agentsRegistry.find(a => a.id === id);
    if (!agent) {
        throw new Error('Agent not found');
    }
    agent.enabled = enabled;
    return delay({...agent});
};