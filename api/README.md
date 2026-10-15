# Jak BID API

Backend **Jak Business Idea Discovery API**: servicio web construido con **FastAPI** y arquitectura limpia (capas `application`, `domain`, `infrastructure`, `presentation` bajo `app/`), con persistencia en PostgreSQL + pgvector, migraciones con Alembic y orquestación n8n.

## Origen

Importada desde el repositorio hermano `HackatonMacondoLab` como **parte 1** de la migración a full-stack de este repositorio: la API convive aquí con el frontend (`js/`, `html/`, `css/`) sin modificarlo. La estructura y el comportamiento del backend se conservan tal cual el origen.

## Endpoints actuales

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/cases/` | Crea un caso de idea de negocio |
| `GET`  | `/` | Mensaje de bienvenida |
| `GET`  | `/health` | Estado del servicio |

## Cómo ejecutarla

1. `cp .env.example .env` (desde `api/`) y completar las variables si hace falta.
2. `docker compose up --build` (desde `api/`).
3. Verificar en `http://localhost:8000/health`.

Los servicios expuestos son: API en `:8000`, PostgreSQL en `:5432` y n8n en `:5678`.

## Pendiente (parte 2)

- Integración con el frontend (`js/api/` apuntando a `localhost:8000`).
- Endpoints faltantes: listado de casos, autenticación y chat.
- Smoke test punta a punta (login, casos, chat).
