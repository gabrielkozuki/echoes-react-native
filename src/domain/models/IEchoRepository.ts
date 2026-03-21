import { Echo } from './Echo';

export interface IEchoRepository {
  create(echo: Echo): Promise<void>;
  findAll(): Promise<Echo[]>;
  findSleeping(): Promise<Echo[]>;
  markSurfaced(id: string, surfacedAt: number): Promise<void>;
}
