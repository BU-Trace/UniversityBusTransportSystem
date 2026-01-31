/**
 * Simple helper to manage sound and browser alerts
 */

// Request permission when the app starts
export const requestNotificationPermission = () => {
  if (typeof window !== 'undefined' && 'Notification' in window) {
    Notification.requestPermission();
  }
};

// Play a simple notification sound
export const playAlertSound = () => {
  const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3'); // Standard alert sound
  audio.play().catch((err) => console.log('Sound blocked: Need user interaction first.'));
};

// Show browser push notification
export const showPushNotification = (busId: string, message: string) => {
  if (
    typeof window !== 'undefined' &&
    'Notification' in window &&
    Notification.permission === 'granted'
  ) {
    new Notification(`Bus Alert: ${busId}`, {
      body: message,
      icon: 'https://cdn-icons-png.flaticon.com/512/684/684908.png', // Bus icon
    });
  }
};

/**
 * Main function to check if an alert should be triggered
 */
export const checkAndNotify = (busId: string, distanceKm: number, notifiedBuses: Set<string>) => {
  // Convert distance to meters for 100m check
  const distanceMeters = distanceKm * 1000;

  // Trigger if bus is within 100 meters and not already notified
  if (distanceMeters <= 100 && !notifiedBuses.has(busId)) {
    playAlertSound();
    showPushNotification(busId, 'The bus is within 100 meters of your location!');
    return true; // Indicates a notification was sent
  }

  // Reset notification if bus moves far away (e.g., more than 500 meters)
  if (distanceMeters > 500 && notifiedBuses.has(busId)) {
    notifiedBuses.delete(busId);
  }

  return false;
};
