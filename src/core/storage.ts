/**
 * Persistence contract of the game (dependency inversion).
 *
 * The core never touches `localStorage`: it receives a `StorageAdapter` from the
 * outside, so the browser can be replaced by an in-memory double in tests. Any
 * adapter method may throw, because browsers can block storage or run out of
 * quota. The `safe*` helpers absorb those failures in one place, which lets the
 * game keep running with its in-memory state for the lifetime of the tab.
 */

/** Minimal key-value store required by the game. Methods may throw. */
export interface StorageAdapter {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}

/**
 * Creates a store that lives in memory. Used by tests in place of the browser store.
 *
 * @returns An empty store with the same contract as the browser one.
 */
export function createMemoryStorage(): StorageAdapter {
  const values = new Map<string, string>()
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => {
      values.set(key, value)
    },
    removeItem: (key) => {
      values.delete(key)
    },
  }
}

/**
 * Reads a value without propagating storage failures.
 *
 * @param storage Store to read from.
 * @param key Key of the value.
 * @returns The stored text, or `null` when it is missing or storage is unavailable.
 */
export function safeRead(storage: Pick<StorageAdapter, 'getItem'>, key: string): string | null {
  try {
    return storage.getItem(key)
  } catch {
    return null
  }
}

/**
 * Writes a value without propagating storage failures.
 *
 * @param storage Store to write to.
 * @param key Key of the value.
 * @param value Text to store.
 * @returns `true` when the value was stored, `false` when storage rejected it.
 */
export function safeWrite(storage: Pick<StorageAdapter, 'setItem'>, key: string, value: string): boolean {
  try {
    storage.setItem(key, value)
    return true
  } catch {
    return false
  }
}

/**
 * Removes a value without propagating storage failures.
 *
 * @param storage Store to remove from.
 * @param key Key of the value.
 */
export function safeRemove(storage: Pick<StorageAdapter, 'removeItem'>, key: string): void {
  try {
    storage.removeItem(key)
  } catch {
    // Nothing else can be done: the caller's in-memory state is already correct.
  }
}
