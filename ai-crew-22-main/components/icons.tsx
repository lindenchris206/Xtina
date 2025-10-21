import React from 'react';

const Icon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-5 h-5"
    {...props}
  >
    {props.children}
  </svg>
);

export const CodeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Icon {...props}><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></Icon>;
export const BrainIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Icon {...props}><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08.5.5 0 0 0-.8-.64A5.5 5.5 0 0 0 2.5 16.5v-11A4.5 4.5 0 0 1 7 1h2.5" /><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08.5.5 0 0 1 .8-.64A5.5 5.5 0 0 1 21.5 16.5v-11A4.5 4.5 0 0 0 17 1h-2.5" /></Icon>;
export const DatabaseIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Icon {...props}><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" /><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" /></Icon>;
export const PaletteIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Icon {...props}><circle cx="12" cy="5" r="3" /><path d="M6.5 10a2 2 0 1 1 4 0 2 2 0 0 1-4 0Z" /><path d="M10.5 13a2 2 0 1 1 4 0 2 2 0 0 1-4 0Z" /><path d="M14.5 10a2 2 0 1 1 4 0 2 2 0 0 1-4 0Z" /><path d="m4.5 17.5 4-4" /><path d="M19.5 17.5 14 22" /><path d="M12 22a7 7 0 0 0 7-7h-4a3 3 0 0 1-6 0H5a7 7 0 0 0 7 7Z" /></Icon>;
export const TerminalIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Icon {...props}><polyline points="4 17 10 11 4 5" /><line x1="12" y1="19" x2="20" y2="19" /></Icon>;
export const ShieldIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Icon {...props}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></Icon>;
export const BarChartIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Icon {...props}><line x1="12" y1="20" x2="12" y2="10" /><line x1="18" y1="20" x2="18" y2="4" /><line x1="6" y1="20" x2="6" y2="16" /></Icon>;
export const GitBranchIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Icon {...props}><line x1="6" y1="3" x2="6" y2="15" /><circle cx="18" cy="6" r="3" /><circle cx="6" cy="18" r="3" /><path d="M18 9a9 9 0 0 1-9 9" /></Icon>;
export const BugIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Icon {...props}><path d="m8 2 1.88 1.88" /><path d="M14.12 3.88 16 2" /><path d="M9 7.13v-1a3.003 3.003 0 1 1 6 0v1" /><path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6" /><path d="M12 20v-9" /><path d="M6.53 9C4.6 8.8 3 7.1 3 5" /><path d="M20.97 5c0 2.1-1.6 3.8-3.53 4" /><path d="M7 13h-2" /><path d="M17 13h2" /></Icon>;
export const FileTextIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Icon {...props}><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><line x1="10" y1="9" x2="8" y2="9" /></Icon>;
export const AtomIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Icon {...props}><circle cx="12" cy="12" r="1" /><path d="M20.2 20.2c2.04-2.03.02-7.36-4.5-11.9-4.54-4.52-9.87-6.54-11.9-4.5-2.04 2.03-.02 7.36 4.5 11.9 4.54 4.52 9.87 6.54 11.9 4.5Z" /><path d="M3.8 20.2c-2.04-2.03-.02-7.36 4.5-11.9 4.54-4.52 9.87-6.54 11.9-4.5 2.04 2.03.02 7.36-4.5 11.9-4.54 4.52-9.87 6.54-11.9 4.5Z" /></Icon>;
export const SigmaIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Icon {...props}><path d="M18 7V4H6v3" /><path d="M18 17v3H6v-3" /><path d="m6 12 12-5" /><path d="m6 12 12 5" /></Icon>;
export const LegalIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Icon {...props}><path d="m14 7 4 4" /><path d="M12 20h-5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.4.6l4.1 4.1a2 2 0 0 1 .6 1.4V14" /><path d="M2 22h12" /><path d="M7 16h2" /><path d="M6 11h1" /><path d="M11 11h2" /></Icon>;
export const FinanceIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Icon {...props}><line x1="12" x2="12" y1="2" y2="22" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></Icon>;
export const BusinessIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Icon {...props}><path d="M3 22V6.7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2V22" /><path d="M6 18h12" /><path d="M10 14h4" /><path d="M10 10h4" /><path d="M10 6h4" /><path d="M12 2v2.7" /></Icon>;
export const ResearchIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Icon {...props}><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></Icon>;
export const MarketingIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Icon {...props}><path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10z" /><path d="M12 12v6" /><path d="m15 15-3 3-3-3" /></Icon>;
export const IoTIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Icon {...props}><path d="M5 12a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1Z" /><path d="M13 12a1 1 0 0 0-1-1h-1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1Z" /><path d="M21 12a1 1 0 0 0-1-1h-1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1Z" /><path d="M12 19a1 1 0 0 0-1-1h-1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1Z" /><path d="M12 5a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1Z" /><path d="M7 6v1" /><path d="m16 6 1-1" /><path d="M4 11H3" /><path d="m18 11-1 1" /><path d="M9 18v1" /><path d="M12 15v-1" /><path d="m15 13-1-1" /><path d="m7 16-1 1" /><path d="m18 18-1-1" /><path d="M21 15h-1" /><path d="m11 6-1-1" /><path d="M12 9v-1" /></Icon>;
export const EthicsIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Icon {...props}><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></Icon>;
export const MobileIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Icon {...props}><rect x="5" y="2" width="14" height="20" rx="2" ry="2" /><line x1="12" y1="18" x2="12.01" y2="18" /></Icon>;
export const ContentIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Icon {...props}><path d="M4 22h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Z" /><path d="M15 2v20" /><path d="M15 7h-5" /><path d="M15 12h-5" /><path d="M15 17h-5" /></Icon>;
export const NetworkIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Icon {...props}><rect x="16" y="16" width="6" height="6" rx="1" /><rect x="2" y="16" width="6" height="6" rx="1" /><rect x="9" y="2" width="6" height="6" rx="1" /><path d="M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3" /><path d="M12 12V8" /></Icon>;
export const PlayIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Icon {...props}><polygon points="5 3 19 12 5 21 5 3" /></Icon>;
export const RefreshIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Icon {...props}><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" /><path d="M3 7v9" /><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" /><path d="M21 17v-9" /></Icon>;
export const PauseIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Icon {...props}><line x1="6" y1="4" x2="6" y2="20" /><line x1="18" y1="4" x2="18" y2="20" /></Icon>;
export const StopIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Icon {...props}><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /></Icon>;
export const MicrophoneIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Icon {...props}><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" y1="19" x2="12" y2="22" /></Icon>;
export const FileIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Icon {...props}><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /></Icon>;
export const FolderIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Icon {...props}><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /></Icon>;
export const ChevronDownIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Icon {...props}><polyline points="6 9 12 15 18 9" /></Icon>;
export const ChevronRightIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Icon {...props}><polyline points="9 18 15 12 9 6" /></Icon>;
export const ChevronUpIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Icon {...props}><polyline points="18 15 12 9 6 15" /></Icon>;
export const CogIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Icon {...props}><path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16z" /><path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" /><path d="M12 2v2" /><path d="M12 22v-2" /><path d="m17 20.66-1-1.73" /><path d="M11 10.27 7 3.34" /><path d="m20.66 17-1.73-1" /><path d="m3.34 7 1.73 1" /><path d="M14 12h8" /><path d="M2 12h2" /><path d="m20.66 7-1.73 1" /><path d="m3.34 17 1.73-1" /><path d="m17 3.34-1 1.73" /><path d="m11 13.73-4 6.93" /></Icon>;
export const ThumbsUpIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Icon {...props}><path d="M7 10v12" /><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3 3 0 0 1 3 3z" /></Icon>;
export const ThumbsDownIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Icon {...props}><path d="M17 14V2" /><path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22h0a3 3 0 0 1-3-3z" /></Icon>;
export const HelpIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Icon {...props}><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" /></Icon>;
export const GitCommitIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Icon {...props}><circle cx="12" cy="12" r="3" /><line x1="12" y1="2" x2="12" y2="9" /><line x1="12" y1="15" x2="12" y2="22" /></Icon>;
export const ShareIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Icon {...props}><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" /></Icon>;
export const InboxIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Icon {...props}><polyline points="22 12 16 12 14 15 10 15 8 12 2 12" /><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" /></Icon>;