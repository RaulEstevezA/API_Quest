import type { Language } from '../i18n'

interface HeaderProps {
  language: Language
  onLanguageChange: (language: Language) => void
  onHome: () => void
  onDocs: () => void
  onSandbox: () => void
  onHelp: () => void
}

export function Header({ language, onLanguageChange, onHome, onDocs, onSandbox, onHelp }: HeaderProps) {
  return (
    <header className="site-header">
      <a className="brand" href="https://raulesteveza.github.io">Raúl Estévez</a>
      <nav className="main-nav" aria-label={language === 'es' ? 'Navegación principal' : 'Main navigation'}><button type="button" onClick={onHome}>{language === 'es' ? 'Misiones' : 'Missions'}</button><button type="button" onClick={onDocs}>Docs</button><button type="button" onClick={onSandbox}>Sandbox</button><button type="button" onClick={onHelp}>{language === 'es' ? 'Cómo jugar' : 'How to play'}</button></nav>
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
