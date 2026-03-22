/**
 * @jest-environment node
 */
import { RawgService } from '@/data/services/RawgService';

const makeRawgResponse = () => ({
  results: [
    {
      id: 1,
      name: 'Death Stranding',
      background_image: 'https://example.com/cover.jpg',
      genres: [
        { id: 1, name: 'Adventure' },
        { id: 2, name: 'Action' },
      ],
    },
  ],
});

const mockFetch = (body: object) => {
  globalThis.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: jest.fn().mockResolvedValue(body),
  }) as any;
};

describe('RawgService', () => {
  it('mapeia resposta da API para modelo Game', async () => {
    mockFetch(makeRawgResponse());

    const service = new RawgService();
    const games = await service.search('Death Stranding');

    expect(games).toHaveLength(1);
    expect(games[0]).toEqual({
      id: '1',
      name: 'Death Stranding',
      coverUrl: 'https://example.com/cover.jpg',
      genre: 'Adventure',
      platforms: [],
    });
  });

  it('usa apenas o primeiro gênero da lista', async () => {
    mockFetch(makeRawgResponse());

    const service = new RawgService();
    const games = await service.search('Death Stranding');

    expect(games[0].genre).toBe('Adventure');
  });

  it('retorna genre null quando o jogo não tem gêneros', async () => {
    mockFetch({
      results: [{ id: 2, name: 'Game Sem Gênero', background_image: null, genres: [] }],
    });

    const service = new RawgService();
    const games = await service.search('Game Sem Gênero');

    expect(games[0].genre).toBeNull();
  });

  it('lança erro quando a API retorna status de falha', async () => {
    globalThis.fetch = jest.fn().mockResolvedValue({ ok: false, status: 401 }) as any;

    const service = new RawgService();

    await expect(service.search('qualquer')).rejects.toThrow('RAWG API error: 401');
  });
});
