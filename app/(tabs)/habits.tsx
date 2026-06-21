import React, { useState } from 'react';
import { Platform, Pressable, StyleSheet, Switch, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { Layout, FadeIn, FadeOut } from 'react-native-reanimated';
import { Screen } from '../../components/Screen';
import { Text } from '../../components/Text';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { SectionLabel } from '../../components/SectionLabel';
import { EmptyState } from '../../components/EmptyState';
import { HabitEditor, HabitDraft } from '../../components/HabitEditor';
import { useStore } from '../../storage/store';
import { Habit } from '../../storage/types';
import { prettyMedium } from '../../lib/date';
import { colors, radii, spacing, typography } from '../../theme/tokens';

export default function HabitsScreen() {
  const { habits, addHabit, updateHabit, removeHabit, userProfile, updateReminderSettings } = useStore();
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<Habit | undefined>(undefined);
  const [reminderTime, setReminderTime] = useState(userProfile?.reminderTime ?? '21:00');

  const openNew = () => { setEditing(undefined); setEditorOpen(true); };
  const openEdit = (habit: Habit) => { setEditing(habit); setEditorOpen(true); };

  const handleSave = (draft: HabitDraft) => {
    if (editing) { updateHabit(editing.id, draft); } else { addHabit(draft); }
    setEditorOpen(false);
  };
  const handleDelete = () => {
    if (editing) removeHabit(editing.id);
    setEditorOpen(false);
  };

  const handleToggleReminder = (value: boolean) => {
    updateReminderSettings(value, reminderTime);
  };
  const handleTimeBlur = () => {
    // Validate HH:MM format
    const match = reminderTime.match(/^(\d{1,2}):(\d{2})$/);
    if (match) {
      const h = Math.min(23, Number(match[1]));
      const m = Math.min(59, Number(match[2]));
      const normalised = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
      setReminderTime(normalised);
      if (userProfile?.reminderEnabled) {
        updateReminderSettings(true, normalised);
      }
    } else {
      setReminderTime(userProfile?.reminderTime ?? '21:00');
    }
  };

  return (
    <>
      <Screen>
        <View style={styles.header}>
          <Text variant="label">WHAT YOU'RE GROWING</Text>
          <Text variant="display">Tracks</Text>
          <Text variant="body">
            The habits you tend to each day. Tap one to edit.
          </Text>
        </View>

        {habits.length === 0 ? (
          <Card>
            <EmptyState
              icon="add-circle-outline"
              title="Start with one"
              message="Pick a single habit you'd like to improve by 1% a day."
            />
          </Card>
        ) : (
          <View style={styles.list}>
            {habits.map((habit) => (
              <Animated.View
                key={habit.id}
                layout={Layout.springify()}
                entering={FadeIn.duration(250)}
                exiting={FadeOut.duration(180)}
              >
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Edit ${habit.name}`}
                  onPress={() => openEdit(habit)}
                  style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
                >
                  <View style={[styles.chip, { backgroundColor: habit.color }]}>
                    <Ionicons name={habit.icon as any} size={22} color={colors.dark} />
                  </View>
                  <View style={styles.flex}>
                    <Text variant="bodyStrong" numberOfLines={1}>{habit.name}</Text>
                    <Text variant="caption">
                      Tracking since {prettyMedium(habit.createdAt.slice(0, 10))}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={colors.textFaint} />
                </Pressable>
              </Animated.View>
            ))}
          </View>
        )}

        <Button label="Add a track" icon="add" onPress={openNew} />

        {/* Reminder settings — native only (no push on web) */}
        {Platform.OS !== 'web' && userProfile && (
          <View>
            <SectionLabel>iPhone Reminders</SectionLabel>
            <Card>
              <View style={styles.reminderRow}>
                <View style={styles.flex}>
                  <Text variant="bodyStrong">Daily reminder</Text>
                  <Text variant="caption">
                    Nudge me to log habits and learning
                  </Text>
                </View>
                <Switch
                  value={userProfile.reminderEnabled}
                  onValueChange={handleToggleReminder}
                  trackColor={{ false: colors.border, true: colors.accent }}
                  thumbColor={colors.surface}
                />
              </View>

              {userProfile.reminderEnabled && (
                <View style={styles.timeRow}>
                  <Ionicons name="time-outline" size={18} color={colors.accent} />
                  <Text variant="body" color={colors.text}>Reminder time</Text>
                  <TextInput
                    value={reminderTime}
                    onChangeText={setReminderTime}
                    onBlur={handleTimeBlur}
                    placeholder="21:00"
                    placeholderTextColor={colors.textFaint}
                    keyboardType="numbers-and-punctuation"
                    style={styles.timeInput}
                    maxLength={5}
                  />
                </View>
              )}
            </Card>
          </View>
        )}

        {/* Profile footer */}
        {userProfile && (
          <View style={styles.profileRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {userProfile.name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.flex}>
              <Text variant="bodyStrong">{userProfile.name}</Text>
              <Text variant="caption">Your data is private & stored on-device</Text>
            </View>
            <Ionicons name="lock-closed-outline" size={18} color={colors.textFaint} />
          </View>
        )}
      </Screen>

      <HabitEditor
        visible={editorOpen}
        habit={editing}
        onClose={() => setEditorOpen(false)}
        onSave={handleSave}
        onDelete={editing ? handleDelete : undefined}
      />
    </>
  );
}

const styles = StyleSheet.create({
  header: { gap: spacing.xs },
  flex: { flex: 1 },
  list: { gap: spacing.sm },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  rowPressed: { opacity: 0.7, transform: [{ scale: 0.99 }] },
  chip: {
    width: 48,
    height: 48,
    borderRadius: radii.sm + 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reminderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  timeInput: {
    marginLeft: 'auto',
    fontFamily: typography.bodyStrong.fontFamily,
    fontSize: typography.bodyStrong.fontSize,
    fontWeight: '700',
    color: colors.text,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minWidth: 70,
    textAlign: 'center',
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: radii.pill,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.dark,
  },
});
