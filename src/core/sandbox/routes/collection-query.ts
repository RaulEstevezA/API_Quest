/**
 * Query parameters of a collection: filtering, sorting and pagination, as documented on
 * the Docs screen. Filters form a registry: any other parameter compares a field exactly,
 * and to add a special filter, add it to `specialFilters`.
 */

import type { QueryEntry } from '../../http'
import type { SandboxResource } from '../state'

/** Decides whether a record passes a filter with the given value. */
type Filter = (item: SandboxResource, value: string) => boolean

/** Result of a query: the response body, or the explanation of an invalid parameter. */
export type CollectionQueryResult = { body: unknown } | { error: string }

/** Parameters that shape the result rather than filter it. */
const SHAPE_PARAMETERS = new Set(['sort', 'order', 'page', 'limit'])

/** Size of a page when the player asks for a page without saying how long it is. */
const DEFAULT_LIMIT = 20

/** Filters that do something other than comparing a field with the same name. */
const specialFilters: Record<string, Filter> = {
  // Free-text search: case-insensitive, over every text field of the record.
  q: (item, value) =>
    Object.values(item).some(
      (field) => typeof field === 'string' && field.toLowerCase().includes(value.toLowerCase()),
    ),
  minPrice: (item, value) => Number(item.price) >= Number(value),
  maxPrice: (item, value) => Number(item.price) <= Number(value),
}

/** Compares two field values: numbers by size and everything else as text. A missing value goes last. */
function compareValues(left: unknown, right: unknown): number {
  if (left === undefined) return right === undefined ? 0 : 1
  if (right === undefined) return -1
  if (typeof left === 'number' && typeof right === 'number') return left - right
  return String(left).localeCompare(String(right))
}

/** Reads a parameter that must be a positive integer. */
function positiveInteger(value: string | undefined): number | null {
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null
}

/**
 * Applies the query parameters of a request to a collection.
 *
 * @param collection Records of the collection. It is not mutated.
 * @param query Query rows of the request. Rows without a key are ignored.
 * @returns A plain list; or, when `page` or `limit` are present, the page with its
 * `items`, `page`, `limit` and `total`. Invalid values return an error instead.
 */
export function applyCollectionQuery(
  collection: readonly SandboxResource[],
  query: readonly QueryEntry[],
): CollectionQueryResult {
  const rows = query.filter((entry) => entry.key.trim())
  const parameter = (name: string) => rows.find((entry) => entry.key.trim() === name)?.value.trim()

  const order = parameter('order') ?? 'asc'
  if (order !== 'asc' && order !== 'desc') return { error: 'order must be asc or desc' }

  const filtered = rows
    .filter((entry) => !SHAPE_PARAMETERS.has(entry.key.trim()))
    .reduce<readonly SandboxResource[]>((items, entry) => {
      const name = entry.key.trim()
      const value = entry.value.trim()
      const filter: Filter = specialFilters[name] ?? ((item) => String(item[name]) === value)
      return items.filter((item) => filter(item, value))
    }, collection)

  const sortField = parameter('sort')
  const direction = order === 'desc' ? -1 : 1
  const sorted = sortField
    ? [...filtered].sort((a, b) => direction * compareValues(a[sortField], b[sortField]))
    : filtered

  const rawPage = parameter('page')
  const rawLimit = parameter('limit')
  if (rawPage === undefined && rawLimit === undefined) return { body: sorted }

  const page = rawPage === undefined ? 1 : positiveInteger(rawPage)
  const limit = rawLimit === undefined ? DEFAULT_LIMIT : positiveInteger(rawLimit)
  if (page === null || limit === null) return { error: 'page and limit must be positive integers' }

  const start = (page - 1) * limit
  return { body: { items: sorted.slice(start, start + limit), page, limit, total: sorted.length } }
}
