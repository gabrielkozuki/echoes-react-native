import React, { useEffect, useMemo } from 'react';
import {
  Canvas,
  Group,
  LinearGradient as SkiaLinearGradient,
  Path,
  Rect,
  vec,
  Points
} from '@shopify/react-native-skia';
import {
  Easing,
  useDerivedValue,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { getGenreColor } from '@/presentation/theme/colors';
import { GameNode } from '../useConstellationViewModel';

export const CANVAS_PADDING_TOP = 120;
export const CANVAS_PADDING_BOTTOM = 60;
const STAR_COUNT = 50;

interface Props {
  drawW: number;
  drawH: number;
  games: GameNode[];
}

function fourPointedStar(R: number): string { // SVG path for a four-pointed star
  const r = R * 0.3;
  const d = r * 0.707;
  return `M 0 ${-R} L ${d} ${-d} L ${R} 0 L ${d} ${d} L 0 ${R} L ${-d} ${d} L ${-R} 0 L ${-d} ${-d} Z`;
}

export function ConstellationCanvas({ drawW, drawH, games }: Props) {
  const absoluteH = drawH > 0 ? drawH + CANVAS_PADDING_TOP + CANVAS_PADDING_BOTTOM : 0;
  const progress = useSharedValue(0);

  
  const starVectors = useMemo(() => { // generate random positions for background stars
    return Array.from({ length: STAR_COUNT }).map(() =>
      vec(Math.random() * drawW, Math.random() * absoluteH)
    );
  }, [drawW, absoluteH]);

  useEffect(() => { // pulse animation loop
    progress.value = withRepeat(
      withTiming(1, { duration: 2600, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, []);

  // star ring effect
  const outerGlowOpacity = useDerivedValue(() => progress.value * 0.35);
  const innerGlowOpacity = useDerivedValue(() => 0.1 + progress.value * 0.55);
  const starOpacity      = useDerivedValue(() => 0.55 + progress.value * 0.40);

  if (absoluteH === 0) return null;

  return (
    <Canvas style={{ position: 'absolute', top: 0, left: 0, width: drawW, height: absoluteH }}>
      <Rect x={0} y={0} width={drawW} height={absoluteH}>
        <SkiaLinearGradient
          start={vec(0, 0)}
          end={vec(drawW * 0.5, absoluteH)}
          colors={['#0d0b22', '#090914', '#060a1c']}
        />
      </Rect>

      <Points
        points={starVectors}
        mode="points"
        color="rgba(255,255,255,0.35)"
        strokeWidth={2}
        strokeCap="round"
      />

      <Group transform={[{ translateY: CANVAS_PADDING_TOP }]}>
        {games.map(game => {
          const color = getGenreColor(game.gameGenre);
          const R = game.visualRadius;

          return (
            <Group
              key={game.gameId}
              transform={[{ translateX: game.x }, { translateY: game.y }]}
            >
              <Path path={fourPointedStar(R * 2.0)} color={color + 'ff'} opacity={outerGlowOpacity} />
              <Path path={fourPointedStar(R * 1.4)} color={color + 'ff'} opacity={innerGlowOpacity} />
              <Path path={fourPointedStar(R)} color={color + 'ff'} opacity={starOpacity} />
            </Group>
          );
        })}
      </Group>
    </Canvas>
  );
}
