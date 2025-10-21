
import { Agent } from '../types';

let agentsRegistry: Agent[] = [
  { id: 'agent-logger', name: 'Logger Agent', description: 'Collects logs', enabled: true },
  { id: 'agent-media', name: 'Media Processor', description: 'Processes media', enabled: false }
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
