# API Quest

API Quest enseña conceptos de APIs REST mediante un cliente de API simulado. Cada misión plantea una tarea de desarrollo y pide construir o reparar una petición antes de inspeccionar la respuesta simulada y una explicación concreta.

## Ruta de aprendizaje

Los siete capítulos cubren primeras peticiones, métodos HTTP, códigos de estado, JSON, parámetros query, autenticación e incidentes de debugging combinados. Cada capítulo contiene ocho misiones diferentes y se desbloquea al completar el anterior.

## Funciones

- Catálogo declarativo bilingüe con 56 misiones.
- Bienvenida para la primera visita, acceso directo a la primera misión y ayuda disponible en todo momento.
- Constructor de métodos, endpoints, parámetros query, headers y cuerpos JSON.
- Feedback de validación específico, pistas progresivas, explicaciones, XP y logros.
- Documentación de API disponible dentro del juego.
- Sandbox persistente con CRUD de usuarios, productos y pedidos.
- Progreso versionado solo en el navegador, con reinicio y fallback en memoria.
- Interfaz responsive y accesible por teclado, coherente con `personal_web_style`.

## Desarrollo

```bash
npm install
npm run dev
```

Comprobaciones de calidad:

```bash
npm run lint
npm test
npm run build
```

El build de producción utiliza `/games/API_Quest/` como ruta base para la web personal.

## Arquitectura

El juego se divide en tres capas. Las dependencias solo apuntan hacia abajo, y el núcleo no conoce React, el navegador ni el almacenamiento.

```text
src/ui/       Pantallas de React y hooks de estado. App.tsx es la raíz de composición.
src/content/  Datos declarativos: misiones, capítulos, referencia de la API, textos de la interfaz.
src/core/     Reglas del juego: validación, puntuación, progreso, logros, API simulada.
```

Cada tipo de cambio tiene un único lugar:

| Patrón | Dónde | Cómo ampliarlo |
|---|---|---|
| Registro | `content/missions.ts` | Añade la misión a su archivo `chapter-<n>.ts` |
| Registro | `core/achievements.ts` | Añade el logro con su regla de desbloqueo |
| Registro | `core/evaluate-request.ts` | Añade la regla de validación a `requestRules` |
| Registro | `core/sandbox/router.ts` | Escribe una ruta en `core/sandbox/routes/` y añádela a `routes` |
| Estrategia | `core/sandbox/routes/resources.ts` | Un manejador por método HTTP en `methodHandlers` |
| Máquina de estados | `ui/screens.ts` | Añade la pantalla a `Screen`; el compilador señala el `switch` de `App.tsx` |
| Inversión de dependencias | `core/storage.ts` | Implementa `StorageAdapter`, como hace `ui/browser-storage.ts` |

Todo el texto visible es un valor `LocalizedText`, que se lee como `text[language]`. Los textos de la interfaz están en `content/ui-text.ts`.

El arte es código, no archivos de imagen. `ui/art/` dibuja los emblemas pixelados a partir de rejillas de texto y genera la escena de la sala de servidores, y `styles/chapter-themes.css` define el color de cada capítulo.

## Sugerencias

Puedes comunicar un error o sugerencia en [contact.raulesteveza@gmail.com](mailto:contact.raulesteveza@gmail.com).

## Desarrollador

**Raul Estevez** — [Web personal](https://raulesteveza.github.io/) · [LinkedIn](https://www.linkedin.com/in/raulesteveza/)

## Licencia

[MIT](./LICENSE)
