import { Game } from '@/domain/models/Game';

const BASE_URL = 'https://api.rawg.io/api';

interface RawgGame {
  id: number;
  name: string;
  background_image: string | null;
  genres: { id: number; name: string }[];
  platforms: { platform: { id: number; name: string } }[] | null;
}

interface RawgResponse {
  results: RawgGame[];
}

const toGame = (game: RawgGame): Game => ({
  id: String(game.id),
  name: game.name,
  coverUrl: game.background_image,
  genre: game.genres[0]?.name ?? null,
  platforms: game.platforms?.map(p => p.platform.name) ?? [],
});

export class RawgService {
  private readonly apiKey = process.env.EXPO_PUBLIC_RAWG_API_KEY ?? '';

  async getTrending(): Promise<Game[]> {
    const to = new Date().toISOString().split('T')[0];
    const from = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const url = `${BASE_URL}/games?key=${this.apiKey}&ordering=-added&dates=${from},${to}&page_size=10`;
    const response = await fetch(url);

    if (!response.ok) throw new Error(`RAWG API error: ${response.status}`);

    const data: RawgResponse = await response.json();
    return data.results.map(toGame);
  }

  async search(query: string): Promise<Game[]> {
    const url = `${BASE_URL}/games?search=${encodeURIComponent(query)}&key=${this.apiKey}&search_precise=true&page_size=15`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`RAWG API error: ${response.status}`);
    }

    const data: RawgResponse = await response.json();

    return data.results.map(toGame);
  }
}
