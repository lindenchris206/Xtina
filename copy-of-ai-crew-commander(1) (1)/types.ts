/**
 * @author cel
 * @file types.ts
 * @description Defines all TypeScript types and interfaces for the application.
 */
import React from 'react';

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'astra' | 'crew';
  senderName?: string;
  senderIcon?: React.ReactNode;
  isLoading?: boolean;
  isError?: boolean;
  tasks?: PrioritizedTask[];
  deliberation?: DeliberationStep[];
  isPlanApproval?: boolean;
  missionDebrief?: MissionDebrief;
  failedTask?: boolean;
  automationPlan?: AutomationStep[];
}

export type CrewMemberStatusValue = 'idle' | 'working' | 'assisting' | 'complete' | 'error' | 'training';

export interface CrewMemberStatus {
    status: CrewMemberStatusValue;
    progress: number;
    xp: number;
    level: number;
    currentTask?: string;
}

export interface CrewMember {
  name: string;
  specialty: string;
  secondarySpecialty: string;
  personality: string;
  icon: React.ReactNode;
  simulatedModel: string;
  knowledgeBase: string;
}

export interface GeneratedFile {
  filename: string;
  content: string;
  language?: string;
  isUploaded?: boolean;
  mimeType?: string;
}

export interface PrioritizedTask {
  id: number;
  member: string;
  task: string;
  priority: number;
  dependencies: number[];
  imageInput?: string;
  status: 'pending' | 'working' | 'complete' | 'error';
  result?: string;
}

export interface DeliberationStep {
  member: string;
  critique: string;
  suggestion: string;
}

export interface Plan {
  projectName: string;
  tasks: PrioritizedTask[];
  deliberation?: DeliberationStep[];
}

export interface MissionDebrief {
    projectName: string;
    summary: string;
    tasksCompleted: number;
    filesCreated: number;
    finalCost: number;
    collaborators: string[];
}

export type MissionStatus = 'idle' | 'planning' | 'awaiting_approval' | 'executing' | 'complete' | 'error';

export interface CrewMessage {
    id: string;
    text: string;
    sender: 'user' | string; // user or crew member name
    isLoading?: boolean;
}

export interface DeploymentLog {
    step: string;
    status: 'pending' | 'running' | 'success' | 'failed';
}

export type ApplicationName = 'ide' | 'browser' | 'api_keys' | 'dashboard' | 'comms' | 'timeline' | 'intel' | 'settings' | 'roster' | 'email' | 'vault' | 'capabilities';

export interface APIKey {
    id: string;
    service: string;
    key: string;
}

export interface User {
    id: string;
    username: string;
    passwordHash: string;
    role: 'admin' | 'user';
}

export interface Credential {
    id: string;
    url: string;
    username: string;
    password?: string;
}

export interface EmailAccount {
    id: string;
    service: 'work' | 'gmail' | 'yahoo' | 'hotmail';
    email: string;
    signature: string;
}

export interface EmailSettings {
    undoSendTime: number; // in seconds
}

export interface UserProfile {
    fullName: string;
    email: string;
    username: string;
    githubUsername: string;
    apiKeys: APIKey[];
    credentials: Credential[];
    emailAccounts: EmailAccount[];
    emailSettings: EmailSettings;
}

export type AutomationAction = 'navigate' | 'type' | 'click' | 'submit';

export interface AutomationStep {
    action: AutomationAction;
    target?: string; // Can be a URL, selector, etc.
    value?: string; // For typing
    valueFromProfile?: keyof UserProfile; // For autofill
    waitForNav?: boolean; // Wait for navigation after a click
    thought?: string; // AI's thought process for this step
}

export interface SimulatedBrowserState {
    currentURL: string;
    isLoading: boolean;
    history: string[];
    formValues: Record<string, string>;
    activeElement: string | null;
}

export type VoiceCommandStatus = 'idle' | 'listening' | 'triggered' | 'processing' | 'error';

export interface ResearchResult {
    summary: string;
    sources: { uri: string; title: string }[];
}

export interface MissionEvent {
  id: string;
  timestamp: string;
  type: 'TASK_COMPLETE' | 'FILE_CREATED' | 'COMMAND_ISSUED' | 'MISSION_START' | 'MISSION_COMPLETE' | 'ERROR';
  text: string;
  author?: string;
}

export interface Commit {
    id: string;
    message: string;
    files: string[];
    timestamp: string;
}

export interface AppState {
    missionStatus: MissionStatus;
    messages: Message[];
    plan: Plan | null;
    generatedFiles: GeneratedFile[];
    crewStatuses: Record<string, CrewMemberStatus>;
    crewChat: Record<string, CrewMessage[]>;
    knowledgeBase: string;
    archivedMissions: { id: string; name: string; date: string; state: AppState }[];
    deploymentStatus: 'idle' | 'running' | 'success' | 'failed';
    deploymentLogs: DeploymentLog[];
    userProfile: UserProfile;
    browserState: SimulatedBrowserState;
    activeApp: ApplicationName;
    voiceStatus: VoiceCommandStatus;
    currentUser: User | null;
    activeCommsChannel: string | null;
    users: User[];
    researchResult: ResearchResult | null;
    missionEvents: MissionEvent[];
    commitHistory: Commit[];
    authorSignature: string;
    automationPlan: AutomationStep[] | null;
}

export interface Settings {
    theme: 'astra' | 'nebula' | 'starship';
    crewSize: number;
    astraAvatar: string;
    mode: 'quick' | 'deep_thinking' | 'deliberations';
    crewModelAssignments: Record<string, string>;
    crewConfig: CrewMember[];
    enableVoice: boolean;
}

export interface SpecialCommand {
  type: 'SKIP_TASK' | 'DOWNLOAD_PROJECT' | 'GENERATE_README' | 'DEPLOY_PROJECT' | 'GENERATE_TESTS' | 'REVIEW_CODE' | 'CREATE_GITHUB_REPO' | 'SHARE_PROJECT';
  issuedBy: 'user' | 'astra';
  payload?: any;
}

export interface Contact {
  name: string;
  email: string;
}

export interface Email {
  id: string;
  sender: string;
  senderEmail: string;
  recipient: string;
  subject: string;
  body: string;
  date: string;
  read: boolean;
  tags: string[];
  accountId: string;
  folder: 'inbox' | 'sent' | 'drafts' | 'archive' | 'trash' | 'scheduled';
  sendAt?: number;
}