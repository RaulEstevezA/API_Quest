/**
 * Title of the initial menu: the logo, the name of the game and the overall progress,
 * surrounded by the requests and responses that travel through the server room.
 */

import { uiText } from '../../content/ui-text'
import type { Language } from '../i18n'

const text = uiText.dashboard

/**
 * Decorative traffic around the title. These are HTTP fragments, which read the same
 * in both languages, so they are not translated. Their position is set in title-screen.css.
 */
const TRAFFIC = [
  { label: 'GET /products', tone: 'info' },
  { label: '200 OK', tone: 'success' },
  { label: 'POST /orders', tone: 'lime' },
  { label: '404 Not Found', tone: 'danger' },
  { label: '{ "id": 17 }', tone: 'info' },
  { label: 'Authorization: Bearer', tone: 'warning' },
]

interface TitleScreenProps {
  language: Language
  xp: number
  completed: number
  total: number
}

/** Renders the title and the progress summary. */
export function TitleScreen({ language, xp, completed, total }: TitleScreenProps) {
  return (
    <section className="title-screen" aria-labelledby="app-title">
      <ul className="title-screen__traffic" aria-hidden="true">
        {TRAFFIC.map(({ label, tone }) => (
          <li className={`traffic-chip traffic-chip--${tone}`} key={label}>
            {label}
          </li>
        ))}
      </ul>

      <img
        className="title-screen__logo"
        src={`${import.meta.env.BASE_URL}api-quest-logo.png`}
        alt=""
        width="200"
        height="200"
      />
      <h1 className="title-screen__name" id="app-title">
        API Quest
      </h1>
      <p className="title-screen__subtitle">{text.subtitle[language]}</p>
      <p className="title-screen__description">{text.description[language]}</p>

      <dl className="progress-summary">
        <div>
          <dt>XP</dt>
          <dd>{xp}</dd>
        </div>
        <div>
          <dt>{text.missions[language]}</dt>
          <dd>
            {completed} / {total}
          </dd>
        </div>
        <div className="progress-summary__bar" aria-hidden="true">
          <i style={{ width: `${(completed / total) * 100}%` }} />
        </div>
      </dl>
    </section>
  )
}
