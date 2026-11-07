/**
 * Ending of the game, reached after completing every mission. It closes the story and
 * sums up the player's result.
 */

import { uiText } from '../../content/ui-text'
import type { Language } from '../i18n'

const text = uiText.ending

interface EndingScreenProps {
  language: Language
  xp: number
  missions: number
  achievements: number
  onBack: () => void
}

/** Renders the ending and the way back to the menu. */
export function EndingScreen({ language, xp, missions, achievements, onBack }: EndingScreenProps) {
  return (
    <section className="ending" aria-labelledby="ending-title">
      <img
        className="title-screen__logo"
        src={`${import.meta.env.BASE_URL}api-quest-logo.png`}
        alt=""
        width="200"
        height="200"
      />
      <p className="eyebrow">{text.eyebrow[language]}</p>
      <h1 className="ending__title" id="ending-title">
        {text.title[language]}
      </h1>
      {text.paragraphs[language].map((paragraph) => (
        <p className="ending__text" key={paragraph}>
          {paragraph}
        </p>
      ))}
      <dl className="ending__stats">
        <div>
          <dt>XP</dt>
          <dd>{xp}</dd>
        </div>
        <div>
          <dt>{uiText.menu.missions[language]}</dt>
          <dd>{missions}</dd>
        </div>
        <div>
          <dt>{uiText.menu.achievements[language]}</dt>
          <dd>{achievements}</dd>
        </div>
      </dl>
      <button className="button button--primary" type="button" onClick={onBack}>
        {uiText.menu.back[language]}
      </button>
    </section>
  )
}
