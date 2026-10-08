import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { 
  BPF_LOADER_UPGRADEABLE_ID, 
  getJupiterProgramLabels, 
  deriveAnchorIdlPda, 
  inspectProgramAccount, 
  getBpfCatalog 
} from './bpfEngine.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const PORT = process.env.PORT || 3006;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

export async function handleRequest(req, res) {
  const host = req.headers.host || `localhost:${PORT}`;
  const reqUrl = new URL(req.url, `http://${host}`);
  const pathname = reqUrl.pathname;

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  try {
    // API 1: BPF Indexer Overall Stats & Architecture Constants
    if (pathname === '/api/bpf/stats' && req.method === 'GET') {
      const labels = await getJupiterProgramLabels();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        bpfLoaderOwner: BPF_LOADER_UPGRADEABLE_ID,
        bpfLoaderRole: 'Universal Sovereign Owner of all deployed smart contracts on Solana',
        totalHistoricalPrograms: 75510,
        programAccountDataSize: 36,
        jupiterVerifiedCommercialProtocols: Object.keys(labels).length,
        timestamp: Date.now()
      }));
      return;
    }

    // API 2: BPF Catalog (Filterable by jupiter, anchor, all)
    if (pathname === '/api/bpf/catalog' && req.method === 'GET') {
      const filter = reqUrl.searchParams.get('filter') || 'all';
      const search = reqUrl.searchParams.get('search') || '';
      const limit = parseInt(reqUrl.searchParams.get('limit') || '100', 10);
      const data = await getBpfCatalog(filter, search, limit);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(data));
      return;
    }

    // API 3: Deep Program Inspector (Live On-Chain)
    if (pathname === '/api/bpf/inspect' && req.method === 'GET') {
      const programId = reqUrl.searchParams.get('programId') || '675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8';
      const result = await inspectProgramAccount(programId);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(result));
      return;
    }

    // API 4: Jupiter Labels Dictionary
    if (pathname === '/api/bpf/jupiter-labels' && req.method === 'GET') {
      const labels = await getJupiterProgramLabels();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, count: Object.keys(labels).length, labels }));
      return;
    }

    // Static Files
    let filePath = pathname === '/' ? path.join(PUBLIC_DIR, 'index.html') : path.join(PUBLIC_DIR, pathname);
    try {
      const stat = await fs.stat(filePath);
      if (stat.isDirectory()) {
        filePath = path.join(filePath, 'index.html');
      }
      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';
      const content = await fs.readFile(filePath);
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    } catch {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
    }
  } catch (err) {
    console.error('Server error:', err);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, error: err.message }));
  }
}

if (!process.env.VERCEL) {
  const server = http.createServer(handleRequest);
  server.listen(PORT, () => {
    console.log(`\n================================================================`);
    console.log(`⚡ Solana BPF Loader Universal Smart Contract Indexer`);
    console.log(`🌐 Dashboard:        http://localhost:${PORT}`);
    console.log(`📡 Stats API:        http://localhost:${PORT}/api/bpf/stats`);
    console.log(`📋 Catalog API:      http://localhost:${PORT}/api/bpf/catalog`);
    console.log(`🔍 Program Inspect:  http://localhost:${PORT}/api/bpf/inspect?programId=oreoU2P8bN6jkk3jbaiVxYnG1dCXcYxwhwyK9jSybcp`);
    console.log(`================================================================\n`);
  });
}

export default handleRequest;
