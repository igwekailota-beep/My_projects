import { appState } from '../state/appState.js';
import { generateNotification } from './ai.js';

let notificationInterval;

export function startNotificationService() {
  // Clear any existing interval to prevent duplicates
  if (notificationInterval) {
    clearInterval(notificationInterval);
  }

  // Generate a notification immediately on start
  generateAndAddNotification();

  // Set up interval for periodic notifications (every 1 minute)
  notificationInterval = setInterval(generateAndAddNotification, 60 * 1000); // 1 minute

  console.log('Notification service started.');
}

export function stopNotificationService() {
  if (notificationInterval) {
    clearInterval(notificationInterval);
    notificationInterval = null;
    console.log('Notification service stopped.');
  }
}

async function generateAndAddNotification() {
  if (!appState.settings.notifications) {
    return; // Do not generate if notifications are disabled
  }

  try {
    const budget = appState.budget;
    const todos = appState.todos.filter(t => !t.completed);
    const events = appState.events;
    const transactions = appState.transactions;

    const notification = await generateNotification(budget, todos, events, transactions);
    appState.addNotification(notification);

  } catch (error) {
    console.error('Error generating and adding notification:', error);
  }
}
