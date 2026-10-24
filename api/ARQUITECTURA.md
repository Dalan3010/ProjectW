# API Jak BID — arquitectura y estado real

La API es un servicio **FastAPI** con arquitectura en capas (presentación → aplicación → dominio → infraestructura) sobre **PostgreSQL + pgvector**, con migraciones Alembic y autenticación JWT.

Lo que realmente hace hoy son dos cosas: **autenticación de usuarios** y **CRUD de casos de negocio**, con aislamiento por dueño. Nada más. El esquema de base de datos, en cambio, describe un producto bastante más grande —versiones de idea, scoring de oportunidad, recomendaciones, corpus con embeddings, ejecuciones de n8n y feedback— del cual **seis de las ocho tablas no tienen ni un solo escritor en el código**. Esa distancia entre el modelo y la implementación es la conclusión más importante de este documento, y conviene decidirla antes de seguir agregando capas.

Todo lo marcado como **[verificado]** se comprobó contra la instancia corriendo, no solo por lectura de código.

---

## Mapa en 60 segundos

```
                    HTTP
                      │
        ┌─────────────▼──────────────┐
        │ presentation/api           │  routers FastAPI, Depends
        │  auth.py  cases.py  deps.py│  schemas/ (Pydantic v2)
        └─────────────┬──────────────┘
                      │ DTOs
        ┌─────────────▼──────────────┐
        │ application/use_cases      │  7 casos de uso, un archivo c/u
        │ application/dtos           │
        └─────────────┬──────────────┘
                      │ Protocol (interfaz)
        ┌─────────────▼──────────────┐
        │ domain/entities            │  dataclasses puras
        │ domain/repositories        │  Protocol: 6 definidos
        └─────────────┬──────────────┘
                      │ implementación
        ┌─────────────▼──────────────┐
        │ infrastructure             │  auth/security.py
        │  database/models.py        │  ORM SQLAlchemy 2.0
        │  database/repositories     │  2 implementados
        │  database/connection.py    │  async engine + session
        └─────────────┬──────────────┘
                      │
               PostgreSQL 15 + pgvector
```

| Capa | Responsabilidad | Archivos |
|---|---|---|
| `presentation/api` | Rutas, validación de entrada/salida, inyección de dependencias | `auth.py`, `cases.py`, `deps.py` |
| `presentation/schemas` | Contratos HTTP (Pydantic v2) | `auth_schemas.py`, `idea_case_schemas.py` |
| `application/dtos` | Datos de entrada a los casos de uso | `auth_dtos.py`, `idea_case_dtos.py` |
| `application/use_cases` | Orquestación: una operación de negocio por archivo | 7 archivos |
| `domain/entities` | Modelo de negocio, sin dependencias de framework | 8 dataclasses |
| `domain/repositories` | Contratos de persistencia (`Protocol`) | 6 protocolos |
| `infrastructure/database` | SQLAlchemy ORM, sesión async, implementaciones | `models.py`, `connection.py`, 2 repositorios |
| `infrastructure/auth` | bcrypt + JWT | `security.py` |

La dirección de dependencias se respeta: `presentation` y `application` dependen de `domain`, nunca al revés. Es la parte mejor ejecutada del proyecto.

---

## Cómo se ejecuta una request

Traza real de `GET /cases/{case_id}`:

1. `CORSMiddleware` (`app/main.py:13-19`) evalúa el origen.
2. FastAPI resuelve la ruta en `cases.py:53` y las dependencias en orden.
3. `Depends(get_db)` abre una `AsyncSession` (`connection.py:13-15`).
4. `Depends(get_current_user)` (`deps.py:19-42`): extrae el Bearer, decodifica el JWT, convierte `sub` a `UUID` y hace `SELECT users WHERE id = ...` para confirmar que existe y está activo.
5. `GetIdeaCaseUseCase.execute(case_id, current_user.id)` (`get_idea_case.py:12`) — carga el caso y compara `case.owner_id` con el usuario del token.
6. `SQLAlchemyIdeaCaseRepository.get_by_id` (`repositories/idea_case_repository.py:30`) ejecuta el `SELECT`.
7. `_to_entity` (`:15-28`) convierte la fila ORM a la dataclass de dominio y el `response_model` filtra lo que se expone.

