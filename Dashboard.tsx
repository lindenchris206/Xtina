
import React from 'react';
import AgentStatusGrid from './AgentStatusGrid';
import ActivityLog from './ActivityLog';
import PerformanceChart from './PerformanceChart';
import KnowledgeBaseMonitor from './KnowledgeBaseMonitor';
import Header from './Header';

const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <Header />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <PerformanceChart />
        </div>
        <div className="lg:col-span-1">
          <KnowledgeBaseMonitor />
        </div>
      </div>
      <AgentStatusGrid />
      <ActivityLog />
    </div>
  );
};

export default Dashboard;
