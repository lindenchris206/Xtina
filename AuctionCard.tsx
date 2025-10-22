import React, { useState, useEffect } from 'react';
import { AuctionItem, AuctionStatus } from '../types';

interface AuctionCardProps {
    item: AuctionItem;
    onSetMaxBid: (id: string, amount: number) => void;
    onAnalyze: (item: AuctionItem) => void;
}

const statusStyles = {
    [AuctionStatus.WATCHING]: { text: 'text-blue-400', border: 'border-blue-500/50', glow: 'shadow-[0_0_8px_rgba(96,165,250,0.4)]' },
    [AuctionStatus.SNIPING]: { text: 'text-pink-400', border: 'border-pink-500/50', glow: 'shadow-[0_0_12px_rgba(236,72,153,0.6)] animate-pulse' },
    [AuctionStatus.WON]: { text: 'text-green-400', border: 'border-green-500/50', glow: 'shadow-[0_0_10px_rgba(74,222,128,0.5)]' },
    [AuctionStatus.LOST]: { text: 'text-red-400', border: 'border-red-500/50', glow: 'shadow-none' },
    [AuctionStatus.ENDED]: { text: 'text-gray-500', border: 'border-gray-500/50', glow: 'shadow-none' },
};

const Countdown: React.FC<{ endTime: Date }> = ({ endTime }) => {
    const [timeLeft, setTimeLeft] = useState('');

    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date();
            const diff = endTime.getTime() - now.getTime();

            if (diff <= 0) {
                setTimeLeft('00:00:00');
                clearInterval(interval);
                return;
            }

            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            setTimeLeft(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
        }, 1000);

        return () => clearInterval(interval);
    }, [endTime]);
    
    return <span className="font-mono text-lg font-bold glowing-text-blue">{timeLeft || '...'}</span>;
};


const AuctionCard: React.FC<AuctionCardProps> = ({ item, onSetMaxBid, onAnalyze }) => {
    const [bid, setBid] = useState(item.maxBid?.toString() || '');
    const styles = statusStyles[item.status];

    return (
        <div className={`glass-card p-4 rounded-lg border ${styles.border} ${styles.glow} flex flex-col`}>
            <img src={item.imageUrl} alt={item.title} className="rounded-md h-32 w-full object-cover mb-3" />
            <h3 className="font-bold text-white text-md leading-tight flex-grow">{item.title}</h3>
            <p className="text-xs text-purple-300 mb-2">{item.marketplace}</p>
            
            <div className="flex justify-between items-center my-2">
                <div>
                    <p className="text-xs text-gray-400">Current Bid</p>
                    <p className="text-xl font-bold text-green-400 glowing-text-blue">${item.currentBid.toFixed(2)}</p>
                </div>
                <div className="text-right">
                    <p className="text-xs text-gray-400">Time Left</p>
                    <Countdown endTime={item.endTime} />
                </div>
            </div>
            
            <div className="text-xs text-gray-400 mb-2">
                Max Snipe Bid: <span className="font-bold text-pink-400">{item.maxBid ? `$${item.maxBid.toFixed(2)}` : 'Not Set'}</span>
            </div>

            <div className="flex space-x-2 my-2">
                <span className="self-center text-lg text-gray-200">$</span>
                <input 
                    type="number"
                    value={bid}
                    onChange={(e) => setBid(e.target.value)}
                    placeholder="Set max bid"
                    className="w-full bg-black/30 border border-gray-600 rounded-md px-2 py-1 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button onClick={() => onSetMaxBid(item.id, parseFloat(bid))} className="px-3 py-1 text-sm bg-purple-600 text-white rounded-md hover:bg-purple-500 transition-colors font-semibold">
                    Set
                </button>
            </div>
            <div className="flex space-x-2 mt-2">
                 <button onClick={() => onAnalyze(item)} className="flex-1 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-500 transition-colors font-semibold">Analyze</button>
                 <button className="flex-1 px-3 py-1.5 text-sm bg-pink-600 text-white rounded-md hover:bg-pink-500 transition-colors font-semibold">Snipe</button>
            </div>
            <div className={`text-center mt-3 text-xs font-bold uppercase ${styles.text}`}>
                Status: {item.status}
            </div>
        </div>
    );
};

export default AuctionCard;
