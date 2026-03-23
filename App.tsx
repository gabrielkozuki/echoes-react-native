import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { DatabaseProvider } from './src/data/database/DatabaseProvider';
import { DIProvider } from './src/di/DIContext';
import { StoreProvider } from './src/presentation/stores/echoStore';
import { AppNavigator } from './src/presentation/navigation/AppNavigator';
import { SurfaceModal } from './src/presentation/components/SurfaceModal';

export default function App() {
  return (
    <SafeAreaProvider>
      <DatabaseProvider>
        <DIProvider>
          <StoreProvider>
            <StatusBar style="light" />
            <AppNavigator />
            <SurfaceModal />
          </StoreProvider>
        </DIProvider>
      </DatabaseProvider>
    </SafeAreaProvider>
  );
}
