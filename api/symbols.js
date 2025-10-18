import { fetchMultiSymbols } from './_shared.js';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  const url = new URL(req.url || '/api/symbols', `https://${req.headers.host || 'localhost'}`);

  try {
    const list = url.searchParams.get('symbols');
    const months = parseInt(url.searchParams.get('months') || '6', 10);
    if (!list) return res.status(400).json({ error: 'symbols parameter is required' });

    const payload = await fetchMultiSymbols(list, months);
    return res.status(200).json(payload);
  } catch (err) {
    console.error('SYMBOLS_ERROR', err);
    return res.status(500).json({ error: err?.message || String(err) });
  }
}
