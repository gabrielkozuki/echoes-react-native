import React, { createContext, useContext, useMemo } from 'react';
import { create, StoreApi, UseBoundStore } from 'zustand';
import { Echo } from '../../domain/models/Echo';
import { Game } from '../../domain/models/Game';
import { DIContainer } from '../../di/DIContainer';
import { useDI } from '../../di/DIContext';

interface EchoState {
  echoes: Echo[];
  loading: boolean;
  resurgence: Echo | null;
}

interface EchoActions {
  loadEchoes: () => Promise<void>;
  addEcho: (game: Game, text: string) => Promise<void>;
  dismissResurgence: () => void;
}

export type EchoStore = EchoState & EchoActions;

export const createEchoStore = (container: DIContainer) =>
  create<EchoStore>((set) => ({
    echoes: [],
    loading: false,
    resurgence: null,

    loadEchoes: async () => {
      set({ loading: true });
      const echoes = await container.echoRepository.findAll();
      set({ echoes, loading: false });
    },

    addEcho: async (game: Game, text: string) => {
      const { echo, resurgence } = await container.createEchoUseCase.execute({
        game,
        text,
      });
      set((state) => ({ echoes: [echo, ...state.echoes], resurgence }));
    },

    dismissResurgence: () => set({ resurgence: null }),
  }));

type EchoStoreHook = UseBoundStore<StoreApi<EchoStore>>;

const StoreContext = createContext<EchoStoreHook | null>(null);

interface Props {
  children: React.ReactNode;
}

export const StoreProvider = ({ children }: Props) => {
  const container = useDI();
  const store = useMemo(() => createEchoStore(container), [container]);

  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
};

export const useEchoStore = (): EchoStoreHook => {
  const store = useContext(StoreContext);
  if (!store) throw new Error('useEchoStore deve ser usado dentro de StoreProvider');
  return store;
};
