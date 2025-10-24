import { useState, useMemo } from 'react';

export default function Trends({ table }) {
  const [ascending, setAscending] = useState(false);
  const [sortField, setSortField] = useState('date'); // default by date (desc)

  // 1) Build prevDiff using chronological order (oldest -> newest)
  const augmented = useMemo(() => {
    const chrono = [...table].sort(
      (a, b) => Date.parse(a.date) - Date.parse(b.date)
    );

    // Map: date -> (today.close - previous.close)
    const prevDiffByDate = new Map();
    for (let i = 1; i < chrono.length; i++) {
      const prev = chrono[i - 1];
      const cur = chrono[i];
      prevDiffByDate.set(cur.date, cur.close - prev.close);
    }

    // Attach prevDiff to original rows by date
    return table.map((r) => ({
      ...r,
      prevDiff: prevDiffByDate.get(r.date) ?? null,
    }));
  }, [table]);

  // 2) Sort for display (by date, diff, or prevDiff)
  const sorted = useMemo(() => {
    return [...augmented].sort((a, b) => {
      let x = a[sortField];
      let y = b[sortField];
      if (sortField === 'date') {
        x = Date.parse(a.date);
        y = Date.parse(b.date);
      }
      // put nulls (e.g., oldest row's prevDiff) at the end consistently
      if (x == null && y != null) return 1;
      if (x != null && y == null) return -1;
      return ascending ? x - y : y - x;
    });
  }, [augmented, sortField, ascending]);

  function toggle(field) {
    if (field === sortField) setAscending(!ascending);
    else {
      setSortField(field);
      setAscending(false);
    }
  }

  const caret = (field) => (sortField !== field ? '' : ascending ? ' ▲' : ' ▼');

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 12 }}>
      <thead style={{ cursor: 'pointer' }}>
        <tr>
          <th onClick={() => toggle('date')}>Date{caret('date')}</th>
          <th
            onClick={() => toggle('diff')}
            style={{ width: '1%', whiteSpace: 'nowrap', textAlign: 'right' }}
            title="Close - Open"
          >
            C-O{caret('diff')}
          </th>
          <th
            onClick={() => toggle('prevDiff')}
            style={{ width: '1%', whiteSpace: 'nowrap', textAlign: 'right' }}
            title="Today's Close - Previous Close"
          >
            C-PC{caret('prevDiff')}
          </th>
        </tr>
      </thead>
      <tbody>
        {sorted.map((row) => (
          <tr key={row.date}>
            <td>{row.date}</td>
            <td
              style={{
                width: '1%',
                whiteSpace: 'nowrap',
                textAlign: 'right',
                color: row.diff >= 0 ? 'green' : 'crimson',
              }}
            >
              {row.diff.toFixed(2)}
            </td>
            <td
              style={{
                width: '1%',
                whiteSpace: 'nowrap',
                textAlign: 'right',
                color:
                  row.prevDiff == null ? '#999' : row.prevDiff >= 0 ? 'green' : 'crimson',
              }}
            >
              {row.prevDiff == null ? '—' : row.prevDiff.toFixed(2)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
