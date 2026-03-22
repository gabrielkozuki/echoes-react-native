import React from 'react';
import {
  View,
  Text,
  FlatList,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  ImageBackground,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, getGenreColor } from '@/presentation/theme/colors';
import { spacing } from '@/presentation/theme/spacing';
import { typography } from '@/presentation/theme/typography';
import { RootStackParamList } from '@/presentation/navigation/types';
import { TrendingGameCard } from '@/presentation/components/TrendingGameCard';
import { useHomeViewModel } from './useHomeViewModel';
import { timeAgo } from '@/presentation/utils/date';
import { Game } from '@/domain/models/Game';
import { Echo } from '@/domain/models/Echo';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const SectionHeader = ({ title }: { title: string }) => (
  <Text style={styles.sectionTitle}>{title}</Text>
);

const LastMemoryCard = ({ echo, gameEchoCount }: { echo: Echo; gameEchoCount: number }) => {
  const accentColor = getGenreColor(echo.gameGenre);
  return (
    <View style={styles.lastMemoryCard}>
      <ImageBackground
        source={echo.gameCoverUrl ? { uri: echo.gameCoverUrl } : undefined}
        style={styles.lastMemoryBg}
        imageStyle={styles.lastMemoryBgImage}
      >
        <View style={styles.lastMemoryOverlay}>
          <View style={styles.lastMemoryTop}>
            <Text style={styles.lastMemoryLabel}>última memória</Text>
            <View style={styles.echoCountBadge}>
              <Text style={styles.echoCountText}>
                {gameEchoCount} {gameEchoCount === 1 ? 'echo' : 'echoes'}
              </Text>
            </View>
          </View>
          <View style={styles.lastMemoryBottom}>
            <Text style={styles.lastMemoryGame} numberOfLines={1}>{echo.gameName}</Text>
            <View style={styles.lastMemoryMeta}>
              {echo.gameGenre && (
                <View style={[styles.genreBadge, { backgroundColor: accentColor }]}>
                  <Text style={styles.genreText}>{echo.gameGenre}</Text>
                </View>
              )}
              <Text style={styles.lastMemoryTime}>{timeAgo(echo.createdAt)}</Text>
            </View>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
};

const HomeScreen = () => {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const { loading, trendingGames, trendingLoading, trendingError, userGames, lastEcho, echoCount, lastEchoGameCount } = useHomeViewModel();

  const handleGamePress = (game: Game) => {
    navigation.navigate('WriteEcho', { game });
  };

  const hasEchoes = echoCount > 0;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.fab, { bottom: insets.bottom + spacing.lg }]}
        onPress={() => navigation.navigate('GameSearch')}
        accessibilityLabel="Registrar eco"
      >
        <Ionicons name="add" size={28} color={colors.text} />
      </TouchableOpacity>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + spacing.md, paddingBottom: insets.bottom + spacing.xl * 4 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>echoes</Text>
        </View>

        {/* Em Alta */}
        <View style={styles.section}>
          <SectionHeader title="em alta agora" />
          {trendingLoading ? (
            <ActivityIndicator color={colors.textMuted} style={styles.loader} />
          ) : trendingError ? (
            <Text style={styles.errorText}>não foi possível carregar</Text>
          ) : (
            <FlatList
              data={trendingGames}
              keyExtractor={g => g.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => (
                <TrendingGameCard game={item} onPress={() => handleGamePress(item)} />
              )}
              contentContainerStyle={styles.horizontalList}
            />
          )}
        </View>

        {/* Seus Jogos */}
        {hasEchoes && (
          <View style={styles.section}>
            <SectionHeader title="seus jogos" />
            <FlatList
              data={userGames}
              keyExtractor={g => g.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => (
                <TrendingGameCard game={item} onPress={() => handleGamePress(item)} />
              )}
              contentContainerStyle={styles.horizontalList}
            />
          </View>
        )}

        {/* Loading / Invite */}
        {loading ? (
          <ActivityIndicator
            color={colors.textMuted}
            style={styles.loader}
            testID="loading-indicator"
          />
        ) : !hasEchoes ? (
          <View style={styles.inviteContainer}>
            <Text style={styles.inviteText}>
              Jogando algo? Registre sua experiência com{' '}
              <Text style={styles.inviteHighlight}>+</Text>
            </Text>
          </View>
        ) : null}

        {/* Última Memória */}
        {hasEchoes && lastEcho && (
          <View style={styles.section}>
            <LastMemoryCard echo={lastEcho} gameEchoCount={lastEchoGameCount} />
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    gap: spacing.md,
  },
  header: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xs,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: 2,
  },
  section: {
    gap: spacing.sm,
    paddingTop: spacing.lg,
  },
  sectionTitle: {
    ...typography.caption,
    color: colors.textMuted,
    letterSpacing: 2,
    textTransform: 'uppercase',
    paddingHorizontal: spacing.md,
  },
  horizontalList: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  loader: {
    marginVertical: spacing.lg,
  },
  errorText: {
    ...typography.caption,
    color: colors.textMuted,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  inviteContainer: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
  },
  inviteText: {
    ...typography.body,
    color: colors.textMuted,
    lineHeight: 22,
  },
  inviteHighlight: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 18,
  },

  // Last Memory Card
  lastMemoryCard: {
    marginHorizontal: spacing.md,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: colors.surface,
  },
  lastMemoryBg: {
    width: '100%',
    height: 140,
  },
  lastMemoryBgImage: {
    opacity: 0.3,
    resizeMode: 'cover',
  },
  lastMemoryOverlay: {
    flex: 1,
    backgroundColor: 'rgba(10, 10, 20, 0.6)',
    padding: spacing.md,
    justifyContent: 'space-between',
  },
  lastMemoryTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMemoryLabel: {
    ...typography.caption,
    color: colors.textMuted,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  echoCountBadge: {
    backgroundColor: colors.border,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: 20,
  },
  echoCountText: {
    ...typography.caption,
    color: colors.textMuted,
  },
  lastMemoryBottom: {
    gap: spacing.xs,
  },
  lastMemoryGame: {
    ...typography.subtitle,
    color: colors.text,
  },
  lastMemoryMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  genreBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 4,
  },
  genreText: {
    ...typography.caption,
    color: '#fff',
    fontWeight: '600',
  },
  lastMemoryTime: {
    ...typography.caption,
    color: colors.textMuted,
  },

  fab: {
    position: 'absolute',
    right: spacing.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
});

export default HomeScreen;
