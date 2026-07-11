# Frontend Refactor Implementation Plan

## Status

Implementation is in progress and the architecture migration is already substantially applied.

Current snapshot:

- `AppContext.tsx` was removed from the runtime architecture.
- App navigation is router-driven.
- Shared UI state is in `Zustand`.
- Server state is organized by domain with `React Query`.
- Mock mode flows through `MSW`.
- Domain migrations for `master-data`, `products`, `banking`, `accounting`, `inventory`, `agricultural`, and `financial` are already applied.
- `Dashboard.tsx` already consumes the new query/domain structure.
- `mockData.ts` and `src/app/data/types.ts` are no longer active runtime dependencies.
- `nextId` no longer exists in the UI layer and remains only inside MSW handlers.
- `npm run build` is passing after the refactor and bundle splitting adjustments.

This document remains useful both as:

- the original architecture blueprint
- the implementation reference for what still needs cleanup or follow-up

This file is the execution blueprint for replacing the current `AppContext`-centric frontend architecture with a production-ready structure based on:

- `react-router-dom` for navigation
- `@tanstack/react-query` for server state
- `zustand` for UI state only
- `MSW` for mock HTTP mode
- domain-based models with DTO-to-entity adaptation

The plan below is intended to be self-sufficient enough that a coding agent can execute it without having to reconstruct the prior planning discussion.

## Why This Refactor Exists

The current frontend is a functional prototype, but it has several structural problems that will become expensive now that the app will start calling real APIs.

Main issues in the current repository:

- `src/app/context/AppContext.tsx` is a monolithic global context holding nearly all domain data, UI navigation state, mock initialization, and write operations.
- Any change to any slice inside `AppContext` recreates the provider value and makes all `useApp()` consumers eligible to rerender.
- Navigation is hardcoded through `currentPage` and a `switch` in `src/app/App.tsx`.
- `src/app/components/Layout.tsx` duplicates navigation metadata and page title knowledge.
- Domain reads and joins are done directly in components with repeated `find`, `filter`, and `map` chains.
- Setters like `setProducts`, `setCostCenters`, and `setFinancialTransactions` are exposed to the UI, which spreads write rules across components.
- Mock data is imported directly into the React layer through `src/app/data/mockData.ts`.
- There is no router, no query cache layer, no API abstraction, no MSW contract, and no normalized entity model.
- The codebase shows multiple classic Figma AI symptoms:
  - giant shared context
  - duplicated CRUD patterns
  - state and rendering tightly coupled
  - UI components containing domain update logic
  - broad utility types gathered into one file
  - no separation between transport, domain, and view models

## Agreed Decisions

These decisions are already considered approved for implementation.

- New dependencies are allowed.
- `react-router-dom` will be added.
- `@tanstack/react-query` will be added.
- `zustand` will be added.
- `MSW` will be used for mock mode.
- The app must support both real API mode and mock mode through environment variables.
- The frontend must not consume backend DTOs directly in the UI.
- A DTO-to-entity adaptation layer will be created.
- `nextId` will disappear completely from the UI layer.
- `currentPage` will be removed from `AppContext`.
- The refactor can be broad and does not need to be incremental by module for delivery purposes.
- Entities should be normalized where it makes sense, especially for relational data.

## Non-Negotiable Implementation Rules

These rules are mandatory during implementation.

- Do not reintroduce a new global app context as a replacement for `AppContext`.
- Do not move server state into `Zustand`.
- Do not keep `currentPage` or any equivalent page-switch state as the source of truth after router migration.
- Do not let screen components own backend entity persistence logic through raw setters.
- Do not let React components import runtime mock data directly as application state.
- Do not make the UI consume backend DTOs directly.
- Do not keep `nextId` or any frontend-owned id generation in UI components.
- Do not duplicate route metadata across `App`, `Layout`, and screen modules.
- Do not spread relational joins like repeated `find/filter/map` chains across JSX when a selector can centralize the logic.
- Do not use `Zustand` as a cache mirror of `React Query`.

## Architecture Principles

### 1. Server state and client state must be separate

Use `React Query` for:

- fetching backend resources
- caching server responses
- invalidation
- optimistic updates when appropriate
- loading and error states

Use `Zustand` only for:

