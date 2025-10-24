// scripts/devServer.mjs
import { createServer } from 'node:http';
import { URL } from 'node:url';
import { fetchSingleSymbol, fetchMultiSymbols } from '../api/_shared.js'; // ✅ reuse

function patch(res) {
  if (typeof res.status === 'function' && typeof res.json === 'function') return res;
  res.status = (code) => { res.writeHead(code, { 'Content-Type': 'application/json' }); return res; };
  res.json = (obj) => res.end(JSON.stringify(obj));
  return res;
}

async function handler(req, res) {
  res = patch(res);
  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);

  try {
    if (url.pathname === '/api/quote') {
      const symbol = url.searchParams.get('symbol');
      const months = parseInt(url.searchParams.get('months') || '6', 10);
      if (!symbol) return res.status(400).json({ error: 'symbol parameter is required' });
      const payload = await fetchSingleSymbol(symbol, months); // ✅ shared
      return res.status(200).json(payload);
    }

    if (url.pathname === '/api/symbols') {
      const list = url.searchParams.get('symbols');
      const months = parseInt(url.searchParams.get('months') || '6', 10);
      if (!list) return res.status(400).json({ error: 'symbols parameter is required' });
      const payload = await fetchMultiSymbols(list, months);   // ✅ shared
      return res.status(200).json(payload);
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
  → /api/symbols?symbols=TCS,INFY,HCLTECH`);
});

export default handler;
