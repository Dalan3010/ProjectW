"""Embeddings reales con pgvector

Revision ID: d7e2f9a4c1b3
Revises: c9d4e6b1a8f2
Create Date: 2026-10-24

Cuarta migración, escrita a mano.

`knowledge_sources.embedding` nació como `Text` con el comentario "placeholder
for vector, will fix with pgvector later". Mientras sea texto no hay búsqueda
semántica posible: no se puede ordenar por distancia ni indexar. La extensión
ya viene disponible en la imagen (`ankane/pgvector`, versión 0.5.1), así que
solo faltaba habilitarla y usar el tipo real.

Dimensión: 1536 = `text-embedding-3-small` de OpenAI. Es la elección por
defecto porque el costo por token es bajo y el proyecto está en fase de
validación. Cambiarla después obliga a re-embeddear todo; hoy la tabla está
vacía, así que es gratis cambiarla ahora. Si el modelo final es otro, esta es
la única línea que cambia.

El índice HNSW usa distancia coseno, que es la métrica estándar para
embeddings de texto normalizados. `m` y `ef_construction` son los valores por
defecto razonables de pgvector: buen recall sin inflar el tamaño del índice.
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from pgvector.sqlalchemy import Vector

# revision identifiers, used by Alembic.
revision: str = 'd7e2f9a4c1b3'
down_revision: Union[str, None] = 'c9d4e6b1a8f2'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

EMBEDDING_DIM = 1536


def upgrade() -> None:
    op.execute('CREATE EXTENSION IF NOT EXISTS vector')

    # La columna era un placeholder de texto que ninguna ruta escribía (0 filas
    # verificadas antes de migrar), así que no hay dato que convertir: se
    # reinterpreta como NULL del tipo vector.
    op.alter_column(
        'knowledge_sources',
        'embedding',
        type_=Vector(EMBEDDING_DIM),
        postgresql_using='NULL::vector',
        existing_type=sa.Text(),
    )

    op.create_index(
        'ix_knowledge_sources_embedding_hnsw',
        'knowledge_sources',
        ['embedding'],
        postgresql_using='hnsw',
        postgresql_with={'m': 16, 'ef_construction': 64},
        postgresql_ops={'embedding': 'vector_cosine_ops'},
    )


def downgrade() -> None:
    op.drop_index('ix_knowledge_sources_embedding_hnsw', table_name='knowledge_sources')

    op.alter_column(
        'knowledge_sources',
        'embedding',
        type_=sa.Text(),
        postgresql_using='embedding::text',
        existing_type=Vector(EMBEDDING_DIM),
    )

    op.execute('DROP EXTENSION IF EXISTS vector')
