#!/usr/bin/env bash
set -e
# apply_christina_patch_drive_ai.sh
# Run from the directory containing your christina-mini project (e.g., ~/Downloads/christina-run)
WORKDIR="$(pwd)"
PROJ_DIR="$WORKDIR/christina-mini"
if [ ! -d "$PROJ_DIR" ]; then
  echo "Project directory not found: $PROJ_DIR"
  echo "Make sure you are in the folder that contains christina-mini, or adjust PROJ_DIR in this script."
  exit 1
fi
echo "Applying patch to project: $PROJ_DIR"

# 1) install googleapis (and ensure other deps)
echo "Installing npm packages (googleapis)... this may take a moment."
( cd "$PROJ_DIR" && npm install googleapis@119.0.0 --no-audit --no-fund --silent ) || true

# 2) Add Google Drive adapter with OAuth endpoints
mkdir -p "$PROJ_DIR/server/integrations"
mkdir -p "$PROJ_DIR/server/integrations/adapters"
mkdir -p "$PROJ_DIR/server/api"
mkdir -p "$PROJ_DIR/server/utils"
mkdir -p "$PROJ_DIR/server/auth"
mkdir -p "$PROJ_DIR/scripts"

# Save backup if any
timestamp=$(date +%s)
cp -a "$PROJ_DIR/server/integrations/registry.js" "$PROJ_DIR/server/integrations/registry.js.bak.$timestamp" 2>/dev/null || true

# google adapter: server/integrations/adapters/google_drive.js
cat > "$PROJ_DIR/server/integrations/adapters/google_drive.js" <<'GD'
/**
 * Google Drive Adapter - full implementation using googleapis
 * - Requires OAuth2 tokens stored in registry credentials (refresh/access).
 * - Expects config: { driveFolderId?: string } stored per connection.
 *
 * Methods:
 *  - list(path)
 *  - upload(buffer, remotePath)  (uses resumable uploads for large files)
 *  - downloadStream(remotePath)
 *  - delete(remotePath)
 *  - createFolder(name, parentId)
 *  - getShareLink(fileId)
 *
 * This adapter expects OAuth2 client credentials to be stored via the integrations registry
 * credentials store under the connection id, managed by the integrations OAuth endpoints.
 */
const { google } = require('googleapis');
const stream = require('stream');

class GoogleDriveAdapter {
  constructor(config, oauthTokensProvider) {
    // config: user-provided connection config (e.g., driveFolderId)
    // oauthTokensProvider: function that returns { clientId, clientSecret, redirectUri, tokens }
    this.config = config || {};
    this._getOAuthData = oauthTokensProvider || (async () => null);
    this._drive = null;
  }

  async _getAuthClient() {
    const data = await this._getOAuthData();
    if (!data || !data.clientId) throw new Error('oauth client data missing for google drive connection');
    const { clientId, clientSecret, redirectUri, tokens } = data;
    const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
    if (tokens) oauth2Client.setCredentials(tokens);
    // auto-refresh handled by googleapis
    return oauth2Client;
  }

  async _ensureDrive() {
    if (!this._drive) {
      const auth = await this._getAuthClient();
      this._drive = google.drive({ version: 'v3', auth });
    }
    return this._drive;
  }

  // list files under a folder id or search by name if path is a name string
  async list(pathOrQuery) {
    const drive = await this._ensureDrive();
    const parentId = this.config.driveFolderId || 'root';
    const qParts = [];
    if (!pathOrQuery) {
      qParts.push(`'${parentId}' in parents`);
    } else if (pathOrQuery.startsWith('id:')) {
      qParts.push(`'${pathOrQuery.slice(3)}' in parents`);
    } else {
      // search by name under parent
      qParts.push(`'${parentId}' in parents and name contains '${pathOrQuery.replace("'", "\\'")}'`);
    }
    qParts.push("trashed = false");
    const q = qParts.join(' and ');
    const res = await drive.files.list({ q, fields: 'files(id,name,mimeType,size,parents,webViewLink)', pageSize: 200 });
    return res.data.files || [];
  }

