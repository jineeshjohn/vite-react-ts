import { useState } from 'react';

/**
 * props.table = [
 *   { date: '2025-05-30', open: 175.23, close: 176.40, diff: 1.17 },
 *   { date: '2025-05-29', open: 172.80, close: 171.10, diff: -1.70 },
 * ]
 */
export default function Trends({ table }) {
  const [ascending, setAscending] = useState(false);

  // sort by date or diff depending on clicked column
  const [sortField, setSortField] = useState('date');

  const sorted = [...table].sort((a, b) => {
    let x = a[sortField];
    let y = b[sortField];
    if (sortField === 'date') {
      x = Date.parse(x);
      y = Date.parse(y);
    }
    return ascending ? x - y : y - x;
  });

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
          >
            Δ Close-Open{caret('diff')}
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
          </tr>
        ))}
      </tbody>
    </table>
  );
}
