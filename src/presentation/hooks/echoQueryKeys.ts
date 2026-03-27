// hierarchical keys under 'echoes' so a single invalidateQueries(all) cascades to every sub-cache
export const echoQueryKeys = {
  all: ['echoes'] as const,
  gameSummaries: () => [...echoQueryKeys.all, 'gameSummaries'] as const,
  byGame: (gameId: string) => [...echoQueryKeys.all, 'byGame', gameId] as const,
  latest: () => [...echoQueryKeys.all, 'latest'] as const,
  count: () => [...echoQueryKeys.all, 'count'] as const,
} as const;
