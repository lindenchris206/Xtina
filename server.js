// backend/server.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const orchestrator = require('./orchestrator');
const fileConverter = require('./fileConverter');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: '*' } });

app.use(express.json());

// File upload and conversion endpoint
app.post('/api/file/upload', async (req, res) => {
  try {
    const result = await fileConverter.handleUpload(req);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'File conversion failed' });
  }
});

// Task output retrieval
app.get('/api/tasks/:id/output', (req, res) => {
  const taskId = req.params.id;
  const output = orchestrator.getTaskOutput(taskId);
  res.json({ output });
});

// Help/manual search
app.get('/api/help/search', (req, res) => {
  const q = req.query.q;
  const results = orchestrator.searchHelp(q);
  res.json({ results });
});

// WebSocket connection
io.on('connection', (socket) => {
  console.log('Client connected');
  orchestrator.registerSocket(socket);
});

server.listen(3001, () => console.log('Server running on port 3001'));
