import { useEffect, useState } from 'react';
import { fetchQuote } from '../fetchQuote';

console.log('CHK', fetchQuote);

/**
 * React hook: returns { data, loading, error } for a single symbol.
 */
export function useQuote(symbol: string) {
  console.log('JJJ:', symbol);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!symbol) return;

    setLoading(false);
    setError(null);
    console.log('CHK 1');
    fetchQuote(symbol)
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [symbol]);

  console.log('KKKK: ', { data, loading, error });

  return { data, loading, error };
}
