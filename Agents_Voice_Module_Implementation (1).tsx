// Agents Module Implementation
// packages/agents/src/components/AstraCommander.tsx

import React, { useState, useEffect } from 'react';
import { Brain, Zap, Users, Settings } from 'lucide-react';
import { useAgents, useAgentChat } from '../hooks';
import { AgentGrid } from './AgentGrid';
import { ChatInterface } from './ChatInterface';
import { CommandPanel } from './CommandPanel';

export const AstraCommander: React.FC = () => {
  const { agents, updateAgent, orchestrateTask } = useAgents();
  const { messages, sendMessage, isProcessing } = useAgentChat('astra');
  const [activeView, setActiveView] = useState<'overview' | 'chat' | 'command'>('overview');

  return (
    <div className="astra-commander h-full flex flex-col bg-gradient-to-br from-slate-900 to-slate-800">
      {/* Header */}
      <div className="border-b border-slate-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">ASTRA Commander</h1>
              <p className="text-slate-400 text-sm">AI Crew Orchestrator</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="text-right">
              <div className="text-sm text-slate-400">Active Agents</div>
              <div className="text-lg font-semibold text-white">
                {agents.filter(a => a.status !== 'offline').length}/{agents.length}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex space-x-1 mt-4">
          {[
            { id: 'overview', label: 'Overview', icon: Users },
            { id: 'chat', label: 'Direct Chat', icon: Brain },
            { id: 'command', label: 'Command Center', icon: Zap }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveView(id as any)}
              className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
                activeView === id
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeView === 'overview' && (
          <div className="h-full p-4">
            <AgentGrid agents={agents} onAgentSelect={(agent) => {
              // Handle agent selection
            }} />
          </div>
        )}

        {activeView === 'chat' && (
          <div className="h-full">
            <ChatInterface
              messages={messages}
              onSendMessage={sendMessage}
              isProcessing={isProcessing}
              agentName="ASTRA"
            />
          </div>
        )}

        {activeView === 'command' && (
          <div className="h-full">
            <CommandPanel
              agents={agents}
              onExecuteCommand={orchestrateTask}
            />
          </div>
        )}
      </div>
    </div>
  );
};

// Agent Hook Implementation
// packages/agents/src/hooks/useAgents.ts

import { useState, useEffect, useCallback } from 'react';
import { useAppStore } from '@crew/core';
import { AgentService } from '../services/AgentService';
import { Agent, AgentMessage, TaskRequest } from '../types';

