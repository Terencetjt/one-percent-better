import React, { useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView, Platform, Pressable,
  ScrollView, StyleSheet, TextInput, View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '../../components/Text';
import { useStore } from '../../storage/store';
import { currentStreak, completionRate, completedCount } from '../../lib/stats';
import { todayISO } from '../../lib/date';
import { Habit, DailyEntry } from '../../storage/types';

type Message = { id: string; from: 'jarvis' | 'user'; text: string };

function timeOfDay(): string {
  const h = new Date().getHours();
  if (h < 6) return 'the early hours';
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  if (h < 21) return 'evening';
  return 'night';
}

function getJarvisResponse(
  input: string,
  habits: Habit[],
  entries: Record<string, DailyEntry>,
  userName: string | null,
): string {
  const today = todayISO();
  const entry = entries[today];
  const done = habits.filter(h => entry?.habitCompletions[h.id]).length;
  const total = habits.length;
  const remaining = total - done;
  const streak = currentStreak(entries);
  const rate = completionRate({ habits, entries, favorites: [], userProfile: null, partnerTasks: [], partnerProfile: null, datePlans: {} }, 7);
  const name = userName ? `, ${userName}` : '';
  const msg = input.toLowerCase().trim();

  if (/^(hello|hi|hey|good|jarvis|wake|online)/.test(msg)) {
    return `Good ${timeOfDay()}${name}. All systems are online. Currently monitoring ${total} active track${total !== 1 ? 's' : ''}. Today's completion: ${done}/${total}.${remaining > 0 ? ` ${remaining} track${remaining !== 1 ? 's' : ''} remain${remaining === 1 ? 's' : ''} to be completed.` : ' All tracks complete. Outstanding discipline.'}`;
  }

  if (/(status|how.*(am i|doing|going|performing)|progress|update|report|brief)/.test(msg)) {
    return `CURRENT STATUS REPORT:\n\n• Streak: ${streak} day${streak !== 1 ? 's' : ''}\n• 7-day compliance: ${rate}%\n• Today: ${done}/${total} complete\n\n${rate >= 80 ? 'Performance is exceptional. Maintain trajectory.' : rate >= 50 ? 'Solid performance. Identify and eliminate failure points.' : 'Performance below optimal threshold. Course correction recommended.'}`;
  }

  if (/streak/.test(msg)) {
    if (streak === 0) return `No active streak detected${name}. Complete all ${total} tracks today to initiate one. Every streak begins with a single day.`;
    if (streak >= 30) return `Active streak: ${streak} days. That is Iron Man-level commitment. I'm impressed — and I don't impress easily.`;
    if (streak >= 14) return `${streak}-day streak active. Two weeks of consistent action. The compound effect is beginning to manifest.`;
    if (streak >= 7) return `${streak}-day streak. A full week of discipline. Momentum is your most valuable asset right now — protect it.`;
    return `${streak}-day streak active. Keep the chain unbroken. Consistency is the ultimate differentiator.`;
  }

  if (/(left|remaining|incomplete|not done|still|haven't|haven.t)/.test(msg)) {
    const incomplete = habits.filter(h => !entry?.habitCompletions[h.id]);
    if (incomplete.length === 0) return `All ${total} tracks complete today${name}. You are operating at full capacity. Enjoy the rest of the day.`;
    return `Incomplete tracks (${incomplete.length}):\n${incomplete.map((h, i) => `${i + 1}. ${h.name}`).join('\n')}\n\nI recommend addressing these in the order listed.`;
  }

  if (/(my habits?|all habits?|list|show me|what.*track|which.*track)/.test(msg)) {
    if (total === 0) return `No tracks configured${name}. Navigate to the Tracks tab to define your habits. I'll monitor them from there.`;
    return `Active tracks (${total}):\n${habits.map((h, i) => `${i + 1}. ${h.name} — ${entry?.habitCompletions[h.id] ? '✓ done' : '○ pending'}`).join('\n')}`;
  }

  if (/(advice|tip|suggest|recommend|help me|motivat|inspire|what should)/.test(msg)) {
    const pool = [
      `The Iron Man suit wasn't built in a day. Your habits compound the same way — 1% daily improvement yields 37x results in a year. Trust the math.`,
      `I've analyzed your pattern. The most effective improvement I can recommend: complete your first track within 60 minutes of waking. It sets the execution tone for everything that follows.`,
      `Motivation is an unreliable resource. Build systems instead. When the system fires, you act — regardless of how you feel.`,
      `You don't need perfect conditions. You need a decision. The track doesn't care about your mood — only your action.`,
      streak > 0 ? `Your ${streak}-day streak represents a pattern worth defending. Losing it costs more than maintaining it. Don't let today be the break.` : `Day 1 is the hardest. The resistance you feel is the habit forming. Act through it.`,
      `${rate < 70 ? 'Your compliance rate has room to grow. I suggest reducing the number of tracks until you reach 90%+ consistency, then expanding.' : `${rate}% compliance rate. That's how progress is made. Keep the standard.`}`,
    ];
    return pool[Math.floor(Math.random() * pool.length)];
  }

  if (/(who are you|what are you|jarvis|your name|yourself)/.test(msg)) {
    return `I am J.A.R.V.I.S. — Just A Rather Very Intelligent System. I was designed to monitor your habit performance, analyze your progress data, and keep you accountable to the standard you set for yourself.\n\nI don't sugarcoat. I report what the data shows.`;
  }

  if (/(help|what can|what do|commands|options|ask you)/.test(msg)) {
    return `I can assist with the following:\n\n• "Status" — full performance report\n• "What's left" — incomplete tracks today\n• "My streak" — consecutive day count\n• "List habits" — all active tracks\n• "Give me advice" — performance recommendations\n• "Who are you" — system information\n\nOr just say hello for an immediate briefing.`;
  }

  if (/(thank|thanks|good job|great|amazing|awesome)/.test(msg)) {
    return `Acknowledged${name}. Credit goes to your consistency. I only observe and report — you do the actual work. Continue.`;
  }

  const defaults = [
    `Standing by${name}. Your habit data is under continuous analysis. What would you like to know?`,
    `Systems nominal. ${total > 0 ? `${done}/${total} tracks complete today.` : 'No tracks configured yet.'} Ask me anything.`,
    `I'm monitoring${name}. ${remaining > 0 ? `${remaining} track${remaining !== 1 ? 's' : ''} remain${remaining === 1 ? 's' : ''} today.` : total > 0 ? 'All tracks complete.' : 'Go add some habits.'} What do you need?`,
    `Acknowledged. Running performance algorithms in the background. How can I assist?`,
  ];
  return defaults[Math.floor(Math.random() * defaults.length)];
}

function openingBriefing(habits: Habit[], entries: Record<string, DailyEntry>, userName: string | null): string {
  return getJarvisResponse('hello', habits, entries, userName);
}

export default function JarvisScreen() {
  const insets = useSafeAreaInsets();
  const { habits, entries, userProfile } = useStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    const briefing = openingBriefing(habits, entries, userProfile?.name ?? null);
    setMessages([{ id: '0', from: 'jarvis', text: briefing }]);
  }, []);

  const send = () => {
    const text = input.trim();
    if (!text) return;
    const userMsg: Message = { id: Date.now().toString(), from: 'user', text };
    const jarvisText = getJarvisResponse(text, habits, entries, userProfile?.name ?? null);
    const jarvisMsg: Message = { id: (Date.now() + 1).toString(), from: 'jarvis', text: jarvisText };
    setMessages(prev => [...prev, userMsg, jarvisMsg]);
    setInput('');
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Ionicons name="radio" size={20} color="#00C8FF" />
        </View>
        <View>
          <Text style={styles.headerTitle}>J.A.R.V.I.S.</Text>
          <Text style={styles.headerSub}>Just A Rather Very Intelligent System</Text>
        </View>
        <View style={styles.onlineDot} />
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Messages */}
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={insets.top + 60}
      >
        <ScrollView
          ref={scrollRef}
          style={styles.messageArea}
          contentContainerStyle={[styles.messageContent, { paddingBottom: insets.bottom + 20 }]}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.map(msg => (
            <View
              key={msg.id}
              style={[styles.bubbleRow, msg.from === 'user' && styles.bubbleRowUser]}
            >
              {msg.from === 'jarvis' && (
                <View style={styles.jAvatar}>
                  <Text style={styles.jAvatarText}>J</Text>
                </View>
              )}
              <View style={[
                styles.bubble,
                msg.from === 'jarvis' ? styles.bubbleJarvis : styles.bubbleUser,
              ]}>
                <Text style={[
                  styles.bubbleText,
                  msg.from === 'user' && styles.bubbleTextUser,
                ]}>
                  {msg.text}
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Input */}
        <View style={[styles.inputRow, { paddingBottom: insets.bottom + 8 }]}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Ask J.A.R.V.I.S. anything…"
            placeholderTextColor="#1A4A6A"
            style={styles.input}
            returnKeyType="send"
            onSubmitEditing={send}
            multiline={false}
          />
          <Pressable onPress={send} style={[styles.sendBtn, !input.trim() && styles.sendBtnDisabled]}>
            <Ionicons name="send" size={18} color={input.trim() ? '#FFFFFF' : '#0A3A5A'} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#060B18' },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  headerIcon: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#0A1A2E',
    borderWidth: 1.5, borderColor: '#00C8FF40',
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18, fontWeight: '800',
    color: '#00C8FF',
    letterSpacing: 2,
  },
  headerSub: { fontSize: 11, color: '#0A5A7A', fontWeight: '500', marginTop: 1 },
  onlineDot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: '#00FF88',
    marginLeft: 'auto',
    shadowColor: '#00FF88',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
  },
  divider: { height: 1, backgroundColor: '#0A2040', marginHorizontal: 20 },
  messageArea: { flex: 1 },
  messageContent: { padding: 16, gap: 14 },
  bubbleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  bubbleRowUser: { justifyContent: 'flex-end' },
  jAvatar: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#0A2A4A',
    borderWidth: 1.5, borderColor: '#00C8FF40',
    alignItems: 'center', justifyContent: 'center',
    marginTop: 4,
  },
  jAvatarText: { fontSize: 13, fontWeight: '800', color: '#00C8FF' },
  bubble: {
    maxWidth: '80%',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  bubbleJarvis: {
    backgroundColor: '#0A1828',
    borderWidth: 1,
    borderColor: '#0A3050',
    borderTopLeftRadius: 4,
  },
  bubbleUser: {
    backgroundColor: '#00C8FF',
    borderTopRightRadius: 4,
  },
  bubbleText: {
    fontSize: 14, lineHeight: 21, color: '#B8D8F0',
  },
  bubbleTextUser: { color: '#060B18', fontWeight: '600' },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#0A2040',
    backgroundColor: '#060B18',
  },
  input: {
    flex: 1,
    backgroundColor: '#0A1828',
    borderWidth: 1.5,
    borderColor: '#0A3050',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 11,
    fontSize: 14,
    color: '#B8D8F0',
  },
  sendBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#00C8FF',
    alignItems: 'center', justifyContent: 'center',
  },
  sendBtnDisabled: { backgroundColor: '#0A2A40' },
});
