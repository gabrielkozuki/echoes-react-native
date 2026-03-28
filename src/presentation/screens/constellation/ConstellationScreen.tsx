import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { colors } from '@/presentation/theme/colors';
import { GameNode, useConstellationViewModel } from './useConstellationViewModel';
import { ConstellationCanvas, CANVAS_PADDING_TOP, CANVAS_PADDING_BOTTOM } from './components/ConstellationCanvas';
import { GameCard } from './components/GameCard';

const GAME_LABEL_WIDTH = 140;

export default function ConstellationScreen() {
  const [viewSize, setViewSize] = useState({ w: 0, h: 0 });
  const { gameStars, isEmpty, drawW, drawH } = useConstellationViewModel(
    viewSize.w,
    viewSize.h,
  );
  const [selectedGame, setSelectedGame] = useState<GameNode | null>(null);

  // ScrollView content height with both paddings
  const scrollHeight = drawH > 0 ? drawH + CANVAS_PADDING_TOP + CANVAS_PADDING_BOTTOM : viewSize.h;

  return (
    <View
      style={styles.container}
      onLayout={e => {
        const { width, height } = e.nativeEvent.layout;
        setViewSize({ w: width, h: height });
      }}
    >
      {viewSize.w > 0 && (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={{ height: scrollHeight }}
          showsVerticalScrollIndicator={false}
        >
          <ConstellationCanvas drawW={drawW} drawH={drawH} games={gameStars} />

          {gameStars.map(game => ( // Skia tap handling implemented with invisible Pressable
            <Pressable
              key={game.gameId}
              style={{
                position: 'absolute',
                left: game.x - game.hitSize / 2,
                top: game.y - game.hitSize / 2 + CANVAS_PADDING_TOP,
                width: game.hitSize,
                height: game.hitSize,
              }}
              onPress={() => setSelectedGame(game)}
            />
          ))}

          {gameStars.map(node => ( // game labels underneath Pressable
            <View
              key={`lbl_${node.gameId}`}
              
              pointerEvents="none"
              style={{
                position: 'absolute',
                top: node.y + node.visualRadius + 10 + CANVAS_PADDING_TOP,
                left: Math.max(4, Math.min(drawW - GAME_LABEL_WIDTH - 4, node.x - GAME_LABEL_WIDTH / 2)), // clamped so labels overflow to the left/right edges
                width: GAME_LABEL_WIDTH,
              }}
            >
              <Text style={styles.label} numberOfLines={2}>{node.gameName}</Text>
            </View>
          ))}
        </ScrollView>
      )}

      {isEmpty && (
        <View style={styles.empty} pointerEvents="none">
          <Text style={styles.emptyTitle}>Nenhum echo ainda</Text>
          <Text style={styles.emptyBody}>
            Registre experiências em jogos para ver sua constelação
          </Text>
        </View>
      )}

      {selectedGame && (
        <Pressable style={styles.overlay} onPress={() => setSelectedGame(null)} />
      )}
      <GameCard game={selectedGame} onClose={() => setSelectedGame(null)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
  },
  label: {
    color: '#e8eaf0',
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.9)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
    letterSpacing: 0.3,
  },
  empty: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  emptyBody: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
  overlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
});