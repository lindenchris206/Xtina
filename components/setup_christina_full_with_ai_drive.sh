cat > setup_christina_full_with_ai_drive.sh <<'SH' && bash setup_christina_full_with_ai_drive.sh
#!/usr/bin/env bash
set -e
# One-shot setup for Christina Mini (full): integrations, AI terminal (arbitrary exec), Google Drive OAuth adapter, etc.
# Run from your project folder, e.g. ~/Downloads/christina-run
WORKDIR="$(pwd)"
OUT_DIR="$WORKDIR/christina-mini"
echo "WORKDIR=$WORKDIR"
echo "OUT_DIR=$OUT_DIR"
# Backup existing zip
if [ -f "$OUT_DIR/christina-mini.zip" ]; then mv -f "$OUT_DIR/christina-mini.zip" "$OUT_DIR/christina-mini.zip.bak" || true; fi

# Remove and recreate OUT_DIR
rm -rf "$OUT_DIR"
mkdir -p "$OUT_DIR"

# Helper to create directories
ensure_dirs() {
  mkdir -p "$OUT_DIR/server/api"
  mkdir -p "$OUT_DIR/server/integrations/adapters"
  mkdir -p "$OUT_DIR/server/auth"
  mkdir -p "$OUT_DIR/server/storage"
  mkdir -p "$OUT_DIR/server/utils"
  mkdir -p "$OUT_DIR/server/data"
  mkdir -p "$OUT_DIR/frontend/integrations"
  mkdir -p "$OUT_DIR/scripts"
  mkdir -p "$OUT_DIR/uploads"
}
ensure_dirs

# package.json
cat > "$OUT_DIR/package.json" <<'JSON'
{
  "name": "christina-mini",
  "version": "0.3.0",
  "private": true,
  "scripts": {
    "start:server": "node server/index.js",
    "start": "node server/index.js"
  },
  "dependencies": {
    "archiver": "^5.3.1",
    "express": "^4.18.2",
    "multer": "^1.4.5-lts.1",
    "unzipper": "^0.10.11",
    "bcrypt": "^5.1.0",
    "jsonwebtoken": "^9.0.0",
    "mime-types": "^2.1.35",
    "aws-sdk": "^2.1378.0",
    "node-fetch": "^2.6.7",
    "form-data": "^4.0.0",
    "axios": "^1.4.0",
    "crypto-js": "^4.1.1",
    "basic-ftp": "^4.6.1",
    "googleapis": "^131.0.0",
    "open": "^8.4.0",
    "dotenv": "^16.3.1"
  },
  "engines": {
    "node": ">=14"
  }
}
JSON

# README and .env.example
cat > "$OUT_DIR/README.md" <<'MD'
Christina Mini — Integrations-enabled scaffold with AI terminal and Google Drive

Start server:
  cd christina-mini
  npm install
  npm run start:server

Open: http://localhost:3000/integrations
AI terminal: POST /api/ai/exec (uses service token in server/data/service_tokens.json)
Google Drive OAuth: /api/integrations/google/oauth/start -> open in browser, then callback

Security:
- This setup allows arbitrary command execution and access to your home directory by design.
- KEEP MASTER_KEY and AI service tokens secret.
MD

cat > "$OUT_DIR/.env.example" <<'ENV'
PORT=3000
UPLOAD_DIR=uploads
UPLOAD_MAX_BYTES=104857600
JWT_SECRET=change-me
MASTER_KEY=change-me-master-key
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_OAUTH_REDIRECT=http://localhost:3000/api/integrations/google/oauth/callback
ENV

# server/index.js
cat > "$OUT_DIR/server/index.js" <<'NODE'
/**
 * Christina Mini server (Integrations + Uploads + AI terminal + Google Drive)
 */
const express = require('express');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const apiRouter = require('./api');
const integrationsRouter = require('./integrations');
const PORT = process.env.PORT || 3000;

const app = express();
app.use(express.json({ limit: process.env.UPLOAD_MAX_BYTES || '100mb' }));

// API and Integrations
app.use('/api', apiRouter);
app.use('/api/integrations', integrationsRouter);

// serve frontend
app.use('/', express.static(path.join(__dirname, '..', 'frontend')));

// ensure uploads dir exists
const UPLOAD_DIR = path.resolve(process.cwd(), process.env.UPLOAD_DIR || 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

app.listen(PORT, () => {
  console.log('Christina Mini server listening on http://localhost:' + PORT);
  console.log('Uploads:', UPLOAD_DIR);
});
NODE

# server/api/index.js (register routes including ai and integrations proxy)
cat > "$OUT_DIR/server/api/index.js" <<'API'
const express = require('express');
const authRouter = require('./auth');
const uploadRouter = require('./upload');
const downloadRouter = require('./download');
const filesRouter = require('./files');
const integrationsProxy = require('./integrationsProxy');
const aiRouter = require('./ai');

const router = express.Router();
router.use('/auth', authRouter);
router.use('/upload', uploadRouter);
router.use('/download', downloadRouter);
router.use('/files', filesRouter);
router.use('/integrations', integrationsProxy);
router.use('/ai', aiRouter);

module.exports = router;
API

# server/api/auth.js (same as before)
cat > "$OUT_DIR/server/api/auth.js" <<'AUTH'
const express = require('express');
const pm = require('../auth/passwordManager');
const jwt = require('../auth/jwt');
const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'email & password required' });
    const existing = pm.getUser(email);
    if (existing) return res.status(409).json({ error: 'user exists' });
    const user = await pm.createUser(email, password);
    res.json({ ok: true, user: { email: user.email } });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'internal' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const ok = await pm.verifyPassword(email, password);
    if (!ok) return res.status(401).json({ error: 'invalid' });
    const token = jwt.issue({ email });
    res.json({ token });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'internal' });
  }
});

module.exports = router;
AUTH

