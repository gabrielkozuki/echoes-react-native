import uuid from 'react-native-uuid';

import { Echo } from '@/domain/models/Echo';
import { Game } from '@/domain/models/Game';
import { IEchoWriteRepository } from '@/domain/models/IEchoRepository';
import { ISurfaceStrategy } from '@/domain/strategies/ISurfaceStrategy';

const MAX_INTENSITY_TEXT_LENGTH = 1500;

interface CreateEchoParams {
  game: Game;
  text: string;
  platform?: string | null;
  moodTags?: string[];
  checkResurgence?: boolean;
}

interface CreateEchoResult {
  echo: Echo;
  resurgence: Echo | null;
}

export class CreateEchoUseCase {
  constructor(
    private readonly repository: IEchoWriteRepository,
    private readonly strategy: ISurfaceStrategy,
  ) {}

  async execute(params: CreateEchoParams): Promise<CreateEchoResult> {
    const { game, text, platform = null, moodTags = [], checkResurgence = true } = params;
    const trimmedText = text.trim();

    if (!trimmedText) {
      throw new Error('Escreva uma mensagem');
    }

    const now = Date.now();
    const echo: Echo = {
      id: String(uuid.v4()),
      gameId: game.id,
      gameName: game.name,
      gameCoverUrl: game.coverUrl,
      gameGenre: game.genre,
      text: trimmedText,
      createdAt: now,
      surfaceAt: this.strategy.calculateSurfaceAt(now),
      surfacedAt: null,
      intensity: Math.min(trimmedText.length / MAX_INTENSITY_TEXT_LENGTH, 1),
      platform,
      moodTags,
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
