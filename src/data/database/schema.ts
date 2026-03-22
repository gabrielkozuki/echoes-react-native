export const CREATE_ECHOES_TABLE = `
  CREATE TABLE IF NOT EXISTS echoes (
    id TEXT PRIMARY KEY,
    game_id TEXT NOT NULL,
    game_name TEXT NOT NULL,
    game_cover_url TEXT,
    game_genre TEXT,
    text TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    surface_at INTEGER NOT NULL,
    surfaced_at INTEGER,
    intensity REAL NOT NULL,
    platform TEXT,
    mood_tags TEXT NOT NULL DEFAULT '[]'
  );
`;

export const CREATE_SETTINGS_TABLE = `
  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );
`;