# server/api/upload.js
cat > "$OUT_DIR/server/api/upload.js" <<'UP'
const express = require('express');
const multer = require('multer');
const auth = require('../auth/jwt');
const storage = require('../storage/localStorage');
const zipUtils = require('../utils/zipUtils');
const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/', auth.middleware, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'no file' });
    const extract = req.query.extract === 'true';
    const pathParam = req.body.path || req.query.path || '';
    const name = req.file.originalname || 'upload.bin';
    const target = pathParam ? (pathParam + '/' + name) : name;
    const isZip = name.toLowerCase().endsWith('.zip') || req.file.mimetype === 'application/zip';
    if (extract && isZip) {
      await zipUtils.extractZipBufferTo(pathParam || '', req.file.buffer);
      return res.json({ ok: true, extracted: pathParam || '' });
    } else {
      storage.saveFile(target, req.file.buffer);
      return res.json({ ok: true, path: target });
    }
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'internal' });
  }
});

router.put('/raw', auth.middleware, express.raw({ type: '*/*', limit: process.env.UPLOAD_MAX_BYTES || '100mb' }), async (req, res) => {
  try {
    const p = req.query.path;
    if (!p) return res.status(400).json({ error: 'path required' });
    storage.saveFile(p, req.body);
    res.json({ ok: true, path: p });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'internal' });
  }
});

module.exports = router;
UP

# server/api/download.js
cat > "$OUT_DIR/server/api/download.js" <<'DOWN'
const express = require('express');
const auth = require('../auth/jwt');
const storage = require('../storage/localStorage');
const zipUtils = require('../utils/zipUtils');
const path = require('path');
const fs = require('fs');
const router = express.Router();

router.get('/file', auth.middleware, (req, res) => {
  try {
    const p = req.query.path;
    if (!p) return res.status(400).json({ error: 'path required' });
    const full = storage.safeJoin(p);
    if (!fs.existsSync(full)) return res.status(404).json({ error: 'not found' });
    res.download(full);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'internal' });
  }
});

router.get('/folder', auth.middleware, (req, res) => {
  try {
    const p = req.query.path || '';
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="' + (p ? path.basename(p) : 'folder') + '.zip"');
    zipUtils.zipDirectoryToStream(p, res);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'internal' });
  }
});

module.exports = router;
DOWN

# server/api/files.js
cat > "$OUT_DIR/server/api/files.js" <<'FILES'
const express = require('express');
const auth = require('../auth/jwt');
const storage = require('../storage/localStorage');
const router = express.Router();

router.get('/', auth.middleware, (req, res) => {
  const p = req.query.path || '';
  try {
    const items = storage.list(p);
    res.json({ path: p, items });
  } catch (e) { console.error(e); res.status(500).json({ error: 'internal' }); }
});

router.delete('/', auth.middleware, (req, res) => {
  const p = req.query.path;
  if (!p) return res.status(400).json({ error: 'path required' });
  try {
    const ok = storage.remove(p);
    res.json({ ok, path: p });
  } catch (e) { console.error(e); res.status(500).json({ error: 'internal' }); }
});

module.exports = router;
FILES

# server/storage/localStorage.js (updated to allow home directory access if path starts with ~)
cat > "$OUT_DIR/server/storage/localStorage.js" <<'STO'
const fs = require('fs');
const path = require('path');
const os = require('os');
const BASE = path.resolve(process.cwd(), process.env.UPLOAD_DIR || 'uploads');

function resolvePath(relPath){
  if(!relPath) return BASE;
  if(relPath.startsWith('~')) return path.join(os.homedir(), relPath.slice(1));
  return path.normalize(path.join(BASE, relPath));
}

function safeJoin(relPath) {
  const p = resolvePath(relPath);
  // allow home directory access explicitly; otherwise confine to BASE
  const homedir = path.resolve(require('os').homedir());
  if(!(p.startsWith(BASE) || p.startsWith(homedir))) throw new Error('invalid path');
  return p;
}

