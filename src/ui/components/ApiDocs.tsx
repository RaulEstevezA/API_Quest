import type { Language } from '../i18n'

const groups = [
  ['Users API', ['GET /users', 'GET /users/:id', 'POST /users', 'PATCH /users/:id', 'PUT /users/:id', 'DELETE /users/:id', 'GET /profile', 'PATCH /profile']],
  ['Products API', ['GET /products', 'GET /products/:id', 'POST /products', 'PATCH /products/:id', 'PUT /products/:id', 'DELETE /products/:id']],
  ['Orders API', ['GET /orders', 'GET /orders/:id', 'POST /orders', 'PATCH /orders/:id', 'DELETE /orders/:id']],
  ['Authentication API', ['POST /auth/login']],
  ['Admin API', ['GET /admin/users', 'PATCH /admin/users/:id', 'GET /admin/audit-log', 'PATCH /admin/orders/:id']],
] as const

export function ApiDocs({ language }: { language: Language }) {
  return <section className="window docs"><p className="eyebrow">API reference</p><h1>{language === 'es' ? 'Documentación de API' : 'API Documentation'}</h1><p className="subtitle">{language === 'es' ? 'Consulta endpoints, parámetros y autenticación mientras resuelves misiones.' : 'Consult endpoints, parameters, and authentication while solving missions.'}</p>
    <div className="docs__grid">{groups.map(([name, endpoints]) => <article className="docs__group" key={name}><h2>{name}</h2><ul>{endpoints.map((endpoint) => { const [method, path] = endpoint.split(' '); return <li key={endpoint}><span className={`method method--${method.toLowerCase()}`}>{method}</span><code>{path}</code></li> })}</ul></article>)}</div>
    <article className="docs__group"><h2>Query parameters</h2><div className="docs__table" role="table"><div role="row"><strong role="columnheader">Resource</strong><strong role="columnheader">Parameters</strong></div><div role="row"><span>/products</span><code>category, minPrice, maxPrice, sort, order, page, limit, q</code></div><div role="row"><span>/orders</span><code>customerId, status, sort, order, page, limit</code></div><div role="row"><span>/users</span><code>q, page, limit</code></div></div></article>
    <article className="docs__group"><h2>Authentication</h2><p>{language === 'es' ? 'Los endpoints protegidos esperan este header:' : 'Protected endpoints expect this header:'}</p><pre>Authorization: Bearer &lt;token&gt;</pre></article>
  </section>
}
