// scripts/devServer.mjs
import { createServer } from 'node:http';
import { URL } from 'node:url';

import {
  fetchSingleSymbol,
  fetchMultiSymbols,
  fetchLiveQuotes, // <-- add this
} from '../api/_shared.js';

function patch(res) {
  if (typeof res.status === 'function' && typeof res.json === 'function')
    return res;
  res.status = (code) => {
    res.writeHead(code, { 'Content-Type': 'application/json' });
    return res;
  };
  res.json = (obj) => res.end(JSON.stringify(obj));
  return res;
}

async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    return res.end();
  }

  res = patch(res);

  // handle browser preflight gracefully
  if (req.method === 'OPTIONS') {
    res.statusCode = 204; // No Content
    return res.end();
  }

  const url = new URL(
    req.url || '/',
    `http://${req.headers.host || 'localhost'}`,
  );

  try {
    // /api/quote?symbol=TCS.NS
    if (url.pathname === '/api/quote') {
      const symbol = url.searchParams.get('symbol');
      const months = parseInt(url.searchParams.get('months') || '6', 10);
      if (!symbol) {
        return res.status(400).json({ error: 'symbol parameter is required' });
      }
      const payload = await fetchSingleSymbol(symbol, months);
      return res.status(200).json(payload);
    }

    // /api/symbols?symbols=TCS,INFY,HCLTECH
    if (url.pathname === '/api/symbols') {
      const list = url.searchParams.get('symbols');
      const months = parseInt(url.searchParams.get('months') || '6', 10);
      if (!list) {
        return res.status(400).json({ error: 'symbols parameter is required' });
      }
      const payload = await fetchMultiSymbols(list, months);
      return res.status(200).json(payload);
    }

    if (url.pathname === '/api/quotes') {
      console.log('[devServer] /api/quotes (yahoo-finance2 path)');

      try {
        const rawList = url.searchParams.get('symbols');
        if (!rawList) {
          return res.status(400).json({ error: 'symbols query required' });
        }

        const snapshot = await fetchLiveQuotes(rawList);

        // CORS headers are already being set at the top of handler()
        res.setHeader?.('Cache-Control', 'no-store');

        return res.status(200).json(snapshot);
      } catch (err) {
        console.error('[devServer] /api/quotes FAILED:', err);
        return res
          .status(500)
          .json({ error: err?.message || String(err) || 'Unknown error' });
      }
    }

    return res.status(404).json({ error: 'Not found' });
  } catch (err) {
    console.error('API_ERROR', err);
    return res.status(500).json({ error: err?.message || String(err) });
  }
}

const PORT = process.env.PORT || 3000;
createServer(handler).listen(PORT, () => {
  console.log(`API dev server on http://localhost:${PORT}
  → /api/quote?symbol=TCS.NS
  → /api/symbols?symbols=TCS,INFY,HCLTECH
  → /api/quotes?symbols=TCS,INFY,SBIN.NS,^NSEI`);
});

export default handler;
