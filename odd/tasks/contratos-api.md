# Contratos API-first + persistencia de chat

## Objetivo

Dejar un contrato único y explícito entre `frontend/` y `api/`, con el chat
persistido en Postgres desde ya. n8n entra al final como un adaptador más,
sin renegociar contratos.

## Problema

Hoy hay dos contratos incompatibles vivos al mismo tiempo:

- `frontend/` habla el contrato heredado de n8n: camelCase, `page/pageSize`,
  `message` para errores, y llama endpoints que no existen en `api/`
  (`/chat`, `/chat/start`, `/cases/{id}/messages`, `/auth/logout`).
- `api/` expone el contrato correcto: snake_case, `limit/offset`, `detail`
  para errores, y solo cubre auth + cases.

Resultado: el frontend apunta a `:5678` (n8n) por defecto, no a `:8000`, y
ninguna feature pasa por la API.

## Por qué

- n8n todavía no está organizado. Si el contrato sigue abierto, cada cambio
  posterior de n8n vuelve a romper el frontend.
- La persistencia de conversaciones es responsabilidad de Postgres vía FastAPI,
  no de n8n. n8n solo genera el texto del bot.
- Con un contrato fijo, cuando n8n entre solo se sustituye el adaptador
  `ChatResponder`. Ni el contrato ni el frontend cambian.

## Alcance

1. Documento de contrato único: `docs/CONTRATO_API.md`.
2. Persistencia de chat en la API: entidad, migración, repositorio, caso de uso,
   endpoints `GET`/`POST /cases/{case_id}/messages`.
3. Seam `ChatResponder` con implementación automática (sin n8n todavía).
4. Frontend alineado al contrato de `api/`: tipos, clientes, auth, paginación,
   errores y URL base.
5. Reparación de regresiones introducidas por los últimos commits de `main`.

## Fuera de alcance

- Integración real con n8n (`n8n_responder.py`). Se deja el puerto definido.
- Streaming de respuestas, RAG, embeddings para chat.
- Endpoints de perfil e historial. `/perfil` y `/historial` quedan fuera del
  router hasta que existan.

## Restricciones

- La migración nueva se encadena sobre `d7e2f9a4c1b3` (head actual).
- No se cambia el contrato de `api/` para imitar el legado de n8n.
- El wire usa `snake_case`. La traducción a camelCase ocurre solo en los
  mapeadores de `frontend/src/api/*`, para no ensuciar los componentes.

## Decisiones

- **D1** — La API es la fuente de verdad del contrato.
- **D2** — Persistencia del chat en Postgres, en la tabla `chat_messages`.
- **D3** — `ChatResponder` es un puerto; hoy responde automático, mañana n8n.
- **D4** — `POST /auth/logout` no existe ni existirá: el JWT es stateless, el
  logout es borrar el token en el cliente.
- **D5** — `metadata` del mensaje del asistente guarda `analysis`, `ideas`,
  `nextSteps` y `confidence`. n8n lo llenará después.

## Contrato objetivo de chat

```
GET  /cases/{case_id}/messages?limit&offset
  -> 200 { data: ChatMessage[], total, limit, offset }

POST /cases/{case_id}/messages
  body: { content: string }
  -> 201 { user_message: ChatMessage, assistant_message: ChatMessage }
```

```
ChatMessage {
  id: UUID
  case_id: UUID
  role: 'user' | 'assistant'
  content: string
  metadata: object | null
  created_at: datetime
}
```

Ambos endpoints exigen Bearer y verifican ownership del caso (404 si ajeno).

## Checklist

- [x] T1 — Crear `docs/CONTRATO_API.md` con auth, cases, chat, errores,
      paginación, naming y reglas de auth.
- [x] T2 — Reparar typecheck roto por `UserMenu.tsx` (iconos `history`,
      `delete`, `exit_to_app`, `warning` no existen en `IconName`).
- [x] T3 — Backend chat: entidad `ChatMessage` + `ChatRepository` (Protocol).
- [x] T4 — Backend chat: modelo ORM `chat_messages` + migración encadenada
      sobre `d7e2f9a4c1b3`.
