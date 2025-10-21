#!/usr/bin/env ts-node

/**
 * create_and_zip_christina.ts
 *
 * Creates the "christina-mini" scaffold project (backend + frontend TypeScript sources)
 * and then zips the created project into christina-mini.zip.
 *
 * Usage:
 *   1) Install Node.js >= 18 and npm.
 *   2) Install ts-node and typescript if you don't have them:
 *        npm install -g ts-node typescript
 *   3) Run:
 *        npx ts-node create_and_zip_christina.ts
 *
 * Output:
 *   - ./christina-mini/        (project files)
 *   - ./christina-mini.zip     (zip of the full project)
 *
 * Note: This script is the same scaffold I previously provided, plus automatic zipping.
 */

import fs from 'fs';
import path from 'path';
import process from 'process';
import archiver from 'archiver';

const PROJECT_NAME = 'christina-mini';
const OUT_DIR = path.join(process.cwd(), PROJECT_NAME);
const ZIP_PATH = path.join(process.cwd(), `${PROJECT_NAME}.zip`);

function writeFile(filePath: string, content: string) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, { encoding: 'utf8' });
  console.log('Wrote', path.relative(process.cwd(), filePath));
}

function json(obj: any) {
  return JSON.stringify(obj, null, 2);
}

/* ---------- (Scaffold content — same as before) ---------- */

// root package.json
const packageJson = {
  name: PROJECT_NAME,
  version: '0.1.0',
  private: true,
  scripts: {
    dev: 'concurrently \"npm:dev:backend\" \"npm:dev:frontend\"',
    'dev:backend': 'ts-node-dev --respawn --transpile-only backend/src/server.ts',
    'dev:frontend': 'cd frontend && npm run dev',
    build: 'cd frontend && npm run build',
    start: 'node dist/server.js'
  },
  dependencies: {
    express: '^4.18.2',
    cors: '^2.8.5',
    'socket.io': '^4.7.2'
  },
  devDependencies: {
    typescript: '^5.3.2',
    'ts-node': '^10.9.1',
    'ts-node-dev': '^2.0.0',
    concurrently: '^8.2.0'
  }
};

const readme = `christina-mini

Mini scaffold of "Christina" — a compact multi-agent AI studio prototype.

Quickstart:
  1. Ensure Node.js >= 18 and npm installed.
  2. Run this scaffold script (if not already run).
  3. cd ${PROJECT_NAME}
  4. npm install
  5. npm run dev
  6. Open http://localhost:5173 for frontend. Backend API on http://localhost:3001

Notes:
- Backend: typescript (Express + socket.io) in backend/src
- Frontend: Vite + React + TypeScript in frontend
- Agent/engine implementations are stubs/simulations to keep the project lightweight.
- Replace engine adapters in backend/src/engines to integrate real AI services.
`;

const envExample = `# Example .env for christina-mini
PORT=3001
FRONTEND_PORT=5173
DEFAULT_ENGINES=GPT4,LocalAI,StableDiffusion,ElevenLabs
`;

/* Backend files (truncated strings for brevity in this summary — full contents included below) */

const backendPackageJson = {
  name: 'christina-mini-backend',
  version: '0.1.0',
  private: true,
  scripts: {
    start: 'ts-node dist/src/server.js'
  },
  dependencies: {
    express: '^4.18.2',
    cors: '^2.8.5',
    'socket.io': '^4.7.2',
    'express-fileupload': '^1.4.0'
  },
  devDependencies: {
    typescript: '^5.3.2',
    'ts-node': '^10.9.1'
  }
};

const backendTsconfig = {
  compilerOptions: {
    target: 'ES2020',
    module: 'commonjs',
    outDir: 'dist',
    rootDir: 'src',
    strict: true,
    esModuleInterop: true,
    forceConsistentCasingInFileNames: true,
    skipLibCheck: true
  },
  include: ['src/**/*']
};

