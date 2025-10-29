// api/_shared.js
import yahooFinance from 'yahoo-finance2';

export function mapRows(rows) {
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

export function getFromDate(monthsBack = 6) {
  const today = new Date();
  const from = new Date(today);
  from.setMonth(
    today.getMonth() - (Number.isFinite(monthsBack) ? monthsBack : 6),
  );
  return { from, today };
}

export async function fetchSingleSymbol(symbolRaw, months = 6) {
  const symbol = symbolRaw.trim();
  const { from, today } = getFromDate(months);
  const rows = await yahooFinance.historical(symbol, {
    period1: from,
    period2: today,
    interval: '1d',
  });
  return { symbol, table: mapRows(rows) };
}

function normalizeMultiSymbol(s) {
  const x = s.trim().toUpperCase();
  if (!x) return null;
  if (x.startsWith('^') || x.includes('.')) return x;
  return `${x}.NS`;
}

export async function fetchMultiSymbols(list, months = 6) {
  const { from, today } = getFromDate(months);
  const symbols = list
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .map(normalizeMultiSymbol)
    .filter(Boolean);

  const settled = await Promise.allSettled(
    symbols.map(async (symbol) => {
      const rows = await yahooFinance.historical(symbol, {
        period1: from,
        period2: today,
        interval: '1d',
      });
      return { symbol, table: mapRows(rows) };
    }),
  );

  const results = [],
    errors = [];
  for (const s of settled) {
    if (s.status === 'fulfilled') results.push(s.value);
    else errors.push({ error: s.reason?.message || 'fetch failed' });
  }
  return { count: results.length, results, errors };
}

// ...keep your existing exports...

// normalize bare tickers like TCS -> TCS.NS (reuse your logic)
function normalizeInstantSymbol(symbol) {
  const x = symbol.trim().toUpperCase();
  if (!x) return null;
  if (x.startsWith('^') || x.includes('.')) return x;
  return `${x}.NS`;
}

// Fetch a "snapshot" (LTP etc.) for multiple symbols using yahoo-finance2
export async function fetchLiveQuotes(listCSV) {
  // normalize/clean the list
  const symbols = listCSV
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .map(normalizeInstantSymbol)
    .filter(Boolean);

  // yahoo-finance2 has a `quote` method that can take an array of tickers
  // and returns an array of quote objects
  const quotes = await yahooFinance.quote(symbols);

  // We return these raw. Your React code expects fields like:
  //   regularMarketPrice
  //   regularMarketChange
  //   regularMarketChangePercent
  //   regularMarketPreviousClose
  //   symbol
  return quotes;
}
