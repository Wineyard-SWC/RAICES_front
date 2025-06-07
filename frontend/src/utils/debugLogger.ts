/**
 * Utility for conditional logging that can be globally enabled/disabled
 * via environment variable NEXT_PUBLIC_DEBUG_LOGS
 */

// Check if debug logs are enabled (defaults to false if not set)
const isDebugEnabled = process.env.NEXT_PUBLIC_DEBUG_LOGS === 'true';

/**
 * Print debug information only if debugging is enabled
 * Works just like console.log but can be globally toggled off
 */
export function print(...args: any[]) {
  if (isDebugEnabled) {
    console.log(...args);
  }
}

/**
 * Same as print but for warnings
 */
export function printWarn(...args: any[]) {
  if (isDebugEnabled) {
    console.warn(...args);
  }
}

/**
 * Same as print but for errors (often you'll want these regardless of debug setting)
 */
export function printError(...args: any[]) {
  // You might want errors to always show, but you can make this conditional too}
  if (isDebugEnabled) {
    console.error(...args);
  }
}