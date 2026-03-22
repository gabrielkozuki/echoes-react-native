import React from 'react';
import { TouchableOpacity, View, Text, Image, StyleSheet } from 'react-native';
import { Game } from '@/domain/models/Game';
import { colors, getGenreColor } from '@/presentation/theme/colors';
import { spacing } from '@/presentation/theme/spacing';
import { typography } from '@/presentation/theme/typography';

interface Props {
  game: Game;
  onPress: () => void;
}

export const GameSearchResult = ({ game, onPress }: Props) => {
  const accentColor = getGenreColor(game.genre);

  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.accent, { backgroundColor: accentColor }]} />
      {game.coverUrl ? (
        <Image source={{ uri: game.coverUrl }} style={styles.cover} resizeMode="cover" />
      ) : (
        <View style={[styles.cover, styles.coverFallback, { backgroundColor: accentColor + '33' }]} />
      )}
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{game.name}</Text>
        {game.genre && <Text style={styles.genre}>{game.genre}</Text>}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingVertical: spacing.sm,
    paddingRight: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  accent: {
    width: 3,
    alignSelf: 'stretch',
    marginRight: spacing.sm,
  },
  cover: {
    width: 40,
    height: 52,
    borderRadius: 4,
    marginRight: spacing.sm,
  },
  coverFallback: {
    opacity: 0.6,
  },
  info: {
    flex: 1,
  },
  name: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  genre: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
});
