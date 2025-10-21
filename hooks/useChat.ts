
import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { ChatMessage, Conversation } from '../types';
import { geminiService } from '../services/geminiService';

const uid = () => Math.random().toString(36).slice(2, 9);
const STORAGE_KEY = 'xtina-conversations';

const createNewConversation = (messages: ChatMessage[] = []): Conversation => {
  const defaultMessage: ChatMessage = {
    id: uid(),
    role: 'ai',
    text: 'Hello — I am Xtina 2.0, a demo using the Gemini API. Type a message to get started.',
    ts: new Date().toISOString(),
  };

  return {
    id: uid(),
    title: 'New Conversation',
    messages: messages.length > 0 ? messages : [defaultMessage],
  };
};


const loadInitialState = (): { conversations: Conversation[], activeId: string } => {
  try {
    const savedState = localStorage.getItem(STORAGE_KEY);
    if (savedState) {
      const parsed = JSON.parse(savedState);
      if (parsed.conversations && parsed.conversations.length > 0 && parsed.activeId) {
        return parsed;
      }
    }
  } catch (error) {
    console.error("Failed to load conversations from localStorage", error);
  }

  const newConversation = createNewConversation();
  return {
    conversations: [newConversation],
    activeId: newConversation.id,
  };
};

export const useChat = () => {
  const [state, setState] = useState(loadInitialState);
  const { conversations, activeId } = state;

  const [streaming, setStreaming] = useState(false);
  const [currentAiMessage, setCurrentAiMessage] = useState('');
  const isInterruptedRef = useRef(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error("Failed to save conversations to localStorage", error);
    }
  }, [state]);
  
  const activeConversation = useMemo(() => {
      return conversations.find(c => c.id === activeId);
  }, [conversations, activeId]);

  const sendMessage = useCallback(async (text: string) => {
    if (!activeId) return;

    const userMessage: ChatMessage = {
      id: uid(),
      role: 'user',
      text,
      ts: new Date().toISOString(),
    };

    const isFirstUserMessage = activeConversation?.messages.filter(m => m.role === 'user').length === 0;
    
    setState(prevState => ({
        ...prevState,
        conversations: prevState.conversations.map(c => 
            c.id === activeId 
            ? { ...c, 
                messages: [...c.messages, userMessage],
                title: isFirstUserMessage ? text.substring(0, 40) : c.title,
              }
            : c
        )
    }));
    
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
         setState(prevState => ({
            ...prevState,
            conversations: prevState.conversations.map(c => 
                c.id === activeId 
                ? { ...c, messages: [...c.messages, aiMessage] }
                : c
            )
        }));
      }
    } catch (error) {
      console.error('Error streaming from Gemini:', error);
      const errorMessage: ChatMessage = {
          id: uid(),
          role: 'ai',
          text: 'Sorry, I encountered an error. Please check your API key and try again.',
          ts: new Date().toISOString(),
      };
      setState(prevState => ({
        ...prevState,
        conversations: prevState.conversations.map(c => 
            c.id === activeId 
            ? { ...c, messages: [...c.messages, errorMessage] }
            : c
        )
      }));
    } finally {
      setStreaming(false);
      setCurrentAiMessage('');
      isInterruptedRef.current = false;
    }
  }, [activeId, activeConversation]);
  
  const interrupt = useCallback(() => {
    isInterruptedRef.current = true;
  }, []);

  const startNewConversation = useCallback(() => {
    const newConversation = createNewConversation();
    setState(prevState => ({
      ...prevState,
      conversations: [newConversation, ...prevState.conversations],
      activeId: newConversation.id
    }));
  }, []);
  
  const switchConversation = useCallback((id: string) => {
    setState(prevState => ({...prevState, activeId: id}));
  }, []);

  const deleteConversation = useCallback((id: string) => {
    setState(prevState => {
        const remainingConversations = prevState.conversations.filter(c => c.id !== id);
        if (remainingConversations.length === 0) {
            const newConv = createNewConversation();
            return {
                conversations: [newConv],
                activeId: newConv.id,
            };
        }
        const newActiveId = prevState.activeId === id ? remainingConversations[0].id : prevState.activeId;
        return {
            conversations: remainingConversations,
            activeId: newActiveId,
        };
    });
  }, []);

  return {
    messages: activeConversation?.messages ?? [],
    conversationsSummary: conversations.map(c => ({ id: c.id, title: c.title })),
    activeConversationId: activeId,
    sendMessage,
    interrupt,
    streaming,
    currentAiMessage,
    startNewConversation,
    switchConversation,
    deleteConversation,
  };
};
