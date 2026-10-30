export interface Achievement {
  id: string
  title: { en: string; es: string }
  description: { en: string; es: string }
}

export const achievements: Achievement[] = [
  { id: 'http-rookie', title: { en: 'HTTP Rookie', es: 'HTTP Rookie' }, description: { en: 'Complete your first request.', es: 'Completa tu primera petición.' } },
  { id: 'request-builder', title: { en: 'Request Builder', es: 'Request Builder' }, description: { en: 'Complete the First Request chapter.', es: 'Completa el capítulo Primera petición.' } },
  { id: 'method-specialist', title: { en: 'Method Specialist', es: 'Method Specialist' }, description: { en: 'Complete the HTTP Methods chapter.', es: 'Completa el capítulo Métodos HTTP.' } },
  { id: 'status-code-hunter', title: { en: 'Status Code Hunter', es: 'Status Code Hunter' }, description: { en: 'Complete the Status Codes chapter.', es: 'Completa el capítulo Códigos de estado.' } },
  { id: 'json-builder', title: { en: 'JSON Builder', es: 'JSON Builder' }, description: { en: 'Complete the JSON Lab.', es: 'Completa el Laboratorio JSON.' } },
  { id: 'query-navigator', title: { en: 'Query Navigator', es: 'Query Navigator' }, description: { en: 'Complete Query Parameters.', es: 'Completa Parámetros query.' } },
  { id: 'auth-explorer', title: { en: 'Auth Explorer', es: 'Auth Explorer' }, description: { en: 'Complete Authentication.', es: 'Completa Autenticación.' } },
  { id: 'api-debugger', title: { en: 'API Debugger', es: 'API Debugger' }, description: { en: 'Solve the final API Detective incident.', es: 'Resuelve el incidente final de API Detective.' } },
  { id: 'rest-master', title: { en: 'REST Master', es: 'REST Master' }, description: { en: 'Complete all 56 missions.', es: 'Completa las 56 misiones.' } },
]

export function unlockedAchievements(completedIds: string[]): string[] {
  const ids = new Set(completedIds)
  const unlocked: string[] = []
  if (ids.size >= 1) unlocked.push('http-rookie')
  const chapters: Array<[string, string]> = [['first-request','request-builder'],['http-methods','method-specialist'],['status-codes','status-code-hunter'],['json-lab','json-builder'],['query','query-navigator'],['auth','auth-explorer']]
  for (const [prefix, achievement] of chapters) if (completedIds.filter((id) => id.startsWith(`${prefix}-`)).length === 8) unlocked.push(achievement)
  if (ids.has('detective-8')) unlocked.push('api-debugger')
  if (ids.size >= 56) unlocked.push('rest-master')
  return unlocked
}
