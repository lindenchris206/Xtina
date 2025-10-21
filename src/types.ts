// FIX: Added CouncilMessage interface to resolve import error in src/App.tsx.
export interface CouncilMessage {
  agentName: string;
  response: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'ai' | 'system';
  text: string;
  ts: string;
  imageUrl?: string;
  // FIX: Use the specific CouncilMessage type instead of any[].
  councilMessages?: CouncilMessage[];
}

export interface Agent {
  name: string;
  description: string;
  primarySpecialty: string;
  secondarySpecialties: string[];
  knowledgeBundles: any[];
  currentEngine: string;
  engineOptions: string[];
}

export interface Task {
    id: string;
    title: string;
    status: 'queued' | 'running' | 'done' | 'failed';
    assignedAgent?: string;
    completedAt?: string;
    prompt?: string;
    output?: {
      type: 'text' | 'image' | 'council';
      content: string;
      councilMessages?: any[];
    }
}

// FIX: Added Conversation interface required by the updated useChat hook.
export interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
}

export type FileSystemNode = {
  name: string;
  type: 'file' | 'folder';
  children?: FileSystemNode[];
  fileType?: 'image' | 'video' | 'pdf' | 'code' | 'document' | 'terminal' | 'unknown';
};
