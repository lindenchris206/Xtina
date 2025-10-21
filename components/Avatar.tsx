// FIX: Add a global JSX type definition for the <model-viewer> custom element to resolve TypeScript errors.
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          src: string;
          alt: string;
          'camera-controls'?: boolean;
          'disable-zoom'?: boolean;
          'camera-orbit'?: string;
          'auto-rotate'?: boolean;
          'auto-rotate-delay'?: string;
          'rotation-per-second'?: string;
          'shadow-intensity'?: string;
          ar?: boolean;
          'ar-modes'?: string;
          // For programmatic access via ref
          animationName?: string;
          play?: (options: { repetitions: number }) => void;
          model?: unknown;
        },
        HTMLElement
      >;
    }
  }
}

import React, { useRef, useEffect } from 'react';

interface AvatarProps {
  isSpeaking: boolean;
}

export const Avatar: React.FC<AvatarProps> = ({ isSpeaking }) => {
  const modelViewerRef = useRef<any>(null);

  useEffect(() => {
    const modelViewer = modelViewerRef.current;
    if (modelViewer) {
      // The 'load' event ensures the model is ready to be interacted with.
      const onLoad = () => {
        // Set the initial animation
        modelViewer.animationName = 'Idle';
        modelViewer.play({ repetitions: Infinity });
      };
      modelViewer.addEventListener('load', onLoad);

      return () => {
        if(modelViewer) {
          modelViewer.removeEventListener('load', onLoad);
        }
      }
    }
  }, []);

  useEffect(() => {
    const modelViewer = modelViewerRef.current;
    if (modelViewer && modelViewer.model) {
      const newAnimation = isSpeaking ? 'Talk' : 'Idle';
      if (modelViewer.animationName !== newAnimation) {
          modelViewer.animationName = newAnimation;
          modelViewer.play({ repetitions: Infinity });
      }
    }
  }, [isSpeaking]);

  return (
    <div className="w-full h-full">
      <model-viewer
        ref={modelViewerRef}
        src="https://cdn.glitch.global/e5529f17-9b84-48ef-a337-a16f6a738673/cyborg_girl.glb?v=1718822005820"
        alt="Cyborg Avatar"
        camera-controls
        disable-zoom
        camera-orbit="-10deg 75deg 1.5m"
        auto-rotate
        auto-rotate-delay="1000"
        rotation-per-second="10deg"
        shadow-intensity="1"
        ar
        ar-modes="webxr scene-viewer quick-look"
      >
      </model-viewer>
    </div>
  );
};