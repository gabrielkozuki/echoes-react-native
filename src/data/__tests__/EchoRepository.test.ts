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

const makeRow = (echo: Echo) => ({
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
});

const makeMockDb = () => ({
  runAsync: jest.fn().mockResolvedValue(undefined),
  getAllAsync: jest.fn().mockResolvedValue([]),
  getFirstAsync: jest.fn().mockResolvedValue(null),
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

  it('findGameSummaries retorna GameSummary mapeados corretamente', async () => {
    const summaryRow = {
      game_id: 'game-1',
      game_name: 'Death Stranding',
      game_cover_url: 'https://example.com/cover.jpg',
      game_genre: 'Adventure',
      echo_count: 3,
      latest_created_at: 1700000000000,
    };

    const db = makeMockDb();
    db.getAllAsync.mockResolvedValue([summaryRow]);
    const repo = new EchoRepository(db as any);

    const result = await repo.findGameSummaries();

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      gameId: 'game-1',
      gameName: 'Death Stranding',
      gameCoverUrl: 'https://example.com/cover.jpg',
      gameGenre: 'Adventure',
      echoCount: 3,
      latestCreatedAt: 1700000000000,
    });
    expect(db.getAllAsync).toHaveBeenCalledWith(
      expect.stringContaining('GROUP BY game_id'),
    );
  });

  it('findByGameId retorna Echoes filtrados pelo gameId correto', async () => {
    const echo = makeEcho();
    const db = makeMockDb();
    db.getAllAsync.mockResolvedValue([makeRow(echo)]);
    const repo = new EchoRepository(db as any);

    const result = await repo.findByGameId('game-1');

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(echo);
    expect(db.getAllAsync).toHaveBeenCalledWith(
      expect.stringContaining('WHERE game_id = ?'),
      ['game-1'],
    );
  });

  it('findLatest retorna null quando não há echoes', async () => {
    const db = makeMockDb();
    db.getFirstAsync.mockResolvedValue(null);
    const repo = new EchoRepository(db as any);

    const result = await repo.findLatest();

    expect(result).toBeNull();
  });

  it('findLatest retorna o echo mais recente mapeado', async () => {
    const echo = makeEcho();
    const db = makeMockDb();
    db.getFirstAsync.mockResolvedValue(makeRow(echo));
    const repo = new EchoRepository(db as any);

    const result = await repo.findLatest();

    expect(result).toEqual(echo);
    expect(db.getFirstAsync).toHaveBeenCalledWith(
      expect.stringContaining('ORDER BY created_at DESC LIMIT 1'),
    );
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
