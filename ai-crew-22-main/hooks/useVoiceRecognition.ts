import { useState, useEffect, useRef, useCallback } from 'react';

// Type definition for the SpeechRecognition API which may not be on the window object type
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: (event: any) => void;
  onerror: (event: any) => void;
  onend: () => void;
}

const getSpeechRecognition = (): { new(): SpeechRecognition } | null => {
  if (typeof window !== 'undefined') {
    return (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  }
  return null;
};
const SpeechRecognition = getSpeechRecognition();


export const useVoiceRecognition = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    if (!SpeechRecognition) {
      console.warn('Speech Recognition API not supported in this browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
       // We update the state with the combined interim and final results for a live feel
       setTranscript(finalTranscript + interimTranscript);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error', event.error);
      setIsListening(false);
    };
    
    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
    };
  }, []);
  
  const startListening = useCallback((currentText = '') => {
    if (recognitionRef.current && !isListening) {
      // Start with the current text in the textarea
      setTranscript(currentText); 
      recognitionRef.current.start();
      setIsListening(true);
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, [isListening]);

  return {
    isListening,
    transcript,
    startListening,
    stopListening,
    hasRecognitionSupport: !!SpeechRecognition,
  };
};
