"""Mensajes de chat persistidos

Revision ID: e1a5c3f7b9d2
Revises: d7e2f9a4c1b3
Create Date: 2026-10-24

Quinta migración, escrita a mano.

El chat deja de ser efímero: cada mensaje del usuario y su respuesta quedan en
Postgres. La tabla es un histórico append-only; no se actualiza ni se borra un
mensaje suelto, solo desaparece con su caso (`ON DELETE CASCADE`).

Decisiones:

1. `role` con CHECK en vez de ENUM nativo por la misma razón que el resto del
   esquema: un CHECK se altera con DROP/ADD sin reescribir la tabla.
2. El índice `(case_id, created_at)` cubre el filtro del listado y su orden
   ascendente, así Postgres no ordena en memoria.
3. `metadata` es JSONB con default `'{}'`, igual que `idea_cases.metadata_json`:
   el payload de análisis lo consume el frontend como dato opaco.
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = 'e1a5c3f7b9d2'
down_revision: Union[str, None] = 'd7e2f9a4c1b3'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'chat_messages',
        sa.Column(
            'id',
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text('gen_random_uuid()'),
        ),
        sa.Column('case_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('role', sa.String(length=20), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column(
            'metadata',
            postgresql.JSONB(),
            nullable=False,
            server_default=sa.text("'{}'::jsonb"),
        ),
        sa.Column(
            'created_at',
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text('now()'),
        ),
        sa.CheckConstraint(
            "role IN ('user', 'assistant')",
            name='ck_chat_messages_role',
        ),
        sa.ForeignKeyConstraint(
            ['case_id'],
            ['idea_cases.id'],
            ondelete='CASCADE',
            name='fk_chat_messages_case_id',
        ),
    )

    op.create_index(
        'ix_chat_messages_case_created',
        'chat_messages',
        ['case_id', 'created_at'],
    )


def downgrade() -> None:
    # Orden inverso al de upgrade.
    op.drop_index('ix_chat_messages_case_created', table_name='chat_messages')
    op.drop_table('chat_messages')