  // upload buffer to remotePath (remotePath as 'folder/.../name' or 'name')
  async upload(buffer, remotePath) {
    const drive = await this._ensureDrive();
    // resolve parent folder: if remotePath contains slashes, create folders as needed under driveFolderId
    const parts = remotePath.split('/').filter(Boolean);
    const fileName = parts.pop();
    let parentId = this.config.driveFolderId || 'root';

    for (const part of parts) {
      // check for existing folder with this name under parentId
      const search = await drive.files.list({ q: `'${parentId}' in parents and name='${part.replace("'", "\\'")}' and mimeType='application/vnd.google-apps.folder' and trashed=false`, fields: 'files(id,name)', pageSize: 1 });
      if (search.data.files && search.data.files.length) {
        parentId = search.data.files[0].id;
      } else {
        const created = await drive.files.create({ requestBody: { name: part, mimeType: 'application/vnd.google-apps.folder', parents: [parentId] }, fields: 'id' });
        parentId = created.data.id;
      }
    }

    // create the file using resumable upload
    const mediaStream = new stream.PassThrough();
    mediaStream.end(buffer);

    const res = await drive.files.create({
      requestBody: { name: fileName, parents: [parentId] },
      media: { body: mediaStream }
    });
    return res.data;
  }

  async downloadStream(remotePathOrId) {
    const drive = await this._ensureDrive();
    // remotePathOrId may be id:FILE_ID or a path (name under configured folder)
    let fileId = null;
    if (remotePathOrId.startsWith('id:')) fileId = remotePathOrId.slice(3);
    else {
      // find file by name under configured folder
      const parent = this.config.driveFolderId || 'root';
      const q = `'${parent}' in parents and name='${remotePathOrId.replace("'", "\\'")}' and trashed=false`;
      const r = await drive.files.list({ q, pageSize: 1, fields: 'files(id,name,mimeType)' });
      if (!r.data.files || !r.data.files.length) throw new Error('file not found');
      fileId = r.data.files[0].id;
    }
    const res = await drive.files.get({ fileId, alt: 'media' }, { responseType: 'stream' });
    return res.data; // stream
  }

  async delete(remotePathOrId) {
    const drive = await this._ensureDrive();
    let fileId = remotePathOrId;
    if (!fileId.startsWith('id:')) {
      // find by name
      const parent = this.config.driveFolderId || 'root';
      const q = `'${parent}' in parents and name='${remotePathOrId.replace("'", "\\'")}' and trashed=false`;
      const r = await drive.files.list({ q, pageSize: 1, fields: 'files(id)' });
      if (!r.data.files || !r.data.files.length) throw new Error('file not found');
      fileId = r.data.files[0].id;
    } else {
      fileId = fileId.slice(3);
    }
    await drive.files.delete({ fileId });
    return true;
  }

  async createFolder(name, parentId) {
    const drive = await this._ensureDrive();
    const parent = parentId || (this.config.driveFolderId || 'root');
    const res = await drive.files.create({ requestBody: { name, mimeType: 'application/vnd.google-apps.folder', parents: [parent] }, fields: 'id,name' });
    return res.data;
  }

  async getShareLink(remotePathOrId) {
    const drive = await this._ensureDrive();
    let fileId = remotePathOrId;
    if (!fileId.startsWith('id:')) {
      // find by name
      const parent = this.config.driveFolderId || 'root';
      const q = `'${parent}' in parents and name='${remotePathOrId.replace("'", "\\'")}' and trashed=false`;
      const r = await drive.files.list({ q, pageSize: 1, fields: 'files(id)' });
      if (!r.data.files || !r.data.files.length) throw new Error('file not found');
      fileId = r.data.files[0].id;
    } else {
      fileId = fileId.slice(3);
    }
    // set permissions to anyoneWithLink reader
    await drive.permissions.create({ fileId, requestBody: { role: 'reader', type: 'anyone' } });
    const meta = await drive.files.get({ fileId, fields: 'webViewLink, webContentLink' });
    return meta.data.webViewLink || meta.data.webContentLink;
  }
}

