import { useMemo, useState } from 'react';

export default function QuoteTable({ table }) {
  const [sortField, setSortField] = useState('date');
  const [ascending, setAscending] = useState(false);

  // Build prevClose, gapUp, Open−Low, Open−High using true chronological order
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
      return { ...row, prevClose, gapUp, openMinusLow, openMinusHigh };
    });
  }, [table]);

  // Sorting (dates as timestamps)
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

  // ---- minimal, consistent borders for all cells ----
  const BORDER = '1px solid #d0d7de'; // subtle gray
  const PAD = '6px 8px';
  const thStyle = {
    border: BORDER,
    padding: PAD,
    background: '#f8f9fb',
    cursor: 'pointer',
    textAlign: 'left',
  };
  const tdText = { border: BORDER, padding: PAD, textAlign: 'left' };
  const tdNum = { border: BORDER, padding: PAD, textAlign: 'right' };

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 12 }}>
      <thead>
        <tr>
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
        </tr>
      </thead>
      <tbody>
        {sorted.map((row) => (
          <tr
            key={row.date}
            style={{
              backgroundColor: row.gapUp > 0 ? '#c1e2c1' : '#efdddd',
            }}
            title={
              row.gapUp > 0 ? 'Gap up' : row.gapUp < 0 ? 'Gap down' : undefined
            }
          >
            <td style={tdText}>{row.date}</td>
            <td style={tdNum}>{fmt(row.high)}</td>
            <td style={tdNum}>
              {row.volume == null ? '—' : Number(row.volume).toLocaleString()}
            </td>
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
              {row.openMinusHigh == null ? '—' : row.openMinusHigh.toFixed(2)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
