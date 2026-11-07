/**
 * Language selection: detection, persistence and document metadata.
 * The texts themselves are in `content/`, always as `LocalizedText` values.
 */

import { useEffect, useState } from 'react'
import { uiText } from '../content/ui-text'
import { safeRead, safeWrite, type StorageAdapter } from '../core/storage'

/** Languages of the game. */
export type Language = 'en' | 'es'

/** Preference shared with the personal website, which is served from the same origin. */
const SHARED_LANGUAGE_KEY = 'lang'

/**
 * Chooses the initial language: the game inherits the one selected on the website,
 * and uses English when there is nothing to inherit. The browser language is
 * deliberately ignored, so that the game never disagrees with the website.
 *
 * @param storage Store that holds the shared preference.
 * @returns Spanish for any saved `es` variant; English otherwise.
 */
export function detectLanguage(storage: Pick<StorageAdapter, 'getItem'>): Language {
  return safeRead(storage, SHARED_LANGUAGE_KEY)?.toLowerCase().startsWith('es') ? 'es' : 'en'
}

/**
 * Holds the current language and keeps the document language and title in sync.
 *
 * @param storage Store that holds the shared preference.
 * @returns The current language and the function that changes and saves it.
 */
export function useLanguage(storage: StorageAdapter) {
  const [language, setLanguageState] = useState<Language>(() => detectLanguage(storage))

  useEffect(() => {
    document.documentElement.lang = language
    document.title = uiText.document.title[language]
  }, [language])

  const setLanguage = (next: Language) => {
    setLanguageState(next)
    safeWrite(storage, SHARED_LANGUAGE_KEY, next)
  }

  return { language, setLanguage }
}
