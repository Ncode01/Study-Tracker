// src/utils/idGenerator.ts

/**
 * Generates a UUIDv7 string.
 * UUIDv7 combines a timestamp with random data for sortable, unique IDs.
 * This is a simplified implementation.
 * 
 * @returns A string containing a timestamp-based UUIDv7 ID
 */
export function generateUUIDv7(): string {
  // Get current timestamp in milliseconds (48 bits)
  const now = BigInt(Date.now());
  
  // Convert timestamp to hex and pad to 12 characters (48 bits)
  const timestampHex = now.toString(16).padStart(12, '0');
  
  // Generate random values for the remaining parts
  const random1 = Math.floor(Math.random() * 0xffff).toString(16).padStart(4, '0');
  const random2 = Math.floor(Math.random() * 0xffff).toString(16).padStart(4, '0');
  const random3 = Math.floor(Math.random() * 0xffff).toString(16).padStart(4, '0');
  const random4 = Math.floor(Math.random() * 0xffffffffffff).toString(16).padStart(12, '0');

  // Format as UUID string (8-4-4-4-12)
  return `${timestampHex.substring(0, 8)}-${timestampHex.substring(8, 12)}${random1.substring(0, 2)}-7${random1.substring(2, 5)}-${random2}-${random3}${random4}`;
}

/**
 * Checks if an ID is a temporary ID (client-generated before sync)
 * Temporary IDs typically have a specific prefix or format
 * 
 * @param id The ID to check
 * @returns true if this is a temporary ID
 */
export function isTemporaryId(id: string): boolean {
  // Assuming temporary IDs have a 'temp-' prefix
  return id.startsWith('temp-');
}

/**
 * Generates a temporary ID for use before syncing with the server
 * 
 * @returns A temporary ID string
 */
export function generateTemporaryId(): string {
  return `temp-${Math.random().toString(36).substring(2, 15)}`;
}
