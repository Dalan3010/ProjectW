"""Tipos, defaults y validaciones

Revision ID: c9d4e6b1a8f2
Revises: b3f1a2c7d9e4
Create Date: 2026-10-24

Tercera migración, escrita a mano.

Objetivo: que la base garantice lo que hoy solo garantiza Python.

1. PKs con `gen_random_uuid()` en la base. Hasta ahora el UUID lo generaba
   siempre SQLAlchemy; cualquier INSERT por SQL crudo (seeds, tests, n8n)
   fallaba con "null value in column id". `gen_random_uuid()` es nativo desde
   Postgres 13, no hace falta pgcrypto.
2. `JSON` -> `JSONB`. `JSON` guarda texto y se re-parsea en cada lectura.
   `JSONB` es binario y consultable con `->>`, `@>` y GIN.
3. Timestamps -> `timestamptz`. Todo se escribía como datetime naive de
   `datetime.utcnow()`; el día que algo escriba con zona horaria (n8n manda
   ISO-8601 con `Z`) las comparaciones mienten. La conversión asume UTC, que
   es lo que venía escribiendo `utcnow()`.
4. NOT NULL + `server_default` en las columnas que el dominio siempre provee.
   Un `default` de Python no protege de un INSERT que no pasa por el ORM.
5. CHECK constraints para los valores que hasta ahora vivían solo en
   comentarios de código.

Se usan CHECK y no tipos ENUM nativos a propósito: la lista de categorías y
estados va a cambiar, y `ALTER TYPE` no permite quitar valores. Un CHECK se
altera con un DROP/ADD sin reescribir la tabla.

No se agregan índices GIN sobre las columnas JSONB: ningún endpoint filtra por
ellas todavía, y un GIN que nadie usa es costo de escritura puro. Cuando exista
esa consulta, va su índice.
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = 'c9d4e6b1a8f2'
down_revision: Union[str, None] = 'b3f1a2c7d9e4'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


# (tabla, columna) de todos los PK UUID.
_PK_COLUMNS = [
    ('users', 'id'),
    ('idea_cases', 'id'),
    ('idea_versions', 'id'),
    ('opportunity_assessments', 'id'),
    ('recommendations', 'id'),
    ('knowledge_sources', 'id'),
    ('workflow_runs', 'id'),
    ('feedbacks', 'id'),
]

# Timestamps que pasan a timestamptz. Los NOT NULL reciben `now()`.
_TIMESTAMPS_REQUIRED = [
    ('users', 'created_at'),
    ('idea_cases', 'created_at'),
    ('idea_cases', 'updated_at'),
    ('idea_versions', 'created_at'),
    ('opportunity_assessments', 'created_at'),
    ('recommendations', 'created_at'),
    ('knowledge_sources', 'created_at'),
    ('workflow_runs', 'start_time'),
    ('feedbacks', 'created_at'),
]

# Timestamps nullable: solo cambia el tipo, no la nullability.
_TIMESTAMPS_OPTIONAL = [
    ('workflow_runs', 'end_time'),
]

# Columnas JSON que pasan a JSONB.
_JSON_COLUMNS = [
    ('idea_cases', 'metadata_json'),
    ('idea_versions', 'content'),
    ('opportunity_assessments', 'main_risks'),
    ('recommendations', 'approaches'),
    ('recommendations', 'ideas'),
    ('knowledge_sources', 'metadata_json'),
    ('workflow_runs', 'input_data'),
    ('workflow_runs', 'output_data'),
]

# (tabla, columna, server_default, tipo existente)
_NOT_NULL_DEFAULTS = [
    ('users', 'full_name', sa.text("''"), sa.String()),
    ('users', 'is_active', sa.text('true'), sa.Boolean()),
    ('users', 'role', sa.text("'entrepreneur'"), sa.String()),
    ('idea_cases', 'description', sa.text("''"), sa.Text()),
    ('idea_cases', 'status', sa.text("'new'"), sa.String()),
    ('idea_cases', 'metadata_json', sa.text("'{}'::jsonb"), postgresql.JSONB()),
    ('idea_versions', 'version_number', sa.text('1'), sa.Integer()),
    ('idea_versions', 'content', sa.text("'{}'::jsonb"), postgresql.JSONB()),
    ('recommendations', 'approaches', sa.text("'[]'::jsonb"), postgresql.JSONB()),
    ('recommendations', 'ideas', sa.text("'[]'::jsonb"), postgresql.JSONB()),
    ('recommendations', 'revenue_model', sa.text("''"), sa.String()),
    ('recommendations', 'next_experiment', sa.text("''"), sa.Text()),
    ('recommendations', 'report_markdown', sa.text("''"), sa.Text()),
    ('recommendations', 'confidence_level', sa.text('0'), sa.Float()),
    ('knowledge_sources', 'metadata_json', sa.text("'{}'::jsonb"), postgresql.JSONB()),
    ('knowledge_sources', 'version', sa.text("'1.0'"), sa.String()),
    ('workflow_runs', 'workflow_type', sa.text("''"), sa.String()),
    ('workflow_runs', 'status', sa.text("'running'"), sa.String()),
    ('workflow_runs', 'input_data', sa.text("'{}'::jsonb"), postgresql.JSONB()),
    ('feedbacks', 'is_useful', sa.text('true'), sa.Boolean()),
]

# Valores permitidos. Los que hoy solo existían en comentarios de código.
_CHECKS = [
    ('users', 'ck_users_role',
     "role IN ('entrepreneur', 'mentor', 'admin')"),
    ('idea_cases', 'ck_idea_cases_status',
     "status IN ('new', 'in_progress', 'validated', 'rejected')"),
    ('idea_cases', 'ck_idea_cases_category',
     "category IS NULL OR category IN "
     "('dolor', 'ineficiencia', 'necesidad no cubierta', 'oportunidad', "
     "'tendencia', 'hipótesis')"),
    ('opportunity_assessments', 'ck_assessments_frequency',
     "frequency IS NULL OR frequency IN ('low', 'medium', 'high')"),
    ('opportunity_assessments', 'ck_assessments_severity',
     "severity IS NULL OR severity IN ('low', 'medium', 'high')"),
    ('opportunity_assessments', 'ck_assessments_urgency',
     "urgency IS NULL OR urgency IN ('low', 'medium', 'high')"),
    ('opportunity_assessments', 'ck_assessments_willingness_to_pay',
     "willingness_to_pay IS NULL OR willingness_to_pay IN ('low', 'medium', 'high')"),
    ('opportunity_assessments', 'ck_assessments_market_attraction',
     "market_attraction_level IS NULL OR market_attraction_level IN ('low', 'medium', 'high')"),
    ('opportunity_assessments', 'ck_assessments_viability',
     "viability_recommendation IS NULL OR viability_recommendation IN ('low', 'medium', 'high')"),
    ('workflow_runs', 'ck_workflow_runs_status',
     "status IN ('running', 'completed', 'failed')"),
    ('feedbacks', 'ck_feedbacks_rating',
     "rating IS NULL OR rating BETWEEN 1 AND 5"),
]


def upgrade() -> None:
    # --- 1. PKs autogenerados en la base -----------------------------------
    for table, column in _PK_COLUMNS:
        op.alter_column(
            table,
            column,
            server_default=sa.text('gen_random_uuid()'),
            existing_type=postgresql.UUID(as_uuid=True),
        )

    # --- 2. JSON -> JSONB --------------------------------------------------
    for table, column in _JSON_COLUMNS:
        op.alter_column(
            table,
            column,
            type_=postgresql.JSONB(),
            postgresql_using=f'{column}::jsonb',
            existing_type=sa.JSON(),
        )

    # --- 3. Timestamps a timestamptz ---------------------------------------
    # `AT TIME ZONE 'UTC'` interpreta el valor naive existente como UTC, que es
    # exactamente lo que escribía datetime.utcnow(). Sin el USING, Postgres
    # aplicaría el TimeZone de la sesión y correría los datos.
    for table, column in _TIMESTAMPS_REQUIRED:
        op.alter_column(
            table,
            column,
            type_=sa.DateTime(timezone=True),
            postgresql_using=f"{column} AT TIME ZONE 'UTC'",
            existing_type=sa.DateTime(),
        )
        op.alter_column(
            table,
            column,
            nullable=False,
            server_default=sa.text('now()'),
            existing_type=sa.DateTime(timezone=True),
        )

    for table, column in _TIMESTAMPS_OPTIONAL:
        op.alter_column(
            table,
            column,
            type_=sa.DateTime(timezone=True),
            postgresql_using=f"{column} AT TIME ZONE 'UTC'",
            existing_type=sa.DateTime(),
        )

    # --- 4. NOT NULL + server_default --------------------------------------
    for table, column, server_default, existing_type in _NOT_NULL_DEFAULTS:
        op.alter_column(
            table,
            column,
            nullable=False,
            server_default=server_default,
            existing_type=existing_type,
        )

    # --- 5. Validación de dominio ------------------------------------------
    for table, name, condition in _CHECKS:
        op.create_check_constraint(name, table, condition)


def downgrade() -> None:
    # Orden inverso estricto.
    for table, name, _ in reversed(_CHECKS):
        op.drop_constraint(name, table, type_='check')

    for table, column, _, existing_type in reversed(_NOT_NULL_DEFAULTS):
        op.alter_column(
            table,
            column,
            nullable=True,
            server_default=None,
            existing_type=existing_type,
        )

    for table, column in reversed(_TIMESTAMPS_OPTIONAL):
        op.alter_column(
            table,
            column,
            type_=sa.DateTime(),
            postgresql_using=f"{column} AT TIME ZONE 'UTC'",
            existing_type=sa.DateTime(timezone=True),
        )

    for table, column in reversed(_TIMESTAMPS_REQUIRED):
        op.alter_column(
            table,
            column,
            nullable=True,
            server_default=None,
            existing_type=sa.DateTime(timezone=True),
        )
        op.alter_column(
            table,
            column,
            type_=sa.DateTime(),
            postgresql_using=f"{column} AT TIME ZONE 'UTC'",
            existing_type=sa.DateTime(timezone=True),
        )

    for table, column in reversed(_JSON_COLUMNS):
        op.alter_column(
            table,
            column,
            type_=sa.JSON(),
            postgresql_using=f'{column}::json',
            existing_type=postgresql.JSONB(),
        )

    for table, column in reversed(_PK_COLUMNS):
        op.alter_column(
            table,
            column,
            server_default=None,
            existing_type=postgresql.UUID(as_uuid=True),
        )
