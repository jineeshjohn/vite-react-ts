import { useMemo, useState } from 'react';

export default function QuoteTable({ table }) {
  const [sortField, setSortField] = useState('date');
  const [ascending, setAscending] = useState(false);
  const [highlightMode, setHighlightMode] = useState('gap'); // 'gap' | 'week' | 'month'

  // ---- build derived fields (chronological: oldest → newest) ----
  const augmented = useMemo(() => {
    if (!Array.isArray(table)) return [];
    const byDateAsc = [...table].sort(
      (a, b) => Date.parse(a.date) - Date.parse(b.date),
    );
    return byDateAsc.map((row, i) => {
      const prevClose = i > 0 ? byDateAsc[i - 1].close : null;
      const gapUp =
        prevClose != null && row.open != null ? row.open - prevClose : null;
      const openMinusLow =
        row.open != null && row.low != null ? row.open - row.low : null;
      const openMinusHigh =
        row.open != null && row.high != null ? row.open - row.high : null;
      const closeMinusOpen =
        row.close != null && row.open != null ? row.close - row.open : null; // NEW
      return {
        ...row,
        prevClose,
        gapUp,
        openMinusLow,
        openMinusHigh,
        closeMinusOpen,
      };
    });
  }, [table]);

  // ---- sorting (dates as timestamps) ----
  const sorted = useMemo(() => {
    const arr = [...augmented];
    arr.sort((a, b) => {
      let x = a[sortField],
        y = b[sortField];
      if (sortField === 'date') {
        x = Date.parse(x);
        y = Date.parse(y);
      }
      if (x == null) x = Number.NEGATIVE_INFINITY;
      if (y == null) y = Number.NEGATIVE_INFINITY;
      return ascending ? x - y : y - x;
    });
    return arr;
  }, [augmented, sortField, ascending]);

  const toggle = (field) => {
    if (field === sortField) setAscending(!ascending);
    else {
      setSortField(field);
      setAscending(false);
    }
  };
  const caret = (field) => (sortField !== field ? '' : ascending ? ' ▲' : ' ▼');
  const fmt = (n) => (n == null ? '—' : Number(n).toFixed(2));

  // ---- fixed header + borders ----
  const BORDER = '1px solid #d0d7de';
  const PAD = '6px 8px';
  const thStyle = {
    border: BORDER,
    padding: PAD,
    background: '#f8f9fb',
    cursor: 'pointer',
    textAlign: 'left',
    position: 'sticky',
    top: 0,
    zIndex: 1, // sticky header
  };
  const tdText = { border: BORDER, padding: PAD, textAlign: 'left' };
  const tdNum = { border: BORDER, padding: PAD, textAlign: 'right' };

  // ---- highlight helpers ----
  const HILITE = '#cfdeed'; // requested color

  function isoWeekIndex(iso) {
    const d = new Date(iso + 'T00:00:00Z');
    const utc = new Date(
      Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()),
    );
    const day = utc.getUTCDay() || 7; // Mon=1..Sun=7
    utc.setUTCDate(utc.getUTCDate() + 4 - day);
    const yearStart = new Date(Date.UTC(utc.getUTCFullYear(), 0, 1));
    const week = Math.ceil(((utc - yearStart) / 86400000 + 1) / 7);
    return utc.getUTCFullYear() * 53 + week; // running index
  }
  function monthIndex(iso) {
    const [y, m] = iso.split('-').map(Number);
    return y * 12 + (m - 1);
  }
  function rowBg(row) {
    if (highlightMode === 'gap') {
      return row.gapUp > 0 ? '#c1e2c1' : '#efdddd'; // your original colors
    }
    if (highlightMode === 'week') {
      const even = isoWeekIndex(row.date) % 2 === 0;
      return even ? HILITE : 'transparent'; // use #cfdeed for weeks
    }
    if (highlightMode === 'month') {
      const even = monthIndex(row.date) % 2 === 0;
      return even ? HILITE : 'transparent'; // use #cfdeed for months
    }
    return undefined;
  }

  const btn = (active) => ({
    padding: '6px 10px',
    border: '1px solid #d0d7de',
    borderRadius: 6,
    background: active ? '#e7f1ff' : '#fff',
    fontSize: 13,
    marginRight: 8,
    cursor: 'pointer',
  });

  return (
    <>
      {/* highlight controls */}
      <div
        style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 8 }}
      >
        <button
          style={btn(highlightMode === 'gap')}
          onClick={() => setHighlightMode('gap')}
        >
          Gap highlight
        </button>
        <button
          style={btn(highlightMode === 'week')}
          onClick={() => setHighlightMode('week')}
        >
          Highlight weekdays
        </button>
        <button
          style={btn(highlightMode === 'month')}
          onClick={() => setHighlightMode('month')}
        >
          Highlight monthdays
        </button>
      </div>

      {/* scroll container so only rows scroll */}
      <div style={{ maxHeight: '100vh', marginTop: 12 }}>
        <table style={{ width: '100%' }}>
          <thead>
            <tr>
              <th style={thStyle} onClick={() => toggle('serial')}>
                #
              </th>{' '}
              {/* NEW serial header (not sortable by value) */}
              <th style={thStyle} onClick={() => toggle('date')}>
                Datecolumn{caret('date')}
              </th>
              <th style={thStyle} onClick={() => toggle('high')}>
                High{caret('high')}
              </th>
              <th style={thStyle} onClick={() => toggle('volume')}>
                Volume{caret('volume')}
              </th>
              <th style={thStyle} onClick={() => toggle('open')}>
                Open{caret('open')}
              </th>
              <th style={thStyle} onClick={() => toggle('low')}>
                Low{caret('low')}
              </th>
              <th style={thStyle} onClick={() => toggle('close')}>
                Close{caret('close')}
              </th>
              <th style={thStyle} onClick={() => toggle('prevClose')}>
                Prev&nbsp;Close{caret('prevClose')}
              </th>
              <th style={thStyle} onClick={() => toggle('gapUp')}>
                Gap (open−prevClose){caret('gapUp')}
              </th>
              <th style={thStyle} onClick={() => toggle('openMinusLow')}>
                Open−Low{caret('openMinusLow')}
              </th>
              <th style={thStyle} onClick={() => toggle('openMinusHigh')}>
                Open−High{caret('openMinusHigh')}
              </th>
              <th style={thStyle} onClick={() => toggle('closeMinusOpen')}>
                Close−Open{caret('closeMinusOpen')}
              </th>{' '}
              {/* NEW */}
            </tr>
          </thead>
          <tbody>
            {sorted.map((row, idx) => (
              <tr
                key={row.date}
                style={{ backgroundColor: rowBg(row) }}
                title={
                  highlightMode === 'gap'
                    ? row.gapUp > 0
                      ? 'Gap up'
                      : row.gapUp < 0
                      ? 'Gap down'
                      : undefined
                    : undefined
                }
              >
                <td style={{ ...tdNum, width: 56 }}>{idx + 1}</td>{' '}
                {/* Serial # */}
                <td style={tdText}>{row.date}</td>
                <td style={tdNum}>{fmt(row.high)}</td>
                <td style={tdNum}>{row.volumn == null ? '—-j' : row.volumn}</td>
                <td style={tdNum}>{fmt(row.open)}</td>
                <td style={tdNum}>{fmt(row.low)}</td>
                <td style={tdNum}>{fmt(row.close)}</td>
                <td style={tdNum}>{fmt(row.prevClose)}</td>
                <td
                  style={{
                    ...tdNum,
                    color:
                      row.gapUp == null
                        ? undefined
                        : row.gapUp > 0
                        ? 'green'
                        : 'crimson',
                  }}
                >
                  {row.gapUp == null ? '—' : row.gapUp.toFixed(2)}
                </td>
                <td
                  style={{
                    ...tdNum,
                    color:
                      row.openMinusLow == null
                        ? undefined
                        : row.openMinusLow > 0
                        ? 'crimson'
                        : undefined,
                  }}
                >
                  {row.openMinusLow == null ? '—' : row.openMinusLow.toFixed(2)}
                </td>
                <td
                  style={{
                    ...tdNum,
                    color:
                      row.openMinusHigh == null
                        ? undefined
                        : row.openMinusHigh < 0
                        ? 'green'
                        : 'crimson',
                  }}
                >
                  {row.openMinusHigh == null
                    ? '—'
                    : row.openMinusHigh.toFixed(2)}
                </td>
                <td style={tdNum}>
                  {row.closeMinusOpen == null
                    ? '—'
                    : row.closeMinusOpen.toFixed(2)}
                </td>{' '}
                {/* NEW */}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
