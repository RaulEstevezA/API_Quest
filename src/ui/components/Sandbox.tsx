/**
 * Free-practice screen. It runs requests against the simulated API of
 * `core/sandbox.ts` and saves the resulting data, independently of game progress.
 */

import { useEffect, useState } from 'react'
import { uiText } from '../../content/ui-text'
import { createEmptyRequest, type ApiRequest, type ApiResponse } from '../../core/http'
import type { RequestField } from '../../core/missions'
import { createSandboxState, loadSandbox, runSandboxRequest, saveSandbox } from '../../core/sandbox'
import type { StorageAdapter } from '../../core/storage'
import type { Language } from '../i18n'
import { PacketWire } from './PacketWire'
import { RequestBuilder } from './RequestBuilder'
import { ResponseDetails, ResponsePane } from './ResponsePane'

const text = uiText.sandbox

/** The Sandbox allows editing every part of a request. */
const ALL_FIELDS: RequestField[] = ['method', 'path', 'query', 'headers', 'body']

interface SandboxProps {
  language: Language
  storage: StorageAdapter
}

/** Renders the Sandbox and keeps its data saved. */
export function Sandbox({ language, storage }: SandboxProps) {
  const [request, setRequest] = useState<ApiRequest>(() => ({ ...createEmptyRequest(), path: '/products' }))
  const [state, setState] = useState(() => loadSandbox(storage))
  const [response, setResponse] = useState<ApiResponse | null>(null)
  const [sendCount, setSendCount] = useState(0)

  useEffect(() => {
    saveSandbox(storage, state)
  }, [storage, state])

  const send = () => {
    const result = runSandboxRequest(state, request)
    setState(result.state)
    setResponse(result.response)
    setSendCount((count) => count + 1)
  }

  const reset = () => {
    if (window.confirm(text.resetConfirmation[language])) {
      setState(createSandboxState())
      setResponse(null)
    }
  }

  return (
    <>
      <section className="window mission-brief">
        <p className="eyebrow">{text.eyebrow[language]}</p>
        <h1>Sandbox</h1>
        <p>{text.description[language]}</p>
        <button className="button" type="button" onClick={reset}>
          {text.resetData[language]}
        </button>
      </section>
      <div className="workspace">
        <PacketWire language={language} sendCount={sendCount} />
        <RequestBuilder
          language={language}
          request={request}
          fields={ALL_FIELDS}
          solved={false}
          onChange={setRequest}
          onSend={send}
        />
        <ResponsePane language={language}>
          {response ? (
            <div
              className={`feedback ${response.status < 400 ? 'feedback--success' : 'feedback--error'}`}
              role="status"
            >
              <ResponseDetails response={response} />
            </div>
          ) : (
            <p className="empty-state">{text.noResponse[language]}</p>
          )}
        </ResponsePane>
      </div>
    </>
  )
}
