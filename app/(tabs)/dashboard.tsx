import React, { useState, useRef } from 'react';
import {
  Pressable, ScrollView, StyleSheet, TextInput, View, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PlanCalendar } from '../../components/PlanCalendar';
import { Text } from '../../components/Text';
import { useStore } from '../../storage/store';
import { DatePromise } from '../../storage/types';
import { todayISO } from '../../lib/date';
import { fromISODate } from '../../lib/date';

function formatSelectedDate(iso: string): string {
  const d = fromISODate(iso);
  const today = todayISO();
  if (iso === today) return 'Today';
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

function PromiseRow({
  promise,
  onToggle,
  onRemove,
}: {
  promise: DatePromise;
  onToggle: () => void;
  onRemove: () => void;
}) {
  const isMe = promise.owner === 'me';
  return (
    <Pressable
      onLongPress={onRemove}
      onPress={onToggle}
      style={[styles.promiseRow, promise.completed && styles.promiseRowDone]}
    >
      <View style={[styles.checkCircle, promise.completed && (isMe ? styles.checkDoneMe : styles.checkDonePartner)]}>
        {promise.completed && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
      </View>
      <View style={styles.promiseInfo}>
        <Text style={[styles.promiseText, promise.completed && styles.promiseTextDone]}>
          {promise.text}
        </Text>
        <View style={[styles.ownerBadge, isMe ? styles.ownerBadgeMe : styles.ownerBadgePartner]}>
          <Text style={[styles.ownerBadgeText, isMe ? styles.ownerBadgeTextMe : styles.ownerBadgeTextPartner]}>
            {isMe ? 'Mine' : 'Partner\'s'}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

export default function DatesScreen() {
  const insets = useSafeAreaInsets();
  const { datePlans, addPromise, togglePromise, removePromise, userProfile } = useStore();

  const today = todayISO();
  const todayDate = fromISODate(today);

  const [viewYear, setViewYear] = useState(todayDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(todayDate.getMonth());
  const [selectedDate, setSelectedDate] = useState(today);
  const [inputText, setInputText] = useState('');
  const [inputOwner, setInputOwner] = useState<'me' | 'partner'>('me');
  const inputRef = useRef<TextInput>(null);

  const goPrev = () => setViewMonth(m => { if (m === 0) { setViewYear(y => y - 1); return 11; } return m - 1; });
  const goNext = () => setViewMonth(m => { if (m === 11) { setViewYear(y => y + 1); return 0; } return m + 1; });

  const promises = datePlans[selectedDate] ?? [];
  const myPromises = promises.filter(p => p.owner === 'me');
  const partnerPromises = promises.filter(p => p.owner === 'partner');

  const handleAdd = () => {
    if (!inputText.trim()) return;
    addPromise(selectedDate, inputText.trim(), inputOwner);
    setInputText('');
    inputRef.current?.focus();
  };

  const handleRemove = (promise: DatePromise) => {
    Alert.alert('Remove promise', `Remove "${promise.text}"?`, [
      { text: 'Cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => removePromise(selectedDate, promise.id) },
    ]);
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Dates & Promises</Text>
          <Text style={styles.subtitle}>Plan together, keep your word</Text>
        </View>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {userProfile ? userProfile.name.charAt(0).toUpperCase() : '♡'}
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Calendar */}
        <PlanCalendar
          year={viewYear}
          month={viewMonth}
          datePlans={datePlans}
          selectedDate={selectedDate}
          onSelectDay={(date) => { setSelectedDate(date); }}
          onPrevMonth={goPrev}
          onNextMonth={goNext}
        />

        {/* Selected date */}
        <View style={styles.section}>
          <View style={styles.sectionRow}>
            <Text style={styles.sectionLabel}>
              {formatSelectedDate(selectedDate).toUpperCase()}
            </Text>
            {promises.length > 0 && (
              <Text style={styles.sectionCount}>
                {promises.filter(p => p.completed).length}/{promises.length} kept
              </Text>
            )}
          </View>

          {/* My promises */}
          {myPromises.length > 0 && (
            <View style={styles.group}>
              <Text style={styles.groupLabel}>MY PROMISES</Text>
              {myPromises.map(p => (
                <PromiseRow
                  key={p.id}
                  promise={p}
                  onToggle={() => togglePromise(selectedDate, p.id)}
                  onRemove={() => handleRemove(p)}
                />
              ))}
            </View>
          )}

          {/* Partner promises */}
          {partnerPromises.length > 0 && (
            <View style={styles.group}>
              <Text style={[styles.groupLabel, styles.groupLabelPartner]}>PARTNER'S PROMISES</Text>
              {partnerPromises.map(p => (
                <PromiseRow
                  key={p.id}
                  promise={p}
                  onToggle={() => togglePromise(selectedDate, p.id)}
                  onRemove={() => handleRemove(p)}
                />
              ))}
            </View>
          )}

          {promises.length === 0 && (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyEmoji}>🤝</Text>
              <Text style={styles.emptyTitle}>No promises yet</Text>
              <Text style={styles.emptyBody}>
                Add a promise below — a plan, a commitment, or a date idea.
              </Text>
            </View>
          )}
        </View>

        {/* Add promise input */}
        <View style={styles.inputCard}>
          <Text style={styles.inputCardLabel}>ADD A PROMISE</Text>

          {/* Owner toggle */}
          <View style={styles.ownerToggle}>
            {(['me', 'partner'] as const).map(o => (
              <Pressable
                key={o}
                onPress={() => setInputOwner(o)}
                style={[styles.ownerBtn, inputOwner === o && styles.ownerBtnActive]}
              >
                <Text style={[styles.ownerBtnText, inputOwner === o && styles.ownerBtnTextActive]}>
                  {o === 'me' ? 'Mine' : "Partner's"}
                </Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.inputRow}>
            <TextInput
              ref={inputRef}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Write a promise…"
              placeholderTextColor="#B0B0C8"
              style={styles.input}
              returnKeyType="done"
              onSubmitEditing={handleAdd}
              multiline={false}
            />
            <Pressable
              onPress={handleAdd}
              style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]}
            >
              <Ionicons name="add" size={22} color="#FFFFFF" />
            </Pressable>
          </View>
        </View>
      </ScrollView>
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
  title: { fontSize: 22, fontWeight: '700', color: '#1A1A2E' },
  subtitle: { fontSize: 13, color: '#8A8A9A', marginTop: 2 },
  avatar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#5C67EE',
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 16, gap: 16, paddingTop: 12 },
  section: { gap: 10 },
  sectionRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', paddingHorizontal: 4,
  },
  sectionLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 0.8, color: '#9A9AB0' },
  sectionCount: { fontSize: 11, fontWeight: '600', color: '#5C67EE' },
  group: { gap: 8 },
  groupLabel: {
    fontSize: 10, fontWeight: '700', letterSpacing: 0.6,
    color: '#5C67EE', paddingLeft: 2,
  },
  groupLabelPartner: { color: '#2EC4C4' },
  promiseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  promiseRowDone: { opacity: 0.6 },
  checkCircle: {
    width: 26, height: 26, borderRadius: 13,
    borderWidth: 2, borderColor: '#C8C8D8',
    alignItems: 'center', justifyContent: 'center',
  },
  checkDoneMe: { backgroundColor: '#5C67EE', borderColor: '#5C67EE' },
  checkDonePartner: { backgroundColor: '#2EC4C4', borderColor: '#2EC4C4' },
  promiseInfo: { flex: 1, gap: 4 },
  promiseText: { fontSize: 15, fontWeight: '500', color: '#1A1A2E' },
  promiseTextDone: { textDecorationLine: 'line-through', color: '#9A9AB0' },
  ownerBadge: {
    alignSelf: 'flex-start',
    borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2,
  },
  ownerBadgeMe: { backgroundColor: '#EEF0FD' },
  ownerBadgePartner: { backgroundColor: '#E3F7F5' },
  ownerBadgeText: { fontSize: 11, fontWeight: '600' },
  ownerBadgeTextMe: { color: '#5C67EE' },
  ownerBadgeTextPartner: { color: '#2EC4C4' },
  emptyCard: {
    backgroundColor: '#FFFFFF', borderRadius: 16, padding: 32,
    alignItems: 'center', gap: 8,
    borderWidth: 2, borderColor: '#EEEEF6', borderStyle: 'dashed',
  },
  emptyEmoji: { fontSize: 32 },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: '#1A1A2E' },
  emptyBody: { fontSize: 14, color: '#8A8A9A', textAlign: 'center' },
  inputCard: {
    backgroundColor: '#FFFFFF', borderRadius: 20, padding: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  inputCardLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 0.8, color: '#9A9AB0' },
  ownerToggle: { flexDirection: 'row', gap: 8 },
  ownerBtn: {
    flex: 1, paddingVertical: 9, borderRadius: 10,
    borderWidth: 1.5, borderColor: '#E0E0EE',
    alignItems: 'center',
  },
  ownerBtnActive: { backgroundColor: '#5C67EE', borderColor: '#5C67EE' },
  ownerBtnText: { fontSize: 13, fontWeight: '600', color: '#9A9AB0' },
  ownerBtnTextActive: { color: '#FFFFFF' },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  input: {
    flex: 1,
    backgroundColor: '#F7F7FA',
    borderRadius: 12,
    borderWidth: 1.5, borderColor: '#E0E0EE',
    paddingHorizontal: 14, paddingVertical: 11,
    fontSize: 15, color: '#1A1A2E',
  },
  sendBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#5C67EE',
    alignItems: 'center', justifyContent: 'center',
  },
  sendBtnDisabled: { backgroundColor: '#D0D0E8' },
});
