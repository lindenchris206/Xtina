
// backend/server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const fileUpload = require('express-fileupload');
const cors = require('cors');
const path = require('path');
const orchestrator = require('./orchestrator');
const fileConverter = require('./fileConverter');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(cors());
app.use(express.json());
app.use(fileUpload());

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
const fs = require('fs');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Static folders
app.use('/uploads', express.static(uploadsDir));

// API endpoints
app.get('/api/agents', (req, res) => {
  res.json({ agents: orchestrator.getAgents() });
});

app.post('/api/agents/:name/engine', (req, res) => {
  const name = req.params.name;
  const engine = req.body.engine;
  const agent = orchestrator.updateAgentEngine(name, engine);
  if (!agent) return res.status(404).json({ error: 'Agent not found' });
  res.json(agent);
});

// Tasks
app.post('/api/tasks', (req, res) => {
  const task = req.body;
  orchestrator.addTask(task);
  res.json({ status: 'queued', task });
});

app.get('/api/tasks/:id/output', (req, res) => {
  const out = orchestrator.getTaskOutput(req.params.id);
  if (!out) return res.status(404).json({ error: 'Not found' });
  res.json({ output: out });
});

// File upload
app.post('/api/file/upload', async (req, res) => {
  try {
    const result = await fileConverter.handleUpload(req);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'upload failed', details: String(err) });
  }
});

// WebSocket connection
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  orchestrator.registerSocket(socket);
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    orchestrator.unregisterSocket(socket);
  });
});

const PORT = 3001;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