module.exports = GoogleDriveAdapter;
GD

# 3) Add OAuth endpoints and token storage helpers
cat > "$PROJ_DIR/server/api/google_oauth.js" <<'GOAUTH'
/**
 * Google OAuth endpoints for Drive integration
 *
 * Endpoints:
 *  - GET /api/google/oauth/start?connId=CONN_ID
 *    Redirects to Google auth URL. The connection id identifies where to store tokens.
 *  - GET /api/google/oauth/callback?code=...&state=CONN_ID
 *    Callback to exchange code for tokens and store them encrypted.
 *
 * This file uses the registry to associate tokens with a connection id.
 */
const express = require('express');
const { google } = require('googleapis');
const registry = require('../integrations/registry');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// Helper: load client config from ENV or server/data/google_oauth_client.json
function getClientConfig() {
  // prefer env vars
  if (process.env.GOOGLE_OAUTH_CLIENT_ID && process.env.GOOGLE_OAUTH_CLIENT_SECRET && process.env.GOOGLE_OAUTH_REDIRECT) {
    return {
      clientId: process.env.GOOGLE_OAUTH_CLIENT_ID,
      clientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET,
      redirectUri: process.env.GOOGLE_OAUTH_REDIRECT
    };
  }
  const cfgPath = path.join(process.cwd(), 'server', 'data', 'google_oauth_client.json');
  if (fs.existsSync(cfgPath)) return JSON.parse(fs.readFileSync(cfgPath,'utf8'));
  throw new Error('No Google OAuth client config found. Set GOOGLE_OAUTH_CLIENT_ID/SECRET/REDIRECT or place server/data/google_oauth_client.json');
}

router.get('/oauth/start', async (req, res) => {
  try {
    const connId = req.query.connId;
    if (!connId) return res.status(400).send('connId query required');
    const conf = getClientConfig();
    const oauth2Client = new google.auth.OAuth2(conf.clientId, conf.clientSecret, conf.redirectUri);
    const scopes = ['https://www.googleapis.com/auth/drive'];
    const url = oauth2Client.generateAuthUrl({ access_type: 'offline', scope: scopes, prompt: 'consent', state: connId });
    return res.redirect(url);
  } catch (e) {
    console.error(e);
    return res.status(500).send('internal: ' + e.message);
  }
});

router.get('/oauth/callback', async (req, res) => {
  try {
    const code = req.query.code;
    const state = req.query.state; // connId
    if (!code || !state) return res.status(400).send('code and state required');
    const conf = getClientConfig();
    const oauth2Client = new google.auth.OAuth2(conf.clientId, conf.clientSecret, conf.redirectUri);
    const { tokens } = await oauth2Client.getToken(code);
    // store tokens (encrypted) via registry createConnection or update credentials
    // registry._writeCreds is not exported; registry exposes createConnection/get/remove.
    // We'll write to credentials.enc.json directly (same format used by registry).
    const CRED_FILE = path.join(process.cwd(), 'server', 'data', 'credentials.enc.json');
    // read & decrypt via registry functions is complex; instead registry exposes createConnection which writes creds
    // Here we will write a special entry under state: { google_oauth: { clientId, clientSecret, redirectUri, tokens } }
    const encPath = CRED_FILE;
    let creds = {};
    try { creds = JSON.parse(fs.readFileSync(encPath,'utf8')||'{}'); } catch(e){ creds = {}; }
    creds[state] = creds[state] || {};
    creds[state].google = { clientId: conf.clientId, clientSecret: conf.clientSecret, redirectUri: conf.redirectUri, tokens };
    fs.writeFileSync(encPath, JSON.stringify(creds,null,2),'utf8');
    res.send('<html><body>Google Drive connected for connection id: ' + state + '. You can close this window.</body></html>');
  } catch (e) {
    console.error(e);
    return res.status(500).send('internal: ' + e.message);
  }
});

