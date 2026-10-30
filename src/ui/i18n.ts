import { useEffect, useState } from 'react'
import type { LocalizedText } from '../core/missions'

export type Language = 'en' | 'es'

const LANGUAGE_KEY = 'api-quest.language'

function detectLanguage(): Language {
  try {
    const shared = localStorage.getItem('lang')
    const own = localStorage.getItem(LANGUAGE_KEY)
    const candidate = shared ?? own ?? navigator.language
    return candidate.toLowerCase().startsWith('es') ? 'es' : 'en'
  } catch {
    return navigator.language.toLowerCase().startsWith('es') ? 'es' : 'en'
  }
}

export function useLanguage() {
  const [language, setLanguageState] = useState<Language>(detectLanguage)

  useEffect(() => {
    document.documentElement.lang = language
    document.title = language === 'es' ? 'API Quest - Aprende APIs REST' : 'API Quest - Learn REST APIs'
  }, [language])

  const setLanguage = (next: Language) => {
    setLanguageState(next)
    try {
      localStorage.setItem(LANGUAGE_KEY, next)
      localStorage.setItem('lang', next)
    } catch {
      // Language still changes for the current tab.
    }
  }

  return { language, setLanguage, text: (value: LocalizedText) => value[language] }
}
