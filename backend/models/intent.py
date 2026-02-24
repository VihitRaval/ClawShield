from pydantic import BaseModel
from typing import List, Literal, Optional

class Intent(BaseModel):
    goal: str
    description: str
    scope: str
    actions: List[str]
    target_paths: List[str]
    execution_type: Literal["filesystem", "command"]
    risk_level: Literal["none", "low", "medium", "high"]
    requires_delegation: bool
    metadata: dict
    ai_response: Optional[str] = None