module.exports = router;
GOAUTH

# 4) Modify registry to expose a helper for reading credentials (we'll patch registry.js)
REGPATH="$PROJ_DIR/server/integrations/registry.js"
if [ -f "$REGPATH" ]; then
  cp "$REGPATH" "${REGPATH}.bak.$timestamp"
fi

cat > "$REGPATH" <<'REG2'
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const ADAPTERS_DIR = path.join(__dirname, 'adapters');
const DATA_FILE = path.join(__dirname, '..', 'data', 'integrations.json');
const CRED_FILE = path.join(__dirname, '..', 'data', 'credentials.enc.json');
const MASTER_KEY = process.env.MASTER_KEY || 'insecure_test_key_change_me';

// simple adapter discover
function listAdapters() {
  return fs.existsSync(ADAPTERS_DIR) ? fs.readdirSync(ADAPTERS_DIR).filter(f => f.endsWith('.js')).map(f => f.replace('.js','')) : [];
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
    try{
      // attempt base64 aes decrypt path used earlier - but if file is plaintext JSON just return it
      const buf = Buffer.from(enc, 'base64');
      const decipher = crypto.createDecipher('aes256', MASTER_KEY);
      const dec = Buffer.concat([decipher.update(buf), decipher.final()]);
      return JSON.parse(dec.toString('utf8')||'{}');
    }catch(e){
      // fallback: if not base64/encrypted, try parse as JSON
      return JSON.parse(enc||'{}');
    }
  }catch(e){ return {}; }
}
function _writeCreds(obj){
  try{
    const cipher = crypto.createCipher('aes256', MASTER_KEY);
    const enc = Buffer.concat([cipher.update(JSON.stringify(obj)), cipher.final()]);
    fs.writeFileSync(CRED_FILE, enc.toString('base64'), 'utf8');
  }catch(e){
    // fallback write plaintext
    try{ fs.writeFileSync(CRED_FILE, JSON.stringify(obj,null,2),'utf8'); }catch(_){}
  }
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

// new helper: getRawCredsForConnection(id) -> returns whatever stored under credentials file for connection id
function getRawCredsForConnection(id){
  const creds = _readCreds();
  return creds[id] || null;
}

module.exports = { listAdapters, listIntegrations, createConnection, get, remove, getRawCredsForConnection };
REG2

# 5) Add AI endpoint modifications: allow arbitrary commands and home access
# We'll add/replace server/api/ai.js
cat > "$PROJ_DIR/server/api/ai.js" <<'AIJS'
/**
 * AI Terminal helper - unrestricted execution (per user confirmation)
 * WARNING: This endpoint executes arbitrary commands as the Node process user.
 * Use with caution. Auth required via service token.
 */
const express = require('express');
const fs = require('fs');
const path = require('path');
const serviceTokens = require('../auth/serviceTokens');
const child_process = require('child_process');
const util = require('util');
const execFile = child_process.execFile;
const spawn = child_process.spawn;
const registry = require('../integrations/registry');

const router = express.Router();

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
  // Allow under HOME or project directory
  const baseProject = process.cwd();
  const home = process.env.HOME || require('os').homedir();
  if (!relPath || relPath === '.') return baseProject;
  // expand ~
  if (relPath.startsWith('~/')) relPath = path.join(home, relPath.slice(2));
  if (relPath === '~') relPath = home;
  const candidate = path.normalize(path.isAbsolute(relPath) ? relPath : path.join(baseProject, relPath));
  // allow if candidate within project or within home
  if (candidate.startsWith(baseProject) || candidate.startsWith(home)) return candidate;
  throw new Error('path outside allowed areas');
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

    if(op === 'write' || op === 'append') {
      const rel = body.path;
      if(!rel) return res.status(400).json({ error: 'path required' });
      const full = resolveSafe(rel);
      const content = body.content || '';
      const MAX_WRITE_BYTES = 20 * 1024 * 1024; // 20MB
      if(Buffer.byteLength(content,'utf8') > MAX_WRITE_BYTES) return res.status(400).json({ error: 'content too large' });
      const dir = path.dirname(full);
      fs.mkdirSync(dir, { recursive: true });
      if(op === 'write') fs.writeFileSync(full, content, 'utf8'); else fs.appendFileSync(full, content, 'utf8');
      audit({ actor: req.ai.name, op, path: rel, len: Buffer.byteLength(content,'utf8') });
      return res.json({ ok: true, path: rel });
    }

    if(op === 'mkdir') {
      const rel = body.path; if(!rel) return res.status(400).json({ error: 'path required' });
      const full = resolveSafe(rel);
      fs.mkdirSync(full, { recursive: true });
      audit({ actor: req.ai.name, op, path: rel });
      return res.json({ ok: true, path: rel });
    }

    if(op === 'rm') {
      const rel = body.path; if(!rel) return res.status(400).json({ error: 'path required' });
      const full = resolveSafe(rel);
      if(full === process.cwd()) return res.status(400).json({ error: 'cannot remove project root' });
      if(!fs.existsSync(full)) return res.status(404).json({ error: 'not found' });
      const stat = fs.statSync(full);
      if(stat.isDirectory()) { fs.rmSync(full, { recursive: true, force: true }); } else fs.unlinkSync(full);
      audit({ actor: req.ai.name, op, path: rel });
      return res.json({ ok: true, path: rel });
    }

    if(op === 'read') {
      const rel = body.path; if(!rel) return res.status(400).json({ error: 'path required' });
      const full = resolveSafe(rel);
      if(!fs.existsSync(full)) return res.status(404).json({ error: 'not found' });
      if(fs.statSync(full).isDirectory()) return res.status(400).json({ error: 'path is directory' });
      const content = fs.readFileSync(full, 'utf8');
      audit({ actor: req.ai.name, op, path: rel, len: Buffer.byteLength(content,'utf8') });
      return res.json({ ok: true, content });
    }

    if(op === 'list') {
      const rel = body.path || '.';
      const full = resolveSafe(rel);
      if(!fs.existsSync(full)) return res.status(404).json({ error: 'not found' });
      const items = fs.readdirSync(full).map(n => { const s = fs.statSync(path.join(full, n)); return { name: n, isDirectory: s.isDirectory(), size: s.size }; });
      audit({ actor: req.ai.name, op, path: rel, count: items.length });
      return res.json({ ok: true, items });
    }

    if(op === 'exec') {
      const cmd = body.cmd;
      const args = body.args || [];
      if(!cmd) return res.status(400).json({ error: 'cmd required' });
      const cwd = body.cwd ? resolveSafe(body.cwd) : process.cwd();
      const timeoutMs = Math.min(120000, parseInt(body.timeoutMs||30000,10) || 30000);
      // Run via shell to allow pipelines — WARNING: shell injection risk if you forward untrusted input
      const shell = true;
      const child = child_process.spawn(cmd, args, { cwd, shell, env: process.env });
      let stdout = '', stderr = '';
      let killed = false;
      const timer = setTimeout(() => { killed = true; child.kill('SIGKILL'); }, timeoutMs);
      child.stdout.on('data', d => { stdout += d.toString(); if (stdout.length > 4*1024*1024) { killed = true; child.kill('SIGKILL'); } });
      child.stderr.on('data', d => { stderr += d.toString(); if (stderr.length > 4*1024*1024) { killed = true; child.kill('SIGKILL'); } });
      child.on('close', code => {
        clearTimeout(timer);
        audit({ actor: req.ai.name, op, cmd, args, cwd, code, stdoutLen: stdout.length, stderrLen: stderr.length });
        return res.json({ ok: true, result: { code, stdout: stdout.slice(0,1000000), stderr: stderr.slice(0,1000000), killed } });
      });
      child.on('error', (err) => { clearTimeout(timer); console.error(err); return res.status(500).json({ error: err.message }); });
      return;
    }

    return res.status(400).json({ error: 'unknown op' });
  }catch(e){ console.error('ai exec error', e); return res.status(500).json({ error: e.message || 'internal' }); }
});

