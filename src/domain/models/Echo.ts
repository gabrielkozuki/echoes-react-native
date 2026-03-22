export interface Echo {
  id: string;
  gameId: string;
  gameName: string;
  gameCoverUrl: string | null;
  gameGenre: string | null;
  text: string;
  createdAt: number; // timestamp in ms
  surfaceAt: number; // when Echo must be triggered (calculated on creation)
  surfacedAt: number | null; // when Echo was triggered (null = asleep)
  intensity: number; // range from 0 to 1, calculated based on how much the user has written about that experience
  platform: string | null;
  moodTags: string[];
}
