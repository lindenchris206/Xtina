import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const AGENTS_FILE = path.join(__dirname, 'agentsRegistry.json');

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const model = 'gemini-2.5-flash';

const knowledgeCache = new Map();

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
  
  updateAgentSpecialties(name, primary, secondaries) {
    const agent = this.agents.find(a => a.name === name);
    if (!agent) return null;
    agent.primarySpecialty = primary;
    agent.secondarySpecialties = secondaries;
    this.saveAgents();
    this.broadcast('agent-update', agent);
    this.broadcast('log', { message: `Agent ${name} specialties updated.`, time: new Date().toISOString() });
    return agent;
  }

  addKnowledgeBundle(name, fileName, filePath, content) {
    const agent = this.agents.find(a => a.name === name);
    if (!agent) return null;
    if (!agent.knowledgeBundles) agent.knowledgeBundles = [];
    
    agent.knowledgeBundles.push({ name: fileName, type: 'file', path: filePath });
    knowledgeCache.set(filePath, content);
    
    this.saveAgents();
    this.broadcast('agent-update', agent);
    this.broadcast('log', { message: `Knowledge bundle '${fileName}' added to ${name}.`, time: new Date().toISOString() });
    return agent;
  }

  createTaskFromPrompt(prompt) {
    const isCouncilTask = prompt.toLowerCase().startsWith('/council ');
    
    let task = {
        id: `task_${Date.now()}`,
        prompt,
        status: 'queued',
        type: isCouncilTask ? 'council' : 'text',
        title: `${prompt.substring(0, 50)}...`,
    };
    
    this.tasks.push(task);
    this.broadcast('task-update', task);

    if (isCouncilTask) {
        this.executeCouncilTask(task);
    } else {
        this.assignAndExecuteTask(task);
    }
  }

  async executeCouncilTask(task) {
    task.status = 'running';
    this.broadcast('task-update', task);
    this.broadcast('log', { message: `Council task received. Renee is selecting agents...`, time: new Date().toISOString() });
    
    try {
        const agentList = this.agents
            .filter(a => a.name !== 'Renee')
            .map(a => `- ${a.name}: Primary specialty: ${a.primarySpecialty}. Description: ${a.description}`)
            .join('\n');
        
        const selectionPrompt = `User prompt: "${task.prompt.replace('/council ', '')}"
        
        Based on the prompt, select the top 2-3 most relevant agents from the list below to form a council.
        
        Available agents:
        ${agentList}
        
        Respond with a comma-separated list of agent names (e.g., Alpha,Beta,Gamma).`;

        const selectionResult = await ai.models.generateContent({ model: 'gemini-2.5-pro', contents: selectionPrompt });
        const councilAgentNames = selectionResult.text.trim().split(',');
        const councilAgents = this.agents.filter(a => councilAgentNames.includes(a.name));

        if (councilAgents.length === 0) throw new Error('Renee failed to select any agents for the council.');
        
        this.broadcast('log', { message: `Renee selected council: ${councilAgentNames.join(', ')}.`, time: new Date().toISOString() });

        const agentResponses = await Promise.all(
            councilAgents.map(async agent => {
                const knowledgeContext = this.getAgentKnowledgeContext(agent);
                const executionPrompt = `${knowledgeContext}As the ${agent.name} agent, with a specialty in "${agent.primarySpecialty}", provide your expert opinion on this topic: "${task.prompt.replace('/council ', '')}"`;
                
                const result = await ai.models.generateContent({ model: agent.currentEngine || model, contents: executionPrompt });
                const response = { agentName: agent.name, response: result.text };
                
                this.broadcast('council-agent-response', { taskId: task.id, ...response });
                this.broadcast('log', { message: `${agent.name} has provided its input.`, time: new Date().toISOString() });
                
                return response;
            })
        );
        
        this.broadcast('log', { message: `Renee is synthesizing the council's input...`, time: new Date().toISOString() });

        const synthesisPrompt = `You are Renee, the lead orchestrator. You have received the following inputs from your specialist agents on the topic: "${task.prompt.replace('/council ', '')}"
        
        ${agentResponses.map(r => `Input from ${r.agentName}:\n${r.response}`).join('\n\n')}
        
        Synthesize these inputs into a single, comprehensive, and definitive response for the user. Address the user directly.`;

        const finalResult = await ai.models.generateContent({ model: 'gemini-2.5-pro', contents: synthesisPrompt });

        task.status = 'done';
        task.completedAt = new Date().toISOString();
        task.output = { type: 'council', content: finalResult.text, councilMessages: agentResponses };
        
        this.broadcast('task-update', task);
        this.broadcast('log', { message: `Council task completed.`, time: new Date().toISOString() });

    } catch (error) {
        console.error(`Council task ${task.id} failed:`, error);
        task.status = 'failed';
        task.output = { type: 'text', content: error.message };
        this.broadcast('task-update', task);
        this.broadcast('log', { message: `Council task failed. Error: ${error.message}`, time: new Date().toISOString() });
    }
  }

  getAgentKnowledgeContext(agent) {
    if (!agent.knowledgeBundles || agent.knowledgeBundles.length === 0) return '';
    
    const contextParts = agent.knowledgeBundles.map(kb => {
        if (kb.path && knowledgeCache.has(kb.path)) {
            return `--- Knowledge from ${kb.name} ---\n${knowledgeCache.get(kb.path)}\n--- End of ${kb.name} ---`;
        }
        return '';
    }).filter(Boolean);

    return contextParts.length > 0 ? `Use the following information from your knowledge base to inform your answer:\n${contextParts.join('\n\n')}\n\n` : '';
  }

  async assignAndExecuteTask(task) {
    task.status = 'running';
    this.broadcast('task-update', task);
    this.broadcast('log', { message: `Task "${task.title}" received. Renee is analyzing...`, time: new Date().toISOString() });

    try {
        const agentList = this.agents.filter(a => a.name !== 'Renee').map(a => `- ${a.name}: Primary specialty is ${a.primarySpecialty}. Description: ${a.description}`).join('\n');
        const selectionPrompt = `User prompt: "${task.prompt}"\n\nBased on the prompt, which agent is best suited? \n\n${agentList}\n\nRespond with only the agent's name.`;
        const selectionResult = await ai.models.generateContent({ model: 'gemini-2.5-pro', contents: selectionPrompt });
        const selectedAgentName = selectionResult.text.trim();
        const agent = this.agents.find(a => a.name === selectedAgentName);

        if (!agent || agent.name === 'Renee') throw new Error(`Renee selected an invalid agent: '${selectedAgentName}'.`);

        task.assignedAgent = agent.name;
        this.broadcast('task-update', task);
        this.broadcast('log', { message: `Renee assigned task to ${agent.name}.`, time: new Date().toISOString() });
        this.broadcast('log', { message: `${agent.name} is executing...`, time: new Date().toISOString() });
        
        const knowledgeContext = this.getAgentKnowledgeContext(agent);
        const executionPrompt = `${knowledgeContext}As an AI agent with primary specialty "${agent.primarySpecialty}", fulfill this request: "${task.prompt}"`;
        
        let output;
        
        if (agent.primarySpecialty === 'art') {
             const result = await ai.models.generateContent({ model: agent.currentEngine || model, contents: executionPrompt });
             output = { type: 'text', content: `Image generation is a premium feature. Simulating output for: "${task.prompt}"\n\n${result.text}` };
        } else {
            const executionResult = await ai.models.generateContent({ model: agent.currentEngine || model, contents: executionPrompt });
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
