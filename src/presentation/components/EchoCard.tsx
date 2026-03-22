import React from 'react';
import { View, Text, ImageBackground, StyleSheet } from 'react-native';
import { Echo } from '@/domain/models/Echo';
import { colors, getGenreColor } from '@/presentation/theme/colors';
import { spacing } from '@/presentation/theme/spacing';
import { typography } from '@/presentation/theme/typography';
import { formatDate } from '@/presentation/utils/date';

interface Props {
  echo: Echo;
  featured?: boolean;
}

export const EchoCard = ({ echo, featured = false }: Props) => {
  const accentColor = getGenreColor(echo.gameGenre);

  return (
    <View style={[styles.card, featured && styles.cardFeatured]}>
      <ImageBackground
        source={echo.gameCoverUrl ? { uri: echo.gameCoverUrl } : undefined}
        style={styles.background}
        imageStyle={[styles.backgroundImage, featured && styles.backgroundImageFeatured]}
      >
        <View style={[styles.overlay, featured && styles.overlayFeatured]}>
          <View style={styles.topRow}>
            <Text style={[styles.gameName, featured && styles.gameNameFeatured]} numberOfLines={1}>
              {echo.gameName}
            </Text>
            {echo.gameGenre && (
              <View style={[styles.genreBadge, { backgroundColor: accentColor }]}>
                <Text style={styles.genreText}>{echo.gameGenre}</Text>
              </View>
            )}
          </View>
          <Text style={styles.text} numberOfLines={featured ? 4 : 3}>{echo.text}</Text>
          <Text style={styles.date}>{formatDate(echo.createdAt)}</Text>
        </View>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: spacing.md,
    marginVertical: spacing.xs,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: colors.surface,
  },
  cardFeatured: {
    marginBottom: spacing.md,
  },
  background: {
    width: '100%',
  },
  backgroundImage: {
    opacity: 0.25,
    resizeMode: 'cover',
  },
  backgroundImageFeatured: {
    opacity: 0.35,
  },
  overlay: {
    padding: spacing.md,
    gap: spacing.sm,
    backgroundColor: 'rgba(10, 10, 20, 0.55)',
  },
  overlayFeatured: {
    paddingVertical: spacing.lg,
    gap: spacing.md,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
  },
  gameName: {
    ...typography.subtitle,
    color: colors.text,
    flex: 1,
  },
  gameNameFeatured: {
    fontSize: 22,
    fontWeight: '700',
  },
  genreBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: 4,
  },
  genreText: {
    ...typography.caption,
    color: '#fff',
    fontWeight: '600',
  },
  text: {
    ...typography.body,
    color: colors.textMuted,
    fontStyle: 'italic',
    lineHeight: 20,
  },
  date: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'right',
  },
});
