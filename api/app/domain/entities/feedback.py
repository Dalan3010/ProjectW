from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional
from uuid import UUID, uuid4

@dataclass
class Feedback:
    id: UUID = field(default_factory=uuid4)
    recommendation_id: UUID = field(default_factory=uuid4)
    user_id: UUID = field(default_factory=uuid4)
    is_useful: bool = True
    comment: Optional[str] = None
    rating: Optional[int] = None # 1 to 5
    created_at: datetime = field(default_factory=datetime.utcnow)
