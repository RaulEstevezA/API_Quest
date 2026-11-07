/**
 * Language selection: detection, persistence and document metadata.
 * The texts themselves are in `content/`, always as `LocalizedText` values.
 */

import { useEffect, useState } from 'react'
import { uiText } from '../content/ui-text'
import { safeRead, safeWrite, type StorageAdapter } from '../core/storage'

/** Languages of the game. */
export type Language = 'en' | 'es'

/** Preference of this game. */
const LANGUAGE_KEY = 'api-quest.language'

/** Preference shared with the personal website and the demos. */
const SHARED_LANGUAGE_KEY = 'lang'

/**
 * Chooses the initial language. The shared preference goes first so that a language
 * chosen on the website carries over when the player arrives at the game.
 *
 * @param storage Store that holds the preferences.
 * @param browserLanguage Language reported by the browser, used when nothing is saved.
 * @returns Spanish for any `es` variant; English otherwise.
 */
export function detectLanguage(storage: Pick<StorageAdapter, 'getItem'>, browserLanguage: string): Language {
  const candidate = safeRead(storage, SHARED_LANGUAGE_KEY) ?? safeRead(storage, LANGUAGE_KEY) ?? browserLanguage
  return candidate.toLowerCase().startsWith('es') ? 'es' : 'en'
}

/**
 * Holds the current language and keeps the document language and title in sync.
 *
 * @param storage Store that holds the preferences.
 * @returns The current language and the function that changes and saves it.
 */
export function useLanguage(storage: StorageAdapter) {
  const [language, setLanguageState] = useState<Language>(() => detectLanguage(storage, navigator.language))

  useEffect(() => {
    document.documentElement.lang = language
    document.title = uiText.document.title[language]
  }, [language])

  const setLanguage = (next: Language) => {
    setLanguageState(next)
    safeWrite(storage, LANGUAGE_KEY, next)
    safeWrite(storage, SHARED_LANGUAGE_KEY, next)
  }

  return { language, setLanguage }
}
