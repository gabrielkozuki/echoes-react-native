export interface GameSummary {
  gameId: string;
  gameName: string;
  gameCoverUrl: string | null;
  gameGenre: string | null;
  echoCount: number;
  latestCreatedAt: number; // used to sort the constellation (most-recently-played first)
}
