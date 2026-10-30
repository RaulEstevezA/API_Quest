import { useEffect, useState } from 'react'
import { createEmptyRequest, type ApiRequest, type ApiResponse } from '../../core/http'
import { createSandboxState, loadSandbox, runSandboxRequest, SANDBOX_KEY } from '../../core/sandbox'
import type { Language } from '../i18n'
import { RequestBuilder } from './RequestBuilder'

export function Sandbox({ language }: { language: Language }) {
  const [request, setRequest] = useState<ApiRequest>(() => ({ ...createEmptyRequest(), path: '/products' }))
  const [state, setState] = useState(() => loadSandbox(localStorage))
  const [response, setResponse] = useState<ApiResponse | null>(null)
  useEffect(() => { try { localStorage.setItem(SANDBOX_KEY, JSON.stringify(state)) } catch { /* Memory state remains usable. */ } }, [state])
  const send = () => { const result = runSandboxRequest(state, request); setState(result.state); setResponse(result.response) }
  const reset = () => {
    const message = language === 'es' ? '¿Restablecer todos los datos del Sandbox?' : 'Reset all Sandbox data?'
    if (window.confirm(message)) { setState(createSandboxState()); setResponse(null) }
  }
  return <><section className="window mission-brief"><p className="eyebrow">Free practice</p><h1>Sandbox</h1><p>{language === 'es' ? 'Experimenta con la API ficticia. Los cambios se guardan en este navegador.' : 'Experiment with the fictional API. Changes are saved in this browser.'}</p><button className="button" type="button" onClick={reset}>{language === 'es' ? 'Restablecer datos' : 'Reset data'}</button></section><div className="workspace"><RequestBuilder language={language} request={request} fields={['method','path','query','headers','body']} disabled={false} onChange={setRequest} onSend={send}/><section className="pane response-pane"><div className="pane__header"><h2>Response</h2></div><div className="pane__body">{!response ? <p className="empty-state">{language === 'es' ? 'Envía una petición para empezar.' : 'Send a request to begin.'}</p> : <div className={`feedback ${response.status < 400 ? 'feedback--success' : 'feedback--error'}`}><strong>{response.status} {response.statusText}</strong>{response.body !== undefined && <pre>{JSON.stringify(response.body,null,2)}</pre>}</div>}</div></section></div></>
}