- drawer collapsed state
- page-level UI preferences
- cross-screen filter state when truly client-side
- modal/toast/shell UI state
- user session-like ephemeral UI state

Do not put backend entities in `Zustand` unless there is a very specific offline or client-only need.

### 2. Navigation is router-owned

The source of truth for the current screen must be the URL, not an in-memory page id.

### 3. The UI must consume adapted models

The backend will eventually expose DTOs. The UI will consume:

- DTOs at the API boundary
- entities internally
- selectors or view models inside screens

### 4. Mock mode must behave like API mode

The UI should not know if it is talking to mock data or the backend.

The same HTTP client and query hooks should work in both modes.

## Target Dependency Set

Required:

- `react-router-dom`
- `@tanstack/react-query`
- `zustand`
- `msw`

Recommended:

- `@tanstack/react-query-devtools`
- `react-hook-form`
- `zod`

Default assumption for this project:

- include `react-hook-form` and `zod` during the refactor
- keep tests light but create the minimum structure needed for mappers and selectors

## Environment Variables

The implementation should standardize the following env contract:

```env
VITE_DATA_SOURCE=mock
VITE_API_BASE_URL=/api
```

Rules:

- `VITE_DATA_SOURCE=mock` means the app still uses the normal HTTP/query path, but requests are intercepted by MSW.
- `VITE_DATA_SOURCE=api` means requests go to the backend and MSW stays disabled.
- `VITE_API_BASE_URL=/api` matches the Vite proxy that forwards requests to the local backend.

## Current Files That Will Be Replaced or Demoted

High-impact current files:

- `src/app/context/AppContext.tsx`
- `src/app/App.tsx`
- `src/app/components/Layout.tsx`
- `src/app/data/mockData.ts`
- `src/app/data/types.ts`

These files do not necessarily all disappear immediately, but they should no longer be central architectural pieces after the refactor.

## Target Folder Structure

```txt
src/
  app/
    providers/
      AppProviders.tsx
    router/
      index.tsx
      routes.tsx
      routeMeta.ts
    store/
      ui/
        useUiStore.ts
    config/
      env.ts
    query/
      queryClient.ts
  core/
    http/
      client.ts
    msw/
      browser.ts
      handlers/
        index.ts
      fixtures/
        accounting/
        agricultural/
        banking/
        financial/
        inventory/
        masterData/
        products/
    collections/
      types.ts
      normalize.ts
      selectors.ts
  domains/
    accounting/
      api/
        dtos.ts
        repository.ts
      model/
        entities.ts
        mappers.ts
      queries/
        keys.ts
        queries.ts
        mutations.ts
      selectors/
        selectors.ts
      ui/
        hooks.ts
    agricultural/
      ...
    banking/
      ...
    financial/
      ...
    inventory/
      ...
    master-data/
      ...
    products/
      ...
```

## Domain Boundaries

Use the following domain split.

### Products

- products
- product families
- base units
- units of measure

### Master Data

- counterparties
- counterparty types
- segments
- activity groups
- document types
- adjustment root causes

### Banking

- bank accounts

### Accounting

- chart of accounts
- cost centers
- income statement groups
- income statement relationships

### Financial

- financial transactions
- financial transaction items
- financial transaction attachments
- fulfillments
- bank transfers

### Inventory

- inventory batches
- inventory movements
- inventory adjustments

### Agricultural

- fields
- cuts
- machines
- field operations
- field operation machines
- field operation items
- production batches

## Data Modeling Strategy

### DTO Layer

Each domain must have DTO types representing transport contracts from the backend or mock API.

Examples:

- `ProductDto`
- `ChartOfAccountDto`
- `FinancialTransactionDto`

DTOs are not used directly by screen components.

### Entity Layer

Each domain must define entities optimized for internal use.

Examples:

- `Product`
- `ChartOfAccount`
- `FinancialTransaction`

### Collection Layer

Relational resources should be normalized.

Standard shape:

```ts
type EntityCollection<T> = {
  byId: Record<number, T>;
  allIds: number[];
};
```

Additional indexes should be introduced where needed, not everywhere blindly.

Examples:

- `childrenIdsByParentId` for chart of accounts and cost centers
- `itemsByTransactionId` for financial items
- `movementsByBatchId` for inventory movement lookup
- `operationsByFieldId` when a field operation view needs it often

