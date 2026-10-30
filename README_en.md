# API Quest

API Quest teaches REST API concepts through a simulated API client. Each mission presents a development task and asks the player to build or repair a request before inspecting the simulated response and a focused explanation.

## Learning path

The seven chapters cover first requests, HTTP methods, status codes, JSON, query parameters, authentication, and combined debugging incidents. Each chapter contains eight distinct missions and unlocks after the previous chapter is complete.

## Features

- Declarative bilingual mission catalogue with 56 missions.
- First-visit onboarding with a direct path into the first mission and persistent help access.
- Request builder for methods, endpoints, query parameters, headers, and JSON bodies.
- Specific validation feedback, progressive hints, explanations, XP, and achievements.
- API reference available inside the game.
- Persistent Sandbox with CRUD operations for users, products, and orders.
- Versioned browser-only progress with a reset action and an in-memory fallback.
- Responsive, keyboard-accessible interface aligned with `personal_web_style`.

## Development

```bash
npm install
npm run dev
```

Quality checks:

```bash
npm run lint
npm test
npm run build
```

The production build uses `/games/API-Quest/` as its base path for the personal website.

## Suggestions

Report an issue or suggestion at [contact.raulesteveza@gmail.com](mailto:contact.raulesteveza@gmail.com).

## Developer

**Raul Estevez** — [Personal Website](https://raulesteveza.github.io/) · [LinkedIn](https://www.linkedin.com/in/raulesteveza/)

## License

[MIT](./LICENSE)
