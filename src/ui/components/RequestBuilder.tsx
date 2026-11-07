/**
 * Form used to build an HTTP request, shared by missions and the Sandbox. It knows
 * nothing about validation: it edits a request and reports when the player sends it.
 */

import { uiText } from '../../content/ui-text'
import { HTTP_METHODS, type ApiRequest, type QueryEntry } from '../../core/http'
import type { RequestField } from '../../core/missions'
import type { Language } from '../i18n'

const text = uiText.request

/** Editable row shared by query parameters and headers, which have the same shape. */
type KeyValueEntry = QueryEntry

interface RequestBuilderProps {
  language: Language
  request: ApiRequest
  /** Parts of the request the current exercise allows editing. */
  fields: RequestField[]
  /** `true` when the mission is solved, which disables sending. */
  solved: boolean
  onChange: (request: ApiRequest) => void
  onSend: () => void
}

interface KeyValueEditorProps {
  language: Language
  /** Name of the group, used to label each row for screen readers. */
  group: string
  entries: KeyValueEntry[]
  onChange: (entries: KeyValueEntry[]) => void
}

/** Renders the editable rows of query parameters or headers. */
function KeyValueEditor({ language, group, entries, onChange }: KeyValueEditorProps) {
  const updateEntry = (id: string, change: Partial<KeyValueEntry>) =>
    onChange(entries.map((item) => (item.id === id ? { ...item, ...change } : item)))

  return (
    <div className="key-value-list">
      {entries.map((entry, index) => (
        <div className="key-value-row" key={entry.id}>
          <input
            aria-label={text.rowKey(group, index + 1)[language]}
            placeholder={text.key[language]}
            value={entry.key}
            onChange={(event) => updateEntry(entry.id, { key: event.target.value })}
          />
          <input
            aria-label={text.rowValue(group, index + 1)[language]}
            placeholder={text.value[language]}
            value={entry.value}
            onChange={(event) => updateEntry(entry.id, { value: event.target.value })}
          />
          <button
            className="icon-button"
            type="button"
            aria-label={text.removeRow[language]}
            onClick={() => onChange(entries.filter((item) => item.id !== entry.id))}
          >
            ×
          </button>
        </div>
      ))}
      <button
        className="button button--small"
        type="button"
        onClick={() => onChange([...entries, { id: crypto.randomUUID(), key: '', value: '' }])}
      >
        {text.addRow[language]}
      </button>
    </div>
  )
}

/** Renders the request form. */
export function RequestBuilder({ language, request, fields, solved, onChange, onSend }: RequestBuilderProps) {
  return (
    <section className="pane request-builder" aria-labelledby="request-title">
      <div className="pane__header">
        <h2 id="request-title">{text.title[language]}</h2>
      </div>
      <div className="pane__body">
        <div className="request-line">
          <label>
            <span>{text.method[language]}</span>
            <select
              value={request.method}
              disabled={!fields.includes('method')}
              onChange={(event) => onChange({ ...request, method: event.target.value as ApiRequest['method'] })}
            >
              {HTTP_METHODS.map((method) => (
                <option key={method}>{method}</option>
              ))}
            </select>
          </label>
          <label className="request-line__path">
            <span>Endpoint</span>
            <input
              value={request.path}
              disabled={!fields.includes('path')}
              placeholder="/users/42"
              onChange={(event) => onChange({ ...request, path: event.target.value })}
            />
          </label>
        </div>
        {fields.includes('query') && (
          <fieldset>
            <legend>{text.queryParameters[language]}</legend>
            <KeyValueEditor
              language={language}
              group="Query"
              entries={request.query}
              onChange={(query) => onChange({ ...request, query })}
            />
          </fieldset>
        )}
        {fields.includes('headers') && (
          <fieldset>
            <legend>{text.headers[language]}</legend>
            <KeyValueEditor
              language={language}
              group="Headers"
              entries={request.headers}
              onChange={(headers) => onChange({ ...request, headers })}
            />
          </fieldset>
        )}
        {fields.includes('body') && (
          <label className="body-field">
            <span>{text.jsonBody[language]}</span>
            <textarea
              spellCheck={false}
              value={request.body}
              placeholder={'{\n  "name": "Ana"\n}'}
              onChange={(event) => onChange({ ...request, body: event.target.value })}
            />
          </label>
        )}
      </div>
      <div className="pane__footer">
        <span>
          {request.method} {request.path || '/'}
        </span>
        <button className="button button--primary" type="button" disabled={solved} onClick={onSend}>
          {(solved ? text.solved : text.send)[language]}
        </button>
      </div>
    </section>
  )
}
