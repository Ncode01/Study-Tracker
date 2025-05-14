

type NetworkStatusCallback = (isOnline: boolean) => void;
const listeners: NetworkStatusCallback[] = [];


export const getOnlineStatus = (): boolean => {
  return typeof navigator !== 'undefined' ? navigator.onLine : true;
};

/**
 * Subscribe to network status changes
 * @param callback Function to call when network status changes
 * @returns Function to unsubscribe
 */
export const subscribeToNetworkChanges = (callback: NetworkStatusCallback): () => void => {
  listeners.push(callback);
  
  // Initial call with current status
  setTimeout(() => callback(getOnlineStatus()), 0);
  
  // Setup listeners on first subscription
  if (listeners.length === 1 && typeof window !== 'undefined') {
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
  }
  
  // Return unsubscribe function
  return () => {
    const index = listeners.indexOf(callback);
    if (index !== -1) {
      listeners.splice(index, 1);
    }
    
    // Remove global listeners if no subscribers left
    if (listeners.length === 0 && typeof window !== 'undefined') {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    }
  };
};

/**
 * Handle browser online event
 */
const handleOnline = () => {
  listeners.forEach(callback => callback(true));
};

/**
 * Handle browser offline event
 */
const handleOffline = () => {
  listeners.forEach(callback => callback(false));
};

/**
 * Check if Firebase is available by pinging a Firebase service
 * @returns Promise that resolves to true if Firebase is available, false otherwise
 */
export const checkFirebaseConnection = async (): Promise<boolean> => {
  try {
    await fetch('https://firestore.googleapis.com/v1/projects/study-tracker-abdb2/databases/(default)', {
      method: 'GET',
      mode: 'no-cors', // This will prevent CORS errors but we won't get a valid response
    });
    
    // Since we used no-cors, we can't read the response
    // But if we get here without an error, it's likely configured properly
    return true;
  } catch (error: unknown) {
    console.error('Firebase connectivity check failed:', error);
    // Type check the error before accessing its properties
    if (error instanceof Error) {
      return false;
    }
    return false;
  }
};

/**
 * @param url URL to ping
 * @param timeout Timeout in milliseconds
 * @returns Promise that resolves to true if service is available, false otherwise
 */
export const fetchWithTimeout = async (url: string, options = {}, timeout = 5000): Promise<any> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    await fetch(url, {
      ...options,
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    return true;
  } catch (error: unknown) {
    console.error('Network error:', error);
    // Type check the error before accessing its properties
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'An unknown error occurred' };
  }
};