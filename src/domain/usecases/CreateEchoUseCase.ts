import { v4 as uuidv4 } from 'uuid';
import { Echo } from '../models/Echo';
import { Game } from '../models/Game';
import { IEchoRepository } from '../models/IEchoRepository';
import { ISurfaceStrategy } from '../strategies/ISurfaceStrategy';

const MAX_INTENSITY_TEXT_LENGTH = 1500;

interface CreateEchoParams {
  game: Game;
  text: string;
  checkResurgence?: boolean;
}

interface CreateEchoResult {
  echo: Echo;
  resurgence: Echo | null;
}

export class CreateEchoUseCase {
  constructor(
    private readonly repository: IEchoRepository,
    private readonly strategy: ISurfaceStrategy,
  ) {}

  async execute(params: CreateEchoParams): Promise<CreateEchoResult> {
    const { game, text, checkResurgence = true } = params;
    const trimmedText = text.trim();

    if (!trimmedText) {
      throw new Error('Escreva uma mensagem');
    }

    const now = Date.now();
    const echo: Echo = {
      id: uuidv4(),
      gameId: game.id,
      gameName: game.name,
      gameCoverUrl: game.coverUrl,
      gameGenre: game.genre,
      text: trimmedText,
      createdAt: now,
      surfaceAt: this.strategy.calculateSurfaceAt(now),
      surfacedAt: null,
      intensity: Math.min(trimmedText.length / MAX_INTENSITY_TEXT_LENGTH, 1),
    };

    await this.repository.create(echo);

    if (!checkResurgence) {
      return { echo, resurgence: null };
    }

    const sleeping = await this.repository.findSleeping();
    const resurgence = this.strategy.findSleepingEcho(sleeping);

    if (resurgence) {
      await this.repository.markSurfaced(resurgence.id, Date.now());
    }

    return { echo, resurgence };
  }
}
