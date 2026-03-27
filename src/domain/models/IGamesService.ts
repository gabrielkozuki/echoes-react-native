import { Game } from './Game';

export interface IGamesService {
  getTrending(): Promise<Game[]>;
  search(query: string): Promise<Game[]>;
}
