import React, { useState } from 'react';
import {
  Alert, Modal, Pressable, ScrollView, StyleSheet,
  TextInput, View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '../../components/Text';
import { useStore } from '../../storage/store';
import { PartnerTask } from '../../storage/types';

const TEAL = '#2EC4C4';
const TEAL_LIGHT = '#E3F7F5';
const TEAL_CARD = '#EBF8F6';

function DifficultyDots({ value }: { value: number }) {
  return (
    <View style={dots.row}>
      {Array.from({ length: 5 }, (_, i) => (
        <View key={i} style={[dots.dot, i < value && dots.dotFilled]} />
      ))}
    </View>
  );
}

const dots = StyleSheet.create({
  row: { flexDirection: 'row', gap: 4 },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#C8E8E6' },
  dotFilled: { backgroundColor: TEAL },
});

function TaskRow({
  task,
  onComplete,
  onReview,
  onRemove,
}: {
  task: PartnerTask;
  onComplete: () => void;
  onReview: () => void;
  onRemove: () => void;
}) {
  return (
    <Pressable onLongPress={onRemove} style={taskStyles.row}>
      <View style={taskStyles.info}>
        <View style={taskStyles.nameRow}>
          <Text style={[taskStyles.name, task.completed && taskStyles.nameDone]}>
            {task.name}
          </Text>
          {task.pendingReview && !task.completed && (
            <View style={taskStyles.reviewBadge}>
              <Text style={taskStyles.reviewText}>Pending review</Text>
            </View>
          )}
        </View>
        <DifficultyDots value={task.difficulty} />
      </View>
      <View style={taskStyles.actions}>
        {task.completed ? (
          <Pressable onPress={onComplete} style={[taskStyles.btn, taskStyles.btnDone]}>
            <Ionicons name="checkmark" size={20} color="#FFFFFF" />
          </Pressable>
        ) : task.pendingReview ? (
          <Pressable onPress={onReview} style={[taskStyles.btn, taskStyles.btnCamera]}>
            <Ionicons name="camera" size={18} color="#FFFFFF" />
          </Pressable>
        ) : (
          <Pressable onPress={onComplete} style={taskStyles.btn}>
            <Text style={taskStyles.btnCount}>{task.difficulty}</Text>
          </Pressable>
        )}
      </View>
    </Pressable>
  );
}

const taskStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: TEAL_CARD,
    borderRadius: 14,
    padding: 14,
    gap: 12,
  },
  info: { flex: 1, gap: 6 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  name: { fontSize: 15, fontWeight: '600', color: '#1A2A2A' },
  nameDone: { textDecorationLine: 'line-through', color: '#8ABAB8' },
  reviewBadge: {
    backgroundColor: '#C8EEEC',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  reviewText: { fontSize: 11, fontWeight: '600', color: TEAL },
  actions: { flexDirection: 'row', gap: 8 },
  btn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: TEAL,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnDone: { backgroundColor: TEAL },
  btnCamera: { backgroundColor: TEAL },
  btnCount: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
});

