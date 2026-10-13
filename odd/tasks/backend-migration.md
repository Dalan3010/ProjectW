# ODD Feature: Migrate FronHack backend API layer to ProjectW

## Objective
Port the REST API client layer from FronHack (`src/api/client.ts`, `auth.ts`, `cases.ts`, `chat.ts`) into ProjectW as vanilla ES modules under `js/api/`, then rewire services and pages to call the real backend (n8n webhook at `http://localhost:5678/webhook`) instead of the localStorage mocks.

## Why
FronHack already integrates the real backend; ProjectW (the vanilla rewrite) still runs on local mocks. The user asked to migrate the backend integration into ProjectW with small commits on branch `backendCalled`.

## Scope
- In: `js/api/*` port (fetch-based), rewire `js/auth.js`, `js/pages/casos.js`, `js/pages/chat.js` to real endpoints.
- Out: changes to the n8n backend itself, UI redesign, modifications to FronHack.

## Constraints
- Buildless vanilla ES modules. No axios — use native `fetch` + `AbortController` (30s timeout, mirroring FronHack).
- Keep public interfaces stable where possible (`auth.login(email, password)`, `auth.register({name,email,password})`, `auth.logout()`, `auth.currentUser()`, `auth.isAuthenticated()`) so pages need minimal changes.
- Additive first: the API layer must land without breaking the current mock-backed app; rewiring comes in later commits.
- Small work-unit commits, Conventional Commit messages matching repo history (Spanish descriptions).
- Code comments in Spanish to match ProjectW's established style; identifiers in English.

## Delivery strategy
`ask-on-risk` (default). Forecast ≈ 300–380 authored lines → under the 400-line budget; single branch `backendCalled`, no chaining needed.

## Checks (no test runner in ProjectW — static site)
- Per file: `node --check <file>`.
- Live API smoke: pending while `localhost:5678` is down (recorded honestly per task).

## Route declaration
- Delegation attempted once (explore agent for mapping); runtime returned "OpenCode free tier can only be used from within OpenCode" — subagents unavailable in this session. All tasks run **direct inline** from here.

## Tasks
- [x] T1 Add `js/api/client.js` — fetch client: base URL, JSON handling, Bearer token from storage, 401 → clear token + redirect `login.html`, timeout, `getApiError`. Commit `57a6eee`.
- [x] T2 Add `js/api/auth.js`, `js/api/cases.js`, `js/api/chat.js` — endpoint wrappers mirroring FronHack's API surface. Commit `c1f6752`.
- [x] T3 Rewire `js/auth.js` AuthService to real `/auth/*` endpoints; session stores `{ name, email, accessToken, loginAt }`. Demo mode and local register removed (user decision: pure backend). Commits `78f25c3` (+ login.html/login.js).
- [x] T4 Wire `js/pages/casos.js` to `casesApi.list()` with loading/error states. Commit `bb308c9`.
- [x] T5 Wire `js/pages/chat.js` to `chatApi.startCase/sendMessage/getMessages`; rich cards render from `message.metadata` (analysis/ideas/nextSteps/confidence). Commit `a9b41ed`. Orphaned mock `js/chats.js` removed in `acc6f89`.

## Pending product decision — RESOLVED
User chose **pure backend**: demo mode and local registration removed (`78f25c3`).

## Acceptance criteria
- `js/api/*` mirrors FronHack's endpoint contract (paths, payloads, response shapes from `src/types/index.ts`).
- `node --check` passes on every new/changed file.
- After rewiring: login/registro hit the backend; casos lists from `GET /cases`; chat sends via `POST /chat`.
- App still loads (no syntax/module errors) even with backend down; failures surface as UI errors, not crashes.

## Progress / evidence
- Branch: `backendCalled` (created from `main` at f6e81b4).
- T1–T5: done. `node --check` passed on every new/changed file before each commit.
- Not verified live: backend (`localhost:5678/webhook`) was down during migration; login/cases/chat need a smoke test once n8n is up.
