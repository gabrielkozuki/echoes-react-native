import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Image,
  Animated,
  StyleSheet,
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useEchoStore } from '@/presentation/stores/echoStore';
import { colors, getGenreColor } from '@/presentation/theme/colors';
import { spacing } from '@/presentation/theme/spacing';
import { typography } from '@/presentation/theme/typography';
import { formatDateLong } from '@/presentation/utils/date';

type Phase = 'intro' | 'echo';

const daysSince = (ms: number) => Math.floor((Date.now() - ms) / (1000 * 60 * 60 * 24));

// cards
const IntroCard = ({ onReveal }: { onReveal: () => void }) => {
  const screenAlpha = useRef(new Animated.Value(0)).current;
  const line1Alpha  = useRef(new Animated.Value(0)).current;
  const line2Alpha  = useRef(new Animated.Value(0)).current;
  const line2Y      = useRef(new Animated.Value(10)).current;
  const tapAlpha    = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(screenAlpha, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.delay(300),
      Animated.timing(line1Alpha,  { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.delay(700),
      Animated.parallel([
        Animated.timing(line2Alpha, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(line2Y,     { toValue: 0, duration: 700, useNativeDriver: true }),
      ]),
      Animated.delay(700),
      Animated.timing(tapAlpha,   { toValue: 1, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  const handlePress = () => {
    Animated.timing(screenAlpha, { toValue: 0, duration: 300, useNativeDriver: true }).start(() => {
      onReveal();
    });
  };

  return (
    <TouchableWithoutFeedback onPress={handlePress} accessibilityLabel="Ver echo ressurgido">
      <Animated.View style={[styles.introRoot, { opacity: screenAlpha }]}>
        <View style={styles.introContent}>
          <Animated.Text style={[styles.introLine1, { opacity: line1Alpha }]}>
            enquanto você guardava essa memória,
          </Animated.Text>

          <Animated.Text
            style={[styles.introLine2, { opacity: line2Alpha, transform: [{ translateY: line2Y }] }]}
          >
            algo do passado{'\n'}acordou.
          </Animated.Text>
        </View>

        <Animated.View style={[styles.tapHint, { opacity: tapAlpha }]}>
          <Text style={styles.tapText}>toque para ver</Text>
        </Animated.View>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
};

const EchoCard = ({ onDismiss }: { onDismiss: () => void }) => {
  const store = useEchoStore();
  const resurgence = store(s => s.resurgence)!;
  const insets = useSafeAreaInsets();

  const coverOpacity = useRef(new Animated.Value(0)).current;
  const titleAlpha   = useRef(new Animated.Value(0)).current;
  const titleY       = useRef(new Animated.Value(24)).current;
  const lineScale    = useRef(new Animated.Value(0)).current;
  const contentAlpha = useRef(new Animated.Value(0)).current;
  const contentY     = useRef(new Animated.Value(24)).current;
  const actionsAlpha = useRef(new Animated.Value(0)).current;
  const closeAlpha   = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(coverOpacity, { toValue: 0.7, duration: 800, useNativeDriver: true }),
      Animated.parallel([
        Animated.timing(titleAlpha, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(titleY,     { toValue: 0, duration: 500, useNativeDriver: true }),
        Animated.timing(lineScale,  { toValue: 1, duration: 400, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(contentAlpha, { toValue: 1, duration: 450, useNativeDriver: true }),
        Animated.timing(contentY,     { toValue: 0, duration: 450, useNativeDriver: true }),
        Animated.timing(actionsAlpha, { toValue: 1, duration: 450, useNativeDriver: true }),
        Animated.timing(closeAlpha,   { toValue: 1, duration: 450, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  const accentColor = getGenreColor(resurgence.gameGenre);
  const days = daysSince(resurgence.createdAt);
  const daysLabel = days === 0 ? 'de hoje' : days === 1 ? 'de ontem' : `de ${days} dias atrás`;

  const openOst = () => {
    const q = encodeURIComponent(`${resurgence.gameName} OST`);
    Linking.openURL(`https://m.youtube.com/results?search_query=${q}`);
  };

  return (
    <View style={styles.echoRoot}>
      {/* Ken Burns background */}
      {resurgence.gameCoverUrl && (
        <Animated.Image
          source={{ uri: resurgence.gameCoverUrl }}
          style={[styles.bgImage, { opacity: coverOpacity }]}
          resizeMode="cover"
        />
      )}
      <LinearGradient
        colors={['rgba(6,6,14,0.20)', 'rgba(6,6,14,0.55)', 'rgba(6,6,14,0.80)', 'rgba(6,6,14,0.90)']}
        locations={[0, 0.35, 0.7, 1]}
        style={styles.overlay}
      />
      <Animated.View style={[styles.accentBar, { backgroundColor: accentColor, opacity: coverOpacity }]} />

      {/* Close — top right */}
      <Animated.View style={[styles.closeWrap, { top: insets.top + spacing.md, opacity: closeAlpha }]}>
        <TouchableOpacity onPress={onDismiss} accessibilityLabel="Fechar echo ressurgido" hitSlop={16}>
          <Ionicons name="close" size={22} color={colors.textMuted} />
        </TouchableOpacity>
      </Animated.View>

      <View style={[styles.echoLayout, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>

        {/* Days label */}
        <Animated.View style={[styles.daysWrap, { opacity: titleAlpha, transform: [{ translateY: titleY }] }]}>
          <Text style={styles.daysLabel}>{daysLabel}</Text>
        </Animated.View>

        {/* Cover + title */}
        <Animated.View style={[styles.titleWrap, { opacity: titleAlpha, transform: [{ translateY: titleY }] }]}>
          {resurgence.gameCoverUrl ? (
            <Image source={{ uri: resurgence.gameCoverUrl }} style={styles.cover} resizeMode="cover" />
          ) : (
            <View style={[styles.cover, styles.coverPlaceholder]} />
          )}
          <Text style={styles.gameName} numberOfLines={2}>{resurgence.gameName}</Text>
          <Animated.View style={[styles.accentLine, { backgroundColor: accentColor, transform: [{ scaleX: lineScale }] }]} />
          <View style={styles.metaRow}>
            <Text style={styles.metaDate}>{formatDateLong(resurgence.createdAt)}</Text>
            {resurgence.gameGenre && (
              <>
                <View style={styles.metaDot} />
                <View style={[styles.genreBadge, { backgroundColor: accentColor + '33' }]}>
                  <Text style={[styles.genreText, { color: accentColor }]}>{resurgence.gameGenre}</Text>
                </View>
              </>
            )}
            {resurgence.platform && (
              <>
                <View style={styles.metaDot} />
                <Text style={styles.metaPlatform}>{resurgence.platform}</Text>
              </>
            )}
          </View>
        </Animated.View>

        {/* Echo text */}
        <Animated.ScrollView
          style={[styles.scrollArea, { opacity: contentAlpha }]}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={[styles.memoryWrap, { transform: [{ translateY: contentY }] }]}>
            <View style={[styles.memoryDivider, { backgroundColor: accentColor }]} />
            <Text style={styles.echoText}>{resurgence.text}</Text>
            {resurgence.moodTags.length > 0 && (
              <View style={styles.tagsSection}>
                <Text style={styles.tagsLabel}>sua experiência foi</Text>
                <View style={styles.tagsRow}>
                  {resurgence.moodTags.map(tag => (
                    <View key={tag} style={styles.tag}>
                      <Text style={styles.tagText}>{tag}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </Animated.View>
        </Animated.ScrollView>

        {/* OST */}
        <Animated.View style={[styles.ostWrap, { opacity: actionsAlpha }]}>
          <TouchableOpacity style={[styles.ostButton, { borderColor: accentColor + '66' }]} onPress={openOst}>
            <Ionicons name="musical-notes" size={14} color={accentColor} />
            <Text style={[styles.ostText, { color: accentColor }]}>ouvir OST</Text>
          </TouchableOpacity>
        </Animated.View>

      </View>
    </View>
  );
};

// modal
export const SurfaceModal = () => {
  const store = useEchoStore();
  const resurgence = store(s => s.resurgence);
  const dismiss    = store(s => s.dismissResurgence);

  const [phase, setPhase] = useState<Phase>('intro');

  useEffect(() => {
    if (resurgence) setPhase('intro');
  }, [resurgence]);

  const handleReveal = useCallback(() => setPhase('echo'), []);

  if (!resurgence) return null;

  return (
    <Modal transparent animationType="fade" visible statusBarTranslucent>
      <View style={styles.modalRoot}>
        {phase === 'intro'
          ? <IntroCard onReveal={handleReveal} />
          : <EchoCard onDismiss={dismiss} />
        }
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    backgroundColor: '#08080f',
  },

  // intro
  introRoot: {
    flex: 1,
    backgroundColor: '#08080f',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  introContent: {
    gap: spacing.lg,
  },
  introLine1: {
    ...typography.body,
    color: colors.textMuted,
    lineHeight: 24,
  },
  introLine2: {
    fontSize: 34,
    fontWeight: '700',
    color: colors.text,
    lineHeight: 42,
    letterSpacing: 0.2,
  },
  tapHint: {
    position: 'absolute',
    bottom: spacing.xl * 2,
    alignSelf: 'center',
  },
  tapText: {
    ...typography.caption,
    color: colors.textMuted,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },

  // game
  echoRoot: {
    flex: 1,
    backgroundColor: colors.background,
  },
  bgImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(6, 6, 14, 0.85)',
  },
  accentBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    opacity: 0.8,
  },
  closeWrap: {
    position: 'absolute',
    right: spacing.lg,
    zIndex: 10,
  },
  echoLayout: {
    flex: 1,
    flexDirection: 'column',
  },
  daysWrap: {
    alignItems: 'center',
    paddingTop: spacing.xl * 2,
    paddingBottom: spacing.md,
  },
  daysLabel: {
    ...typography.caption,
    color: colors.textMuted,
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  titleWrap: {
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
    gap: spacing.sm,
  },
  cover: {
    width: 110,
    height: 110,
    borderRadius: 10,
    backgroundColor: colors.surface,
  },
  coverPlaceholder: {
    borderWidth: 1,
    borderColor: colors.border,
  },
  gameName: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: 0.3,
    textAlign: 'center',
    lineHeight: 32,
    marginTop: spacing.xs,
  },
  accentLine: {
    width: 48,
    height: 2,
    borderRadius: 1,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  metaDate: {
    ...typography.caption,
    color: colors.textMuted,
  },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.border,
  },
  genreBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 4,
  },
  genreText: {
    ...typography.caption,
    fontWeight: '600',
  },
  metaPlatform: {
    ...typography.caption,
    color: colors.textMuted,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  memoryWrap: {
    gap: spacing.lg,
  },
  memoryDivider: {
    width: 32,
    height: 2,
    borderRadius: 1,
    opacity: 0.8,
  },
  echoText: {
    ...typography.body,
    color: colors.text,
    fontSize: 17,
    lineHeight: 28,
  },
  tagsSection: {
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  tagsLabel: {
    ...typography.caption,
    color: colors.textMuted,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'center',
    marginTop: spacing.md,
  },
  tag: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  tagText: {
    ...typography.caption,
    color: colors.text,
  },
  ostWrap: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  ostButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderRadius: 24,
  },
  ostText: {
    ...typography.caption,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});
