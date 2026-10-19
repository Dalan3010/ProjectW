# ODD Feature: API y backend listos (Jak BID — parte 2)

## Objective
Dejar el backend FastAPI de `api/` **funcionando de punta a punta bajo su propio contrato**:
corregir el defecto actual de `POST /cases/`, materializar el esquema con Alembic, completar el
CRUD de casos, implementar auth JWT+bcrypt y endurecer el arranque (CORS, healthchecks,
migraciones en el boot), con verificación real.

Continúa `import-jak-backend.md` (parte 1, cerrada en `e411d52`).

## Why
El usuario pidió: *"quiero tener la API y el backend listos"*. Aclaración de alcance
(2026-10-18): **el frontend no es responsabilidad de esta feature**.

## Decisión de contrato (usuario, 2026-10-18)
**Contrato propio del backend**: se mantiene Clean Architecture con `snake_case`
(`owner_id`, `description`, `created_at`) y el shape de `IdeaCaseResponseSchema`.
NO se implementan las rutas/fields camelCase de FronHack (`/auth/login`, `userId`, `summary`…);
el frontend se adapta aparte.

## Decisión de alcance (usuario, 2026-10-18)
"Listo" = CRUD de casos + auth JWT + migraciones + CORS/healthchecks + smoke.
**Chat queda fuera** (este diseño no tiene entidad de mensajes).

## Scope
- In:
  - Bug `metadata` / `metadata_json` en entidad + repositorio + use-case (hoy `POST /cases/` = 500).
  - Revisión inicial de Alembic con las 8 tablas + ejecución en el arranque.
  - CRUD de casos: `GET /cases` (paginado), `GET /cases/{id}`, `PATCH /cases/{id}`, `DELETE /cases/{id}`.
  - Auth JWT: `POST /auth/register`, `POST /auth/login`, `GET /auth/me` con `pyjwt` + `passlib[bcrypt]`.
  - `CORSMiddleware`, healthchecks, `depends_on: condition: service_healthy`, migraciones en el boot,
    `Dockerfile` que copie `alembic/`.
  - Verificación: `compileall`, `docker compose config`, smoke live.
- Out:
  - Cualquier cambio en `js/`, `html/`, `css/` (frontend).
  - Chat / entidad de mensajes (diseño nuevo, decisión de producto pendiente).
  - Contrato camelCase de FronHack.
  - Cambios en HackatonMacondoLab.
  - Push / PR (decisiones del usuario).

## Constraints
- Capas `domain` / `application` / `infrastructure` / `presentation`; **sin `__init__.py`** (paquetes implícitos).
- `.env` nunca se commitea.
- Docs y comentarios en español neutro/profesional; identificadores en inglés.
- Rama: `feat/jak-backend` (continuación de la parte 1).

## Delivery strategy
`ask-on-risk` (default). Una sola rama; work-unit commits convencionales en español.

## Checks (sin test runner en ProjectW)
- `python3 -m compileall -q api/app` → **0** ✔
- `python3 -m compileall -q api/alembic` → **0** ✔
- `docker compose config -q` (cwd `api/`) → **0** (warning preexistente: `version` obsoleto) ✔
- Smoke live `/health` + registro + login + casos → **PENDIENTE** (daemon Docker caído).

## Tasks
- [x] T1 Documento de feature + estado de rama.
- [x] T2 Corregir `metadata`/`metadata_json` → commit `50787d2`.
- [x] T3 Revisión inicial de Alembic (8 tablas) + `alembic upgrade head` en el boot → commit `4750ca0`.
- [x] T5 Auth JWT (register/login/me + `get_current_user`) → commit `12885c1`.
- [x] T4 CRUD de casos paginado y protegido por JWT → commit `b615264`.
      (T5 antes que T4: los casos dependen de la dependency de auth.)
- [x] T6 CORS + healthchecks + `depends_on` healthy + Dockerfile con alembic + README → commit `1d96ec9`.
- [ ] T7 Verificación completa: falta el **smoke live** (bloqueado por entorno) y la
      **revisión independiente** del diff (la corrida del verificador se abortó por apagado del PC).
- [x] T8 Commits convencionales por work unit (español, sin atribución IA).

## Design decisions y riesgos registrados
- Casos protegidos con Bearer; `owner_id` sale del token (se eliminó del `CreateIdeaCaseDTO`).
- `GET /cases` → `{"data", "total", "limit", "offset"}` con query `limit`/`offset`.
- `DELETE /cases/{id}` → 204; recurso ajeno → 404 (no 403).
- `bcrypt==4.0.1` pineado: `passlib==1.7.4` rompe con bcrypt ≥ 4.1.
- Protocolo `IdeaCaseRepository` extendido con `list_by_owner` / `count_by_owner` (paginación con `total`).
- El `.gitignore` raíz ignora `alembic/versions/*.py` → la revisión base se agregó con `git add -f`.
  **Futuras revisiones de Alembic necesitan `-f`.** Convendría sacar esa regla (fuera de alcance acá).
- El frontend sigue hablando el contrato FronHack: recibirá 401/422 contra esta API hasta adaptarse.

## Progress / evidence
- 2026-10-18: alcance y contrato definidos con el usuario; documento creado.
- 2026-10-18: implementación T2–T6 completa. 5 commits locales en `feat/jak-backend`,
  `818ad11..HEAD` = 25 archivos, +793/−68. **Nada pusheado.**
- Verificación del orquestador: `compileall app/alembic` = 0, `compose config -q` = 0, `git status` limpio.
- RDD: **off** (default). `gentle-ai review assess --base-ref 818ad11 --committed-only`
  → `risk: high_risk`, `changed_lines: 861`, `review_due: true`.
  Tier alto → corresponde **verificador independiente** (no llegó a correr).
- Espejo Engram: **PENDIENTE** — `ProjectW` no figura en `available_projects` de Engram
  (solo `gitteamii`, `hackatonMacondoLab`) y el cwd es ambiguo. Registrar el proyecto
  para reactivar la memoria.

## Cómo retomar (próxima sesión)
1. `git log --oneline -8` y `git status` en `/home/kom/Proyectos/ProjectW` (rama `feat/jak-backend`).
2. Quedan 2 pasos:
   a. **Verificador independiente** sobre `818ad11..HEAD` (criterios: migración vs modelos,
      auth/BCRYP, ownership en cada ruta CRUD, wiring de boot, sin fugas del contrato FronHack).
   b. **Smoke live**: pedir al usuario que levante el Docker daemon y correr
      `docker compose up --build -d db api` + `curl localhost:8000/health` + registro/login/casos.
3. Cerrar T7 y decidir push con el usuario.
