
import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp } from './icons/Icons';

const initialData = [
  { time: '12:00', deals: 10, scans: 2500 },
  { time: '12:05', deals: 12, scans: 2800 },
  { time: '12:10', deals: 11, scans: 2600 },
  { time: '12:15', deals: 15, scans: 3100 },
  { time: '12:20', deals: 18, scans: 3500 },
  { time: '12:25', deals: 17, scans: 3300 },
];

const PerformanceChart: React.FC = () => {
    const [data, setData] = useState(initialData);

    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date();
            const time = `${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}`;
            const newDeals = Math.floor(Math.random() * 10) + 10;
            const newScans = Math.floor(Math.random() * 1000) + 2500;
            
            setData(prevData => [...prevData.slice(1), { time, deals: newDeals, scans: newScans }]);
        }, 5000);

        return () => clearInterval(interval);
    }, []);


    return (
        <div className="glass-card p-4 rounded-lg h-80 flex flex-col">
            <h2 className="text-xl font-orbitron font-bold text-white mb-4 flex items-center"><TrendingUp className="w-6 h-6 mr-2 text-purple-400" />Performance Metrics</h2>
            <div className="flex-1">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <defs>
                            <linearGradient id="colorDeals" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#ec4899" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorScans" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                        <XAxis dataKey="time" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                        <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} />
                        <Tooltip contentStyle={{
                            backgroundColor: 'rgba(31, 41, 55, 0.8)',
                            borderColor: '#4f46e5',
                            color: '#e5e7eb'
                        }}/>
                        <Legend wrapperStyle={{fontSize: "14px"}}/>
                        <Area type="monotone" dataKey="deals" name="Deals Found" stroke="#ec4899" fillOpacity={1} fill="url(#colorDeals)" />
                        <Area type="monotone" dataKey="scans" name="Pages Scanned" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorScans)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default PerformanceChart;
