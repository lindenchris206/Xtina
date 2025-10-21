#!/usr/bin/env ts-node
"use strict";
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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = require("fs");
var path_1 = require("path");
var process_1 = require("process");
var archiver_1 = require("archiver");
var PROJECT_NAME = 'christina-mini';
var OUT_DIR = path_1.default.join(process_1.default.cwd(), PROJECT_NAME);
var ZIP_PATH = path_1.default.join(process_1.default.cwd(), "".concat(PROJECT_NAME, ".zip"));
function writeFile(filePath, content) {
    fs_1.default.mkdirSync(path_1.default.dirname(filePath), { recursive: true });
    fs_1.default.writeFileSync(filePath, content, { encoding: 'utf8' });
    console.log('Wrote', path_1.default.relative(process_1.default.cwd(), filePath));
}
function json(obj) {
    return JSON.stringify(obj, null, 2);
}
/* ---------- (Scaffold content — same as before) ---------- */
// root package.json
var packageJson = {
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
var readme = "christina-mini\n\nMini scaffold of \"Christina\" \u2014 a compact multi-agent AI studio prototype.\n\nQuickstart:\n  1. Ensure Node.js >= 18 and npm installed.\n  2. Run this scaffold script (if not already run).\n  3. cd ".concat(PROJECT_NAME, "\n  4. npm install\n  5. npm run dev\n  6. Open http://localhost:5173 for frontend. Backend API on http://localhost:3001\n\nNotes:\n- Backend: typescript (Express + socket.io) in backend/src\n- Frontend: Vite + React + TypeScript in frontend\n- Agent/engine implementations are stubs/simulations to keep the project lightweight.\n- Replace engine adapters in backend/src/engines to integrate real AI services.\n");
var envExample = "# Example .env for christina-mini\nPORT=3001\nFRONTEND_PORT=5173\nDEFAULT_ENGINES=GPT4,LocalAI,StableDiffusion,ElevenLabs\n";
/* Backend files (truncated strings for brevity in this summary — full contents included below) */
var backendPackageJson = {
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
var backendTsconfig = {
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
var backendServerTs = "import express from 'express';\nimport http from 'http';\nimport { Server } from 'socket.io';\nimport fileUpload from 'express-fileupload';\nimport cors from 'cors';\nimport path from 'path';\nimport Orchestrator from './orchestrator';\nimport fileConverter from './fileConverter';\n\nconst app = express();\nconst server = http.createServer(app);\nconst io = new Server(server, { cors: { origin: '*'} });\n\napp.use(cors());\napp.use(express.json());\napp.use(fileUpload());\n\n// static folders\napp.use('/uploads', express.static(path.join(__dirname, '..', '..', 'backend', 'uploads')));\napp.use('/outputs', express.static(path.join(__dirname, '..', '..', 'backend', 'outputs')));\n\n// API endpoints\napp.get('/api/agents', (req, res) => {\n  res.json({ agents: Orchestrator.getAgents() });\n});\n\napp.post('/api/agents/:name/engine', (req, res) => {\n  const name = req.params.name;\n  const engine = req.body.engine;\n  const agent = Orchestrator.updateAgentEngine(name, engine);\n  if (!agent) return res.status(404).json({ error: 'Agent not found' });\n  res.json(agent);\n});\n\napp.post('/api/agents/:name/add-specialty', (req, res) => {\n  const name = req.params.name;\n  const specialty = req.body.specialty;\n  const agent = Orchestrator.addSpecialty(name, specialty);\n  if (!agent) return res.status(404).json({ error: 'Agent not found' });\n  res.json(agent);\n});\n\napp.post('/api/agents/:name/add-bundle', (req, res) => {\n  const name = req.params.name;\n  const bundle = req.body.bundle;\n  const agent = Orchestrator.addKnowledgeBundle(name, bundle);\n  if (!agent) return res.status(404).json({ error: 'Agent not found' });\n  res.json(agent);\n});\n\n// Tasks\napp.post('/api/tasks', (req, res) => {\n  const task = req.body;\n  Orchestrator.addTask(task);\n  res.json({ status: 'queued', task });\n});\napp.get('/api/tasks/:id/output', (req, res) => {\n  const out = Orchestrator.getTaskOutput(req.params.id);\n  if (!out) return res.status(404).json({ error: 'Not found' });\n  res.json({ output: out });\n});\n\n// file upload\napp.post('/api/file/upload', async (req, res) => {\n  try {\n    const result = await fileConverter.handleUpload(req);\n    res.json(result);\n  } catch (err) {\n    console.error(err);\n    res.status(500).json({ error: 'upload failed', details: String(err) });\n  }\n});\n\napp.post('/api/file/convert', async (req, res) => {\n  try {\n    const { filePath, targetFormat } = req.body;\n    const result = await fileConverter.convertFile(filePath, targetFormat);\n    res.json(result);\n  } catch (err) {\n    res.status(500).json({ error: 'convert failed', details: String(err) });\n  }\n});\n\n// search (simple)\napp.get('/api/search', (req, res) => {\n  const q = String(req.query.q || '');\n  const results = Orchestrator.search(q);\n  res.json({ results });\n});\n\n// websocket\nio.on('connection', socket => {\n  console.log('client connected', socket.id);\n  Orchestrator.registerSocket(socket);\n  socket.on('disconnect', () => {\n    Orchestrator.unregisterSocket(socket);\n  });\n});\n\n// start\nconst PORT = Number(process.env.PORT || 3001);\nserver.listen(PORT, () => console.log('Backend running on port', PORT));";
// orchestrator.ts
var backendOrchestratorTs = "import fs from 'fs';\nimport path from 'path';\nimport { Socket } from 'socket.io';\n\nconst AGENTS_FILE = path.join(__dirname, '..', 'knowledge', 'agentsRegistry.json');\n\ntype Agent = {\n  name: string;\n  primarySpecialty: string;\n  secondarySpecialties?: string[];\n  knowledgeBundles?: string[];\n  currentEngine?: string;\n  engineOptions?: string[];\n  selfImprove?: boolean;\n  help?: string[];\n};\n\ntype Task = {\n  id?: string;\n  title?: string;\n  type?: string;\n  status?: string;\n  assignedAgent?: string;\n  simulatedDuration?: number;\n  outputType?: string;\n  [k: string]: any;\n};\n\nclass Orchestrator {\n  agents: Agent[] = [];\n  tasks: Task[] = [];\n  taskOutputs: Record<string, any> = {};\n  sockets: Set<Socket> = new Set();\n\n  constructor() {\n    this.loadAgents();\n  }\n\n  loadAgents() {\n    try {\n      const raw = fs.readFileSync(AGENTS_FILE, 'utf8');\n      const j = JSON.parse(raw);\n      this.agents = j.agents || [];\n    } catch (e) {\n      console.warn('Could not load agents registry', e);\n      this.agents = [];\n    }\n  }\n\n  saveAgents() {\n    try {\n      fs.writeFileSync(AGENTS_FILE, JSON.stringify({ agents: this.agents }, null, 2));\n    } catch (e) { console.error('saveAgents error', e); }\n  }\n\n  getAgents() { return this.agents; }\n\n  updateAgentEngine(name: string, engine: string) {\n    const a = this.agents.find(x => x.name === name);\n    if (!a) return null;\n    a.currentEngine = engine;\n    this.saveAgents();\n    this.broadcast('agent-update', a);\n    return a;\n  }\n\n  addSpecialty(name: string, specialty: string) {\n    const a = this.agents.find(x => x.name === name);\n    if (!a) return null;\n    a.secondarySpecialties = a.secondarySpecialties || [];\n    if (!a.secondarySpecialties.includes(specialty)) a.secondarySpecialties.push(specialty);\n    this.saveAgents();\n    this.broadcast('agent-update', a);\n    return a;\n  }\n\n  addKnowledgeBundle(name: string, bundle: string) {\n    const a = this.agents.find(x => x.name === name);\n    if (!a) return null;\n    a.knowledgeBundles = a.knowledgeBundles || [];\n    a.knowledgeBundles.push(bundle);\n    this.saveAgents();\n    this.broadcast('agent-update', a);\n    return a;\n  }\n\n  triggerSelfImprove() {\n    const agent = this.agents.find(a => a.selfImprove);\n    if (!agent) return { error: 'No self-improvement agent configured' };\n    const message = `${agent.name} ran self-improvement (suggestion only)`;\n    this.broadcast('log', { message, time: new Date().toISOString() });\n    return { message };\n  }\n\n  addTask(task: Task) {\n    task.id = task.id || `t_${Date.now()}`;\n    task.status = 'queued';\n    this.tasks.push(task);\n    this.broadcast('task-update', task);\n    this.assignTaskToAgent(task);\n  }\n\n  assignTaskToAgent(task: Task) {\n    const match = this.agents.find(a =>\n      a.primarySpecialty === task.type ||\n      (a.secondarySpecialties || []).includes(task.type)\n    ) || this.agents[0];\n\n    if (!match) {\n      task.status = 'failed';\n      this.broadcast('task-update', task);\n      return;\n    }\n\n    task.assignedAgent = match.name;\n    task.status = 'running';\n    this.broadcast('task-update', task);\n\n    setTimeout(() => {\n      const output = {\n        type: task.outputType || (task.type === 'image' ? 'image' : 'text'),\n        content: `Simulated output for task ${task.id} by ${match.name}`,\n        meta: { engine: match.currentEngine || 'simulated' }\n      };\n      task.status = 'done';\n      task.completedAt = new Date().toISOString();\n      this.taskOutputs[task.id as string] = output;\n      this.broadcast('task-update', task);\n      this.broadcast('task-output', { taskId: task.id, output });\n    }, task.simulatedDuration || 1500);\n  }\n\n  getTaskOutput(id: string) {\n    return this.taskOutputs[id] || null;\n  }\n\n  search(q: string) {\n    const ql = q.toLowerCase();\n    const results: any[] = [];\n    this.agents.forEach(a => {\n      if (a.name.toLowerCase().includes(ql) ||\n          (a.primarySpecialty && a.primarySpecialty.toLowerCase().includes(ql)) ||\n          (a.secondarySpecialties || []).some(s => s.toLowerCase().includes(ql))) {\n        results.push({ category: 'agent', name: a.name, data: a });\n      }\n      (a.knowledgeBundles || []).forEach(b => {\n        if (b.toLowerCase().includes(ql)) results.push({ category: 'bundle', name: b, agent: a.name });\n      });\n      (a.help || []).forEach(h => {\n        if (h.toLowerCase().includes(ql)) results.push({ category: 'help', name: h, agent: a.name });\n      });\n    });\n    this.tasks.forEach(t => {\n      if ((t.title || '').toLowerCase().includes(ql) || (t.id || '').toLowerCase().includes(ql)) {\n        results.push({ category: 'task', name: t.title || t.id, data: t });\n      }\n    });\n    return results;\n  }\n\n  registerSocket(s: Socket) {\n    this.sockets.add(s);\n    s.emit('agents', this.agents);\n    s.emit('tasks', this.tasks);\n  }\n\n  unregisterSocket(s: Socket) {\n    this.sockets.delete(s);\n  }\n\n  broadcast(event: string, data: any) {\n    this.sockets.forEach(s => {\n      try { s.emit(event, data); } catch {}\n    });\n  }\n}\n\nexport default new Orchestrator();\n";
// fileConverter.ts
var backendFileConverterTs = "import fs from 'fs';\nimport path from 'path';\nimport { UploadedFile } from 'express-fileupload';\nimport archiver from 'archiver';\n\nconst UPLOADS = path.join(__dirname, '..', 'uploads');\nconst OUTPUTS = path.join(__dirname, '..', 'outputs');\n\nif (!fs.existsSync(UPLOADS)) fs.mkdirSync(UPLOADS, { recursive: true });\nif (!fs.existsSync(OUTPUTS)) fs.mkdirSync(OUTPUTS, { recursive: true });\n\nasync function handleUpload(req: any) {\n  if (!req.files || !req.files.file) throw new Error('No file uploaded');\n  const file: UploadedFile = req.files.file;\n  const savePath = path.join(UPLOADS, file.name);\n  await file.mv(savePath);\n  return { savedAs: `/uploads/${file.name}` };\n}\n\nasync function convertFile(filePath: string, targetFormat: string) {\n  const abs = path.isAbsolute(filePath) ? filePath : path.join(__dirname, '..', filePath);\n  if (!fs.existsSync(abs)) throw new Error('Source file not found');\n  const ext = path.extname(abs).toLowerCase();\n  const name = path.basename(abs, ext);\n\n  if (targetFormat === 'zip') {\n    const zipName = `${name}.zip`;\n    const zipPath = path.join(OUTPUTS, zipName);\n    await new Promise((resolve, reject) => {\n      const output = fs.createWriteStream(zipPath);\n      const archive = archiver('zip', { zlib: { level: 9 } });\n      output.on('close', resolve);\n      archive.on('error', reject);\n      archive.pipe(output);\n      archive.file(abs, { name: path.basename(abs) });\n      archive.finalize();\n    });\n    return { outputFile: `/outputs/${zipName}` };\n  }\n\n  if (targetFormat === 'md' && ext === '.txt') {\n    const outName = `${name}.md`;\n    const outPath = path.join(OUTPUTS, outName);\n    fs.copyFileSync(abs, outPath);\n    return { outputFile: `/outputs/${outName}` };\n  }\n\n  const outName = `${name}.${targetFormat}`;\n  const outPath = path.join(OUTPUTS, outName);\n  fs.copyFileSync(abs, outPath);\n  return { outputFile: `/outputs/${outName}` };\n}\n\nexport default { handleUpload, convertFile };";
/* Initial agents registry JSON */
var agentsRegistryJson = {
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
var frontendPkg = {
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
var frontendIndexHtml = "<!doctype html>\n<html>\n  <head>\n    <meta charset=\"utf-8\" />\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />\n    <title>Christina Mini</title>\n  </head>\n  <body>\n    <div id=\"root\"></div>\n    <script type=\"module\" src=\"/src/main.tsx\"></script>\n  </body>\n</html>";
var frontendTsconfig = {
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
var feMainTsx = "import React from 'react';\nimport { createRoot } from 'react-dom/client';\nimport App from './App';\nimport './styles.css';\n\ncreateRoot(document.getElementById('root')!).render(<App />);";
var feAppTsx = "import React from 'react';\nimport ProjectPage from './ProjectPage';\n\nexport default function App() {\n  return <ProjectPage />;\n}\n";
var feProjectPageTsx = "import React from 'react';\nimport TopNav from './TopNav';\nimport LeftSidebar from './LeftSidebar';\nimport RightSidebar from './RightSidebar';\nimport WorkflowCanvas from './MainWorkspace/WorkflowCanvas';\nimport './styles.css';\n\nexport default function ProjectPage() {\n  return (\n    <div className=\"project-page\">\n      <TopNav />\n      <div className=\"main\">\n        <LeftSidebar />\n        <div className=\"workspace\">\n          <WorkflowCanvas />\n        </div>\n        <RightSidebar />\n      </div>\n    </div>\n  );\n}\n";
var feTopNavTsx = "import React from 'react';\nimport GlobalSearch from './GlobalSearch';\nexport default function TopNav(){\n  return (\n    <div className=\"topnav\">\n      <div className=\"title\">Christina Mini</div>\n      <div style={{flex:1}} />\n      <GlobalSearch />\n    </div>\n  );\n}\n";
var feGlobalSearchTsx = "import React, { useState } from 'react';\n\nexport default function GlobalSearch(){\n  const [q,setQ]=useState('');\n  const [results,setResults]=useState<any[]>([]);\n  async function doSearch(){\n    if(q.length<2) return setResults([]);\n    const res = await fetch('/api/search?q='+encodeURIComponent(q));\n    const j = await res.json();\n    setResults(j.results || []);\n  }\n  return (\n    <div className=\"global-search\">\n      <input value={q} onChange={e=>setQ(e.target.value)} placeholder=\"Search agents, tasks, bundles...\" />\n      <button onClick={doSearch}>Search</button>\n      <div className=\"search-results\">\n        {results.map((r,idx)=> <div key={idx} className=\"result\">{r.category}: {r.name}</div>)}\n      </div>\n    </div>\n  );\n}\n";
var feLeftSidebarIndexTsx = "import React, { useEffect, useState } from 'react';\nimport AgentsPanel from './AgentsPanel';\nimport TasksPanel from './TasksPanel';\nimport MediaPanel from './MediaPanel';\nimport LogsPanel from './LogsPanel';\nimport io from 'socket.io-client';\n\nconst socket = io();\n\nexport default function LeftSidebar(){\n  const [agents,setAgents]=useState<any[]>([]);\n  const [tasks,setTasks]=useState<any[]>([]);\n  const [logs,setLogs]=useState<string[]>([]);\n  useEffect(()=>{\n    fetch('/api/agents').then(r=>r.json()).then(j=>setAgents(j.agents||[]));\n    socket.on('agents',(a:any)=> setAgents(a));\n    socket.on('tasks',(t:any)=> setTasks(t));\n    socket.on('task-update',(t:any)=> {\n      setTasks(prev=> {\n        const exists = prev.find((x:any)=>x.id===t.id);\n        if(exists) return prev.map(x=>x.id===t.id?t:x);\n        return [...prev,t];\n      });\n    });\n    socket.on('log',(l:any)=> setLogs(prev=>[...prev, `${l.time} - ${l.message}`]));\n    return ()=>{ socket.off('agents'); socket.off('tasks'); socket.off('task-update'); socket.off('log'); };\n  },[]);\n  return (\n    <div className=\"leftsidebar\">\n      <AgentsPanel agents={agents} />\n      <TasksPanel tasks={tasks} />\n      <MediaPanel />\n      <LogsPanel logs={logs} />\n    </div>\n  );\n}\n";
var feAgentsPanelTsx = "import React from 'react';\n\nexport default function AgentsPanel({agents}:{agents:any[]}) {\n  if(!agents) return null;\n  return (\n    <div className=\"panel agents-panel\">\n      <h3>Agents</h3>\n      {agents.map(a=>(\n        <div key={a.name} className=\"agent-card\">\n          <div className=\"agent-name\">{a.name}</div>\n          <div className=\"agent-spec\">Primary: {a.primarySpecialty}</div>\n          <div>Engine:\n            <select defaultValue={a.currentEngine} onChange={async (e)=> {\n              await fetch('/api/agents/'+encodeURIComponent(a.name)+'/engine',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({engine:e.target.value})});\n              // refresh omitted for brevity; socket will update\n            }}>\n              {(a.engineOptions||[]).map((opt:string)=> <option key={opt}>{opt}</option>)}\n            </select>\n          </div>\n        </div>\n      ))}\n    </div>\n  );\n}\n";
var feTasksPanelTsx = "import React from 'react';\nexport default function TasksPanel({tasks}:{tasks:any[]}) {\n  return (\n    <div className=\"panel tasks-panel\">\n      <h3>Tasks</h3>\n      {(tasks||[]).map(t=>(\n        <div key={t.id} className=\"task-card\">\n          <div>{t.title || t.id}</div>\n          <div>Status: {t.status}</div>\n          <div>Agent: {t.assignedAgent || '-'}</div>\n        </div>\n      ))}\n    </div>\n  );\n}\n";
var feMediaPanelTsx = "import React from 'react';\nexport default function MediaPanel(){ return (\n  <div className=\"panel media-panel\">\n    <h3>Media (simulated)</h3>\n    <div>No media yet</div>\n  </div>\n); }\n";
var feLogsPanelTsx = "import React from 'react';\nexport default function LogsPanel({logs}:{logs:string[]}) {\n  return (\n    <div className=\"panel logs-panel\">\n      <h3>Logs</h3>\n      <div className=\"logs-list\">{(logs||[]).slice().reverse().map((l,i)=> <div key={i} className=\"log\">{l}</div>)}</div>\n    </div>\n  );\n}\n";
var feRightSidebarIndexTsx = "import React from 'react';\nimport FileConverter from './FileConverter';\nimport HelpManual from './HelpManual';\nexport default function RightSidebar(){\n  return (\n    <div className=\"rightsidebar\">\n      <FileConverter />\n      <HelpManual />\n    </div>\n  );\n}\n";
var feFileConverterTsx = "import React, { useState } from 'react';\nexport default function FileConverter(){\n  const [file,setFile]=useState<File| null>(null);\n  const [status,setStatus]=useState('');\n  async function upload(){\n    if(!file) return;\n    const fd = new FormData();\n    fd.append('file', file);\n    const res = await fetch('/api/file/upload',{method:'POST',body:fd});\n    const j = await res.json();\n    setStatus('Saved: '+(j.savedAs||''));\n  }\n  return (\n    <div className=\"panel file-converter\">\n      <h3>File Converter</h3>\n      <input type=\"file\" onChange={e=> setFile(e.target.files?.[0] || null)} />\n      <button onClick={upload}>Upload</button>\n      <div>{status}</div>\n    </div>\n  );\n}\n";
var feHelpManualTsx = "import React, { useState } from 'react';\nexport default function HelpManual(){\n  const [q,setQ]=useState('');\n  const [res,setRes]=useState<any[]>([]);\n  async function search(){\n    const r=await fetch('/api/search?q='+encodeURIComponent(q));\n    const j=await r.json();\n    setRes(j.results||[]);\n  }\n  return (\n    <div className=\"panel help-manual\">\n      <h3>Help</h3>\n      <input value={q} onChange={e=>setQ(e.target.value)} placeholder=\"Search help...\" />\n      <button onClick={search}>Search</button>\n      <div>{res.map((r:any,i)=> <div key={i}>{r.category}: {r.name}</div>)}</div>\n    </div>\n  );\n}\n";
var feWorkflowCanvasTsx = "import React from 'react';\nexport default function WorkflowCanvas(){\n  return (\n    <div className=\"workflow-canvas\">\n      <h2>Workflow Canvas</h2>\n      <p>Drag/drop and chain tasks (placeholder)</p>\n    </div>\n  );\n}\n";
var feStylesCss = ":root{\n  --bg:#1e1e1e; --panel:#2a2a2a; --card:#333; --text:#e0e0e0;\n  --accent:#ff69b4; --cyan:#00cfff; --success:#39ff14;\n}\nbody{ margin:0; font-family:Inter,Segoe UI,Arial; background:var(--bg); color:var(--text); }\n.project-page{ display:flex; flex-direction:column; height:100vh; }\n.topnav{ display:flex; align-items:center; gap:12px; padding:10px; background:var(--panel); }\n.main{ display:flex; flex:1; gap:12px; padding:12px; }\n.leftsidebar{ width:300px; display:flex; flex-direction:column; gap:12px; }\n.rightsidebar{ width:320px; display:flex; flex-direction:column; gap:12px; }\n.workspace{ flex:1; background:#252525; border-radius:8px; padding:12px; }\n.panel{ background:var(--panel); padding:10px; border-radius:8px; box-shadow:0 4px 12px rgba(0,0,0,0.5); }\n.agent-card, .task-card{ background:var(--card); padding:8px; margin-bottom:8px; border-radius:6px; }\n.global-search input{ padding:6px; border-radius:6px; background:#1e1e1e; color:var(--text); border:1px solid #444; }\nbutton{ background:var(--accent); color:#111; border:none; padding:6px 10px; border-radius:6px; cursor:pointer; }\n";
/* ---------- Write files to disk ---------- */
if (fs_1.default.existsSync(OUT_DIR)) {
    console.error('Error: target folder already exists. Please remove or choose a different location:', OUT_DIR);
    process_1.default.exit(1);
}
fs_1.default.mkdirSync(OUT_DIR, { recursive: true });
// root files
writeFile(path_1.default.join(OUT_DIR, 'package.json'), json(packageJson));
writeFile(path_1.default.join(OUT_DIR, 'README.md'), readme);
writeFile(path_1.default.join(OUT_DIR, '.env.example'), envExample);
// backend
var backendRoot = path_1.default.join(OUT_DIR, 'backend');
writeFile(path_1.default.join(backendRoot, 'package.json'), json(backendPackageJson));
writeFile(path_1.default.join(backendRoot, 'tsconfig.json'), json(backendTsconfig));
writeFile(path_1.default.join(backendRoot, 'src', 'server.ts'), backendServerTs);
writeFile(path_1.default.join(backendRoot, 'src', 'orchestrator.ts'), backendOrchestratorTs);
writeFile(path_1.default.join(backendRoot, 'src', 'fileConverter.ts'), backendFileConverterTs);
writeFile(path_1.default.join(backendRoot, 'knowledge', 'agentsRegistry.json'), json(agentsRegistryJson));
fs_1.default.mkdirSync(path_1.default.join(backendRoot, 'uploads'), { recursive: true });
fs_1.default.mkdirSync(path_1.default.join(backendRoot, 'outputs'), { recursive: true });
// frontend
var frontendRoot = path_1.default.join(OUT_DIR, 'frontend');
writeFile(path_1.default.join(frontendRoot, 'package.json'), json(frontendPkg));
writeFile(path_1.default.join(frontendRoot, 'index.html'), frontendIndexHtml);
writeFile(path_1.default.join(frontendRoot, 'tsconfig.json'), json(frontendTsconfig));
writeFile(path_1.default.join(frontendRoot, 'src', 'main.tsx'), feMainTsx);
writeFile(path_1.default.join(frontendRoot, 'src', 'App.tsx'), feAppTsx);
writeFile(path_1.default.join(frontendRoot, 'src', 'ProjectPage.tsx'), feProjectPageTsx);
writeFile(path_1.default.join(frontendRoot, 'src', 'TopNav.tsx'), feTopNavTsx);
writeFile(path_1.default.join(frontendRoot, 'src', 'GlobalSearch.tsx'), feGlobalSearchTsx);
writeFile(path_1.default.join(frontendRoot, 'src', 'LeftSidebar', 'index.tsx'), feLeftSidebarIndexTsx);
writeFile(path_1.default.join(frontendRoot, 'src', 'LeftSidebar', 'AgentsPanel.tsx'), feAgentsPanelTsx);
writeFile(path_1.default.join(frontendRoot, 'src', 'LeftSidebar', 'TasksPanel.tsx'), feTasksPanelTsx);
writeFile(path_1.default.join(frontendRoot, 'src', 'LeftSidebar', 'MediaPanel.tsx'), feMediaPanelTsx);
writeFile(path_1.default.join(frontendRoot, 'src', 'LeftSidebar', 'LogsPanel.tsx'), feLogsPanelTsx);
writeFile(path_1.default.join(frontendRoot, 'src', 'RightSidebar', 'index.tsx'), feRightSidebarIndexTsx);
writeFile(path_1.default.join(frontendRoot, 'src', 'RightSidebar', 'FileConverter.tsx'), feFileConverterTsx);
writeFile(path_1.default.join(frontendRoot, 'src', 'RightSidebar', 'HelpManual.tsx'), feHelpManualTsx);
writeFile(path_1.default.join(frontendRoot, 'src', 'MainWorkspace', 'WorkflowCanvas.tsx'), feWorkflowCanvasTsx);
writeFile(path_1.default.join(frontendRoot, 'src', 'styles.css'), feStylesCss);
// .gitignore
var gitignore = "node_modules\ndist\n.env\nuploads\noutputs\n";
writeFile(path_1.default.join(OUT_DIR, '.gitignore'), gitignore);
/* ---------- Create zip ---------- */
function createZip(sourceDir, outPath) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (resolve, reject) {
                    var output = fs_1.default.createWriteStream(outPath);
                    var archive = (0, archiver_1.default)('zip', { zlib: { level: 9 } });
                    output.on('close', function () {
                        console.log("Created zip (${archive.pointer()} total bytes): ${outPath}`);\n      resolve();\n    });\n    archive.on('error', err => reject(err));\n    archive.pipe(output);\n    archive.directory(sourceDir, path.basename(sourceDir));\n    archive.finalize();\n  });\n}\n\n(async () => {\n  try {\n    if (fs.existsSync(ZIP_PATH)) {\n      fs.unlinkSync(ZIP_PATH);\n    }\n    await createZip(OUT_DIR, ZIP_PATH);\n    console.log('\\nDone. Files created:');\n    console.log(' -', OUT_DIR);\n    console.log(' -', ZIP_PATH);\n    console.log('\\nNext: upload the zip to Google Drive or unzip locally.');\n  } catch (err) {\n    console.error('Error while zipping:', err);\n    process.exit(1);\n  }\n})();\n\n        ");
                    });
                })];
        });
    });
}
