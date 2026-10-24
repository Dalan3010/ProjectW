from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from uuid import UUID, uuid4

@dataclass
class Recommendation:
    # FK requerida, sin default: un UUID aleatorio acá apuntaría a un caso
    # inexistente y fallaría recién al insertar.
    case_id: UUID
    id: UUID = field(default_factory=uuid4)
    version_id: Optional[UUID] = None
    approaches: List[Dict[str, Any]] = field(default_factory=list) # List of proposed solution approaches
    ideas: List[Dict[str, Any]] = field(default_factory=list)     # List of business ideas with rankings
    revenue_model: str = ""
    next_experiment: str = ""
    report_markdown: str = ""
    confidence_level: float = 0.0
    created_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
