/**
 * Browser implementation of the core `StorageAdapter`.
 *
 * `window.localStorage` is read on every call because merely accessing it throws
 * when the browser blocks site data. That way the failure reaches the `safe*`
 * helpers of the core instead of stopping the application on start.
 */

import type { StorageAdapter } from '../core/storage'

/** Storage of the current browser. As the contract allows, its methods may throw. */
export const browserStorage: StorageAdapter = {
  getItem: (key) => window.localStorage.getItem(key),
  setItem: (key, value) => window.localStorage.setItem(key, value),
  removeItem: (key) => window.localStorage.removeItem(key),
}
