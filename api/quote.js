import { createServer } from 'node:http';
import { URL } from 'node:url';
import yahooFinance from 'yahoo-finance2';

/** Unified request handler (works for Vercel and local dev) */
async function handler(req, res) {
  if (!req.url.startsWith('/api/quote')) {
    res.writeHead(404).end();
    return;
  }

  const url = new URL(req.url, 'http://x'); // dummy base
  const symbol = (url.searchParams.get('symbol') || 'AAPL').toUpperCase();

  try {
    const quote = await yahooFinance.quote(symbol);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(quote));
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: err.message }));
  }
}

/* ---------- 1  Export for Vercel ---------- */
export default function vercelHandler(req, res) {
  return handler(req, res); // Vercel passes (req,res) just like http.createServer
}

/* ---------- 2  Self-host in dev / CodeSandbox ---------- */
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 3000;
  createServer(handler).listen(PORT, () =>
    console.log(
      `▶︎ Local quote API... → http://localhost:${PORT}/api/quote?symbol=TSLA`,
    ),
  );
}
