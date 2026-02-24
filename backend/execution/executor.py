import subprocess
from typing import Dict, Any
from models.intent import Intent

class Executor:
    def __init__(self, sandbox_dir: str = "."):
        self.sandbox_dir = sandbox_dir

    def execute(self, intent: Intent) -> Dict[str, Any]:
        """
        Executes an approved intent. It is strictly assumed that the intent 
        has already passed the PolicyEngine.
        """
        results = []
        overall_success = True
        
        for action in intent.actions:
            try:
                # Use shell=True to support commands with arguments easily
                # but run in the sandbox directory
                process = subprocess.run(
                    action, 
                    shell=True,
                    cwd=self.sandbox_dir,
                    capture_output=True,
                    text=True,
                    timeout=intent.metadata.get("estimated_runtime", 10)
                )
                
                success = process.returncode == 0
                if not success:
                    overall_success = False
                
                results.append({
                    "action": action,
                    "success": success,
                    "stdout": process.stdout.strip(),
                    "stderr": process.stderr.strip(),
                    "exit_code": process.returncode
                })
                
                # Stop executing further actions if one fails (optional behavior)
                if not success:
                    break
                    
            except subprocess.TimeoutExpired as e:
                overall_success = False
                results.append({
                    "action": action,
                    "success": False,
                    "stdout": e.stdout.decode() if e.stdout else "",
                    "stderr": "Execution timed out based on policy constraints.",
                    "exit_code": 124
                })
                break
            except Exception as e:
                overall_success = False
                results.append({
                    "action": action,
                    "success": False,
                    "stdout": "",
                    "stderr": str(e),
                    "exit_code": -1
                })
                break
                
        return {
            "status": "COMPLETED" if overall_success else "PARTIAL_OR_FAILED",
            "execution_summary": results
        }
