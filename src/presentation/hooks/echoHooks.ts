import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useDI } from '@/di/DIContext';
import { Game } from '@/domain/models/Game';
import { echoQueryKeys } from '@/presentation/hooks/echoQueryKeys';
import { useEchoStore } from '@/presentation/stores/echoStore';

// read hooks
export const useGameSummaries = () => {
  const repo = useDI().echoRepository;
  return useQuery({
    queryKey: echoQueryKeys.gameSummaries(),
    queryFn: () => repo.findGameSummaries(),
  });
};

export const useEchosByGame = (gameId: string) => {
  const repo = useDI().echoRepository;

  return useQuery({
    queryKey: echoQueryKeys.byGame(gameId),
    queryFn: () => repo.findByGameId(gameId),
    enabled: Boolean(gameId),
  });
};

export const useLatestEcho = () => {
  const repo = useDI().echoRepository;

  return useQuery({
    queryKey: echoQueryKeys.latest(),
    queryFn: () => repo.findLatest(),
  });
};

export const useEchoCount = () => {
  const repo = useDI().echoRepository;

  return useQuery({
    queryKey: echoQueryKeys.count(),
    queryFn: () => repo.findCount(),
  });
};

// mutation
export const useAddEcho = () => {
  const { createEchoUseCase } = useDI();
  const queryClient = useQueryClient();
  const store = useEchoStore();
  const setResurgence = store(s => s.setResurgence);

  return useMutation({
    mutationFn: ({
      game,
      text,
      platform,
      moodTags,
    }: {
      game: Game;
      text: string;
      platform?: string | null;
      moodTags?: string[];
    }) => createEchoUseCase.execute({ game, text, platform, moodTags }),

    onSuccess: ({ resurgence }) => {
      queryClient.invalidateQueries({ queryKey: echoQueryKeys.all }); // invalidating the root key cascades to all four sub-keys

      if (resurgence) {
        setResurgence(resurgence);
      }
    },
  });
};