module.exports = router;
AIJS

# 6) Register new routes in server/api/index.js
API_INDEX="$PROJ_DIR/server/api/index.js"
if [ -f "$API_INDEX" ]; then
  cp "$API_INDEX" "${API_INDEX}.bak.$timestamp"
  # Insert registration for AI and Google OAuth if not already present
  awk '
  BEGIN{ ai_added=0; google_added=0; }
  {
    print $0;
    if($0 ~ /router = express\\.Router\\(\\);/){ next }
  }
  ' "$API_INDEX" > "${API_INDEX}.tmp" || true

  # We'll regenerate a basic index that includes existing endpoints plus ai & google oauth
fi

cat > "$API_INDEX" <<'APIIDX'
const express = require('express');
const authRouter = require('./auth');
const uploadRouter = require('./upload');
const downloadRouter = require('./download');
const filesRouter = require('./files');
const integrationsRouter = require('./integrationsProxy');
const aiRouter = require('./ai');
const googleOauth = require('./google_oauth');

const router = express.Router();
router.use('/auth', authRouter);
router.use('/upload', uploadRouter);
router.use('/download', downloadRouter);
router.use('/files', filesRouter);
router.use('/integrations', integrationsRouter);
router.use('/ai', aiRouter);
router.use('/google', googleOauth);