const backendServerTs = `import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import fileUpload from 'express-fileupload';
import cors from 'cors';
import path from 'path';
import Orchestrator from './orchestrator';
import fileConverter from './fileConverter';

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*'} });

app.use(cors());
app.use(express.json());
app.use(fileUpload());

// static folders
app.use('/uploads', express.static(path.join(__dirname, '..', '..', 'backend', 'uploads')));
app.use('/outputs', express.static(path.join(__dirname, '..', '..', 'backend', 'outputs')));

// API endpoints
app.get('/api/agents', (req, res) => {
  res.json({ agents: Orchestrator.getAgents() });
});

app.post('/api/agents/:name/engine', (req, res) => {
  const name = req.params.name;
  const engine = req.body.engine;
  const agent = Orchestrator.updateAgentEngine(name, engine);
  if (!agent) return res.status(404).json({ error: 'Agent not found' });
  res.json(agent);
});

app.post('/api/agents/:name/add-specialty', (req, res) => {
  const name = req.params.name;
  const specialty = req.body.specialty;
  const agent = Orchestrator.addSpecialty(name, specialty);
  if (!agent) return res.status(404).json({ error: 'Agent not found' });
  res.json(agent);
});

app.post('/api/agents/:name/add-bundle', (req, res) => {
  const name = req.params.name;
  const bundle = req.body.bundle;
  const agent = Orchestrator.addKnowledgeBundle(name, bundle);
  if (!agent) return res.status(404).json({ error: 'Agent not found' });
  res.json(agent);
});

// Tasks
app.post('/api/tasks', (req, res) => {
  const task = req.body;
  Orchestrator.addTask(task);
  res.json({ status: 'queued', task });
});
app.get('/api/tasks/:id/output', (req, res) => {
  const out = Orchestrator.getTaskOutput(req.params.id);
  if (!out) return res.status(404).json({ error: 'Not found' });
  res.json({ output: out });
});

// file upload
app.post('/api/file/upload', async (req, res) => {
  try {
    const result = await fileConverter.handleUpload(req);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'upload failed', details: String(err) });
  }
});

app.post('/api/file/convert', async (req, res) => {
  try {
    const { filePath, targetFormat } = req.body;
    const result = await fileConverter.convertFile(filePath, targetFormat);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'convert failed', details: String(err) });
  }
});

// search (simple)
app.get('/api/search', (req, res) => {
  const q = String(req.query.q || '');
  const results = Orchestrator.search(q);
  res.json({ results });
});

// websocket
io.on('connection', socket => {
  console.log('client connected', socket.id);
  Orchestrator.registerSocket(socket);
  socket.on('disconnect', () => {
    Orchestrator.unregisterSocket(socket);
  });
});

// start
const PORT = Number(process.env.PORT || 3001);
server.listen(PORT, () => console.log('Backend running on port', PORT));`;

