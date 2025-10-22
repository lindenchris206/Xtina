import React from 'react';
import { PageModule } from '../types';
import PageCard from './PageCard';
import { ChevronLeftIcon, ChevronRightIcon } from './IconComponents';

interface DonutCarouselProps {
  items: PageModule[];
  activeIndex: number;
  setActiveIndex: (index: number) => void;
}

const DonutCarousel: React.FC<DonutCarouselProps> = ({ items, activeIndex, setActiveIndex }) => {
  const numItems = items.length;
  const angle = 360 / numItems;
  const radius = 350; // in pixels

  const handlePrev = () => {
    setActiveIndex((activeIndex - 1 + numItems) % numItems);
  };

  const handleNext = () => {
    setActiveIndex((activeIndex + 1) % numItems);
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center">
        {/* Left Control */}
        <button 
            onClick={handlePrev} 
            className="absolute left-1/4 z-20 p-2 rounded-full glass-panel border border-cyan-500/30 hover:bg-cyan-500/20 transition-colors neon-glow"
            aria-label="Previous Page"
        >
          <ChevronLeftIcon className="w-8 h-8 text-cyan-400" />
        </button>
        
        {/* Carousel */}
        <div className="w-full h-full flex items-center justify-center donut-perspective">
            <div className="donut-container" style={{ transform: `rotateY(${-activeIndex * angle}deg)` }}>
            {items.map((page, index) => {
                const itemAngle = index * angle;
                const isSelected = index === activeIndex;
                return (
                <div
                    key={page.id}
                    className="donut-item"
                    style={{
                    transform: `rotateY(${itemAngle}deg) translateZ(${radius}px)`,
                    }}
                    onClick={() => setActiveIndex(index)}
                >
                    <PageCard page={page} isSelected={isSelected} />
                </div>
                );
            })}
            </div>
        </div>

        {/* Right Control */}
        <button 
            onClick={handleNext} 
            className="absolute right-1/4 z-20 p-2 rounded-full glass-panel border border-cyan-500/30 hover:bg-cyan-500/20 transition-colors neon-glow"
            aria-label="Next Page"
        >
          <ChevronRightIcon className="w-8 h-8 text-cyan-400" />
        </button>
    </div>
  );
};

export default DonutCarousel;