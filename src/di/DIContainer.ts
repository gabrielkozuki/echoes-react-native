import { SQLiteDatabase } from 'expo-sqlite';
import uuid from 'react-native-uuid';

declare const __DEV__: boolean;
import { IEchoRepository } from '@/domain/models/IEchoRepository';
import { ISettingsRepository } from '@/domain/models/ISettingsRepository';
import { IGamesService } from '@/domain/models/IGamesService';
import { ISurfaceStrategy } from '@/domain/strategies/ISurfaceStrategy';
import { CreateEchoUseCase } from '@/domain/usecases/CreateEchoUseCase';
import { CompleteOnboardingUseCase } from '@/domain/usecases/CompleteOnboardingUseCase';
import { EchoRepository } from '@/data/repositories/EchoRepository';
import { SettingsRepository } from '@/data/repositories/SettingsRepository';
import { RawgService } from '@/data/services/RawgService';
import { TimeBasedStrategy } from '@/domain/strategies/TimeBasedStrategy';

export interface DIContainer {
  echoRepository: IEchoRepository;
  settingsRepository: ISettingsRepository;
  rawgService: IGamesService;
  surfaceStrategy: ISurfaceStrategy;
  createEchoUseCase: CreateEchoUseCase;
  completeOnboardingUseCase: CompleteOnboardingUseCase;
}

export const createContainer = (db: SQLiteDatabase): DIContainer => {
  const echoRepository = new EchoRepository(db);
  const surfaceStrategy = new TimeBasedStrategy(__DEV__);

  const settingsRepository = new SettingsRepository(db);

  return {
    echoRepository,
    settingsRepository,
    rawgService: new RawgService(),
    surfaceStrategy,
    createEchoUseCase: new CreateEchoUseCase(echoRepository, surfaceStrategy, () => String(uuid.v4())),
    completeOnboardingUseCase: new CompleteOnboardingUseCase(settingsRepository),
  };
};
