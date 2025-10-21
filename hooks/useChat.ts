
import { useState, useRef, useCallback } from 'react';
import { ChatMessage } from '../types';
import { geminiService } from '../services/geminiService';

const uid = () => Math.random().toString(36).slice(2, 9);

export const useChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: uid(),
      role: 'ai',
      text: 'Hello — I am Xtina 2.0, a demo using the Gemini API. Type a message to get started.',
      ts: new Date().toISOString(),
    },
  ]);
  const [streaming, setStreaming] = useState(false);
  const [currentAiMessage, setCurrentAiMessage] = useState('');
  const isInterruptedRef = useRef(false);

  const sendMessage = useCallback(async (text: string) => {
    const userMessage: ChatMessage = {
      id: uid(),
      role: 'user',
      text,
      ts: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMessage]);
    setCurrentAiMessage('');
    setStreaming(true);
    isInterruptedRef.current = false;

    try {
      const stream = geminiService.sendMessageStream(text);
      let accumulatedText = '';
      for await (const chunk of stream) {
        if (isInterruptedRef.current) {
          break;
        }
        accumulatedText += chunk;
        setCurrentAiMessage(accumulatedText);
      }

      if (accumulatedText) {
        const aiMessage: ChatMessage = {
          id: uid(),
          role: 'ai',
          text: accumulatedText.trim(),
          ts: new Date().toISOString(),
        };
        setMessages(prev => [...prev, aiMessage]);
      }
    } catch (error) {
      console.error('Error streaming from Gemini:', error);
      const errorMessage: ChatMessage = {
          id: uid(),
          role: 'ai',
          text: 'Sorry, I encountered an error. Please check your API key and try again.',
          ts: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setStreaming(false);
      setCurrentAiMessage('');
      isInterruptedRef.current = false;
    }
  }, []);
  
  const interrupt = useCallback(() => {
    isInterruptedRef.current = true;
  }, []);

  return {
    messages,
    sendMessage,
    interrupt,
    streaming,
    currentAiMessage,
  };
};