// orchestrator.ts
const backendOrchestratorTs = `import fs from 'fs';
import path from 'path';
import { Socket } from 'socket.io';

const AGENTS_FILE = path.join(__dirname, '..', 'knowledge', 'agentsRegistry.json');

type Agent = {
  name: string;
  primarySpecialty: string;
  secondarySpecialties?: string[];
  knowledgeBundles?: string[];
  currentEngine?: string;
  engineOptions?: string[];
  selfImprove?: boolean;
  help?: string[];
};

type Task = {
  id?: string;
  title?: string;
  type?: string;
  status?: string;
  assignedAgent?: string;
  simulatedDuration?: number;
  outputType?: string;
  [k: string]: any;
};

class Orchestrator {
  agents: Agent[] = [];
  tasks: Task[] = [];
  taskOutputs: Record<string, any> = {};
  sockets: Set<Socket> = new Set();

  constructor() {
    this.loadAgents();
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

  updateAgentEngine(name: string, engine: string) {
    const a = this.agents.find(x => x.name === name);
    if (!a) return null;
    a.currentEngine = engine;
    this.saveAgents();
    this.broadcast('agent-update', a);
    return a;
  }

  addSpecialty(name: string, specialty: string) {
    const a = this.agents.find(x => x.name === name);
    if (!a) return null;
    a.secondarySpecialties = a.secondarySpecialties || [];
    if (!a.secondarySpecialties.includes(specialty)) a.secondarySpecialties.push(specialty);
    this.saveAgents();
    this.broadcast('agent-update', a);
    return a;
  }

  addKnowledgeBundle(name: string, bundle: string) {
    const a = this.agents.find(x => x.name === name);
    if (!a) return null;
    a.knowledgeBundles = a.knowledgeBundles || [];
    a.knowledgeBundles.push(bundle);
    this.saveAgents();
    this.broadcast('agent-update', a);
    return a;
  }

  triggerSelfImprove() {
    const agent = this.agents.find(a => a.selfImprove);
    if (!agent) return { error: 'No self-improvement agent configured' };
    const message = \`\${agent.name} ran self-improvement (suggestion only)\`;
    this.broadcast('log', { message, time: new Date().toISOString() });
    return { message };
  }

  addTask(task: Task) {
    task.id = task.id || \`t_\${Date.now()}\`;
    task.status = 'queued';
    this.tasks.push(task);
    this.broadcast('task-update', task);
    this.assignTaskToAgent(task);
  }

  assignTaskToAgent(task: Task) {
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

    setTimeout(() => {
      const output = {
        type: task.outputType || (task.type === 'image' ? 'image' : 'text'),
        content: \`Simulated output for task \${task.id} by \${match.name}\`,
        meta: { engine: match.currentEngine || 'simulated' }
      };
      task.status = 'done';
      task.completedAt = new Date().toISOString();
      this.taskOutputs[task.id as string] = output;
      this.broadcast('task-update', task);
      this.broadcast('task-output', { taskId: task.id, output });
    }, task.simulatedDuration || 1500);
  }

  getTaskOutput(id: string) {
    return this.taskOutputs[id] || null;
  }

  search(q: string) {
    const ql = q.toLowerCase();
    const results: any[] = [];
    this.agents.forEach(a => {
      if (a.name.toLowerCase().includes(ql) ||
          (a.primarySpecialty && a.primarySpecialty.toLowerCase().includes(ql)) ||
          (a.secondarySpecialties || []).some(s => s.toLowerCase().includes(ql))) {
        results.push({ category: 'agent', name: a.name, data: a });
      }
      (a.knowledgeBundles || []).forEach(b => {
        if (b.toLowerCase().includes(ql)) results.push({ category: 'bundle', name: b, agent: a.name });
      });
      (a.help || []).forEach(h => {
        if (h.toLowerCase().includes(ql)) results.push({ category: 'help', name: h, agent: a.name });
      });
    });
    this.tasks.forEach(t => {
      if ((t.title || '').toLowerCase().includes(ql) || (t.id || '').toLowerCase().includes(ql)) {
        results.push({ category: 'task', name: t.title || t.id, data: t });
      }
    });
    return results;
  }

  registerSocket(s: Socket) {
    this.sockets.add(s);
    s.emit('agents', this.agents);
    s.emit('tasks', this.tasks);
  }

  unregisterSocket(s: Socket) {
    this.sockets.delete(s);
  }

  broadcast(event: string, data: any) {
    this.sockets.forEach(s => {
      try { s.emit(event, data); } catch {}
    });
  }
}

export default new Orchestrator();
`;

// fileConverter.ts
const backendFileConverterTs = `import fs from 'fs';
import path from 'path';
import { UploadedFile } from 'express-fileupload';
import archiver from 'archiver';

const UPLOADS = path.join(__dirname, '..', 'uploads');
const OUTPUTS = path.join(__dirname, '..', 'outputs');

if (!fs.existsSync(UPLOADS)) fs.mkdirSync(UPLOADS, { recursive: true });
if (!fs.existsSync(OUTPUTS)) fs.mkdirSync(OUTPUTS, { recursive: true });

async function handleUpload(req: any) {
  if (!req.files || !req.files.file) throw new Error('No file uploaded');
  const file: UploadedFile = req.files.file;
  const savePath = path.join(UPLOADS, file.name);
  await file.mv(savePath);
  return { savedAs: \`/uploads/\${file.name}\` };
}

async function convertFile(filePath: string, targetFormat: string) {
  const abs = path.isAbsolute(filePath) ? filePath : path.join(__dirname, '..', filePath);
  if (!fs.existsSync(abs)) throw new Error('Source file not found');
  const ext = path.extname(abs).toLowerCase();
  const name = path.basename(abs, ext);

  if (targetFormat === 'zip') {
    const zipName = \`\${name}.zip\`;
    const zipPath = path.join(OUTPUTS, zipName);
    await new Promise((resolve, reject) => {
      const output = fs.createWriteStream(zipPath);
      const archive = archiver('zip', { zlib: { level: 9 } });
      output.on('close', resolve);
      archive.on('error', reject);
      archive.pipe(output);
      archive.file(abs, { name: path.basename(abs) });
      archive.finalize();
    });
    return { outputFile: \`/outputs/\${zipName}\` };
  }

  if (targetFormat === 'md' && ext === '.txt') {
    const outName = \`\${name}.md\`;
    const outPath = path.join(OUTPUTS, outName);
    fs.copyFileSync(abs, outPath);
    return { outputFile: \`/outputs/\${outName}\` };
  }

  const outName = \`\${name}.\${targetFormat}\`;
  const outPath = path.join(OUTPUTS, outName);
  fs.copyFileSync(abs, outPath);
  return { outputFile: \`/outputs/\${outName}\` };
}

export default { handleUpload, convertFile };`;

