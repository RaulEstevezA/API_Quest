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

## Sugerencias

Puedes comunicar un error o sugerencia en [contact.raulesteveza@gmail.com](mailto:contact.raulesteveza@gmail.com).

## Desarrollador

**Raul Estevez** — [Web personal](https://raulesteveza.github.io/) · [LinkedIn](https://www.linkedin.com/in/raulesteveza/)

## Licencia

[MIT](./LICENSE)
