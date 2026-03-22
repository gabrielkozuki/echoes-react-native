import React from 'react';
import { TouchableOpacity, Text, ImageBackground, View, StyleSheet } from 'react-native';
import { Game } from '@/domain/models/Game';
import { colors, getGenreColor } from '@/presentation/theme/colors';
import { spacing } from '@/presentation/theme/spacing';
import { typography } from '@/presentation/theme/typography';

interface Props {
  game: Game;
  onPress: () => void;
}

export const TrendingGameCard = ({ game, onPress }: Props) => {
  const accentColor = getGenreColor(game.genre);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <ImageBackground
        source={game.coverUrl ? { uri: game.coverUrl } : undefined}
        style={styles.cover}
        imageStyle={styles.coverImage}
      >
        <View style={styles.overlay}>
          {game.genre && (
            <View style={[styles.genreBadge, { backgroundColor: accentColor }]}>
              <Text style={styles.genreText} numberOfLines={1}>{game.genre}</Text>
            </View>
          )}
        </View>
      </ImageBackground>
      <Text style={styles.name} numberOfLines={2}>{game.name}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 120,
    marginRight: spacing.sm,
  },
  cover: {
    width: 120,
    height: 160,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: colors.surface,
  },
  coverImage: {
    borderRadius: 8,
    resizeMode: 'cover',
  },
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: spacing.xs,
    backgroundColor: 'rgba(10,10,20,0.3)',
  },
  genreBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: 4,
  },
  genreText: {
    ...typography.caption,
    color: '#fff',
    fontWeight: '600',
    fontSize: 10,
  },
  name: {
    ...typography.caption,
    color: colors.text,
    marginTop: spacing.xs,
    lineHeight: 16,
  },
});
