
export interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  text: string;
  ts: string;
}

export interface Agent {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
}
