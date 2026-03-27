import React, { createContext, useContext, useMemo } from 'react';
import { create, StoreApi, UseBoundStore } from 'zustand';
import { Echo } from '@/domain/models/Echo';

interface EchoState {
  resurgence: Echo | null;
}

interface EchoActions {
  setResurgence: (echo: Echo) => void;
  dismissResurgence: () => void;
}

export type EchoStore = EchoState & EchoActions;

export const createEchoStore = () =>
  create<EchoStore>()((set) => ({
    resurgence: null,
    setResurgence: (echo) => set({ resurgence: echo }),
    dismissResurgence: () => set({ resurgence: null }),
  }));

type EchoStoreHook = UseBoundStore<StoreApi<EchoStore>>;

const StoreContext = createContext<EchoStoreHook | null>(null);

interface Props {
  children: React.ReactNode;
}

export const StoreProvider = ({ children }: Props) => {
  const store = useMemo(() => createEchoStore(), []);

  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
};

export const useEchoStore = (): EchoStoreHook => {
  const store = useContext(StoreContext);
  if (!store) throw new Error('useEchoStore deve ser usado dentro de StoreProvider');
  return store;
};