- [x] T5 — Backend chat: puerto `ChatResponder` + `CannedResponder`.
- [x] T6 — Backend chat: implementación `ChatRepository` + caso de uso.
- [x] T7 — Backend chat: schemas + router `GET`/`POST /cases/{id}/messages`
      con ownership.
- [ ] T8 — Frontend: `types/api.ts` alineado al wire snake_case.
- [ ] T9 — Frontend: `client.ts` (base URL `:8000`, leer `detail`).
- [ ] T10 — Frontend: `auth.ts` (mapear `access_token`/`full_name`, quitar
      llamada a logout, quitar bypass demo).
- [ ] T11 — Frontend: `cases.ts` (`limit`/`offset`) y `chat.ts`
      (`/cases/{id}/messages`).
- [ ] T12 — Frontend: eliminar `setTimeout` artificiales en `LoginPage` y
      `UserMenu`.
- [ ] T13 — Frontend: resolver links muertos `/perfil` y `/historial`.
- [ ] T14 — Actualizar los tests afectados por el contrato y verificar en verde.

## Criterios de aceptación

- `npm run typecheck` en verde.
- `npm run lint` en verde.
- `npm test` en verde (16+ tests).
- `alembic heads` devuelve una sola head.
- El chat persiste y se puede consultar contra Postgres real.
- Ningún endpoint del frontend apunta a `:5678`.
- `grep -r "/chat\b" frontend/src` no devuelve rutas fuera de `/cases/*/messages`.

## Checks aplicables

- Frontend: `npm run typecheck`, `npm run lint`, `npm test`.
- Backend: `python -m compileall api/app`, verificación de cadena Alembic,
  y smoke con Docker si el daemon está disponible.

## TDD

Modo resuelto: **off** (no hay configuración de TDD en el proyecto ni en
`opencode.json`). Runner de frontend: `npm test` (vitest). El backend no tiene
pytest ni suite de tests. Se ejecutan checks funcionales, no TDD estricto.

## Estrategia de entrega

Forecast inicial: ~1.100 líneas autoradas, muy por encima del presupuesto de
~400. Estrategia: `ask-on-risk` con slices por unidad de trabajo:

1. Contrato + regresiones de `main` (T1, T2).
2. Backend chat (T3–T7).
3. Frontend alineado + tests (T8–T14).

Cada slice es un commit revisable independiente.

## Progreso

- Rama base: `feat/react-migration-v2` tras mergear `origin/main` (`7e8d761`).
- Cadena Alembic verificada: `a7c3e91f5d2b → b3f1a2c7d9e4 → c9d4e6b1a8f2 → d7e2f9a4c1b3`.
- Baseline previo a cambios: typecheck **falla** (7 errores en `UserMenu.tsx`),
  tests 14/16.
- Slice 1 (T1, T2): completada.
- Slice 2 (T3–T7): completada. Backend de chat implementado y compilado.

## Evidencia

- `docs/CONTRATO_API.md` creado: auth, cases, chat, errores, paginación,
  ownership, mapeo wire→dominio y seam de n8n.
- Regresión de `main` reparada: faltaban `history`, `expand_more`, `person`,
  `warning` en `IconName`; `delete` → `trash` y `exit_to_app` → `logout`
  (ya existían).
- `npx tsc -b --force` → exit 0.
- `npm run lint` → exit 0 (1 warning preexistente en `UserMenu.tsx:43`).
- Backend: `python3 -m compileall -q api/app api/alembic/versions` → exit 0.
- Cadena Alembic: `a7c3e91f5d2b → b3f1a2c7d9e4 → c9d4e6b1a8f2 → d7e2f9a4c1b3 → e1a5c3f7b9d2`,
  una sola head, lineal.
- `CannedResponder` verificado determinista entre procesos (sha256, no `hash()`)
  y con la forma exacta de `metadata` que espera el frontend.
- Limitación: FastAPI y Alembic no están instalados en el entorno; no hubo
  import en runtime ni `alembic upgrade head`. Requiere Docker para el smoke real.

## Siguiente paso

Slice 3: frontend alineado al contrato (T8–T14).
