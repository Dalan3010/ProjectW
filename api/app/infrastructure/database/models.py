from sqlalchemy import (
    Column, String, Boolean, DateTime, ForeignKey, Float, Text, Integer,
    Index, UniqueConstraint, CheckConstraint, text,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import relationship, DeclarativeBase
from sqlalchemy.sql import func
from pgvector.sqlalchemy import Vector
import uuid

class Base(DeclarativeBase):
    pass

# Notas de diseño del esquema:
# - Todo timestamp es `timestamptz` con `server_default=now()`. La zona no es
#   opcional: cuando n8n manda ISO-8601 con `Z` conviven valores con y sin
#   tzinfo, y comparar naive contra aware da resultados falsos.
# - Los PK conservan `default=uuid.uuid4` para que SQLAlchemy tenga el id antes
#   del flush, y además `server_default=gen_random_uuid()` para que un INSERT
#   por SQL crudo (seed, test, n8n) no necesite inventar el UUID.
# - Las columnas JSONB van sin índice GIN: todavía no hay consulta que las
#   filtre, y un GIN que nadie usa es costo de escritura puro.

def _pk():
    return Column(
        PG_UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        server_default=text('gen_random_uuid()'),
    )


class UserORM(Base):
    __tablename__ = "users"
    __table_args__ = (
        CheckConstraint(
            "role IN ('entrepreneur', 'mentor', 'admin')",
            name='ck_users_role',
        ),
    )

    id = _pk()
    email = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=False, server_default=text("''"))
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, nullable=False, server_default=text('true'))
    role = Column(String, nullable=False, server_default=text("'entrepreneur'"))
    created_at = Column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )

class IdeaCaseORM(Base):
    __tablename__ = "idea_cases"
    __table_args__ = (
        CheckConstraint(
            "status IN ('new', 'in_progress', 'validated', 'rejected')",
            name='ck_idea_cases_status',
        ),
        CheckConstraint(
            "category IS NULL OR category IN "
            "('dolor', 'ineficiencia', 'necesidad no cubierta', 'oportunidad', "
            "'tendencia', 'hipótesis')",
            name='ck_idea_cases_category',
        ),
    )

    id = _pk()
    owner_id = Column(PG_UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False, server_default=text("''"))
    category = Column(String)
    status = Column(String, nullable=False, server_default=text("'new'"))
    created_at = Column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    updated_at = Column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )
    # Renamed from metadata to avoid conflict with sqlalchemy
    metadata_json = Column(JSONB, nullable=False, server_default=text("'{}'::jsonb"))

    owner = relationship("UserORM")
    versions = relationship("IdeaVersionORM", back_populates="case")
    assessment = relationship("OpportunityAssessmentORM", back_populates="case", uselist=False)
    recommendations = relationship("RecommendationORM", back_populates="case")

class IdeaVersionORM(Base):
    __tablename__ = "idea_versions"
    # Numeración de versiones sin duplicados bajo concurrencia. El índice del
    # unique compuesto también sirve los lookups por case_id.
    __table_args__ = (
        UniqueConstraint('case_id', 'version_number', name='uq_idea_versions_case_version'),
    )

    id = _pk()
    case_id = Column(PG_UUID(as_uuid=True), ForeignKey("idea_cases.id"), nullable=False)
    version_number = Column(Integer, nullable=False, server_default=text('1'))
    content = Column(JSONB, nullable=False, server_default=text("'{}'::jsonb"))
    created_at = Column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    notes = Column(Text)

    case = relationship("IdeaCaseORM", back_populates="versions")

class OpportunityAssessmentORM(Base):
    __tablename__ = "opportunity_assessments"
    # Una evaluación puede estar incompleta (se llena por etapas), así que cada
    # criterio es nullable; el CHECK valida el valor cuando existe.
    __table_args__ = (
        CheckConstraint(
            "frequency IS NULL OR frequency IN ('low', 'medium', 'high')",
            name='ck_assessments_frequency',
        ),
        CheckConstraint(
            "severity IS NULL OR severity IN ('low', 'medium', 'high')",
            name='ck_assessments_severity',
        ),
        CheckConstraint(
            "urgency IS NULL OR urgency IN ('low', 'medium', 'high')",
            name='ck_assessments_urgency',
        ),
        CheckConstraint(
            "willingness_to_pay IS NULL OR willingness_to_pay IN ('low', 'medium', 'high')",
            name='ck_assessments_willingness_to_pay',
        ),
        CheckConstraint(
            "market_attraction_level IS NULL OR market_attraction_level IN ('low', 'medium', 'high')",
            name='ck_assessments_market_attraction',
        ),
        CheckConstraint(
            "viability_recommendation IS NULL OR viability_recommendation IN ('low', 'medium', 'high')",
            name='ck_assessments_viability',
        ),
    )

    id = _pk()
    case_id = Column(PG_UUID(as_uuid=True), ForeignKey("idea_cases.id"), unique=True, nullable=False)
    frequency = Column(String)
    severity = Column(String)
    urgency = Column(String)
    willingness_to_pay = Column(String)
    target_segment = Column(String)
    market_attraction_level = Column(String)
    main_risks = Column(JSONB)
    viability_recommendation = Column(String)
    score = Column(Float)
    explanation = Column(Text)
    created_at = Column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )

    case = relationship("IdeaCaseORM", back_populates="assessment")

