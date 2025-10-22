import React, { useState } from 'react';
import { AuctionItem, AuctionStatus } from '../types';
import AuctionCard from './AuctionCard';
import ImageAnalysisModal from './ImageAnalysisModal';
import { Gavel, Search } from './icons/Icons';
import BrowserManager from './BrowserManager';

const initialAuctions: AuctionItem[] = [
    { id: 'sg1', title: 'Vintage Sterling Silver Flatware Set - 45 Pcs', imageUrl: 'https://picsum.photos/seed/flatware/300/200', marketplace: 'ShopGoodwill', currentBid: 125.50, endTime: new Date(Date.now() + 3600000 * 2), status: AuctionStatus.WATCHING },
    { id: 'eb1', title: 'Professional Model Flute - Solid Silver Headjoint', imageUrl: 'https://picsum.photos/seed/flute/300/200', marketplace: 'eBay', currentBid: 350.00, endTime: new Date(Date.now() + 3600000 * 8), status: AuctionStatus.WATCHING, maxBid: 450.00 },
    { id: 'la1', title: 'Lot of Assorted Antique Pocket Watches (Non-working)', imageUrl: 'https://picsum.photos/seed/watches/300/200', marketplace: 'Local Auction', currentBid: 80.00, endTime: new Date(Date.now() + 3600000 * 24), status: AuctionStatus.WATCHING },
    { id: 'sg2', title: 'Antique Wooden Jewelry Box with Inlay', imageUrl: 'https://picsum.photos/seed/box/300/200', marketplace: 'ShopGoodwill', currentBid: 25.00, endTime: new Date(Date.now() + 3600000 * 0.5), status: AuctionStatus.SNIPING, maxBid: 50.00 },
];

const suggestedDeals: AuctionItem[] = [
    { id: 'sug1', title: 'Rare Collectible Coin Set - Graded', imageUrl: 'https://picsum.photos/seed/coins/300/200', marketplace: 'eBay', currentBid: 210.00, endTime: new Date(Date.now() + 3600000 * 12), status: AuctionStatus.WATCHING },
    { id: 'sug2', title: 'Signed First Edition Hardcover Book', imageUrl: 'https://picsum.photos/seed/book/300/200', marketplace: 'ShopGoodwill', currentBid: 15.00, endTime: new Date(Date.now() + 3600000 * 3), status: AuctionStatus.WATCHING },
]

const AuctionHouse: React.FC = () => {
    const [auctions, setAuctions] = useState<AuctionItem[]>(initialAuctions);
    const [selectedItem, setSelectedItem] = useState<AuctionItem | null>(null);

    const handleSetMaxBid = (id: string, amount: number) => {
        setAuctions(auctions.map(a => a.id === id ? { ...a, maxBid: amount, status: AuctionStatus.SNIPING } : a));
    };

    const handleAnalyze = (item: AuctionItem) => {
        setSelectedItem(item);
    };

    return (
        <div className="space-y-6">
             <div>
                <h1 className="text-3xl font-orbitron font-bold text-white flex items-center"><Gavel className="mr-3"/>Auction House</h1>
                <p className="text-blue-300">Watchdog & Sniper agent operations center.</p>
            </div>
            
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2 space-y-6">
                    <div>
                        <h2 className="text-xl font-orbitron font-bold text-white mb-4">Tracked Auctions</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {auctions.map(item => (
                                <AuctionCard key={item.id} item={item} onSetMaxBid={handleSetMaxBid} onAnalyze={handleAnalyze} />
                            ))}
                        </div>
                    </div>
                     <div>
                        <h2 className="text-xl font-orbitron font-bold text-white mb-4 flex items-center"><Search className="mr-2"/>Watchdog's Suggested Deals</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {suggestedDeals.map(item => (
                                <AuctionCard key={item.id} item={item} onSetMaxBid={handleSetMaxBid} onAnalyze={handleAnalyze} />
                            ))}
                        </div>
                    </div>
                </div>

                <div className="xl:col-span-1">
                    <BrowserManager />
                </div>
            </div>

            {selectedItem && (
                <ImageAnalysisModal item={selectedItem} onClose={() => setSelectedItem(null)} />
            )}
        </div>
    );
};

export default AuctionHouse;