**Sesión y transacción.** Hay una sola sesión por request (FastAPI cachea `get_db`), compartida entre la dependencia de auth y el caso de uso. Pero **el commit no vive en la capa de aplicación: cada método de repositorio confirma su propia transacción** (`idea_case_repository.py:56,71,102`; `user_repository.py:53,67`). No hay unidad de trabajo, y `get_db` no hace `rollback()` explícito.

**Arranque.** No hay `lifespan` ni eventos de startup/shutdown. El engine se crea al importar el módulo (`connection.py:5`) y nunca se dispone. Las migraciones corren en el `CMD` del Dockerfile (`Dockerfile:21-23`), no en la app.

---

## Contrato HTTP

Solo hay dos routers montados (`main.py:21-22`): `/auth` y `/cases`.

| Método | Ruta | Auth | Entrada | Éxito | Errores |
|---|---|---|---|---|---|
| POST | `/auth/register` | — | `name` 1–120, `email` 3–255, `password` 8–128 | **201** | 409 email tomado · 422 · 500 |
| POST | `/auth/login` | — | `email`, `password` | **200** | 401 credenciales · 422 · 500 |
| GET | `/auth/me` | Bearer | — | 200 | 401 |
| POST | `/cases/` | Bearer | `title` 3–100, `description` 10–1000, `category?`, `metadata?` | **200** ⚠️ | 401 · 422 · 500 |
| GET | `/cases/` | Bearer | `limit` 1–100, `offset` ≥ 0 | 200 | 401 · 422 · 307 sin barra final |
| GET | `/cases/{case_id}` | Bearer | — | 200 | 401 · 404 · 422 |
| PATCH | `/cases/{case_id}` | Bearer | `title?`, `description?`, `category?`, `status?`, `metadata?` | 200 | 401 · 404 · 422 · 500 |
| DELETE | `/cases/{case_id}` | Bearer | — | **204** | 401 · 404 · 422 · 500 |
| GET | `/` | — | — | 200 | — |
| GET | `/health` | — | — | 200 | — |

Notas de contrato:

- `POST /cases/` devuelve **200 y no 201** porque el endpoint no declara `status_code` (`cases.py:25`). **[verificado]**
- `/health` devuelve un literal fijo `{"status": "healthy"}` (`main.py:28-30`): no toca la base, así que responde igual con Postgres caído.
- El body de create/update usa **DTOs de la capa `application` directamente** (`cases.py:27,69`), no esquemas de presentación: el contrato público queda acoplado a una capa interna.
- `category` y `status` son `str` libres en el DTO pero están restringidos por `CHECK` en la base (`models.py:55-65`). Un valor inválido atraviesa la validación HTTP y explota en el `commit`. **[verificado: 500]**

---

## Autenticación

**Hash.** `passlib` con esquema `bcrypt` y 12 rondas por defecto (`security.py:14`). No se configura el costo ni se usa pepper.

**Token.** HS256 (`config.py:34`), expiración de 30 minutos (`config.py:35`), payload con solo dos claims:

```json
{ "sub": "<uuid del usuario>", "exp": 1750000000 }
```

Sin `iat`, `jti`, `iss`, `aud` ni rol. Se devuelve en el body, no en cookie.

**Validación** (`security.py:31-36`): PyJWT verifica firma y `exp` *si está presente*, pero no lo exige. Después `get_current_user` hace una consulta a `users` en cada request autenticado — el token no lleva el estado del usuario, lo cual es correcto.

**Lo que no existe:** rate limiting, bloqueo por intentos, verificación de email, recuperación de contraseña, refresh token, logout o revocación, autorización por rol. El campo `users.role` se persiste y se devuelve, pero **ningún endpoint lo consulta**.

