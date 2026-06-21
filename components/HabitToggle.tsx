import React, { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
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
import { colors, radii, spacing } from '../theme/tokens';
import { Habit } from '../storage/types';
import { Text } from './Text';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface HabitToggleProps {
  habit: Habit;
  completed: boolean;
  onToggle: () => void;
}

/** List-row toggle used on the Tracks screen and in editors. */
export function HabitToggle({ habit, completed, onToggle }: HabitToggleProps) {
  const progress = useSharedValue(completed ? 1 : 0);
  const scale = useSharedValue(1);
  const checkScale = useSharedValue(completed ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(completed ? 1 : 0, {
      duration: 280,
      easing: Easing.out(Easing.cubic),
    });
    checkScale.value = completed
      ? withSpring(1, { damping: 9, stiffness: 160 })
      : withTiming(0, { duration: 140 });
  }, [completed, progress, checkScale]);

  const handlePress = () => {
    scale.value = withSequence(
      withTiming(0.97, { duration: 90 }),
      withSpring(1, { damping: 8, stiffness: 200 }),
    );
    onToggle();
  };

  const rowStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    backgroundColor: interpolateColor(progress.value, [0, 1], [colors.surface, colors.accentSoft]),
    borderColor: interpolateColor(progress.value, [0, 1], [colors.border, habit.color]),
  }));

  const chipStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(progress.value, [0, 1], [colors.surfaceAlt, habit.color]),
  }));

  const checkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
    opacity: checkScale.value,
  }));

  return (
    <AnimatedPressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: completed }}
      accessibilityLabel={habit.name}
      onPress={handlePress}
      style={[styles.row, rowStyle]}
    >
      <Animated.View style={[styles.chip, chipStyle]}>
        <Ionicons
          name={habit.icon as any}
          size={22}
          color={completed ? colors.dark : habit.color}
        />
      </Animated.View>

      <Text variant="bodyStrong" style={styles.name} numberOfLines={1}>
        {habit.name}
      </Text>

      <View style={[styles.checkWell, completed && { borderColor: habit.color }]}>
        <Animated.View style={[styles.checkFill, { backgroundColor: habit.color }, checkStyle]}>
          <Ionicons name="checkmark" size={18} color={colors.dark} />
        </Animated.View>
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radii.md,
    borderWidth: 1.5,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    gap: spacing.md,
  },
  chip: {
    width: 44,
    height: 44,
    borderRadius: radii.sm + 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: { flex: 1 },
  checkWell: {
    width: 28,
    height: 28,
    borderRadius: radii.pill,
    borderWidth: 2,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  checkFill: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
