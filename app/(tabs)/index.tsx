import React, { useState } from 'react';
import {
  Pressable, ScrollView, StyleSheet, TextInput, View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WeekStrip } from '../../components/WeekStrip';
import { HabitCard } from '../../components/HabitCard';
import { HabitEditor, HabitDraft } from '../../components/HabitEditor';
import { Text } from '../../components/Text';
import { useStore } from '../../storage/store';
import { Habit } from '../../storage/types';
import { todayISO } from '../../lib/date';

function greeting(name: string): string {
  const h = new Date().getHours();
  if (h < 12) return `Good morning, ${name} ☀️`;
  if (h < 17) return `Good afternoon, ${name}`;
  return `Good evening, ${name} 🌙`;
}

function formatDisplayDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

export default function TodayScreen() {
  const {
    habits, entries, getEntry, toggleHabit, setLearning,
    addHabit, updateHabit, removeHabit, userProfile,
  } = useStore();

  const insets = useSafeAreaInsets();
  const today = todayISO();
  const [selectedDate, setSelectedDate] = useState(today);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | undefined>(undefined);

  const entry = getEntry(selectedDate);
  const isToday = selectedDate === today;
  const completedCount = habits.filter(h => entry?.habitCompletions[h.id]).length;
  const allDone = habits.length > 0 && completedCount === habits.length;

  const openAdd = () => { setEditingHabit(undefined); setEditorOpen(true); };
  const openEdit = (habit: Habit) => { setEditingHabit(habit); setEditorOpen(true); };

  const handleSave = (draft: HabitDraft) => {
    if (editingHabit) { updateHabit(editingHabit.id, draft); }
    else { addHabit(draft); }
    setEditorOpen(false);
  };

  const handleDelete = () => {
    if (editingHabit) removeHabit(editingHabit.id);
    setEditorOpen(false);
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.greeting}>
            {userProfile ? greeting(userProfile.name) : 'Today'}
          </Text>
          <Text style={styles.dateLabel}>{formatDisplayDate(selectedDate)}</Text>
        </View>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {userProfile ? userProfile.name.charAt(0).toUpperCase() : '1%'}
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 110 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Week strip */}
        <WeekStrip selectedDate={selectedDate} onSelectDate={setSelectedDate} />

        {/* Progress pill */}
        {habits.length > 0 && (
          <View style={styles.progressRow}>
            <View style={[styles.progressPill, allDone && styles.progressPillDone]}>
              <Ionicons
                name={allDone ? 'checkmark-circle' : 'ellipse-outline'}
                size={16}
                color={allDone ? '#FFFFFF' : '#5C67EE'}
              />
              <Text style={[styles.progressText, allDone && styles.progressTextDone]}>
                {allDone ? 'All done today! 🎉' : `${completedCount} of ${habits.length} complete`}
              </Text>
            </View>
          </View>
        )}

        {/* Habits */}
        <View style={styles.section}>
          <View style={styles.sectionRow}>
            <Text style={styles.sectionLabel}>
              {isToday ? "TODAY'S TRACKS" : formatDisplayDate(selectedDate).toUpperCase()}
            </Text>
            {habits.length > 0 && (
              <Text style={styles.sectionHint}>Hold to edit</Text>
            )}
          </View>

          {habits.length === 0 ? (
            <Pressable onPress={openAdd} style={styles.emptyCard}>
              <Ionicons name="add-circle-outline" size={40} color="#C8C8D8" />
              <Text style={styles.emptyTitle}>Add your first habit</Text>
              <Text style={styles.emptyBody}>Tap here or the + button to get started.</Text>
            </Pressable>
          ) : (
            <View style={styles.habitList}>
              {habits.map((habit, idx) => (
                <HabitCard
                  key={habit.id}
                  habit={habit}
                  completed={!!entry?.habitCompletions[habit.id]}
                  index={idx}
                  onToggle={() => toggleHabit(selectedDate, habit.id)}
                  onLongPress={() => openEdit(habit)}
                />
              ))}
            </View>
          )}
        </View>

        {/* Learning */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>TODAY'S LEARNING</Text>
          <View style={styles.learningCard}>
            <View style={styles.learningHeader}>
              <Ionicons name="pencil-outline" size={16} color="rgba(250,250,247,0.7)" />
              <Text style={styles.learningPrompt}>What's one thing you learned today?</Text>
            </View>
            <TextInput
              value={entry.learning}
              onChangeText={(text) => setLearning(selectedDate, text)}
              placeholder="A small insight, a reflection…"
              placeholderTextColor="rgba(250,250,247,0.35)"
              multiline
              style={styles.learningInput}
              textAlignVertical="top"
              editable={isToday}
            />
            <View style={styles.autosave}>
              <Ionicons name="cloud-done-outline" size={12} color="rgba(250,250,247,0.4)" />
              <Text style={styles.autosaveText}>Saved automatically</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Add habit FAB */}
      <Pressable
        onPress={openAdd}
        style={[styles.fab, { bottom: insets.bottom + 90 }]}
        accessibilityLabel="Add habit"
        accessibilityRole="button"
      >
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </Pressable>

      <HabitEditor
        visible={editorOpen}
        habit={editingHabit}
        onClose={() => setEditorOpen(false)}
        onSave={handleSave}
        onDelete={editingHabit ? handleDelete : undefined}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F7F7FA' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  headerLeft: { flex: 1 },
  greeting: { fontSize: 22, fontWeight: '700', color: '#1A1A2E' },
  dateLabel: { fontSize: 13, color: '#8A8A9A', marginTop: 2 },
  avatar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#5C67EE',
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 16, gap: 16, paddingTop: 12 },
  progressRow: { alignItems: 'flex-start' },
  progressPill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#EEF0FD', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
  },
  progressPillDone: { backgroundColor: '#5C67EE' },
  progressText: { fontSize: 13, fontWeight: '600', color: '#5C67EE' },
  progressTextDone: { color: '#FFFFFF' },
  section: { gap: 10 },
  sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 4 },
  sectionLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 0.8, color: '#9A9AB0' },
  sectionHint: { fontSize: 11, color: '#C0C0D0' },
  habitList: { gap: 10 },
  emptyCard: {
    backgroundColor: '#FFFFFF', borderRadius: 16, padding: 32,
    alignItems: 'center', gap: 10,
    borderWidth: 2, borderColor: '#EEEEF6', borderStyle: 'dashed',
  },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: '#1A1A2E' },
  emptyBody: { fontSize: 14, color: '#8A8A9A', textAlign: 'center' },
  learningCard: {
    backgroundColor: '#1C1C2E', borderRadius: 20, padding: 18, gap: 12,
  },
  learningHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  learningPrompt: { fontSize: 14, fontWeight: '600', color: 'rgba(250,250,247,0.85)', flex: 1 },
  learningInput: {
    minHeight: 90, fontSize: 15, lineHeight: 22, color: '#FAFAF7',
    backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 12, padding: 12,
  },
  autosave: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  autosaveText: { fontSize: 11, color: 'rgba(250,250,247,0.4)' },
  fab: {
    position: 'absolute', right: 20,
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: '#5C67EE',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#5C67EE',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4, shadowRadius: 12, elevation: 8,
  },
});
