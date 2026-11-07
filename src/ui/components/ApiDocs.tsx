/** Docs screen: the title of the screen around the API reference. */

import { uiText } from '../../content/ui-text'
import type { Language } from '../i18n'
import { ApiReference } from './ApiReference'

const text = uiText.docs

/** Renders the Docs screen. */
export function ApiDocs({ language }: { language: Language }) {
  return (
    <section className="window docs">
      <p className="eyebrow">{text.eyebrow[language]}</p>
      <h1>{text.title[language]}</h1>
      <p className="subtitle">{text.subtitle[language]}</p>
      <ApiReference language={language} />
    </section>
  )
}
