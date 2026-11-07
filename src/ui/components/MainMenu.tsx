/**
 * Main menu, the first screen of the game. It holds the title, the storage notices and the buttons that lead to everything else. To add a screen
 * to the menu, add it to `DESTINATIONS` and to `MenuDestination` in `screens.ts`.
 */

import { uiText } from '../../content/ui-text'
import type { Language } from '../i18n'
import type { MenuDestination } from '../screens'
import { TitleScreen } from './TitleScreen'

const text = uiText.menu

/** Screens opened from the menu, in display order after the main Missions button. */
const DESTINATIONS: readonly MenuDestination[] = ['docs', 'sandbox', 'achievements']

interface MainMenuProps {
  language: Language
  /** `false` when progress cannot be saved and will only last for this tab. */
  storageAvailable: boolean
  /** `true` when saved progress could not be restored and was replaced. */
  progressWasReset: boolean
  /** Opens the mission to continue with, or `null` when there is nothing to continue. */
  onContinue: (() => void) | null
  onNavigate: (destination: MenuDestination) => void
  onHelp: () => void
  onReset: () => void
}

/** Renders the main menu. */
export function MainMenu({
  language,
  storageAvailable,
  progressWasReset,
  onContinue,
  onNavigate,
  onHelp,
  onReset,
}: MainMenuProps) {
  return (
    <TitleScreen language={language}>
      {!storageAvailable && (
        <p className="notice notice--warning" role="status">
          {text.storageUnavailable[language]}
        </p>
      )}
      {progressWasReset && (
        <p className="notice notice--warning" role="status">
          {text.progressReset[language]}
        </p>
      )}

      <nav className="main-menu" aria-label={text.label[language]}>
        {onContinue && (
          <button className="button button--primary main-menu__wide" type="button" onClick={onContinue}>
            {text.continue[language]}
          </button>
        )}
        {/* There is one primary action per group: Missions is primary only when there is nothing to continue. */}
        <button
          className={`button main-menu__wide${onContinue ? '' : ' button--primary'}`}
          type="button"
          onClick={() => onNavigate('missions')}
        >
          {text.missions[language]}
        </button>
        {DESTINATIONS.map((destination) => (
          <button className="button" type="button" onClick={() => onNavigate(destination)} key={destination}>
            {text[destination][language]}
          </button>
        ))}
        <button className="button" type="button" onClick={onHelp}>
          {text.help[language]}
        </button>
        <button className="button" type="button" onClick={onReset}>
          {text.resetProgress[language]}
        </button>
        <a className="button" href="../">
          {text.games[language]}
        </a>
      </nav>
    </TitleScreen>
  )
}
