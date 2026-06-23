import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from './Text';
import { Habit } from '../storage/types';

const CARD_BG = [
  '#E0F2EE', // mint
  '#FAE8E2', // peach
  '#E3EDF7', // sky blue
  '#FAE3EA', // rose pink
  '#EAE3F7', // lavender
  '#FFF3E0', // warm cream
];

interface HabitCardProps {
  habit: Habit;
  completed: boolean;
  index: number;
  onToggle: () => void;
  onLongPress?: () => void;
}

export function HabitCard({ habit, completed, index, onToggle, onLongPress }: HabitCardProps) {
  const cardBg = CARD_BG[index % CARD_BG.length];

  return (
    <Pressable
      onPress={onToggle}
      onLongPress={onLongPress}
      delayLongPress={400}
      accessibilityRole="button"
      accessibilityLabel={`${habit.name}, ${completed ? 'completed' : 'not completed'}`}
      style={({ pressed }) => [styles.card, { backgroundColor: cardBg }, pressed && styles.pressed]}
    >
      {/* Icon */}
      <View style={[styles.iconWrap, { backgroundColor: habit.color + '30' }]}>
        <Ionicons name={habit.icon as any} size={26} color={habit.color} />
      </View>

      {/* Info */}
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{habit.name}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{completed ? '1/1' : '0/1'}</Text>
        </View>
      </View>

      {/* Action */}
      <View style={[styles.action, completed && styles.actionDone]}>
        <Ionicons
          name={completed ? 'checkmark' : 'add'}
          size={18}
          color={completed ? '#FFFFFF' : '#9A9AB0'}
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  pressed: { opacity: 0.82, transform: [{ scale: 0.98 }] },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: { flex: 1, gap: 4 },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A2E',
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0,0,0,0.07)',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#4A4A6A',
  },
  action: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#C8C8D8',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  actionDone: {
    backgroundColor: '#5C67EE',
    borderColor: '#5C67EE',
  },
});
