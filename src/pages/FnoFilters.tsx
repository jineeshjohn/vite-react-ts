import React, { useMemo, useState } from 'react';

/* ---------- Default Symbol Lists ---------- */
const DEFAULT_LIST_ONE = `SILVERBEES, TATSILV, TATAGOLD, GOLDBEES, SILVERCASE, ADANIPOWER, SILVERIETF, DHARAN, HDFCSILVER, GOLDCASE, SETFGOLD, HDFCGOLD, HINDZINC, SAMMAANCAP, GOLDIETF, FEDERALBNK, STALLION, SILVER, SILVERETF, SCI, SBISILVER, LIQUIDCASE, GOLD1, SONACOMS, WAAREERTL, LANDMARK, SUBEXLTD, TAKE, INOXGREEN, AXISILVER, TATAPOWER, SGFIN, SILVER1, AXISGOLD, SHRIRAMFIN, MTARTECH, GOLDETF, GROWWSLVR, NAVKARCORP, ORCHASP, GANGAFORGE, GMBREW, M&MFIN, HBLENGINE, ANGELONE, MOGOLD, PFOCUS, MAPMYINDIA, AONEGOLD, CUPID, WAAREEENER, ATHERENERG, AUBANK, THOMASCOOK, MCX, SILVERAG, SILVERADD, IIFLCAPS, ARSSBL, DREAMFOLKS,`;
const DEFAULT_LIST_TWO = `AARTIIND,ABB,ABBOTINDIA,ABCAPITAL,ABFRL,ACC,ADANIENT,ADANIPORTS,ALKEM,AMARAJABAT,AMBUJACEM,APOLLOHOSP,APPLAPOLLO,ASHOKLEY,ASIANPAINT,ASTRAL,ATUL,AUBANK,AUROPHARMA,AXISBANK,BAJAJ-AUTO,BAJAFINSV,BAJFINANCE,BALKRISIND,BALRAMCHIN,BANDHANBNK,BANKBARODA,BATAINDIA,BEL,BHARATFORG,BHARTIARTL,BHEL,BIOCON,BLUESTARCO,BOSCHLTD,BPCL,BRITANNIA,BSE,CAMS,CANBK,CDSL,CESC,CGPOWER,CHOLAFIN,CIPLA,COALINDIA,COFORGE,COLPAL,CONCOR,CROMPTON,CUMMINSIND,CYIENT,DABUR,DALBHARAT,DELV,DIVISLAB,DIXON,DLF,DMART,DRREDDY,EICHERMOT,ETERNAL,EXIDEIND,FEDERALBNK,FORTIS,GAIL,GLENMARK,GMRAIRPORT,GODREJCP,GODREJPROP,GRANULES,GRASIM,HAL,HAVELLS,HCLTECH,HDFCBANK,HDFCAMC,HDFCLIFE,HEROMOTOCO,HFCL,HINDALCO,HINDPETRO,HINDUNILVR,HINDZINC,HUDCO,ICICIBANK,ICICIGI,ICICIPRULI,IDEA,IDFCFIRSTB,IEX,IGL,IIFL,INDHOTEL,INDIANB,INDIGO,INDUSINDBK,INDUSTOWER,INFY,INXWIND,IOC,IRB,IRCTC,IREDA,IRFC,ITC,JINDALSTEL,JIOFIN,JSL,JSWENERGY,JSWSTEEL,JUBLFOOD,KALYANKJIL,KAYNES,KEI,KFINTECH,KOTAKBANK,KPITTECH,LAURUSLABS,LICHSGFIN,LICI,LODHA,LT,LTF,LTIM,LUPIN,M&M,MANAPPURAM,MANKIND,MARICO,MARUTI,MAXHEALTH,MAZDOCK,MCX,MFSL,MOTHERSON,MPHASIS,MUTHOOTFIN,NALCO,NAUKRI,NBCC,NCC,NESTLEIND,NHPC,NMDC,NTPC,NUVAMA,NYKAA,OBEROIRLTY,OFSS,OIL,ONGC,PAGEIND,PATANJALI,PAYTM,PERSISTENT,PETRONET,PFC,PGEL,PHOENIXLTD,PIDILITIND,PIIND,PNB,PNBHOUSING,POLICYBZR,POLYCAB,POONAWALLA,POWERGRID,PPLPHARMA,PRESTIGE,RBLBANK,RECLTD,RELIANCE,RVNL,SAIL,SBICARD,SBILIFE,SBIN,SHREECEM,SHRIRAMFIN,SIEMENS,SJVN,SOLARINDS,SONACOMS,SRF,SUNPHARMA,SUPREMEIND,SUZLON,SYNGENE,TATACHEM,TATACONSUM,TATAELXSI,TATAMOTORS,TATAPOWER,TATASTEEL,TATATECH,TCS,TECHM,TIINDIA,TITAGARH,TITAN,TORNTPHARM,TORNTPOWER,TRENT,TVSMOTOR,ULTRACEMCO,UNIONBANK,UNITDSPR,UNOMINDA,UPL,VBL,VEDL,VOLTAS,WIPRO,YESBANK,ZYDUSLIFE,360ONE,BDL,DELHIVERY,ZOMATO,ADANIGREEN,ADANIENSOL,ATGL`;

