import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { DatabaseProvider } from './src/data/database/DatabaseProvider';
import { DIProvider, useDI } from './src/di/DIContext';
import { StoreProvider } from './src/presentation/stores/echoStore';
import { AppNavigator } from './src/presentation/navigation/AppNavigator';
import { SurfaceModal } from './src/presentation/screens/resurgence/SurfaceModal';
import { colors } from './src/presentation/theme/colors';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0,
      retry: 1,
    },
  },
});

type InitialRoute = 'Onboarding' | 'MainTabs';

const AppEntry = () => {
  const container = useDI();
  const [initialRoute, setInitialRoute] = useState<InitialRoute | null>(null);

  useEffect(() => {
    const check = async () => {
      try {
        const value = await container.settingsRepository.get('onboarding_completed');
        setInitialRoute(value ? 'MainTabs' : 'Onboarding');
      } catch {
        setInitialRoute('Onboarding');
      }
    };
    check();
  }, []);

  if (!initialRoute) {
    return <View style={{ flex: 1, backgroundColor: colors.background }} />;
  }

  return (
    <>
      <AppNavigator initialRoute={initialRoute} />
      <SurfaceModal />
    </>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <DatabaseProvider>
        <DIProvider>
          <QueryClientProvider client={queryClient}>
            <StoreProvider>
              <StatusBar style="light" />
              <AppEntry />
            </StoreProvider>
          </QueryClientProvider>
        </DIProvider>
      </DatabaseProvider>
    </SafeAreaProvider>
  );
}
