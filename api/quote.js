import { fetchSingleSymbol } from './_shared.js';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  const url = new URL(req.url || '/api/quote', `https://${req.headers.host || 'localhost'}`);

  try {
    const symbol = url.searchParams.get('symbol');
    const months = parseInt(url.searchParams.get('months') || '6', 10);
    if (!symbol) return res.status(400).json({ error: 'symbol parameter is required' });

    const payload = await fetchSingleSymbol(symbol, months);
    return res.status(200).json(payload);
  } catch (err) {
    console.error('QUOTE_ERROR', err);
    return res.status(500).json({ error: err?.message || String(err) });
  }
}
