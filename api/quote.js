import { createServer } from 'node:http';
import { URL } from 'node:url';
import yahooFinance from 'yahoo-finance2';

/* ---------- helper: polyfill res.status().json() when absent ---------- */
function patch(res) {
  if (typeof res.status === 'function' && typeof res.json === 'function') {
    return res; // Vercel/Express ⇒ nothing to do
  }
  res.status = (code) => {
    res.writeHead(code, { 'Content-Type': 'application/json' });
    return res; // enable chaining
  };
  res.json = (obj) => res.end(JSON.stringify(obj));
  return res;
}

/* ---------- unified handler ------------------------------------------- */
async function handler(req, res) {
  res = patch(res); // ensure helpers exist

  if (!req.url.startsWith('/api/quote')) {
    return res.status(404).json({ error: 'Not found' });
  }

  const url = new URL(req.url, 'http://x'); // dummy base
  const symbol = (url.searchParams.get('symbol') || 'AAPL').toUpperCase();
  console.log('REQ symbol:', symbol);

  /* time window: last 12 months */
  const today = new Date();
  const yearAgo = new Date(today);
  yearAgo.setFullYear(today.getFullYear() - 2);

  try {
    const rows = await yahooFinance.historical(symbol, {
      period1: yearAgo,
      period2: today,
      interval: '1d',
    });

    const table = rows.map((r) => {
      console.log('JJJ: ', r);
      return {
        date: r.date.toISOString().slice(0, 10),
        open: r.open,
        close: r.close,
        high: r.high,
        low: r.low,
        volumn: r.volume,
        diff: r.close - r.open,
      };
    });

    return res.status(200).json({ symbol, table });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

/* ---------- 1. export for Vercel -------------------------------------- */
export default function vercelHandler(req, res) {
  return handler(req, res); // Vercel passes (req, res)
}

/* ---------- 2. self-host for local / CodeSandbox ---------------------- */
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 3000;
  createServer(handler).listen(PORT, () =>
    console.log(
      `▶︎ Local quote API → http://localhost:${PORT}/api/quote?symbol=TSLA`,
    ),
  );
}