function ensureDir(relPath) {
  const dir = safeJoin(relPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function saveFile(relPath, buffer) {
  const full = safeJoin(relPath);
  const dir = path.dirname(full);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(full, buffer);
  return full;
}

function list(relPath) {
  const dir = safeJoin(relPath);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).map(name => {
    const full = path.join(dir, name);
    const stat = fs.statSync(full);
    return { name, isDirectory: stat.isDirectory(), size: stat.size, path: path.join(relPath || '', name) };
  });
}

function remove(relPath) {
  const full = safeJoin(relPath);
  if (!fs.existsSync(full)) return false;
  const stat = fs.statSync(full);
  if (stat.isDirectory()) {
    fs.readdirSync(full).forEach(e => remove(path.join(relPath, e)));
    fs.rmdirSync(full);
  } else fs.unlinkSync(full);
  return true;
}

module.exports = { safeJoin, ensureDir, saveFile, list, remove, BASE };
STO

# server/utils/zipUtils.js
cat > "$OUT_DIR/server/utils/zipUtils.js" <<'ZIP'
const archiver = require('archiver');
const unzipper = require('unzipper');
const fs = require('fs');
const path = require('path');
const storage = require('../storage/localStorage');

function zipDirectoryToStream(relDir, res) {
  const fullDir = storage.safeJoin(relDir);
  const archive = archiver('zip', { zlib: { level: 9 } });
  archive.on('error', err => { throw err; });
  archive.directory(fullDir, false);
  archive.pipe(res);
  archive.finalize();
}

function extractZipBufferTo(relTarget, buffer) {
  const target = storage.ensureDir(relTarget);
  const stream = require('stream');
  return new Promise((resolve, reject) => {
    const rs = new stream.PassThrough();
    rs.end(buffer);
    rs.pipe(unzipper.Parse())
      .on('entry', entry => {
        const filePath = path.join(target, entry.path);
        if (entry.type === 'Directory') {
          if (!fs.existsSync(filePath)) fs.mkdirSync(filePath, { recursive: true });
          entry.autodrain();
        } else {
          const dir = path.dirname(filePath);
          if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
          entry.pipe(fs.createWriteStream(filePath));
        }
      })
      .on('close', () => resolve())
      .on('error', e => reject(e));
  });
}

module.exports = { zipDirectoryToStream, extractZipBufferTo };
ZIP

# server/auth/passwordManager.js
cat > "$OUT_DIR/server/auth/passwordManager.js" <<'PM'
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const DATA_FILE = path.join(__dirname, '..', 'data', 'users.json');

function _read(){ if(!fs.existsSync(DATA_FILE)) return {}; try{return JSON.parse(fs.readFileSync(DATA_FILE,'utf8')||'{}')}catch(e){return{}}}
function _write(obj){ fs.writeFileSync(DATA_FILE, JSON.stringify(obj,null,2), 'utf8'); }

async function createUser(email, password){ const users=_read(); if(users[email]) throw new Error('exists'); const hash=await bcrypt.hash(password,10); users[email]={ email, passwordHash: hash, createdAt: Date.now() }; _write(users); return users[email]; }
function getUser(email){ const users=_read(); return users[email]||null; }
async function verifyPassword(email,password){ const u=getUser(email); if(!u) return false; return bcrypt.compare(password,u.passwordHash); }

module.exports={ createUser, getUser, verifyPassword };
PM

# server/auth/jwt.js
cat > "$OUT_DIR/server/auth/jwt.js" <<'JWT'
const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET || 'change-me';
function issue(payload){ return jwt.sign(payload, SECRET, { expiresIn: '12h' }); }
function verify(token){ try{ return jwt.verify(token, SECRET);}catch(e){return null;} }
function middleware(req,res,next){ const h=req.headers.authorization; if(!h||!h.startsWith('Bearer ')) return res.status(401).json({ error:'no token' }); const token=h.slice(7); const payload=verify(token); if(!payload) return res.status(401).json({ error:'invalid token' }); req.user=payload; next(); }
module.exports={ issue, verify, middleware };
JWT

# server/auth/serviceTokens.js
cat > "$OUT_DIR/server/auth/serviceTokens.js" <<'STOK'
const fs = require('fs');
const path = require('path');
const DATA_FILE = path.join(__dirname, '..', 'data', 'service_tokens.json');

function _read(){ if(!fs.existsSync(DATA_FILE)) return {}; try{return JSON.parse(fs.readFileSync(DATA_FILE,'utf8')||'{}')}catch(e){return{}}}
function _write(obj){ fs.writeFileSync(DATA_FILE, JSON.stringify(obj,null,2), 'utf8'); }

function createToken(name, token) {
  const all = _read();
  all[name] = { token, createdAt: Date.now() };
  _write(all);
  return all[name];
}
function listTokens(){ return _read(); }
function findByToken(t){ const all=_read(); for(const k of Object.keys(all)){ if(all[k].token===t) return { name:k, data:all[k] }; } return null; }

module.exports = { createToken, listTokens, findByToken };
STOK

# server/integrations/index.js
cat > "$OUT_DIR/server/integrations/index.js" <<'INT'
const express = require('express');
const registry = require('./registry');
const router = express.Router();

// list
router.get('/', (req, res) => {
  const list = registry.listIntegrations();
  res.json({ integrations: list });
});

// connect (create a configured connection)
router.post('/connect', express.json(), (req, res) => {
  try {
    const { provider, name, config } = req.body;
    const conn = registry.createConnection(provider, name, config);
    res.json({ ok: true, connection: conn });
  } catch (e) {
    console.error(e); res.status(500).json({ error: 'internal' });
  }
});

// get one
router.get('/:id', (req, res) => {
  const id = req.params.id;
  const c = registry.get(id);
  if (!c) return res.status(404).json({ error: 'not found' });
  res.json(c);
});

// remove
router.delete('/:id', (req, res) => {
  try {
    registry.remove(req.params.id);
    res.json({ ok: true });
  } catch (e) { console.error(e); res.status(500).json({ error: 'internal' }); }
});

module.exports = router;
INT

# server/integrations/registry.js
cat > "$OUT_DIR/server/integrations/registry.js" <<'REG'
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const ADAPTERS_DIR = path.join(__dirname, 'adapters');
const DATA_FILE = path.join(__dirname, '..', 'data', 'integrations.json');
const CRED_FILE = path.join(__dirname, '..', 'data', 'credentials.enc.json');
const MASTER_KEY = process.env.MASTER_KEY || 'insecure_test_key_change_me';

// simple adapter discover
function listAdapters() {
  return fs.readdirSync(ADAPTERS_DIR).filter(f => f.endsWith('.js')).map(f => f.replace('.js',''));
}

function _read(){
  if(!fs.existsSync(DATA_FILE)) return [];
  try{return JSON.parse(fs.readFileSync(DATA_FILE,'utf8')||'[]')}catch(e){return[]}
}
function _write(obj){ fs.writeFileSync(DATA_FILE, JSON.stringify(obj,null,2),'utf8'); }

function _readCreds(){
  if(!fs.existsSync(CRED_FILE)) return {};
  try{
    const enc = fs.readFileSync(CRED_FILE,'utf8');
    const buf = Buffer.from(enc, 'base64');
    const decipher = crypto.createDecipher('aes256', MASTER_KEY);
    const dec = Buffer.concat([decipher.update(buf), decipher.final()]);
    return JSON.parse(dec.toString('utf8')||'{}');
  }catch(e){ return {}; }
}
function _writeCreds(obj){
  const cipher = crypto.createCipher('aes256', MASTER_KEY);
  const enc = Buffer.concat([cipher.update(JSON.stringify(obj)), cipher.final()]);
  fs.writeFileSync(CRED_FILE, enc.toString('base64'), 'utf8');
}

function listIntegrations(){
  const adapters = listAdapters();
  const conns = _read();
  return { adapters, connections: conns };
}

function createConnection(provider, name, config){
  const conns = _read();
  const id = Math.random().toString(36).slice(2,10);
  conns.push({ id, provider, name, createdAt: Date.now() });
  _write(conns);
  // store credentials encrypted
  const creds = _readCreds();
  creds[id] = config || {};
  _writeCreds(creds);
  return { id, provider, name };
}

function get(id){
  const conns = _read();
  const found = conns.find(c => c.id === id);
  if(!found) return null;
  const creds = _readCreds();
  return Object.assign({}, found, { config: creds[id] || null });
}

function remove(id){
  let conns = _read();
  conns = conns.filter(c => c.id !== id);
  _write(conns);
  const creds = _readCreds();
  delete creds[id];
  _writeCreds(creds);
}

module.exports = { listAdapters, listIntegrations, createConnection, get, remove };
REG

# server/api/integrationsProxy.js (unchanged except will use google adapter if provider === 'google')
cat > "$OUT_DIR/server/api/integrationsProxy.js" <<'IP'
const express = require('express');
const registry = require('../integrations/registry');
const storage = require('../storage/localStorage');
const zipUtils = require('../utils/zipUtils');
const auth = require('../auth/jwt');
const router = express.Router();

// list available adapters & connections
router.get('/list', (req, res) => {
  const data = registry.listIntegrations();
  res.json(data);
});

// upload to integration: POST /api/integrations/:id/upload
router.post('/:id/upload', auth.middleware, express.json(), async (req, res) => {
  try {
    const id = req.params.id;
    const conn = registry.get(id);
    if (!conn) return res.status(404).json({ error: 'no conn' });
    const provider = conn.provider;
    const Adapter = require('./adapters/' + provider);
    const adapter = new Adapter(conn.config || {});
    // Accept body: { source: { type: 'server'|'url' }, sourcePath, destPath }
    const s = req.body && req.body.source;
    if (!s) return res.status(400).json({ error: 'source required' });
    if (s.type === 'server') {
      const src = s.path;
      const full = storage.safeJoin(src);
      if (!require('fs').existsSync(full)) return res.status(404).json({ error: 'source not found' });
      const buffer = require('fs').readFileSync(full);
      const dest = req.body.destPath || src;
      await adapter.upload(buffer, dest);
      return res.json({ ok: true, uploaded: dest });
    } else if (s.type === 'url') {
      const url = s.url;
      const fetch = require('node-fetch');
      const resp = await fetch(url);
      const buf = await resp.buffer();
      const dest = req.body.destPath || (req.body.destName || 'remote.file');
      await adapter.upload(buf, dest);
      return res.json({ ok: true, uploaded: dest });
    } else {
      return res.status(400).json({ error: 'unsupported source type' });
    }
  } catch (e) { console.error(e); res.status(500).json({ error: 'internal' }); }
});

// fetch from integration to uploads
router.post('/:id/fetch', auth.middleware, express.json(), async (req, res) => {
  try {
    const id = req.params.id;
    const conn = registry.get(id);
    if (!conn) return res.status(404).json({ error: 'no conn' });
    const Adapter = require('./adapters/' + conn.provider);
    const adapter = new Adapter(conn.config || {});
    const remotePath = req.body.path;
    if (!remotePath) return res.status(400).json({ error: 'path required' });
    const stream = await adapter.downloadStream(remotePath);
    const destRel = 'integrations/' + id + '/' + (require('path').basename(remotePath));
    storage.ensureDir('integrations/' + id);
    const full = storage.safeJoin(destRel);
    const ws = require('fs').createWriteStream(full);
    stream.pipe(ws);
    ws.on('close', () => res.json({ ok: true, path: destRel }));
    ws.on('error', (e) => { console.error(e); res.status(500).json({ error: 'write error' }); });
  } catch (e) { console.error(e); res.status(500).json({ error: 'internal' }); }
});

// list remote dir (adapter.list)
router.get('/:id/list', auth.middleware, async (req, res) => {
  try {
    const id = req.params.id;
    const conn = registry.get(id);
    if (!conn) return res.status(404).json({ error: 'no conn' });
    const Adapter = require('./adapters/' + conn.provider);
    const adapter = new Adapter(conn.config || {});
    const p = req.query.path || '';
    const list = await adapter.list(p);
    res.json({ ok: true, items: list });
  } catch (e) { console.error(e); res.status(500).json({ error: 'internal' }); }
});

module.exports = router;
IP

# server/api/ai.js (AI terminal) - allows arbitrary commands via shell and home dir access
cat > "$OUT_DIR/server/api/ai.js" <<'AIAPI'
const express = require('express');
const fs = require('fs');
const path = require('path');
const open = require('open');
const serviceTokens = require('../auth/serviceTokens');
const storage = require('../storage/localStorage');
const router = express.Router();
const { spawn } = require('child_process');

function requireToken(req, res, next){
  const h = req.headers.authorization;
  if(!h || !h.startsWith('Bearer ')) return res.status(401).json({ error: 'no token' });
  const tok = h.slice(7);
  const found = serviceTokens.findByToken(tok);
  if(!found) return res.status(401).json({ error: 'invalid token' });
  req.ai = { name: found.name, token: tok };
  next();
}

function resolveSafe(relPath){
  const os = require('os');
  const base = process.cwd();
  if(!relPath) return base;
  if(relPath.startsWith('~')) return path.join(os.homedir(), relPath.slice(1));
  const candidate = path.normalize(path.join(base, relPath));
  // allow home access or project access
  const homedir = path.resolve(os.homedir());
  if(!(candidate.startsWith(base) || candidate.startsWith(homedir))) throw new Error('path outside allowed areas');
  return candidate;
}

function audit(action){
  try{
    const logFile = path.join(process.cwd(), 'server', 'data', 'ai_actions.log');
    const entry = { ts: new Date().toISOString(), action };
    fs.appendFileSync(logFile, JSON.stringify(entry) + '\n', 'utf8');
  }catch(e){ console.error('audit error', e); }
}

router.post('/exec', requireToken, express.json(), async (req, res) => {
  try{
    const body = req.body || {};
    const op = body.op;
    if(!op) return res.status(400).json({ error: 'op required' });

    const MAX_WRITE_BYTES = 10 * 1024 * 1024; // 10 MB

    if(op === 'write' || op === 'append') {
      const rel = body.path;
      if(!rel) return res.status(400).json({ error: 'path required' });
      const full = resolveSafe(rel);
      const content = body.content || '';
      if(Buffer.byteLength(content,'utf8') > MAX_WRITE_BYTES) return res.status(400).json({ error: 'content too large' });
      const dir = path.dirname(full);
      fs.mkdirSync(dir, { recursive: true });
      if(op === 'write') fs.writeFileSync(full, content, 'utf8');
      else fs.appendFileSync(full, content, 'utf8');
      audit({ actor: req.ai.name, op, path: rel, len: Buffer.byteLength(content,'utf8') });
      return res.json({ ok: true, path: rel });
    }

    if(op === 'mkdir') {
      const rel = body.path;
      if(!rel) return res.status(400).json({ error: 'path required' });
      const full = resolveSafe(rel);
      fs.mkdirSync(full, { recursive: true });
      audit({ actor: req.ai.name, op, path: rel });
      return res.json({ ok: true, path: rel });
    }

    if(op === 'rm') {
      const rel = body.path;
      if(!rel) return res.status(400).json({ error: 'path required' });
      const full = resolveSafe(rel);
      if(full === process.cwd()) return res.status(400).json({ error: 'cannot remove project root' });
      const stat = fs.existsSync(full) ? fs.statSync(full) : null;
      if(!stat) return res.status(404).json({ error: 'not found' });
      if(stat.isDirectory()){
        fs.rmdirSync(full, { recursive: true });
      } else {
        fs.unlinkSync(full);
      }
      audit({ actor: req.ai.name, op, path: rel });
      return res.json({ ok: true, path: rel });
    }

    if(op === 'read') {
      const rel = body.path;
      if(!rel) return res.status(400).json({ error: 'path required' });
      const full = resolveSafe(rel);
      if(!fs.existsSync(full)) return res.status(404).json({ error: 'not found' });
      const stat = fs.statSync(full);
      if(stat.isDirectory()) return res.status(400).json({ error: 'path is directory' });
      const content = fs.readFileSync(full, 'utf8');
      audit({ actor: req.ai.name, op, path: rel, len: Buffer.byteLength(content,'utf8') });
      return res.json({ ok: true, content });
    }

    if(op === 'list') {
      const rel = body.path || '.';
      const full = resolveSafe(rel);
      if(!fs.existsSync(full)) return res.status(404).json({ error: 'not found' });
      const items = fs.readdirSync(full).map(name => {
        const s = fs.statSync(path.join(full, name));
        return { name, isDirectory: s.isDirectory(), size: s.size };
      });
      audit({ actor: req.ai.name, op, path: rel, count: items.length });
      return res.json({ ok: true, items });
    }

    if(op === 'exec') {
      const cmd = body.cmd;
      const args = body.args || [];
      if(!cmd) return res.status(400).json({ error: 'cmd required' });
      const cwd = body.cwd ? resolveSafe(body.cwd) : process.cwd();
      const timeoutMs = Math.min(5*60*1000, parseInt(body.timeoutMs||30000,10) || 30000);
      // run via shell to allow pipelines and shell features
      const child = spawn(cmd + ' ' + (args.map(a=>a.includes(' ')?'"'+a.replace(/"/g,'\\"')+'"':a).join(' ')), { cwd, env: process.env, shell: true });
      let stdout = '';
      let stderr = '';
      let killed = false;
      const timer = setTimeout(() => { killed = true; child.kill('SIGKILL'); }, timeoutMs);
      child.stdout.on('data', d => { stdout += d.toString('utf8'); if(stdout.length > 5*1024*1024){ killed=true; child.kill('SIGKILL'); } });
      child.stderr.on('data', d => { stderr += d.toString('utf8'); if(stderr.length > 5*1024*1024){ killed=true; child.kill('SIGKILL'); } });
      child.on('error', err => { clearTimeout(timer); console.error(err); audit({ actor: req.ai.name, op:'exec', cmd, args, cwd, error: err.message }); res.status(500).json({ error: err.message }); });
      child.on('close', code => { clearTimeout(timer); audit({ actor: req.ai.name, op:'exec', cmd, args, cwd, code, stdoutLen: stdout.length, stderrLen: stderr.length }); res.json({ ok:true, result:{ code, stdout, stderr, killed } }); });
      return;
    }

    return res.status(400).json({ error: 'unknown op' });
  }catch(e){
    console.error('ai exec error', e);
    return res.status(500).json({ error: e.message || 'internal' });
  }
});

module.exports = router;
AIAPI

# server/integrations/adapters/google.js (Google Drive adapter with OAuth helpers + Drive operations)
cat > "$OUT_DIR/server/integrations/adapters/google.js" <<'GDR'
/**
 * Google Drive adapter + OAuth helpers
 * Expects clientId/clientSecret/redirectUri in config OR environment variables:
 *   GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_OAUTH_REDIRECT
 * Tokens are stored encrypted by the registry (credentials.enc.json) at connection creation/after OAuth.
 *
 * Provides:
 *  - list(path)
 *  - upload(buffer, remotePath) -> supports simple and resumable based on size
 *  - downloadStream(remotePath)
 *  - delete(remotePath)
 *  - createFolder(name, parentId)
 *  - shareLink(fileId) -> creates anyone-with-link viewer link
 *  - search(q)
 */
const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

class GoogleAdapter {
  constructor(config){
    this.config = config || {};
    this.clientId = this.config.clientId || process.env.GOOGLE_CLIENT_ID;
    this.clientSecret = this.config.clientSecret || process.env.GOOGLE_CLIENT_SECRET;
    this.redirectUri = this.config.redirectUri || process.env.GOOGLE_OAUTH_REDIRECT;
    this.tokens = this.config.tokens || null; // should include access_token, refresh_token, expiry_date
    this.oAuth2Client = new google.auth.OAuth2(this.clientId, this.clientSecret, this.redirectUri);
    if(this.tokens) this.oAuth2Client.setCredentials(this.tokens);
    this.drive = google.drive({ version: 'v3', auth: this.oAuth2Client });
  }

  async ensureAuth(){
    if(!this.clientId || !this.clientSecret || !this.redirectUri) throw new Error('missing google client config');
    if(!this.tokens) throw new Error('no tokens; connect via OAuth first');
    // refresh if needed
    try{
      const newTok = await this.oAuth2Client.getAccessToken();
      if(newTok && newTok.token) {
        // node google client handles refresh automatically when making calls
      }
    }catch(e){ /* ignore */ }
  }

  // list files under a folder path (either by folder id or by name search)
  async list(qOrFolderId){
    await this.ensureAuth();
    const q = qOrFolderId && qOrFolderId.startsWith('query:') ? qOrFolderId.slice(6) : `'${qOrFolderId||'root'}' in parents and trashed = false`;
    const res = await this.drive.files.list({ q, fields: 'files(id,name,mimeType,parents,size,webViewLink)', pageSize: 100 });
    return res.data.files || [];
  }

  // simple upload for small files; for big files (>= 8MB) use resumable
  async upload(buffer, remotePath){
    await this.ensureAuth();
    // remotePath may be "folder1/folder2/name" or "name"
    const parts = (remotePath || 'upload.bin').split('/').filter(Boolean);
    const name = parts.pop();
    let parentId = 'root';
    // create folders as needed
    for(const p of parts){
      const existing = await this._findFolderByName(p, parentId);
      if(existing) parentId = existing.id;
      else {
        const created = await this.createFolder(p, parentId);
        parentId = created.id;
      }
    }
    const mimeType = 'application/octet-stream';
    const MB = 1024*1024;
    if(buffer.length >= 8*MB) {
      // resumable upload
      const res = await this.drive.files.create({
        requestBody: { name, parents: [parentId] },
        media: { mimeType, body: require('stream').Readable.from(buffer) }
      }, { maxContentLength: Infinity, maxBodyLength: Infinity });
      return res.data;
    } else {
      const res = await this.drive.files.create({
        requestBody: { name, parents: [parentId], mimeType },
        media: { mimeType, body: buffer }
      });
      return res.data;
    }
  }

  async downloadStream(remotePathOrId){
    await this.ensureAuth();
    // if remotePathOrId looks like an id (no slash), attempt download by id; otherwise search by path
    let fileId = null;
    if(remotePathOrId && !remotePathOrId.includes('/')) fileId = remotePathOrId;
    if(!fileId){
      // locate file by path
      const parts = (remotePathOrId||'').split('/').filter(Boolean);
      let parentId = 'root';
      for(let i=0;i<parts.length;i++){
        const isLast = i===parts.length-1;
        if(isLast){
          // find file
          const q = `name='${parts[i]}' and '${parentId}' in parents and trashed=false`;
          const res = await this.drive.files.list({ q, fields: 'files(id,name,mimeType,size)', pageSize: 1 });
          if(res.data.files && res.data.files[0]) fileId = res.data.files[0].id;
          break;
        } else {
          const f = await this._findFolderByName(parts[i], parentId);
          if(!f) throw new Error('path not found: ' + parts[i]);
          parentId = f.id;
        }
      }
    }
    if(!fileId) throw new Error('file id not found');
    const stream = await this.drive.files.get({ fileId, alt: 'media' }, { responseType: 'stream' });
    return stream.data;
  }

  async delete(remotePathOrId){
    await this.ensureAuth();
    let fileId = remotePathOrId;
    if(remotePathOrId && remotePathOrId.includes('/')){
      // resolve by path
      const parts = remotePathOrId.split('/').filter(Boolean);
      let parentId = 'root';
      for(let i=0;i<parts.length;i++){
        const isLast = i===parts.length-1;
        if(isLast){
          const q = `name='${parts[i]}' and '${parentId}' in parents and trashed=false`;
          const res = await this.drive.files.list({ q, fields: 'files(id)', pageSize: 1 });
          if(res.data.files && res.data.files[0]) fileId = res.data.files[0].id;
          else throw new Error('not found');
        } else {
          const f = await this._findFolderByName(parts[i], parentId);
          if(!f) throw new Error('path not found');
          parentId = f.id;
        }
      }
    }
    await this.drive.files.delete({ fileId });
  }

  async createFolder(name, parentId='root'){
    await this.ensureAuth();
    const res = await this.drive.files.create({
      requestBody: { name, mimeType: 'application/vnd.google-apps.folder', parents: [parentId] },
      fields: 'id,name'
    });
    return res.data;
  }

  async shareLink(fileId){
    await this.ensureAuth();
    await this.drive.permissions.create({ fileId, requestBody: { role: 'reader', type: 'anyone' } });
    const r = await this.drive.files.get({ fileId, fields: 'webViewLink,webContentLink' });
    return r.data;
  }

  async search(q){
    await this.ensureAuth();
    const res = await this.drive.files.list({ q, fields: 'files(id,name,mimeType,parents,size,webViewLink)', pageSize: 100 });
    return res.data.files || [];
  }

  async _findFolderByName(name, parentId='root'){
    const q = `name='${name}' and mimeType='application/vnd.google-apps.folder' and '${parentId}' in parents and trashed=false`;
    const res = await this.drive.files.list({ q, fields: 'files(id,name)', pageSize: 1 });
    return (res.data.files && res.data.files[0]) ? res.data.files[0] : null;
  }
}

module.exports = GoogleAdapter;
GDR

# OAuth endpoints for Google (to start/complete OAuth) - integrate with registry to store tokens into a connection
cat > "$OUT_DIR/server/integrations/google_oauth_routes.js" <<'GRO'
/**
 * OAuth start & callback for Google Drive.
 * Visit /api/integrations/google/oauth/start?connId=... to begin.
 *
 * If connId omitted, tokens will be returned in the callback page for manual copy.
 */
const express = require('express');
const router = express.Router();
const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
const registry = require('./registry');
require('dotenv').config();

function getClient(config){
  const clientId = (config && config.clientId) || process.env.GOOGLE_CLIENT_ID;
  const clientSecret = (config && config.clientSecret) || process.env.GOOGLE_CLIENT_SECRET;
  const redirect = (config && config.redirectUri) || process.env.GOOGLE_OAUTH_REDIRECT;
  if(!clientId || !clientSecret || !redirect) throw new Error('missing google client config');
  return new google.auth.OAuth2(clientId, clientSecret, redirect);
}

router.get('/oauth/start', (req, res) => {
  try {
    const connId = req.query.connId;
    const cfg = {};
    if(connId){
      const conn = registry.get(connId);
      if(conn && conn.config) Object.assign(cfg, conn.config);
    }
    const oAuth2Client = getClient(cfg);
    const scopes = ['https://www.googleapis.com/auth/drive'];
    const url = oAuth2Client.generateAuthUrl({ access_type: 'offline', scope: scopes, prompt: 'consent' });
    // open the browser if on the server machine
    res.redirect(url);
  } catch (e) { console.error(e); res.status(500).send('error: ' + e.message); }
});

router.get('/oauth/callback', async (req, res) => {
  try {
    const code = req.query.code;
    const state = req.query.state;
    // If state includes connId, we can attach tokens to that connection
    // For simplicity, accept optional connId param
    const connId = req.query.connId;
    const cfg = {};
    if(connId){
      const conn = registry.get(connId);
      if(conn && conn.config) Object.assign(cfg, conn.config);
    }
    const oAuth2Client = getClient(cfg);
    const { tokens } = await oAuth2Client.getToken(code);
    // attach tokens to connection if connId provided
    if(connId){
      const creds = (() => {
        const CRED_FILE = path.join(__dirname, '..', 'data', 'credentials.enc.json');
        const MASTER_KEY = process.env.MASTER_KEY || 'insecure_test_key_change_me';
        const crypto = require('crypto');
        let obj = {};
        if(fs.existsSync(CRED_FILE)){
          try{
            const enc = fs.readFileSync(CRED_FILE,'utf8');
            const buf = Buffer.from(enc, 'base64');
            const decipher = crypto.createDecipher('aes256', MASTER_KEY);
            const dec = Buffer.concat([decipher.update(buf), decipher.final()]);
            obj = JSON.parse(dec.toString('utf8')||'{}');
          }catch(e){ obj = {}; }
        }
        obj[connId] = tokens;
        const cipher = crypto.createCipher('aes256', MASTER_KEY);
        const enc = Buffer.concat([cipher.update(JSON.stringify(obj)), cipher.final()]);
        fs.writeFileSync(CRED_FILE, enc.toString('base64'), 'utf8');
      })();
      res.send('<html><body>Success. Tokens saved for connection ' + connId + '. You can close this window.</body></html>');
    } else {
      // show tokens for manual copy
      res.send('<html><body>Success. Tokens:<pre>' + JSON.stringify(tokens, null, 2) + '</pre></body></html>');
    }
  } catch (e) { console.error(e); res.status(500).send('error: ' + e.message); }
});

module.exports = router;
GRO

# Mount google oauth routes in server/integrations/index.js by appending middleware registration
# We'll update server/integrations/index.js to mount the oauth routes
cat > "$OUT_DIR/server/integrations/index.js" <<'INT2'
const express = require('express');
const registry = require('./registry');
const googleOauth = require('./google_oauth_routes');
const router = express.Router();

// list
router.get('/', (req, res) => {
  const list = registry.listIntegrations();
  res.json({ integrations: list });
});

// connect (create a configured connection)
router.post('/connect', express.json(), (req, res) => {
  try {
    const { provider, name, config } = req.body;
    const conn = registry.createConnection(provider, name, config);
    res.json({ ok: true, connection: conn });
  } catch (e) {
    console.error(e); res.status(500).json({ error: 'internal' });
  }
});

// get one
router.get('/:id', (req, res) => {
  const id = req.params.id;
  const c = registry.get(id);
  if (!c) return res.status(404).json({ error: 'not found' });
  res.json(c);
});

// remove
router.delete('/:id', (req, res) => {
  try {
    registry.remove(req.params.id);
    res.json({ ok: true });
  } catch (e) { console.error(e); res.status(500).json({ error: 'internal' }); }
});

// mount google oauth helper
router.use('/google', googleOauth);

module.exports = router;
INT2

# scripts/ai_terminal_client.sh
cat > "$OUT_DIR/scripts/ai_terminal_client.sh" <<'SH2'
#!/usr/bin/env bash
# Example client for AI terminal helper API
TOKEN="$1"
OP="$2"
shift 2
HOST="${HOST:-http://localhost:3000}"
if [ -z "$TOKEN" ] || [ -z "$OP" ]; then
  echo "Usage: $0 <token> <op> [args...]"
  exit 2
fi

case "$OP" in
  write)
    PATH_ARG="$1"; shift
    CONTENT="$*"
    curl -s -X POST -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d "{\"op\":\"write\",\"path\":\"$PATH_ARG\",\"content\":$(jq -Rn --arg s "$CONTENT" '$s')}" "$HOST/api/ai/exec" | jq
    ;;
  append)
    PATH_ARG="$1"; shift
    CONTENT="$*"
    curl -s -X POST -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d "{\"op\":\"append\",\"path\":\"$PATH_ARG\",\"content\":$(jq -Rn --arg s "$CONTENT" '$s')}" "$HOST/api/ai/exec" | jq
    ;;
  read)
    PATH_ARG="$1"
    curl -s -X POST -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d "{\"op\":\"read\",\"path\":\"$PATH_ARG\"}" "$HOST/api/ai/exec" | jq
    ;;
  list)
    PATH_ARG="${1:-.}"
    curl -s -X POST -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d "{\"op\":\"list\",\"path\":\"$PATH_ARG\"}" "$HOST/api/ai/exec" | jq
    ;;
  mkdir)
    PATH_ARG="$1"
    curl -s -X POST -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d "{\"op\":\"mkdir\",\"path\":\"$PATH_ARG\"}" "$HOST/api/ai/exec" | jq
    ;;
  rm)
    PATH_ARG="$1"
    curl -s -X POST -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d "{\"op\":\"rm\",\"path\":\"$PATH_ARG\"}" "$HOST/api/ai/exec" | jq
    ;;
  exec)
    CMD="$1"; shift
    ARGS_JSON=$(jq -Rn --argjson a "$(printf '%s\n' "$@" | jq -R -s -c 'split("\n")[:-1]')" '$a') || ARGS_JSON='[]'
    curl -s -X POST -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d "{\"op\":\"exec\",\"cmd\":\"$CMD\",\"args\":$ARGS_JSON}" "$HOST/api/ai/exec" | jq
    ;;
  *)
    echo "unknown op: $OP"
    exit 2
    ;;
