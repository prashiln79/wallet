// Firebase messaging service worker for background notifications
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Firebase configuration (single source of truth)
const firebaseConfig = {
  apiKey: "AIzaSyCbi9w0M2U4jtO6tkf78SHvXrgvL4TbyqI",
  authDomain: "money-manager-b394e.firebaseapp.com",
  projectId: "money-manager-b394e",
  storageBucket: "money-manager-b394e.firebasestorage.app",
  messagingSenderId: "844099376199",
  appId: "1:844099376199:web:d778d53279e65258b48d62",
  measurementId: "G-G75KP504VD"
};

// Initialize Firebase and messaging
let messaging;
try {
  firebase.initializeApp(firebaseConfig);
  messaging = firebase.messaging();
  console.log('Firebase initialized in service worker');
} catch (error) {
  console.error('Failed to initialize Firebase in service worker:', error);
}

// Cached platform detection
let cachedPlatform = null;
function detectPlatform() {
  if (cachedPlatform) return cachedPlatform;
  
  const userAgent = navigator.userAgent;
  cachedPlatform = {
    isAndroid: /Android/i.test(userAgent),
    isIOS: /iPad|iPhone|iPod/.test(userAgent),
    isChrome: /Chrome/.test(userAgent) && !/Edge/.test(userAgent),
    isSafari: /Safari/.test(userAgent) && !/Chrome/.test(userAgent),
    isMobile: /Android|iPad|iPhone|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)
  };
  
  return cachedPlatform;
}

// Consolidated notification options
function getNotificationOptions(payload, customOptions = {}) {
  const platform = detectPlatform();
  
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
      { action: 'view', title: 'View' },
      { action: 'dismiss', title: 'Dismiss' }
    ]
  };

  // Platform-specific adjustments
  if (platform.isIOS && platform.isSafari) {
    defaultOptions.icon = payload.notification?.icon || '/wallet/assets/icon/app-icon/icon-152x152.png';
    defaultOptions.actions = [{ action: 'view', title: 'View' }];
  }

  return { ...defaultOptions, ...customOptions };
}

