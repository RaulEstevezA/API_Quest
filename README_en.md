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

The production build uses `/games/API_Quest/` as its base path for the personal website.

## Architecture

The game is split into three layers. Dependencies only point downwards, and the core does not know about React, the browser, or storage.

```text
src/ui/       React screens and state hooks. App.tsx is the composition root.
src/content/  Declarative data: missions, chapters, API reference, interface texts.
src/core/     Game rules: validation, scoring, progress, achievements, simulated API.
```

Each kind of change has one place to go:

| Pattern | Where | To extend it |
|---|---|---|
| Registry | `content/missions.ts` | Add a mission to its `chapter-<n>.ts` file |
| Registry | `core/achievements.ts` | Add an achievement with its unlock rule |
| Registry | `core/evaluate-request.ts` | Add a validation rule to `requestRules` |
| Registry | `core/sandbox/router.ts` | Write a route in `core/sandbox/routes/` and add it to `routes` |
| Strategy | `core/sandbox/routes/resources.ts` | One handler per HTTP method in `methodHandlers` |
| State machine | `ui/screens.ts` | Add a screen to `Screen`; the compiler points to the `switch` in `App.tsx` |
| Dependency inversion | `core/storage.ts` | Implement `StorageAdapter`, as `ui/browser-storage.ts` does |

All visible text is a `LocalizedText` value, read as `text[language]`. Interface texts are in `content/ui-text.ts`.

The art is code rather than image files. `ui/art/` draws the pixel emblems from text grids and generates the server room scene, and `styles/chapter-themes.css` sets the colour of each chapter.

## Suggestions

Report an issue or suggestion at [contact.raulesteveza@gmail.com](mailto:contact.raulesteveza@gmail.com).

## Developer

**Raul Estevez** — [Personal Website](https://raulesteveza.github.io/) · [LinkedIn](https://www.linkedin.com/in/raulesteveza/)

## License

[MIT](./LICENSE)
