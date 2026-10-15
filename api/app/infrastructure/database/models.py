from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Float, JSON, Text, Integer
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import relationship, DeclarativeBase
from datetime import datetime
import uuid

class Base(DeclarativeBase):
    pass

class UserORM(Base):
    __tablename__ = "users"

    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    role = Column(String, default="entrepreneur")
    created_at = Column(DateTime, default=datetime.utcnow)

class IdeaCaseORM(Base):
    __tablename__ = "idea_cases"

    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    owner_id = Column(PG_UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text)
    category = Column(String)
    status = Column(String, default="new")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    metadata_json = Column(JSON)  # Renamed from metadata to avoid conflict with sqlalchemy

    owner = relationship("UserORM")
    versions = relationship("IdeaVersionORM", back_populates="case")
    assessment = relationship("OpportunityAssessmentORM", back_populates="case", uselist=False)
    recommendations = relationship("RecommendationORM", back_populates="case")

class IdeaVersionORM(Base):
    __tablename__ = "idea_versions"

    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    case_id = Column(PG_UUID(as_uuid=True), ForeignKey("idea_cases.id"), nullable=False)
    version_number = Column(Integer, default=1) # Need to import Integer
    content = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    notes = Column(Text)

    case = relationship("IdeaCaseORM", back_populates="versions")

class OpportunityAssessmentORM(Base):
    __tablename__ = "opportunity_assessments"

    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    case_id = Column(PG_UUID(as_uuid=True), ForeignKey("idea_cases.id"), unique=True, nullable=False)
    frequency = Column(String)
    severity = Column(String)
    urgency = Column(String)
    willingness_to_pay = Column(String)
    target_segment = Column(String)
    market_attraction_level = Column(String)
    main_risks = Column(JSON)
    viability_recommendation = Column(String)
    score = Column(Float)
    explanation = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    case = relationship("IdeaCaseORM", back_populates="assessment")

class RecommendationORM(Base):
    __tablename__ = "recommendations"

    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    case_id = Column(PG_UUID(as_uuid=True), ForeignKey("idea_cases.id"), nullable=False)
    version_id = Column(PG_UUID(as_uuid=True), nullable=True)
    approaches = Column(JSON)
    ideas = Column(JSON)
    revenue_model = Column(String)
    next_experiment = Column(Text)
    report_markdown = Column(Text)
    confidence_level = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)

    case = relationship("IdeaCaseORM", back_populates="recommendations")

class KnowledgeSourceORM(Base):
    __tablename__ = "knowledge_sources"

    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    content_type = Column(String)
    source_url = Column(String)
    metadata_json = Column(JSON)
    embedding = Column(Text) # Placeholder for vector, will fix with pgvector later
    created_at = Column(DateTime, default=datetime.utcnow)
    version = Column(String, default="1.0")


class WorkflowRunORM(Base):
    __tablename__ = "workflow_runs"

    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    case_id = Column(PG_UUID(as_uuid=True), ForeignKey("idea_cases.id"), nullable=False)
    workflow_type = Column(String)
    status = Column(String)
    start_time = Column(DateTime, default=datetime.utcnow)
    end_time = Column(DateTime, nullable=True)
    input_data = Column(JSON)
    output_data = Column(JSON)
    error_log = Column(Text)
    n8n_execution_id = Column(String)

class FeedbackORM(Base):
    __tablename__ = "feedbacks"

    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    recommendation_id = Column(PG_UUID(as_uuid=True), ForeignKey("recommendations.id"), nullable=False)
    user_id = Column(PG_UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    is_useful = Column(Boolean, default=True)
    comment = Column(Text)
    rating = Column(Integer) # Need to import Integer
    created_at = Column(DateTime, default=datetime.utcnow)
