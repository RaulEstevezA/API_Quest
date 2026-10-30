import type { Chapter } from '../core/missions'

export const chapters: Chapter[] = [
  {
    id: 1,
    title: { en: 'First Request', es: 'Primera petición' },
    description: { en: 'Meet resources, endpoints, requests, and responses.', es: 'Conoce recursos, endpoints, peticiones y respuestas.' },
    concepts: ['API', 'GET', 'resources', 'IDs'],
  },
  {
    id: 2,
    title: { en: 'HTTP Methods', es: 'Métodos HTTP' },
    description: { en: 'Choose the operation that matches each task.', es: 'Elige la operación que corresponde a cada tarea.' },
    concepts: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  },
  {
    id: 3,
    title: { en: 'Status Codes', es: 'Códigos de estado' },
    description: { en: 'Read what a response says about the request.', es: 'Interpreta qué dice una respuesta sobre la petición.' },
    concepts: ['2xx', '4xx', '5xx'],
  },
  {
    id: 4,
    title: { en: 'JSON Lab', es: 'Laboratorio JSON' },
    description: { en: 'Build valid, correctly typed request bodies.', es: 'Construye cuerpos válidos y con tipos correctos.' },
    concepts: ['JSON', 'types', 'validation'],
  },
  {
    id: 5,
    title: { en: 'Query Parameters', es: 'Parámetros query' },
    description: { en: 'Filter, sort, search, and paginate collections.', es: 'Filtra, ordena, busca y pagina colecciones.' },
    concepts: ['filters', 'sorting', 'pagination'],
  },
  {
    id: 6,
    title: { en: 'Authentication', es: 'Autenticación' },
    description: { en: 'Use tokens, roles, and permissions safely.', es: 'Usa tokens, roles y permisos de forma segura.' },
    concepts: ['Bearer tokens', '401', '403', 'roles'],
  },
  {
    id: 7,
    title: { en: 'API Detective', es: 'Detective de APIs' },
    description: { en: 'Diagnose realistic failures across the full request.', es: 'Diagnostica fallos realistas en toda la petición.' },
    concepts: ['debugging', 'diagnosis', 'combined requests'],
  },
]
