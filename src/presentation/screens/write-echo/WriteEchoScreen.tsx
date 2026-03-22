import React from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ImageBackground,
  Linking,
  StyleSheet,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { colors, getGenreColor } from '@/presentation/theme/colors';
import { spacing } from '@/presentation/theme/spacing';
import { typography } from '@/presentation/theme/typography';
import { RootStackParamList } from '@/presentation/navigation/types';
import { useWriteEchoViewModel } from './useWriteEchoViewModel';

const MOOD_TAGS = ['épico', 'nostálgico', 'frustrante', 'surreal', 'emocionante', 'reflexivo', 'assustador', 'divertido'];
const FALLBACK_PLATFORMS = ['PC', 'PS5', 'PS4', 'Xbox', 'Switch', 'Mobile'];

const WriteEchoScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const route = useRoute<RouteProp<RootStackParamList, 'WriteEcho'>>();
  const { game } = route.params;

  const {
    text, setText,
    selectedPlatform, setSelectedPlatform,
    selectedTags, toggleTag,
    saving, error, canSave,
    save,
  } = useWriteEchoViewModel(game);

  const accentColor = getGenreColor(game.genre);
  const rawPlatforms = game.platforms ?? [];
  const platforms = rawPlatforms.length > 0 ? rawPlatforms : FALLBACK_PLATFORMS;

  const openOST = () => {
    Linking.openURL(`https://m.youtube.com/results?search_query=${encodeURIComponent(game.name + ' OST')}`);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.writeContainer}>
        <ImageBackground
          source={game.coverUrl ? { uri: game.coverUrl } : undefined}
          style={styles.gameBanner}
          imageStyle={styles.gameBannerImage}
        >
          <View style={styles.bannerOverlay}>
            <View style={[styles.bannerTop, { paddingTop: insets.top + spacing.sm }]}>
              <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={12}>
                <Ionicons name="arrow-back-outline" size={22} color={colors.textMuted} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={12}>
                <Ionicons name="close" size={22} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
            <View style={styles.bannerInfo}>
              <Text style={styles.gameName} numberOfLines={1}>{game.name}</Text>
              <View style={styles.bannerInfoRight}>
                {game.genre && (
                  <View style={[styles.genreBadge, { backgroundColor: accentColor }]}>
                    <Text style={styles.genreText}>{game.genre}</Text>
                  </View>
                )}
                <TouchableOpacity onPress={openOST} hitSlop={12} style={styles.ostButton}>
                  <Ionicons name="musical-notes-outline" size={16} color={colors.textMuted} />
                  <Text style={styles.ostLabel}>Ouvir OST</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ImageBackground>

        <ScrollView
          style={styles.formScroll}
          contentContainerStyle={styles.formContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.chipSection}>
            <Text style={styles.chipLabel}>plataforma</Text>
            <View style={styles.chipRow}>
              {platforms.map(p => (
                <TouchableOpacity
                  key={p}
                  style={[styles.chip, selectedPlatform === p && { backgroundColor: accentColor, borderColor: accentColor }]}
                  onPress={() => setSelectedPlatform(selectedPlatform === p ? null : p)}
                >
                  <Text style={[styles.chipText, selectedPlatform === p && styles.chipTextActive]}>
                    {p}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.chipSection}>
            <Text style={styles.chipLabel}>como foi?</Text>
            <View style={styles.chipRow}>
              {MOOD_TAGS.map(tag => (
                <TouchableOpacity
                  key={tag}
                  style={[styles.chip, selectedTags.includes(tag) && { backgroundColor: accentColor, borderColor: accentColor }]}
                  onPress={() => toggleTag(tag)}
                >
                  <Text style={[styles.chipText, selectedTags.includes(tag) && styles.chipTextActive]}>
                    {tag}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TextInput
            style={styles.textInput}
            placeholder="registre sua experiência..."
            placeholderTextColor={colors.textMuted}
            value={text}
            onChangeText={setText}
            multiline
            textAlignVertical="top"
          />
        </ScrollView>

        {error && <Text style={styles.error}>{error}</Text>}

        <TouchableOpacity
          style={[
            styles.saveButton,
            { backgroundColor: canSave ? accentColor : colors.surface, paddingBottom: insets.bottom + spacing.md },
          ]}
          onPress={save}
          disabled={!canSave || saving}
          accessibilityLabel="Guardar echo"
        >
          {saving
            ? <ActivityIndicator size="small" color="#fff" />
            : <Text style={[styles.saveLabel, { opacity: canSave ? 1 : 0.4 }]}>guardar echo</Text>
          }
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  writeContainer: {
    flex: 1,
  },
  gameBanner: {
    width: '100%',
    height: 210,
  },
  gameBannerImage: {
    opacity: 0.35,
    resizeMode: 'cover',
  },
  bannerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(10, 10, 20, 0.5)',
    justifyContent: 'space-between',
    padding: spacing.md,
  },
  bannerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bannerInfo: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  bannerInfoRight: {
    alignItems: 'flex-end',
    gap: spacing.md,
  },
  gameName: {
    ...typography.subtitle,
    color: colors.text,
    flex: 1,
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
  ostButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ostLabel: {
    ...typography.caption,
    color: colors.textMuted,
    letterSpacing: 1,
  },
  formScroll: {
    flex: 1,
  },
  formContent: {
    paddingBottom: spacing.lg,
  },
  chipSection: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xl,
    gap: spacing.sm,
  },
  chipLabel: {
    ...typography.caption,
    color: colors.textMuted,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    paddingTop: spacing.xs,
  },
  chip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipText: {
    ...typography.caption,
    color: colors.textMuted,
  },
  chipTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  textInput: {
    minHeight: 120,
    ...typography.body,
    color: colors.text,
    padding: spacing.md,
    paddingTop: spacing.xl,
    lineHeight: 24,
  },
  error: {
    ...typography.caption,
    color: '#e05c5c',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  saveButton: {
    paddingTop: spacing.md,
    alignItems: 'center',
  },
  saveLabel: {
    ...typography.body,
    color: '#fff',
    fontWeight: '600',
    letterSpacing: 1,
  },
});

export default WriteEchoScreen;
