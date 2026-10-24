from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any, Dict
from uuid import UUID, uuid4


@dataclass
class ChatMessage:
    # FK, rol y contenido son obligatorios, sin default: un case_id inventado
    # apuntaría a un caso inexistente y un contenido vacío rompe el contrato.
    case_id: UUID
    role: str  # user, assistant
    content: str
    id: UUID = field(default_factory=uuid4)
    metadata: Dict[str, Any] = field(default_factory=dict)
    created_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
