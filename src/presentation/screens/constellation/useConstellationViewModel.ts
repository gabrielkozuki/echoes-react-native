import { useMemo } from 'react';
import { useGameSummaries } from '@/presentation/hooks/echoHooks';

export interface GameNode {
  gameId: string;
  gameName: string;
  gameGenre: string | null;
  gameCoverUrl: string | null;
  echoCount: number; // full echo list is fetched on demand by GameCard
  visualRadius: number;
  hitSize: number;
  x: number;
  y: number;
}

const X_ANCHORS = [0.18, 0.58, 0.82, 0.72, 0.48, 0.28, 0.42];
const X_STRIDE = 3; // jumps 3 anchor positions per game to spread across the canvas

const Y_OFFSETS = [0.10, 0.30, 0.20, 0.40, 0.15, 0.35, 0.25]; // vertical offset within each row
const Y_STRIDE = 3;

function starSize(echoCount: number): number {
  if (echoCount <= 3) return 16;
  if (echoCount <= 8) return 26;
  if (echoCount <= 15) return 38;
  return 50;
}

function computeCanvasDimensions(numGames: number, viewW: number, viewH: number) {
  const MAX_STAR_DIAMETER = 100;
  const MIN_VERTICAL_GAP = 50;
  const MIN_SLOT_HEIGHT = MAX_STAR_DIAMETER + MIN_VERTICAL_GAP;

  if (numGames === 0 || viewW === 0) {
    return { drawW: viewW, drawH: viewH };
  }

  const requiredHeight = numGames * MIN_SLOT_HEIGHT;

  return {
    drawW: viewW,
    drawH: Math.max(viewH, requiredHeight),
  };
}

function placeGames(games: Array<Omit<GameNode, 'x' | 'y'>>, usableWidth: number, usableHeight: number): GameNode[] {
  const rowHeight = usableHeight / Math.max(games.length, 1);

  return games.map((game, index) => {
    const rowStartY = index * rowHeight;

    const anchorIndexX = (index * X_STRIDE) % X_ANCHORS.length;
    const offsetIndexY = (index * Y_STRIDE) % Y_OFFSETS.length;

    const x = X_ANCHORS[anchorIndexX] * usableWidth;
    const y = rowStartY + rowHeight * Y_OFFSETS[offsetIndexY];

    return { ...game, x, y };
  });
}

export const useConstellationViewModel = (viewWidth: number, viewHeight: number) => {
  const { data: summaries = [], isLoading } = useGameSummaries();

  const gameCount = summaries.length;

  const { drawW, drawH } = useMemo(
    () => computeCanvasDimensions(gameCount, viewWidth, viewHeight),
    [gameCount, viewWidth, viewHeight],
  );

  const preparedGames = useMemo(() =>
    summaries.map(s => {
      const visualRadius = starSize(s.echoCount);
      return {
        gameId: s.gameId,
        gameName: s.gameName,
        gameGenre: s.gameGenre,
        gameCoverUrl: s.gameCoverUrl,
        echoCount: s.echoCount,
        visualRadius,
        hitSize: Math.max(64, visualRadius * 2 + 24),
      };
    }),
  [summaries]);

  const gameStars = useMemo<GameNode[]>(() => {
    if (drawW === 0 || preparedGames.length === 0) return [];
    return placeGames(preparedGames, drawW, drawH);
  }, [preparedGames, drawW, drawH]);

  const isEmpty = !isLoading && drawW > 0 && gameStars.length === 0;

  return { gameStars, isEmpty, drawW, drawH };
};
