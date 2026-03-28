import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { Echo } from '@/domain/models/Echo';
import { GameNode } from '../useConstellationViewModel';
import { colors, getGenreColor } from '@/presentation/theme/colors';
import { formatDate } from '@/presentation/utils/date';
import { useEchosByGame } from '@/presentation/hooks/echoHooks';

export const GAME_CARD_HEIGHT = 560;

const ANIM_OPEN_MS  = 220;
const ANIM_CLOSE_MS = 180;

interface Props {
  game: GameNode | null;
  onClose: () => void;
}

function Tag({ label, tint }: { label: string; tint?: string }) {
  return (
    <View style={[styles.tag, tint
      ? { borderColor: tint + '60', backgroundColor: tint + '18' }
      : undefined]}>
      <Text style={[styles.tagText, tint ? { color: tint } : undefined]}>{label}</Text>
    </View>
  );
}

function EchoRow({ echo, onPress }: { echo: Echo; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.echoRow} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.echoRowBody}>
        <Text style={styles.echoRowText} numberOfLines={2}>{echo.text}</Text>
        <Text style={styles.echoRowDate}>{formatDate(echo.createdAt)}</Text>
      </View>
      <Text style={styles.chevron}>›</Text>
    </TouchableOpacity>
  );
}

function EchoDetail({ echo, onBack }: { echo: Echo; onBack: () => void }) {
  return (
    <View style={styles.detailRoot}>
      <TouchableOpacity onPress={onBack} style={styles.backRow}>
        <Text style={styles.backText}>‹ Voltar</Text>
      </TouchableOpacity>

      <View style={styles.detailDivider} />

      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.detailDate}>{formatDate(echo.createdAt)}</Text>

        <View style={styles.detailBubble}>
          <Text style={styles.detailText}>{echo.text}</Text>
        </View>

        {echo.moodTags.length > 0 && (
          <View style={styles.tagRow}>
            {echo.moodTags.map(t => <Tag key={t} label={t} />)}
          </View>
        )}

        {echo.platform && (
          <View style={styles.detailFooter}>
            <Tag label={echo.platform} />
          </View>
        )}
      </ScrollView>
    </View>
  );
}

export const GameCard = ({ game, onClose }: Props) => {
  // Holds the last non-null game so content stays visible during the slide-out animation.
  const [displayGame, setDisplayGame] = useState<GameNode | null>(null);
  const [visible, setVisible] = useState(false);
  const [selectedEcho, setSelectedEcho] = useState<Echo | null>(null);
  const slideAnim = useRef(new Animated.Value(GAME_CARD_HEIGHT)).current; // starts off-screen below
  // Ref instead of state: tracking open/closed must not cause re-renders or restart the open animation.
  const isVisibleRef = useRef(false);

  // Fetched on demand; React Query caches it so re-opening the same card is instant.
  const { data: echoes = [], isLoading: loadingEchoes } = useEchosByGame(displayGame?.gameId ?? '');

  useEffect(() => {
    if (game) {
      setDisplayGame(game);
      setSelectedEcho(null);

      if (!isVisibleRef.current) {
        isVisibleRef.current = true;
        setVisible(true);
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: ANIM_OPEN_MS,
          useNativeDriver: true,
          easing: Easing.out(Easing.cubic),
        }).start();
      }
      // Card already open: just swap content without restarting the animation.
    } else {
      Animated.timing(slideAnim, {
        toValue: GAME_CARD_HEIGHT,
        duration: ANIM_CLOSE_MS,
        useNativeDriver: true,
        easing: Easing.in(Easing.cubic),
      }).start(({ finished }) => {
        // Guard against a race where a new open animation interrupted this close.
        if (finished) {
          isVisibleRef.current = false;
          setVisible(false);
          setSelectedEcho(null);
        }
      });
    }
  }, [game]);

  if (!visible || !displayGame) return null;

  const genreColor = getGenreColor(displayGame.gameGenre);

  return (
    <Animated.View style={[styles.card, { transform: [{ translateY: slideAnim }] }]}>
      <View style={styles.handle} />

      <View style={styles.header}>
        {displayGame.gameCoverUrl ? (
          <Image
            source={{ uri: displayGame.gameCoverUrl }}
            style={styles.cover}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.coverPlaceholder, { backgroundColor: genreColor + '33' }]}>
            <Text style={[styles.coverInitial, { color: genreColor }]}>
              {displayGame.gameName.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}

        <View style={styles.headerInfo}>
          <Text style={styles.gameName} numberOfLines={2}>{displayGame.gameName}</Text>
          <View style={styles.headerTags}>
            {displayGame.gameGenre
              ? <Tag label={displayGame.gameGenre} tint={genreColor} />
              : null}
            {/* echoCount is pre-loaded in GameNode, so no spinner while the echoes query runs */}
            <Text style={styles.echoCount}>
              {displayGame.echoCount} {displayGame.echoCount !== 1 ? 'ecos' : 'eco'}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={onClose}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.closeText}>Fechar</Text>
        </TouchableOpacity>
      </View>

      {selectedEcho ? (
        <EchoDetail echo={selectedEcho} onBack={() => setSelectedEcho(null)} />
      ) : loadingEchoes ? (
        <ActivityIndicator style={styles.loader} color={colors.textMuted} />
      ) : (
        <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
          {echoes.map(echo => (
            <EchoRow
              key={echo.id}
              echo={echo}
              onPress={() => setSelectedEcho(echo)}
            />
          ))}
        </ScrollView>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    height: GAME_CARD_HEIGHT,
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 14,
  },

  // header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  cover: {
    width: 52,
    height: 52,
    borderRadius: 8,
    backgroundColor: colors.border,
  },
  coverPlaceholder: {
    width: 52,
    height: 52,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverInitial: {
    fontSize: 20,
    fontWeight: '700',
  },
  headerInfo: {
    flex: 1,
    gap: 4,
  },
  gameName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    lineHeight: 20,
  },
  headerTags: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  echoCount: {
    fontSize: 12,
    color: colors.textMuted,
  },
  closeText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },

  // echo list
  list: {
    flex: 1,
  },
  loader: {
    flex: 1,
    alignSelf: 'center',
  },
  echoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    gap: 8,
  },
  echoRowBody: {
    flex: 1,
    gap: 3,
  },
  echoRowText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  echoRowDate: {
    fontSize: 11,
    color: colors.textMuted,
  },
  chevron: {
    fontSize: 20,
    color: colors.textMuted,
    lineHeight: 24,
  },

  // echo detail
  detailRoot: {
    flex: 1,
  },
  backRow: {
    paddingVertical: 6,
    marginBottom: 12,
    alignSelf: 'flex-start',
  },
  backText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  detailDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginBottom: 16,
  },
  detailBubble: {
    backgroundColor: colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 16,
  },
  detailText: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 26,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 16,
  },
  detailFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingTop: 4,
  },
  detailDate: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 10,
  },

  // shared
  tag: {
    borderWidth: 1,
    borderColor: '#3a3a50',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: '#1e1e32',
  },
  tagText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.text,
  },
});
