import React, { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

interface ArchitectureDiagramProps {
  content: string;
}

mermaid.initialize({
  startOnLoad: false,
  theme: 'dark',
  securityLevel: 'loose',
  fontFamily: 'Roboto, sans-serif',
  themeVariables: {
      background: "#111827", // bg-gray-900
      primaryColor: '#1f2937', // bg-gray-800
      primaryTextColor: '#d1d5db', // text-gray-300
      lineColor: '#4b5563', // border-gray-600
      secondaryColor: '#3b82f6', // blue-500
      tertiaryColor: '#1e40af' // blue-800
  }
});

export const ArchitectureDiagram: React.FC<ArchitectureDiagramProps> = ({ content }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current && content) {
      try {
        // Clear previous diagram
        containerRef.current.innerHTML = '';
        
        // Mermaid expects the diagram definition to be in a div with class 'mermaid'
        const mermaidContainer = document.createElement('div');
        mermaidContainer.className = 'mermaid';
        mermaidContainer.textContent = content;
        containerRef.current.appendChild(mermaidContainer);
        
        // Render the diagram
        mermaid.run({ nodes: [mermaidContainer] });

      } catch (error) {
        console.error("Mermaid rendering error:", error);
        if (containerRef.current) {
          containerRef.current.innerHTML = `<div class="text-red-400 p-4">Error rendering diagram. The generated Mermaid syntax may be invalid.</div>`;
        }
      }
    }
  }, [content]);

  return (
    <div className="h-full w-full bg-gray-900/70 rounded-md p-4 overflow-auto scrollbar-thin">
      <div ref={containerRef} className="w-full h-full flex items-center justify-center">
        {/* Mermaid will render here */}
      </div>
    </div>
  );
};