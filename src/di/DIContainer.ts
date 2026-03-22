import { SQLiteDatabase } from 'expo-sqlite';

declare const __DEV__: boolean;
import { IEchoRepository } from '../domain/models/IEchoRepository';
import { ISurfaceStrategy } from '../domain/strategies/ISurfaceStrategy';
import { CreateEchoUseCase } from '../domain/usecases/CreateEchoUseCase';
import { EchoRepository } from '../data/repositories/EchoRepository';
import { RawgService } from '../data/services/RawgService';
import { TimeBasedStrategy } from '../domain/strategies/TimeBasedStrategy';

export interface DIContainer {
  echoRepository: IEchoRepository;
  rawgService: RawgService;
  surfaceStrategy: ISurfaceStrategy;
  createEchoUseCase: CreateEchoUseCase;
}

export const createContainer = (db: SQLiteDatabase): DIContainer => {
  const echoRepository = new EchoRepository(db);
  const surfaceStrategy = new TimeBasedStrategy(__DEV__);

  return {
    echoRepository,
    rawgService: new RawgService(),
    surfaceStrategy,
    createEchoUseCase: new CreateEchoUseCase(echoRepository, surfaceStrategy),
  };
};
