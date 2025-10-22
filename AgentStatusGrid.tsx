
import React, { useState, useEffect } from 'react';
import { Agent, AgentStatus, AgentType } from '../types';
import AgentCard from './AgentCard';
import { Bot } from './icons/Icons';

const initialAgents: Agent[] = [
  { id: 'crawler-01', name: 'Crawler-01', type: AgentType.CRAWLER, status: AgentStatus.ONLINE, task: 'Scanning ShopGoodwill for silver', cpuUsage: 35 },
  { id: 'crawler-02', name: 'Crawler-02', type: AgentType.CRAWLER, status: AgentStatus.ONLINE, task: 'Monitoring eBay auctions', cpuUsage: 45 },
  { id: 'vision-01', name: 'Vision-01', type: AgentType.VISION_COMMITTEE, status: AgentStatus.IDLE, task: 'Awaiting image analysis task', cpuUsage: 5 },
  { id: 'vision-02', name: 'Vision-02', type: AgentType.VISION_COMMITTEE, status: AgentStatus.WORKING, task: 'Analyzing hallmarks on flatware', cpuUsage: 88 },
  { id: 'sniper-01', name: 'Sniper-01', type: AgentType.SNIPER, status: AgentStatus.ONLINE, task: 'Watching 3 high-value auctions', cpuUsage: 15 },
  { id: 'valuation-01', name: 'Valuation-01', type: AgentType.VALUATION, status: AgentStatus.WORKING, task: 'Calculating price history for flutes', cpuUsage: 72 },
  { id: 'kb-curator-01', name: 'KB-Curator-01', type: AgentType.KB_CURATOR, status: AgentStatus.IDLE, task: 'Awaiting new data to process', cpuUsage: 2 },
  { id: 'watchdog-01', name: 'Watchdog-01', type: AgentType.WATCHDOG, status: AgentStatus.ERROR, task: 'Connection lost to local marketplace API', cpuUsage: 95 },
];

const AgentStatusGrid: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>(initialAgents);

  useEffect(() => {
    const interval = setInterval(() => {
      setAgents(prevAgents =>
        prevAgents.map(agent => {
          const newStatus = Object.values(AgentStatus)[Math.floor(Math.random() * 4)];
          const newCpuUsage = Math.floor(Math.random() * 100);
          return { ...agent, status: newStatus, cpuUsage: newCpuUsage };
        })
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <h2 className="text-xl font-orbitron font-bold text-white mb-4 flex items-center"><Bot className="w-6 h-6 mr-2 text-purple-400" />Agent Status</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {agents.map(agent => (
          <AgentCard key={agent.id} agent={agent} />
        ))}
      </div>
    </div>
  );
};

export default AgentStatusGrid;
