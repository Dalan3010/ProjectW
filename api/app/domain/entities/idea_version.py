from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Optional, Dict, Any
from uuid import UUID, uuid4

@dataclass
class IdeaVersion:
    # FK requerida, sin default: un UUID aleatorio acá apuntaría a un caso
    # inexistente y fallaría recién al insertar.
    case_id: UUID
    id: UUID = field(default_factory=uuid4)
    version_number: int = 1
    content: Dict[str, Any] = field(default_factory=dict)  # Stores the refined problem, user, etc.
    created_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
    notes: Optional[str] = None
