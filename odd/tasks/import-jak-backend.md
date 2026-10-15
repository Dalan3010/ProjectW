# ODD Feature: Importar la API de HackatonMacondoLab dentro de ProjectW

## Objective
Traer el backend **Jak BID API** (FastAPI + Clean Architecture de `/home/kom/Proyectos/HackatonMacondoLab`)
a ProjectW como carpeta `api/`, para que el repo quede full-stack en un solo repositorio.
Esta es la **parte 1** de una migración en dos partes acordada con el usuario.

## Why
La migración previa (`backend-migration.md`) portó la capa API de **FronHack** (contrato n8n webhook),
pero el usuario aclaró que la migración correcta era desde **HackatonMacondoLab**.
Decisión del usuario (2026-10-14): *"Traer el backend al repo"* — no borrar el trabajo existente.

## Scope
- In (parte 1): copiar el backend a `api/` (`app/`, `alembic/`, `alembic.ini`, `Dockerfile`,
  `docker-compose.yml`, `requirements.txt`, `.env.example`, `Ejecución.md`, `modeloEntidad/`),
  unificar `.gitignore`, ajustar rutas/build context, validar sintaxis y compose config.
- Out (parte 1): endpoints nuevos (`GET /cases`, auth, chat), cualquier cambio en `js/`, `html/`,
  `css/`, modificación del frontend, push.
- Out (parte 2, mañana): conectar `js/api/client.js` a `localhost:8000`, completar endpoints,
  smoke test login/casos/chat punta a punta.

## Constraints
- NO borrar ni reescribir el frontend ni `js/api/` (migración FronHack conservada).
- El backend se copia fiel: mismo `app.*` importable desde `api/` (cwd = `api/`).
- `.env` nunca se commitea (gitignored); `.env.example` sí.
- ProjectW conserva su estilo: docs en español neutro/profesional.
- Rama: `feat/jak-backend` creada desde `backendCalled` (que ya tiene el merge de main).

## Delivery strategy
`ask-on-risk` por defecto. Forecast ≈ copy + ~100 líneas authored → bajo las 400; una sola rama.

## Checks (sin test runner en el frontend; backend Python)
- `python3 -m compileall -q app` desde `api/`.
- `docker compose config -q` desde `api/`.
- Smoke opcional acotado: `docker compose build api && up -d db api` + `curl localhost:8000/health`.
  Si tarda/pide pull grande → se registra honestamente como pendiente para la parte 2.

## Tasks
- [ ] T1 Crear rama `feat/jak-backend` y este documento.
- [ ] T2 Copiar backend fuente a `api/` (excluir `.git/`, `.atl/`, `node_modules`, `__pycache__`).
- [ ] T3 Unificar `.gitignore` de ProjectW con las reglas Python del backend.
- [ ] T4 Ajustar `Dockerfile` / `docker-compose.yml` si alguna ruta asume la raíz del repo.
- [ ] T5 Checks: `compileall` + `docker compose config`.
- [ ] T6 (opcional acotado) build + `/health` live.
- [ ] T7 Commits convencionales por work unit + espejo en Engram.

## Route declaration
- Delegación: 1 writer para T2–T4 (copia multiarchivo), verificación según RDD (off → assess por tier).

## Progress / evidence
- 2026-10-14: merge de `origin/main` (990a3aa selección múltiple) resuelto en `backendCalled` → `c184914`.
- Backend origen: HackatonMacondoLab @ `1d7de84` (solo `POST /cases/`, `GET /`, `GET /health`).
