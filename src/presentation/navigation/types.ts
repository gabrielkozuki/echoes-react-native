import { Game } from '@/domain/models/Game';

export type RootStackParamList = {
  Onboarding: undefined;
  MainTabs: undefined;
  GameSearch: undefined;
  WriteEcho: { game: Game };
};

export type MainTabParamList = {
  Home: undefined;
  Constellation: undefined;
};
