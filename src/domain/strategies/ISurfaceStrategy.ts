import { Echo } from '../models/Echo';

export interface ISurfaceStrategy {
  calculateSurfaceAt(createdAt: number): number;
  findSleepingEcho(echoes: Echo[]): Echo | null;
}
