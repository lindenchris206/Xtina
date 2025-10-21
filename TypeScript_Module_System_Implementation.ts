// Core Module Registry Implementation
// packages/core/src/services/ModuleRegistry.ts

export interface ModuleDefinition {
  id: string;
  name: string;
  version: string;
  dependencies: string[];
  exports: Record<string, any>;
  lazy: boolean;
  component?: React.ComponentType<any>;
  routes?: RouteDefinition[];
  permissions?: string[];
}

export interface RouteDefinition {
  path: string;
  component: React.ComponentType<any>;
  exact?: boolean;
  permissions?: string[];
}

export class ModuleRegistry {
  private modules = new Map<string, ModuleDefinition>();
  private loadedModules = new Map<string, any>();
  private loadingPromises = new Map<string, Promise<any>>();

  register(definition: ModuleDefinition): void {
    this.validateDependencies(definition);
    this.modules.set(definition.id, definition);
    
    // Emit module registered event
    window.dispatchEvent(new CustomEvent('module:registered', {
      detail: { moduleId: definition.id }
    }));
  }

  async load(moduleId: string): Promise<any> {
    // Return if already loaded
    if (this.loadedModules.has(moduleId)) {
      return this.loadedModules.get(moduleId);
    }

    // Return existing loading promise if in progress
    if (this.loadingPromises.has(moduleId)) {
      return this.loadingPromises.get(moduleId);
    }

    const definition = this.modules.get(moduleId);
    if (!definition) {
      throw new Error(`Module ${moduleId} not found`);
    }

    // Load dependencies first
    const loadPromise = this.loadWithDependencies(definition);
    this.loadingPromises.set(moduleId, loadPromise);

    try {
      const module = await loadPromise;
      this.loadedModules.set(moduleId, module);
      this.loadingPromises.delete(moduleId);
      
      // Emit module loaded event
      window.dispatchEvent(new CustomEvent('module:loaded', {
        detail: { moduleId, module }
      }));

      return module;
    } catch (error) {
      this.loadingPromises.delete(moduleId);
      throw error;
    }
  }

  private async loadWithDependencies(definition: ModuleDefinition): Promise<any> {
    // Load all dependencies first
    await Promise.all(
      definition.dependencies.map(dep => this.load(dep))
    );

    // Dynamic import based on module ID
    let module;
    switch (definition.id) {
      case 'agents':
        module = await import('@crew/agents');
        break;
      case 'voice':
        module = await import('@crew/voice');
        break;
      case 'avatars':
        module = await import('@crew/avatars');
        break;
      case 'backgrounds':
        module = await import('@crew/backgrounds');
        break;
      case 'tasks':
        module = await import('@crew/tasks');
        break;
      // Plugin modules
      case 'terminal':
        module = await import('@crew/plugins/terminal');
        break;
      case 'video-editor':
        module = await import('@crew/plugins/media-editor/video');
        break;
      case 'image-editor':
        module = await import('@crew/plugins/media-editor/image');
        break;
      case 'pdf-editor':
        module = await import('@crew/plugins/media-editor/pdf');
        break;
      case 'automation':
        module = await import('@crew/plugins/automation');
        break;
      case 'analytics':
        module = await import('@crew/plugins/analytics');
        break;
      default:
        throw new Error(`Unknown module: ${definition.id}`);
    }

    return {
      ...module,
      definition,
      loadedAt: new Date()
    };
  }

  unload(moduleId: string): void {
    const module = this.loadedModules.get(moduleId);
    if (module && module.cleanup) {
      module.cleanup();
    }
    
    this.loadedModules.delete(moduleId);
    
    window.dispatchEvent(new CustomEvent('module:unloaded', {
      detail: { moduleId }
    }));
  }

  private validateDependencies(definition: ModuleDefinition): void {
    for (const dep of definition.dependencies) {
      if (!this.modules.has(dep)) {
        throw new Error(`Dependency ${dep} not found for module ${definition.id}`);
      }
    }
  }

  getLoadedModules(): string[] {
    return Array.from(this.loadedModules.keys());
  }

  isLoaded(moduleId: string): boolean {
    return this.loadedModules.has(moduleId);
  }

  getDependencyGraph(): Record<string, string[]> {
    const graph: Record<string, string[]> = {};
    this.modules.forEach((def, id) => {
      graph[id] = def.dependencies;
    });
    return graph;
  }
}

