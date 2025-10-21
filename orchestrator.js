import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateImage } from './services/imageGenerator.js';
import { GoogleGenAI } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const AGENTS_FILE = path.join(__dirname, 'agentsRegistry.json');

// Initialize Gemini
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const model = 'gemini-2.5-flash';

class Orchestrator {
  constructor() {
    this.agents = [];
    this.tasks = [];
    this.sockets = new Set();
    this.loadAgents();
  }

  loadAgents() {
    try {
      const raw = fs.readFileSync(AGENTS_FILE, 'utf8');
      this.agents = JSON.parse(raw).agents || [];
    } catch (e) {
      console.warn('Could not load agents registry', e);
    }
  }

  saveAgents() {
    try {
      fs.writeFileSync(AGENTS_FILE, JSON.stringify({ agents: this.agents }, null, 2));
    } catch (e) { console.error('saveAgents error', e); }
  }

  getAgents() { return this.agents; }

  updateAgentEngine(name, engine) {
    const agent = this.agents.find(x => x.name === name);
    if (!agent) return null;
    agent.currentEngine = engine;
    this.saveAgents();
    this.broadcast('agent-update', agent);
    this.broadcast('log', { message: `Agent ${name} engine updated to ${engine}`, time: new Date().toISOString() });
    return agent;
  }
  
  createTaskFromPrompt(prompt) {
    const isImageTask = prompt.toLowerCase().includes('generate an image');
    
    let task = {
        id: `task_${Date.now()}`,
        prompt,
        status: 'queued',
        type: isImageTask ? 'image' : 'text',
        title: `${prompt.substring(0, 50)}...`,
    };
    
    this.tasks.push(task);
    this.broadcast('task-update', task);
    this.assignAndExecuteTask(task);
  }

  async assignAndExecuteTask(task) {
    task.status = 'running';
    this.broadcast('task-update', task);
    this.broadcast('log', { message: `Task "${task.title}" received. Renee is analyzing...`, time: new Date().toISOString() });

    try {
        // 1. Ask Renee to select an agent
        const agentList = this.agents
            .filter(a => a.name !== 'Renee')
            .map(a => `- ${a.name}: Primary specialty is ${a.primarySpecialty}. Secondary specialties: ${a.secondarySpecialties.join(', ')}. Description: ${a.description}`)
            .join('\n');
        
        const selectionPrompt = `User prompt: "${task.prompt}"
        
        Based on the user prompt, which of the following agents is best suited for this task?
        
        Available agents:
        ${agentList}
        
        Respond with only the agent's name.`;

        const selectionResult = await ai.models.generateContent({
            model: 'gemini-2.5-pro', // Use a powerful model for routing
            contents: selectionPrompt,
        });
        const selectedAgentName = selectionResult.text.trim();

        const agent = this.agents.find(a => a.name === selectedAgentName);

        if (!agent || agent.name === 'Renee') {
            throw new Error(`Renee selected an invalid agent: '${selectedAgentName}'. Task failed.`);
        }

        task.assignedAgent = agent.name;
        this.broadcast('task-update', task);
        this.broadcast('log', { message: `Renee assigned task to ${agent.name}.`, time: new Date().toISOString() });
        this.broadcast('log', { message: `${agent.name} is executing the task...`, time: new Date().toISOString() });
        
        // 2. Execute task with the selected agent
        const executionPrompt = `As an AI agent whose primary specialty is "${agent.primarySpecialty}", fulfill this request decisively and expertly: "${task.prompt}"`;
        
        let output;
        
        // Special handling for image generation task which uses a specific service
        if (agent.primarySpecialty === 'art' && task.type === 'image') {
            output = { type: 'image', content: await generateImage(task.prompt) };
        } else {
            const executionResult = await ai.models.generateContent({
                model: agent.currentEngine || model,
                contents: executionPrompt,
            });
            output = { type: 'text', content: executionResult.text };
        }
        
        task.status = 'done';
        task.completedAt = new Date().toISOString();
        task.output = output;
        
        this.broadcast('task-update', task);
        this.broadcast('log', { message: `Task completed by ${agent.name}.`, time: new Date().toISOString() });

    } catch (error) {
        console.error(`Task ${task.id} failed:`, error);
        task.status = 'failed';
        const errorMessage = error instanceof Error ? error.message : String(error);
        task.output = { type: 'text', content: errorMessage };
        this.broadcast('task-update', task);
        this.broadcast('log', { message: `Task failed. Error: ${errorMessage}`, time: new Date().toISOString() });
    }
  }

  registerSocket(s) {
    this.sockets.add(s);
    s.emit('agents', this.agents);
    s.emit('tasks', this.tasks);
  }

  unregisterSocket(s) { this.sockets.delete(s); }

  broadcast(event, data) {
    this.sockets.forEach(s => {
      try { s.emit(event, data); } catch {}
    });
  }
}

export default new Orchestrator();