"""Indices y constraints de integridad

Revision ID: b3f1a2c7d9e4
Revises: a7c3e91f5d2b
Create Date: 2026-10-24

Segunda migración, escrita a mano (igual que la inicial, no hay base de datos
disponible para autogenerate).

Objetivo: que el esquema tenga índices para las consultas que la aplicación
realmente hace y que la base garantice la integridad referencial que hoy solo
existe en comentarios de código.

Reglas que se aplican acá:

1. Postgres NO indexa las foreign keys automáticamente. Toda FK por la que se
   filtre, se haga join o se dispare un ON DELETE necesita su índice.
2. Un índice compuesto con la columna de filtro como primera columna cubre las
   consultas que filtran solo por esa columna. No se duplica con un índice
   simple (era justamente el defecto del email en `users`).
3. Los índices de los listados ordenados van con el ORDER BY declarado en el
   índice, para evitar el filesort.

No cambia tipos, nullability ni enums: eso corresponde a la 003.
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = 'b3f1a2c7d9e4'
down_revision: Union[str, None] = 'a7c3e91f5d2b'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # --- 1. `users.email` tenía el índice único dos veces -------------------
    # models.py declaraba `unique=True, index=True` y la migración inicial
    # agregaba además `uq_users_email`. Postgres materializa dos B-tree para la
    # misma restricción: doble costo en cada INSERT/UPDATE. Se conserva el
    # índice `ix_users_email` (que ya es único).
    op.drop_constraint('uq_users_email', 'users', type_='unique')

    # --- 2. Listado de casos por dueño, más recientes primero ---------------
    # Cubre `get_by_owner` (filtra solo owner_id) y el orden por updated_at.
    op.create_index(
        'ix_idea_cases_owner_updated',
        'idea_cases',
        ['owner_id', sa.text('updated_at DESC')],
    )

    # --- 3. Versiones de un caso -------------------------------------------
    # Un unique compuesto cumple dos funciones: numeración sin duplicados bajo
    # concurrencia y, de paso, índice para los lookups por case_id.
    op.create_unique_constraint(
        'uq_idea_versions_case_version',
        'idea_versions',
        ['case_id', 'version_number'],
    )

    # --- 4. Recomendaciones por caso, más recientes primero ----------------
    # Cubre el `latest_recommendation` de la entidad de dominio.
    op.create_index(
        'ix_recommendations_case_created',
        'recommendations',
        ['case_id', sa.text('created_at DESC')],
    )
    # Necesario para la FK de version_id que se agrega más abajo: sin índice,
    # borrar una idea_version escanea recommendations completa.
    op.create_index('ix_recommendations_version_id', 'recommendations', ['version_id'])

    # --- 5. FK faltante: recommendations.version_id -> idea_versions.id -----
    # La columna existía sin ForeignKey, así que podía apuntar a cualquier UUID.
    # Se limpian primero las referencias huérfanas (un version_id que no existe
    # no es información, es basura) y recién después se crea la restricción,
    # que falla ruidosamente si algo quedó mal.
    op.execute(
        sa.text(
            """
            UPDATE recommendations AS r
            SET version_id = NULL
            WHERE r.version_id IS NOT NULL
              AND NOT EXISTS (
                  SELECT 1 FROM idea_versions AS v WHERE v.id = r.version_id
              )
            """
        )
    )
    op.create_foreign_key(
        'fk_recommendations_version_id',
        'recommendations',
        'idea_versions',
        ['version_id'],
        ['id'],
        ondelete='SET NULL',
    )

    # --- 6. Workflow runs (integración n8n) --------------------------------
    # Historial por caso, más recientes primero.
    op.create_index(
        'ix_workflow_runs_case_start',
        'workflow_runs',
        ['case_id', sa.text('start_time DESC')],
    )
    # Para el polling de ejecuciones en curso.
    op.create_index('ix_workflow_runs_status', 'workflow_runs', ['status'])
    # Idempotencia: n8n reintenta webhooks ante timeout. Sin unique, un
    # reintento duplica la fila y no hay forma de hacer ON CONFLICT.
    # Índice parcial porque n8n_execution_id es nullable (runs locales).
    op.create_index(
        'uq_workflow_runs_n8n_exec',
        'workflow_runs',
        ['n8n_execution_id'],
        unique=True,
        postgresql_where=sa.text('n8n_execution_id IS NOT NULL'),
    )

    # --- 7. Feedback -------------------------------------------------------
    # opportunity_assessments.case_id ya está cubierta por su UNIQUE.
    op.create_index('ix_feedbacks_recommendation_id', 'feedbacks', ['recommendation_id'])
    op.create_index('ix_feedbacks_user_id', 'feedbacks', ['user_id'])


def downgrade() -> None:
    # Orden inverso al de upgrade.
    op.drop_index('ix_feedbacks_user_id', table_name='feedbacks')
    op.drop_index('ix_feedbacks_recommendation_id', table_name='feedbacks')

    op.drop_index(
        'uq_workflow_runs_n8n_exec',
        table_name='workflow_runs',
        postgresql_where=sa.text('n8n_execution_id IS NOT NULL'),
    )
    op.drop_index('ix_workflow_runs_status', table_name='workflow_runs')
    op.drop_index('ix_workflow_runs_case_start', table_name='workflow_runs')

    op.drop_constraint('fk_recommendations_version_id', 'recommendations', type_='foreignkey')
    op.drop_index('ix_recommendations_version_id', table_name='recommendations')
    op.drop_index('ix_recommendations_case_created', table_name='recommendations')

    op.drop_constraint('uq_idea_versions_case_version', 'idea_versions', type_='unique')

    op.drop_index('ix_idea_cases_owner_updated', table_name='idea_cases')

    op.create_unique_constraint('uq_users_email', 'users', ['email'])
