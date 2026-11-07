/**
 * Common header of the personal website: the name on the left and the language
 * selector on the right. Its content is fixed by `components/navigation.md` in
 * personal_web_style, so game navigation belongs in `GameNav`, not here.
 */

import { uiText } from '../../content/ui-text'
import type { Language } from '../i18n'

const LANGUAGES: readonly Language[] = ['en', 'es']

interface HeaderProps {
  language: Language
  onLanguageChange: (language: Language) => void
}

/** Renders the header shared with the personal website. */
export function Header({ language, onLanguageChange }: HeaderProps) {
  return (
    <header className="site-header">
      <a className="brand" href="https://raulesteveza.github.io/">
        Raúl Estévez
      </a>
      <div className="language-switch" role="group" aria-label={uiText.header.languageGroup[language]}>
        {LANGUAGES.map((option) => (
          <button
            className="language-switch__button"
            type="button"
            aria-pressed={language === option}
            onClick={() => onLanguageChange(option)}
            key={option}
          >
            {option.toUpperCase()}
          </button>
        ))}
      </div>
    </header>
  )
}
