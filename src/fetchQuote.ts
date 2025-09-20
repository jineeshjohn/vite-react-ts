/**
 * GET /api/quote?symbol=XYZ and return parsed JSON.
 * Resolves with the raw quote object from yahoo-finance2.
 */
export async function fetchQuote(symbol: string) {
  const res = await fetch(`/api/quote?symbol=${encodeURIComponent(symbol)}`);

  if (!res.ok) {
    throw new Error(await res.text());
  }
  return res.json();
}
