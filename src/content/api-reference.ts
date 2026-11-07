/**
 * Declarative reference of the fictional API, shown on the Docs screen.
 * To document an endpoint, add it here; the screen renders whatever this file lists.
 */

/** Endpoints of one fictional service, written as `METHOD /path`. */
export interface ApiEndpointGroup {
  name: string
  endpoints: readonly string[]
}

/** Query parameters accepted by a collection. */
export interface ApiQueryParameters {
  resource: string
  parameters: string
}

/** Every documented service. */
export const apiEndpointGroups: readonly ApiEndpointGroup[] = [
  {
    name: 'Users API',
    endpoints: [
      'GET /users',
      'GET /users/:id',
      'POST /users',
      'PATCH /users/:id',
      'PUT /users/:id',
      'DELETE /users/:id',
      'GET /profile',
      'PATCH /profile',
    ],
  },
  {
    name: 'Products API',
    endpoints: [
      'GET /products',
      'GET /products/:id',
      'POST /products',
      'PATCH /products/:id',
      'PUT /products/:id',
      'DELETE /products/:id',
    ],
  },
  {
    name: 'Orders API',
    endpoints: ['GET /orders', 'GET /orders/:id', 'POST /orders', 'PATCH /orders/:id', 'DELETE /orders/:id'],
  },
  { name: 'Authentication API', endpoints: ['POST /auth/login'] },
  {
    name: 'Admin API',
    endpoints: ['GET /admin/users', 'PATCH /admin/users/:id', 'GET /admin/audit-log', 'PATCH /admin/orders/:id'],
  },
]

/** Every collection that accepts query parameters. */
export const apiQueryParameters: readonly ApiQueryParameters[] = [
  { resource: '/products', parameters: 'category, minPrice, maxPrice, sort, order, page, limit, q' },
  { resource: '/orders', parameters: 'customerId, status, sort, order, page, limit' },
  { resource: '/users', parameters: 'q, page, limit' },
]
