
import React, { useState, useEffect, useCallback } from 'react';
import { LogEntry } from '../types';
import { summarizeActivities } from '../services/geminiService';
import { Terminal } from './icons/Icons';

const initialLogs: LogEntry[] = [
    { id: 1, timestamp: new Date().toLocaleTimeString(), agentName: 'System', message: 'AI Crew Commander initialized.', level: 'info' },
    { id: 2, timestamp: new Date().toLocaleTimeString(), agentName: 'Crawler-01', message: 'Beginning scan of ShopGoodwill.', level: 'info' },
];

const logMessages = [
    { agent: 'Crawler-02', msg: 'Found 15 new listings matching "sterling silver".', level: 'info' },
    { agent: 'Vision-01', msg: 'Image analysis request received for item #SG-12345.', level: 'info' },
    { agent: 'Vision-01', msg: 'Hallmark detected: Gorham Silver. Confidence: 92%.', level: 'info' },
    { agent: 'Valuation-01', msg: 'Calculating market value for Gorham Chantilly set.', level: 'info' },
    { agent: 'Sniper-01', msg: 'Auction ending in T-5 minutes. Preparing to bid.', level: 'info' },
    { agent: 'Watchdog-01', msg: 'Target seller "AntiqueFinds" posted a new item.', level: 'info' },
    { agent: 'Crawler-01', msg: 'Rate limit detected on eBay API. Throttling requests.', level: 'warn' },
    { agent: 'Vision-02', msg: 'Failed to identify blurry maker\'s mark. Confidence: 15%.', level: 'error' },
];

const LogLevelIndicator: React.FC<{ level: 'info' | 'warn' | 'error' }> = ({ level }) => {
    const styles = {
        info: 'text-blue-400',
        warn: 'text-yellow-400',
        error: 'text-red-400',
    };
    return <span className={`mr-2 font-bold ${styles[level]}`}>{level.toUpperCase()}</span>;
};


const ActivityLog: React.FC = () => {
    const [logs, setLogs] = useState<LogEntry[]>(initialLogs);
    const [summary, setSummary] = useState('');
    const [isLoadingSummary, setIsLoadingSummary] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            const randomLog = logMessages[Math.floor(Math.random() * logMessages.length)];
            const newLog: LogEntry = {
                id: Date.now(),
                timestamp: new Date().toLocaleTimeString(),
                agentName: randomLog.agent,
                message: randomLog.msg,
                level: randomLog.level as 'info' | 'warn' | 'error',
            };

            setLogs(prevLogs => [newLog, ...prevLogs.slice(0, 99)]);
        }, 3000);

        return () => clearInterval(interval);
    }, []);
    
    const handleGenerateSummary = useCallback(async () => {
        setIsLoadingSummary(true);
        setSummary('');
        try {
            const logMessages = logs.slice(0, 20).map(log => `[${log.agentName}] ${log.message}`);
            const result = await summarizeActivities(logMessages);
            setSummary(result);
        } catch (error) {
            console.error("Error generating summary:", error);
            setSummary("Failed to generate summary. Please check API key and console for details.");
        } finally {
            setIsLoadingSummary(false);
        }
    }, [logs]);

    return (
        <div className="glass-card p-4 rounded-lg">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-orbitron font-bold text-white flex items-center">
                    <Terminal className="w-6 h-6 mr-2 text-purple-400" />
                    Activity Log
                </h2>
                <button 
                    onClick={handleGenerateSummary}
                    disabled={isLoadingSummary}
                    className="px-3 py-1 text-sm bg-pink-600 text-white rounded-md hover:bg-pink-500 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors font-semibold flex items-center space-x-2"
                >
                    {isLoadingSummary && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                    <span>{isLoadingSummary ? 'Generating...' : 'Generate Summary'}</span>
                </button>
            </div>

            {summary && (
                 <div className="mb-4 p-3 bg-purple-900/50 border border-purple-500/50 rounded-md">
                    <h3 className="font-bold text-pink-300 mb-1">AI Summary:</h3>
                    <p className="text-sm text-gray-200 whitespace-pre-wrap">{summary}</p>
                 </div>
            )}

            <div className="h-64 overflow-y-auto bg-black/30 p-2 rounded-md">
                {logs.map(log => (
                    <div key={log.id} className="text-xs text-gray-300 font-mono mb-1 flex">
                        <span className="text-gray-500 mr-2">{log.timestamp}</span>
                        <div>
                            <LogLevelIndicator level={log.level} />
                            <span className="text-purple-300 mr-1">{log.agentName}:</span>
                            <span>{log.message}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ActivityLog;