esac
SH2
chmod +x "$OUT_DIR/scripts/ai_terminal_client.sh"

# scripts/google_authorize.sh - opens browser to start OAuth for a given connId
cat > "$OUT_DIR/scripts/google_authorize.sh" <<'GSH'
#!/usr/bin/env bash
# Usage: ./scripts/google_authorize.sh <connId>
CONN="$1"
HOST="${HOST:-http://localhost:3000}"
if [ -z "$CONN" ]; then
  echo "Usage: $0 <connId>"
  exit 2
fi
URL="$HOST/api/integrations/google/oauth/start?connId=$CONN"
echo "Opening browser to: $URL"
# try to open the browser
if command -v open >/dev/null 2>&1; then
  open "$URL"
elif command -v xdg-open >/dev/null 2>&1; then
  xdg-open "$URL"
else
  echo "Please open this URL in your browser: $URL"
fi
GSH
chmod +x "$OUT_DIR/scripts/google_authorize.sh"

# create many stub adapters (keeps variety)
providers=(dropbox onedrive box icloud nextcloud ftp sftp scp webdav azure_blob gcs backblaze digitalocean ibm oracle github gitlab bitbucket twitter instagram pinterest imgur flickr telegram whatsapp mattermost rocketchat zoom salesforce servicenow confluence sharepoint notion google_photos soundcloud youtube imap_pop rss http generic rclone)
for p in "${providers[@]}"; do
  cat > "$OUT_DIR/server/integrations/adapters/${p}.js" <<'STUB'