/* Initial agents registry JSON */
const agentsRegistryJson = {
  agents: [
    {
      name: 'AI_Alpha',
      primarySpecialty: 'text',
      secondarySpecialties: ['prompt-engineering', 'code'],
      knowledgeBundles: ['general', 'programming'],
      currentEngine: 'GPT-4',
      engineOptions: ['GPT-4', 'Copilot', 'Gemini', 'Ollama', 'LocalAI'],
      selfImprove: true,
      help: ['How to write code', 'Using AI agents']
    },
    {
      name: 'AI_Beta',
      primarySpecialty: 'image',
      secondarySpecialties: ['video', 'design'],
      knowledgeBundles: ['media', 'design-guides'],
      currentEngine: 'StableDiffusion',
      engineOptions: ['StableDiffusion', 'DALL·E', 'MidJourney', 'Runway'],
      selfImprove: false,
      help: ['Creating images', 'Video editing tips']
    },
    {
      name: 'AI_Gamma',
      primarySpecialty: 'audio',
      secondarySpecialties: ['text', 'transcription'],
      knowledgeBundles: ['audio', 'speech'],
      currentEngine: 'ElevenLabs',
      engineOptions: ['ElevenLabs', 'Bark', 'OpenAI-Audio', 'LocalAudio'],
      selfImprove: false,
      help: ['Audio mixing', 'Text-to-speech']
    },
    {
      name: 'Agent_1',
      primarySpecialty: 'workflow',
      secondarySpecialties: ['scheduling'],
      knowledgeBundles: ['workflows'],
      currentEngine: 'LocalAI',
      engineOptions: ['LocalAI'],
      selfImprove: false,
      help: ['Task scheduling']
    },
    {
      name: 'Agent_2',
      primarySpecialty: 'research',
      secondarySpecialties: ['data-collection'],
      knowledgeBundles: ['research'],
      currentEngine: 'LocalAI',
      engineOptions: ['LocalAI'],
      selfImprove: false,
      help: ['Web research basics']
    },
    {
      name: 'Agent_3',
      primarySpecialty: 'media-coordinator',
      secondarySpecialties: ['formatting'],
      knowledgeBundles: ['media-handling'],
      currentEngine: 'LocalAI',
      engineOptions: ['LocalAI'],
      selfImprove: false,
      help: ['Media coordination']
    }
  ]
};

/* Frontend files */
const frontendPkg = {
  name: 'christina-mini-frontend',
  private: true,
  version: '0.0.1',
  scripts: {
    dev: 'vite',
    build: 'vite build',
    preview: 'vite preview'
  },
  dependencies: {
    react: '^18.2.0',
    'react-dom': '^18.2.0',
    'socket.io-client': '^4.7.2'
  },
  devDependencies: {
    vite: '^5.5.1',
    '@vitejs/plugin-react': '^4.0.0',
    typescript: '^5.3.2'
  }
};

const frontendIndexHtml = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Christina Mini</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`;

const frontendTsconfig = {
  compilerOptions: {
    target: 'ES2020',
    useDefineForClassFields: true,
    lib: ['ES2020', 'DOM'],
    module: 'ESNext',
    moduleResolution: 'bundler',
    jsx: 'react-jsx',
    strict: true,
    esModuleInterop: true,
    skipLibCheck: true,
    forceConsistentCasingInFileNames: true
  },
  include: ['src']
};

const feMainTsx = `import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles.css';

createRoot(document.getElementById('root')!).render(<App />);`;

const feAppTsx = `import React from 'react';
import ProjectPage from './ProjectPage';