function AddTaskModal({
  visible,
  onClose,
  onAdd,
}: {
  visible: boolean;
  onClose: () => void;
  onAdd: (name: string, difficulty: number, assignedByMe: boolean) => void;
}) {
  const [name, setName] = useState('');
  const [difficulty, setDifficulty] = useState(3);
  const [assignedByMe, setAssignedByMe] = useState(false);

  const handleAdd = () => {
    if (!name.trim()) return;
    onAdd(name.trim(), difficulty, assignedByMe);
    setName('');
    setDifficulty(3);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={modal.overlay} onPress={onClose}>
        <Pressable style={modal.sheet} onPress={() => {}}>
          <View style={modal.handle} />
          <Text style={modal.title}>Add Task</Text>

          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Task name…"
            placeholderTextColor="#9AB0AE"
            style={modal.input}
            autoFocus
          />

          <Text style={modal.label}>Difficulty</Text>
          <View style={modal.diffRow}>
            {[1, 2, 3, 4, 5].map((d) => (
              <Pressable
                key={d}
                onPress={() => setDifficulty(d)}
                style={[modal.diffBtn, d <= difficulty && modal.diffBtnActive]}
              >
                <Text style={[modal.diffText, d <= difficulty && modal.diffTextActive]}>{d}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={modal.label}>Assign to</Text>
          <View style={modal.toggleRow}>
            <Pressable
              onPress={() => setAssignedByMe(false)}
              style={[modal.toggleBtn, !assignedByMe && modal.toggleBtnActive]}
            >
              <Text style={[modal.toggleText, !assignedByMe && modal.toggleTextActive]}>Me (from partner)</Text>
            </Pressable>
            <Pressable
              onPress={() => setAssignedByMe(true)}
              style={[modal.toggleBtn, assignedByMe && modal.toggleBtnActive]}
            >
              <Text style={[modal.toggleText, assignedByMe && modal.toggleTextActive]}>My partner</Text>
            </Pressable>
          </View>

          <Pressable
            onPress={handleAdd}
            style={[modal.addBtn, !name.trim() && modal.addBtnDisabled]}
          >
            <Text style={modal.addText}>Add Task</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const modal = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    gap: 16,
  },
  handle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: '#E0E0E0', alignSelf: 'center', marginBottom: 8,
  },
  title: { fontSize: 20, fontWeight: '700', color: '#1A2A2A' },
  input: {
    borderWidth: 1.5, borderColor: '#C8E8E6', borderRadius: 12,
    padding: 14, fontSize: 15, color: '#1A2A2A',
  },
  label: { fontSize: 13, fontWeight: '600', color: '#8ABAB8' },
  diffRow: { flexDirection: 'row', gap: 10 },
  diffBtn: {
    flex: 1, paddingVertical: 10, borderRadius: 10,
    borderWidth: 1.5, borderColor: '#C8E8E6', alignItems: 'center',
  },
  diffBtnActive: { backgroundColor: TEAL, borderColor: TEAL },
  diffText: { fontSize: 15, fontWeight: '600', color: '#8ABAB8' },
  diffTextActive: { color: '#FFFFFF' },
  toggleRow: { flexDirection: 'row', gap: 10 },
  toggleBtn: {
    flex: 1, paddingVertical: 10, borderRadius: 10,
    borderWidth: 1.5, borderColor: '#C8E8E6', alignItems: 'center',
  },
  toggleBtnActive: { backgroundColor: TEAL, borderColor: TEAL },
  toggleText: { fontSize: 13, fontWeight: '600', color: '#8ABAB8' },
  toggleTextActive: { color: '#FFFFFF' },
  addBtn: {
    backgroundColor: TEAL, borderRadius: 14,
    paddingVertical: 16, alignItems: 'center',
  },
  addBtnDisabled: { opacity: 0.45 },
  addText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
});

export default function PartnerScreen() {
  const insets = useSafeAreaInsets();
  const {
    partnerTasks, partnerProfile, addPartnerTask,
    completePartnerTask, setPendingReview, removePartnerTask, setPartnerProfile,
    userProfile,
  } = useStore();
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [partnerNameInput, setPartnerNameInput] = useState('');
  const [connecting, setConnecting] = useState(false);

  const myName = userProfile?.name ?? 'You';
  const partnerName = partnerProfile?.partnerName ?? null;
  const coins = partnerProfile?.coins ?? 0;

  const assignedToMe = partnerTasks.filter(t => !t.assignedByMe);
  const assignedByMe = partnerTasks.filter(t => t.assignedByMe);

  const handleConnect = () => {
    if (!partnerNameInput.trim()) return;
    setPartnerProfile({
      myCode: partnerProfile?.myCode ?? Math.random().toString(36).slice(2, 8).toUpperCase(),
      partnerName: partnerNameInput.trim(),
      coins: coins + 50,
    });
    setConnecting(false);
    setPartnerNameInput('');
  };

  const handleCompleteTask = (task: PartnerTask) => {
    if (!task.completed && !task.assignedByMe) {
      // Submitting for review before marking done
      setPendingReview(task.id, true);
    } else {
      completePartnerTask(task.id);
      if (!task.completed) {
        setPartnerProfile({
          ...(partnerProfile ?? { myCode: 'N/A', partnerName: null }),
          coins: (partnerProfile?.coins ?? 0) + 20,
        });
      }
    }
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Background teal */}
      <View style={styles.bgTop} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.headerArea}>
          <Text style={styles.heading}>See partner-assigned{'\n'}tasks</Text>
        </View>

        {/* Partner card */}
        <View style={styles.card}>
          {/* Partner profile row */}
          <View style={styles.partnerRow}>
            <View style={styles.partnerAvatar}>
              <Text style={styles.partnerAvatarText}>
                {partnerName ? partnerName.charAt(0).toUpperCase() : '?'}
              </Text>
            </View>
            <View style={styles.partnerInfo}>
              <Text style={styles.partnerName}>{partnerName ?? 'No partner yet'}</Text>
              <Text style={styles.partnerRole}>Executor</Text>
            </View>
            <View style={styles.coinsRow}>
              <View style={styles.coinBadge}>
                <Ionicons name="planet" size={16} color="#FFFFFF" />
                <Text style={styles.coinText}>{coins}</Text>
              </View>
              {partnerName && (
                <Pressable style={styles.msgBtn}>
                  <Ionicons name="chatbubble-outline" size={20} color={TEAL} />
                </Pressable>
              )}
            </View>
          </View>

          {/* Connect prompt */}
          {!partnerName && !connecting && (
            <Pressable onPress={() => setConnecting(true)} style={styles.connectBtn}>
              <Ionicons name="person-add-outline" size={18} color={TEAL} />
              <Text style={styles.connectText}>Connect with a partner</Text>
            </Pressable>
          )}

          {connecting && (
            <View style={styles.connectForm}>
              <TextInput
                value={partnerNameInput}
                onChangeText={setPartnerNameInput}
                placeholder="Partner's name…"
                placeholderTextColor="#9AB0AE"
                style={styles.connectInput}
                autoFocus
              />
              <Pressable onPress={handleConnect} style={styles.connectSubmit}>
                <Text style={styles.connectSubmitText}>Connect</Text>
              </Pressable>
            </View>
          )}

          {/* Tasks assigned to me */}
          {assignedToMe.length > 0 && (
            <View style={styles.taskSection}>
              <Text style={styles.taskSectionLabel}>FROM {(partnerName ?? 'PARTNER').toUpperCase()}</Text>
              {assignedToMe.map(task => (
                <TaskRow
                  key={task.id}
                  task={task}
                  onComplete={() => handleCompleteTask(task)}
                  onReview={() => completePartnerTask(task.id)}
                  onRemove={() => Alert.alert('Remove task', `Remove "${task.name}"?`, [
                    { text: 'Cancel' },
                    { text: 'Remove', style: 'destructive', onPress: () => removePartnerTask(task.id) },
                  ])}
                />
              ))}
            </View>
          )}

          {/* Tasks I assigned to partner */}
          {assignedByMe.length > 0 && (
            <View style={styles.taskSection}>
              <Text style={styles.taskSectionLabel}>ASSIGNED TO {(partnerName ?? 'PARTNER').toUpperCase()}</Text>
              {assignedByMe.map(task => (
                <TaskRow
                  key={task.id}
                  task={task}
                  onComplete={() => completePartnerTask(task.id)}
                  onReview={() => {}}
                  onRemove={() => Alert.alert('Remove task', `Remove "${task.name}"?`, [
                    { text: 'Cancel' },
                    { text: 'Remove', style: 'destructive', onPress: () => removePartnerTask(task.id) },
                  ])}
                />
              ))}
            </View>
          )}

          {partnerName && assignedToMe.length === 0 && assignedByMe.length === 0 && (
            <View style={styles.emptyTasks}>
              <Ionicons name="checkmark-circle-outline" size={40} color="#C8E8E6" />
              <Text style={styles.emptyTasksText}>No tasks yet. Add one below!</Text>
            </View>
          )}
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNum}>{assignedToMe.filter(t => t.completed).length}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNum}>{assignedToMe.filter(t => !t.completed).length}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNum}>{coins}</Text>
            <Text style={styles.statLabel}>Coins</Text>
          </View>
        </View>
      </ScrollView>

      {/* FAB */}
      <Pressable
        onPress={() => setAddModalOpen(true)}
        style={[styles.fab, { bottom: insets.bottom + 90 }]}
      >
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </Pressable>

      <AddTaskModal
        visible={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onAdd={addPartnerTask}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: TEAL_LIGHT },
  bgTop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: TEAL_LIGHT,
  },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 16, gap: 14, paddingTop: 16 },
  headerArea: { paddingHorizontal: 4 },
  heading: {
    fontSize: 28,
    fontWeight: '800',
    fontStyle: 'italic',
    color: '#0A2A2A',
    lineHeight: 36,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  partnerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  partnerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: TEAL,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#A8E8E4',
  },
  partnerAvatarText: { fontSize: 18, fontWeight: '700', color: '#FFFFFF' },
  partnerInfo: { flex: 1 },
  partnerName: { fontSize: 16, fontWeight: '700', color: '#1A2A2A' },
  partnerRole: { fontSize: 12, color: '#8ABAB8', fontWeight: '500' },
  coinsRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  coinBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: TEAL,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  coinText: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },
  msgBtn: {
    width: 36, height: 36, borderRadius: 18,
    borderWidth: 1.5, borderColor: '#C8E8E6',
    alignItems: 'center', justifyContent: 'center',
  },
  connectBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: TEAL_CARD, borderRadius: 12,
    padding: 14,
  },
  connectText: { fontSize: 14, fontWeight: '600', color: TEAL },
  connectForm: { gap: 10 },
  connectInput: {
    borderWidth: 1.5, borderColor: '#C8E8E6', borderRadius: 12,
    padding: 12, fontSize: 15, color: '#1A2A2A',
  },
  connectSubmit: {
    backgroundColor: TEAL, borderRadius: 12,
    paddingVertical: 12, alignItems: 'center',
  },
  connectSubmitText: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
  taskSection: { gap: 10 },
  taskSectionLabel: {
    fontSize: 11, fontWeight: '700', letterSpacing: 0.8, color: '#8ABAB8',
  },
  emptyTasks: { alignItems: 'center', paddingVertical: 24, gap: 10 },
  emptyTasksText: { fontSize: 14, color: '#8ABAB8', fontWeight: '500' },
  statsRow: { flexDirection: 'row', gap: 10 },
  statCard: {
    flex: 1, backgroundColor: '#FFFFFF', borderRadius: 16,
    padding: 16, alignItems: 'center', gap: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  statNum: { fontSize: 24, fontWeight: '800', color: TEAL },
  statLabel: { fontSize: 12, fontWeight: '500', color: '#8ABAB8' },
  fab: {
    position: 'absolute',
    right: 20,
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: TEAL,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: TEAL,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
});
