// Firebase messaging service worker for background notifications
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCbi9w0M2U4jtO6tkf78SHvXrgvL4TbyqI",
  authDomain: "money-manager-b394e.firebaseapp.com",
  projectId: "money-manager-b394e",
  storageBucket: "money-manager-b394e.firebasestorage.app",
  messagingSenderId: "844099376199",
  appId: "1:844099376199:web:d778d53279e65258b48d62",
  measurementId: "G-G75KP504VD"
};

// Initialize Firebase
try {
  firebase.initializeApp(firebaseConfig);
  console.log('Firebase initialized in service worker');
} catch (error) {
  console.error('Failed to initialize Firebase in service worker:', error);
}

// Initialize Firebase Cloud Messaging
let messaging;
try {
  messaging = firebase.messaging();
  console.log('Firebase messaging initialized in service worker');
} catch (error) {
  console.error('Failed to initialize Firebase messaging in service worker:', error);
}

// Platform detection function
function detectPlatform() {
  const userAgent = navigator.userAgent;
  const isAndroid = /Android/i.test(userAgent);
  const isIOS = /iPad|iPhone|iPod/.test(userAgent);
  const isChrome = /Chrome/.test(userAgent) && !/Edge/.test(userAgent);
  const isSafari = /Safari/.test(userAgent) && !/Chrome/.test(userAgent);
  const isMobile = isAndroid || isIOS || /webOS|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  
  return { isAndroid, isIOS, isChrome, isSafari, isMobile };
}

// Get platform-specific notification options
function getPlatformSpecificNotificationOptions(payload) {
  const platform = detectPlatform();
  
  // Default options
  const defaultOptions = {
    body: payload.notification?.body || 'You have a new notification',
    icon: payload.notification?.icon || '/wallet/assets/icon/app-icon/icon-192x192.png',
    badge: payload.notification?.badge || '/wallet/assets/icon/app-icon/icon-72x72.png',
    image: payload.notification?.image,
    data: payload.data || {},
    tag: payload.notification?.tag,
    requireInteraction: payload.notification?.requireInteraction || false,
    silent: payload.notification?.silent || false,
    timestamp: payload.notification?.timestamp || Date.now(),
    actions: payload.notification?.actions || [
      {
        action: 'view',
        title: 'View'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ]
  };

  // Platform-specific adjustments
  if (platform.isIOS) {
    // iOS prefers specific icon sizes and may have limited action support
    defaultOptions.icon = payload.notification?.icon || '/wallet/assets/icon/app-icon/icon-152x152.png';
    defaultOptions.badge = payload.notification?.badge || '/wallet/assets/icon/app-icon/icon-72x72.png';
    
    // iOS may not support all notification actions
    if (platform.isSafari) {
      defaultOptions.actions = [
        {
          action: 'view',
          title: 'View'
        }
      ];
    }
  } else if (platform.isAndroid) {
    // Android Chrome has good support for all features
    defaultOptions.icon = payload.notification?.icon || '/wallet/assets/icon/app-icon/icon-192x192.png';
    defaultOptions.badge = payload.notification?.badge || '/wallet/assets/icon/app-icon/icon-72x72.png';
  } else {
    // Desktop Chrome has excellent support
    defaultOptions.icon = payload.notification?.icon || '/wallet/assets/icon/app-icon/icon-192x192.png';
    defaultOptions.badge = payload.notification?.badge || '/wallet/assets/icon/app-icon/icon-72x72.png';
  }

  return defaultOptions;
}

// Handle background messages
if (messaging) {
  messaging.onBackgroundMessage((payload) => {
    console.log('Background message received:', payload);

    const notificationTitle = payload.notification?.title || 'Money Manager';
    const notificationOptions = getPlatformSpecificNotificationOptions(payload);

    // Show notification
    return self.registration.showNotification(notificationTitle, notificationOptions)
      .then(() => {
        console.log('Background notification shown successfully');
      })
      .catch((error) => {
        console.error('Failed to show background notification:', error);
      });
  });
}

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);

  event.notification.close();

  // Handle notification click
  if (event.action === 'view' || !event.action) {
    // Focus existing window or open new one
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
        // Check if there's already a window/tab open with the target URL
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            return client.focus();
          }
        }
        
        // If no window/tab is open, open a new one
        if (clients.openWindow) {
          const urlToOpen = event.notification.data?.url || self.location.origin;
          return clients.openWindow(urlToOpen);
        }
      })
    );
  } else if (event.action === 'dismiss') {
    // Just close the notification (already done above)
    console.log('Notification dismissed');
  } else {
    // Handle custom actions
    const actionUrl = event.notification.data?.actionUrl;
    if (actionUrl) {
      event.waitUntil(clients.openWindow(actionUrl));
    }
  }
});

// Handle notification close
self.addEventListener('notificationclose', (event) => {
  console.log('Notification closed:', event);
  
  // You can send analytics data here if needed
  const notificationData = event.notification.data;
  if (notificationData) {
    // Send analytics data to your server
    console.log('Notification closed with data:', notificationData);
  }
});