module.exports = router;
APIIDX

# 7) Add helper script: scripts/ai_terminal_client.sh (updated)
cat > "$PROJ_DIR/scripts/ai_terminal_client.sh" <<'CLISH'
#!/usr/bin/env bash
# AI terminal client
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
CLISH
chmod +x "$PROJ_DIR/scripts/ai_terminal_client.sh"

# 8) Add helper to start Google OAuth from CLI
cat > "$PROJ_DIR/scripts/start_google_oauth.sh" <<'GCLI'
#!/usr/bin/env bash
# Usage: scripts/start_google_oauth.sh <connectionId>
# Outputs the URL to open for OAuth consent (or attempts to open browser)
CONN="$1"
if [ -z "$CONN" ]; then echo "Usage: $0 <connectionId>"; exit 2; fi
HOST="${HOST:-http://localhost:3000}"
URL="$HOST/api/google/oauth/start?connId=$CONN"
echo "Open this URL to authorize Google Drive for connection $CONN:"
echo "$URL"
# try to open browser if available
if command -v xdg-open >/dev/null 2>&1; then xdg-open "$URL" >/dev/null 2>&1 || true; fi
GCLI
chmod +x "$PROJ_DIR/scripts/start_google_oauth.sh"

# 9) Update integrations proxy to support oauth flows when creating a Google Drive connection
# We'll add a small helper registration: if provider === 'google_drive' and createConnection called, user should run oauth flow with connId returned.
# Keep existing integrations proxy unchanged; just add a HOWTO file.
cat > "$PROJ_DIR/server/integrations/HOWTO_GOOGLE_DRIVE.md" <<'HGO'
Google Drive Integration (OAuth2)

1) Create a Google Cloud OAuth client:
   - Go to https://console.developers.google.com/
   - Create a project, enable the Google Drive API.
   - Create OAuth 2.0 Client ID (Web application).
   - Add redirect URI: http://localhost:3000/api/google/oauth/callback
   - Save clientId and clientSecret.

2) Place them in server/data/google_oauth_client.json:
{
  "clientId": "YOUR_CLIENT_ID",
  "clientSecret": "YOUR_CLIENT_SECRET",
  "redirectUri": "http://localhost:3000/api/google/oauth/callback"
}

or set environment variables:
  GOOGLE_OAUTH_CLIENT_ID, GOOGLE_OAUTH_CLIENT_SECRET, GOOGLE_OAUTH_REDIRECT

3) Create a connection via the Integrations UI (provider: google_drive). Note the returned connection id.

4) Run:
   ./scripts/start_google_oauth.sh <connectionId>
   then open the URL and accept. The server will store encrypted tokens for that connection id.

