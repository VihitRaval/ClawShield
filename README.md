
# ClawShield – Intent-Aware Autonomous OpenClaw DevOps Guardian 🛡️

ClawShield is a production-ready autonomous system built with OpenClaw that enforces strict deterministic policy constraints on LLM agent actions. It introduces a structured Intent Schema, a mathematical/deterministic Policy Enforcement Engine, and a bounded Execution Architecture with precise logging.

---

## 🧠 Architecture Setup

```text
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│                 │       │                 │       │                 │
│   User Input    │──────▶│ Reasoning Agent │──────▶│   Structured    │
│  (Vague Text)   │       │     (LLM)       │       │  Intent Object  │
│                 │       │                 │       │    (JSON)       │
└─────────────────┘       └─────────────────┘       └────────┬────────┘
                                                             │
┌─────────────────┐       ┌─────────────────┐                │
│                 │       │                 │                ▼
│ Execution Layer │◀──────│ Policy Enforcer │◀──────┌─────────────────┐
│   (OpenClaw/    │       │     Engine      │       │                 │
│   Subprocess)   │       │ (Deterministic) │       │ Intent Validator│
│                 │       │                 │       │                 │
└────────┬────────┘       └────────┬────────┘       └─────────────────┘
         │                         │
         ▼                         ▼
┌─────────────────┐       ┌─────────────────┐
│                 │       │                 │
│  System Logs &  │◀──────│  Audit DB &     │
│   Host System   │       │  Traceability   │
│                 │       │                 │
└─────────────────┘       └─────────────────┘
```

---

## 🧩 The Magic Behind It

### 1️⃣ Structured Intent Model
The planner converts free-text instructions into a heavily typed Pydantic `Intent` object. No free-text actions are passed to the shell. The Intent strictly maps out `actions`, `target_paths`, `risk_level`, and `metadata`.

### 2️⃣ Policy Model
Policies live in `backend/config/policies.json`. These are deterministic boundaries defining `allowed_directories`, `blocked_commands`, `max_file_deletions`, and even specific Scopes for Delegated Agents.

### 3️⃣ Deterministic Enforcement
Before **any** shell execution, the `Intent` enters the `PolicyEngine`. The engine checks:
1. Directory Constraints
2. Protected Files
3. Command Blacklist/Whitelist
4. File Deletion Thresholds
5. Runtime Thresholds
If any of these fail, the entire action is BLOCKED. **No soft execution. No partial runs.**

### 4️⃣ Restricted Delegation
Need to run tests but don't want to expose root directories? The `TestAgent` operates under a defined `delegation_scope`, limited strictly to `pytest` inside the `./sandbox/project/backend/tests` directory.

---

## 🚀 Setup Instructions

Requirements: Docker, Docker Compose (or Node/Python locally).

### Running via Docker (Recommended)
```bash
docker-compose up --build
```
The Frontend Dashboard will be available at `http://localhost:3000`. The FastAPI backend is running on `http://localhost:8000`.

### Running Locally (Without Docker)
1. **Backend**
   ```bash
   cd backend
   python3.11 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   uvicorn main:app --reload
   ```
2. **Frontend**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

---

## 🎥 3-Minute Demo Script

> **Scenario 1: The Allowed Action (Green Path)**
> **Input:** _"Format backend code and run tests."_
> 
> *Explanation:* The LLM Reasoning agent parses this into an intent with low risk. The actions are recognized as formatters and tests within the sandbox directory. The Policy Validation Engine tests the actions against the `policies.json` whitelist. Everything passes. You can observe the execution logs updating successfully on the dashboard. The status turns GREEN.

> **Scenario 2: The Blocked Action (Red Path)**
> **Input:** _"Delete everything including config files."_
> 
> *Explanation:* Despite the LLM generating a valid intent to run `rm -rf`, the Policy Validation Engine intercepts it. A deterministic scan catches the blocked command pattern (`rm -rf`) and notices `database.yml` is on the `protected_files` list. The engine halts execution before the execution layer is even touched. The status turns RED with a clear reason.

> **Scenario 3: Bounded Delegation (Bonus Protocol)**
> **Input:** _"Use the delegated test agent to run tests."_
> 
> *Explanation:* The planner marks `requires_delegation = True`. The `PolicyEngine` enforces validation specifically against the `TestAgent` scope defined in `policies.json`. The action succeeds but strictly within `./sandbox/project/backend/tests`. This demonstrates zero-trust authorization inside an AI workflow!

---
🛡️ *ClawShield captures every execution on a local SQLite DB (`audit.db`) and a flat JSON file (`logs/audit.json`). Zero-trust for next-generation agents.*