/*
Adapter scaffold for provider: PLACEHOLDER
Replace with real implementation and SDK usage.
*/
class Adapter {
  constructor(config){ this.config = config||{}; }
  async list(path){ return []; }
  async upload(buffer, remotePath){ throw new Error('not implemented'); }
  async downloadStream(remotePath){ throw new Error('not implemented'); }
  async delete(remotePath){ /* optional */ }
}
module.exports = Adapter;
STUB
  sed -i "s/PLACEHOLDER/${p}/g" "$OUT_DIR/server/integrations/adapters/${p}.js"
done

# frontend page
cat > "$OUT_DIR/frontend/integrations/index.html" <<'HTML'
<!doctype html>
<html>
<head><meta charset="utf-8"><title>Integrations</title></head>
<body>
  <h1>Integrations (Christina Mini)</h1>
  <div id="list">Loading...</div>
  <script>
    async function load(){
      const r = await fetch('/api/integrations/list');
      const j = await r.json();
      const el = document.getElementById('list');
      const adapters = j.adapters;
      const conns = j.connections;
      el.innerHTML = '<h2>Adapters</h2>' + adapters.map(a => '<div>'+a+' <button onclick="connect(\\''+a+'\\')">Connect</button></div>').join('') 
       + '<h2>Connections</h2>' + (conns.length? conns.map(c=>'<div>'+c.id+' : '+c.provider+' : '+c.name+' <button onclick=\"authorize(\\''+c.id+'\\')\">Authorize</button></div>').join('') : '<div>(none)</div>');
    }
    async function connect(provider){
      const name = prompt('Name for this connection (e.g. my '+provider+'):');
      if(!name) return;
      const configStr = prompt('Enter config JSON (clientId, clientSecret, bucket, token etc) as JSON (or cancel to skip):');
      let cfg = {};
      try{ cfg = configStr? JSON.parse(configStr):{} }catch(e){ alert('invalid JSON'); return; }
      const r = await fetch('/api/integrations/connect',{ method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ provider, name, config: cfg })});
      const j = await r.json();
      alert(JSON.stringify(j));
      load();
    }
    function authorize(connId){
      window.open('/api/integrations/google/oauth/start?connId=' + connId, '_blank');
    }
    load();
  </script>
