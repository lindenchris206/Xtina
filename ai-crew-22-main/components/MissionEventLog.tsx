import React, { useEffect, useRef } from 'react';
import type { MissionEvent } from '../types';
import { ThumbsUpIcon, ThumbsDownIcon } from './icons'; // Assuming these icons exist

// FIX: Populating file with necessary content and logic.
interface MissionEventLogProps {
  events: MissionEvent[];
}

const eventStyles = {
  info: 'text-gray-400',
  success: 'text-green-400',
  warning: 'text-yellow-400',
  error: 'text-red-400',
  thought: 'text-indigo-400 italic',
};

export const MissionEventLog: React.FC<MissionEventLogProps> = ({ events }) => {
  const endOfLogRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endOfLogRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [events]);

  return (
    <div className="space-y-2 p-2" aria-live="polite" aria-atomic="true">
      {events.map((event, index) => (
        <div key={index} className={`text-xs group ${eventStyles[event.type]} flex items-start gap-2`}>
          <div className="flex-shrink-0">
            <span className="text-gray-500 mr-2">{event.timestamp}</span>
            {event.agent && <span className="font-bold mr-1 text-cyan-400">{`[${event.agent}]`}</span>}
          </div>
          <div className="flex-grow">
            <span>{event.message}</span>
             {event.sources && event.sources.length > 0 && (
              <div className="mt-1 text-gray-500">
                Sources:
                <ul className="list-disc list-inside">
                  {event.sources.map((source, i) => (
                    <li key={i}><a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-cyan-500 hover:underline">{source.title || source.uri}</a></li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          {event.type === 'thought' && (
              <div className="flex-shrink-0 flex items-center gap-2 opacity-0 group-hover:opacity-50 transition-opacity">
                  <button title="Good insight"><ThumbsUpIcon className="w-3 h-3 hover:text-green-400"/></button>
                  <button title="Poor insight"><ThumbsDownIcon className="w-3 h-3 hover:text-red-400"/></button>
              </div>
          )}
        </div>
      ))}
      <div ref={endOfLogRef} />
    </div>
  );
};
