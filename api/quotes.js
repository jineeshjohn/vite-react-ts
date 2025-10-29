// api/quotes.js
import { fetchLiveQuotes } from './_shared.js';

export default async function handler(req, res) {
  try {
    const url = new URL(
      req.url || '/api/quotes',
      `http://${req.headers?.host || 'localhost:3000'}`,
    );

    const rawList = url.searchParams.get('symbols');
    if (!rawList) {
      return res.status(400).json({ error: 'symbols query required' });
    }

    const snapshot = await fetchLiveQuotes(rawList);

    res.setHeader?.('Access-Control-Allow-Origin', '*');
    res.setHeader?.('Cache-Control', 'no-store');

    return res.status(200).json(snapshot);
  } catch (err) {
    console.error('QUOTES_ERROR', err);
    return res
      .status(500)
      .json({ error: err?.message || String(err) || 'Unknown error' });
  }
}
