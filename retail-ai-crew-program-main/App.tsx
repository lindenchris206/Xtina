import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import AuctionHouse from './components/AuctionHouse';
import Research from './components/Research';
import FileManager from './components/FileManager';
import { ActiveView } from './types';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<ActiveView>(ActiveView.DASHBOARD);

  const renderContent = () => {
    switch (activeView) {
      case ActiveView.AUCTIONS:
        return <AuctionHouse />;
      case ActiveView.RESEARCH:
        return <Research />;
      case ActiveView.FILE_MANAGER:
        return <FileManager />;
      case ActiveView.DASHBOARD:
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 animated-gradient bg-gradient-to-br from-gray-900 via-blue-900/40 to-purple-900/50">
      <div className="flex">
        <Sidebar activeView={activeView} setActiveView={setActiveView} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 h-screen overflow-y-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default App;