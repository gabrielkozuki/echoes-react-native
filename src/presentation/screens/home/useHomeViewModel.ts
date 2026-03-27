import { useEffect, useState, useMemo } from 'react';

import { Game } from '@/domain/models/Game';
import { useDI } from '@/di/DIContext';
import { useGameSummaries, useLatestEcho, useEchoCount } from '@/presentation/hooks/echoHooks';

export const useHomeViewModel = () => {
  const { data: summaries = [], isLoading: summariesLoading } = useGameSummaries();
  const { data: latestEcho = null } = useLatestEcho();
  const { data: echoCount = 0 } = useEchoCount();

  const { rawgService } = useDI();
  const [trendingGames, setTrendingGames] = useState<Game[]>([]);
  const [trendingLoading, setTrendingLoading] = useState(true);
  const [trendingError, setTrendingError] = useState(false);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        setTrendingGames(await rawgService.getTrending());
      } catch {
        setTrendingError(true);
      } finally {
        setTrendingLoading(false);
      }
    };
    fetchTrending();
  }, [rawgService]);

  const userGames = useMemo<Game[]>(
    () => summaries.slice(0, 10).map(s => ({
      id: s.gameId,
      name: s.gameName,
      coverUrl: s.gameCoverUrl,
      genre: s.gameGenre,
    })),
    [summaries],
  );
  
  const lastEchoGameCount = useMemo(
    () => latestEcho
      ? (summaries.find(s => s.gameId === latestEcho.gameId)?.echoCount ?? 0)
      : 0,
    [latestEcho, summaries],
  );

  return {
    loading: summariesLoading,
    trendingGames, trendingLoading, trendingError,
    userGames,
    lastEcho: latestEcho,
    echoCount,
    lastEchoGameCount,
  };
};
