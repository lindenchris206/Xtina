// backend/orchestrator.js
const EventEmitter = require('events');
const fs = require('fs');
const knowledgePath = './knowledge/agentsRegistry.json';

class Orchestrator extends EventEmitter {
  constructor() {
    super();
    this.tasks = [];
    this.agents = [];
    this.sockets = [];
    this.loadAgents();
  }

  loadAgents() {
    if (fs.existsSync(knowledgePath)) {
      const data = fs.readFileSync(knowledgePath);
      this.agents = JSON.parse(data).agents || [];
    }
  }

  registerSocket(socket) {
    this.sockets.push(socket);
  }

  broadcast(event, data) {
    this.sockets.forEach(s => s.emit(event, data));
  }

  addTask(task) {
    this.tasks.push(task);
    this.broadcast('task-update', task);
  }

  getTaskOutput(taskId) {
    const task = this.tasks.find(t => t.id === taskId);
    return task ? task.output : null;
  }

  searchHelp(query) {
    // Simple keyword search across agent help topics
    return this.agents.flatMap(agent =>
      agent.help?.filter(item => item.toLowerCase().includes(query.toLowerCase())) || []
    );
  }

  assignAgents(task) {
    // Assign agents based on specialties
    task.assignedAgents = this.agents.filter(agent =>
      agent.specialties.includes(task.type)
    ).map(agent => agent.name);
    this.broadcast('task-update', task);
  }
}

module.exports = new Orchestrator();
