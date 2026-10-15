from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional, Dict, Any
from uuid import UUID, uuid4

@dataclass
class IdeaVersion:
    id: UUID = field(default_factory=uuid4)
    case_id: UUID = field(default_factory=uuid4)
    version_number: int = 1
    content: Dict[str, Any] = field(default_factory=dict)  # Stores the refined problem, user, etc.
    created_at: datetime = field(default_factory=datetime.utcnow)
    notes: Optional[str] = None
