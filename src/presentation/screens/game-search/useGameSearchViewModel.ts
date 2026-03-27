import { useState, useEffect, useCallback } from 'react';

import { Game } from '@/domain/models/Game';
import { useDI } from '@/di/DIContext';

export const useGameSearchViewModel = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Game[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState(false);

  const { rawgService } = useDI();

  const search = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); return; }

    setSearching(true);

    try {
      setSearchError(false);
      const games = await rawgService.search(q);
      setResults(games);
    } catch {
      setSearchError(true);
    } finally {
      setSearching(false);
    }
  }, [rawgService]);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    const timer = setTimeout(() => search(query), 500);
    return () => clearTimeout(timer);
  }, [query, search]);

  return { query, setQuery, results, searching, searchError };
};
