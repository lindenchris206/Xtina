
import React from 'react';
import { Bell } from './icons/Icons';

const Header: React.FC = () => {
    return (
        <div className="flex justify-between items-center mb-4">
            <div>
                <h1 className="text-3xl font-orbitron font-bold text-white">Dashboard</h1>
                <p className="text-blue-300">Live operational overview of AI agent crew.</p>
            </div>
            <div className="flex items-center space-x-4">
                 <button className="relative p-2 rounded-full hover:bg-purple-500/20 text-gray-400 hover:text-white transition">
                    <Bell className="w-6 h-6"/>
                    <span className="absolute top-0 right-0 h-2.5 w-2.5 bg-pink-500 rounded-full border-2 border-gray-800"></span>
                </button>
                <div className="w-10 h-10 rounded-full bg-gray-700 border-2 border-purple-500">
                    <img src="https://i.pravatar.cc/40?u=admin" alt="Admin" className="rounded-full"/>
                </div>
            </div>
        </div>
    );
};

export default Header;