### Selector Layer

Selectors should expose what the UI needs without forcing screens to reconstruct it repeatedly.

Examples:

- `selectProductsList`
- `selectProductOptions`
- `selectCounterpartyLabelById`
- `selectChartAccountTree`
- `selectCostCenterTree`
- `selectOpenTransactions`
- `selectInventoryBatchLabelById`

### View Models

Where screens require precomputed presentational data, use selector-driven view models.

Examples:

- table rows for transactions
- navigation title metadata
- dashboard KPI aggregates
- hierarchical account rows

## Routing Strategy

The old `PageId`-based routing must be removed.

### Current-state problem

- `App.tsx` drives rendering with a switch
- `Layout.tsx` holds navigation structure and page title mapping

### Target-state

- route objects define path, title, and module ownership
- `Layout` reads route metadata instead of maintaining a separate page id system

Suggested route scheme:

- `/dashboard`
- `/financeiro/transacoes`
- `/financeiro/itens`
- `/financeiro/anexos`
- `/financeiro/pagamentos`
- `/financeiro/transferencias`
- `/contabilidade/plano-de-contas`
- `/contabilidade/centros-de-custo`
- `/contabilidade/grupos-dre`
- `/contabilidade/relacionamentos-dre`
- `/agricola/campos`
- `/agricola/maquinas`
- `/agricola/cortes`
- `/agricola/operacoes`
- `/agricola/operacao-maquinas`
- `/agricola/operacao-itens`
- `/agricola/lotes-producao`
- `/produtos/lista`
- `/produtos/familias`
- `/produtos/unidades`
- `/estoque/lotes`
- `/estoque/movimentacoes`
- `/estoque/ajustes`
- `/bancos/contas`
- `/cadastros/contrapartes`
- `/cadastros/tipos-contraparte`
- `/cadastros/segmentos`
- `/cadastros/grupos-atividade`
- `/cadastros/tipos-documento`
- `/cadastros/causas-ajuste`

## MSW Strategy

MSW should emulate the backend contract, not a frontend-only data shape.

### Required behavior

- handlers grouped by domain
- mock data loaded from fixtures
- create/update/delete operations mutate in-memory fixture state during the session
- ids are generated inside handlers, never by the UI
- list endpoints and detail endpoints should exist when relevant

### Important rule

Do not keep the current pattern where mock data is imported directly into UI state.

## UI State Strategy With Zustand

Create a single UI store initially, with the option to split later if necessary.

Expected responsibilities:

- drawer collapsed state
- shared shell state
- route-local persisted filters if they are truly client-side
- possibly dialog preferences

Do not use Zustand for:

- product catalogs fetched from the backend
- bank accounts
- chart of accounts
- transactions
- inventory resources

## Query Strategy

Each domain should define:

- query keys
- fetch hooks
- mutation hooks
- invalidation rules

Example pattern:

- `useProductsQuery`
- `useCreateProductMutation`
- `useUpdateProductMutation`
- `useDeleteProductMutation`

Mutations should invalidate or update cache as needed.

## Form Strategy

Default implementation assumption:

- `react-hook-form`
- `zod`

Benefits:

- standard validation
- cleaner dialogs
- easier DTO/input mapping
- less ad hoc state in forms

This is especially useful because the repo currently contains many generated CRUD dialogs with local `useState` fields.

## Implementation Phases

## Phase 1 - Foundation

Goal:

- introduce the new app skeleton without migrating all domains yet

Tasks:

- add dependencies
- create `AppProviders.tsx`
- create query client
- create env config
- create HTTP client
- create router shell
- create Zustand UI store
- wire MSW bootstrap for mock mode

Primary files affected:

- `src/app/App.tsx`
- new `src/app/providers/AppProviders.tsx`
- new `src/app/router/*`
- new `src/app/query/queryClient.ts`
- new `src/app/store/ui/useUiStore.ts`
- new `src/app/config/env.ts`
- new `src/core/http/client.ts`
- new `src/core/msw/*`

Exit criteria:

- app boots through providers
- mock mode still works
- route-driven rendering works
- `currentPage` is no longer required in the app shell

## Phase 2 - Navigation Removal From AppContext

