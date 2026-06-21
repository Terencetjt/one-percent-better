import { Platform } from 'react-native';

// expo-notifications is a native-only module. On web we stub everything out
// so the rest of the app can import this file without errors.
const isNative = Platform.OS !== 'web';

// Lazy import so the module isn't even evaluated on web.
async function getNotifications() {
  if (!isNative) return null;
  return import('expo-notifications');
}

export async function requestPermissions(): Promise<boolean> {
  const Notifications = await getNotifications();
  if (!Notifications) return false;

  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

/**
 * Cancel all scheduled notifications and re-schedule a single daily reminder.
 * time is "HH:MM" (24-hour).
 */
export async function scheduleDailyReminder(name: string, time: string): Promise<void> {
  const Notifications = await getNotifications();
  if (!Notifications) return;

  await Notifications.cancelAllScheduledNotificationsAsync();

  const [hour, minute] = time.split(':').map(Number);

  await Notifications.scheduleNotificationAsync({
    content: {
      title: `Hey ${name}! 🌱`,
      body: "Time to log your habits and today's learning.",
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    } as any,
  });
}

export async function cancelAllReminders(): Promise<void> {
  const Notifications = await getNotifications();
  if (!Notifications) return;
  await Notifications.cancelAllScheduledNotificationsAsync();
}

/** Configure how notifications look when the app is in the foreground. */
export function configureForegroundHandler(): void {
  if (!isNative) return;
  // Fire-and-forget: we just need the import side-effect.
  import('expo-notifications').then((Notifications) => {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
  });
}