/* ---------- Helpers ---------- */
function parseSymbols(text: string): string[] {
  const raw = text
    .split(/[\n,]+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => s.toUpperCase());

  const seen = new Set<string>();
  const unique: string[] = [];
  for (const s of raw) {
    if (!seen.has(s)) {
      seen.add(s);
      unique.push(s);
    }
  }
  return unique;
}

function intersect(aArr: string[], bArr: string[]): string[] {
  const bSet = new Set(bArr);
  return aArr.filter((x) => bSet.has(x));
}

/* ---------- Main Component ---------- */
const FnoFilters: React.FC = () => {
  const [list1, setList1] = useState<string>(DEFAULT_LIST_ONE);
  const DEFAULT_LIST_TWO_FORMATED = DEFAULT_LIST_TWO.split(',').join(',\n');
  const [list2, setList2] = useState<string>(DEFAULT_LIST_TWO_FORMATED);

  const results = useMemo(() => {
    const a = parseSymbols(list1);
    const b = parseSymbols(list2);
    return intersect(a, b);
  }, [list1, list2]);

  const copyResults = async () => {
    const text = results.join(',\n');
    try {
      await navigator.clipboard.writeText(text);
      alert('Results copied to clipboard.');
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      alert('Results copied to clipboard.');
    }
  };

  const clearAll = () => {
    setList1('');
    setList2('');
  };

  /* ---------- Styles ---------- */
  const styles = {
    page: {
      fontFamily:
        'system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif',
      margin: 24,
      lineHeight: 1.4,
    },
    h1: { fontSize: '1.25rem', margin: '0 0 16px' },
    grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
    ta: {
      width: '100%',
      height: 260,
      padding: 10,
      border: '1px solid #ccc',
      borderRadius: 8,
      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
    },
    actions: {
      display: 'flex',
      gap: 8,
      alignItems: 'center',
      margin: '16px 0',
      flexWrap: 'wrap',
    },
    btn: {
      padding: '10px 14px',
      border: '1px solid #999',
      borderRadius: 8,
      background: '#f6f6f6',
      cursor: 'pointer',
    },
    result: {
      padding: 12,
      background: '#fafafa',
      border: '1px solid #ddd',
      borderRadius: 8,
    },
    small: { color: '#666', fontSize: '.9em' },
    code: { background: '#f0f0f0', padding: '2px 6px', borderRadius: 4 },
    pre: { whiteSpace: 'pre-wrap', margin: '8px 0 0' },
    count: { fontWeight: 600 },
  } as const;

  return (
    <div style={styles.page}>
      <h1 style={styles.h1}>F&amp;O Intersection Checker</h1>

      <div style={styles.grid}>
        <div>
          <label htmlFor="list1">
            <strong>Input One</strong> (comma or newline separated)
          </label>
          <textarea
            id="list1"
            placeholder="Paste symbols like: SILVERBEES, TATSILV, ..."
            value={list1}
            onChange={(e) => setList1(e.target.value)}
            style={styles.ta}
          />
        </div>

        <div>
          <label htmlFor="list2">
            <strong>Input Two (F&amp;O stocks)</strong> (comma or newline
            separated)
          </label>
          <textarea
            id="list2"
            placeholder="Paste F&amp;O symbols (one per line is fine)"
            value={list2}
            onChange={(e) => setList2(e.target.value)}
            style={styles.ta}
          />
        </div>
      </div>

      <div style={styles.actions}>
        <button type="button" onClick={copyResults} style={styles.btn}>
          Copy Results
        </button>
        <button type="button" onClick={clearAll} style={styles.btn}>
          Clear
        </button>
        <span style={styles.small}>
          Comparison is case-insensitive; exact symbol string match (keeps
          characters like <code style={styles.code}>&amp;</code> in{' '}
          <code style={styles.code}>M&amp;MFIN</code>).
        </span>
      </div>

      <div style={styles.result}>
        <div>
          <span style={styles.count}>{results.length}</span> match(es):
        </div>
        <pre style={styles.pre}>{results.join(',\n')}</pre>
      </div>
    </div>
  );
};

export default FnoFilters;