Goal:

- remove page navigation concerns from global state

Tasks:

- replace `PageId` consumption in `App.tsx`
- update `Layout.tsx` to use route metadata
- move titles and navigation tree into router metadata

Exit criteria:

- `currentPage` removed from `AppContext`
- `PageId` no longer drives rendering flow

## Phase 3 - Type System Split

Goal:

- break the current giant types file into domain modules

Tasks:

- split `src/app/data/types.ts`
- create DTO and entity files by domain
- create base collection types in `core/collections`

Exit criteria:

- no new code depends on `src/app/data/types.ts` as a central source

## Phase 4 - Mock Data Rework

Goal:

- move mock ownership out of React state

Tasks:

- transform `mockData.ts`/json usage into MSW fixtures
- create mock handlers by domain
- implement mock create/update/delete through handlers

Exit criteria:

- React components no longer initialize large local stores from JSON imports

## Phase 5 - Domain Migration

Recommended order:

1. `master-data`
2. `products`
3. `banking`
4. `accounting`
5. `inventory`
6. `agricultural`
7. `financial`

Reasoning:

- `master-data`, `products`, and `banking` are simpler and validate the pattern quickly
- `accounting` tests hierarchy and selectors
- `inventory` and `agricultural` validate relational normalization
- `financial` depends on many related resources and should be migrated after the ecosystem around it is ready

Each migrated domain must receive:

- DTOs
- entities
- mappers
- repository functions
- query hooks
- selectors
- updated screen components

Exit criteria per domain:

- no `useApp()` usage remains for that domain
- no direct setters remain in domain screens
- screens use query hooks and selectors only

## Phase 6 - Dashboard Migration

Goal:

- convert dashboard to aggregated selector/query consumption

Why last:

- dashboard depends on many domains
- migrating it too early creates unstable coupling during the refactor

Exit criteria:

- `Dashboard.tsx` consumes precomputed hooks/selectors
- no multi-domain raw joins remain in JSX

## Phase 7 - AppContext Removal

Goal:

- fully remove the old architecture

Tasks:

- remove `useApp()`
- remove `AppContext.tsx`
- remove dead exports and helpers
- remove `nextId`

Exit criteria:

- no screen depends on the old provider
- no entity list is globally held in context

## File-by-File Blueprint

### Files to create first

- `src/app/providers/AppProviders.tsx`
- `src/app/router/index.tsx`
- `src/app/router/routes.tsx`
- `src/app/router/routeMeta.ts`
- `src/app/store/ui/useUiStore.ts`
- `src/app/config/env.ts`
- `src/app/query/queryClient.ts`
- `src/core/http/client.ts`
- `src/core/msw/browser.ts`
- `src/core/msw/handlers/index.ts`
- `src/core/collections/types.ts`
- `src/core/collections/normalize.ts`
- `src/core/collections/selectors.ts`

### Files to refactor early

- `src/app/App.tsx`
- `src/app/components/Layout.tsx`

### Files to retire gradually

- `src/app/context/AppContext.tsx`
- `src/app/data/mockData.ts`
- `src/app/data/types.ts`

## Existing Component Refactor Rules

When migrating current tabs and dialogs:

- component must no longer receive or call raw setters from a global store
- component must use domain hooks for reads and mutations
- component must not perform relational lookup logic inline if a selector can provide it
- dialogs should move from ad hoc `useState` forms toward schema-backed form handling

Examples of current anti-patterns to eliminate:

- `products.find(...)` inside table rows
- setters like `setFinancialTransactions(ts => ...)`
- deriving labels repeatedly from related collections in render
- generating ids in components

## Query and Mutation Conventions

Use stable naming:

- `useProductsQuery`
- `useProductByIdQuery`
- `useCreateProductMutation`
- `useUpdateProductMutation`
- `useDeleteProductMutation`

And similarly for all domains.

Query keys should be colocated by domain and not improvised inline in components.

## API Adapter Strategy

Because backend DTOs are not all finalized yet, define repositories and mappers with explicit flexibility.

Pattern:

- repository returns DTOs
- mapper converts DTOs to entities
- selectors convert entities to UI-ready structures

This protects the UI from future backend shape changes while still aligning conceptually with the schema in:

