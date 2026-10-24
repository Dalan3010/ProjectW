# Contrato de API — ProjectW

Documento normativo. Es la **fuente de verdad** del contrato entre `frontend/` y
`api/`. Si el código y este documento discrepan, el código está mal.

- Última actualización: 2026-10-24
- Backend: FastAPI (`api/`), persistencia en PostgreSQL
- Estado de n8n: **no integrado**. El chat responde de forma automática detrás
  del contrato descrito aquí. Ver [Seam de n8n](#seam-de-n8n).

---

## 1. URL base

| Entorno | Valor |
|---|---|
| Desarrollo | `http://localhost:8000` |
| Frontend | variable `VITE_API_BASE_URL` |

El frontend **no** debe apuntar a n8n (`:5678`). Toda petición del navegador
pasa por FastAPI.

---

## 2. Convenciones

| Tema | Regla |
|---|---|
| Naming en el wire | `snake_case` |
| Fechas | ISO 8601 con zona, UTC (`2026-10-24T15:00:00+00:00`) |
| Identificadores | UUID v4 en string |
| Content-Type | `application/json` |
| Colecciones | Ruta con barra final: `/cases/`, `/cases/{id}/messages` |
| Paginación | `limit` (1–100, default 10) + `offset` (≥ 0, default 0) |
| Respuesta paginada | `{ data, total, limit, offset }` |

**Traducción a camelCase:** ocurre únicamente en los mapeadores de
`frontend/src/api/*`. Los componentes de React trabajan con camelCase y nunca
ven `snake_case`. Un tipo de TypeScript **no** debe declarar `accessToken`
para un campo que el servidor llama `access_token`: el mapeador hace la
traducción.

---

## 3. Autenticación

- Esquema: **JWT stateless**, `HS256`, campo `sub` = UUID del usuario.
- Expiración: `ACCESS_TOKEN_EXPIRE_MINUTES`, default **30 minutos**.
- Transporte: header `Authorization: Bearer <token>`.
- No hay refresh token, ni sesiones en servidor, ni revocación.

**No existe `POST /auth/logout`.** Con JWT stateless el logout es local: el
cliente borra el token de su almacenamiento. Llamar a un endpoint de logout es
un error de contrato.

### Códigos de autenticación

| Situación | Código | `detail` |
|---|---|---|
| Header ausente | 401 | `Not authenticated` |
| Token inválido o expirado | 401 | `Invalid or expired token` |
| Usuario inexistente | 401 | `Invalid or expired token` |
| Usuario inactivo | 401 | `Inactive user` |

Todas las respuestas 401 incluyen `WWW-Authenticate: Bearer`.

---

## 4. Formato de errores

FastAPI usa **`detail`**, no `message`.

```json
{ "detail": "Idea case not found" }
```

Errores de validación (422):

```json
{
  "detail": [
    {
      "type": "string_too_short",
      "loc": ["body", "password"],
      "msg": "String should have at least 8 characters",
      "input": "abc"
    }
  ]
}
```

Regla para el cliente: si `detail` es `string`, mostrarlo tal cual. Si es un
array (422), mostrar el `msg` del primer elemento.

| Código | Uso |
|---|---|
| 400 | Petición semánticamente inválida |
| 401 | Sin autenticar o token inválido |
| 404 | Recurso inexistente **o ajeno** (ver §7) |
| 409 | Conflicto de unicidad (email ya registrado) |
| 422 | Validación de esquema |
| 500 | Error no controlado |

---

## 5. Auth

### `POST /auth/register` → `201`

```json
{ "name": "Ada Lovelace", "email": "ada@example.com", "password": "minimo8chars" }
```

| Campo | Tipo | Reglas |
|---|---|---|
| `name` | string | 1–120 caracteres |
| `email` | string | 3–255 caracteres, único |
| `password` | string | 8–128 caracteres |

Respuesta (`TokenResponse`): ver §5.3.

### `POST /auth/login` → `200`

```json
{ "email": "ada@example.com", "password": "minimo8chars" }
```

Credenciales inválidas → `401` con `{"detail": "Invalid credentials"}`.

### `GET /auth/me` → `200`

Requiere Bearer. Devuelve un **`User`** suelto, **no** un `TokenResponse`.

```json
{
  "id": "0f8fad5b-d9cb-469f-a165-70867728950e",
  "full_name": "Ada Lovelace",
  "email": "ada@example.com",
  "role": "user",
  "is_active": true,
  "created_at": "2026-10-24T15:00:00+00:00"
}
```

### 5.3 `TokenResponse`

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "user": {
    "id": "0f8fad5b-d9cb-469f-a165-70867728950e",
    "full_name": "Ada Lovelace",
    "email": "ada@example.com",
    "role": "user",
    "is_active": true,
    "created_at": "2026-10-24T15:00:00+00:00"
  }
}
```

Nota: el nombre del usuario viene en **`full_name`**, no en `name`.

---

## 6. Cases

Todas las rutas requieren Bearer. `owner_id` sale **siempre del token**, nunca
del body.

### `IdeaCase`

```json
{
  "id": "8d2c1a44-1f0e-4c5b-9a3e-6b7c8d9e0f12",
  "owner_id": "0f8fad5b-d9cb-469f-a165-70867728950e",
  "title": "Reciclaje de residuos textiles",
  "description": "Descripción de al menos diez caracteres.",
  "category": "oportunidad",
  "status": "new",
  "created_at": "2026-10-24T15:00:00+00:00",
  "updated_at": "2026-10-24T15:00:00+00:00",
  "metadata": {}
}
```

Valores de `status`: `new`, `in_progress`, `validated`, `rejected`.

### `POST /cases/` → `201`

| Campo | Tipo | Reglas |
|---|---|---|
| `title` | string | 3–100 caracteres |
| `description` | string | 10–1000 caracteres |
| `category` | string \| null | libre |
| `metadata` | object \| null | libre |

### `GET /cases/?limit&offset` → `200`

```json
{
  "data": [ { "...": "IdeaCase" } ],
  "total": 42,
  "limit": 10,
  "offset": 0
}
```

Solo devuelve casos del usuario autenticado.

### `GET /cases/{case_id}` → `200`

### `PATCH /cases/{case_id}` → `200`

Todos los campos opcionales: `title`, `description`, `category`, `status`,
`metadata`.

### `DELETE /cases/{case_id}` → `204`

Sin cuerpo.

---

## 7. Reglas de ownership

Un recurso de otro usuario responde **`404 Not Found`**, no `403`. No se
filtra la existencia de recursos ajenos.

---

## 8. Chat

Persistido en Postgres. Requiere Bearer y ownership del caso.

### `ChatMessage`

```json
{
  "id": "c1a2b3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d",
  "case_id": "8d2c1a44-1f0e-4c5b-9a3e-6b7c8d9e0f12",
  "role": "assistant",
  "content": "Analicé tu idea y encontré tres riesgos...",
  "metadata": {
    "analysis": {
      "targetSegment": "PYMES textiles",
      "urgency": 4,
      "frequency": 3,
      "severity": 4,
      "willingnessToPay": 3,
      "mainRisks": ["Logística inversa"],
      "overallScore": 72
    },
    "ideas": [],
    "nextSteps": ["Validar con 10 talleres"],
    "confidence": 0.8
  },
  "created_at": "2026-10-24T15:00:00+00:00"
}
```

`role`: `user` | `assistant`. `metadata` puede ser `null` (siempre lo será en
mensajes de usuario).

`metadata` es **opaco**: su forma la define el `ChatResponder`, no la capa HTTP.
Claves actuales: `analysis`, `ideas`, `nextSteps` y `confidence`. `confidence`
es una **fracción 0..1**; el frontend la presenta en porcentaje.

Caso inexistente o ajeno → `404`.

### `GET /cases/{case_id}/messages?limit&offset` → `200`

```json
{ "data": [ { "...": "ChatMessage" } ], "total": 12, "limit": 50, "offset": 0 }
```

Orden: `created_at` ascendente (el más viejo primero).

### `POST /cases/{case_id}/messages` → `201`

```json
{ "content": "¿Cómo valido mi idea?" }
```

Reglas: `content` 1–4000 caracteres.

Respuesta: **ambos mensajes**, el del usuario y la respuesta del bot.

```json
{
  "user_message": { "...": "ChatMessage" },
  "assistant_message": { "...": "ChatMessage" }
}
```

---

## 9. Seam de n8n

El servidor genera la respuesta del asistente a través del puerto
`ChatResponder`. Hoy la implementación es automática (sin red). Cuando n8n
exista, se añade `N8nResponder` y se inyecta en composición.

**Nada del contrato cambia.** Mismo endpoint, mismo payload, mismo `metadata`.

---

## 10. Mapeo desde el wire

| Wire (`snake_case`) | Dominio frontend (`camelCase`) |
|---|---|
| `access_token` | `accessToken` |
| `user.full_name` | `name` |
| `updated_at` | `updatedAt` |
| `limit` / `offset` | `limit` / `offset` (sin traducción) |
| `detail` | `message` (mensaje de error de `ApiError`) |

---

## 11. Pendientes conocidos

| Tema | Estado |
|---|---|
| `/perfil` y `/historial` | Sin endpoint ni ruta; no forman parte del contrato |
| Refresh token | No existe. Cuando expire, el usuario vuelve a `/login` |
| Rate limiting | No existe |
