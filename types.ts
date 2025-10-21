
export interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  text: string;
  ts: string;
}

export interface Agent {
  name: string;
  primarySpecialty: string;
  secondarySpecialties?: string[];
  knowledgeBundles?: string[];
  currentEngine?: string;
  engineOptions?: string[];
  selfImprove?: boolean;
  help?: string[];
  // Fix: Add optional properties to support mockApiService, which appears to use a different agent structure.
  id?: string;
  description?: string;
  enabled?: boolean;
}

export interface Task {
    id: string;
    title: string;
    status: 'queued' | 'running' | 'done' | 'failed';
    assignedAgent?: string;
    completedAt?: string;
}

export interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
}