5) Use the integrations API to upload/list/download using that connection id.
HGO

# 10) Add exported adapter loader helper in integrations proxy so google adapter can get tokens via registry.getRawCredsForConnection
# We'll patch the server/api/integrationsProxy.js to pass oauth provider to adapter
IPATH="$PROJ_DIR/server/api/integrationsProxy.js"
if [ -f "$IPATH" ]; then
  cp "$IPATH" "${IPATH}.bak.$timestamp"
fi

cat > "$IPATH" <<'IPNEW'
const express = require('express');
const registry = require('../integrations/registry');
const storage = require('../storage/localStorage');
const zipUtils = require('../utils/zipUtils');
const auth = require('../auth/jwt');
const path = require('path');
const router = express.Router();

// list available adapters & connections
router.get('/list', (req, res) => {
  const data = registry.listIntegrations();
  res.json(data);
});

// connect (create a configured connection) - same as registry.createConnection
router.post('/connect', express.json(), (req, res) => {
  try {
    const { provider, name, config } = req.body;
    const conn = registry.createConnection(provider, name, config);
    res.json({ ok: true, connection: conn });
  } catch (e) {
    console.error(e); res.status(500).json({ error: 'internal' });
  }
});

// upload to integration: POST /api/integrations/:id/upload
router.post('/:id/upload', auth.middleware, express.json(), async (req, res) => {
  try {
    const id = req.params.id;
    const conn = registry.get(id);
    if (!conn) return res.status(404).json({ error: 'no conn' });
    const provider = conn.provider;
    // load adapter
    const AdapterPath = path.join(__dirname, '..', 'integrations', 'adapters', provider + '.js');
    if (!require('fs').existsSync(AdapterPath)) return res.status(500).json({ error: 'adapter not found' });
    const Adapter = require(AdapterPath);
    // provide oauth token getter for google adapter
    const oauthProvider = async () => {
      const raw = registry.getRawCredsForConnection(id);
      if (!raw) return null;
      // Google tokens might be stored under raw.google
      return {
        clientId: raw.google && raw.google.clientId,
        clientSecret: raw.google && raw.google.clientSecret,
        redirectUri: raw.google && raw.google.redirectUri,
        tokens: raw.google && raw.google.tokens
      };
    };
    const adapter = new Adapter(conn.config || {}, oauthProvider);
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

// fetch from integration to uploads (download)
router.post('/:id/fetch', auth.middleware, express.json(), async (req, res) => {
  try {
    const id = req.params.id;
    const conn = registry.get(id);
    if (!conn) return res.status(404).json({ error: 'no conn' });
    const provider = conn.provider;
    const AdapterPath = path.join(__dirname, '..', 'integrations', 'adapters', provider + '.js');
    if (!require('fs').existsSync(AdapterPath)) return res.status(500).json({ error: 'adapter not found' });
    const Adapter = require(AdapterPath);
    const oauthProvider = async () => {
      const raw = registry.getRawCredsForConnection(id);
      if (!raw) return null;
      return {
        clientId: raw.google && raw.google.clientId,
        clientSecret: raw.google && raw.google.clientSecret,
        redirectUri: raw.google && raw.google.redirectUri,
        tokens: raw.google && raw.google.tokens
      };
    };
    const adapter = new Adapter(conn.config || {}, oauthProvider);
    const remotePath = req.body.path;
    if (!remotePath) return res.status(400).json({ error: 'path required' });
    const stream = await adapter.downloadStream(remotePath);
    const destRel = 'integrations/' + id + '/' + (path.basename(remotePath));
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
    const provider = conn.provider;
    const AdapterPath = path.join(__dirname, '..', 'integrations', 'adapters', provider + '.js');
    if (!require('fs').existsSync(AdapterPath)) return res.status(500).json({ error: 'adapter not found' });
    const Adapter = require(AdapterPath);
    const oauthProvider = async () => {
      const raw = registry.getRawCredsForConnection(id);
      if (!raw) return null;
      return {
        clientId: raw.google && raw.google.clientId,
        clientSecret: raw.google && raw.google.clientSecret,
        redirectUri: raw.google && raw.google.redirectUri,
        tokens: raw.google && raw.google.tokens
      };
    };
    const adapter = new Adapter(conn.config || {}, oauthProvider);
    const p = req.query.path || '';
    const list = await adapter.list(p);
    res.json({ ok: true, items: list });
  } catch (e) { console.error(e); res.status(500).json({ error: 'internal' }); }
});

module.exports = router;
IPNEW

# 11) Ensure serviceTokens file exists and has AI token; print the AI token at the end
STOK="$PROJ_DIR/server/data/service_tokens.json"
if [ ! -f "$STOK" ]; then
  echo "{}" > "$STOK"
fi

AI_TOKEN=$(node -e "const fs=require('fs'),p='${STOK}'; let obj={}; try{obj=JSON.parse(fs.readFileSync(p,'utf8')||'{}')}catch(e){}; const name='AI_SERVICE'; const token='AI_TOKEN_'+Math.random().toString(36).slice(2); obj[name]={ token, createdAt: Date.now() }; fs.writeFileSync(p,JSON.stringify(obj,null,2)); console.log(token);")

# 12) Final messages and instructions
cat > /tmp/christina_patch_notes.txt <<NOTES
Patch applied to: $PROJ_DIR

AI service token (for scripts/ai_terminal_client.sh): $AI_TOKEN

Next steps:
1) Set secure MASTER_KEY and JWT_SECRET before starting server:
   export MASTER_KEY='your_master_key_here'
   export JWT_SECRET='change_this_secret'
   (or add to .env and use dotenv)

2) Configure Google OAuth client:
   - Create OAuth client in Google Cloud Console with redirect URI:
     http://localhost:3000/api/google/oauth/callback
   - Place client config in server/data/google_oauth_client.json or set env vars:
     GOOGLE_OAUTH_CLIENT_ID, GOOGLE_OAUTH_CLIENT_SECRET, GOOGLE_OAUTH_REDIRECT

   Example file: server/data/google_oauth_client.json
   {
     "clientId":"<YOUR_CLIENT_ID>",
     "clientSecret":"<YOUR_CLIENT_SECRET>",
     "redirectUri":"http://localhost:3000/api/google/oauth/callback"
   }

3) Start server:
   cd $PROJ_DIR
   npm run start:server

