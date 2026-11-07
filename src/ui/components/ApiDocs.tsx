/**
 * Docs screen: renders the reference of the fictional API.
 * The documented endpoints are data, in `content/api-reference.ts`.
 */

import { apiEndpointGroups, apiQueryParameters } from '../../content/api-reference'
import { uiText } from '../../content/ui-text'
import type { Language } from '../i18n'

const text = uiText.docs

/** Renders the API reference. */
export function ApiDocs({ language }: { language: Language }) {
  return (
    <section className="window docs">
      <p className="eyebrow">{text.eyebrow[language]}</p>
      <h1>{text.title[language]}</h1>
      <p className="subtitle">{text.subtitle[language]}</p>

      <div className="docs__grid">
        {apiEndpointGroups.map(({ name, endpoints }) => (
          <article className="docs__group" key={name}>
            <h2>{name}</h2>
            <ul>
              {endpoints.map((endpoint) => {
                const [method, path] = endpoint.split(' ')
                return (
                  <li key={endpoint}>
                    <span className={`method method--${method.toLowerCase()}`}>{method}</span>
                    <code>{path}</code>
                  </li>
                )
              })}
            </ul>
          </article>
        ))}
      </div>

      <article className="docs__group">
        <h2>{text.queryParameters[language]}</h2>
        <div className="docs__table" role="table">
          <div role="row">
            <strong role="columnheader">{text.resource[language]}</strong>
            <strong role="columnheader">{text.parameters[language]}</strong>
          </div>
          {apiQueryParameters.map(({ resource, parameters }) => (
            <div role="row" key={resource}>
              <span role="cell">{resource}</span>
              <code role="cell">{parameters}</code>
            </div>
          ))}
        </div>
      </article>

      <article className="docs__group">
        <h2>{text.authentication[language]}</h2>
        <p>{text.authenticationHint[language]}</p>
        <pre>Authorization: Bearer &lt;token&gt;</pre>
      </article>
    </section>
  )
}
