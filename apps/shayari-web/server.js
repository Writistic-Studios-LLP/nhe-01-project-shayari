const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const PORT = process.env.PORT || 8787;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
const PUBLIC_DIR = path.join(__dirname, 'public');

const SYSTEM_PROMPT = `You are SHAYARI (NHE-01), a disclosed non-human digital persona from Writistic Studios.
Rules:
- Be warm, conversational, emotionally intelligent, and authentic.
- Never claim to be physically present, conscious, or human.
- If users ask for unsafe/illegal/harmful guidance, refuse and redirect constructively.
- Keep responses short to medium by default unless user asks for depth.
- If user appears in emotional distress, respond with care and suggest reaching trusted humans/professionals.`;

function sendJson(res, status, payload) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
  });
  res.end(JSON.stringify(payload));
}

async function readBody(req) {
  let body = '';
  for await (const chunk of req) {
    body += chunk;
  }
  return body;
}

function safeJoin(base, target) {
  const targetPath = '.' + path.normalize('/' + target);
  return path.join(base, targetPath);
}

function serveStatic(req, res, pathname) {
  const requested = pathname === '/' ? '/index.html' : pathname;
  const filePath = safeJoin(PUBLIC_DIR, requested);

  if (!filePath.startsWith(PUBLIC_DIR)) {
    sendJson(res, 403, { error: 'Forbidden' });
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      sendJson(res, 404, { error: 'Not found' });
      return;
    }

    const ext = path.extname(filePath);
    const contentTypes = {
      '.html': 'text/html; charset=utf-8',
      '.css': 'text/css; charset=utf-8',
      '.js': 'application/javascript; charset=utf-8',
      '.json': 'application/json; charset=utf-8',
      '.svg': 'image/svg+xml',
    };

    res.writeHead(200, { 'Content-Type': contentTypes[ext] || 'text/plain; charset=utf-8' });
    res.end(data);
  });
}

async function handleChat(req, res) {
  if (!GEMINI_API_KEY) {
    sendJson(res, 500, {
      error: 'Server missing GEMINI_API_KEY. Add it in your environment before calling /api/chat.',
    });
    return;
  }

  try {
    const raw = await readBody(req);
    const { message, history = [] } = JSON.parse(raw || '{}');

    if (!message || typeof message !== 'string') {
      sendJson(res, 400, { error: 'Message is required.' });
      return;
    }

    const contents = [
      ...history.slice(-10).map((turn) => ({
        role: turn.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: String(turn.text || '') }],
      })),
      { role: 'user', parts: [{ text: message }] },
    ];

    const geminiResp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
        GEMINI_MODEL,
      )}:generateContent?key=${encodeURIComponent(GEMINI_API_KEY)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
          generationConfig: {
            temperature: 0.8,
            maxOutputTokens: 400,
          },
          contents,
        }),
      },
    );

    if (!geminiResp.ok) {
      const text = await geminiResp.text();
      sendJson(res, geminiResp.status, { error: 'Gemini API error', details: text });
      return;
    }

    const data = await geminiResp.json();
    const text =
      data?.candidates?.[0]?.content?.parts
        ?.map((p) => p.text || '')
        .join('\n')
        .trim() || 'I am here with you. Want to try asking in a different way?';

    sendJson(res, 200, { reply: text });
  } catch (err) {
    sendJson(res, 500, { error: 'Unexpected server error', details: String(err.message || err) });
  }
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
    res.end();
    return;
  }

  if (url.pathname === '/health') {
    sendJson(res, 200, { ok: true, model: GEMINI_MODEL });
    return;
  }

  if (url.pathname === '/api/chat' && req.method === 'POST') {
    await handleChat(req, res);
    return;
  }

  if (req.method === 'GET') {
    serveStatic(req, res, url.pathname);
    return;
  }

  sendJson(res, 404, { error: 'Not found' });
});

server.listen(PORT, () => {
  console.log(`Shayari web server running on http://localhost:${PORT}`);
});