---

## Modelo de datos

Ocho tablas, todas con PK `uuid` (`gen_random_uuid()`) y timestamps `timestamptz`. La columna que importa es la última:

| Tabla | Propósito | ¿Quién la escribe? |
|---|---|---|
| `users` | Cuentas, rol, estado | API (register) |
| `idea_cases` | Caso de negocio del emprendedor | API (CRUD) |
| `idea_versions` | Historial versionado del contenido del caso | **nadie** |
| `opportunity_assessments` | Scoring 1:1 del caso (frecuencia, severidad, urgencia…) | **nadie** |
| `recommendations` | Propuestas generadas, reporte, modelo de ingreso | **nadie** |
| `knowledge_sources` | Corpus de referencia + `embedding vector(1536)` | **nadie** |
| `workflow_runs` | Ejecuciones de n8n, estado, input/output/error | **nadie** |
| `feedbacks` | Feedback del usuario sobre una recomendación | **nadie** |

**[verificado]** Ninguna clase ORM de esas seis tablas se instancia fuera de `models.py`; no hay ruta, caso de uso ni repositorio concreto que las toque.

Restricciones que sí están implementadas y valen la pena conocer:

- `CHECK` en `users.role`, `idea_cases.category`, `idea_cases.status`, `opportunity_assessments.*` (6 columnas), `workflow_runs.status`, `feedbacks.rating`.
- `UNIQUE (case_id, version_number)` en `idea_versions`.
- Índice único **parcial** en `workflow_runs.n8n_execution_id WHERE NOT NULL`, para que un reintento de webhook no duplique filas.
- `ON DELETE SET NULL` solo en `recommendations.version_id`. Las otras seis FKs son `NO ACTION`.
- Índice HNSW `vector_cosine_ops` (m=16, ef_construction=64) sobre `knowledge_sources.embedding`.

Se eligió `CHECK` en lugar de `ENUM` nativo a propósito: las listas de valores van a cambiar y `ALTER TYPE` no permite quitar valores.

---

## Qué está cableado y qué no

| Componente | Estado |
|---|---|
| `UserRepository`, `IdeaCaseRepository` | Implementados y usados |
| `KnowledgeSourceRepository`, `RecommendationRepository`, `FeedbackRepository`, `WorkflowRunRepository` | **Solo `Protocol`, sin implementación ni caller** |
| 7 casos de uso | Todos con caller |
| `get_by_owner`, `list_all`, `UserRepository.update` | Implementados, **cero callers** |
| `IdeaCase.versions`, `.assessment`, `.latest_recommendation` | Declarados, **nunca poblados** por el mapper |
| Entidades `IdeaVersion`, `OpportunityAssessment`, `Recommendation`, `KnowledgeSource`, `WorkflowRun`, `Feedback` | Declaradas, sin repositorio ni endpoint |

`list_all` merece atención: devuelve los casos de **todos** los dueños y está expuesto en el contrato del repositorio (`domain/repositories/idea_case_repository.py:10`). Hoy no tiene caller, así que no hay fuga activa, pero es una mina esperando a que alguien la conecte.

---

## Revisión: hallazgos

Severidad: **C** corrupción o bypass de seguridad · **A** riesgo alto · **M** medio · **B** bajo.

### Críticos

| # | Hallazgo | Evidencia | Consecuencia |
|---|---|---|---|
| C1 | **`DELETE /cases/{id}` falla con 500 si el caso tiene hijos** | `models.py:86-89` sin `cascade`/`passive_deletes`; FK sin `ondelete` (`:100,142,163,219`); `idea_case_repository.py:101` | El UOW intenta `UPDATE ... SET case_id = NULL` y viola `NOT NULL`. **[verificado: 500]** |
| C2 | **`SECRET_KEY` arranca con el valor de ejemplo** | `config.py:33` = `your-super-secret-key-change-me`; mismo valor en `.env.example:5`; el compose no la sobreescribe | Quien conozca el default firma un JWT con el `sub` de cualquier usuario y accede a sus casos. El `owner_id` sale del token (`cases.py:32,44,60,74,87`): es IDOR total |

