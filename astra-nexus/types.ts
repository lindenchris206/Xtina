import React from 'react';

// For Agent Roster and Assignments
export interface Agent {
  id: string;
  name: string;
  role: string;
  avatar: string;
  description: string;
}

// For Knowledge Bundles
export enum ContentType {
  PDF = 'pdf',
  DOCX = 'docx',
  MARKDOWN = 'md',
  TXT = 'txt',
  URL = 'url',
  CODE = 'code',
}

export interface KnowledgeItem {
  id: string;
  name: string;
  type: ContentType;
  source: string;
  added: string;
}

export interface KnowledgeBundle {
  id: string;
  name: string;
  description: string;
  contentCount: number;
  contents: KnowledgeItem[];
  lastUpdated: string;
}

// For AI Engine Configuration
export enum AIEngineModel {
  GEMINI_FLASH = 'gemini-2.5-flash',
  GEMINI_PRO = 'gemini-2.5-pro',
  CLAUDE_OPUS = 'Claude 3 Opus',
}

export interface AIEngineState {
  id: string;
  name: string;
  model: AIEngineModel;
  agents: (Agent | null)[];
  bundles: (KnowledgeBundle | null)[];
}

// For Main Page Navigation
export interface PageModule {
  id: string;
  name: string;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  component: React.ReactElement;
}

// For Offline Engines Page
export type DownloadStatus = 'idle' | 'downloading' | 'downloaded';

export interface OfflineEngine {
  id: string;
  name: string;
  description: string;
  size: string;
}

// For Data Vault
export interface VaultItemData {
  id: string;
  name: string;
  type: 'folder' | 'file';
  size: string;
  lastModified: string;
  children?: VaultItemData[];
}

// For Terminal/Logging
export interface LogEntry {
  time: string;
  source: string;
  message: string;
  color: string;
}