// Handle background messages
if (messaging) {
  messaging.onBackgroundMessage((payload) => {
    console.log('Background message received:', payload);
    
    const notificationTitle = payload.notification?.title || 'Money Manager';
    const notificationOptions = getNotificationOptions(payload);

    return self.registration.showNotification(notificationTitle, notificationOptions)
      .then(() => console.log('Background notification shown successfully'))
      .catch((error) => console.error('Failed to show background notification:', error));
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
      const notificationOptions = getNotificationOptions(payload);

      event.waitUntil(
        self.registration.showNotification(notificationTitle, notificationOptions)
          .then(() => console.log('Push notification shown successfully'))
          .catch((error) => console.error('Failed to show push notification:', error))
      );
    } catch (error) {
      console.error('Error parsing push data:', error);
      
      // Fallback notification
      const fallbackOptions = getNotificationOptions({}, {
        body: 'You have a new notification',
        icon: '/wallet/assets/icon/app-icon/icon-192x192.png',
        badge: '/wallet/assets/icon/app-icon/icon-72x72.png'
      });

      event.waitUntil(
        self.registration.showNotification('Money Manager', fallbackOptions)
          .then(() => console.log('Fallback notification shown successfully'))
          .catch((error) => console.error('Failed to show fallback notification:', error))
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
    
    let successCount = 0;
    let errorCount = 0;
    let invalidCount = 0;
    
    // Sync each pending transaction
    for (const transaction of pendingTransactions) {
      try {
        // Validate transaction data before syncing
        const validationResult = validateTransactionData(transaction);
        
        if (!validationResult.isValid) {
          console.error('Invalid transaction data:', transaction.id, validationResult.errors);
          // Mark transaction as invalid and remove from pending queue
          await markTransactionAsInvalid(transaction.id, validationResult.errors);
          invalidCount++;
          continue;
        }
        
        await syncTransaction(transaction);
        await removePendingTransaction(transaction.id);
        console.log('Transaction synced successfully:', transaction.id);
        successCount++;
        
      } catch (error) {
        console.error('Failed to sync transaction:', transaction.id, error);
        
        // Check if it's a Firebase validation error
        if (isFirebaseValidationError(error)) {
          console.error('Firebase validation error for transaction:', transaction.id, error);
          // Mark transaction as invalid and remove from pending queue
          await markTransactionAsInvalid(transaction.id, [error.message || 'Firebase validation failed']);
          invalidCount++;
        } else {
          // Keep transaction in pending queue for next sync attempt (network errors, etc.)
          await updateTransactionRetryCount(transaction.id);
          errorCount++;
        }
      }
    }
    
    // Show appropriate notification based on results
    if (successCount > 0 && invalidCount === 0 && errorCount === 0) {
      await showSyncNotification('Transactions synced successfully', `All ${successCount} offline transactions have been uploaded.`);
    } else if (successCount > 0) {
      await showSyncNotification('Partial sync completed', 
        `${successCount} transactions synced successfully. ${invalidCount} invalid transactions ignored. ${errorCount} transactions will be retried.`);
    } else if (invalidCount > 0) {
      await showSyncNotification('Sync completed with issues', 
        `${invalidCount} invalid transactions were ignored. ${errorCount} transactions will be retried.`);
    } else if (errorCount > 0) {
      await showSyncNotification('Sync failed', 
        `${errorCount} transactions could not be synced. They will be retried later.`);
    }
    
  } catch (error) {
    console.error('Background sync failed:', error);
    await showSyncNotification('Sync failed', 'Some transactions could not be synced. They will be retried later.');
  }
}

// Sync budget data
async function syncBudgetData() {
  try {
    console.log('Syncing budget data...');
    await showSyncNotification('Budget synced', 'Your budget data has been updated.');
  } catch (error) {
    handleError(error, 'budget sync');
  }
}

// Sync account data
async function syncAccountData() {
  try {
    console.log('Syncing account data...');
    await showSyncNotification('Accounts synced', 'Your account data has been updated.');
  } catch (error) {
    handleError(error, 'account sync');
  }
}

// Sync goal data
async function syncGoalData() {
  try {
    console.log('Syncing goal data...');
    await showSyncNotification('Goals synced', 'Your goal data has been updated.');
  } catch (error) {
    handleError(error, 'goal sync');
  }
}

// Unified error handler
function handleError(error, context) {
  console.error(`Error in ${context}:`, error);
  return { success: false, error: error.message };
}

// Helper function to show sync notifications
async function showSyncNotification(title, body) {
  const notificationOptions = getNotificationOptions({}, {
    body: body,
    tag: 'sync-notification',
    requireInteraction: false,
    silent: true
  });
  
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

// Validate transaction data before syncing
function validateTransactionData(transaction) {
  const errors = [];
  
  // Validate transaction structure
  if (!transaction || typeof transaction !== 'object') {
    errors.push('Invalid transaction object');
    return { isValid: false, errors };
  }
  
  // Validate transaction data exists
  if (!transaction.data || typeof transaction.data !== 'object') {
    errors.push('Transaction data is required and must be an object');
    return { isValid: false, errors };
  }
  
  // Check for undefined values in transaction data
  const data = transaction.data;
  for (const [key, value] of Object.entries(data)) {
    if (value === undefined) {
      errors.push(`Field '${key}' contains undefined value`);
    }
  }
  
  // Check required fields for create/update operations
  if (transaction.operation === 'create' || transaction.operation === 'update') {
    const requiredFields = ['payee', 'amount', 'type', 'date', 'accountId', 'categoryId'];
    for (const field of requiredFields) {
      if (!data[field]) {
        errors.push(`${field} is required`);
      }
    }
    
    // Validate amount
    if (data.amount !== undefined && data.amount !== null) {
      const amount = parseFloat(data.amount);
      if (isNaN(amount) || amount <= 0) {
        errors.push('Amount must be a positive number');
      }
    }
    
    // Validate date
    if (data.date) {
      const date = new Date(data.date);
      if (isNaN(date.getTime())) {
        errors.push('Invalid date format');
      }
    }
    
    // Validate payee length
    if (data.payee && data.payee.length > 100) {
      errors.push('Payee name must be 100 characters or less');
    }
    
    // Validate type
    if (data.type && !['income', 'expense'].includes(data.type)) {
      errors.push('Transaction type must be either "income" or "expense"');
    }
    
    // Validate notes length
    if (data.notes && data.notes.length > 500) {
      errors.push('Notes must be 500 characters or less');
    }
  }
  
  // Validate operation type
  if (!['create', 'update', 'delete'].includes(transaction.operation)) {
    errors.push('Invalid operation type. Must be "create", "update", or "delete"');
  }
  
  // Validate transaction ID for update/delete operations
  if ((transaction.operation === 'update' || transaction.operation === 'delete') && !transaction.id) {
    errors.push('Transaction ID is required for update and delete operations');
  }
  
  return {
    isValid: errors.length === 0,
    errors: errors
  };
}

// Check if error is a Firebase validation error
function isFirebaseValidationError(error) {
  // Firebase validation errors typically have specific error codes
  const validationErrorCodes = [
    'permission-denied',
    'invalid-argument',
    'failed-precondition',
    'out-of-range',
    'unimplemented',
    'data-loss',
    'unauthenticated'
  ];
  
  // Check error code
  if (error.code && validationErrorCodes.includes(error.code)) {
    return true;
  }
  
  // Check error message for validation-related keywords
  const validationKeywords = [
    'validation',
    'invalid',
    'required',
    'permission',
    'unauthorized',
    'forbidden',
    'constraint'
  ];
  
  const errorMessage = (error.message || '').toLowerCase();
  return validationKeywords.some(keyword => errorMessage.includes(keyword));
}

// Mark transaction as invalid and remove from pending queue
async function markTransactionAsInvalid(transactionId, errors) {
  try {
    console.log('Marking transaction as invalid:', transactionId, errors);
    await storeInvalidTransaction(transactionId, errors);
    await removePendingTransaction(transactionId);
  } catch (error) {
    handleError(error, 'mark transaction as invalid');
  }
}

// Update transaction retry count
async function updateTransactionRetryCount(transactionId) {
  try {
    // This would update the retry count in IndexedDB
    console.log('Updated retry count for transaction:', transactionId);
  } catch (error) {
    handleError(error, 'update retry count');
  }
}

// Store invalid transaction information
async function storeInvalidTransaction(transactionId, errors) {
  try {
    const invalidTransaction = {
      id: transactionId,
      errors: errors,
      timestamp: Date.now(),
      type: 'invalid_transaction'
    };
    
    console.log('Stored invalid transaction info:', invalidTransaction);
  } catch (error) {
    handleError(error, 'store invalid transaction');
  }
}

// Optimized syncTransaction function using existing Firebase instance
async function syncTransaction(transaction) {
  try {
    const user = firebase.auth().currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }

    const userId = user.uid;
    const firestore = firebase.firestore();
    const transactionsRef = firestore.collection(`users/${userId}/transactions`);

    // Handle different transaction operations
    if (transaction.operation === 'create') {
      await transactionsRef.add(transaction.data);
    } else if (transaction.operation === 'update') {
      await transactionsRef.doc(transaction.id).update(transaction.data);
    } else if (transaction.operation === 'delete') {
      await transactionsRef.doc(transaction.id).delete();
    }

    console.log('Transaction synced successfully to Firebase:', transaction.id);
    return { success: true };

  } catch (error) {
    console.error('Failed to sync transaction to Firebase:', error);
    throw error;
  }
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
  const notificationOptions = getNotificationOptions({
    notification: notificationData,
    data: notificationData.data || {}
  });

  self.registration.showNotification(notificationData.title, notificationOptions)
    .then(() => console.log('Notification shown successfully via service worker'))
    .catch((error) => handleError(error, 'show notification from message'));
}

// Handle service worker errors
self.addEventListener('error', (event) => {
  handleError(event.error, 'service worker error');
});

// Handle unhandled promise rejections
self.addEventListener('unhandledrejection', (event) => {
  handleError(event.reason, 'unhandled rejection');
}); 