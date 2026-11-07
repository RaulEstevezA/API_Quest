/**
 * Free-practice screen. It builds requests and shows the answers of the simulated API;
 * the data and the effects of each request are managed by `use-sandbox`.
 */

import { useState } from 'react'
import { uiText } from '../../content/ui-text'
import { createEmptyRequest, type ApiRequest } from '../../core/http'
import type { RequestField } from '../../core/missions'
import type { Language } from '../i18n'
import type { useSandbox } from '../use-sandbox'
import { PacketWire } from './PacketWire'
import { RecoveredPortrait } from './RecoveredPortrait'
import { RequestBuilder } from './RequestBuilder'
import { ResponseDetails, ResponsePane } from './ResponsePane'

const text = uiText.sandbox

/** The Sandbox allows editing every part of a request. */
const ALL_FIELDS: RequestField[] = ['method', 'path', 'query', 'headers', 'body']

interface SandboxProps {
  language: Language
  sandbox: Pick<
    ReturnType<typeof useSandbox>,
    'dataWasReset' | 'response' | 'sendCount' | 'portraitVisible' | 'send' | 'reset'
  >
}

/** Renders the Sandbox. */
export function Sandbox({ language, sandbox }: SandboxProps) {
  const [request, setRequest] = useState<ApiRequest>(() => ({ ...createEmptyRequest(), path: '/products' }))
  const { dataWasReset, response, sendCount, portraitVisible, send, reset } = sandbox

  const resetWithConfirmation = () => {
    if (window.confirm(text.resetConfirmation[language])) reset()
  }

  return (
    <>
      <section className="window mission-brief">
        <p className="eyebrow">{text.eyebrow[language]}</p>
        <h1>Sandbox</h1>
        <p>{text.description[language]}</p>
        <button className="button" type="button" onClick={resetWithConfirmation}>
          {text.resetData[language]}
        </button>
      </section>
      {dataWasReset && (
        <p className="notice notice--warning" role="status">
          {text.dataReset[language]}
        </p>
      )}
      <div className="workspace">
        <PacketWire language={language} sendCount={sendCount} />
        <RequestBuilder
          language={language}
          request={request}
          fields={ALL_FIELDS}
          solved={false}
          onChange={setRequest}
          onSend={() => send(request, language)}
        />
        <ResponsePane language={language}>
          {response ? (
            <div
              className={`feedback ${response.status < 400 ? 'feedback--success' : 'feedback--error'}`}
              role="status"
            >
              <ResponseDetails response={response} />
              {portraitVisible && <RecoveredPortrait language={language} />}
            </div>
          ) : (
            <p className="empty-state">{text.noResponse[language]}</p>
          )}
        </ResponsePane>
      </div>
    </>
  )
}
