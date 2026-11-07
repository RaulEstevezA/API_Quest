/**
 * Display of API responses, shared by missions and the Sandbox. Each screen
 * decides what goes inside the pane, by composition.
 */

import type { ReactNode } from 'react'
import { uiText } from '../../content/ui-text'
import type { ApiResponse } from '../../core/http'
import type { Language } from '../i18n'

interface ResponsePaneProps {
  language: Language
  children: ReactNode
}

/** Renders the titled pane that holds a response or its empty state. */
export function ResponsePane({ language, children }: ResponsePaneProps) {
  return (
    <section className="pane response-pane" aria-labelledby="response-title">
      <div className="pane__header">
        <h2 id="response-title">{uiText.response.title[language]}</h2>
      </div>
      <div className="pane__body">{children}</div>
    </section>
  )
}

/** Renders the status line, headers and JSON body of a response. */
export function ResponseDetails({ response }: { response: ApiResponse }) {
  const headers = Object.entries(response.headers ?? {})

  return (
    <>
      <strong>
        {response.status} {response.statusText}
      </strong>
      {headers.length > 0 && <pre>{headers.map(([key, value]) => `${key}: ${value}`).join('\n')}</pre>}
      {response.body !== undefined && <pre>{JSON.stringify(response.body, null, 2)}</pre>}
    </>
  )
}
