export interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  text: string;
  ts: string;
  imageUrl?: string;
}

export interface Agent {
  id?: string;
  name: string;
  description: string;
  primarySpecialty: string;
  secondarySpecialties?: string[];
  knowledgeBundles: string[];
  currentEngine?: string;
  engineOptions?: string[];
  selfImprove?: boolean;
  help?: string[];
  enabled?: boolean;
}

export interface Task {
    id: string;
    title: string;
    status: 'queued' | 'running' | 'done' | 'failed';
    assignedAgent?: string;
    completedAt?: string;
    prompt?: string;
    output?: {
      type: 'text' | 'image';
      content: string;
    }
}

export interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
}