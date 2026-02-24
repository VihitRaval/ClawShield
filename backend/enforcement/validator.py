from typing import Dict, Any
import os
import re
from models.intent import Intent
from models.policy import PolicyConfig

class ValidationError(Exception):
    def __init__(self, reason: str, violated_policy: str):
        self.reason = reason
        self.violated_policy = violated_policy
        super().__init__(self.reason)

def validate_directory_scope(intent: Intent, policy: PolicyConfig):
    for path in intent.target_paths:
        if path == "INVALID":
            raise ValidationError("Invalid path specified in intent structure", "allowed_directories")
            
        # Ensure path falls exactly under allowed directories
        allowed = any(os.path.abspath(path).startswith(os.path.abspath(allowed_dir)) 
                      for allowed_dir in policy.allowed_directories)
        if not allowed:
            raise ValidationError(f"Path {path} is outside allowed directories", "allowed_directories")

def validate_protected_files(intent: Intent, policy: PolicyConfig):
    for path in intent.target_paths:
        filename = os.path.basename(path)
        if filename in policy.protected_files:
            raise ValidationError(f"Attempt to access protected file: {filename}", "protected_files")

def validate_commands(intent: Intent, policy: PolicyConfig):
    if intent.execution_type == "command":
        for action in intent.actions:
            normalized_action = action.lower()
            no_space_action = normalized_action.replace(" ", "")
            
            # Shell substitution obfuscation
            if "$(" in action or "`" in action:
                raise ValidationError("Shell substitution obfuscation detected", "blocked_commands")
            
            # Sub-command splitting (e.g. `echo "rm -rf"` vs `rm -rf`)
            # If the literal string contains a blocked pattern, we block it outright.
            for blocked in policy.blocked_commands:
                if blocked in normalized_action:
                    raise ValidationError(f"Command contains blocked pattern: {blocked}", "blocked_commands")
                # Detect spaces obfuscation like r m - r f
                blocked_no_space = blocked.replace(" ", "")
                if blocked_no_space and blocked_no_space in no_space_action:
                    raise ValidationError(f"Command contains obfuscated blocked pattern: {blocked}", "blocked_commands")

            # Check allowed commands
            # Split by common shell separators to check each sub-command base
            sub_commands = re.split(r';|&&|\|\||\|', action)
            for sub_cmd in sub_commands:
                sub_cmd = sub_cmd.strip()
                if not sub_cmd: continue
                # Remove leading env vars or sudo
                parts = sub_cmd.split()
                base_cmd = parts[0]
                if base_cmd == "sudo":
                     raise ValidationError("Use of sudo is strictly prohibited", "blocked_commands")
                if base_cmd not in policy.allowed_commands:
                    raise ValidationError(f"Command '{base_cmd}' is not in allowed_commands list", "allowed_commands")

def validate_deletion_count(intent: Intent, policy: PolicyConfig):
    deletion_ops = ["rm", "delete", "unlink", "remove"]
    is_deletion = any(any(op in action for op in deletion_ops) for action in intent.actions)
    if is_deletion:
        if len(intent.target_paths) > policy.max_file_deletions:
            raise ValidationError(f"Deletion count ({len(intent.target_paths)}) exceeds maximum allowed ({policy.max_file_deletions})", "max_file_deletions")
    
    deletions_requested = intent.metadata.get("deletion_count", 0)
    if deletions_requested > policy.max_file_deletions:
         raise ValidationError(f"Requested deletion count ({deletions_requested}) exceeds maximum allowed ({policy.max_file_deletions})", "max_file_deletions")

def validate_runtime(intent: Intent, policy: PolicyConfig):
    estimated_runtime = intent.metadata.get("estimated_runtime", 0)
    if estimated_runtime > policy.max_runtime_seconds:
        raise ValidationError(f"Estimated runtime ({estimated_runtime}s) exceeds maximum allowed ({policy.max_runtime_seconds}s)", "max_runtime_seconds")

def validate_delegation(intent: Intent, policy: PolicyConfig, agent_token: str = None):
    if intent.requires_delegation:
        if not agent_token or agent_token not in policy.delegation_scopes:
            raise ValidationError("Delegation requested but authority/token is invalid", "delegation_scopes")
        
        scope = policy.delegation_scopes[agent_token]
        # Validate against the delegated scope specifically
        for path in intent.target_paths:
            allowed = any(os.path.abspath(path).startswith(os.path.abspath(allowed_dir)) 
                          for allowed_dir in scope.allowed_directories)
            if not allowed:
                raise ValidationError(f"Delegated agent exceeded directory scope: {path}", "delegation_scopes")
        
        for action in intent.actions:
            sub_commands = re.split(r';|&&|\|\||\|', action)
            for sub_cmd in sub_commands:
                sub_cmd = sub_cmd.strip()
                if not sub_cmd: continue
                base_cmd = sub_cmd.split()[0]
                if base_cmd not in scope.allowed_commands:
                    raise ValidationError(f"Delegated agent exceeded command scope: {base_cmd}", "delegation_scopes")

def validate_intent(intent: Intent, policy: PolicyConfig, agent_token: str = None) -> Dict[str, Any]:
    try:
        # Atomic Validation: if any of these fail, everything is blocked.
        validate_directory_scope(intent, policy)
        validate_protected_files(intent, policy)
        validate_commands(intent, policy)
        validate_deletion_count(intent, policy)
        validate_runtime(intent, policy)
        if intent.requires_delegation or agent_token:
            validate_delegation(intent, policy, agent_token)
        
        return {"status": "APPROVED"}
    except ValidationError as e:
        return {
            "status": "BLOCKED",
            "reason": e.reason,
            "violated_policy": e.violated_policy
        }
