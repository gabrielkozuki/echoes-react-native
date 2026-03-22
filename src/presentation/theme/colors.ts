export const colors = {
  background: '#0a0a14',
  surface: '#12121e',
  text: '#e8e8f0',
  textMuted: '#6b6b80',
  border: '#1e1e2e',

  genre: {
    RPG: '#534AB7',
    Action: '#D85A30',
    Adventure: '#1D9E75',
    FPS: '#BA7517',
    Platform: '#888780',
    fallback: '#888780',
  },
} as const;

export type GenreKey = keyof typeof colors.genre;

export const getGenreColor = (genre: string | null): string => {
  if (!genre) return colors.genre.fallback;
  
  return (colors.genre as Record<string, string>)[genre] ?? colors.genre.fallback;
};
