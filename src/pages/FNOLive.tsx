import React, { useEffect, useState } from 'react';

// const SYMBOLS = 'AXISBANK.NS,BALKRISIND.NS,KPITTECH.NS,LICHSGFIN.NS'; // <-- your watchlist
const SYMBOLS = `AARTIIND,ABB,ABBOTINDIA,ABCAPITAL,ABFRL,ACC,ADANIENT,ADANIPORTS,ALKEM,AMARAJABAT,AMBUJACEM,APOLLOHOSP,APPLAPOLLO,ASHOKLEY,ASIANPAINT,ASTRAL,ATUL,AUBANK,AUROPHARMA,AXISBANK,BAJAJ-AUTO,BAJAFINSV,BAJFINANCE,BALKRISIND,BALRAMCHIN,BANDHANBNK,BANKBARODA,BATAINDIA,BEL,BHARATFORG,BHARTIARTL,BHEL,BIOCON,BLUESTARCO,BOSCHLTD,BPCL,BRITANNIA,BSE,CAMS,CANBK,CDSL,CESC,CGPOWER,CHOLAFIN,CIPLA,COALINDIA,COFORGE,COLPAL,CONCOR,CROMPTON,CUMMINSIND,CYIENT,DABUR,DALBHARAT,DELV,DIVISLAB,DIXON,DLF,DMART,DRREDDY,EICHERMOT,ETERNAL,EXIDEIND,FEDERALBNK,FORTIS,GAIL,GLENMARK,GMRAIRPORT,GODREJCP,GODREJPROP,GRANULES,GRASIM,HAL,HAVELLS,HCLTECH,HDFCBANK,HDFCAMC,HDFCLIFE,HEROMOTOCO,HFCL,HINDALCO,HINDPETRO,HINDUNILVR,HINDZINC,HUDCO,ICICIBANK,ICICIGI,ICICIPRULI,IDEA,IDFCFIRSTB,IEX,IGL,IIFL,INDHOTEL,INDIANB,INDIGO,INDUSINDBK,INDUSTOWER,INFY,INXWIND,IOC,IRB,IRCTC,IREDA,IRFC,ITC,JINDALSTEL,JIOFIN,JSL,JSWENERGY,JSWSTEEL,JUBLFOOD,KALYANKJIL,KAYNES,KEI,KFINTECH,KOTAKBANK,KPITTECH,LAURUSLABS,LICHSGFIN,LICI,LODHA,LT,LTF,LTIM,LUPIN,M&M,MANAPPURAM,MANKIND,MARICO,MARUTI,MAXHEALTH,MAZDOCK,MCX,MFSL,MOTHERSON,MPHASIS,MUTHOOTFIN,NALCO,NAUKRI,NBCC,NCC,NESTLEIND,NHPC,NMDC,NTPC,NUVAMA,NYKAA,OBEROIRLTY,OFSS,OIL,ONGC,PAGEIND,PATANJALI,PAYTM,PERSISTENT,PETRONET,PFC,PGEL,PHOENIXLTD,PIDILITIND,PIIND,PNB,PNBHOUSING,POLICYBZR,POLYCAB,POONAWALLA,POWERGRID,PPLPHARMA,PRESTIGE,RBLBANK,RECLTD,RELIANCE,RVNL,SAIL,SBICARD,SBILIFE,SBIN,SHREECEM,SHRIRAMFIN,SIEMENS,SJVN,SOLARINDS,SONACOMS,SRF,SUNPHARMA,SUPREMEIND,SUZLON,SYNGENE,TATACHEM,TATACONSUM,TATAELXSI,TATAMOTORS,TATAPOWER,TATASTEEL,TATATECH,TCS,TECHM,TIINDIA,TITAGARH,TITAN,TORNTPHARM,TORNTPOWER,TRENT,TVSMOTOR,ULTRACEMCO,UNIONBANK,UNITDSPR,UNOMINDA,UPL,VBL,VEDL,VOLTAS,WIPRO,YESBANK,ZYDUSLIFE,360ONE,BDL,DELHIVERY,ZOMATO,ADANIGREEN,ADANIENSOL,ATGL,`;

