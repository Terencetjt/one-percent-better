import React, { useEffect } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
  interpolateColor,
  Easing,
} from 'react-native-reanimated';
import { colors, typography } from '../theme/tokens';
import { Habit } from '../storage/types';
import { Text } from './Text';

/** Flat-top hexagon: wider than tall (ratio ≈ 1 : 0.866). */
export const HEX_W = 158;
export const HEX_H = Math.round(HEX_W * 0.866); // ≈ 137

const HEX_CLIP = 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)';

// Applied only on web; React Native ignores unknown style props gracefully.
const webHexStyle: object =
  Platform.OS === 'web' ? ({ clipPath: HEX_CLIP } as any) : {};

// Native fallback: strongly rounded rect to approximate hex shape.
const nativeHexStyle = Platform.OS !== 'web' ? { borderRadius: 32 } : {};

interface HexHabitCardProps {
  habit: Habit;
  completed: boolean;
  streak: number;
  onToggle: () => void;
}

export function HexHabitCard({ habit, completed, streak, onToggle }: HexHabitCardProps) {
  const progress = useSharedValue(completed ? 1 : 0);
  const scale = useSharedValue(1);

  useEffect(() => {
    progress.value = withTiming(completed ? 1 : 0, {
      duration: 300,
      easing: Easing.out(Easing.cubic),
    });
  }, [completed, progress]);

  const handlePress = () => {
    scale.value = withSequence(
      withTiming(0.94, { duration: 80 }),
      withSpring(1, { damping: 8, stiffness: 200 }),
    );
    onToggle();
  };

  const cardAnim = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      [colors.surfaceAlt, habit.color],
    ),
  }));

  const textColor = completed ? colors.text : colors.textFaint;

  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: completed }}
      accessibilityLabel={habit.name}
      onPress={handlePress}
      style={styles.pressable}
    >
      <Animated.View style={[styles.hex, webHexStyle, nativeHexStyle, cardAnim]}>
        {/* Status icon row */}
        <View style={styles.iconRow}>
          {completed ? (
            <Ionicons name="checkmark-circle" size={18} color={colors.text} />
          ) : (
            <View style={styles.dot} />
          )}
        </View>

        {/* Streak number */}
        <Text style={[styles.number, { color: textColor }]}>{streak}</Text>

        {/* Habit name */}
        <Text
          variant="caption"
          numberOfLines={2}
          style={[styles.name, { color: textColor }]}
        >
          {habit.name}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    width: HEX_W,
    height: HEX_H,
  },
  hex: {
    width: HEX_W,
    height: HEX_H,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 2,
  },
  iconRow: {
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.textFaint,
  },
  number: {
    fontFamily: typography.sans,
    fontSize: 36,
    lineHeight: 40,
    fontWeight: '800',
  },
  name: {
    textAlign: 'center',
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '600',
  },
});
