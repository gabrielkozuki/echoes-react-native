import { Echo } from '../models/Echo';
import { ISurfaceStrategy } from './ISurfaceStrategy';

declare const __DEV__: boolean;

const DAY_IN_MS = 24 * 60 * 60 * 1000;
const DEV_MS = 30 * 1000; // awakes in 30 seconds

const randomBetween = (minDays: number, maxDays: number): number => {
  const range = maxDays - minDays;
  
  return (minDays + Math.random() * range) * DAY_IN_MS;
};

export class TimeBasedStrategy implements ISurfaceStrategy {
  calculateSurfaceAt(createdAt: number): number {
    if (__DEV__) {
      return createdAt + DEV_MS;
    }

    return createdAt + randomBetween(30, 365);
  }

  findSleepingEcho(echoes: Echo[]): Echo | null {
    const now = Date.now();
    const ready = echoes.filter(
      (echo) => echo.surfaceAt <= now && echo.surfacedAt === null,
    );

    if (ready.length === 0) return null;

    const randomIndex = Math.floor(Math.random() * ready.length);
    return ready[randomIndex];
  }
}
