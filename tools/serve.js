// Servidor estático local para testar o app: node tools/serve.js
// Só escuta em 127.0.0.1 e só serve os tipos de arquivo do app.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');
const PORT = Number(process.env.PORT) || 5173;
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.png': 'image/png',
  '.webmanifest': 'application/manifest+json',
  '.json': 'application/json',
};

createServer(async (req, res) => {
  try {
    let path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (path.endsWith('/')) path += 'index.html';
    const file = resolve(ROOT, '.' + path);
    const inside = file.startsWith(ROOT + sep);
    const hidden = path.split('/').some((seg) => seg.startsWith('.'));
    const type = TYPES[extname(file)];
    if (!inside || hidden || !type || path.includes('\0')) {
      res.writeHead(404).end('Não encontrado');
      return;
    }
    const body = await readFile(file);
    res.writeHead(200, { 'Content-Type': type, 'Cache-Control': 'no-cache' });
    res.end(body);
  } catch {
    if (!res.headersSent) res.writeHead(404).end('Não encontrado');
  }
}).listen(PORT, '127.0.0.1', () => console.log(`Feirinha em http://localhost:${PORT}/`));
