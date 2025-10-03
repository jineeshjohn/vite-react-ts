import { useEffect, useState } from 'react';
import { fetchQuote } from '../fetchQuote';


/**
 * React hook: returns { data, loading, error } for a single symbol.
 */
export function useQuote(symbol: string) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!symbol) return;

    setLoading(false);
    setError(null);
    fetchQuote(symbol)
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [symbol]);


  return { data, loading, error };
}
