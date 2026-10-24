# Jak BID API

Backend **Jak Business Idea Discovery API**: servicio web construido con **FastAPI** y arquitectura limpia (capas `application`, `domain`, `infrastructure`, `presentation` bajo `app/`), con persistencia en PostgreSQL + pgvector, migraciones con Alembic y orquestación n8n.

## Origen

Importada desde el repositorio hermano `HackatonMacondoLab` como **parte 1** de la migración a full-stack de este repositorio: la API convive aquí con el frontend (`js/`, `html/`, `css/`) sin modificarlo. En la **parte 2** se corrigió el defecto de `POST /cases/`, se materializó el esquema con Alembic, se completó el CRUD de casos, se implementó autenticación JWT+bcrypt y se endureció el arranque (CORS, healthchecks, migraciones en el boot).

## Endpoints

| Método | Ruta | Autenticación | Descripción |
|--------|------|---------------|-------------|
| `POST` | `/auth/register` | — | Registra un usuario; devuelve token y usuario (201) |
| `POST` | `/auth/login` | — | Autentica; devuelve token y usuario (200) |
| `GET`  | `/auth/me` | Bearer | Usuario actual (401 sin token válido) |
| `POST` | `/cases/` | Bearer | Crea un caso (el propietario sale del token) |
| `GET`  | `/cases` | Bearer | Lista los casos del usuario; query params `limit` (default 10) y `offset` (default 0); respuesta `{data, total, limit, offset}` |
| `GET`  | `/cases/{id}` | Bearer | Caso propio; 404 si no existe o no es del usuario |
| `PATCH` | `/cases/{id}` | Bearer | Actualización parcial; 404 si no existe o no es del usuario |
| `DELETE` | `/cases/{id}` | Bearer | Elimina el caso; 204; 404 si no existe o no es del usuario |
| `GET`  | `/` | — | Mensaje de bienvenida |
| `GET`  | `/health` | — | Estado del servicio |

## Autenticación

El login/registro devuelven un JWT firmado (`sub` = id del usuario, `exp` = ACCESS_TOKEN_EXPIRE_MINUTES). Enviar el token en cada petición protegida:

```bash
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "correo@ejemplo.com", "password": "secreto123"}'

curl http://localhost:8000/cases \
  -H "Authorization: Bearer <access_token>"
```

El contrato usa `snake_case` propio del backend. El frontend (`js/`) aún habla el contrato camelCase de FronHack y se adaptará aparte.

## Configuración (`.env`)

Además de `DATABASE_URL`, `SECRET_KEY`, `ALGORITHM`, `ACCESS_TOKEN_EXPIRE_MINUTES` y `N8N_WEBHOOK_URL`, la variable `CORS_ORIGINS` admite una lista separada por coma (default `*`):

```env
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

## Cómo ejecutarla

1. `cp api/.env.example api/.env` (desde la raíz) y completar las variables si hace falta.
2. `docker compose up --build` (desde la raíz del repo, donde vive el `docker-compose.yml`).
3. Verificar en `http://localhost:8000/health`.

> El `docker-compose.yml` de la raíz es el único punto de entrada (fija `name: projectw`, así que los volúmenes se llaman `projectw_postgres_data` y `projectw_n8n_data`). El compose que vivía dentro de `api/` se eliminó para no levantar una segunda base vacía con otro proyecto y otro volumen.
>
> Si venías de ese compose viejo y querés conservar los datos, migrá el volumen una sola vez antes de levantar:
>
> ```bash
> docker volume create projectw_postgres_data
> docker run --rm -v api_postgres_data:/from -v projectw_postgres_data:/to alpine \
>   sh -c 'cp -av /from/. /to/'
> ```
>
> Si la base era descartable, ignorá este paso: `alembic upgrade head` reconstruye el esquema en el volumen nuevo.

Al arrancar, el servicio `api` ejecuta `alembic upgrade head` (migraciones en el boot) y solo levanta uvicorn si la migración tuvo éxito. El `db` expone un healthcheck (`pg_isready`) y `api` espera a que esté sano (`depends_on: condition: service_healthy`). El comando del `Dockerfile` aplica igual con `docker run` siempre que el contenedor apunte a una base accesible.

Los servicios expuestos son: API en `:8000`, PostgreSQL en `:5432` y n8n en `:5678`.

## Pendiente

- Integración del frontend (`js/api/`) con este contrato (snake_case, Bearer token, paginación propia).
- Smoke test punta a punta automatizado (hoy verificado a mano con Docker levantado: registro, login, alta de caso, listado, detalle y borrado).
- Chat / mensajes: decisión de producto pendiente (fuera de alcance de la parte 2).
