from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Optional, Dict, Any
from uuid import UUID, uuid4

@dataclass
class WorkflowRun:
    # FK requerida, sin default: un UUID aleatorio acá apuntaría a un caso
    # inexistente y fallaría recién al insertar.
    case_id: UUID
    id: UUID = field(default_factory=uuid4)
    workflow_type: str = "" # e.g., validation, ideation
    status: str = "running"  # running, completed, failed
    start_time: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
    end_time: Optional[datetime] = None
    input_data: Dict[str, Any] = field(default_factory=dict)
    output_data: Dict[str, Any] = field(default_factory=dict)
    error_log: Optional[str] = None
    n8n_execution_id: Optional[str] = None
