import React from 'react';
import { FileText, Search, Database } from './icons/Icons';

const researchLinks = {
    "E-commerce Data & APIs": [
        { name: "eBay Developers Program", url: "#" },
        { name: "ShopGoodwill API (Unofficial Docs)", url: "#" },
        { name: "Marketplace Pulse - E-commerce Intelligence", url: "#" },
    ],
    "Retail Mathematics & Valuation": [
        { name: "Calculating Gross Margin", url: "#" },
        { name: "Inventory Turnover Ratio Explained", url: "#" },
        { name: "Guide to Antique Appraisals", url: "#" },
    ],
    "Knowledge Bases": [
        { name: "Online Encyclopedia of Silver Marks", url: "#" },
        { name: "WatchUSeek Forums", url: "#" },
        { name: "The Gemological Institute of America (GIA)", url: "#" },
    ]
}

const Research: React.FC = () => {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-orbitron font-bold text-white flex items-center"><FileText className="mr-3"/>Research & Knowledge</h1>
                <p className="text-blue-300">Centralized intelligence for agent enhancement.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(researchLinks).map(([category, links]) => (
                     <div key={category} className="glass-card p-4 rounded-lg">
                        <h2 className="text-xl font-orbitron font-bold text-pink-300 mb-4">{category}</h2>
                        <ul className="space-y-3">
                            {links.map(link => (
                                <li key={link.name}>
                                    <a href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center text-blue-300 hover:text-white hover:underline transition-colors">
                                        <Search className="w-4 h-4 mr-2" />
                                        <span>{link.name}</span>
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
             <div className="glass-card p-4 rounded-lg mt-6">
                <h2 className="text-xl font-orbitron font-bold text-pink-300 mb-4 flex items-center"><Database className="mr-2"/>Internal Database Viewer</h2>
                <p className="text-gray-400">
                    This section will provide a direct interface to view, query, and generate reports from the crew's collected knowledge bases on materials, makers, price histories, and more.
                </p>
                <div className="mt-4 text-center p-8 border-2 border-dashed border-gray-600 rounded-md">
                    <p className="text-gray-500">Database Interface Coming Soon</p>
                </div>
            </div>
        </div>
    );
};

export default Research;
