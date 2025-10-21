import React, { useEffect } from 'react';

export const AnimatedBackground: React.FC = () => {

    useEffect(() => {
        const canvas = document.getElementById('background-canvas') as HTMLCanvasElement;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let frameId: number;
        const gridSize = 25;
        let time = 0;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        const draw = () => {
            time += 0.005;
            if (!ctx) return;
            
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.strokeStyle = 'rgba(78, 197, 255, 0.2)'; // Primary color with alpha
            ctx.lineWidth = 1;

            for (let x = 0; x < canvas.width; x += gridSize) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, canvas.height);
                ctx.stroke();
            }

            for (let y = 0; y < canvas.height; y += gridSize) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(canvas.width, y);
                ctx.stroke();
            }

            // Add some glowing particles
            ctx.fillStyle = 'rgba(174, 113, 255, 0.5)'; // Secondary color
            for (let i = 0; i < 50; i++) {
                const x = (Math.sin(i * 0.5 + time) * 0.4 + 0.5) * canvas.width;
                const y = (Math.cos(i * 0.3 - time) * 0.4 + 0.5) * canvas.height;
                const radius = Math.sin(i + time) * 1 + 1.5;
                ctx.beginPath();
                ctx.arc(x, y, radius > 0 ? radius : 0, 0, Math.PI * 2);
                ctx.fill();
            }

            frameId = requestAnimationFrame(draw);
        };

        window.addEventListener('resize', resize);
        resize();
        draw();

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(frameId);
        };
    }, []);

    return null; // This component only manages the canvas, it doesn't render anything itself
};
