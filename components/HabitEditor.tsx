import React, { useEffect, useState } from 'react';
import {
  Modal, Pressable, ScrollView, StyleSheet, TextInput, View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from './Text';
import { Button } from './Button';
import { Habit } from '../storage/types';
import { HABIT_ICONS } from '../lib/icons';
import { colors, habitPalette, radii, spacing, typography } from '../theme/tokens';

export interface HabitDraft {
  name: string;
  icon: string;
  color: string;
}

interface HabitEditorProps {
  visible: boolean;
  habit?: Habit;
  onClose: () => void;
  onSave: (draft: HabitDraft) => void;
  onDelete?: () => void;
}

export function HabitEditor({ visible, habit, onClose, onSave, onDelete }: HabitEditorProps) {
  const [name, setName] = useState('');
  const [icon, setIcon] = useState<string>(HABIT_ICONS[0]);
  const [color, setColor] = useState<string>(habitPalette[0]);

  useEffect(() => {
    if (visible) {
      setName(habit?.name ?? '');
      setIcon(habit?.icon ?? HABIT_ICONS[0]);
      setColor(habit?.color ?? habitPalette[0]);
    }
  }, [visible, habit]);

  const canSave = name.trim().length > 0;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable style={styles.backdropPress} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
          >
            <Text variant="title">{habit ? 'Edit track' : 'New track'}</Text>

            {/* Live preview */}
            <View style={styles.preview}>
              <View style={[styles.previewChip, { backgroundColor: color }]}>
                <Ionicons name={icon as any} size={24} color={colors.dark} />
              </View>
              <Text variant="bodyStrong" numberOfLines={1} style={styles.flex}>
                {name.trim() || 'Your habit'}
              </Text>
            </View>

            <Text variant="label" style={styles.fieldLabel}>NAME</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="e.g. Meditate 5 minutes"
              placeholderTextColor={colors.textFaint}
              style={styles.input}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={() => canSave && onSave({ name: name.trim(), icon, color })}
            />

            <Text variant="label" style={styles.fieldLabel}>ICON</Text>
            <View style={styles.grid}>
              {HABIT_ICONS.map((ic) => {
                const active = ic === icon;
                return (
                  <Pressable
                    key={ic}
                    accessibilityRole="button"
                    onPress={() => setIcon(ic)}
                    style={[
                      styles.iconCell,
                      active && { backgroundColor: color, borderColor: color },
                    ]}
                  >
                    <Ionicons name={ic} size={22} color={active ? colors.dark : colors.textMuted} />
                  </Pressable>
                );
              })}
            </View>

            <Text variant="label" style={styles.fieldLabel}>COLOR</Text>
            <View style={styles.grid}>
              {habitPalette.map((c) => {
                const active = c === color;
                return (
                  <Pressable
                    key={c}
                    accessibilityRole="button"
                    onPress={() => setColor(c)}
                    style={[styles.colorCell, { backgroundColor: c }, active && styles.colorActive]}
                  >
                    {active ? <Ionicons name="checkmark" size={18} color={colors.dark} /> : null}
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.actions}>
              <Button
                label={habit ? 'Save changes' : 'Add track'}
                onPress={() => canSave && onSave({ name: name.trim(), icon, color })}
                disabled={!canSave}
              />
              <Button label="Cancel" variant="ghost" onPress={onClose} />
              {habit && onDelete ? (
                <Button label="Remove track" variant="danger" icon="trash-outline" onPress={onDelete} />
              ) : null}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(28, 28, 30, 0.5)',
  },
  backdropPress: { ...StyleSheet.absoluteFillObject },
  sheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    maxHeight: '88%',
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
  },
  handle: {
    width: 44,
    height: 5,
    borderRadius: radii.pill,
    backgroundColor: colors.borderStrong,
    alignSelf: 'center',
    marginTop: spacing.md,
  },
  content: { padding: spacing.xl, gap: spacing.sm },
  flex: { flex: 1 },
  preview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing.md,
    marginVertical: spacing.sm,
  },
  previewChip: {
    width: 48,
    height: 48,
    borderRadius: radii.sm + 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fieldLabel: { marginTop: spacing.md },
  input: {
    fontFamily: typography.body.fontFamily,
    fontSize: typography.body.fontSize,
    color: colors.text,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  iconCell: {
    width: 48,
    height: 48,
    borderRadius: radii.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorCell: {
    width: 44,
    height: 44,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorActive: { borderWidth: 3, borderColor: colors.dark },
  actions: { marginTop: spacing.lg, gap: spacing.sm },
});
