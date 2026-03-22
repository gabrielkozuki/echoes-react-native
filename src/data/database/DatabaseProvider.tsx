import React from 'react';
import { SQLiteProvider } from 'expo-sqlite';
import { CREATE_ECHOES_TABLE, CREATE_SETTINGS_TABLE } from './schema';

interface Props {
  children: React.ReactNode;
}

export const DatabaseProvider = ({ children }: Props) => (
  <SQLiteProvider
    databaseName="echoes.db"
    onInit={async (db) => {
      await db.execAsync(CREATE_ECHOES_TABLE);
      await db.execAsync(CREATE_SETTINGS_TABLE);
    }}
  >
    {children}
  </SQLiteProvider>
);
