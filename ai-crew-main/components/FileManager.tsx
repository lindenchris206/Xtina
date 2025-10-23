import React, { useRef } from 'react';
import type { GeneratedFile } from '../types';
import { FileIcon, DownloadIcon, UploadIcon, PackageIcon, SearchIcon, FileTextIcon, UploadCloudIcon, ShareIcon, GithubIcon } from './icons';
import { useMission } from '../context/MissionContext';

interface FileManagerProps {
  files: GeneratedFile[];
  onFileSelect: (file: GeneratedFile) => void;
  activeFilename?: string;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  totalFileCount: number;
}

const ActionButton: React.FC<{ onClick: () => void, title: string, disabled?: boolean, children: React.ReactNode }> = ({ onClick, title, disabled, children }) => (
    <button 
        onClick={onClick} 
        title={title} 
        disabled={disabled}
        className="flex items-center justify-center gap-2 px-3 py-2 text-sm bg-gray-800/70 hover:bg-indigo-500/50 rounded-md transition-colors disabled:bg-gray-700/50 disabled:cursor-not-allowed disabled:text-gray-400"
    >
        {children}
    </button>
);


export const FileManager: React.FC<FileManagerProps> = ({ files, onFileSelect, activeFilename, searchTerm, onSearchChange, totalFileCount }) => {
  const { addSpecialCommand, uploadFiles, appState } = useMission();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDownload = (file: GeneratedFile) => {
    if (!file.content) return;
    const isDataURL = file.content.startsWith('data:');
    const blob = isDataURL 
      ? new Blob([Buffer.from(file.content.split(',')[1], 'base64')], { type: file.mimeType })
      : new Blob([file.content], { type: 'text/plain;charset=utf-8' });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
        uploadFiles(event.target.files);
    }
  };

  const handleDownloadProject = () => addSpecialCommand({ type: 'DOWNLOAD_PROJECT', issuedBy: 'user' });
  const handleGenerateReadme = () => addSpecialCommand({ type: 'GENERATE_README', issuedBy: 'user' });
  const handleDeployProject = () => addSpecialCommand({ type: 'DEPLOY_PROJECT', issuedBy: 'user' });
  const handleShareProject = () => addSpecialCommand({ type: 'SHARE_PROJECT', issuedBy: 'user' });
  const handleCreateRepo = () => addSpecialCommand({ type: 'CREATE_GITHUB_REPO', issuedBy: 'user' });

  return (
    <div className="p-4 glassmorphism rounded-xl h-full flex flex-col">
      <div className="flex-shrink-0">
        <h3 className="text-2xl font-orbitron text-indigo-300 mb-4">Project Files</h3>

        <div className="relative mb-4">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <span className="w-5 h-5 text-gray-400"><SearchIcon /></span>
          </span>
          <input
            type="text"
            placeholder={`Search ${totalFileCount} files...`}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-gray-900/50 border border-white/20 rounded-md pl-10 pr-4 py-2 text-sm focus:ring-cyan-500 focus:border-cyan-500"
          />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 mb-4">
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" multiple />
            <ActionButton onClick={handleUploadClick} title="Upload Files"><UploadIcon /><span>Upload</span></ActionButton>
            <ActionButton onClick={handleGenerateReadme} disabled={totalFileCount === 0} title="Generate README.md"><FileTextIcon /><span>README</span></ActionButton>
            <ActionButton onClick={handleDownloadProject} disabled={totalFileCount === 0} title="Download Project as ZIP"><PackageIcon /><span>Download</span></ActionButton>
            <ActionButton onClick={handleShareProject} disabled={totalFileCount === 0} title="Share Project"><ShareIcon /><span>Share</span></ActionButton>
            <ActionButton onClick={handleCreateRepo} disabled={totalFileCount === 0} title="Create GitHub Repo"><GithubIcon /><span>Repo</span></ActionButton>
            <ActionButton onClick={handleDeployProject} disabled={appState.missionStatus !== 'complete' && totalFileCount === 0} title="Deploy Project"><UploadCloudIcon /><span>Deploy</span></ActionButton>
        </div>
      </div>

      <div className="flex-grow min-h-0 overflow-y-auto scrollbar-thin -mr-2 pr-2">
        {files.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-4">
              {searchTerm ? `No files match your search for "${searchTerm}".` : "No files have been generated or uploaded yet."}
          </p>
        ) : (
          <div className="space-y-2">
            {files.map((file, index) => (
              <div 
                key={`${file.filename}-${index}`} 
                className={`bg-gray-900/50 rounded-lg border transition-all duration-200 ${activeFilename === file.filename ? 'border-cyan-500' : 'border-white/10'}`}
              >
                  <div className="flex justify-between items-center p-3 cursor-pointer" onClick={() => onFileSelect(file)}>
                      <div className="flex items-center gap-3 min-w-0">
                          <span className="text-cyan-400 flex-shrink-0 w-5 h-5"><FileIcon /></span>
                          <p className="text-sm font-medium truncate" title={file.filename}>{file.filename}</p>
                          {file.isUploaded && <span className="text-xs bg-indigo-500/50 text-indigo-300 px-2 py-0.5 rounded-full flex-shrink-0">Uploaded</span>}
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); handleDownload(file); }} className="p-1 text-gray-400 hover:text-white transition ml-2">
                          <DownloadIcon />
                      </button>
                  </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};