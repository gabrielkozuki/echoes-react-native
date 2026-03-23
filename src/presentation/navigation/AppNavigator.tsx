import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { RootStackParamList, MainTabParamList } from '@/presentation/navigation/types';
import { colors } from '@/presentation/theme/colors';
import { typography } from '@/presentation/theme/typography';
import { spacing } from '@/presentation/theme/spacing';
import HomeScreen from '@/presentation/screens/home/HomeScreen';
import ConstellationScreen from '@/presentation/screens/constellation/ConstellationScreen';
import GameSearchScreen from '@/presentation/screens/game-search/GameSearchScreen';
import WriteEchoScreen from '@/presentation/screens/write-echo/WriteEchoScreen';
import OnboardingScreen from '@/presentation/screens/onboarding/OnboardingScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

const MainTabs = () => {
  const insets = useSafeAreaInsets();

  return (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarStyle: {
        backgroundColor: colors.surface,
        borderTopColor: colors.border,
        paddingTop: spacing.xs,
        paddingBottom: insets.bottom + spacing.md,
        height: 56 + insets.bottom + spacing.md,
      },
      tabBarActiveTintColor: colors.text,
      tabBarInactiveTintColor: colors.textMuted,
      tabBarLabelStyle: { ...typography.caption, marginBottom: spacing.xs },
      tabBarIcon: ({ focused, color }) => {
        const icons: Record<string, { active: keyof typeof Ionicons.glyphMap; inactive: keyof typeof Ionicons.glyphMap }> = {
          Home: { active: 'home', inactive: 'home-outline' },
          Constellation: { active: 'star', inactive: 'star-outline' },
        };
        const icon = icons[route.name];
        return <Ionicons name={focused ? icon.active : icon.inactive} size={22} color={color} />;
      },
    })}
  >
    <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Início' }} />
    <Tab.Screen name="Constellation" component={ConstellationScreen} options={{ title: 'Constelação' }} />
  </Tab.Navigator>
  );
};

interface Props {
  initialRoute: 'Onboarding' | 'MainTabs';
}

export const AppNavigator = ({ initialRoute }: Props) => (
  <NavigationContainer>
    <Stack.Navigator initialRouteName={initialRoute} screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen name="GameSearch" component={GameSearchScreen} options={{ presentation: 'modal' }} />
      <Stack.Screen name="WriteEcho" component={WriteEchoScreen} />
    </Stack.Navigator>
  </NavigationContainer>
);
