import json
import os
from models.intent import Intent
from models.policy import PolicyConfig
from enforcement.validator import validate_intent

class PolicyEngine:
    def __init__(self, config_path: str = "config/policies.json"):
        self.config_path = config_path
        self.policy = self.load_policy()

    def load_policy(self) -> PolicyConfig:
        if not os.path.exists(self.config_path):
             raise FileNotFoundError(f"Policy config not found at {self.config_path}")
        with open(self.config_path, "r") as f:
            data = json.load(f)
            return PolicyConfig(**data)

    def evaluate(self, intent: Intent, agent_token: str = None) -> dict:
        """
        Evaluates the given intent against the loaded policies.
        Returns a dictionary with status APPROVED or BLOCKED.
        """
        # Reload policy on every evaluation to pick up live config changes
        self.policy = self.load_policy()
        
        result = validate_intent(intent, self.policy, agent_token)
        return result
