import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  useWindowDimensions,
  ViewToken,
  FlatList as FlatListType,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { CommonActions } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { colors } from '@/presentation/theme/colors';
import { spacing } from '@/presentation/theme/spacing';
import { typography } from '@/presentation/theme/typography';
import { useOnboardingViewModel } from './useOnboardingViewModel';

// onboarding pages
const PageWelcome = ({ width }: { width: number }) => (
  <View style={[styles.page, { width }]}>
    <View style={styles.pageContent}>
      <Text style={styles.appName}>echoes</Text>
      <Text style={styles.tagline}>cada jogo deixa uma memória.</Text>
      <Text style={styles.sub}>registre sua experiência.{'\n'}redescubra quando menos esperar.</Text>
    </View>
  </View>
);

const PageResurgence = ({ width }: { width: number }) => (
  <View style={[styles.page, { width }]}>
    <View style={styles.pageContent}>
      <View style={styles.iconWrap}>
        <Ionicons name="planet-outline" size={48} color={colors.textMuted} />
      </View>
      <Text style={styles.pageTitle}>lembra desse jogo?</Text>
      <Text style={styles.pageBody}>
        {'seus echoes adormecem.\n\ncada memória que você registra fica guardada, e volta quando você menos espera.'}
      </Text>
    </View>
  </View>
);

const PageStart = ({
  width,
  onComplete,
  completing,
}: {
  width: number;
  onComplete: () => void;
  completing: boolean;
}) => (
  <View style={[styles.page, { width }]}>
    <View style={styles.pageContent}>
      <View style={styles.fabPreview}>
        <Ionicons name="add" size={28} color={colors.text} />
      </View>
      <Text style={styles.pageTitle}>pronto para começar</Text>
      <Text style={styles.pageBody}>
        toque no <Text style={styles.highlight}>+</Text> no canto da tela para registrar seu primeiro echo.
      </Text>

      <TouchableOpacity style={styles.startButton} onPress={onComplete} disabled={completing}>
        {completing
          ? <ActivityIndicator size="small" color={colors.background} />
          : <Text style={styles.startLabel}>entrar</Text>
        }
      </TouchableOpacity>
    </View>
  </View>
);

// screen
const Dots = ({ total, current }: { total: number; current: number }) => (
  <View style={styles.dots}>
    {Array.from({ length: total }).map((_, i) => (
      <View key={i} style={[styles.dot, i === current && styles.dotActive]} />
    ))}
  </View>
);

const OnboardingScreen = () => {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const listRef = useRef<FlatListType<number>>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const { complete, completing, completed } = useOnboardingViewModel();

  useEffect(() => {
    if (completed) {
      navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: 'MainTabs' }] }));
    }
  }, [completed, navigation]);

  const pages = [0, 1, 2];

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems[0]) setCurrentPage(viewableItems[0].index ?? 0);
  }).current;

  const goNext = () => {
    listRef.current?.scrollToIndex({ index: currentPage + 1, animated: true });
  };

  const renderPage = ({ item }: { item: number }) => {
    if (item === 0) return <PageWelcome width={width} />;
    if (item === 1) return <PageResurgence width={width} />;
    return <PageStart width={width} onComplete={complete} completing={completing} />;
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <FlatList
        ref={listRef}
        data={pages}
        keyExtractor={String}
        renderItem={renderPage}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
      />

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.lg }]}>
        <Dots total={3} current={currentPage} />
        <TouchableOpacity
          style={[styles.nextButton, currentPage >= 2 && { opacity: 0 }]}
          onPress={goNext}
          disabled={currentPage >= 2}
        >
          <Ionicons name="arrow-forward" size={20} color={colors.text} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  page: {
    flex: 1,
    justifyContent: 'center',
  },
  pageContent: {
    paddingHorizontal: spacing.xl,
    gap: spacing.lg,
  },

  // Page 1
  appName: {
    fontSize: 48,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: 3,
  },
  tagline: {
    fontSize: 22,
    fontWeight: '500',
    color: colors.text,
    lineHeight: 30,
  },
  sub: {
    ...typography.body,
    color: colors.textMuted,
    lineHeight: 26,
  },

  // Page 2 & 3
  iconWrap: {
    marginBottom: spacing.sm,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    lineHeight: 32,
  },
  pageBody: {
    ...typography.body,
    color: colors.textMuted,
    lineHeight: 26,
  },
  highlight: {
    color: colors.text,
    fontWeight: '700',
  },

  // Page 3 FAB preview
  fabPreview: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },

  // Start button
  startButton: {
    marginTop: spacing.md,
    backgroundColor: colors.text,
    borderRadius: 12,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  startLabel: {
    ...typography.body,
    color: colors.background,
    fontWeight: '700',
    letterSpacing: 1,
  },

  // Footer
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
  },
  dots: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.border,
  },
  dotActive: {
    backgroundColor: colors.text,
    width: 18,
  },
  nextButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default OnboardingScreen;
