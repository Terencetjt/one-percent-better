import React, { useState } from 'react';
import {
  KeyboardAvoidingView, Platform, Pressable, StyleSheet,
  TextInput, View,
} from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { UserProfile } from '../storage/types';
import { Text } from './Text';
import { Button } from './Button';
import { colors, radii, spacing, typography } from '../theme/tokens';
import { requestPermissions } from '../lib/notifications';

interface WelcomeScreenProps {
  onComplete: (profile: UserProfile) => void;
}

const DEFAULT_REMINDER = '21:00';

export function WelcomeScreen({ onComplete }: WelcomeScreenProps) {
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');
  const [step, setStep] = useState<'name' | 'reminder'>('name');
  const [reminderEnabled, setReminderEnabled] = useState(false);

  const trimmed = name.trim();

  const handleNameNext = () => {
    if (!trimmed) return;
    if (Platform.OS !== 'web') {
      setStep('reminder');
    } else {
      // Web: skip notification step, go straight in
      finish(false);
    }
  };

  const handleReminderYes = async () => {
    const granted = await requestPermissions();
    finish(granted);
  };

  const finish = (withReminder: boolean) => {
    onComplete({
      name: trimmed,
      reminderEnabled: withReminder,
      reminderTime: DEFAULT_REMINDER,
      createdAt: new Date().toISOString(),
    });
  };

  return (
    <View style={[styles.overlay, { paddingBottom: insets.bottom + spacing.xl }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.kav}
      >
        <Animated.View entering={FadeIn.duration(500)} style={styles.card}>
          {/* Logo area */}
          <View style={styles.logo}>
            <Text style={styles.logoEmoji}>🌱</Text>
          </View>

          <Text variant="display" align="center" style={styles.appName}>
            1% Better
          </Text>
          <Text variant="body" align="center" color={colors.textFaint} style={styles.tagline}>
            Small habits. Compounding results.
          </Text>

          {step === 'name' ? (
            <>
              <Text variant="heading" align="center" style={styles.question}>
                What's your name?
              </Text>

              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Your name"
                placeholderTextColor={colors.textFaint}
                style={styles.input}
                autoFocus
                autoCapitalize="words"
                returnKeyType="done"
                onSubmitEditing={handleNameNext}
              />

              <Button
                label="Get started"
                onPress={handleNameNext}
                disabled={!trimmed}
                style={styles.cta}
              />
            </>
          ) : (
            <>
              <Text variant="heading" align="center" style={styles.question}>
                Want daily reminders?
              </Text>
              <Text variant="body" align="center" color={colors.textFaint}>
                We'll nudge you at 9 PM every day to log your habits and learning.
              </Text>

              <View style={styles.reminderBtns}>
                <Button label="Yes, remind me 🔔" onPress={handleReminderYes} style={styles.flex} />
                <Button
                  label="Skip for now"
                  variant="ghost"
                  onPress={() => finish(false)}
                  style={styles.flex}
                />
              </View>
            </>
          )}
        </Animated.View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  kav: {
    width: '100%',
    maxWidth: 440,
    paddingHorizontal: spacing.xl,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.xxl,
    gap: spacing.lg,
    alignItems: 'stretch',
  },
  logo: {
    width: 72,
    height: 72,
    borderRadius: radii.pill,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  logoEmoji: { fontSize: 36 },
  appName: { marginTop: spacing.xs },
  tagline: { marginTop: -spacing.sm },
  question: { marginTop: spacing.sm },
  input: {
    fontFamily: typography.body.fontFamily,
    fontSize: typography.body.fontSize,
    color: colors.text,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radii.md,
    borderWidth: 2,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    textAlign: 'center',
  },
  cta: { marginTop: spacing.xs },
  reminderBtns: { gap: spacing.sm, marginTop: spacing.xs },
  flex: { flex: 1 },
});
