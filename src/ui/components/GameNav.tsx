/**
 * Navigation between the screens of the game, in its own row below the website
 * header. To add a destination, add it to `DESTINATIONS` and to the texts of `uiText.nav`.
 */

import { uiText } from '../../content/ui-text'
import type { Language } from '../i18n'
import type { MenuScreen, Screen } from '../screens'

const DESTINATIONS: readonly MenuScreen[] = ['missions', 'docs', 'sandbox']

interface GameNavProps {
  language: Language
  /** Current screen. A mission belongs to the Missions destination. */
  current: Screen['name']
  onNavigate: (screen: MenuScreen) => void
  onHelp: () => void
}

/** Renders the links to each screen and the button that reopens the onboarding dialog. */
export function GameNav({ language, current, onNavigate, onHelp }: GameNavProps) {
  const activeDestination = current === 'mission' ? 'missions' : current

  return (
    <nav className="game-nav" aria-label={uiText.nav.label[language]}>
      {DESTINATIONS.map((destination) => (
        <button
          className="game-nav__item"
          type="button"
          aria-current={activeDestination === destination ? 'page' : undefined}
          onClick={() => onNavigate(destination)}
          key={destination}
        >
          {uiText.nav[destination][language]}
        </button>
      ))}
      <button className="game-nav__item" type="button" onClick={onHelp}>
        {uiText.nav.help[language]}
      </button>
    </nav>
  )
}
