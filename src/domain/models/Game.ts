export interface Game {
  id: string;
  name: string;
  coverUrl: string | null;
  genre: string | null;
  platforms?: string[];
}
