"""Crear esquema inicial (8 tablas)

Revision ID: a7c3e91f5d2b
Revises:
Create Date: 2026-10-18

Revisión inicial escrita a mano (no hay base de datos disponible para
autogenerate). Cada columna, tipo, restricción NOT NULL, FK y unique fue
cotejada línea por línea contra app/infrastructure/database/models.py.
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = 'a7c3e91f5d2b'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'users',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('email', sa.String(), nullable=False),
        sa.Column('full_name', sa.String(), nullable=True),
        sa.Column('hashed_password', sa.String(), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=True),
        sa.Column('role', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.UniqueConstraint('email', name='uq_users_email'),
    )
    op.create_index('ix_users_email', 'users', ['email'], unique=True)

    op.create_table(
        'idea_cases',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('owner_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('category', sa.String(), nullable=True),
        sa.Column('status', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.Column('metadata_json', sa.JSON(), nullable=True),
        sa.ForeignKeyConstraint(['owner_id'], ['users.id'], ),
    )

    op.create_table(
        'idea_versions',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('case_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('version_number', sa.Integer(), nullable=True),
        sa.Column('content', sa.JSON(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(['case_id'], ['idea_cases.id'], ),
    )

    op.create_table(
        'opportunity_assessments',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('case_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('frequency', sa.String(), nullable=True),
        sa.Column('severity', sa.String(), nullable=True),
        sa.Column('urgency', sa.String(), nullable=True),
        sa.Column('willingness_to_pay', sa.String(), nullable=True),
        sa.Column('target_segment', sa.String(), nullable=True),
        sa.Column('market_attraction_level', sa.String(), nullable=True),
        sa.Column('main_risks', sa.JSON(), nullable=True),
        sa.Column('viability_recommendation', sa.String(), nullable=True),
        sa.Column('score', sa.Float(), nullable=True),
        sa.Column('explanation', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['case_id'], ['idea_cases.id'], ),
        sa.UniqueConstraint('case_id', name='uq_opportunity_assessments_case_id'),
    )

    op.create_table(
        'recommendations',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('case_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('version_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('approaches', sa.JSON(), nullable=True),
        sa.Column('ideas', sa.JSON(), nullable=True),
        sa.Column('revenue_model', sa.String(), nullable=True),
        sa.Column('next_experiment', sa.Text(), nullable=True),
        sa.Column('report_markdown', sa.Text(), nullable=True),
        sa.Column('confidence_level', sa.Float(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['case_id'], ['idea_cases.id'], ),
    )

    op.create_table(
        'knowledge_sources',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('content_type', sa.String(), nullable=True),
        sa.Column('source_url', sa.String(), nullable=True),
        sa.Column('metadata_json', sa.JSON(), nullable=True),
        # Placeholder de vector (pgvector) guardado como Text por ahora.
        sa.Column('embedding', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('version', sa.String(), nullable=True),
    )

    op.create_table(
        'workflow_runs',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('case_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('workflow_type', sa.String(), nullable=True),
        sa.Column('status', sa.String(), nullable=True),
        sa.Column('start_time', sa.DateTime(), nullable=True),
        sa.Column('end_time', sa.DateTime(), nullable=True),
        sa.Column('input_data', sa.JSON(), nullable=True),
        sa.Column('output_data', sa.JSON(), nullable=True),
        sa.Column('error_log', sa.Text(), nullable=True),
        sa.Column('n8n_execution_id', sa.String(), nullable=True),
        sa.ForeignKeyConstraint(['case_id'], ['idea_cases.id'], ),
    )

    op.create_table(
        'feedbacks',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('recommendation_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('is_useful', sa.Boolean(), nullable=True),
        sa.Column('comment', sa.Text(), nullable=True),
        sa.Column('rating', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['recommendation_id'], ['recommendations.id'], ),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
    )


def downgrade() -> None:
    # Orden inverso de dependencias: primero las hojas, luego la raíz.
    op.drop_table('feedbacks')
    op.drop_table('workflow_runs')
    op.drop_table('knowledge_sources')
    op.drop_table('recommendations')
    op.drop_table('opportunity_assessments')
    op.drop_table('idea_versions')
    op.drop_table('idea_cases')
    op.drop_index('ix_users_email', table_name='users')
    op.drop_table('users')