export const useAgents = () => {
  const { agents, setAgents, updateAgent } = useAppStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load agents on mount
  useEffect(() => {
    const loadAgents = async () => {
      try {
        setLoading(true);
        const agentData = await AgentService.getAgents();
        setAgents(agentData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load agents');
      } finally {
        setLoading(false);
      }
    };

    if (agents.length === 0) {
      loadAgents();
    }
  }, [agents.length, setAgents]);

  // Subscribe to agent updates via WebSocket
  useEffect(() => {
    const handleAgentUpdate = (event: CustomEvent<Agent>) => {
      updateAgent(event.detail.id, event.detail);
    };

    window.addEventListener('agent:update', handleAgentUpdate as any);
    return () => window.removeEventListener('agent:update', handleAgentUpdate as any);
  }, [updateAgent]);

  const orchestrateTask = useCallback(async (taskRequest: TaskRequest) => {
    try {
      setLoading(true);
      const result = await AgentService.orchestrateTask(taskRequest);
      
      // Update relevant agents' status
      taskRequest.assignedAgents?.forEach(agentId => {
        updateAgent(agentId, { 
          status: 'working',
          currentTask: taskRequest.title,
          progress: 0
        });
      });

      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Task orchestration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [updateAgent]);

  const changeAgentEngine = useCallback(async (agentId: string, newEngine: string) => {
    try {
      await AgentService.changeEngine(agentId, newEngine);
      updateAgent(agentId, { currentEngine: newEngine });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to change engine');
    }
  }, [updateAgent]);

  return {
    agents,
    loading,
    error,
    orchestrateTask,
    changeAgentEngine,
    updateAgent
  };
};

// Voice Module Implementation
// packages/voice/src/services/VoiceService.ts

export interface VoiceConfig {
  provider: 'elevenlabs' | 'browser';
  voiceId?: string;
  speed: number;
  volume: number;
  pitch?: number;
}

export interface AudioQueueItem {
  id: string;
  text: string;
  priority: 'low' | 'normal' | 'high';
  agentName?: string;
  emotion?: 'neutral' | 'happy' | 'sad' | 'excited' | 'angry';
}

export class VoiceService {
  private audioContext?: AudioContext;
  private audioQueue: AudioQueueItem[] = [];
  private isPlaying = false;
  private currentConfig: VoiceConfig;
  private elevenLabsService?: ElevenLabsService;
  private browserTTS?: BrowserTTSService;

  constructor(config: VoiceConfig) {
    this.currentConfig = config;
    this.initializeServices();
  }

  private async initializeServices() {
    if (this.currentConfig.provider === 'elevenlabs') {
      const { ElevenLabsService } = await import('./ElevenLabsService');
      this.elevenLabsService = new ElevenLabsService();
    } else {
      const { BrowserTTSService } = await import('./BrowserTTSService');
      this.browserTTS = new BrowserTTSService();
    }

    // Initialize audio context
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }

  async speak(text: string, options: Partial<AudioQueueItem> = {}): Promise<void> {
    const item: AudioQueueItem = {
      id: `audio_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      text,
      priority: 'normal',
      ...options
    };

    // Add to queue based on priority
    if (item.priority === 'high') {
      this.audioQueue.unshift(item);
    } else {
      this.audioQueue.push(item);
    }

    this.processQueue();
  }

  private async processQueue(): Promise<void> {
    if (this.isPlaying || this.audioQueue.length === 0) {
      return;
    }

    this.isPlaying = true;
    
    try {
      const item = this.audioQueue.shift()!;
      await this.playAudioItem(item);
    } catch (error) {
      console.error('Error playing audio:', error);
    } finally {
      this.isPlaying = false;
      
      // Process next item in queue
      if (this.audioQueue.length > 0) {
        setTimeout(() => this.processQueue(), 100);
      }
    }
  }

  private async playAudioItem(item: AudioQueueItem): Promise<void> {
    // Emit speaking start event
    window.dispatchEvent(new CustomEvent('voice:speaking:start', {
      detail: { item, agentName: item.agentName }
    }));

    try {
      if (this.currentConfig.provider === 'elevenlabs' && this.elevenLabsService) {
        await this.playElevenLabsAudio(item);
      } else if (this.browserTTS) {
        await this.playBrowserTTS(item);
      }
    } finally {
      // Emit speaking end event
      window.dispatchEvent(new CustomEvent('voice:speaking:end', {
        detail: { item, agentName: item.agentName }
      }));
    }
  }

  private async playElevenLabsAudio(item: AudioQueueItem): Promise<void> {
    if (!this.elevenLabsService || !this.audioContext) return;

    const audioData = await this.elevenLabsService.generateSpeech(
      item.text,
      this.currentConfig.voiceId,
      {
        speed: this.currentConfig.speed,
        emotion: item.emotion
      }
    );

    const audioBuffer = await this.audioContext.decodeAudioData(audioData);
    
    return new Promise((resolve, reject) => {
      const source = this.audioContext!.createBufferSource();
      const gainNode = this.audioContext!.createGain();
      
      source.buffer = audioBuffer;
      gainNode.gain.value = this.currentConfig.volume;
      
      source.connect(gainNode);
      gainNode.connect(this.audioContext!.destination);
      
      source.onended = () => resolve();
      source.onerror = reject;
      
      source.start(0);
    });
  }

  private async playBrowserTTS(item: AudioQueueItem): Promise<void> {
    if (!this.browserTTS) return;

    return this.browserTTS.speak(item.text, {
      rate: this.currentConfig.speed,
      volume: this.currentConfig.volume,
      pitch: this.currentConfig.pitch || 1
    });
  }

  stop(): void {
    this.audioQueue = [];
    this.isPlaying = false;
    
    if (this.browserTTS) {
      this.browserTTS.stop();
    }
    
    window.dispatchEvent(new CustomEvent('voice:stopped'));
  }

  updateConfig(config: Partial<VoiceConfig>): void {
    this.currentConfig = { ...this.currentConfig, ...config };
    
    if (config.provider && config.provider !== this.currentConfig.provider) {
      this.initializeServices();
    }
  }

  getQueueLength(): number {
    return this.audioQueue.length;
  }

  isCurrentlySpeaking(): boolean {
    return this.isPlaying;
  }
}

// ElevenLabs Service
// packages/voice/src/services/ElevenLabsService.ts

export interface ElevenLabsOptions {
  speed?: number;
  emotion?: string;
  stability?: number;
  similarityBoost?: number;
}

export class ElevenLabsService {
  private apiKey: string;
  private baseUrl = 'https://api.elevenlabs.io/v1';

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.ELEVENLABS_API_KEY || '';
  }

  async generateSpeech(
    text: string, 
    voiceId: string = 'EXAVITQu4vr4xnSDxMaL', // Rachel voice
    options: ElevenLabsOptions = {}
  ): Promise<ArrayBuffer> {
    if (!this.apiKey) {
      throw new Error('ElevenLabs API key not configured');
    }

    const response = await fetch(`${this.baseUrl}/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': this.apiKey
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: options.stability || 0.5,
          similarity_boost: options.similarityBoost || 0.75,
          style: options.emotion ? 0.5 : 0,
          use_speaker_boost: true
        }
      })
    });

    if (!response.ok) {
      throw new Error(`ElevenLabs API error: ${response.status}`);
    }

    return response.arrayBuffer();
  }

  async getVoices(): Promise<any[]> {
    const response = await fetch(`${this.baseUrl}/voices`, {
      headers: {
        'xi-api-key': this.apiKey
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch voices: ${response.status}`);
    }

    const data = await response.json();
    return data.voices;
  }
}

// Voice Hook
// packages/voice/src/hooks/useVoice.ts

import { useState, useEffect, useCallback } from 'react';
import { useAppStore } from '@crew/core';
import { VoiceService } from '../services/VoiceService';

let voiceServiceInstance: VoiceService | null = null;

export const useVoice = () => {
  const { settings, updateSettings } = useAppStore();
  const [isInitialized, setIsInitialized] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [queueLength, setQueueLength] = useState(0);

  // Initialize voice service
  useEffect(() => {
    if (!voiceServiceInstance && settings.voice.enabled) {
      voiceServiceInstance = new VoiceService(settings.voice);
      setIsInitialized(true);
    }
  }, [settings.voice]);

  // Listen for voice events
  useEffect(() => {
    const handleSpeakingStart = () => setIsSpeaking(true);
    const handleSpeakingEnd = () => setIsSpeaking(false);
    const handleStopped = () => {
      setIsSpeaking(false);
      setQueueLength(0);
    };

    window.addEventListener('voice:speaking:start', handleSpeakingStart);
    window.addEventListener('voice:speaking:end', handleSpeakingEnd);
    window.addEventListener('voice:stopped', handleStopped);

    return () => {
      window.removeEventListener('voice:speaking:start', handleSpeakingStart);
      window.removeEventListener('voice:speaking:end', handleSpeakingEnd);
      window.removeEventListener('voice:stopped', handleStopped);
    };
  }, []);

  const speak = useCallback(async (text: string, options?: any) => {
    if (!voiceServiceInstance || !settings.voice.enabled) return;
    
    await voiceServiceInstance.speak(text, options);
    setQueueLength(voiceServiceInstance.getQueueLength());
  }, [settings.voice.enabled]);

  const stop = useCallback(() => {
    if (voiceServiceInstance) {
      voiceServiceInstance.stop();
    }
  }, []);

  const updateVoiceSettings = useCallback((newSettings: any) => {
    updateSettings({ voice: { ...settings.voice, ...newSettings } });
    
    if (voiceServiceInstance) {
      voiceServiceInstance.updateConfig(newSettings);
    }
  }, [settings.voice, updateSettings]);

  return {
    speak,
    stop,
    isSpeaking,
    queueLength,
    isInitialized,
    settings: settings.voice,
    updateSettings: updateVoiceSettings
  };
};
