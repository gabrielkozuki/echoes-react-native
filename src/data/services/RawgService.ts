import { Game } from '../../domain/models/Game';

const BASE_URL = 'https://api.rawg.io/api';

interface RawgGame {
  id: number;
  name: string;
  background_image: string | null;
  genres: { id: number; name: string }[];
}

interface RawgResponse {
  results: RawgGame[];
}

export class RawgService {
  private readonly apiKey = process.env.RAWG_API_KEY ?? '';

  async search(query: string): Promise<Game[]> {
    const url = `${BASE_URL}/games?search=${encodeURIComponent(query)}&key=${this.apiKey}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`RAWG API error: ${response.status}`);
    }

    const data: RawgResponse = await response.json();

    return data.results.map((game) => ({
      id: String(game.id),
      name: game.name,
      coverUrl: game.background_image,
      genre: game.genres[0]?.name ?? null,
    }));
  }
}
