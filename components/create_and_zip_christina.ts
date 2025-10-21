// create_and_zip_christina.ts
// Clean, self-contained script to create a project scaffold and zip it.
// Requires: npm install archiver
// Run with: npx ts-node create_and_zip_christina.ts

import fs from 'fs';
import path from 'path';
import archiver from 'archiver';
// Fix: Import process to get correct typings for cwd and exitCode.
import process from 'process';

const OUT_DIR = path.resolve(process.cwd(), 'christina-mini');
const ZIP_PATH = path.resolve(process.cwd(), 'christina-mini.zip');

function writeFile(filePath: string, contents: string) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filePath, contents, { encoding: 'utf8' });
}

/* ---------- Minimal scaffold contents ---------- */

const pkgJson = `{
  "name": "christina-mini",
  "version": "0.0.1",
  "private": true,
  "scripts": {
    "start": "node index.js"
  }
}
`;

const readme = `Christina Mini
==============
This is a minimal scaffold created by create_and_zip_christina.ts
`;

const indexJs = `console.log('Christina mini scaffold');`;

const serverTs = `// example TypeScript server entry (not required)
console.log('Hello from Christina mini (TS sample)');`;

const feIndexHtml = `<!doctype html>
<html>
  <head><meta charset="utf-8"><title>Christina Mini</title></head>
  <body>
    <h1>Christina Mini</h1>
    <div id="app"></div>
    <script src="index.js"></script>
  </body>
</html>
`;

const feStylesCss = `body { font-family: system-ui, sans-serif; margin: 20px; }`;

const feAppJs = `document.getElementById('app').textContent = 'Hello, Christina!';`;

/* ---------- Write files ---------- */

function createScaffold(outDir: string) {
  // root files
  writeFile(path.join(outDir, 'package.json'), pkgJson);
  writeFile(path.join(outDir, 'README.md'), readme);
  writeFile(path.join(outDir, 'index.js'), indexJs);

  // optional TS example
  writeFile(path.join(outDir, 'src', 'server.ts'), serverTs);

  // frontend minimal
  writeFile(path.join(outDir, 'frontend', 'index.html'), feIndexHtml);
  writeFile(path.join(outDir, 'frontend', 'index.js'), feAppJs);
  writeFile(path.join(outDir, 'frontend', 'styles.css'), feStylesCss);

  // .gitignore
  writeFile(path.join(outDir, '.gitignore'), 'node_modules\n.env\noutputs\nuploads\n');

  // example nested files
  writeFile(path.join(outDir, 'src', 'LeftSidebar', 'index.tsx'), '// LeftSidebar index (placeholder)');
  writeFile(path.join(outDir, 'src', 'LeftSidebar', 'AgentsPanel.tsx'), '// AgentsPanel (placeholder)');
  writeFile(path.join(outDir, 'src', 'LeftSidebar', 'TasksPanel.tsx'), '// TasksPanel (placeholder)');
  writeFile(path.join(outDir, 'src', 'LeftSidebar', 'MediaPanel.tsx'), '// MediaPanel (placeholder)');
  writeFile(path.join(outDir, 'src', 'LeftSidebar', 'LogsPanel.tsx'), '// LogsPanel (placeholder)');
  writeFile(path.join(outDir, 'src', 'RightSidebar', 'index.tsx'), '// RightSidebar index (placeholder)');
  writeFile(path.join(outDir, 'src', 'RightSidebar', 'FileConverter.tsx'), '// FileConverter (placeholder)');
  writeFile(path.join(outDir, 'src', 'RightSidebar', 'HelpManual.tsx'), '// HelpManual (placeholder)');
  writeFile(path.join(outDir, 'src', 'MainWorkspace', 'WorkflowCanvas.tsx'), '// WorkflowCanvas (placeholder)');
}

/* ---------- Create zip ---------- */

async function createZip(sourceDir: string, outPath: string): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const output = fs.createWriteStream(outPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', () => {
      // Avoid template literal issues by using string concatenation.
      console.log('Created zip (' + archive.pointer() + ' total bytes): ' + outPath);
      resolve();
    });

    output.on('end', () => {
      // no-op
    });

    archive.on('warning', (err: any) => {
      if (err && (err as any).code === 'ENOENT') {
        console.warn('Archiver warning:', err);
      } else {
        reject(err);
      }
    });

    archive.on('error', (err: any) => reject(err));

    archive.pipe(output);
    // Add directory recursively. Use false to avoid including full absolute path.
    archive.directory(sourceDir, path.basename(sourceDir));
    archive.finalize();
  });
}

/* ---------- Main flow ---------- */

(async () => {
  try {
    // Remove any existing output folder and zip to ensure a fresh run.
    if (fs.existsSync(OUT_DIR)) {
      // be conservative: only remove if it's the expected folder name
      if (path.basename(OUT_DIR) === 'christina-mini') {
        // synchronous remove for simplicity
        const rimrafSync = (p: string) => {
          if (!fs.existsSync(p)) return;
          const stats = fs.statSync(p);
          if (stats.isDirectory()) {
            for (const entry of fs.readdirSync(p)) {
              rimrafSync(path.join(p, entry));
            }
            fs.rmdirSync(p);
          } else {
            fs.unlinkSync(p);
          }
        };
        rimrafSync(OUT_DIR);
      }
    }

    createScaffold(OUT_DIR);

    if (fs.existsSync(ZIP_PATH)) {
      fs.unlinkSync(ZIP_PATH);
    }

    await createZip(OUT_DIR, ZIP_PATH);

    console.log('');
    console.log('Done. Files created:');
    console.log(' -', OUT_DIR);
    console.log(' -', ZIP_PATH);
    console.log('');
    console.log('To upload the zip to Google Drive or inspect the scaffold, use your preferred tool.');
  } catch (err) {
    console.error('Error:', err);
    process.exitCode = 1;
  }
})();