from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
import json
import logging
import os
from dotenv import load_dotenv

load_dotenv()

from database.session import SessionLocal, AuditLog
from reasoning.planner import Planner
from enforcement.policy_engine import PolicyEngine
from execution.executor import Executor
from delegation.delegated_agent import DelegatedAgent
from routers import auth
from security import decode_access_token
from fastapi import Header
from typing import Optional

# Setup JSON logging
os_log_dir = "./logs"
import os
os.makedirs(os_log_dir, exist_ok=True)
json_logger = logging.getLogger("clawshield_json")
json_logger.setLevel(logging.INFO)
file_handler = logging.FileHandler(f"{os_log_dir}/audit.json")
json_logger.addHandler(file_handler)

app = FastAPI(title="ClawShield API")

# Allow Frontend CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)

planner = Planner()
policy_engine = PolicyEngine()
executor = Executor(sandbox_dir=".")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/")
def read_root():
    return {"status": "ClawShield API is running", "endpoints": ["/execute", "/audit", "/policy"]}

class ExecuteRequest(BaseModel):
    instruction: str

@app.post("/execute")
def execute_instruction(req: ExecuteRequest, db: Session = Depends(get_db), authorization: Optional[str] = Header(None)):
    user_id = None
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1]
        payload = decode_access_token(token)
        if payload and "sub" in payload:
            user_id = int(payload["sub"])
    # 1. Reasoning Layer
    intent = planner.plan(req.instruction)
    
    # 2. Validation Layer
    validation_result = policy_engine.evaluate(intent)
    
    # 3. Execution / Delegation Layer
    execution_result = None
    if validation_result["status"] == "APPROVED":
        if intent.requires_delegation:
            test_agent = DelegatedAgent("TestAgent", policy_engine)
            execution_result = test_agent.run_task(intent)
            # Re-check delegation's own validation
            if execution_result.get("validation", {}).get("status") == "BLOCKED":
                validation_result = execution_result["validation"]
                execution_result = None
        else:
            execution_result = executor.execute(intent)

    # 4. Persistence & Logging
    log_entry = AuditLog(
        user_id=user_id,
        user_instruction=req.instruction,
        intent_json=intent.model_dump_json(),
        validation_status=validation_result["status"],
        validation_reason=validation_result.get("reason"),
        execution_result=json.dumps(execution_result) if execution_result else None
    )
    db.add(log_entry)
    db.commit()
    db.refresh(log_entry)

    log_dict = {
        "id": log_entry.id,
        "instruction": req.instruction,
        "intent": intent.model_dump(),
        "validation": validation_result,
        "execution": execution_result
    }
    json_logger.info(json.dumps(log_dict))

    return {
        "trace": log_dict
    }

@app.get("/audit")
def get_audit_logs(db: Session = Depends(get_db), authorization: Optional[str] = Header(None)):
    user_id = None
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1]
        payload = decode_access_token(token)
        if payload and "sub" in payload:
            user_id = int(payload["sub"])
            
    if not user_id:
        return []

    logs = db.query(AuditLog).filter(AuditLog.user_id == user_id).order_by(AuditLog.id.desc()).all()
    # Return as list of dicts
    return [{
        "id": l.id,
        "timestamp": l.timestamp,
        "instruction": l.user_instruction,
        "intent": json.loads(l.intent_json) if l.intent_json else {},
        "status": l.validation_status,
        "reason": l.validation_reason,
        "execution": json.loads(l.execution_result) if l.execution_result else None
    } for l in logs]

@app.get("/policy")
def get_policy():
    with open("config/policies.json", "r") as f:
        return json.load(f)