export default function App() {
  return <ProjectPage />;
}
`;

const feProjectPageTsx = `import React from 'react';
import TopNav from './TopNav';
import LeftSidebar from './LeftSidebar';
import RightSidebar from './RightSidebar';
import WorkflowCanvas from './MainWorkspace/WorkflowCanvas';
import './styles.css';

export default function ProjectPage() {
  return (
    <div className="project-page">
      <TopNav />
      <div className="main">
        <LeftSidebar />
        <div className="workspace">
          <WorkflowCanvas />
        </div>
        <RightSidebar />
      </div>
    </div>
  );
}
`;

const feTopNavTsx = `import React from 'react';
import GlobalSearch from './GlobalSearch';
export default function TopNav(){
  return (
    <div className="topnav">
      <div className="title">Christina Mini</div>
      <div style={{flex:1}} />
      <GlobalSearch />
    </div>
  );
}
`;

const feGlobalSearchTsx = `import React, { useState } from 'react';

export default function GlobalSearch(){
  const [q,setQ]=useState('');
  const [results,setResults]=useState<any[]>([]);
  async function doSearch(){
    if(q.length<2) return setResults([]);
    const res = await fetch('/api/search?q='+encodeURIComponent(q));
    const j = await res.json();
    setResults(j.results || []);
  }
  return (
    <div className="global-search">
      <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search agents, tasks, bundles..." />
      <button onClick={doSearch}>Search</button>
      <div className="search-results">
        {results.map((r,idx)=> <div key={idx} className="result">{r.category}: {r.name}</div>)}
      </div>
    </div>
  );
}
`;

const feLeftSidebarIndexTsx = `import React, { useEffect, useState } from 'react';
import AgentsPanel from './AgentsPanel';
import TasksPanel from './TasksPanel';
import MediaPanel from './MediaPanel';
import LogsPanel from './LogsPanel';
import io from 'socket.io-client';

const socket = io();

