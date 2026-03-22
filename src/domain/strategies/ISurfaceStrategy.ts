import { Echo } from '@/domain/models/Echo';

export interface ISurfaceStrategy {
  calculateSurfaceAt(createdAt: number): number;
  findSleepingEcho(echoes: Echo[]): Echo | null;
}
