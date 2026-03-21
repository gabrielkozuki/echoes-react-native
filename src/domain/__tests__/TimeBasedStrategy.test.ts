/**
 * @jest-environment node
 */
import { TimeBasedStrategy } from '../strategies/TimeBasedStrategy';
import { Echo } from '../models/Echo';

const DAY_IN_MS = 24 * 60 * 60 * 1000;

const makeEcho = (overrides: Partial<Echo> = {}): Echo => ({
  id: 'echo-1',
  gameId: 'game-1',
  gameName: 'Donkey Kong Bananza',
  gameCoverUrl: null,
  gameGenre: 'Adventure',
  text: 'Muito divertido',
  createdAt: Date.now(),
  surfaceAt: Date.now() - 1,
  surfacedAt: null,
  intensity: 0.5,
  ...overrides,
});

describe('TimeBasedStrategy', () => {
  const strategy = new TimeBasedStrategy();

  describe('calculateSurfaceAt', () => {
    it('retorna uma data no futuro para um Echo recém-criado', () => {
      const now = Date.now();
      const surfaceAt = strategy.calculateSurfaceAt(now);

      expect(surfaceAt).toBeGreaterThan(now);
    });

    it('define surfaceAt entre 30 e 365 dias (produção)', () => {
      const original = (globalThis as any).__DEV__;
      (globalThis as any).__DEV__ = false;

      const now = Date.now();
      const surfaceAt = strategy.calculateSurfaceAt(now);
      const daysUntilSurface = (surfaceAt - now) / DAY_IN_MS;

      (globalThis as any).__DEV__ = original;

      expect(daysUntilSurface).toBeGreaterThanOrEqual(30);
      expect(daysUntilSurface).toBeLessThanOrEqual(365);
    });
  });

  describe('findSleepingEcho', () => {
    it('retorna o Echo cujo surfaceAt já passou e surfacedAt é null', () => {
      const sleepingEcho = makeEcho({
        id: 'sleeping',
        surfaceAt: Date.now() - DAY_IN_MS,
        surfacedAt: null,
      });
      const notReadyEcho = makeEcho({
        id: 'not-ready',
        surfaceAt: Date.now() + DAY_IN_MS,
        surfacedAt: null,
      });

      const result = strategy.findSleepingEcho([sleepingEcho, notReadyEcho]);

      expect(result).not.toBeNull();
      expect(result?.id).toBe('sleeping');
    });

    it('ignora Echoes que já ressurgiram (surfacedAt preenchido)', () => {
      const alreadySurfaced = makeEcho({
        surfaceAt: Date.now() - DAY_IN_MS,
        surfacedAt: Date.now() - 1000,
      });

      const result = strategy.findSleepingEcho([alreadySurfaced]);

      expect(result).toBeNull();
    });

    it('retorna null quando não há Echoes adormecidos prontos', () => {
      const result = strategy.findSleepingEcho([]);

      expect(result).toBeNull();
    });
  });
});
