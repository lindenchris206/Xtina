import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import fileUpload from 'express-fileupload';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import fetch from 'node-fetch';
import pdf from 'pdf-parse';

import orchestrator from './orchestrator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(cors());
app.use(express.json());
app.use(fileUpload());

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}
app.use('/uploads', express.static(uploadsDir));

// API endpoints
app.get('/api/agents', (req, res) => {
  res.json({ agents: orchestrator.getAgents() });
});

app.post('/api/agents/:name/engine', (req, res) => {
  const { name } = req.params;
  const { engine } = req.body;
  const agent = orchestrator.updateAgentEngine(name, engine);
  if (!agent) return res.status(404).json({ error: 'Agent not found' });
  res.json(agent);
});

app.post('/api/agents/:name/specialties', (req, res) => {
  const { name } = req.params;
  const { primary, secondaries } = req.body;
  const agent = orchestrator.updateAgentSpecialties(name, primary, secondaries);
  if (!agent) return res.status(404).json({ error: 'Agent not found' });
  res.json(agent);
});

app.post('/api/agents/:name/knowledge', async (req, res) => {
  const { name } = req.params;
  if (!req.files || !req.files.file) {
    return res.status(400).json({ error: 'No file uploaded.' });
  }
  const file = req.files.file;
  const filePath = path.join(uploadsDir, file.name);

  try {
    await file.mv(filePath);

    let content;
    if (file.mimetype === 'application/pdf') {
        const data = await pdf(filePath);
        content = data.text;
    } else {
        content = fs.readFileSync(filePath, 'utf-8');
    }
    
    const agent = orchestrator.addKnowledgeBundle(name, file.name, filePath, content.substring(0, 50000));
    if (!agent) return res.status(404).json({ error: 'Agent not found' });
    res.json(agent);
  } catch (err) {
    console.error('Knowledge upload error:', err);
    res.status(500).json({ error: 'Failed to add knowledge bundle.' });
  }
});

app.post('/api/tasks', (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: 'Prompt is required' });
  
  orchestrator.createTaskFromPrompt(prompt);
  res.status(202).json({ message: 'Task received' });
});

app.post('/api/speak', async (req, res) => {
  const { text } = req.body;
  const voiceId = process.env.ELEVENLABS_VOICE_ID || 'EXAVITQu4vr4xnSDxMaL';
  const apiKey = process.env.ELEVENLABS_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'ElevenLabs API key is not configured on the server.' });
  }

  try {
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': apiKey,
      },
      body: JSON.stringify({
        text: text,
        model_id: 'eleven_monolingual_v1',
      }),
    });

    if (!response.ok) {
      throw new Error(`ElevenLabs API responded with status ${response.status}`);
    }

    res.setHeader('Content-Type', 'audio/mpeg');
    response.body.pipe(res);

  } catch (error) {
    console.error('ElevenLabs error:', error);
    res.status(500).json({ error: 'Failed to generate speech.' });
  }
});

// WebSocket connection
io.on('connection', (socket) => {
  orchestrator.registerSocket(socket);
  
  socket.on('disconnect', () => {
    orchestrator.unregisterSocket(socket);
  });
});

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
    const buildPath = path.resolve(__dirname, '..', 'dist');
    app.use(express.static(buildPath));
    app.get('*', (req, res) => {
        res.sendFile(path.resolve(buildPath, 'index.html'));
    });
}


const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`AI Crew Commander backend running on port ${PORT}`));
