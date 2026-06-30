'use strict';

/*
 * Stuhl-Tai-Chi – selbst-gehosteter Server
 *
 * Bewusst ohne npm-Abhaengigkeiten: nur die in Node.js eingebauten Module.
 * Damit laeuft die App auf jedem Server mit Node >= 18 ueber:  node server.js
 *
 * - Liefert die statische PWA aus dem Ordner /public aus.
 * - Speichert den Fortschritt in einer einzelnen JSON-Datei (data/state.json).
 *   Dadurch sind iPhone und iPad automatisch synchron, weil beide auf
 *   denselben Server-Stand zugreifen.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

const PUBLIC_DIR = path.join(__dirname, 'public');
const DATA_DIR = path.join(__dirname, 'data');
const STATE_FILE = path.join(DATA_DIR, 'state.json');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
};

function ensureData() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(STATE_FILE)) {
    fs.writeFileSync(STATE_FILE, JSON.stringify(defaultState(), null, 2));
  }
}

function defaultState() {
  return {
    version: 1,
    profile: {
      name: '',
      weightKg: null,
      startDate: null,
      partner: null, // wird bei der Einrichtung gesetzt
    },
    // Fortschritt pro Tag: { "1": { done: true, dateISO, minutes }, ... }
    days: {},
    weightLog: [], // [{ dateISO, kg }]
    updatedAt: null,
  };
}

function readState() {
  try {
    const raw = fs.readFileSync(STATE_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    return Object.assign(defaultState(), parsed);
  } catch (err) {
    return defaultState();
  }
}

function writeState(state) {
  state.updatedAt = new Date().toISOString();
  // Atomar schreiben: erst temp, dann umbenennen – verhindert kaputte Datei bei Stromausfall.
  const tmp = STATE_FILE + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(state, null, 2));
  fs.renameSync(tmp, STATE_FILE);
  return state;
}

function sendJson(res, status, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  });
  res.end(body);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    let tooBig = false;
    req.on('data', (chunk) => {
      data += chunk;
      if (data.length > 1_000_000) {
        tooBig = true;
        req.destroy();
      }
    });
    req.on('end', () => {
      if (tooBig) return reject(new Error('payload too large'));
      resolve(data);
    });
    req.on('error', reject);
  });
}

function serveStatic(req, res) {
  let urlPath = decodeURIComponent(req.url.split('?')[0]);
  if (urlPath === '/') urlPath = '/index.html';

  // Pfad-Traversal verhindern.
  const safePath = path
    .normalize(urlPath)
    .replace(/^(\.\.[/\\])+/, '');
  const filePath = path.join(PUBLIC_DIR, safePath);

  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    return res.end('Forbidden');
  }

  fs.readFile(filePath, (err, content) => {
    if (err) {
      // Fallback auf die App (Single-Page) bei unbekannten Pfaden.
      if (req.method === 'GET' && !urlPath.startsWith('/api')) {
        return fs.readFile(path.join(PUBLIC_DIR, 'index.html'), (e2, html) => {
          if (e2) {
            res.writeHead(404);
            return res.end('Not found');
          }
          res.writeHead(200, { 'Content-Type': MIME['.html'] });
          res.end(html);
        });
      }
      res.writeHead(404);
      return res.end('Not found');
    }
    const ext = path.extname(filePath);
    res.writeHead(200, {
      'Content-Type': MIME[ext] || 'application/octet-stream',
      'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=3600',
    });
    res.end(content);
  });
}

const server = http.createServer(async (req, res) => {
  // --- API ---
  if (req.url.startsWith('/api/')) {
    try {
      if (req.url === '/api/state' && req.method === 'GET') {
        return sendJson(res, 200, readState());
      }
      if (req.url === '/api/state' && req.method === 'PUT') {
        const body = await readBody(req);
        const incoming = JSON.parse(body || '{}');
        const merged = Object.assign(readState(), incoming);
        return sendJson(res, 200, writeState(merged));
      }
      if (req.url === '/api/health' && req.method === 'GET') {
        return sendJson(res, 200, { ok: true, time: new Date().toISOString() });
      }
      return sendJson(res, 404, { error: 'unknown endpoint' });
    } catch (err) {
      return sendJson(res, 400, { error: String(err.message || err) });
    }
  }

  // --- Statische Dateien / PWA ---
  return serveStatic(req, res);
});

ensureData();
server.listen(PORT, HOST, () => {
  console.log(`Stuhl-Tai-Chi laeuft auf  http://${HOST}:${PORT}`);
  console.log(`Daten werden gespeichert in  ${STATE_FILE}`);
});
