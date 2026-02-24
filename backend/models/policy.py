from pydantic import BaseModel
from typing import List, Dict

class AgentScope(BaseModel):
    allowed_directories: List[str]
    allowed_commands: List[str]

class PolicyConfig(BaseModel):
    allowed_directories: List[str]
    protected_files: List[str]
    allowed_commands: List[str]
    blocked_commands: List[str]
    max_file_deletions: int
    max_runtime_seconds: int
    delegation_scopes: Dict[str, AgentScope]