// Event Bus Implementation
// packages/core/src/services/EventBus.ts

export interface ModuleEvent<T = any> {
  type: string;
  source: string;
  payload: T;
  timestamp: number;
  id: string;
}

export type EventHandler<T = any> = (event: ModuleEvent<T>) => void;

export class EventBus {
  private handlers = new Map<string, Set<EventHandler>>();
  private history: ModuleEvent[] = [];
  private maxHistorySize = 1000;

  subscribe<T>(eventType: string, handler: EventHandler<T>): () => void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set());
    }
    
    this.handlers.get(eventType)!.add(handler as EventHandler);
    
    // Return unsubscribe function
    return () => this.unsubscribe(eventType, handler);
  }

  unsubscribe<T>(eventType: string, handler: EventHandler<T>): void {
    const handlers = this.handlers.get(eventType);
    if (handlers) {
      handlers.delete(handler as EventHandler);
      if (handlers.size === 0) {
        this.handlers.delete(eventType);
      }
    }
  }

  emit<T>(eventType: string, payload: T, source = 'unknown'): string {
    const event: ModuleEvent<T> = {
      type: eventType,
      source,
      payload,
      timestamp: Date.now(),
      id: this.generateEventId()
    };

    // Add to history
    this.history.push(event);
    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
    }

    // Emit to handlers
    const handlers = this.handlers.get(eventType);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(event);
        } catch (error) {
          console.error(`Error in event handler for ${eventType}:`, error);
        }
      });
    }

    // Emit wildcard handlers
    const wildcardHandlers = this.handlers.get('*');
    if (wildcardHandlers) {
      wildcardHandlers.forEach(handler => {
        try {
          handler(event);
        } catch (error) {
          console.error(`Error in wildcard event handler:`, error);
        }
      });
    }

    return event.id;
  }

  getHistory(eventType?: string, limit?: number): ModuleEvent[] {
    let filtered = eventType 
      ? this.history.filter(event => event.type === eventType)
      : this.history;

    if (limit) {
      filtered = filtered.slice(-limit);
    }

    return filtered;
  }

  private generateEventId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  clear(): void {
    this.handlers.clear();
    this.history = [];
  }
}

// State Management with Zustand
// packages/core/src/services/StateManager.ts

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export interface Agent {
  id: string;
  name: string;
  description: string;
  primarySpecialty: string;
  secondarySpecialties: string[];
  currentEngine: string;
  engineOptions: string[];
  status: 'idle' | 'working' | 'error' | 'offline';
  progress?: number;
  currentTask?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  assignedAgents: string[];
  progress: number;
  createdAt: Date;
  updatedAt: Date;
  output?: {
    type: 'text' | 'image' | 'video' | 'file';
    content: string;
    metadata?: Record<string, any>;
  };
}

export interface UIState {
  activeModule: string | null;
  sidebarOpen: boolean;
  theme: 'dark' | 'light' | 'cyberpunk';
  layout: 'standard' | 'compact' | 'cinema';
  notifications: Notification[];
}

export interface AppSettings {
  voice: {
    enabled: boolean;
    provider: 'elevenlabs' | 'browser';
    voiceId?: string;
    speed: number;
    volume: number;
  };
  avatars: {
    enabled: boolean;
    selectedAvatar: string;
    animations: boolean;
    lipSync: boolean;
  };
  performance: {
    enableAnimations: boolean;
    particleCount: number;
    backgroundEffects: boolean;
  };
  api: {
    endpoints: Record<string, string>;
    keys: Record<string, string>;
    timeout: number;
  };
}

export interface AppState {
  // Data
  agents: Agent[];
  tasks: Task[];
  
  // UI State
  ui: UIState;
  
  // Settings
  settings: AppSettings;
  
  // Actions
  setAgents: (agents: Agent[]) => void;
  updateAgent: (id: string, updates: Partial<Agent>) => void;
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  setActiveModule: (module: string | null) => void;
  toggleSidebar: () => void;
  updateSettings: (updates: Partial<AppSettings>) => void;
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
}

