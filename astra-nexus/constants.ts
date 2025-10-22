import React from 'react';
import { Agent, KnowledgeBundle, AIEngineState, AIEngineModel, ContentType, PageModule, OfflineEngine, VaultItemData } from './types';
import { UserCircleIcon, BookOpenIcon, CpuChipIcon, Squares2X2Icon, ArrowDownTrayIcon } from './components/IconComponents';

import AICrewCommanderPage from './pages/AICrewCommanderPage';
import PlaceholderPage from './pages/PlaceholderPage';
import OfflineEnginesPage from './pages/OfflineEnginesPage';
import DataVaultPage from './pages/DataVaultPage';

export const AGENTS_DATA: Agent[] = [
  { id: 'agent-1', name: 'Cypher', role: 'Code & Security Analyst', avatar: '/avatars/01.png', description: 'Specializes in code analysis, vulnerability detection, and secure development practices.' },
  { id: 'agent-2', name: 'Helios', role: 'Data Scientist', avatar: '/avatars/02.png', description: 'Expert in statistical modeling, machine learning, and extracting insights from large datasets.' },
  { id: 'agent-3', name: 'Orion', role: 'UX/UI Strategist', avatar: '/avatars/03.png', description: 'Focuses on user-centric design, creating intuitive interfaces and improving user experience.' },
  { id: 'agent-4', name: 'Nova', role: 'Creative Content Generator', avatar: '/avatars/04.png', description: 'Generates high-quality text, from marketing copy to technical documentation.' },
  { id: 'agent-5', name: 'Warden', role: 'Project Manager & QA', avatar: '/avatars/05.png', description: 'Oversees project timelines, ensures quality standards are met, and coordinates agent tasks.' },
];

export const KNOWLEDGE_BUNDLES_DATA: KnowledgeBundle[] = [
  {
    id: 'bundle-1',
    name: 'React Design Patterns',
    description: 'Advanced component patterns and state management.',
    contentCount: 5,
    lastUpdated: '2024-07-20',
    contents: [
      { id: 'c1-1', name: 'Render Props.pdf', type: ContentType.PDF, source: 'local', added: '2024-07-10' },
      { id: 'c1-2', name: 'Hooks Deep Dive.md', type: ContentType.MARKDOWN, source: 'local', added: '2024-07-11' },
    ],
  },
  {
    id: 'bundle-2',
    name: 'API Security Best Practices',
    description: 'Authentication, authorization, and threat mitigation.',
    contentCount: 8,
    lastUpdated: '2024-07-18',
    contents: [],
  },
  {
    id: 'bundle-3',
    name: 'Project Chimera Documentation',
    description: 'Internal specs and user stories for the current project.',
    contentCount: 21,
    lastUpdated: '2024-07-21',
    contents: [],
  },
];

export const INITIAL_ENGINE_STATES: AIEngineState[] = [
    {
      id: 'engine-alpha',
      name: 'ENGINE_ALPHA',
      model: AIEngineModel.GEMINI_PRO,
      agents: [null, null],
      bundles: [null, null],
    },
    {
      id: 'engine-beta',
      name: 'ENGINE_BETA',
      model: AIEngineModel.CLAUDE_OPUS,
      agents: [null],
      bundles: [null],
    },
];

// Fix: Replaced JSX with React.createElement to avoid syntax errors in a .ts file.
// The TypeScript compiler was misinterpreting the JSX as type assertions.
export const PAGE_MODULES: PageModule[] = [
    { id: 'data-vault', name: 'Data Vault', icon: Squares2X2Icon, component: React.createElement(DataVaultPage) },
    { id: 'ai-crew', name: 'AI Crew Commander', icon: CpuChipIcon, component: React.createElement(AICrewCommanderPage) },
    { id: 'offline-engines', name: 'Offline Engines', icon: ArrowDownTrayIcon, component: React.createElement(OfflineEnginesPage) },
    { id: 'mission-control', name: 'Mission Control', icon: UserCircleIcon, component: React.createElement(PlaceholderPage, { title: "Mission Control" }) },
    { id: 'knowledge-hub', name: 'Knowledge Hub', icon: BookOpenIcon, component: React.createElement(PlaceholderPage, { title: "Knowledge Hub" }) },
];

export const OFFLINE_ENGINES: OfflineEngine[] = [
  { id: 'offline-1', name: 'Nexus-Lite-7B', description: 'A compact, efficient model for on-device summarization and Q&A.', size: '4.1 GB' },
  { id: 'offline-2', name: 'Nexus-Code-13B-Instruct', description: 'Optimized for code generation, completion, and debugging tasks.', size: '7.5 GB' },
  { id: 'offline-3', name: 'Nexus-Vision-Alpha', description: 'A multi-modal engine for basic image understanding and captioning.', size: '5.6 GB' },
];

export const VAULT_DATA: VaultItemData = {
  id: 'root',
  name: 'Project Astra Nexus',
  type: 'folder',
  size: '1.2 GB',
  lastModified: '2024-07-21 14:30',
  children: [
    {
      id: 'folder-1', name: 'src', type: 'folder', size: '876 MB', lastModified: '2024-07-21 11:05',
      children: [
        { id: 'folder-2', name: 'components', type: 'folder', size: '213 MB', lastModified: '2024-07-20 09:15', children: [
          { id: 'file-1', name: 'EnginePanel.tsx', type: 'file', size: '8 KB', lastModified: '2024-07-19 18:45' },
          { id: 'file-2', name: 'RosterPanel.tsx', type: 'file', size: '4 KB', lastModified: '2024-07-19 18:45' },
        ]},
        { id: 'folder-3', name: 'pages', type: 'folder', size: '102 MB', lastModified: '2024-07-21 11:05', children: []},
        { id: 'file-3', name: 'App.tsx', type: 'file', size: '3 KB', lastModified: '2024-07-21 10:20' },
      ]
    },
    { id: 'folder-4', name: 'docs', type: 'folder', size: '128 MB', lastModified: '2024-07-15 14:00', children: [
      { id: 'file-4', name: 'Project_Brief.pdf', type: 'file', size: '2.1 MB', lastModified: '2024-07-10 10:00' },
    ]},
    { id: 'file-5', name: 'README.md', type: 'file', size: '12 KB', lastModified: '2024-07-21 14:30' },
  ]
};