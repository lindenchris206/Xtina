import React, { useState, useEffect } from 'react';
import { AuctionItem } from '../types';
import { generateItemReport } from '../services/geminiService';
import { Eye, Terminal } from './icons/Icons';

interface ImageAnalysisModalProps {
    item: AuctionItem;
    onClose: () => void;
}

const ImageAnalysisModal: React.FC<ImageAnalysisModalProps> = ({ item, onClose }) => {
    const [report, setReport] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchReport = async () => {
            setIsLoading(true);
            try {
                const result = await generateItemReport(item);
                setReport(result);
            } catch (error) {
                setReport('Error generating report. Please check the console.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchReport();
    }, [item]);

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
            <div className="glass-card rounded-lg border border-purple-500/50 w-full max-w-4xl max-h-[90vh] glowing-border flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-purple-500/20 flex justify-between items-center">
                    <h2 className="text-xl font-orbitron font-bold text-white flex items-center"><Eye className="w-6 h-6 mr-2 text-pink-400"/>Vision Committee Analysis</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">&times;</button>
                </div>

                <div className="p-6 flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                         <img src={item.imageUrl} alt={item.title} className="rounded-lg w-full object-cover" />
                         <h3 className="font-bold text-white text-lg">{item.title}</h3>
                         <p className="text-sm text-gray-400">Current Bid: <span className="font-bold text-green-400">${item.currentBid.toFixed(2)}</span></p>
                    </div>

                    <div className="space-y-4">
                        <div className="p-4 bg-black/30 rounded-lg">
                            <h4 className="font-bold text-pink-300 mb-2 flex items-center"><Terminal className="w-5 h-5 mr-2"/>AI Valuation Report</h4>
                            {isLoading ? (
                                <div className="flex items-center space-x-2 text-gray-300">
                                     <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                     <span>Generating report from Commander...</span>
                                </div>
                            ) : (
                                <p className="text-sm text-gray-200 whitespace-pre-wrap">{report}</p>
                            )}
                        </div>
                        <div className="p-4 bg-black/30 rounded-lg">
                            <h4 className="font-bold text-pink-300 mb-2">Simulated Analysis</h4>
                            <ul className="space-y-2 text-sm">
                                <li className="flex justify-between">
                                    <span className="text-gray-400">Material Analysis:</span>
                                    <span className="text-blue-300 font-mono">Sterling Silver (92.5%)</span>
                                </li>
                                <li className="flex justify-between">
                                    <span className="text-gray-400">Hallmark ID:</span>
                                    <span className="text-blue-300 font-mono">Gorham / Chantilly</span>
                                </li>
                                <li className="flex justify-between">
                                    <span className="text-gray-400">Condition Grade:</span>
                                    <span className="text-blue-300 font-mono">B+ (Minor Tarnish)</span>
                                </li>
                                 <li className="flex justify-between">
                                    <span className="text-gray-400">Confidence Score:</span>
                                    <span className="text-blue-300 font-mono">94%</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                 <div className="p-4 border-t border-purple-500/20 text-right">
                    <button onClick={onClose} className="px-4 py-2 text-sm bg-purple-600 text-white rounded-md hover:bg-purple-500 transition-colors font-semibold">
                        Close Analysis
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ImageAnalysisModal;
