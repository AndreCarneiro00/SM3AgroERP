# Repository Guidelines

## Project Structure & Module Organization
`backend/` contains the Spring Boot API (Java 21). Code lives in `backend/src/main/java/com/sm3Agro/SM3AgroERP`, grouped by domains like `inventory`, `financial`, `production`, `bank`, and `accounting`, then split into `controller`, `dto`, `entity`, `repository`, and `service`. Config and Flyway SQL live in `backend/src/main/resources/application*.yaml` and `backend/src/main/resources/db/migration/`. Tests mirror `backend/src/test/java`.

`frontend/` contains the Vite + React + TypeScript client. The app shell is in `frontend/src/app`, shared infrastructure in `frontend/src/core`, and domain slices in `frontend/src/domains/*` with folders such as `api`, `model`, `queries`, `selectors`, and `ui`. Treat `target/`, `frontend/dist/`, `frontend/node_modules/`, `uploads/`, and `*.db*` as generated or local-only artifacts.

For database work, start with `backend/docs/database/schema-reference.md`. It maps the initial Flyway schema to backend domains, enum constraints, relationships, seed data, and service-level invariants that are not enforced by SQL.

## Build, Test, and Development Commands
- `cd backend; .\mvnw spring-boot:run` starts the API locally.
- `cd backend; .\mvnw test` runs unit tests matched by Surefire (`*Test`, `*Tests`, `*TestCase`).
- `cd backend; .\mvnw verify` runs Maven verification, including `*IT` integration tests.
- `cd frontend; npm run dev` starts the Vite development server.
- `cd frontend; npm run build` runs `tsc` and produces a production bundle in `frontend/dist`.
- `cd frontend; npm run preview` serves the built frontend locally.

## Coding Style & Naming Conventions
Match the surrounding code instead of inventing new style rules. Use 4 spaces in Java and 2 spaces in TypeScript/TSX. Keep Java names layer-specific, such as `ProductController`, `BankBalanceService`, and `CreateFinancialTransactionRequest`. In the frontend, use PascalCase for components, camelCase for functions and hooks, and keep code inside the existing domain-first folders. No ESLint, Prettier, or Checkstyle config is committed, so keep diffs small and consistent with nearby files. Never declare variables using var keyword, always prefer explicit type.

## Testing Guidelines
Backend tests use JUnit 5, Spring Boot Test, Mockito, and H2. Place unit tests beside the mirrored package path and reserve `*IT.java` for integration coverage. For endpoint, schema, or business-rule changes, add or update backend tests in the same change. The frontend currently has no test script checked in; if you add UI tests, also add the runnable command to `frontend/package.json`.

## Commit & Pull Request Guidelines
Recent history follows Conventional Commit style with scopes, for example `feat(backend): ...`, `refactor(backend): ...`, and `feat(backend & frontend): ...`. Keep commits focused by domain or layer. PRs should summarize the affected module, list validation performed, call out migration or config changes, and include screenshots for frontend changes.

## Security & Configuration Tips
Do not commit `.env` files, SQLite database files, or uploaded artifacts. When changing persistence, add a Flyway migration and keep frontend DTOs and queries aligned with the backend contract.
