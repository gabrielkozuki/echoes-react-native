import React, { createContext, useContext, useMemo } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import { DIContainer, createContainer } from './DIContainer';

const DIContext = createContext<DIContainer | null>(null);

interface Props {
  children: React.ReactNode;
}

export const DIProvider = ({ children }: Props) => {
  const db = useSQLiteContext();
  const container = useMemo(() => createContainer(db), [db]);

  return <DIContext.Provider value={container}>{children}</DIContext.Provider>;
};

export const useDI = (): DIContainer => {
  const context = useContext(DIContext);

  if (!context) throw new Error('useDI deve ser usado dentro de DIProvider');

  return context;
};
