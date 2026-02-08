/**
 * CarnivOS - Defrost Reminder Utility (Web版)
 *
 * Phase 5: Defrost Reminder (Inventory Lite)
 * Browser Notification APIを使用
 */

import type { RecoveryProtocol, FoodItem, DefrostReminder } from '../types';
import { logError } from './errorHandler';

/**
 * Check if recovery protocol or food items include meat
 */
export function hasMeatInPlan(protocol?: RecoveryProtocol, foods?: FoodItem[]): boolean {
  // Check recovery protocol diet recommendations
  if (protocol?.dietRecommendations) {
    const meatKeywords = ['meat', 'ribeye', 'beef', 'lamb', 'steak', 'ruminant'];
    const hasMeatInProtocol = protocol.dietRecommendations.some((rec) =>
      meatKeywords.some((keyword) => rec.toLowerCase().includes(keyword))
    );
    if (hasMeatInProtocol) return true;
  }

  // Check food items
  if (foods) {
    const meatTypes: FoodItem['type'][] = ['animal', 'ruminant'];
    return foods.some((food) => meatTypes.includes(food.type));
  }

  return false;
}

/**
 * Request notification permission
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    if (import.meta.env.DEV) {
      console.warn('This browser does not support notifications');
    }
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
}

/**
 * Schedule defrost reminder for 8:00 PM today
 */
export async function scheduleDefrostReminder(meatItem?: string): Promise<string | null> {
  try {
    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) {
      console.warn('Notification permission not granted');
      return null;
    }

    // Get current date and set to 8:00 PM
    const now = new Date();
    const reminderTime = new Date(now);
    reminderTime.setHours(20, 0, 0, 0); // 8:00 PM

    // If 8:00 PM has already passed today, schedule for tomorrow
    if (reminderTime < now) {
      reminderTime.setDate(reminderTime.getDate() + 1);
    }

    // Calculate delay in milliseconds
    const delay = reminderTime.getTime() - now.getTime();

    // Schedule notification using setTimeout (simplified version)
    // In production, you might want to use a more robust scheduling system
    const timeoutId = setTimeout(() => {
      new Notification('🥩 Thawing Alert', {
        body: meatItem
          ? `Move your ${meatItem} from freezer to fridge.`
          : 'Move your meat from freezer to fridge for tomorrow.',
        icon: '/icon.png', // PWA icon
        badge: '/icon.png',
      });
    }, delay);

    // Store timeout ID in localStorage for cancellation
    const reminderId = `defrost_${Date.now()}`;
    const reminders = JSON.parse(localStorage.getItem('defrost_reminders') || '[]');
    reminders.push({ id: reminderId, timeoutId, time: reminderTime.toISOString() });
    localStorage.setItem('defrost_reminders', JSON.stringify(reminders));

    return reminderId;
  } catch (error) {
    logError(error, { component: 'defrostReminder', action: 'scheduleDefrostReminder', meatItem });
    return null;
  }
}

/**
 * Cancel defrost reminder
 */
export async function cancelDefrostReminder(reminderId: string): Promise<void> {
  try {
    const reminders: DefrostReminder[] = JSON.parse(
      localStorage.getItem('defrost_reminders') || '[]'
    );
    const reminder = reminders.find((r) => r.id === reminderId);

    if (reminder && reminder.timeoutId) {
      clearTimeout(reminder.timeoutId);
    }

    const updatedReminders = reminders.filter((r) => r.id !== reminderId);
    localStorage.setItem('defrost_reminders', JSON.stringify(updatedReminders));
  } catch (error) {
    logError(error, { component: 'defrostReminder', action: 'cancelDefrostReminder', reminderId });
  }
}

/**
 * Get all scheduled defrost reminders
 */
export async function getScheduledDefrostReminders(): Promise<DefrostReminder[]> {
  try {
    const reminders: DefrostReminder[] = JSON.parse(
      localStorage.getItem('defrost_reminders') || '[]'
    );
    return reminders.filter((r) => {
      const reminderTime = new Date(r.time);
      return reminderTime > new Date();
    });
  } catch (error) {
    logError(error, { component: 'defrostReminder', action: 'getScheduledDefrostReminders' });
    return [];
  }
}
