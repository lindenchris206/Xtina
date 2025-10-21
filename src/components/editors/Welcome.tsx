import React from 'react';

const Welcome: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-gray-500">
      <h1 className="text-2xl font-bold text-gray-400">Welcome to AI Crew Commander</h1>
      <p className="mt-2">Select a file from the explorer to begin editing.</p>
    </div>
  );
};

export default Welcome;
