import React, { useState } from 'react';
import TrendsTable from './TrendsTable'; // two-column (Date, Δ Close-Open)

export default function MultiQuoteCard() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [results, setResults] = useState([]); // [{ symbol, table }]
  const [warnings, setWarnings] = useState([]); // [{ symbol, error }]

  async function fetchMulti(listCsv) {
    setLoading(true);
    setError('');
    setResults([]);
    setWarnings([]);

    const cleaned = listCsv
      .split(',')
      .map((s) => s.trim().toUpperCase())
      .filter(Boolean)
      .join(',');

    if (!cleaned || !cleaned.includes(',')) {
      setLoading(false);
      setError('Enter 2+ symbols, comma-separated. Example: TCS,INFY,HCLTECH');
      return;
    }

    try {
      const res = await fetch(
        `/api/symbols?symbols=${encodeURIComponent(cleaned)}`,
      );
      if (!res.ok) throw new Error(`Fetch failed (${res.status})`);
      const json = await res.json(); // { count, results: [{symbol, table}], errors: [...] }
      setResults(Array.isArray(json.results) ? json.results : []);
      setWarnings(Array.isArray(json.errors) ? json.errors : []);
    } catch (e) {
      setError(e.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        maxWidth: '100%',
        margin: '1rem auto',
        fontFamily: 'sans-serif',
        textAlign: 'left',
      }}
    >
      <h2>Yahoo Multi Quote (NSE equities)</h2>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          fetchMulti(input);
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Example: TCS,INFY,HCLTECH"
          style={{ padding: '.4rem .6rem', fontSize: '1rem', width: 520 }}
        />
        <button type="submit" style={{ marginLeft: 8 }}>
          Go
        </button>
      </form>

      <p style={{ marginTop: 8, color: '#666' }}>
        Tip: Enter <em>bare</em> tickers; the API will add <code>.NS</code>.
      </p>

      {loading && <p>Loading…</p>}
      {error && <p style={{ color: 'crimson' }}>{error}</p>}

      {warnings.length > 0 && (
        <div style={{ color: '#a00', margin: '8px 0' }}>
          <strong>Warnings:</strong>{' '}
          {warnings.map((w, i) => (
            <span key={i} style={{ display: 'inline-block', marginRight: 8 }}>
              {w.symbol ? `${w.symbol}: ` : ''}
              {w.error || 'Error'}
            </span>
          ))}
        </div>
      )}

      {results.length > 0 ? (
        // 🔥 SINGLE-ROW, NO WRAP
        <div
          style={{
            /* single-row grid: one column per result */
            display: 'grid',
            gridAutoFlow: 'column',
            gridAutoColumns: 'minmax(260px, 1fr)', // each card gets at least 260px
            gap: 16,
            marginTop: 12,

            /* allow horizontal scroll if too many symbols to fit */
            overflowX: 'auto',
            paddingBottom: 8,
          }}
        >
          {results.map(({ symbol, table }) => (
            <div
              key={symbol}
              style={{
                border: '1px solid #eee',
                borderRadius: 8,
                padding: 12,
                minWidth: 260, // keeps each card readable
              }}
            >
              <div style={{ fontWeight: 600, marginBottom: 8 }}>{symbol}</div>
              <TrendsTable table={table} />
            </div>
          ))}
        </div>
      ) : (
        !loading && !error && <p style={{ marginTop: 12 }}>No results yet.</p>
      )}
    </div>
  );
}
