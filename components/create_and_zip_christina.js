/*
 Plain JS fallback: creates a folder 'christina-mini' and zips it using archiver.
 Run: node create_and_zip_christina.js
 Ensure 'archiver' is installed: npm install archiver
*/
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

const OUT_DIR = path.resolve(process.cwd(), 'christina-mini');
const ZIP_PATH = path.resolve(process.cwd(), 'christina-mini.zip');

function writeFile(filePath, contents) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(filePath, contents, 'utf8');
}

function createScaffold() {
  writeFile(path.join(OUT_DIR, 'README.md'), 'Christina Mini\n');
  writeFile(path.join(OUT_DIR, 'index.js'), "console.log('Hello from Christina Mini');");
  writeFile(path.join(OUT_DIR, 'frontend', 'index.html'), '<!doctype html><meta charset="utf-8"><title>Christina</title>');
  writeFile(path.join(OUT_DIR, 'src', 'LeftSidebar', 'index.tsx'), '// placeholder');
}

function createZip(sourceDir, outPath) {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(outPath);
    const archive = archiver('zip', { zlib: { level: 9 } });
    output.on('close', () => {
      console.log('Created zip (' + archive.pointer() + ' bytes): ' + outPath);
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
    console.log('Creating scaffold at:', OUT_DIR);
    if (fs.existsSync(OUT_DIR)) {
      console.log('Removing existing folder:', OUT_DIR);
      const rimrafSync = p => {
        if (!fs.existsSync(p)) return;
        const s = fs.statSync(p);
        if (s.isDirectory()) {
          for (const e of fs.readdirSync(p)) rimrafSync(path.join(p, e));
          fs.rmdirSync(p);
        } else fs.unlinkSync(p);
      };
      rimrafSync(OUT_DIR);
    }
    createScaffold();
    console.log('Scaffold created. Now zipping...');
    await createZip(OUT_DIR, ZIP_PATH);
    console.log('Done. Files created:\n -', OUT_DIR, '\n -', ZIP_PATH);
  } catch (err) {
    console.error('Error:', err && err.stack ? err.stack : err);
    process.exit(1);
  }
})();
