import React, { useState } from 'react';
import { useQuote } from '../hooks/useQuote';

export default function QuoteCard() {
  const [input, setInput] = useState('');
  const [symbol, setSymbol] = useState('');
  const { data, loading, error } = useQuote(symbol);

  /* ---------- helpers ---------- */
  const fmt = (n?: number) =>
    n !== undefined && n !== null ? n.toFixed(2) : '—';

  return (
    <div
      style={{ maxWidth: 480, margin: '1rem auto', fontFamily: 'sans-serif' }}
    >
      <h2>Yahoo Quote Fetcher</h2>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          setSymbol(input.trim().toUpperCase());
        }}
      >
        <input
          value={input}
          placeholder="e.g. AAPL"
          onChange={(e) => setInput(e.target.value)}
          style={{ padding: '.4rem .6rem', fontSize: '1rem' }}
        />
        <button type="submit" style={{ marginLeft: 8 }}>
          Go
        </button>
      </form>

      {loading && <p>Loading…</p>}
      {error && <p style={{ color: 'crimson' }}>{error}</p>}

      {data && (
        <table
          style={{ marginTop: 16, width: '100%', borderCollapse: 'collapse' }}
        >
          <tbody>
            <tr>
              <td>Price</td>
              <td>
                {data.regularMarketPrice ?? '—'} {data.currency ?? ''}
              </td>
            </tr>
            <tr>
              <td>Day high</td>
              <td>{data.regularMarketDayHigh ?? '—'}</td>
            </tr>
            <tr>
              <td>Day low</td>
              <td>{data.regularMarketDayLow ?? '—'}</td>
            </tr>
            <tr>
              <td>Change %</td>
              <td
                style={{
                  color:
                    (data.regularMarketChangePercent ?? 0) >= 0
                      ? 'green'
                      : 'crimson',
                }}
              >
                {fmt(data.regularMarketChangePercent)}%
              </td>
            </tr>
          </tbody>
        </table>
      )}
    </div>
  );
}
