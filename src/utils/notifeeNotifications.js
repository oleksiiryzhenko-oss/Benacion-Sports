import { Platform } from 'react-native';
import notifee, { TriggerType, AndroidImportance, AuthorizationStatus } from '@notifee/react-native';

const CHANNEL_ID = 'matches';

export const initNotifications = async () => {
  try {
    const settings = await notifee.requestPermission();

    if (Platform.OS === 'android') {
      await notifee.createChannel({
        id: CHANNEL_ID,
        name: 'Match reminders',
        importance: AndroidImportance.HIGH,
      });
    }
    return settings.authorizationStatus >= AuthorizationStatus.AUTHORIZED;
  } catch (e) {
    console.log('Notifications init error:', e);
    return false;
  }
};

// items: [{ id, title, body, timestamp }]
// Re-schedules everything: cancels old triggers and creates new ones for future items.
export const scheduleMatchReminders = async (items, minutesBefore = 30) => {
  try {
    await notifee.cancelTriggerNotifications();

    const now = Date.now();
    for (const item of items) {
      const fireAt = item.timestamp - minutesBefore * 60000;
      if (!item.timestamp || fireAt <= now + 5000) continue;

      await notifee.createTriggerNotification(
        {
          id: item.id,
          title: item.title,
          body: item.body,
          android: {
            channelId: CHANNEL_ID,
            smallIcon: 'ic_launcher',
            pressAction: { id: 'default' },
          },
        },
        {
          type: TriggerType.TIMESTAMP,
          timestamp: fireAt,
          alarmManager: { allowWhileIdle: true },
        }
      );
    }
  } catch (e) {
    console.log('Schedule reminders error:', e);
  }
};

export const cancelAllReminders = async () => {
  try {
    await notifee.cancelTriggerNotifications();
  } catch (e) {
    console.log('Cancel reminders error:', e);
  }
};
