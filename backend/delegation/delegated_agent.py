from models.intent import Intent
from enforcement.policy_engine import PolicyEngine
from execution.executor import Executor
from typing import Dict, Any

class DelegatedAgent:
    def __init__(self, agent_id: str, policy_engine: PolicyEngine):
        self.agent_id = agent_id
        self.policy_engine = policy_engine
        self.executor = Executor(sandbox_dir=".")

    def run_task(self, intent: Intent) -> Dict[str, Any]:
        """
        A delegated agent processes an intent, using its own token to authorize.
        """
        validation_result = self.policy_engine.evaluate(intent, agent_token=self.agent_id)
        
        if validation_result["status"] == "BLOCKED":
            return {
                "agent": self.agent_id,
                "validation": validation_result,
                "execution": None
            }
            
        execution_result = self.executor.execute(intent)
        return {
            "agent": self.agent_id,
            "validation": validation_result,
            "execution": execution_result
        }
