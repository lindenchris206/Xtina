import React from 'react';
import { Bot } from './icons/Icons';

const BrowserManager: React.FC = () => {
    return (
        <div className="glass-card p-4 rounded-lg h-full">
            <h2 className="text-xl font-orbitron font-bold text-white mb-4 flex items-center">
                <Bot className="w-6 h-6 mr-2 text-purple-400" />
                Browser Automation
            </h2>
            <p className="text-sm text-gray-400 mb-4">
                Manage agent-controlled browser instances for untrackable scraping and account management.
            </p>
            <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-black/30 rounded-md">
                    <span className="font-bold text-blue-300">Brave (Privacy Mode)</span>
                    <div className="flex items-center space-x-2">
                        <span className="text-xs text-green-400">2 Active</span>
                        <button className="px-2 py-1 text-xs bg-green-600 rounded">Launch</button>
                    </div>
                </div>
                 <div className="flex justify-between items-center p-3 bg-black/30 rounded-md">
                    <span className="font-bold text-gray-400">Chrome</span>
                    <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">0 Active</span>
                        <button className="px-2 py-1 text-xs bg-gray-600 rounded">Launch</button>
                    </div>
                </div>
                 <div className="flex justify-between items-center p-3 bg-black/30 rounded-md">
                    <span className="font-bold text-gray-400">Firefox</span>
                     <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">0 Active</span>
                        <button className="px-2 py-1 text-xs bg-gray-600 rounded">Launch</button>
                    </div>
                </div>
            </div>
             <div className="mt-4 p-3 border-t border-purple-500/20">
                <h3 className="font-semibold text-purple-300">Auto-fill & Identity Vault</h3>
                <p className="text-xs text-gray-400 mt-1">
                    Securely manage logins and data for automated account creation and checkout. Status: <span className="text-green-400 font-bold">Connected</span>
                </p>
            </div>
        </div>
    );
};

export default BrowserManager;