- `backend/src/main/resources/db/migration/V1__initial_shema.sql`

## Assumptions For Backend Alignment

Until DTOs are fully defined:

- ids are numeric
- dates are ISO strings
- booleans remain booleans
- monetary values default to `number` in the frontend entity layer unless backend constraints later require string precision handling

If backend later exposes currency values as strings, only DTO and mapper layers should change.

## Risks

### Risk 1 - Rebuilding too much inside selectors

Mitigation:

- normalize only where relationships justify it
- use memoized transforms where necessary

### Risk 2 - Turning Zustand into a new global database

Mitigation:

- keep Zustand restricted to UI state
- do not mirror query data in Zustand

### Risk 3 - Overengineering mock mode

Mitigation:

- keep MSW in-memory for the first version
- no persistence between refreshes initially

### Risk 4 - Migrating dashboard too early

Mitigation:

- keep dashboard for the final migration phase

### Risk 5 - Partial DTO uncertainty

Mitigation:

- isolate DTO assumptions in `api/dtos.ts` and `model/mappers.ts`

## Definition Of Done

The refactor is done when all of the following are true:

- `AppContext.tsx` is removed
- `useApp()` is removed
- `currentPage` no longer exists
- `nextId` no longer exists
- `mockData.ts` is no longer a live runtime dependency for React state
- all screens use router navigation
- all server-backed resources use query hooks
- all mock behavior flows through MSW
- DTOs are adapted into internal entities
- domain selectors replace repeated inline relational joins
- UI state lives in Zustand only where appropriate

## Recommended Commit Sequence

1. `chore(frontend): add router, react-query, zustand and msw foundation`
2. `refactor(frontend): move app shell navigation to router`
3. `refactor(frontend): introduce env config and http client`
4. `refactor(frontend): add domain collection and mapper primitives`
5. `refactor(frontend): move mocks to msw handlers`
6. `refactor(frontend): migrate master-data domain`
7. `refactor(frontend): migrate products domain`
8. `refactor(frontend): migrate banking domain`
9. `refactor(frontend): migrate accounting domain`
10. `refactor(frontend): migrate inventory domain`
11. `refactor(frontend): migrate agricultural domain`
12. `refactor(frontend): migrate financial domain`
13. `refactor(frontend): migrate dashboard aggregations`
14. `refactor(frontend): remove legacy app context`

## Execution Notes For The Implementer

- Preserve user-visible behavior as much as possible during the refactor.
- Keep mock mode working at all times.
- Prefer introducing infrastructure first and removing legacy last.
- Do not move business logic into generic UI helpers.
- Do not allow components to mutate normalized entity structures directly.
- Keep route metadata centralized.
- Keep selectors close to their domain.
- Keep DTO assumptions explicit and easy to change.

## Immediate Next Step

Implementation should begin with Phase 1, creating the new application foundation without yet removing every old module in the same edit.

## Kickoff Prompt For Another Chat

If implementation is started in a new chat, use the following prompt as the handoff baseline:

```text
Use [frontend/docs/frontend-refactor-implementation-plan.md](frontend/docs/frontend-refactor-implementation-plan.md) as the primary source of truth.
Also use [backend/src/main/resources/db/migration/V1__initial_shema.sql](backend/src/main/resources/db/migration/V1__initial_shema.sql) as the domain reference.

Execute the refactor described in the implementation plan without replanning it from scratch.
Start from Phase 1 and preserve app behavior while migrating architecture.

Important implementation rules:
- Do not reintroduce a new global AppContext-style store
- Keep server state in React Query
- Keep UI-only shared state in Zustand
- Use react-router-dom as the navigation source of truth
- Use MSW for mock mode behind env flags
- Keep DTO -> entity -> selector separation
- Remove currentPage and nextId as part of the refactor

Before coding, briefly summarize the phase being executed and then implement it.
```

## Recommended Files To Include In A New Chat

To minimize context loss in a new conversation, explicitly reference:

- `frontend/docs/frontend-refactor-implementation-plan.md`
- `backend/src/main/resources/db/migration/V1__initial_shema.sql`
- `frontend/src/app/context/AppContext.tsx`
- optionally `frontend/src/app/App.tsx` and `frontend/src/app/components/Layout.tsx`
