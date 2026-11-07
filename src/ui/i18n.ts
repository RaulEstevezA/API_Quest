/**
 * Language selection: detection, persistence and document metadata.
 * The texts themselves are in `content/`, always as `LocalizedText` values.
 */

import { useEffect, useState } from 'react'
import { uiText } from '../content/ui-text'
import { safeRead, safeWrite, type StorageAdapter } from '../core/storage'

/** Languages of the game. */
export type Language = 'en' | 'es'

/** Languages offered by the selector, in the order it shows them. */
export const LANGUAGES: readonly Language[] = ['en', 'es']

/** Preference shared with the personal website, which is served from the same origin. */
const SHARED_LANGUAGE_KEY = 'lang'

/** Language used when neither the website nor the browser offers one of the game. */
const DEFAULT_LANGUAGE: Language = 'en'

/**
 * Reduces a language tag to a language of the game.
 *
 * @param tag Tag such as `es` or `es-ES`.
 * @returns The language, or `null` when the game does not have it.
 */
function toLanguage(tag: string | null): Language | null {
  const code = tag?.slice(0, 2).toLowerCase()
  return LANGUAGES.find((language) => language === code) ?? null
}

/**
 * Chooses the initial language in the order fixed for the whole website by DECISIONS.md
 * in personal_web_style: the shared preference, then the browser, then English.
 *
 * @param storage Store that holds the shared preference.
 * @param browserLanguage Language of the browser.
 * @returns The language to use.
 */
export function detectLanguage(
  storage: Pick<StorageAdapter, 'getItem'>,
  browserLanguage: string = navigator.language,
): Language {
  return toLanguage(safeRead(storage, SHARED_LANGUAGE_KEY)) ?? toLanguage(browserLanguage) ?? DEFAULT_LANGUAGE
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
