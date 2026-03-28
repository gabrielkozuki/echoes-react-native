import { SQLiteDatabase } from 'expo-sqlite';
import { Echo } from '@/domain/models/Echo';
import { GameSummary } from '@/domain/models/GameSummary';
import { IEchoRepository } from '@/domain/models/IEchoRepository';

interface EchoRow {
  id: string;
  game_id: string;
  game_name: string;
  game_cover_url: string | null;
  game_genre: string | null;
  text: string;
  created_at: number;
  surface_at: number;
  surfaced_at: number | null;
  intensity: number;
  platform: string | null;
  mood_tags: string;
}

interface GameSummaryRow {
  game_id: string;
  game_name: string;
  game_cover_url: string | null;
  game_genre: string | null;
  echo_count: number;
  latest_created_at: number;
}

const toEcho = (row: EchoRow): Echo => ({
  id: row.id,
  gameId: row.game_id,
  gameName: row.game_name,
  gameCoverUrl: row.game_cover_url,
  gameGenre: row.game_genre,
  text: row.text,
  createdAt: row.created_at,
  surfaceAt: row.surface_at,
  surfacedAt: row.surfaced_at,
  intensity: row.intensity,
  platform: row.platform,
  moodTags: (() => { try { return JSON.parse(row.mood_tags ?? '[]'); } catch { return []; } })(),
});

const toGameSummary = (row: GameSummaryRow): GameSummary => ({
  gameId: row.game_id,
  gameName: row.game_name,
  gameCoverUrl: row.game_cover_url,
  gameGenre: row.game_genre,
  echoCount: row.echo_count,
  latestCreatedAt: row.latest_created_at,
});

export class EchoRepository implements IEchoRepository {
  constructor(private readonly db: SQLiteDatabase) {}

  async create(echo: Echo): Promise<void> {
    await this.db.runAsync(
      `INSERT INTO echoes
        (id, game_id, game_name, game_cover_url, game_genre, text, created_at, surface_at, surfaced_at, intensity, platform, mood_tags)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        echo.id,
        echo.gameId,
        echo.gameName,
        echo.gameCoverUrl,
        echo.gameGenre,
        echo.text,
        echo.createdAt,
        echo.surfaceAt,
        echo.surfacedAt,
        echo.intensity,
        echo.platform,
        JSON.stringify(echo.moodTags),
      ],
    );
  }

  async findGameSummaries(): Promise<GameSummary[]> {
    const rows = await this.db.getAllAsync<GameSummaryRow>(`
      SELECT
        game_id,
        game_name,
        game_cover_url,
        game_genre,
        COUNT(*) AS echo_count,
        MAX(created_at) AS latest_created_at
      FROM echoes
      GROUP BY game_id
      ORDER BY latest_created_at DESC
    `);
    return rows.map(toGameSummary);
  }

  async findByGameId(gameId: string): Promise<Echo[]> {
    const rows = await this.db.getAllAsync<EchoRow>(
      'SELECT * FROM echoes WHERE game_id = ? ORDER BY created_at DESC',
      [gameId],
    );
    return rows.map(toEcho);
  }

  async findLatest(): Promise<Echo | null> {
    const row = await this.db.getFirstAsync<EchoRow>(
      'SELECT * FROM echoes ORDER BY created_at DESC LIMIT 1',
    );
    return row ? toEcho(row) : null;
  }
  
  async findCount(): Promise<number> {
    const row = await this.db.getFirstAsync<{ total: number }>(
      'SELECT COUNT(*) AS total FROM echoes',
    );
    return row?.total ?? 0;
  }

  async findSleeping(): Promise<Echo[]> {
    const rows = await this.db.getAllAsync<EchoRow>(
      'SELECT * FROM echoes WHERE surfaced_at IS NULL',
    );
    return rows.map(toEcho);
  }

  async markSurfaced(id: string, surfacedAt: number): Promise<void> {
    await this.db.runAsync(
      'UPDATE echoes SET surfaced_at = ? WHERE id = ?',
      [surfacedAt, id],
    );
  }
}
