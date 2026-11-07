/**
 * Decides when the onboarding dialog is visible: automatically on the first visit,
 * and on demand afterwards.
 */

import { useState } from 'react'
import { safeRead, safeWrite, type StorageAdapter } from '../core/storage'

const ONBOARDING_STORAGE_KEY = 'api-quest.onboarding-seen'

/**
 * Provides the visibility of the onboarding dialog.
 *
 * @param storage Store that remembers the first visit. Without storage, the dialog appears on every visit.
 * @returns Whether the dialog is open, and the functions that open and close it.
 */
export function useOnboarding(storage: StorageAdapter) {
  const [open, setOpen] = useState(() => safeRead(storage, ONBOARDING_STORAGE_KEY) !== 'true')

  return {
    open,
    show: () => setOpen(true),
    close: () => {
      setOpen(false)
      safeWrite(storage, ONBOARDING_STORAGE_KEY, 'true')
    },
  }
}
