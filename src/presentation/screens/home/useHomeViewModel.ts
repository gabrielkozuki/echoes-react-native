import { useEffect, useState, useMemo } from 'react';

import { Game } from '@/domain/models/Game';
import { Echo } from '@/domain/models/Echo';
import { useDI } from '@/di/DIContext';
import { useEchoStore } from '@/presentation/stores/echoStore';

export const useHomeViewModel = () => {
  const store = useEchoStore();
  const echoes = store(s => s.echoes);
  const loading = store(s => s.loading);
  const loadEchoes = store(s => s.loadEchoes);

  const { rawgService } = useDI();
  const [trendingGames, setTrendingGames] = useState<Game[]>([]);
  const [trendingLoading, setTrendingLoading] = useState(true);
  const [trendingError, setTrendingError] = useState(false);

  useEffect(() => {
    loadEchoes();
  }, [loadEchoes]);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const games = await rawgService.getTrending();
        setTrendingGames(games);
      } catch {
        setTrendingError(true);
      } finally {
        setTrendingLoading(false);
      }
    };

    fetchTrending();
  }, [rawgService]);

  const userGames = useMemo<Game[]>(() => {
    const seen = new Set<string>();
    return echoes.reduce<Game[]>((acc, echo) => {
      if (!seen.has(echo.gameId)) {
        seen.add(echo.gameId);
        acc.push({
          id: echo.gameId,
          name: echo.gameName,
          coverUrl: echo.gameCoverUrl,
          genre: echo.gameGenre,
        });
      }
      return acc;
    }, []).slice(0, 10);
  }, [echoes]);

  const lastEcho = useMemo<Echo | null>(
    () => echoes.length > 0 ? echoes[0] : null,
    [echoes],
  );

  const echoCount = echoes.length;

  const lastEchoGameCount = useMemo(
    () => lastEcho ? echoes.filter(e => e.gameId === lastEcho.gameId).length : 0,
    [echoes, lastEcho],
  );

  return { loading, trendingGames, trendingLoading, trendingError, userGames, lastEcho, echoCount, lastEchoGameCount };
};