// Handle push event (fallback for older browsers)
self.addEventListener('push', (event) => {
  console.log('Push event received:', event);

  if (event.data) {
    try {
      const payload = event.data.json();
      console.log('Push payload:', payload);

      const notificationTitle = payload.notification?.title || 'Money Manager';
      const notificationOptions = getPlatformSpecificNotificationOptions(payload);

      event.waitUntil(
        self.registration.showNotification(notificationTitle, notificationOptions)
          .then(() => {
            console.log('Push notification shown successfully');
          })
          .catch((error) => {
            console.error('Failed to show push notification:', error);
          })
      );
    } catch (error) {
      console.error('Error parsing push data:', error);
      
      // Fallback notification
      const notificationTitle = 'Money Manager';
      const notificationOptions = {
        body: 'You have a new notification',
        icon: '/wallet/assets/icon/app-icon/icon-192x192.png',
        badge: '/wallet/assets/icon/app-icon/icon-72x72.png'
      };

      event.waitUntil(
        self.registration.showNotification(notificationTitle, notificationOptions)
          .then(() => {
            console.log('Fallback notification shown successfully');
          })
          .catch((error) => {
            console.error('Failed to show fallback notification:', error);
          })
      );
    }
  } else {
    console.log('Push event received without data');
  }
});

// Handle service worker installation
self.addEventListener('install', (event) => {
  console.log('Firebase messaging service worker installed');
  self.skipWaiting();
});

// Handle service worker activation
self.addEventListener('activate', (event) => {
  console.log('Firebase messaging service worker activated');
  event.waitUntil(self.clients.claim());
});

// Background Sync API - Register sync events
self.addEventListener('sync', (event) => {
  console.log('Background sync event:', event.tag);
  
  if (event.tag === 'sync-transactions') {
    event.waitUntil(syncPendingTransactions());
  } else if (event.tag === 'sync-budgets') {
    event.waitUntil(syncBudgetData());
  } else if (event.tag === 'sync-accounts') {
    event.waitUntil(syncAccountData());
  } else if (event.tag === 'sync-goals') {
    event.waitUntil(syncGoalData());
  }
});

// Sync pending transactions when online
async function syncPendingTransactions() {
  try {
    console.log('Syncing pending transactions...');
    
    // Get pending transactions from IndexedDB
    const pendingTransactions = await getPendingTransactions();
    
    if (pendingTransactions.length === 0) {
      console.log('No pending transactions to sync');
      return;
    }
    
    // Sync each pending transaction
    for (const transaction of pendingTransactions) {
      try {
        await syncTransaction(transaction);
        await removePendingTransaction(transaction.id);
        console.log('Transaction synced successfully:', transaction.id);
      } catch (error) {
        console.error('Failed to sync transaction:', transaction.id, error);
        // Keep transaction in pending queue for next sync attempt
      }
    }
    
    // Show success notification
    await showSyncNotification('Transactions synced successfully', 'Your offline transactions have been uploaded.');
    
  } catch (error) {
    console.error('Background sync failed:', error);
    await showSyncNotification('Sync failed', 'Some transactions could not be synced. They will be retried later.');
  }
}

// Sync budget data
async function syncBudgetData() {
  try {
    console.log('Syncing budget data...');
    // Implement budget sync logic
    await showSyncNotification('Budget synced', 'Your budget data has been updated.');
  } catch (error) {
    console.error('Budget sync failed:', error);
  }
}

// Sync account data
async function syncAccountData() {
  try {
    console.log('Syncing account data...');
    // Implement account sync logic
    await showSyncNotification('Accounts synced', 'Your account data has been updated.');
  } catch (error) {
    console.error('Account sync failed:', error);
  }
}

// Sync goal data
async function syncGoalData() {
  try {
    console.log('Syncing goal data...');
    // Implement goal sync logic
    await showSyncNotification('Goals synced', 'Your goal data has been updated.');
  } catch (error) {
    console.error('Goal sync failed:', error);
  }
}

// Helper function to show sync notifications
async function showSyncNotification(title, body) {
  const notificationOptions = {
    body: body,
    icon: '/wallet/assets/icon/app-icon/icon-192x192.png',
    badge: '/wallet/assets/icon/app-icon/icon-72x72.png',
    tag: 'sync-notification',
    requireInteraction: false,
    silent: true
  };
  
  await self.registration.showNotification(title, notificationOptions);
}

// IndexedDB operations for pending transactions
async function getPendingTransactions() {
  // This would interact with your IndexedDB to get pending transactions
  // Implementation depends on your data storage strategy
  return [];
}

async function removePendingTransaction(transactionId) {
  // Remove synced transaction from pending queue
  console.log('Removing pending transaction:', transactionId);
}

async function syncTransaction(transaction) {
  // Send transaction to your backend API
  const response = await fetch('/api/transactions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(transaction)
  });
  
  if (!response.ok) {
    throw new Error(`Failed to sync transaction: ${response.status}`);
  }
  
  return response.json();
}

// Handle service worker message events
self.addEventListener('message', (event) => {
  console.log('Service worker message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  // Handle notification requests from Angular service
  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    console.log('Showing notification via service worker:', event.data.notification);
    showNotificationFromMessage(event.data.notification);
  }
});

// Function to show notification from message
function showNotificationFromMessage(notificationData) {
  const platform = detectPlatform();
  const notificationOptions = getPlatformSpecificNotificationOptions({
    notification: notificationData,
    data: notificationData.data || {}
  });

  self.registration.showNotification(notificationData.title, notificationOptions)
    .then(() => {
      console.log('Notification shown successfully via service worker');
    })
    .catch((error) => {
      console.error('Failed to show notification via service worker:', error);
    });
}

// Handle service worker errors
self.addEventListener('error', (event) => {
  console.error('Service worker error:', event.error);
});

// Handle unhandled promise rejections
self.addEventListener('unhandledrejection', (event) => {
  console.error('Service worker unhandled rejection:', event.reason);
}); 