// use proxy in dev, absolute origin swap in sandbox preview if you still need that;
// for simplicity in dev just keep empty string:
const API_BASE = '';

type QuoteSnapshot = {
  symbol: string;
  regularMarketPrice: number | null;
  regularMarketChange: number | null;
  regularMarketChangePercent: number | null;
  regularMarketPreviousClose: number | null;
};

type Row = {
  symbol: string;
  // anchor (frozen baseline)
  A_LTP: number | null;
  A_Change: number;
  A_Percent: number;
  // live (current tick)
  LTP: number | null;
  Change: number;
  Percent: number;
};

const LS_KEY = 'fno_anchor_snapshot_v1';

function formatNum(n?: number | null) {
  return typeof n === 'number' && !isNaN(n) ? n.toFixed(2) : '—';
}

export default function FnoDashboard() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // We keep two snapshots in memory:
  // - anchorData: frozen baseline per symbol (from first load or localStorage)
  // - liveData: most recent fetch from /api/quotes
  const [anchorData, setAnchorData] = useState<Record<string, QuoteSnapshot>>(
    {},
  );
  const [sortField, setSortField] = useState<keyof Row | null>(null);
  const [ascending, setAscending] = useState(true);

  function toggleSort(field: keyof Row) {
    if (sortField === field) setAscending(!ascending);
    else {
      setSortField(field);
      setAscending(true);
    }
  }

  const sortedRows = React.useMemo(() => {
    if (!sortField) return rows;
    const sorted = [...rows].sort((a, b) => {
      const x = a[sortField] ?? 0;
      const y = b[sortField] ?? 0;
      return ascending ? x - y : y - x;
    });
    return sorted;
  }, [rows, sortField, ascending]);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);

        // 1. Try to restore anchorData from localStorage
        let anchorMap: Record<string, QuoteSnapshot> = {};
        const rawFromLS = window.localStorage.getItem(LS_KEY);
        if (rawFromLS) {
          try {
            anchorMap = JSON.parse(rawFromLS);
          } catch {
            // bad JSON in localStorage? ignore it
            anchorMap = {};
          }
        }

        // 2. Fetch live snapshot
        const res = await fetch(`${API_BASE}/api/quotes?symbols=${SYMBOLS}`);
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        const liveList: any[] = await res.json();

        // Convert liveList (array from backend) into map by symbol
        const liveMap: Record<string, QuoteSnapshot> = {};
        for (const q of liveList) {
          liveMap[q.symbol] = {
            symbol: q.symbol,
            regularMarketPrice: q.regularMarketPrice ?? null,
            regularMarketChange: q.regularMarketChange ?? null,
            regularMarketChangePercent: q.regularMarketChangePercent ?? null,
            regularMarketPreviousClose: q.regularMarketPreviousClose ?? null,
          };
        }

        // 3. If we DON'T have an anchor yet, set it using this live snapshot
        //    and persist it to localStorage.
        const hasAnchorAlready = Object.keys(anchorMap).length > 0;
        if (!hasAnchorAlready) {
          anchorMap = liveMap;
          window.localStorage.setItem(LS_KEY, JSON.stringify(anchorMap));
        }

        // put anchorMap in React state so future renders reuse it
        setAnchorData(anchorMap);

        // 4. Build the table rows using:
        //    - anchorMap for "A_*"
        //    - liveMap for current "LTP/Change/%"
        const mergedRows: Row[] = Object.keys(liveMap).map((sym) => {
          const live = liveMap[sym];
          const anchor = anchorMap[sym] ?? live; // fallback just in case

          // Anchor metrics:
          // We'll treat A_LTP as the anchor previous close (or the first seen price),
          // and A_Change / A_Percent as (currentPrice - anchorPrice)
          const anchorPrice =
            anchor.regularMarketPrice ??
            anchor.regularMarketPreviousClose ??
            null;
          const currentPrice = live.regularMarketPrice ?? null;
          let achg = 0;
          let apct = 0;

          if (anchorPrice != null && currentPrice != null) {
            achg = currentPrice - anchorPrice;
            apct = anchorPrice === 0 ? 0 : (achg / anchorPrice) * 100;
          }

          // Live metrics:
          const liveChange = live.regularMarketChange ?? 0;
          const livePct = live.regularMarketChangePercent ?? 0;

          return {
            symbol: sym,
            A_LTP: anchorPrice,
            A_Change: achg,
            A_Percent: apct,
            LTP: currentPrice,
            Change: liveChange,
            Percent: livePct,
          };
        });

        setRows(mergedRows);
      } catch (err: any) {
        console.error('FNO_FETCH_ERROR', err);
        setError(err.message || 'Failed to fetch');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // Quick buttons (optional): reset anchor manually / refresh live
  // You can add these later if you want:
  // - "Set New Anchor" => overwrite localStorage with current live
  // - "Refresh Live"   => refetch quotes without touching localStorage

  if (loading) return <p style={{ padding: 16 }}>Loading…</p>;
  if (error) return <p style={{ padding: 16, color: 'red' }}>{error}</p>;

  return (
    <div style={{ fontFamily: 'sans-serif', padding: 16 }}>
      <h2>📈 F&O Dashboard</h2>
      <div style={{ fontSize: 12, color: '#555', marginBottom: 8 }}>
        Anchor is saved in localStorage as <code>{LS_KEY}</code>. Refreshing the
        page keeps the same baseline unless you clear browser storage.
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f5f5f5', cursor: 'pointer' }}>
            <th style={{ textAlign: 'left' }}>Symbol</th>

            <th style={{ textAlign: 'right' }}>A_LTP</th>
            <th
              style={{ textAlign: 'right' }}
              onClick={() => toggleSort('A_Change')}
            >
              A_Change {sortField === 'A_Change' ? (ascending ? '▲' : '▼') : ''}
            </th>
            <th
              style={{ textAlign: 'right' }}
              onClick={() => toggleSort('A_Percent')}
            >
              A_% {sortField === 'A_Percent' ? (ascending ? '▲' : '▼') : ''}
            </th>

            <th style={{ textAlign: 'right' }}>LTP</th>
            <th
              style={{ textAlign: 'right' }}
              onClick={() => toggleSort('Change')}
            >
              Change {sortField === 'Change' ? (ascending ? '▲' : '▼') : ''}
            </th>
            <th
              style={{ textAlign: 'right' }}
              onClick={() => toggleSort('Percent')}
            >
              % {sortField === 'Percent' ? (ascending ? '▲' : '▼') : ''}
            </th>
          </tr>
        </thead>

        <tbody>
          {sortedRows.map((r) => {
            const anchorColor = r.A_Change >= 0 ? 'green' : 'red';
            const liveColor = r.Change >= 0 ? 'green' : 'red';
            return (
              <tr key={r.symbol}>
                <td style={{ textAlign: 'left' }}>{r.symbol}</td>
                <td style={{ textAlign: 'right' }}>{formatNum(r.A_LTP)}</td>
                <td style={{ textAlign: 'right', color: anchorColor }}>
                  {formatNum(r.A_Change)}
                </td>
                <td style={{ textAlign: 'right', color: anchorColor }}>
                  {formatNum(r.A_Percent)}%
                </td>
                <td style={{ textAlign: 'right' }}>{formatNum(r.LTP)}</td>
                <td style={{ textAlign: 'right', color: liveColor }}>
                  {formatNum(r.Change)}
                </td>
                <td style={{ textAlign: 'right', color: liveColor }}>
                  {formatNum(r.Percent)}%
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Debug / developer panel (optional) */}
      {/* <pre>{JSON.stringify(anchorData, null, 2)}</pre> */}
    </div>
  );
}
