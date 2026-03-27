import React from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { colors } from '@/presentation/theme/colors';
import { spacing } from '@/presentation/theme/spacing';
import { typography } from '@/presentation/theme/typography';
import { RootStackParamList } from '@/presentation/navigation/types';
import { GameSearchResult } from '@/presentation/components/GameSearchResult';
import { useGameSearchViewModel } from './useGameSearchViewModel';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const GameSearchScreen = () => {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const { query, setQuery, results, searching, searchError } = useGameSearchViewModel();

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.lg }]}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => navigation.goBack()}
          hitSlop={12}
          accessibilityLabel="Fechar"
        >
          <Ionicons name="close" size={22} color={colors.textMuted} />
        </TouchableOpacity>
        <Text style={styles.prompt}>que jogo ficou na memória?</Text>
        <View style={styles.searchInputRow}>
          <Ionicons name="search-outline" size={18} color={colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="buscar..."
            placeholderTextColor={colors.textMuted}
            value={query}
            onChangeText={setQuery}
            autoFocus
          />
          {searching && <ActivityIndicator size="small" color={colors.textMuted} />}
        </View>
      </View>

      {searchError ? (
        <Text style={styles.errorText}>não foi possível buscar jogos</Text>
      ) : (
        <FlatList
          data={results}
          keyExtractor={g => g.id}
          renderItem={({ item }) => (
            <GameSearchResult game={item} onPress={() => navigation.navigate('WriteEcho', { game: item })} />
          )}
          keyboardShouldPersistTaps="handled"
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.lg,
    gap: spacing.md,
  },
  closeButton: {
    alignSelf: 'flex-end',
  },
  prompt: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: 1,
  },
  searchInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: spacing.sm,
  },
  searchInput: {
    flex: 1,
    ...typography.body,
    color: colors.text,
    paddingVertical: spacing.xs,
  },
  errorText: {
    ...typography.caption,
    color: colors.textMuted,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
});

export default GameSearchScreen;