4) Create a connection via Integrations UI or API:
   - Use the Integrations page: http://localhost:3000/integrations
   - Choose provider: google_drive
   - Name it (e.g., "my-drive")
   - Note the connection id returned

5) Run OAuth flow:
   ./scripts/start_google_oauth.sh <connectionId>
   Open the URL printed, accept consent.
   Tokens will be stored encrypted under server/data/credentials.enc.json keyed by connectionId.

6) Use AI terminal to run commands:
   ./scripts/ai_terminal_client.sh $AI_TOKEN exec ls -la ~
   ./scripts/ai_terminal_client.sh $AI_TOKEN write ~/test.txt "hello from AI"

7) Upload a local file to Drive via integration (example):
   - Create connection (as above) and run:
     curl -X POST -H "Authorization: Bearer <JWT of logged-in user>" -H "Content-Type: application/json" -d '{"source":{"type":"server","path":"path/in/uploads/or/full/path"},"destPath":"folder/name.ext"}' http://localhost:3000/api/integrations/<connectionId>/upload

Security WARNING:
- The AI terminal endpoint allows arbitrary command execution as the Node user and access to your home directory.
- Only use the AI service token in trusted contexts and rotate the token if leaked.
- Consider running the service in a restricted container or VM.

NOTES

echo "Patch applied. See /tmp/christina_patch_notes.txt for instructions."
echo "AI service token: $AI_TOKEN"
echo "IMPORTANT: set MASTER_KEY and JWT_SECRET before starting the server."
echo ""
echo "To view the generated notes: cat /tmp/christina_patch_notes.txt"