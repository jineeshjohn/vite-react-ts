import React, { useState } from 'react';
import { useQuote } from '../hooks/useQuote';
import QuoteTable from './QuoteTable'; // adjust path if needed

export default function QuoteCard() {
  const [input, setInput] = useState('');
  const [symbol, setSymbol] = useState('');
  const { data, loading, error } = useQuote(symbol);

  /* ---------- helpers ---------- */
  const fmt = (n?: number) =>
    n !== undefined && n !== null ? n.toFixed(2) : '—';

  return (
    <div
      style={{ maxWidth: 750, margin: '1rem auto', fontFamily: 'sans-serif', textAlign: 'left' }}
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

      {data && data.table && <QuoteTable table={data.table} />}
    </div>
  );
}
