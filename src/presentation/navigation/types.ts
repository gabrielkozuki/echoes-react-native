import { Game } from '@/domain/models/Game';

export type RootStackParamList = {
  MainTabs: undefined;
  CreateEcho: { game?: Game } | undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Constellation: undefined;
};
