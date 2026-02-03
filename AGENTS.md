# Repository Guidelines

## Project Structure & Module Organization

- `src/` holds application code following the mandated layering: Controllers ? Services ? Domain Engines ? Data Access ? Integrations.
- `tests/` contains unit/integration tests (e.g., `tests/healthEngine.test.ts`).
- `docker-compose.yml` and `Dockerfile` define local runtime + Postgres.
- `powerFeedMaster.md` is the canonical behavior and architecture spec.

## Build, Test, and Development Commands

- `npm run dev` runs the API in watch mode using `tsx`.
- `npm run build` compiles TypeScript to `dist/`.
- `npm start` runs the compiled server.
- `npm test` runs Vitest in CI mode.
- `npm run lint` runs ESLint across the repo.
- `npm run format` formats code with Prettier.
- `docker compose up --build` starts Postgres and the API together.

## Coding Style & Naming Conventions

- Indentation: 2 spaces, LF endings.
- TypeScript only in `src/` and `tests/`.
- Filenames: folders in `kebab-case`; types/classes `PascalCase`; functions/variables `camelCase`.
- Keep behavior deterministic and defined solely by contract JSON; no hidden defaults (see `powerFeedMaster.md`).

## Testing Guidelines

- Framework: Vitest.
- Naming: `*.test.ts`.
- Cover deterministic execution paths, activation gates, and structured logging expectations.

## Commit & Pull Request Guidelines

- Use Conventional Commits (e.g., `feat: add activation validation gate`).
- PRs must include:
  - Summary of behavior changes.
  - References to relevant sections in `powerFeedMaster.md`.
  - Notes on determinism, logging, and append-only guarantees.

## Security & Configuration Tips

- Secrets are supplied via environment variables (`.env`), never committed.
- `DATABASE_URL` is required for data access.
- Append-only tables must never be updated in place.
