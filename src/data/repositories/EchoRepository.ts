import { SQLiteDatabase } from 'expo-sqlite';
import { Echo } from '@/domain/models/Echo';
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
  moodTags: JSON.parse(row.mood_tags ?? '[]'),
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

  async findAll(): Promise<Echo[]> {
    const rows = await this.db.getAllAsync<EchoRow>(
      'SELECT * FROM echoes ORDER BY created_at DESC',
    );
    return rows.map(toEcho);
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
