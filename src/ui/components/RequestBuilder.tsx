import { HTTP_METHODS, type ApiRequest, type HeaderEntry, type QueryEntry } from '../../core/http'
import type { Language } from '../i18n'

interface Props {
  language: Language
  request: ApiRequest
  fields: string[]
  disabled: boolean
  onChange: (request: ApiRequest) => void
  onSend: () => void
}

const createEntry = (): QueryEntry => ({ id: crypto.randomUUID(), key: '', value: '' })

export function RequestBuilder({ language, request, fields, disabled, onChange, onSend }: Props) {
  const updateEntries = (type: 'query' | 'headers', entries: QueryEntry[] | HeaderEntry[]) => onChange({ ...request, [type]: entries })
  const renderEntries = (type: 'query' | 'headers') => {
    const entries = request[type]
    return <div className="key-value-list">{entries.map((entry, index) => <div className="key-value-row" key={entry.id}>
      <input aria-label={`${type} ${language === 'es' ? 'clave' : 'key'} ${index + 1}`} placeholder={language === 'es' ? 'Clave' : 'Key'} value={entry.key} onChange={(event) => updateEntries(type, entries.map((item) => item.id === entry.id ? { ...item, key: event.target.value } : item))} />
      <input aria-label={`${type} ${language === 'es' ? 'valor' : 'value'} ${index + 1}`} placeholder={language === 'es' ? 'Valor' : 'Value'} value={entry.value} onChange={(event) => updateEntries(type, entries.map((item) => item.id === entry.id ? { ...item, value: event.target.value } : item))} />
      <button className="icon-button" type="button" aria-label={language === 'es' ? 'Eliminar fila' : 'Remove row'} onClick={() => updateEntries(type, entries.filter((item) => item.id !== entry.id))}>×</button>
    </div>)}<button className="button button--small" type="button" onClick={() => updateEntries(type, [...entries, createEntry()])}>{language === 'es' ? 'Añadir fila' : 'Add row'}</button></div>
  }

  return <section className="pane request-builder" aria-labelledby="request-title">
    <div className="pane__header"><h2 id="request-title">{language === 'es' ? 'Constructor de petición' : 'Request Builder'}</h2></div>
    <div className="pane__body">
      <div className="request-line">
        <label><span>{language === 'es' ? 'Método' : 'Method'}</span><select value={request.method} disabled={!fields.includes('method')} onChange={(event) => onChange({ ...request, method: event.target.value as ApiRequest['method'] })}>{HTTP_METHODS.map((method) => <option key={method}>{method}</option>)}</select></label>
        <label className="request-line__path"><span>Endpoint</span><input value={request.path} disabled={!fields.includes('path')} placeholder="/users/42" onChange={(event) => onChange({ ...request, path: event.target.value })} /></label>
      </div>
      {fields.includes('query') && <fieldset><legend>Query parameters</legend>{renderEntries('query')}</fieldset>}
      {fields.includes('headers') && <fieldset><legend>Headers</legend>{renderEntries('headers')}</fieldset>}
      {fields.includes('body') && <label className="body-field"><span>JSON body</span><textarea spellCheck={false} value={request.body} placeholder={'{\n  "name": "Ana"\n}'} onChange={(event) => onChange({ ...request, body: event.target.value })} /></label>}
    </div>
    <div className="pane__footer"><span>{request.method} {request.path || '/'}</span><button className="button button--primary" type="button" disabled={disabled} onClick={onSend}>{disabled ? (language === 'es' ? 'Resuelto' : 'Solved') : (language === 'es' ? 'Enviar petición' : 'Send Request')}</button></div>
  </section>
}
