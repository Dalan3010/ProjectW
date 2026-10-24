from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from uuid import UUID, uuid4
from .user import User

@dataclass
class IdeaCase:
    # FK requerida, sin default: un UUID aleatorio acá apuntaría a un usuario
    # inexistente y fallaría recién al insertar.
    owner_id: UUID
    id: UUID = field(default_factory=uuid4)
    title: str = ""
    description: str = ""
    category: Optional[str] = None  # dolor, ineficiencia, necesidad no cubierta, oportunidad, tendencia, hipótesis
    status: str = "new"  # new, in_progress, validated, rejected
    created_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
    metadata: Dict[str, Any] = field(default_factory=dict)
    versions: List['IdeaVersion'] = field(default_factory=list)
    assessment: Optional['OpportunityAssessment'] = None
    latest_recommendation: Optional['Recommendation'] = None
