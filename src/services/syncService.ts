// src/services/syncService.ts

import { db } from '../firebase/config';
import { 
  doc, 
  collection,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import type { 
  SyncQueueItem, 
  RetryQueueItem, 
  AppSyncStatus,
  SyncError
} from '../models/dataModels';
// Updated import path for idGenerator
import { isTemporaryId, generateUUIDv7 } from '../utils/idGenerator';

// In-memory queues
const syncQueue: SyncQueueItem[] = [];
const retryQueue: RetryQueueItem[] = [];

// App sync status
let appSyncStatus: AppSyncStatus = {
  lastSyncTime: null,
  pendingChanges: 0,
  syncState: 'idle',
  errors: []
};

// Maximum number of retry attempts
const MAX_RETRY_ATTEMPTS = 5;

// Base backoff time in milliseconds
const BASE_BACKOFF_MS = 1000;

/**
 * Add an item to the sync queue
 * 
 * @param operation The operation type ('create', 'update', 'delete')
 * @param collectionPath The Firestore collection path
 * @param entityId The entity ID
 * @param data The entity data (optional for 'delete')
 */
export function addToSyncQueue(
  operation: 'create' | 'update' | 'delete',
  collectionPath: string,
  entityId: string,
  data?: any
): void {
  const existingItem = syncQueue.find(item => 
    item.entityId === entityId && 
    item.collectionPath === collectionPath
  );
  
  if (existingItem) {
    // Update existing queue item
    existingItem.operation = operation;
    existingItem.data = data;
    existingItem.timestamp = Date.now();
  } else {
    // Add new queue item
    syncQueue.push({
      id: generateUUIDv7(),
      operation,
      collectionPath,
      entityId,
      data,
      timestamp: Date.now(),
      attempts: 0
    });
  }
  
  // Update app sync status
  updateSyncStatus();
  
  // Save queue to persistent storage
  saveSyncQueue();
  
  // Try to process the queue if online
  if (navigator.onLine) {
    processSyncQueue();
  }
}

/**
 * Process the sync queue
 */
export async function processSyncQueue(): Promise<void> {
  if (syncQueue.length === 0 || appSyncStatus.syncState === 'syncing') {
    return;
  }
  
  // Update sync status
  appSyncStatus.syncState = 'syncing';
  notifySyncStatusListeners();
  
  // Process queue items in batches of 10
  const batch = writeBatch(db);
  const itemsToProcess = syncQueue.slice(0, 10);
  const processedItems: SyncQueueItem[] = [];
  const failedItems: SyncQueueItem[] = [];
  
  try {
    for (const item of itemsToProcess) {
      try {
        // Increment attempt counter
        item.attempts++;
        item.lastAttempt = Date.now();
        
        // Skip items that have exceeded max retry attempts
        if (item.attempts > MAX_RETRY_ATTEMPTS) {
          addSyncError({
            id: generateUUIDv7(),
            message: `Max retry attempts exceeded for ${item.operation} operation on ${item.collectionPath}/${item.entityId}`,
            timestamp: new Date(),
            entityType: item.collectionPath.split('/').pop() || '',
            entityId: '', // Ensure this property is present
            retryable: true
          });
          
          // Remove from queue
          failedItems.push(item);
          continue;
        }
        
        switch (item.operation) {
          case 'create':
            // Handle temporary IDs by creating a new doc with server ID
            if (isTemporaryId(item.entityId)) {
              const newDocRef = doc(collection(db, item.collectionPath));
              batch.set(newDocRef, {
                ...item.data,
                id: newDocRef.id, // Use server-generated ID
                tempId: item.entityId, // Store the temporary ID
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                version: 1
              });
            } else {
              // Use specified ID
              const docRef = doc(db, item.collectionPath, item.entityId);
              batch.set(docRef, {
                ...item.data,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                version: 1
              });
            }
            break;
            
          case 'update':
            const docRef = doc(db, item.collectionPath, item.entityId);
            batch.update(docRef, {
              ...item.data,
              updatedAt: serverTimestamp(),
              version: item.data.version + 1
            });
            break;
            
          case 'delete':
            batch.delete(doc(db, item.collectionPath, item.entityId));
            break;
        }
        
        processedItems.push(item);      } catch (err) {
        const error = err as Error;
        console.error(`Error processing sync queue item:`, error, item);
        failedItems.push(item);
        
        addSyncError({
          id: generateUUIDv7(),
          message: `Error processing ${item.operation} operation: ${error.message || 'Unknown error'}`,
          timestamp: new Date(),
          entityType: item.collectionPath.split('/').pop() || '',
          entityId: '', // Ensure this property is present
          retryable: true
        });
      }
    }
    
    // Commit the batch
    await batch.commit();
    
    // Remove processed items from queue
    processedItems.forEach(item => {
      const index = syncQueue.findIndex(queueItem => queueItem.id === item.id);
      if (index !== -1) {
        syncQueue.splice(index, 1);
      }
    });
    
    // Update app sync status
    appSyncStatus.lastSyncTime = new Date();
    updateSyncStatus();
      } catch (err) {
    const error = err as Error;
    console.error('Error processing sync queue batch:', error);
    
    // Mark all items as failed
    itemsToProcess.forEach(item => {
      if (!processedItems.includes(item) && !failedItems.includes(item)) {
        failedItems.push(item);
      }
    });
    
    appSyncStatus.syncState = 'error';
    addSyncError({
      id: generateUUIDv7(),
      message: `Batch sync operation failed: ${error.message || 'Unknown error'}`,
      timestamp: new Date(),
      entityType: '',
      entityId: '', // Ensure this property is present
      retryable: true
    });
  } finally {
    // Remove failed items from queue if max attempts reached
    failedItems.forEach(item => {
      if (item.attempts > MAX_RETRY_ATTEMPTS) {
        const index = syncQueue.findIndex(queueItem => queueItem.id === item.id);
        if (index !== -1) {
          syncQueue.splice(index, 1);
        }
      }
    });
    
    // Save queue to persistent storage
    saveSyncQueue();
    
    // Update sync status
    appSyncStatus.syncState = syncQueue.length > 0 ? 'idle' : 'idle';
    notifySyncStatusListeners();
    
    // Continue processing if there are more items
    if (syncQueue.length > 0) {
      setTimeout(processSyncQueue, 1000);
    }
  }
}

/**
 * Add an operation to the retry queue
 * 
 * @param item Retry queue item
 */
export function addToRetryQueue(item: Omit<RetryQueueItem, 'id' | 'attempts' | 'nextRetry'>): void {
  const retryItem: RetryQueueItem = {
    ...item,
    id: generateUUIDv7(),
    attempts: 0,
    nextRetry: Date.now() + BASE_BACKOFF_MS
  };
  
  retryQueue.push(retryItem);
  saveRetryQueue();
  
  // Add to app sync status errors
  addSyncError({
    id: generateUUIDv7(),
    message: item.errorMessage,
    timestamp: new Date(),
    entityType: '',
    entityId: '', // Ensure this property is present
    retryable: true
  });
}

/**
 * Process the retry queue
 */
export async function processRetryQueue(): Promise<void> {
  if (retryQueue.length === 0) {
    return;
  }
  
  const now = Date.now();
  const itemsToProcess = retryQueue.filter(item => item.nextRetry <= now);
  
  for (const item of itemsToProcess) {
    // Skip items that have exceeded max retry attempts
    if (item.attempts >= MAX_RETRY_ATTEMPTS) {
      // Remove from queue
      const index = retryQueue.findIndex(queueItem => queueItem.id === item.id);
      if (index !== -1) {
        retryQueue.splice(index, 1);
      }
      continue;
    }
    
    // Increment attempt counter
    item.attempts++;
      try {
      // Execute the operation
      await item.operation();
      
      // If successful, remove from queue
      const index = retryQueue.findIndex(queueItem => queueItem.id === item.id);
      if (index !== -1) {
        retryQueue.splice(index, 1);
      }
    } catch (error) {
      console.error(`Retry attempt ${item.attempts} failed:`, error);
      
      // Store the last error
      item.lastError = error;
      
      // Calculate next retry time with exponential backoff
      const backoff = BASE_BACKOFF_MS * Math.pow(2, item.attempts - 1);
      const jitter = Math.floor(Math.random() * 1000); // Add some randomness
      item.nextRetry = Date.now() + backoff + jitter;
    }
  }
  
  // Save queue to persistent storage
  saveRetryQueue();
}

/**
 * Save sync queue to persistent storage (localStorage)
 */
function saveSyncQueue(): void {
  try {
    localStorage.setItem('syncQueue', JSON.stringify(syncQueue));
  } catch (error) {
    console.error('Error saving sync queue to localStorage:', error);
  }
}

/**
 * Save retry queue to persistent storage (localStorage)
 */
function saveRetryQueue(): void {
  try {
    // We can't serialize functions, so we need to store a simplified version
    const serializableQueue = retryQueue.map(item => ({
      id: item.id,
      errorMessage: item.errorMessage,
      timestamp: item.timestamp,
      attempts: item.attempts,
      nextRetry: item.nextRetry,
      lastError: item.lastError ? item.lastError.message : undefined
    }));
    
    localStorage.setItem('retryQueue', JSON.stringify(serializableQueue));
  } catch (error) {
    console.error('Error saving retry queue to localStorage:', error);
  }
}

/**
 * Load sync queue from persistent storage (localStorage)
 */
export function loadSyncQueue(): void {
  try {
    const storedQueue = localStorage.getItem('syncQueue');
    if (storedQueue) {
      const parsed = JSON.parse(storedQueue);
      syncQueue.length = 0; // Clear the array
      syncQueue.push(...parsed);
      updateSyncStatus();
    }
  } catch (error) {
    console.error('Error loading sync queue from localStorage:', error);
  }
}

/**
 * Update the sync status
 */
function updateSyncStatus(): void {
  appSyncStatus.pendingChanges = syncQueue.length;
  notifySyncStatusListeners();
}

/**
 * Add a sync error to the app sync status
 * 
 * @param error The sync error
 */
function addSyncError(error: SyncError): void {
  // Limit the number of errors to keep (most recent 10)
  if (appSyncStatus.errors.length >= 10) {
    appSyncStatus.errors.pop(); // Remove oldest error
  }
  
  // Add new error at beginning
  appSyncStatus.errors.unshift(error);
  notifySyncStatusListeners();
}

// Sync status listeners
const syncStatusListeners: ((status: AppSyncStatus) => void)[] = [];

/**
 * Add a sync status listener
 * 
 * @param listener Function to call when sync status changes
 * @returns Function to remove the listener
 */
export function addSyncStatusListener(listener: (status: AppSyncStatus) => void): () => void {
  syncStatusListeners.push(listener);
  
  // Call the listener immediately with the current status
  listener(appSyncStatus);
  
  // Return function to remove the listener
  return () => {
    const index = syncStatusListeners.indexOf(listener);
    if (index !== -1) {
      syncStatusListeners.splice(index, 1);
    }
  };
}

/**
 * Notify all sync status listeners of changes
 */
function notifySyncStatusListeners(): void {
  syncStatusListeners.forEach(listener => listener({...appSyncStatus}));
}

/**
 * Get the current sync status
 * 
 * @returns Current app sync status
 */
export function getSyncStatus(): AppSyncStatus {
  return {...appSyncStatus};
}

/**
 * Initialize sync service
 * 
 * Sets up event listeners for online/offline status
 * and loads queues from persistent storage
 */
export function initSyncService(): void {
  // Set initial online status
  appSyncStatus.syncState = navigator.onLine ? 'idle' : 'offline';
  
  // Load queues from persistent storage
  loadSyncQueue();
  
  // Listen for online/offline events
  window.addEventListener('online', () => {
    appSyncStatus.syncState = 'idle';
    notifySyncStatusListeners();
    processSyncQueue();
  });
  
  window.addEventListener('offline', () => {
    appSyncStatus.syncState = 'offline';
    notifySyncStatusListeners();
  });
  
  // Setup periodic processing of queues
  setInterval(processSyncQueue, 60000); // Try to process sync queue every minute
  setInterval(processRetryQueue, 30000); // Try to process retry queue every 30 seconds
}

/**
 * Execute a Firebase operation with error handling
 * 
 * @param operation The operation to execute
 * @param errorMessage Error message to display on failure
 * @param onError Optional custom error handler
 * @returns Operation result or error object
 */
export async function executeFirebaseOperation<T>(
  operation: () => Promise<T>,
  errorMessage: string,
  onError?: (error: any) => void
): Promise<T | { success: false, error: any }> {
  try {
    return await operation();
  } catch (error: any) {
    console.error(`${errorMessage}:`, error);
    
    // Add to retry queue if appropriate
    addToRetryQueue({
      operation,
      errorMessage,
      error,
      timestamp: Date.now()
    });
    
    // Execute custom error handler if provided
    if (onError) {
      onError(error);
    }
    
    // Return structured error information
    return {
      success: false,
      error: {
        code: error.code || 'unknown',
        message: error.message || errorMessage,
        original: error
      }
    };
  }
}

// Initialize the sync service automatically
if (typeof window !== 'undefined') {
  initSyncService();
}
