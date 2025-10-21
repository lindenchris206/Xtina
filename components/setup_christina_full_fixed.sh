cat > setup_christina_full_fixed.sh <<'SH' && bash setup_christina_full_fixed.sh
#!/usr/bin/env bash
set -e
WORKDIR="$(pwd)"
OUT_DIR="$WORKDIR/christina-mini"
echo "WORKDIR=$WORKDIR"
echo "OUT_DIR=$OUT_DIR"
# Cleanup previous partial output if present
rm -rf "$OUT_DIR"
mkdir -p "$OUT_DIR"

# helper to ensure dirs exist
ensure_dirs() {
  mkdir -p "$OUT_DIR/server/api"
  mkdir -p "$OUT_DIR/server/integrations/adapters"
  mkdir -p "$OUT_DIR/server/auth"
  mkdir -p "$OUT_DIR/server/storage"
  mkdir -p "$OUT_DIR/server/utils"
  mkdir -p "$OUT_DIR/server/data"
  mkdir -p "$OUT_DIR/server/logs"
  mkdir -p "$OUT_DIR/frontend/integrations"
  mkdir -p "$OUT_DIR/scripts"
  mkdir -p "$OUT_DIR/uploads"
}
ensure_dirs

# package.json
cat > "$OUT_DIR/package.json" <<'JSON'
{
  "name": "christina-mini",
  "version": "0.2.0",
  "private": true,
  "scripts": {
    "start:server": "node server/index.js",
    "start": "node server/index.js",
    "test": "node --version"
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
    "basic-ftp": "^4.6.1"
  },
  "engines": {
    "node": ">=14"
  }
}
JSON

# README and .env.example
cat > "$OUT_DIR/README.md" <<'MD'
Christina Mini — Integrations-enabled scaffold

Start server:
  cd christina-mini
  npm install
  npm run start:server

Open: http://localhost:3000/integrations

Default uploads folder: ./uploads

Credentials stored in server/data/credentials.enc.json (encrypted).
Set MASTER_KEY in .env for production.

See scripts/* for example flows.
MD

cat > "$OUT_DIR/.env.example" <<'ENV'
PORT=3000
UPLOAD_DIR=uploads
UPLOAD_MAX_BYTES=104857600
JWT_SECRET=change-me
MASTER_KEY=change-me-master-key
ENV

# server entry
cat > "$OUT_DIR/server/index.js" <<'NODE'
/**
 * Christina Mini server (Integrations + Uploads)
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

# api router
cat > "$OUT_DIR/server/api/index.js" <<'API'
const express = require('express');
const authRouter = require('./auth');
const uploadRouter = require('./upload');
const downloadRouter = require('./download');
const filesRouter = require('./files');
const integrationsRouter = require('./integrationsProxy');

const router = express.Router();
router.use('/auth', authRouter);
router.use('/upload', uploadRouter);
router.use('/download', downloadRouter);
router.use('/files', filesRouter);
router.use('/integrations', integrationsRouter);

module.exports = router;
API

# auth endpoints
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

# upload, download, files
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

# local storage
cat > "$OUT_DIR/server/storage/localStorage.js" <<'STO'
const fs = require('fs');
const path = require('path');
const BASE = path.resolve(process.cwd(), process.env.UPLOAD_DIR || 'uploads');

function safeJoin(relPath) {
  const p = path.normalize(path.join(BASE, relPath || ''));
  if (!p.startsWith(BASE)) throw new Error('invalid path');
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

# zip utils
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

# auth modules
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

cat > "$OUT_DIR/server/auth/jwt.js" <<'JWT'
const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET || 'change-me';
function issue(payload){ return jwt.sign(payload, SECRET, { expiresIn: '12h' }); }
function verify(token){ try{ return jwt.verify(token, SECRET);}catch(e){return null;} }
function middleware(req,res,next){ const h=req.headers.authorization; if(!h||!h.startsWith('Bearer ')) return res.status(401).json({ error:'no token' }); const token=h.slice(7); const payload=verify(token); if(!payload) return res.status(401).json({ error:'invalid token' }); req.user=payload; next(); }
module.exports={ issue, verify, middleware };
JWT

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

# integrations core
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

# integrations proxy
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

# core adapters: local, s3, google, slack, facebook
cat > "$OUT_DIR/server/integrations/adapters/local.js" <<'LAD'
const fs = require('fs');
const path = require('path');
const storage = require('../../storage/localStorage');

class LocalAdapter {
  constructor(config){ this.config = config || {}; }
  async list(relPath){ const dir = storage.safeJoin(relPath); if(!fs.existsSync(dir)) return []; return fs.readdirSync(dir).map(n=>({ name:n })); }
  async upload(buffer, remotePath){ storage.saveFile(remotePath, buffer); }
  async downloadStream(remotePath){ const full=storage.safeJoin(remotePath); return fs.createReadStream(full); }
  async delete(remotePath){ storage.remove(remotePath); }
}
module.exports = LocalAdapter;
LAD

cat > "$OUT_DIR/server/integrations/adapters/s3.js" <<'S3A'
const AWS = require('aws-sdk');
class S3Adapter {
  constructor(config){
    this.bucket = config.bucket;
    this.s3 = new AWS.S3({ accessKeyId: config.accessKeyId, secretAccessKey: config.secretAccessKey, region: config.region });
  }
  async upload(buffer, remotePath){
    await this.s3.putObject({ Bucket: this.bucket, Key: remotePath, Body: buffer }).promise();
  }
  async downloadStream(remotePath){
    const stream = this.s3.getObject({ Bucket: this.bucket, Key: remotePath }).createReadStream();
    return stream;
  }
  async list(prefix=''){
    const res = await this.s3.listObjectsV2({ Bucket: this.bucket, Prefix: prefix }).promise();
    return (res.Contents||[]).map(o=>({ key:o.Key, size:o.Size }));
  }
  async delete(remotePath){
    await this.s3.deleteObject({ Bucket: this.bucket, Key: remotePath }).promise();
  }
}
module.exports = S3Adapter;
S3A

cat > "$OUT_DIR/server/integrations/adapters/google.js" <<'GAD'
/*
Google Drive/Gmail adapter scaffold.
To use: supply config { clientId, clientSecret, redirectUri, refreshToken } or follow OAuth flow.
This scaffold uses googleapis if you add it; for now it provides stubs and instructions.
*/
class GoogleAdapter {
  constructor(config){ this.config = config || {}; }
  async list(path){ return [{ name: 'placeholder-google-file.txt' }]; }
  async upload(buffer, remotePath){ /* implement using googleapis drive.files.create */ }
  async downloadStream(remotePath){ throw new Error('not implemented'); }
  async delete(remotePath){ /* implement */ }
}
module.exports = GoogleAdapter;
GAD

