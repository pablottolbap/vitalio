/**
 * Safely get value from localStorage with fallback
 * @param {string} key - Storage key
 * @param {*} fallback - Value to return if key doesn't exist or error occurs
 * @returns {*} - Stored value or fallback
 */
export function safeLocalStorageGet(key, fallback = null) {
  try {
    const value = localStorage.getItem(key);
    return value !== null ? value : fallback;
  } catch {
    if (import.meta.env.DEV) console.warn(`[localStorage] Failed to read key "${key}"`);
    return fallback;
  }
}

/**
 * Safely set value in localStorage
 * @param {string} key - Storage key
 * @param {string} value - Value to store
 * @returns {boolean} - True if successful, false if error
 */
export function safeLocalStorageSet(key, value) {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch {
    if (import.meta.env.DEV) console.warn(`[localStorage] Failed to write key "${key}"`);
    return false;
  }
}

/**
 * Safely remove value from localStorage
 * @param {string} key - Storage key
 * @returns {boolean} - True if successful, false if error
 */
export function safeLocalStorageRemove(key) {
  try {
    localStorage.removeItem(key);
    return true;
  } catch {
    if (import.meta.env.DEV) console.warn(`[localStorage] Failed to remove key "${key}"`);
    return false;
  }
}
