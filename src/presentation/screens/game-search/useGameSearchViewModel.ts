import { useState, useEffect, useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Game } from '@/domain/models/Game';
import { useDI } from '@/di/DIContext';
import { RootStackParamList } from '@/presentation/navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export const useGameSearchViewModel = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Game[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState(false);

  const { rawgService } = useDI();
  const navigation = useNavigation<Nav>();

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

  const selectGame = (game: Game) => {
    navigation.navigate('WriteEcho', { game });
  };

  return { query, setQuery, results, searching, searchError, selectGame };
};
