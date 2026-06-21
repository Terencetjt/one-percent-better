import React from 'react';
import { View } from 'react-native';
import { HexHabitCard, HEX_W, HEX_H } from './HexHabitCard';
import { Habit, DailyEntry } from '../storage/types';
import { habitStreak } from '../lib/stats';

const GAP = 6;
const COL_X = HEX_W + GAP;        // x-start of column 1
const ROW_H = HEX_H + GAP;         // vertical step per row within a column
// Column 1 is vertically offset by half a hex height to create the honeycomb interlock.
const COL1_OFFSET_Y = HEX_H / 2;

interface HexGridProps {
  habits: Habit[];
  entry: DailyEntry;
  entries: Record<string, DailyEntry>;
  onToggle: (habitId: string) => void;
}

/**
 * Two-column flat-top honeycomb grid.
 *
 * Column 0  y = 0,   ROW_H,   2×ROW_H, …
 * Column 1  y = COL1_OFFSET_Y, COL1_OFFSET_Y+ROW_H, …
 *
 * This stagger makes adjacent hexes share an edge, giving the tessellation.
 */
export function HexGrid({ habits, entry, entries, onToggle }: HexGridProps) {
  if (habits.length === 0) return null;

  const positions = habits.map((_, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    return {
      x: col * COL_X,
      y: row * ROW_H + (col === 1 ? COL1_OFFSET_Y : 0),
    };
  });

  const maxY = Math.max(...positions.map((p) => p.y));
  const containerH = maxY + HEX_H;
  const containerW = habits.length === 1 ? HEX_W : HEX_W * 2 + GAP;

  return (
    <View style={{ height: containerH, width: containerW, alignSelf: 'center' }}>
      {habits.map((habit, i) => (
        <View
          key={habit.id}
          style={{ position: 'absolute', left: positions[i].x, top: positions[i].y }}
        >
          <HexHabitCard
            habit={habit}
            completed={!!entry.habitCompletions[habit.id]}
            streak={habitStreak(habit.id, entries)}
            onToggle={() => onToggle(habit.id)}
          />
        </View>
      ))}
    </View>
  );
}
