import React from 'react';
// FIX: Module '"../types"' has no exported member 'ProjectStatus'. Replaced with 'MissionStatus'.
import { MissionStatus } from '../types';
// FIX: Module '"./icons"' has no exported member 'LoadingSpinner'. Replaced with 'LoadingIcon'.
import { LoadingIcon } from './icons';

interface ProjectStatusDisplayProps {
  status: MissionStatus;
  error?: string | null;
}

const ProjectStatusDisplay: React.FC<ProjectStatusDisplayProps> = ({ status, error }) => {
  const getStatusInfo = () => {
    // FIX: Use string literals for MissionStatus instead of enum-like access.
    switch (status) {
      case 'idle':
        return { text: "Ready to start. Define your project goal.", color: "text-gray-400" };
      case 'planning':
        return { text: "Consulting with the strategist to create a project plan...", color: "text-blue-400", loading: true };
      // FIX: 'TASKS_PLANNED' is not a valid MissionStatus. 'awaiting_approval' is the equivalent.
      case 'awaiting_approval':
        return { text: "Plan assembled. The crew is ready for execution.", color: "text-cyan-400" };
      case 'executing':
        return { text: "Crew is executing tasks. Merging results...", color: "text-blue-400", loading: true };
      case 'complete':
        return { text: "Project complete! Final report generated.", color: "text-green-400" };
      default:
        return { text: "Unknown status", color: "text-gray-500" };
    }
  };

  const statusInfo = getStatusInfo();

  if (error) {
    return (
      <div className="text-center p-4 rounded-lg bg-red-900/50 border border-red-700">
        <p className="font-semibold text-red-300">An Error Occurred</p>
        <p className="text-sm text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-center space-x-2 p-4 rounded-lg bg-gray-800/60 border border-gray-700 ${statusInfo.loading ? 'animate-pulse' : ''}`}>
      {statusInfo.loading && <LoadingIcon className={`w-5 h-5 ${statusInfo.color}`} />}
      <p className={`font-medium ${statusInfo.color}`}>{statusInfo.text}</p>
    </div>
  );
};

export default ProjectStatusDisplay;
