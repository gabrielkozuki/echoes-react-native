import { Echo } from './Echo';
import { GameSummary } from './GameSummary';

export interface IEchoRepository {
  create(echo: Echo): Promise<void>;
  findSleeping(): Promise<Echo[]>;
  markSurfaced(id: string, surfacedAt: number): Promise<void>;

  findGameSummaries(): Promise<GameSummary[]>;
  findByGameId(gameId: string): Promise<Echo[]>;
  findLatest(): Promise<Echo | null>;
  findCount(): Promise<number>;
}