class RecommendationORM(Base):
    __tablename__ = "recommendations"

    id = _pk()
    case_id = Column(PG_UUID(as_uuid=True), ForeignKey("idea_cases.id"), nullable=False)
    version_id = Column(
        PG_UUID(as_uuid=True),
        ForeignKey(
            "idea_versions.id",
            ondelete="SET NULL",
            name="fk_recommendations_version_id",
        ),
        nullable=True,
    )
    approaches = Column(JSONB, nullable=False, server_default=text("'[]'::jsonb"))
    ideas = Column(JSONB, nullable=False, server_default=text("'[]'::jsonb"))
    revenue_model = Column(String, nullable=False, server_default=text("''"))
    next_experiment = Column(Text, nullable=False, server_default=text("''"))
    report_markdown = Column(Text, nullable=False, server_default=text("''"))
    confidence_level = Column(Float, nullable=False, server_default=text('0'))
    created_at = Column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )

    case = relationship("IdeaCaseORM", back_populates="recommendations")

class KnowledgeSourceORM(Base):
    __tablename__ = "knowledge_sources"

    id = _pk()
    name = Column(String, nullable=False)
    content_type = Column(String)  # conjunto abierto: document, case, template...
    source_url = Column(String)
    metadata_json = Column(JSONB, nullable=False, server_default=text("'{}'::jsonb"))
    # 1536 = text-embedding-3-small. Cambiar la dimensión obliga a re-embeddear.
    embedding = Column(Vector(1536))
    created_at = Column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    version = Column(String, nullable=False, server_default=text("'1.0'"))


class WorkflowRunORM(Base):
    __tablename__ = "workflow_runs"
    __table_args__ = (
        # Idempotencia de callbacks n8n: n8n reintenta webhooks ante timeout. El
        # índice es parcial porque los runs locales no tienen execution id.
        Index(
            'uq_workflow_runs_n8n_exec',
            'n8n_execution_id',
            unique=True,
            postgresql_where=text('n8n_execution_id IS NOT NULL'),
        ),
        CheckConstraint(
            "status IN ('running', 'completed', 'failed')",
            name='ck_workflow_runs_status',
        ),
    )

    id = _pk()
    case_id = Column(PG_UUID(as_uuid=True), ForeignKey("idea_cases.id"), nullable=False)
    workflow_type = Column(String, nullable=False, server_default=text("''"))
    status = Column(String, nullable=False, server_default=text("'running'"))
    start_time = Column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    end_time = Column(DateTime(timezone=True), nullable=True)
    input_data = Column(JSONB, nullable=False, server_default=text("'{}'::jsonb"))
    output_data = Column(JSONB)
    error_log = Column(Text)
    n8n_execution_id = Column(String)

class FeedbackORM(Base):
    __tablename__ = "feedbacks"
    __table_args__ = (
        CheckConstraint(
            "rating IS NULL OR rating BETWEEN 1 AND 5",
            name='ck_feedbacks_rating',
        ),
    )

    id = _pk()
    recommendation_id = Column(PG_UUID(as_uuid=True), ForeignKey("recommendations.id"), nullable=False)
    user_id = Column(PG_UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    is_useful = Column(Boolean, nullable=False, server_default=text('true'))
    comment = Column(Text)
    rating = Column(Integer)
    created_at = Column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )

#Índices con ORDER BY declarado: cubren el filtro y el orden del listado, así
#Postgres no necesita ordenar en memoria. Se declaran acá porque necesitan el
#`.desc()` de la columna, que `__table_args__` no expone de forma legible.
Index(
    'ix_idea_cases_owner_updated',
    IdeaCaseORM.owner_id,
    IdeaCaseORM.updated_at.desc(),
)
Index(
    'ix_recommendations_case_created',
    RecommendationORM.case_id,
    RecommendationORM.created_at.desc(),
)
Index('ix_recommendations_version_id', RecommendationORM.version_id)
Index(
    'ix_workflow_runs_case_start',
    WorkflowRunORM.case_id,
    WorkflowRunORM.start_time.desc(),
)
Index('ix_workflow_runs_status', WorkflowRunORM.status)
Index('ix_feedbacks_recommendation_id', FeedbackORM.recommendation_id)
Index('ix_feedbacks_user_id', FeedbackORM.user_id)

# Búsqueda semántica por distancia coseno (métrica estándar para embeddings de
# texto). HNSW da mejor recall que IVFFlat sin necesidad de entrenar el índice.
Index(
    'ix_knowledge_sources_embedding_hnsw',
    KnowledgeSourceORM.embedding,
    postgresql_using='hnsw',
    postgresql_with={'m': 16, 'ef_construction': 64},
    postgresql_ops={'embedding': 'vector_cosine_ops'},
)
