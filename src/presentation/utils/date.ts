export const formatDate = (ms: number): string =>
  new Date(ms).toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

export const timeAgo = (ms: number): string => {
  const days = Math.floor((Date.now() - ms) / (1000 * 60 * 60 * 24));

  if (days === 0) return 'hoje';
  if (days === 1) return 'ontem';
  if (days < 7) return `há ${days} dias`;

  const weeks = Math.floor(days / 7);

  if (weeks === 1) return 'há 1 semana';
  if (weeks < 4) return `há ${weeks} semanas`;

  const months = Math.floor(days / 30);

  if (months === 1) return 'há 1 mês';
  
  return `há ${months} meses`;
};
