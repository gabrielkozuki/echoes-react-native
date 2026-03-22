/**
 * @jest-environment node
 */
import { CreateEchoUseCase } from '@/domain/usecases/CreateEchoUseCase';
import { TimeBasedStrategy } from '@/domain/strategies/TimeBasedStrategy';
import { IEchoRepository } from '@/domain/models/IEchoRepository';
import { Echo } from '@/domain/models/Echo';
import { Game } from '@/domain/models/Game';

const makeGame = (): Game => ({
  id: 'game-1',
  name: 'Nier: Automata',
  coverUrl: null,
  genre: 'RPG',
});

const makeMockRepository = (sleeping: Echo[] = []): IEchoRepository => ({
  create: jest.fn().mockResolvedValue(undefined),
  findAll: jest.fn().mockResolvedValue([]),
  findSleeping: jest.fn().mockResolvedValue(sleeping),
  markSurfaced: jest.fn().mockResolvedValue(undefined),
});

describe('CreateEchoUseCase', () => {
  const strategy = new TimeBasedStrategy();

  it('define surfaceAt no futuro ao criar um Echo', async () => {
    const repository = makeMockRepository();
    const useCase = new CreateEchoUseCase(repository, strategy);

    const { echo } = await useCase.execute({
      game: makeGame(),
      text: 'Jogo filosófico e provoca reflexões',
    });

    expect(echo.surfaceAt).toBeGreaterThan(Date.now());
  });

  it('persiste o Echo no repositório após criação', async () => {
    const repository = makeMockRepository();
    const useCase = new CreateEchoUseCase(repository, strategy);

    await useCase.execute({
      game: makeGame(),
      text: 'Nunca vi máquinas tão humanas',
    });

    expect(repository.create).toHaveBeenCalledTimes(1);
  });

  it('lança erro ao tentar criar Echo com texto vazio', async () => {
    const repository = makeMockRepository();
    const useCase = new CreateEchoUseCase(repository, strategy);

    await expect(
      useCase.execute({ game: makeGame(), text: '' }),
    ).rejects.toThrow('Escreva uma mensagem');
  });

  it('lança erro ao tentar criar Echo com texto apenas de espaços', async () => {
    const repository = makeMockRepository();
    const useCase = new CreateEchoUseCase(repository, strategy);

    await expect(
      useCase.execute({ game: makeGame(), text: '   ' }),
    ).rejects.toThrow('Escreva uma mensagem');
  });

  it('retorna ressurgência quando há Echo adormecido pronto', async () => {
    const sleepingEcho: Echo = {
      id: 'old-echo',
      gameId: 'game-2',
      gameName: 'Super Mario Galaxy',
      gameCoverUrl: null,
      gameGenre: 'Platform',
      text: 'Jogo muito bom, melhor Mario 3D até hoje',
      createdAt: Date.now() - 60 * 24 * 60 * 60 * 1000,
      surfaceAt: Date.now() - 1000,
      surfacedAt: null,
      intensity: 0.8,
      platform: null,
      moodTags: [],
    };

    const repository = makeMockRepository([sleepingEcho]);
    const useCase = new CreateEchoUseCase(repository, strategy);

    const { resurgence } = await useCase.execute({
      game: makeGame(),
      text: 'Mindblowing :o',
    });

    expect(resurgence).not.toBeNull();
    expect(repository.markSurfaced).toHaveBeenCalledWith(
      sleepingEcho.id,
      expect.any(Number),
    );
  });

  it('retorna resurgence null quando não há Echoes adormecidos', async () => {
    const repository = makeMockRepository([]);
    const useCase = new CreateEchoUseCase(repository, strategy);

    const { resurgence } = await useCase.execute({
      game: makeGame(),
      text: 'Muito bom nota 10',
    });

    expect(resurgence).toBeNull();
  });
});
