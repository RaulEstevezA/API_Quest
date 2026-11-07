/**
 * Title of the main menu: the logo and the name of the game, surrounded by the requests
 * and responses that travel through the server room. The menu goes inside as children.
 */

import type { ReactNode } from 'react'
import { uiText } from '../../content/ui-text'
import type { Language } from '../i18n'

const text = uiText.menu

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
  children: ReactNode
}

/** Renders the title and whatever the main menu places below it. */
export function TitleScreen({ language, children }: TitleScreenProps) {
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
      {children}
    </section>
  )
}
