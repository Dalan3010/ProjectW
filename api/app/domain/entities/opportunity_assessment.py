from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Optional, Dict, Any
from uuid import UUID, uuid4

@dataclass
class OpportunityAssessment:
    # FK requerida, sin default: un UUID aleatorio acá apuntaría a un caso
    # inexistente y fallaría recién al insertar.
    case_id: UUID
    id: UUID = field(default_factory=uuid4)
    frequency: str = ""      # low, medium, high
    severity: str = ""       # low, medium, high
    urgency: str = ""        # low, medium, high
    willingness_to_pay: str = "" # low, medium, high
    target_segment: str = ""
    market_attraction_level: str = "" # low, medium, high
    main_risks: list[str] = field(default_factory=list)
    viability_recommendation: str = "" # low, medium, high
    score: float = 0.0
    explanation: str = ""
    created_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
