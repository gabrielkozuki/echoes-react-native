/**
 * @jest-environment node
 */
import { EchoRepository } from '@/data/repositories/EchoRepository';
import { Echo } from '@/domain/models/Echo';

const makeEcho = (): Echo => ({
  id: 'echo-1',
  gameId: 'game-1',
  gameName: 'Death Stranding',
  gameCoverUrl: 'https://example.com/cover.jpg',
  gameGenre: 'Adventure',
  text: 'O online assíncrono é genial',
  createdAt: 1700000000000,
  surfaceAt: 1700000000000 + 60 * 24 * 60 * 60 * 1000,
  surfacedAt: null,
  intensity: 0.5,
  platform: 'PS5',
  moodTags: ['épico'],
});

const makeMockDb = () => ({
  runAsync: jest.fn().mockResolvedValue(undefined),
  getAllAsync: jest.fn().mockResolvedValue([]),
});

describe('EchoRepository', () => {
  it('create executa INSERT com os parâmetros corretos', async () => {
    const db = makeMockDb();
    const repo = new EchoRepository(db as any);
    const echo = makeEcho();

    await repo.create(echo);

    expect(db.runAsync).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO echoes'),
      expect.arrayContaining([echo.id, echo.gameId, echo.gameName]),
    );
  });

  it('findAll retorna Echoes mapeados corretamente do banco', async () => {
    const echo = makeEcho();
    const row = {
      id: echo.id,
      game_id: echo.gameId,
      game_name: echo.gameName,
      game_cover_url: echo.gameCoverUrl,
      game_genre: echo.gameGenre,
      text: echo.text,
      created_at: echo.createdAt,
      surface_at: echo.surfaceAt,
      surfaced_at: echo.surfacedAt,
      intensity: echo.intensity,
      platform: echo.platform,
      mood_tags: JSON.stringify(echo.moodTags),
    };

    const db = makeMockDb();
    db.getAllAsync.mockResolvedValue([row]);
    const repo = new EchoRepository(db as any);

    const result = await repo.findAll();

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(echo);
  });

  it('markSurfaced executa UPDATE com id e timestamp corretos', async () => {
    const db = makeMockDb();
    const repo = new EchoRepository(db as any);
    const surfacedAt = Date.now();

    await repo.markSurfaced('echo-1', surfacedAt);

    expect(db.runAsync).toHaveBeenCalledWith(
      expect.stringContaining('UPDATE echoes'),
      [surfacedAt, 'echo-1'],
    );
  });
});