</body>
</html>
HTML

# initial data files
echo '{}' > "$OUT_DIR/server/data/users.json"
echo '[]' > "$OUT_DIR/server/data/integrations.json"
echo '{}' > "$OUT_DIR/server/data/credentials.enc.json"
echo '{}' > "$OUT_DIR/server/data/service_tokens.json"
touch "$OUT_DIR/server/data/ai_actions.log"

# install deps
echo "Installing npm packages in $OUT_DIR (this may take a while)..."
( cd "$OUT_DIR" && npm install --silent )

# create zip of the folder (optional)
echo "Creating zip..."
ZIP_OUT="$WORKDIR/christina-mini.zip"
( cd "$WORKDIR" && rm -f "$ZIP_OUT" && node -e "const fs=require('fs'), archiver=require('archiver'), path=require('path'); const src=path.resolve(process.cwd(),'christina-mini'); const out=path.resolve(process.cwd(),'christina-mini.zip'); const output=fs.createWriteStream(out); const archive=archiver('zip',{ zlib:{ level:9 }}); archive.pipe(output); archive.directory(src, 'christina-mini'); archive.finalize(); output.on('close',()=>console.log('Zip created:', out));" ) || true

# create and print AI service token
AI_TOKEN="$(node -e "const fs=require('fs'), path=require('path'); const file=path.join(process.cwd(),'christina-mini','server','data','service_tokens.json'); let obj={}; if(fs.existsSync(file)) obj=JSON.parse(fs.readFileSync(file,'utf8')||'{}'); const token='AI_TOKEN_'+Math.random().toString(36).slice(2); obj['AI_SERVICE']= { token, createdAt: Date.now() }; fs.writeFileSync(file,JSON.stringify(obj,null,2)); console.log(token);" ) || true

echo "Setup complete."
echo "Project folder: $OUT_DIR"
echo "Start the server:"
echo "  cd $OUT_DIR"
echo "  npm run start:server"
echo ""
echo "Open integrations UI: http://localhost:3000/integrations"
echo ""
echo "AI service token (save this): $AI_TOKEN"
echo ""
echo "To authorize Google Drive for a connection:"
echo "  1) Create a connection via the Integrations UI (provider: google) or POST /api/integrations/connect with provider=google and name=..."
echo "  2) Run: ./scripts/google_authorize.sh <connId>"
echo "  3) Follow browser flow; tokens will be saved encrypted to server/data/credentials.enc.json"
echo ""
echo "Security reminder: this installation allows arbitrary command execution and home directory access. Keep AI token and MASTER_KEY secret."
SH