export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        agents: [],
        tasks: [],
        ui: {
          activeModule: null,
          sidebarOpen: true,
          theme: 'cyberpunk',
          layout: 'standard',
          notifications: []
        },
        settings: {
          voice: {
            enabled: true,
            provider: 'browser',
            speed: 1.0,
            volume: 0.8
          },
          avatars: {
            enabled: true,
            selectedAvatar: 'nova',
            animations: true,
            lipSync: true
          },
          performance: {
            enableAnimations: true,
            particleCount: 50,
            backgroundEffects: true
          },
          api: {
            endpoints: {},
            keys: {},
            timeout: 30000
          }
        },

        // Actions
        setAgents: (agents) => set({ agents }),
        
        updateAgent: (id, updates) => set(state => ({
          agents: state.agents.map(agent => 
            agent.id === id ? { ...agent, ...updates } : agent
          )
        })),

        addTask: (taskData) => {
          const task: Task = {
            ...taskData,
            id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            createdAt: new Date(),
            updatedAt: new Date()
          };
          set(state => ({ tasks: [...state.tasks, task] }));
        },

        updateTask: (id, updates) => set(state => ({
          tasks: state.tasks.map(task => 
            task.id === id 
              ? { ...task, ...updates, updatedAt: new Date() } 
              : task
          )
        })),

        setActiveModule: (module) => set(state => ({
          ui: { ...state.ui, activeModule: module }
        })),

        toggleSidebar: () => set(state => ({
          ui: { ...state.ui, sidebarOpen: !state.ui.sidebarOpen }
        })),

        updateSettings: (updates) => set(state => ({
          settings: { ...state.settings, ...updates }
        })),

        addNotification: (notificationData) => {
          const notification = {
            ...notificationData,
            id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
          };
          set(state => ({
            ui: {
              ...state.ui,
              notifications: [...state.ui.notifications, notification]
            }
          }));
        },

        removeNotification: (id) => set(state => ({
          ui: {
            ...state.ui,
            notifications: state.ui.notifications.filter(n => n.id !== id)
          }
        }))
      }),
      {
        name: 'ai-crew-commander-storage',
        partialize: (state) => ({
          settings: state.settings,
          ui: {
            theme: state.ui.theme,
            layout: state.ui.layout,
            sidebarOpen: state.ui.sidebarOpen
          }
        })
      }
    )
  )
);

// Module Loader Component
// packages/core/src/components/ModuleLoader.tsx

import React, { Suspense, useEffect, useState } from 'react';
import { ModuleRegistry } from '../services/ModuleRegistry';
import { EventBus } from '../services/EventBus';

interface ModuleLoaderProps {
  moduleId: string;
  fallback?: React.ReactNode;
  onLoad?: (module: any) => void;
  onError?: (error: Error) => void;
}

export const ModuleLoader: React.FC<ModuleLoaderProps> = ({
  moduleId,
  fallback = <div>Loading module...</div>,
  onLoad,
  onError
}) => {
  const [module, setModule] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadModule = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const moduleRegistry = ModuleRegistry.getInstance();
        const loadedModule = await moduleRegistry.load(moduleId);
        
        setModule(loadedModule);
        onLoad?.(loadedModule);
      } catch (err) {
        const error = err as Error;
        setError(error);
        onError?.(error);
      } finally {
        setLoading(false);
      }
    };

    loadModule();
  }, [moduleId, onLoad, onError]);

  if (loading) {
    return <>{fallback}</>;
  }

  if (error) {
    return (
      <div className="module-error p-4 bg-red-100 border border-red-400 rounded">
        <h3 className="text-red-800 font-semibold">Module Load Error</h3>
        <p className="text-red-600">{error.message}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Reload Application
        </button>
      </div>
    );
  }

  if (!module?.component) {
    return (
      <div className="module-no-component p-4 bg-yellow-100 border border-yellow-400 rounded">
        <p className="text-yellow-800">Module {moduleId} loaded but has no component to render.</p>
      </div>
    );
  }

  const ModuleComponent = module.component;

  return (
    <Suspense fallback={fallback}>
      <ModuleComponent />
    </Suspense>
  );
};

// Hook for using modules
export const useModule = (moduleId: string) => {
  const [module, setModule] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const moduleRegistry = ModuleRegistry.getInstance();
    
    // Check if already loaded
    if (moduleRegistry.isLoaded(moduleId)) {
      const loadedModule = moduleRegistry.getModule(moduleId);
      setModule(loadedModule);
      setLoading(false);
      return;
    }

    // Load module
    moduleRegistry.load(moduleId)
      .then(loadedModule => {
        setModule(loadedModule);
        setLoading(false);
      })
      .catch(err => {
        setError(err);
        setLoading(false);
      });
  }, [moduleId]);

  return { module, loading, error };
};
