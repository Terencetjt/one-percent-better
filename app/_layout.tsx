import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StoreProvider, useStore } from '../storage/store';
import { WelcomeScreen } from '../components/WelcomeScreen';
import { colors } from '../theme/tokens';
import { UserProfile } from '../storage/types';

SplashScreen.preventAutoHideAsync().catch(() => {});

function RootNavigator() {
  const { ready, userProfile, setUserProfile } = useStore();

  useEffect(() => {
    if (ready) SplashScreen.hideAsync().catch(() => {});
  }, [ready]);

  if (!ready) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator color={colors.accent} size="large" />
      </View>
    );
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
        <Stack.Screen name="(tabs)" />
      </Stack>

      {/* Welcome screen overlays the whole app until a name is set. */}
      {!userProfile && (
        <WelcomeScreen onComplete={(profile: UserProfile) => setUserProfile(profile)} />
      )}
    </>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.flex}>
      <SafeAreaProvider>
        <StoreProvider>
          <StatusBar style="dark" />
          <RootNavigator />
        </StoreProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  loader: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
});