cat > "$OUT_DIR/server/integrations/adapters/slack.js" <<'SLA'
/*
Slack adapter scaffold. Use OAuth token or bot token in config: { token }
Provides upload(list/download) via Slack files API.
*/
const fetch = require('node-fetch');
class SlackAdapter {
  constructor(config){ this.config = config||{}; }
  async upload(buffer, remotePath){
    // You can implement files.upload with form-data and token
    throw new Error('not implemented - provide token and implement');
  }
  async list(path){ return []; }
  async downloadStream(remotePath){ throw new Error('not implemented'); }
}
module.exports = SlackAdapter;
SLA

cat > "$OUT_DIR/server/integrations/adapters/facebook.js" <<'FAD'
/*
Facebook Graph API adapter scaffold.
Requires app id/secret and user access token in config.
This adapter can fetch media and posts where permitted.
*/
class FacebookAdapter {
  constructor(config){ this.config = config||{}; }
  async list(path){ return []; }
  async upload(buffer, remotePath){ throw new Error('not implemented'); }
  async downloadStream(remotePath){ throw new Error('not implemented'); }
}
module.exports = FacebookAdapter;
FAD

# create many stub adapters
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

# HOWTO_CONNECT_PROVIDERS
cat > "$OUT_DIR/server/integrations/HOWTO_CONNECT_PROVIDERS.md" <<'HOW'
Christina Integrations — How to connect providers

- For OAuth providers (Google, Dropbox, Slack, Facebook, OneDrive):
  1) Register an app in the provider dev console.
  2) Set redirect URI to: http://localhost:3000/api/integrations/oauth/callback
  3) Get clientId and clientSecret and paste them into the Connect form in the Integrations UI.

- For S3-like providers:
  1) Provide accessKeyId, secretAccessKey, region, and bucket in the Connect form.

- Local adapter:
  - No credentials required: it maps to server uploads area.
HOW

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
       + '<h2>Connections</h2>' + (conns.length? conns.map(c=>'<div>'+c.id+' : '+c.provider+' : '+c.name+'</div>').join('') : '<div>(none)</div>');
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
    load();
  </script>
</body>
</html>
HTML

# example script
cat > "$OUT_DIR/scripts/ai_copy_web_to_integration.sh" <<'SH2'
#!/usr/bin/env bash
# Usage: AI instructs this server to fetch a public URL and upload it to an integration
INTEGRATION_ID="$1"
URL="$2"
TOKEN="$3"
if [ -z "$INTEGRATION_ID" ] || [ -z "$URL" ] || [ -z "$TOKEN" ]; then
  echo "Usage: $0 <integrationId> <url> <bearerToken>"
  exit 1
fi
curl -s -X POST -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d "{\"source\":{\"type\":\"url\",\"url\":\"$URL\"},\"destPath\":\"$(basename "$URL")\"}" "http://localhost:3000/api/integrations/${INTEGRATION_ID}/upload"
SH2
chmod +x "$OUT_DIR/scripts/ai_copy_web_to_integration.sh"

# initial data files
echo '{}' > "$OUT_DIR/server/data/users.json"
echo '[]' > "$OUT_DIR/server/data/integrations.json"
echo '{}' > "$OUT_DIR/server/data/credentials.enc.json"
echo '{}' > "$OUT_DIR/server/data/service_tokens.json"

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
SH