// server.mjs
import { createServer } from 'node:http';
import { URL } from 'node:url';
import yahooFinance from 'yahoo-finance2';

/* ---------- polyfill res.status().json() when not provided ----------- */
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

/* ---------- time-window helper --------------------------------------- */
function getFromDate(monthsBack = 6) {
  const today = new Date();
  const from = new Date(today);
  from.setMonth(
    today.getMonth() - Number.isFinite(monthsBack) ? monthsBack : 6,
  );
  return { from, today };
}

/* ---------- common mapper (keeps your single/old shape) -------------- */
function mapRows(rows) {
  return rows.map((r) => ({
    date: r.date.toISOString().slice(0, 10),
    open: r.open,
    close: r.close,
    high: r.high,
    low: r.low,
    volume: r.volume,
    diff: r.close - r.open,
  }));
}

/* ---------- business logic: single symbol ---------------------------- */
async function fetchSingleSymbol(symbolRaw, months = 6) {
  // For single-symbol API: do NOT modify the ticker.
  // This preserves ability to use indices (^NSEI), custom suffixes (.NS/.BO), etc.
  const symbol = symbolRaw.trim();
  const { from, today } = getFromDate(months);

  const rows = await yahooFinance.historical(symbol, {
    period1: from,
    period2: today,
    interval: '1d',
  });

  return { symbol, table: mapRows(rows) };
}

/* ---------- business logic: multi symbols ---------------------------- */
function normalizeMultiSymbol(s) {
  const x = s.trim().toUpperCase();
  if (!x) return null;

  // If it already looks like an index or has a suffix, leave it.
  // But your contract says you'll pass *equities* without suffix for multi.
  if (x.startsWith('^') || x.includes('.')) return x;

  // Otherwise, treat as NSE equity and append .NS
  return `${x}.NS`;
}

async function fetchMultiSymbols(symbolsRaw, months = 6) {
  const symbols = symbolsRaw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .map(normalizeMultiSymbol)
    .filter(Boolean);

  const { from, today } = getFromDate(months);

  const tasks = symbols.map(async (symbol) => {
    console.log('KKK: ', symbol);
    try {
      const rows = await yahooFinance.historical(symbol, {
        period1: from,
        period2: today,
        interval: '1d',
      });
      return { status: 'ok', value: { symbol, table: mapRows(rows) } };
    } catch (err) {
      return { status: 'err', value: { symbol, error: err.message } };
    }
  });

  const settled = await Promise.all(tasks);
  const results = [];
  const errors = [];

  for (const t of settled) {
    if (t.status === 'ok') results.push(t.value);
    else errors.push(t.value);
  }
  return { count: results.length, results, errors };
}

/* ---------- unified handler (single port) ---------------------------- */
async function handler(req, res) {
  res = patch(res);
  const url = new URL(req.url, 'http://x'); // dummy base
  const pathname = url.pathname;

  try {
    // Single symbol: pass-through ticker (works for indices)
    if (pathname === '/api/quote') {
      const symbol = url.searchParams.get('symbol');
      if (!symbol)
        return res.status(400).json({ error: 'symbol parameter is required' });
      const months = parseInt(url.searchParams.get('months') || '6', 10);
      const payload = await fetchSingleSymbol(symbol, months);
      return res.status(200).json(payload);
    }

    // Multi symbol: auto-append .NS to bare tickers; keep indexes/suffixed as-is
    if (pathname === '/api/symbols') {
      const list = url.searchParams.get('symbols');
      console.log('JJ:', list);
      if (!list)
        return res.status(400).json({ error: 'symbols parameter is required' });
      const months = parseInt(url.searchParams.get('months') || '6', 10);
      const payload = await fetchMultiSymbols(list, months);
      return res.status(200).json(payload);
    }

    return res.status(404).json({ error: 'Not found' });
  } catch (err) {
    return res.status(500).json({ error: err.message || String(err) });
  }
}

/* ---------- export (Vercel) + local server --------------------------- */
export default function vercelHandler(req, res) {
  return handler(req, res);
}

if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 3000;
  createServer(handler).listen(PORT, () => {
    console.log(`▶︎ Wide API server
→ Single (index-friendly): http://localhost:${PORT}/api/quote?symbol=^NSEI
→ Single (equity):         http://localhost:${PORT}/api/quote?symbol=TCS.NS
→ Multi (auto .NS):        http://localhost:${PORT}/api/symbols?symbols=TCS,INFY,HCLTECH
(Use ?months=6|12|24 to change lookback)`);
  });
}
