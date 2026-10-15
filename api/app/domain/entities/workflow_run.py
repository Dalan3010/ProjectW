from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional, Dict, Any
from uuid import UUID, uuid4

@dataclass
class WorkflowRun:
    id: UUID = field(default_factory=uuid4)
    case_id: UUID = field(default_factory=uuid4)
    workflow_type: str = "" # e.g., validation, ideation
    status: str = "" # running, completed, failed
    start_time: datetime = field(default_factory=datetime.utcnow)
    end_time: Optional[datetime] = None
    input_data: Dict[str, Any] = field(default_factory=dict)
    output_data: Dict[str, Any] = field(default_factory=dict)
    error_log: Optional[str] = None
    n8n_execution_id: Optional[str] = None
