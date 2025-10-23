import React from 'react';

export interface CrewMember {
  name: string;
  specialty: string;
  secondarySpecialty: string;
  personality: string;
  description: string;
  icon: React.ReactElement;
  simulatedModel: string;
}

export interface Settings {
  theme: 'astra' | 'nebula' | 'starship';
  crewSize: number;
  mode: 'quick' | 'deliberate';
  astraAvatar: string;
  crewConfig: CrewMember[];
  crewModelAssignments: Record<string, string>;
}

export type MissionStatus = 'idle' | 'planning' | 'awaiting_approval' | 'executing' | 'paused' | 'complete' | 'error';

export interface ProjectFile {
  name: string;
  path: string;
  content: string;
  isFolder: boolean;
  children?: ProjectFile[];
  imageUrl?: string; // For image files
}

export interface GroundedSource {
    uri: string;
    title: string;
}

export interface MissionEvent {
  type: 'info' | 'success' | 'warning' | 'error' | 'thought';
  message: string;
  agent?: string;
  timestamp: string;
  sources?: GroundedSource[];
}

export interface PrioritizedTask {
  id: number;
  task: string;
  member: string;
  priority: number;
  dependencies: number[];
  isComplete: boolean;
}

export interface CrewMemberStatus {
  status: 'idle' | 'working' | 'assisting' | 'complete' | 'error';
  currentTask?: string;
  progress: number;
}

export interface DeliberationStep {
    agent: string;
    thought: string;
}

export interface MissionPlan {
  projectName: string;
  summary: string;
  deliberation: DeliberationStep[];
  tasks: PrioritizedTask[];
}

export interface MissionDebrief {
    projectName: string;
    summary: string;
    tasksCompleted: number;
    filesCreated: number;
    finalCost: number;
    collaborators: string[];
}

export interface GitCommit {
    hash: string;
    message: string;
    timestamp: string;
}

export interface GitState {
    initialized: boolean;
    modified: string[];
    staged: string[];
    commits: GitCommit[];
}

// New types for Comms Center
export interface Email {
    id: string;
    accountId: string;
    folder: 'Inbox' | 'Sent' | 'Drafts' | 'Trash';
    from: { name: string; email: string };
    to: { name: string; email: string }[];
    subject: string;
    body: string;
    timestamp: string;
    isRead: boolean;
    labels: string[];
}

export type EmailFolderName = 'Inbox' | 'Sent' | 'Drafts' | 'Trash';

export interface EmailFolder {
    name: EmailFolderName;
    unreadCount: number;
}

export interface EmailAccount {
    id: string;
    name: string;
    email: string;
    folders: EmailFolder[];
}

export interface CommsState {
    accounts: EmailAccount[];
    emails: Email[];
    selectedAccountId: string | null;
    selectedFolder: EmailFolderName | null;
    selectedEmailId: string | null;
    isComposing: boolean;
    composeMode: 'new' | 'reply' | 'forward';
    composeFields: {
        to: string;
        subject: string;
        body: string;
    };
}

export interface MissionState {
  settings: Settings;
  missionObjective: string;
  missionStatus: MissionStatus;
  plan: MissionPlan | null;
  missionDebrief: MissionDebrief | null;
  projectFiles: ProjectFile[];
  selectedFile: ProjectFile | null;
  crewStatuses: Record<string, CrewMemberStatus>;
  missionEvents: MissionEvent[];
  totalComputeUnits: number;
  currentTaskIndex: number;
  failedTaskIndex: number | null;
  gitState: GitState;
  isAstraSpeaking: boolean;
  commsState: CommsState;
}

export type MissionAction =
    | { type: 'SET_SETTINGS'; payload: Partial<Settings> }
    | { type: 'SET_MISSION_OBJECTIVE'; payload: string }
    | { type: 'START_PLANNING' }
    | { type: 'PLANNING_COMPLETE'; payload: MissionPlan }
    | { type: 'PLANNING_FAILED'; payload: string }
    | { type: 'APPROVE_PLAN' }
    | { type: 'PAUSE_MISSION' }
    | { type: 'RESUME_MISSION' }
    | { type: 'ABORT_MISSION' }
    | { type: 'MISSION_COMPLETE' }
    | { type: 'START_NEW_MISSION' }
    | { type: 'ADD_EVENT'; payload: MissionEvent }
    | { type: 'UPDATE_CREW_STATUS'; payload: { name: string; status: Partial<CrewMemberStatus> } }
    | { type: 'UPDATE_FILE_TREE'; payload: ProjectFile[] }
    | { type: 'SELECT_FILE'; payload: ProjectFile }
    | { type: 'UPDATE_FILE_CONTENT'; payload: { path: string, newContent: string } }
    | { type: 'INCREMENT_TASK_INDEX' }
    | { type: 'SKIP_FAILED_TASK' }
    | { type: 'TASK_FAILED'; payload: { index: number, error: string } }
    | { type: 'ADD_COMPUTE_UNITS'; payload: number }
    | { type: 'IMPORT_MISSION_STATE'; payload: any }
    | { type: 'GIT_INIT' }
    | { type: 'GIT_STAGE_ALL' }
    | { type: 'GIT_COMMIT'; payload: string }
    | { type: 'SET_ASTRA_SPEAKING'; payload: boolean }
    // Comms Center Actions
    | { type: 'COMMS_SELECT_FOLDER'; payload: { accountId: string, folderName: EmailFolderName } }
    | { type: 'COMMS_SELECT_EMAIL'; payload: { emailId: string | null } }
    | { type: 'COMMS_UPDATE_EMAIL_STATUS'; payload: { emailId: string, isRead: boolean } }
    | { type: 'COMMS_START_COMPOSE'; payload: { mode: CommsState['composeMode'], email?: Email } }
    | { type: 'COMMS_UPDATE_COMPOSE_FIELD'; payload: { field: keyof CommsState['composeFields'], value: string } }
    | { type: 'COMMS_SEND_EMAIL' }
    | { type: 'COMMS_DISCARD_COMPOSE' };