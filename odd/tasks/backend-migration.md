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
- [ ] T1 Add `js/api/client.js` — fetch client: base URL, JSON handling, Bearer token from storage, 401 → clear token + redirect `login.html`, timeout, `getApiError`. Route: inline (single mechanical file, port of `client.ts` already read).
- [ ] T2 Add `js/api/auth.js`, `js/api/cases.js`, `js/api/chat.js` — endpoint wrappers mirroring FronHack's API surface (`authApi`, `casesApi`, `chatApi`). Route: inline.
- [ ] T3 Rewire `js/auth.js` AuthService to real `/auth/*` endpoints; session stores `{ name, email, accessToken, loginAt }`. **Product decision pending** (see below) about demo mode.
- [ ] T4 Wire `js/pages/casos.js` to `casesApi.list()` instead of `chats.list()`.
- [ ] T5 Wire `js/pages/chat.js` to `chatApi.startCase/sendMessage/getMessages`, replacing the scripted assistant responses with backend replies.

## Pending product decision (blocks T3–T5)
ProjectW currently has local register/login (hashed in localStorage) and a "Entrar con cuenta demo" bypass. The real API has `/auth/register` and `/auth/login` but no demo endpoint. Decision needed: drop demo mode (pure backend auth) vs keep demo as a local-only bypass alongside real auth.

## Acceptance criteria
- `js/api/*` mirrors FronHack's endpoint contract (paths, payloads, response shapes from `src/types/index.ts`).
- `node --check` passes on every new/changed file.
- After rewiring: login/registro hit the backend; casos lists from `GET /cases`; chat sends via `POST /chat`.
- App still loads (no syntax/module errors) even with backend down; failures surface as UI errors, not crashes.

## Progress / evidence
- Branch: `backendCalled` (created from `main` at f6e81b4).
- T1..T5: pending.
