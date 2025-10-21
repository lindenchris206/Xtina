import React from 'react';
// FIX: Module '"../types"' has no exported member 'Task'. Replaced with 'PrioritizedTask'.
import type { PrioritizedTask as Task, CrewMember } from '../types';
// FIX: Module '"./icons"' has no exported member 'LoadingSpinner'. Replaced with 'LoadingIcon'.
import { LoadingIcon } from './icons';

interface TaskCardProps {
  task: Task;
  crewMember?: CrewMember;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, crewMember }) => {
  const getStatusPill = () => {
    switch (task.status) {
      // FIX: Status values should be lowercase and 'IN_PROGRESS' should be 'working'.
      case 'pending':
        return <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-gray-700 text-gray-300">Pending</span>;
      case 'working':
        return <span className="flex items-center text-xs font-medium px-2.5 py-0.5 rounded-full bg-blue-900 text-blue-300"><LoadingIcon className="w-3 h-3 mr-1" /> In Progress</span>;
      case 'complete':
        return <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-green-900 text-green-300">Done</span>;
      default:
        return null;
    }
  };

  return (
    <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700 space-y-3 transition-all duration-300">
      <div className="flex justify-between items-start">
        {/* FIX: Property 'description' does not exist on type 'PrioritizedTask'. Use 'task' instead. */}
        <p className="text-gray-200 font-semibold pr-4">{task.task}</p>
        {getStatusPill()}
      </div>
      {crewMember && (
        <div className="flex items-center text-xs text-gray-400">
          {/* FIX: 'crewMember.icon' is a ReactNode, not a component. It should be wrapped to apply styles. */}
          <span className="w-4 h-4 mr-2 text-cyan-400">{crewMember.icon}</span>
          <span>Assigned to: {crewMember.name}</span>
        </div>
      )}
      {task.status === 'complete' && task.result && (
        <div className="bg-gray-900/70 p-3 rounded-md mt-2 border border-gray-700">
          <p className="text-sm text-gray-300 whitespace-pre-wrap font-mono">{task.result}</p>
        </div>
      )}
    </div>
  );
};

export default TaskCard;