C2 depende del entorno: si el `.env` real define una clave, el riesgo desaparece. Pero **nada en el código falla al arrancar con el default**, y el archivo de ejemplo lo publica tal cual.

### Altos

| # | Hallazgo | Evidencia | Consecuencia |
|---|---|---|---|
| A1 | `category` y `status` no se validan en el DTO | `idea_case_dtos.py:9,17` vs `CHECK` en `models.py:55-65` | `IntegrityError` sin handler → **500** en lugar de 422. **[verificado]** |
| A2 | Sin frontera transaccional | commits en `idea_case_repository.py:56,71,102`; `user_repository.py:53,67` | Un caso de uso con dos escrituras no puede ser atómico; hoy ningún flujo lo puede ser |
| A3 | Falla después del commit deja el dato escrito | `create` confirma (`:56`) y luego hace `refresh` (`:57`); `update` igual (`:71-72`) | El cliente recibe 500 con la fila ya persisted; reintentar un POST duplica |
| A4 | Ownership solo en la capa de aplicación | `get_by_id`, `update`, `delete` filtran **solo** por `id` (`:30,61,98`) | Cualquier caller nuevo del repositorio accede a filas ajenas; no hay RLS ni query owner-scoped |
| A5 | Seis tablas sin escritores | **[verificado]** | ~70 % del esquema es infraestructura muerta: cuesta mantener, migrar y explicar |
| A6 | bcrypt trunca a 72 bytes en silencio | `security.py:14` sin `truncate_error`; DTO acepta 128 chars (`auth_schemas.py:9`) | Dos contraseñas distintas que compartan los primeros 72 bytes son intercambiables |
| A7 | `echo=True` en el engine | `connection.py:5` | Cada `INSERT users` escribe email y hash bcrypt en los logs |
| A8 | Índice de listado no cubre el `ORDER BY` real | índice `(owner_id, updated_at DESC)` vs `ORDER BY created_at DESC` (`idea_case_repository.py:84`) | Postgres filtra por índice pero ordena en memoria |
| A9 | La migración 003 no rellena NULLs antes de `SET NOT NULL` | `c9d4e6b1a8f2:166-199` | Solo es segura sobre base vacía; con datos aborta en la primera columna nula |

### Medios

| # | Hallazgo | Evidencia |
|---|---|---|
| M1 | Paginación sin tiebreaker: `ORDER BY created_at DESC` sin desempate repite u omite filas entre páginas | `idea_case_repository.py:84` |
| M2 | Imposible limpiar `category` por PATCH: `if dto.category is not None` no distingue ausente de `null` | `update_idea_case.py:28-29` |
| M3 | `metadata_json` no-dict rompe la respuesta: `or {}` no valida tipo y Pydantic falla → 500 | `idea_case_repository.py:27` |
| M4 | El 422 de Pydantic devuelve el `input`, incluida la `password` enviada | `main.py` sin `RequestValidationError` handler |
| M5 | CORS por defecto `*` con `allow_credentials=True` | `config.py:38`, `main.py:15-16` |
| M6 | Carrera de email duplicado: check-then-insert sin capturar `IntegrityError` → 500 en vez de 409 | `register_user.py:20-28` |
| M7 | `users.email` es case-sensitive: `A@x.com` y `a@x.com` son cuentas distintas | `models.py:44`, `user_repository.py:36` |
| M8 | Sin handler de excepciones: `IntegrityError`, `ValueError` y caídas de DB se proyectan como 500 genérico | `main.py` sin `add_exception_handler` |
| M9 | Sin `lifespan`, sin `engine.dispose()`, sin `pool_pre_ping` | `connection.py:5-11` |
| M10 | La entidad declara forward refs que no importa: `get_type_hints(IdeaCase)` falla con `NameError` | `idea_case.py:20-22` |