export default function LeftSidebar(){
  const [agents,setAgents]=useState<any[]>([]);
  const [tasks,setTasks]=useState<any[]>([]);
  const [logs,setLogs]=useState<string[]>([]);
  useEffect(()=>{
    fetch('/api/agents').then(r=>r.json()).then(j=>setAgents(j.agents||[]));
    socket.on('agents',(a:any)=> setAgents(a));
    socket.on('tasks',(t:any)=> setTasks(t));
    socket.on('task-update',(t:any)=> {
      setTasks(prev=> {
        const exists = prev.find((x:any)=>x.id===t.id);
        if(exists) return prev.map(x=>x.id===t.id?t:x);
        return [...prev,t];
      });
    });
    socket.on('log',(l:any)=> setLogs(prev=>[...prev, \`\${l.time} - \${l.message}\`]));
    return ()=>{ socket.off('agents'); socket.off('tasks'); socket.off('task-update'); socket.off('log'); };
  },[]);
  return (
    <div className="leftsidebar">
      <AgentsPanel agents={agents} />
      <TasksPanel tasks={tasks} />
      <MediaPanel />
      <LogsPanel logs={logs} />
    </div>
  );
}
`;

const feAgentsPanelTsx = `import React from 'react';

export default function AgentsPanel({agents}:{agents:any[]}) {
  if(!agents) return null;
  return (
    <div className="panel agents-panel">
      <h3>Agents</h3>
      {agents.map(a=>(
        <div key={a.name} className="agent-card">
          <div className="agent-name">{a.name}</div>
          <div className="agent-spec">Primary: {a.primarySpecialty}</div>
          <div>Engine:
            <select defaultValue={a.currentEngine} onChange={async (e)=> {
              await fetch('/api/agents/'+encodeURIComponent(a.name)+'/engine',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({engine:e.target.value})});
              // refresh omitted for brevity; socket will update
            }}>
              {(a.engineOptions||[]).map((opt:string)=> <option key={opt}>{opt}</option>)}
            </select>
          </div>
        </div>
      ))}
    </div>
  );
}
`;

const feTasksPanelTsx = `import React from 'react';
export default function TasksPanel({tasks}:{tasks:any[]}) {
  return (
    <div className="panel tasks-panel">
      <h3>Tasks</h3>
      {(tasks||[]).map(t=>(
        <div key={t.id} className="task-card">
          <div>{t.title || t.id}</div>
          <div>Status: {t.status}</div>
          <div>Agent: {t.assignedAgent || '-'}</div>
        </div>
      ))}
    </div>
  );
}
`;

const feMediaPanelTsx = `import React from 'react';
export default function MediaPanel(){ return (
  <div className="panel media-panel">
    <h3>Media (simulated)</h3>
    <div>No media yet</div>
  </div>
); }
`;

const feLogsPanelTsx = `import React from 'react';
export default function LogsPanel({logs}:{logs:string[]}) {
  return (
    <div className="panel logs-panel">
      <h3>Logs</h3>
      <div className="logs-list">{(logs||[]).slice().reverse().map((l,i)=> <div key={i} className="log">{l}</div>)}</div>
    </div>
  );
}
`;

const feRightSidebarIndexTsx = `import React from 'react';
import FileConverter from './FileConverter';
import HelpManual from './HelpManual';
export default function RightSidebar(){
  return (
    <div className="rightsidebar">
      <FileConverter />
      <HelpManual />
    </div>
  );
}
`;

const feFileConverterTsx = `import React, { useState } from 'react';
export default function FileConverter(){
  const [file,setFile]=useState<File| null>(null);
  const [status,setStatus]=useState('');
  async function upload(){
    if(!file) return;
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch('/api/file/upload',{method:'POST',body:fd});
    const j = await res.json();
    setStatus('Saved: '+(j.savedAs||''));
  }
  return (
    <div className="panel file-converter">
      <h3>File Converter</h3>
      <input type="file" onChange={e=> setFile(e.target.files?.[0] || null)} />
      <button onClick={upload}>Upload</button>
      <div>{status}</div>
    </div>
  );
}
`;

const feHelpManualTsx = `import React, { useState } from 'react';
export default function HelpManual(){
  const [q,setQ]=useState('');
  const [res,setRes]=useState<any[]>([]);
  async function search(){
    const r=await fetch('/api/search?q='+encodeURIComponent(q));
    const j=await r.json();
    setRes(j.results||[]);
  }
  return (
    <div className="panel help-manual">
      <h3>Help</h3>
      <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search help..." />
      <button onClick={search}>Search</button>
      <div>{res.map((r:any,i)=> <div key={i}>{r.category}: {r.name}</div>)}</div>
    </div>
  );
}
`;

const feWorkflowCanvasTsx = `import React from 'react';
export default function WorkflowCanvas(){
  return (
    <div className="workflow-canvas">
      <h2>Workflow Canvas</h2>
      <p>Drag/drop and chain tasks (placeholder)</p>
    </div>
  );
}
`;

const feStylesCss = `:root{
  --bg:#1e1e1e; --panel:#2a2a2a; --card:#333; --text:#e0e0e0;
  --accent:#ff69b4; --cyan:#00cfff; --success:#39ff14;
}
body{ margin:0; font-family:Inter,Segoe UI,Arial; background:var(--bg); color:var(--text); }
.project-page{ display:flex; flex-direction:column; height:100vh; }
.topnav{ display:flex; align-items:center; gap:12px; padding:10px; background:var(--panel); }
.main{ display:flex; flex:1; gap:12px; padding:12px; }
.leftsidebar{ width:300px; display:flex; flex-direction:column; gap:12px; }
.rightsidebar{ width:320px; display:flex; flex-direction:column; gap:12px; }
.workspace{ flex:1; background:#252525; border-radius:8px; padding:12px; }
.panel{ background:var(--panel); padding:10px; border-radius:8px; box-shadow:0 4px 12px rgba(0,0,0,0.5); }
.agent-card, .task-card{ background:var(--card); padding:8px; margin-bottom:8px; border-radius:6px; }
.global-search input{ padding:6px; border-radius:6px; background:#1e1e1e; color:var(--text); border:1px solid #444; }
button{ background:var(--accent); color:#111; border:none; padding:6px 10px; border-radius:6px; cursor:pointer; }
`;

/* ---------- Write files to disk ---------- */

if (fs.existsSync(OUT_DIR)) {
  console.error('Error: target folder already exists. Please remove or choose a different location:', OUT_DIR);
  process.exit(1);
}

fs.mkdirSync(OUT_DIR, { recursive: true });

// root files
writeFile(path.join(OUT_DIR, 'package.json'), json(packageJson));
writeFile(path.join(OUT_DIR, 'README.md'), readme);
writeFile(path.join(OUT_DIR, '.env.example'), envExample);

// backend
const backendRoot = path.join(OUT_DIR, 'backend');
writeFile(path.join(backendRoot, 'package.json'), json(backendPackageJson));
writeFile(path.join(backendRoot, 'tsconfig.json'), json(backendTsconfig));
writeFile(path.join(backendRoot, 'src', 'server.ts'), backendServerTs);
writeFile(path.join(backendRoot, 'src', 'orchestrator.ts'), backendOrchestratorTs);
writeFile(path.join(backendRoot, 'src', 'fileConverter.ts'), backendFileConverterTs);
writeFile(path.join(backendRoot, 'knowledge', 'agentsRegistry.json'), json(agentsRegistryJson));
fs.mkdirSync(path.join(backendRoot, 'uploads'), { recursive: true });
fs.mkdirSync(path.join(backendRoot, 'outputs'), { recursive: true });

// frontend
const frontendRoot = path.join(OUT_DIR, 'frontend');
writeFile(path.join(frontendRoot, 'package.json'), json(frontendPkg));
writeFile(path.join(frontendRoot, 'index.html'), frontendIndexHtml);
writeFile(path.join(frontendRoot, 'tsconfig.json'), json(frontendTsconfig));
writeFile(path.join(frontendRoot, 'src', 'main.tsx'), feMainTsx);
writeFile(path.join(frontendRoot, 'src', 'App.tsx'), feAppTsx);
writeFile(path.join(frontendRoot, 'src', 'ProjectPage.tsx'), feProjectPageTsx);
writeFile(path.join(frontendRoot, 'src', 'TopNav.tsx'), feTopNavTsx);
writeFile(path.join(frontendRoot, 'src', 'GlobalSearch.tsx'), feGlobalSearchTsx);

writeFile(path.join(frontendRoot, 'src', 'LeftSidebar', 'index.tsx'), feLeftSidebarIndexTsx);
writeFile(path.join(frontendRoot, 'src', 'LeftSidebar', 'AgentsPanel.tsx'), feAgentsPanelTsx);
writeFile(path.join(frontendRoot, 'src', 'LeftSidebar', 'TasksPanel.tsx'), feTasksPanelTsx);
writeFile(path.join(frontendRoot, 'src', 'LeftSidebar', 'MediaPanel.tsx'), feMediaPanelTsx);
writeFile(path.join(frontendRoot, 'src', 'LeftSidebar', 'LogsPanel.tsx'), feLogsPanelTsx);

writeFile(path.join(frontendRoot, 'src', 'RightSidebar', 'index.tsx'), feRightSidebarIndexTsx);
writeFile(path.join(frontendRoot, 'src', 'RightSidebar', 'FileConverter.tsx'), feFileConverterTsx);
writeFile(path.join(frontendRoot, 'src', 'RightSidebar', 'HelpManual.tsx'), feHelpManualTsx);

writeFile(path.join(frontendRoot, 'src', 'MainWorkspace', 'WorkflowCanvas.tsx'), feWorkflowCanvasTsx);
writeFile(path.join(frontendRoot, 'src', 'styles.css'), feStylesCss);

// .gitignore
const gitignore = `node_modules
dist
.env
uploads
outputs
`;
writeFile(path.join(OUT_DIR, '.gitignore'), gitignore);

/* ---------- Create zip ---------- */

async function createZip(sourceDir: string, outPath: string) {
  return new Promise<void>((resolve, reject) => {
    const output = fs.createWriteStream(outPath);
    const archive = archiver('zip', { zlib: { level: 9 } });
    output.on('close', () => {
      console.log(\`Created zip (\${archive.pointer()} total bytes): \${outPath}\`);
      resolve();
    });
    archive.on('error', err => reject(err));
    archive.pipe(output);
    archive.directory(sourceDir, path.basename(sourceDir));
    archive.finalize();
  });
}

(async () => {
  try {
    if (fs.existsSync(ZIP_PATH)) {
      fs.unlinkSync(ZIP_PATH);
    }
    await createZip(OUT_DIR, ZIP_PATH);
    console.log('\\nDone. Files created:');
    console.log(' -', OUT_DIR);
    console.log(' -', ZIP_PATH);
    console.log('\\nNext: upload the zip to Google Drive or unzip locally.');
  } catch (err) {
    console.error('Error while zipping:', err);
    process.exit(1);
  }
})();

        