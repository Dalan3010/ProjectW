from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional
from uuid import UUID, uuid4

@dataclass
class KnowledgeSource:
    id: UUID = field(default_factory=uuid4)
    name: str = ""
    content_type: str = "" # document, case, template, etc.
    source_url: Optional[str] = None
    metadata: dict = field(default_factory=dict)
    embedding: Optional[list[float]] = None
    created_at: datetime = field(default_factory=datetime.utcnow)
    version: str = "1.0"
