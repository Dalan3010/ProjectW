from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Optional
from uuid import UUID, uuid4

@dataclass
class Feedback:
    # Las FK son datos requeridos, no opcionales: van sin default. Un
    # default_factory=uuid4 acá generaba una referencia a una fila inexistente
    # si se olvidaba pasarlas, y el error aparecía recién al insertar.
    recommendation_id: UUID
    user_id: UUID
    id: UUID = field(default_factory=uuid4)
    is_useful: bool = True
    comment: Optional[str] = None
    rating: Optional[int] = None # 1 to 5
    created_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