### Bajos

`/health` sin dependencias · `psycopg2-binary` y `python-multipart` instalados y sin uso (`requirements.txt`) · `docker-compose.yml` expone Postgres y n8n sin auth · `Dockerfile` corre como root con `--reload` · el downgrade de la 002 reintroduce el índice único duplicado que ella misma elimina · `offset` sin tope superior.

---

## Lo que está bien (y conviene no romper)

- **La inversión de dependencias se respeta de verdad.** Los casos de uso reciben `Protocol`, no `Session`. Cambiar el motor de persistencia no toca `application/` ni `domain/`.
- **Los 404 no distinguen "no existe" de "no es tuyo"** (`cases.py:61-62,75-76,88-89`): no hay enumeración de IDs ajenos en esos tres endpoints.
- **Toda FK tiene cobertura de índice**, por sí misma o como prefijo de un compuesto.
- **Ninguna entidad tiene el clásico default mutable compartido**: todo usa `field(default_factory=...)`.
- **El esquema y los modelos no tienen drift**: `alembic check` reporta "No new upgrade operations detected".
- **Decisiones de esquema bien fundamentadas**: `CHECK` en vez de `ENUM`, índice único parcial en `n8n_execution_id`, `timestamptz` en todo, `JSONB` en todo, `gen_random_uuid()` como default de servidor.

---

## La documentación previa quedó desactualizada

`api/modeloEntidad/ER_Model.md` describe el esquema de la migración 001, no el actual. Afirma que `recommendations.version_id` no tiene FK (sí la tiene, con `ON DELETE SET NULL`), documenta `embedding` como `Text` "placeholder" (es `vector(1536)` con índice HNSW), marca columnas como sin constraint que hoy son `NOT NULL`, dice `json` donde hay `jsonb`, y no menciona ninguno de los 11 `CHECK`, los índices ni el índice único parcial. Mientras no se actualice, es una fuente de error.

---

## Próximos pasos

Dos son **decisiones de producto**, no tareas de código, y conviene tomarlas antes de escribir nada:

1. **¿Las seis tablas sin escritores son roadmap real o se eliminan?** Si el flujo de recomendaciones con n8n y pgvector está en el plan, hoy solo falta implementarlo. Si el producto va a ser "auth + casos", mantener seis tablas y cuatro protocolos sin uso es deuda que se paga en cada migración.
2. **¿El listado ordena por `created_at` o por `updated_at`?** El índice dice una cosa y la query otra. Decidir cuál es el orden correcto y alinear el otro lado.

Y estas, en orden de impacto, son puramente técnicas:

3. Resolver C1: `ON DELETE CASCADE` en los hijos del caso con `passive_deletes=True`, o borrado lógico. Es la decisión de producto #1 aplicada a nivel de esquema.
4. Hacer que la app **falle al arrancar** si `SECRET_KEY` es el valor de ejemplo (C2).
5. Validar `category` y `status` con `Literal`/`Enum` en el DTO para que el 422 salga antes de la base (A1).
6. Un `exception_handler` que traduzca `IntegrityError` → 409/422 y `ValueError` → 404 (M8, M6).
7. Sacar el `commit` de los repositorios y llevarlo a una unidad de trabajo por request (A2, A3).
8. `echo=False` en el engine (A7).

---

### Cómo se verificó

Lectura completa de los 40 archivos Python de `api/` más las 4 migraciones, en dos pasadas independientes (capa de presentación y capa de dominio/infraestructura), y comprobación en runtime contra la instancia dockerizada de los hallazgos marcados **[verificado]**: `POST /cases/` → 200, `PATCH` con categoría inválida → 500, `DELETE` con fila hija en `idea_versions` → 500, `SECRET_KEY` de ejemplo presente en `config.py` y `.env.example`, y ausencia de constructores ORM para las seis tablas sin escritores.
