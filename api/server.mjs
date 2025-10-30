// scripts/devServer.mjs
import { createServer } from 'node:http';
import { URL } from 'node:url';

import {
  fetchSingleSymbol,
  fetchMultiSymbols,
  fetchLiveQuotes, // <-- add this
} from '../api/_shared.js';
const RAW_SYMBOLS = `AARTIIND,ABB,ABBOTINDIA,ABCAPITAL,ABFRL,ACC,ADANIENT,ADANIPORTS,ALKEM,AMARAJABAT,AMBUJACEM,APOLLOHOSP,APPLAPOLLO,ASHOKLEY,ASIANPAINT,ASTRAL,ATUL,AUBANK,AUROPHARMA,AXISBANK,BAJAJ-AUTO,BAJAFINSV,BAJFINANCE,BALKRISIND,BALRAMCHIN,BANDHANBNK,BANKBARODA,BATAINDIA,BEL,BHARATFORG,BHARTIARTL,BHEL,BIOCON,BLUESTARCO,BOSCHLTD,BPCL,BRITANNIA,BSE,CAMS,CANBK,CDSL,CESC,CGPOWER,CHOLAFIN,CIPLA,COALINDIA,COFORGE,COLPAL,CONCOR,CROMPTON,CUMMINSIND,CYIENT,DABUR,DALBHARAT,DELV,DIVISLAB,DIXON,DLF,DMART,DRREDDY,EICHERMOT,ETERNAL,EXIDEIND,FEDERALBNK,FORTIS,GAIL,GLENMARK,GMRAIRPORT,GODREJCP,GODREJPROP,GRANULES,GRASIM,HAL,HAVELLS,HCLTECH,HDFCBANK,HDFCAMC,HDFCLIFE,HEROMOTOCO,HFCL,HINDALCO,HINDPETRO,HINDUNILVR,HINDZINC,HUDCO,ICICIBANK,ICICIGI,ICICIPRULI,IDEA,IDFCFIRSTB,IEX,IGL,IIFL,INDHOTEL,INDIANB,INDIGO,INDUSINDBK,INDUSTOWER,INFY,INXWIND,IOC,IRB,IRCTC,IREDA,IRFC,ITC,JINDALSTEL,JIOFIN,JSL,JSWENERGY,JSWSTEEL,JUBLFOOD,KALYANKJIL,KAYNES,KEI,KFINTECH,KOTAKBANK,KPITTECH,LAURUSLABS,LICHSGFIN,LICI,LODHA,LT,LTF,LTIM,LUPIN,M&M,MANAPPURAM,MANKIND,MARICO,MARUTI,MAXHEALTH,MAZDOCK,MCX,MFSL,MOTHERSON,MPHASIS,MUTHOOTFIN,NALCO,NAUKRI,NBCC,NCC,NESTLEIND,NHPC,NMDC,NTPC,NUVAMA,NYKAA,OBEROIRLTY,OFSS,OIL,ONGC,PAGEIND,PATANJALI,PAYTM,PERSISTENT,PETRONET,PFC,PGEL,PHOENIXLTD,PIDILITIND,PIIND,PNB,PNBHOUSING,POLICYBZR,POLYCAB,POONAWALLA,POWERGRID,PPLPHARMA,PRESTIGE,RBLBANK,RECLTD,RELIANCE,RVNL,SAIL,SBICARD,SBILIFE,SBIN,SHREECEM,SHRIRAMFIN,SIEMENS,SJVN,SOLARINDS,SONACOMS,SRF,SUNPHARMA,SUPREMEIND,SUZLON,SYNGENE,TATACHEM,TATACONSUM,TATAELXSI,TATAMOTORS,TATAPOWER,TATASTEEL,TATATECH,TCS,TECHM,TIINDIA,TITAGARH,TITAN,TORNTPHARM,TORNTPOWER,TRENT,TVSMOTOR,ULTRACEMCO,UNIONBANK,UNITDSPR,UNOMINDA,UPL,VBL,VEDL,VOLTAS,WIPRO,YESBANK,ZYDUSLIFE,360ONE,BDL,DELHIVERY,ZOMATO,ADANIGREEN,ADANIENSOL,ATGL,`;

function patch(res) {
  if (typeof res.status === 'function' && typeof res.json === 'function')
    return res;
  res.status = (code) => {
    res.writeHead(code, { 'Content-Type': 'application/json' });
    return res;
  };
  res.json = (obj) => res.end(JSON.stringify(obj));
  return res;
}

async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    return res.end();
  }

  res = patch(res);

  // handle browser preflight gracefully
  if (req.method === 'OPTIONS') {
    res.statusCode = 204; // No Content
    return res.end();
  }

  const url = new URL(
    req.url || '/',
    `http://${req.headers.host || 'localhost'}`,
  );

  try {
    // /api/quote?symbol=TCS.NS
    if (url.pathname === '/api/quote') {
      const symbol = url.searchParams.get('symbol');
      const months = parseInt(url.searchParams.get('months') || '6', 10);
      if (!symbol) {
        return res.status(400).json({ error: 'symbol parameter is required' });
      }
      const payload = await fetchSingleSymbol(symbol, months);
      return res.status(200).json(payload);
    }

    // /api/symbols?symbols=TCS,INFY,HCLTECH
    if (url.pathname === '/api/symbols') {
      const list = url.searchParams.get('symbols');
      const months = parseInt(url.searchParams.get('months') || '6', 10);
      if (!list) {
        return res.status(400).json({ error: 'symbols parameter is required' });
      }
      const payload = await fetchMultiSymbols(list, months);
      return res.status(200).json(payload);
    }

    if (url.pathname === '/api/quotes') {
      console.log('[devServer] /api/quotes (yahoo-finance2 path)');

      try {
        // ✅ Parse JSON body from POST request
        let body = '';
        await new Promise((resolve) => {
          req.on('data', (chunk) => (body += chunk));
          req.on('end', resolve);
        });

        const { symbols } = JSON.parse(body || '{}');
        if (!symbols) {
          return res
            .status(400)
            .json({ error: 'symbols field required in request body' });
        }

        console.log('JJJ (POST symbols):', symbols);

        const snapshot = await fetchLiveQuotes(symbols);

        // CORS headers are already being set at the top of handler()
        res.setHeader?.('Cache-Control', 'no-store');

        return res.status(200).json(snapshot);
      } catch (err) {
        console.error('[devServer] Error fetching quotes:', err);
        return res.status(500).json({ error: 'Failed to fetch quotes' });
      }
    }

    return res.status(404).json({ error: 'Not found' });
  } catch (err) {
    console.error('API_ERROR', err);
    return res.status(500).json({ error: err?.message || String(err) });
  }
}

const PORT = process.env.PORT || 3000;
createServer(handler).listen(PORT, () => {
  console.log(`API dev server on http://localhost:${PORT}
  → /api/quote?symbol=TCS.NS
  → /api/symbols?symbols=TCS,INFY,HCLTECH
  → /api/quotes?symbols=TCS,INFY,SBIN.NS,^NSEI`);
});

export default handler;
