import React, { useEffect, useRef } from 'react';

// FIX: Populating file with necessary content and logic.
interface LogMessage {
  timestamp: string;
  message: string;
}

interface TerminalProps {
  logs: LogMessage[];
}

export const Terminal: React.FC<TerminalProps> = ({ logs }) => {
  const endOfLogsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endOfLogsRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="bg-black text-white font-mono text-xs p-4 h-64 overflow-y-auto rounded-lg scrollbar-thin">
      {logs.map((log, index) => (
        <div key={index} className="flex">
          <span className="text-gray-500 mr-2">{log.timestamp}</span>
          <p className="flex-grow">{log.message}</p>
        </div>
      ))}
      <div ref={endOfLogsRef} />
    </div>
  );
};
