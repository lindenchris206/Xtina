/**
 * Shared TypeScript types for Xtina 4.0
 * Used across frontend and backend
 */

// ===== API KEY MANAGEMENT =====

export interface StoredAPIKey {
  id: string;
  userId: string;
  providerId: string;
  name: string; // User-friendly name for this key
  fields: Record<string, string>; // Encrypted field values
  isActive: boolean;
  lastUsed: Date | null;
  usageCount: number;
  createdAt: Date;
  updatedAt: Date;
  metadata?: {
    testStatus?: 'pending' | 'success' | 'failed';
    testError?: string;
    tags?: string[];
    notes?: string;
  };
}

export interface APIKeyInput {
  providerId: string;
  name: string;
  fields: Record<string, string>;
  metadata?: {
    tags?: string[];
    notes?: string;
  };
}

export interface APIKeyRotation {
  id: string;
  providerId: string;
  keyIds: string[]; // Array of key IDs to rotate through
  strategy: 'round-robin' | 'least-used' | 'random' | 'weighted';
  currentIndex: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ===== AGENT SYSTEM =====

export interface Agent {
  id: string;
  name: string;
  role: string;
  description: string;
  status: 'online' | 'offline' | 'busy' | 'error';
  capabilities: string[];
  engine: 'openai' | 'anthropic' | 'google' | 'custom';
  model?: string;
  avatar?: string;
  config: {
    temperature?: number;
    maxTokens?: number;
    systemPrompt?: string;
    tools?: string[];
  };
  stats: {
    tasksCompleted: number;
    successRate: number;
    avgResponseTime: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo: string | null; // Agent ID
  createdBy: string; // User ID
  dependencies: string[]; // Task IDs
  tags: string[];
  progress: number; // 0-100
  result?: any;
  error?: string;
  startedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskExecution {
  id: string;
  taskId: string;
  agentId: string;
  status: 'running' | 'completed' | 'failed';
  steps: ExecutionStep[];
  logs: LogEntry[];
  startedAt: Date;
  completedAt?: Date;
  duration?: number;
}

export interface ExecutionStep {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  input?: any;
  output?: any;
  error?: string;
  startedAt?: Date;
  completedAt?: Date;
}

export interface LogEntry {
  timestamp: Date;
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  data?: any;
  agentId?: string;
  taskId?: string;
}

// ===== VOICE SERVICE =====

export interface VoiceSettings {
  enabled: boolean;
  provider: 'elevenlabs' | 'browser' | 'openai';
  volume: number; // 0-1
  rate: number; // 0.5-2
  pitch: number; // 0-2
  voice: string; // Voice ID or name
  autoSpeak: boolean;
  queueEnabled: boolean;
}

export interface VoiceQueueItem {
  id: string;
  text: string;
  agentName?: string;
  priority: 'low' | 'normal' | 'high';
  emotion?: 'neutral' | 'happy' | 'sad' | 'angry' | 'excited';
  status: 'pending' | 'playing' | 'completed' | 'failed';
  createdAt: Date;
}

// ===== USER & AUTH =====

export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: 'admin' | 'user' | 'guest';
  avatar?: string;
  preferences: UserPreferences;
  createdAt: Date;
  lastLoginAt: Date;
}

export interface UserPreferences {
  theme: 'dark' | 'light' | 'auto';
  language: string;
  timezone: string;
  notifications: {
    email: boolean;
    push: boolean;
    taskUpdates: boolean;
    agentAlerts: boolean;
  };
  voice: VoiceSettings;
  ui: {
    sidebarCollapsed: boolean;
    compactMode: boolean;
    showAvatars: boolean;
  };
}

export interface Credential {
  id: string;
  userId: string;
  url: string;
  username: string;
  password: string; // Encrypted
  notes?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  lastUsedAt?: Date;
}

// ===== COMMUNICATION =====

export interface EmailAccount {
  id: string;
  userId: string;
  email: string;
  provider: 'gmail' | 'outlook' | 'imap' | 'custom';
  displayName: string;
  isDefault: boolean;
  credentials: {
    type: 'oauth' | 'password' | 'app-password';
    data: string; // Encrypted
  };
  folders: EmailFolder[];
  createdAt: Date;
}

export interface EmailFolder {
  id: string;
  name: string;
  type: 'inbox' | 'sent' | 'drafts' | 'trash' | 'custom';
  unreadCount: number;
}

export interface Email {
  id: string;
  accountId: string;
  folderId: string;
  from: EmailAddress;
  to: EmailAddress[];
  cc?: EmailAddress[];
  bcc?: EmailAddress[];
  subject: string;
  body: string;
  isHtml: boolean;
  isRead: boolean;
  isStarred: boolean;
  hasAttachments: boolean;
  attachments?: EmailAttachment[];
  receivedAt: Date;
  sentAt?: Date;
}

export interface EmailAddress {
  name?: string;
  email: string;
}

export interface EmailAttachment {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
  url?: string;
}

// ===== PROJECT & FILES =====

export interface Project {
  id: string;
  name: string;
  description: string;
  owner: string; // User ID
  members: ProjectMember[];
  status: 'active' | 'archived' | 'on-hold';
  tags: string[];
  metadata: {
    repository?: string;
    framework?: string;
    language?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectMember {
  userId: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  joinedAt: Date;
}

export interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'directory';
  path: string;
  size?: number;
  mimeType?: string;
  content?: string;
  children?: FileNode[];
  createdAt: Date;
  updatedAt: Date;
}

// ===== GIT INTEGRATION =====

export interface GitRepository {
  id: string;
  projectId: string;
  provider: 'github' | 'gitlab' | 'bitbucket' | 'local';
  url: string;
  branch: string;
  status: GitStatus;
  commits: GitCommit[];
  remotes: GitRemote[];
}

export interface GitStatus {
  branch: string;
  ahead: number;
  behind: number;
  staged: string[];
  modified: string[];
  untracked: string[];
  conflicts: string[];
}

export interface GitCommit {
  hash: string;
  author: string;
  email: string;
  message: string;
  timestamp: Date;
  files: string[];
}

export interface GitRemote {
  name: string;
  url: string;
  type: 'fetch' | 'push';
}

// ===== DEPLOYMENT =====

export interface DeploymentPipeline {
  id: string;
  projectId: string;
  name: string;
  steps: DeploymentStep[];
  status: 'idle' | 'running' | 'success' | 'failed';
  currentStep?: number;
  logs: DeploymentLog[];
  startedAt?: Date;
  completedAt?: Date;
}

export interface DeploymentStep {
  id: string;
  name: string;
  command: string;
  status: 'pending' | 'running' | 'success' | 'failed' | 'skipped';
  output?: string;
  error?: string;
  startedAt?: Date;
  completedAt?: Date;
}

export interface DeploymentLog {
  timestamp: Date;
  level: 'info' | 'warn' | 'error';
  message: string;
  stepId?: string;
}

// ===== KNOWLEDGE BASE =====

export interface KnowledgeEntry {
  id: string;
  title: string;
  content: string; // Markdown
  category: string;
  tags: string[];
  author: string; // User ID
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface KnowledgeCategory {
  id: string;
  name: string;
  description: string;
  icon?: string;
  entries: number;
}

// ===== WEBSOCKET EVENTS =====

export interface WebSocketMessage {
  type: string;
  payload: any;
  timestamp: Date;
}

export interface AgentUpdateEvent {
  type: 'agent:update';
  payload: Partial<Agent>;
}

export interface TaskUpdateEvent {
  type: 'task:update';
  payload: Partial<Task>;
}

export interface VoiceSpeakingEvent {
  type: 'voice:speaking:start' | 'voice:speaking:end' | 'voice:stopped';
  payload: {
    item?: VoiceQueueItem;
    agentName?: string;
  };
}

export interface LogEvent {
  type: 'log:new';
  payload: LogEntry;
}

// ===== API RESPONSES =====

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: Date;
}

export interface PaginatedResponse<T> extends APIResponse<T[]> {
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

// ===== STATISTICS & METRICS =====

export interface SystemMetrics {
  agents: {
    total: number;
    online: number;
    busy: number;
    offline: number;
  };
  tasks: {
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
    failed: number;
  };
  apiKeys: {
    total: number;
    active: number;
    providers: number;
  };
  performance: {
    avgResponseTime: number;
    successRate: number;
    uptime: number;
  };
}

export interface UsageStatistics {
  providerId: string;
  totalCalls: number;
  successfulCalls: number;
  failedCalls: number;
  avgResponseTime: number;
  lastUsed: Date;
  costEstimate?: number;
}
