import type { Language } from '../i18n'

interface HeaderProps {
  language: Language
  onLanguageChange: (language: Language) => void
  onHome: () => void
}

export function Header({ language, onLanguageChange, onHome }: HeaderProps) {
  return (
    <header className="site-header">
      <button className="brand" type="button" onClick={onHome}>Raúl Estévez</button>
      <div className="language-switch" role="group" aria-label={language === 'es' ? 'Idioma' : 'Language'}>
        {(['en', 'es'] as const).map((option) => (
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
