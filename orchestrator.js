
// backend/orchestrator.js
const fs = require('fs');
const path = require('path');

const AGENTS_FILE = path.join(__dirname, 'agentsRegistry.json');

class Orchestrator {
  constructor() {
    this.agents = [];
    this.tasks = [];
    this.taskOutputs = {};
    this.sockets = new Set();
    this.loadAgents();
    this.startMockTaskScheduler();
  }

  loadAgents() {
    try {
      const raw = fs.readFileSync(AGENTS_FILE, 'utf8');
      const j = JSON.parse(raw);
      this.agents = j.agents || [];
    } catch (e) {
      console.warn('Could not load agents registry', e);
      this.agents = [];
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

  addTask(task) {
    task.id = `t_${Date.now()}`;
    task.status = 'queued';
    task.title = task.title || 'Untitled Task';
    this.tasks.push(task);
    this.broadcast('task-update', task);
    this.assignTaskToAgent(task);
  }

  assignTaskToAgent(task) {
    const match = this.agents.find(a =>
      a.primarySpecialty === task.type ||
      (a.secondarySpecialties || []).includes(task.type)
    ) || this.agents[0];

    if (!match) {
      task.status = 'failed';
      this.broadcast('task-update', task);
      return;
    }

    task.assignedAgent = match.name;
    task.status = 'running';
    this.broadcast('task-update', task);
    this.broadcast('log', { message: `Task ${task.id} assigned to ${match.name}`, time: new Date().toISOString() });

    setTimeout(() => {
      task.status = 'done';
      task.completedAt = new Date().toISOString();
      this.taskOutputs[task.id] = { content: `Simulated output for task ${task.id}` };
      this.broadcast('task-update', task);
      this.broadcast('log', { message: `Task ${task.id} completed.`, time: new Date().toISOString() });
    }, task.simulatedDuration || 5000);
  }

  getTaskOutput(id) {
    return this.taskOutputs[id] || null;
  }

  startMockTaskScheduler() {
    setInterval(() => {
        if (this.sockets.size > 0) { // Only create tasks if clients are connected
            this.addTask({
                type: 'text',
                title: 'Generate weekly report',
                simulatedDuration: Math.random() * 5000 + 3000
            });
        }
    }, 15000);
  }
  
  registerSocket(s) {
    this.sockets.add(s);
    s.emit('agents', this.agents);
    s.emit('tasks', this.tasks);
  }

  unregisterSocket(s) {
    this.sockets.delete(s);
  }

  broadcast(event, data) {
    this.sockets.forEach(s => {
      try { s.emit(event, data); } catch {}
    });
  }
}

module.exports = new Orchestrator();
