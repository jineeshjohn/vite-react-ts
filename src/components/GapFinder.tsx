import { useState } from 'react';
import { useQuote } from '../hooks/useQuote';

/**
 * props.table = [
 *   { date: '2025-05-30', open:  175.23, close: 176.40, diff:  1.17 },
 *   { date: '2025-05-29', open:  172.80, close: 171.10, diff: -1.70 },
 *   …
 * ]
 */
function GapFinderTable({ table }) {
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 12 }}>
      <thead style={{ cursor: 'pointer' }}>
        <tr>
          <th>Date</th>
          <th>Open </th>
          <th>Close </th>
          <th>Δ Close-Open </th>
        </tr>
      </thead>
      <tbody>
        {table.map((row) => (
          <tr key={row.date}>
            <td>{row.date}</td>
            <td style={{ textAlign: 'right' }}>{row.open.toFixed(2)}</td>
            <td style={{ textAlign: 'right' }}>{row.close.toFixed(2)}</td>
            <td
              style={{
                textAlign: 'right',
                color: row.diff >= 0 ? 'green' : 'crimson',
              }}
            >
              {row.diff.toFixed(2)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
export default function GapFinderCard() {
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
      <h2>Yahoo Quote Fetcher - GAPS</h2>

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

      {data && data.table && <QuoteTable table={data.table} />}
    </div>
  );
}
