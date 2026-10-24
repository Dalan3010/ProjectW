from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Optional, List
from uuid import UUID, uuid4

@dataclass
class User:
    id: UUID = field(default_factory=uuid4)
    email: str = ""
    full_name: str = ""
    hashed_password: str = ""
    is_active: bool = True
    role: str = "entrepreneur"  # entrepreneur, mentor, admin
    created_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
