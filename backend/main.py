from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from uuid import uuid4
from datetime import datetime, timedelta
import os
import logging
from supabase import create_client, Client
from dotenv import load_dotenv
import random

# ---------- Load Environment Variables ----------
load_dotenv()
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "*")  # set to your frontend origin in production, e.g. "https://yourdomain.com"
PENDING_TIMEOUT_HOURS = int(os.getenv("PENDING_TIMEOUT_HOURS", "48"))

if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
    raise RuntimeError("❌ Missing Supabase credentials in environment")

# ---------- Supabase client (Service Role Key must remain server-side only) ----------
supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

# ---------- FastAPI App ----------
app = FastAPI(title="Cognitive Study Backend")

# ---------- Logging ----------
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("study-backend")

# ---------- CORS ----------
if ALLOWED_ORIGINS == "*" or ALLOWED_ORIGINS.strip() == "":
    allow_origins = ["*"]
else:
    # support comma-separated list in env
    allow_origins = [o.strip() for o in ALLOWED_ORIGINS.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------- Constants ----------
LATIN_SQUARE = ["Cond1", "Cond2", "Cond3"]
CONDITION_MAP = {
    "Cond1": ["silence", "white", "music"],
    "Cond2": ["white", "music", "silence"],
    "Cond3": ["music", "silence", "white"],
}

# ---------- Models ----------
class EligibilityData(BaseModel):
    hearingDifficulty: bool
    musicTraining: bool
    asdDiagnosis: bool
    ptsdDiagnosis: bool
    dyslexiaDiagnosis: bool
    hyperlexiaDiagnosis: bool
    noneOfAbove: bool

class SubmissionData(BaseModel):
    participant_id: str
    session_token: str
    answers: dict = Field(..., description="All formData object from frontend")


# ---------- Health endpoint ----------
@app.get("/health")
async def health():
    return {"status": "ok", "time": datetime.utcnow().isoformat() + "Z"}


# ---------- Helper: mark old pendings abandoned (safe, non-fatal) ----------
def cleanup_old_pending(timeout_hours: int = PENDING_TIMEOUT_HOURS):
    cutoff_iso = (datetime.utcnow() - timedelta(hours=timeout_hours)).isoformat() + "Z"
    try:
        # mark pending older than cutoff as abandoned, add reason for audit
        supabase.table("Participants") \
            .update({"status": "abandoned", "abandoned_reason": "timeout"}) \
            .lt("created_at", cutoff_iso) \
            .eq("status", "pending") \
            .execute()
        logger.info("cleanup_old_pending: attempted update older than %s", cutoff_iso)
    except Exception:
        logger.exception("Non-fatal: cleanup pending->abandoned failed")


# ---------- Assign condition (main endpoint) ----------



@app.post("/assign_condition")
async def assign_condition(data: EligibilityData):
    """
    - Records every participant in Participants table (status = 'pending' or 'disqualified').
    - Cleans old pending -> abandoned so they don't bias assignment.
    - Chooses condition to balance total counts across all conditions.
    - Returns participant_id and session_token (session_token is None for disqualified).
    """
    disqualified = any([
        data.hearingDifficulty, data.musicTraining,
        data.asdDiagnosis, data.ptsdDiagnosis,
        data.dyslexiaDiagnosis, data.hyperlexiaDiagnosis
    ])

    try:
        # 1) Cleanup old pending participants
        cleanup_old_pending()

        # 2) Fetch all active participants (excluding disqualified & abandoned)
        participants_result = supabase.table("Participants") \
            .select("condition") \
            .not_("status", "disqualified") \
            .not_("status", "abandoned") \
            .execute()

        # 3) Count participants per condition
        condition_counts = {c: 0 for c in LATIN_SQUARE}
        for p in participants_result.data:
            cond = p.get("condition")
            if cond in condition_counts:
                condition_counts[cond] += 1

        # 4) Assign condition with minimal current count
        min_count = min(condition_counts.values())
        available_conditions = [c for c, count in condition_counts.items() if count == min_count]
        condition = random.choice(available_conditions) if available_conditions else LATIN_SQUARE[0]
        order = CONDITION_MAP.get(condition, [])

        # 5) Insert participant
        participant_id = str(uuid4())
        status = "disqualified" if disqualified else "pending"
        session_token = None if disqualified else str(uuid4())

        record = {
            "id": participant_id,
            "session_token": session_token,
            "condition": None if disqualified else condition,
            "status": status,
            "created_at": datetime.utcnow().isoformat() + "Z",
            "eligibility": data.dict()
        }

        insert_result = supabase.table("Participants").insert(record).execute()
        if not insert_result.data:
            logger.exception("Insert returned no data: %s", insert_result)
            raise Exception("Failed to insert participant")

        # 6) Return response to client
        if disqualified:
            return {
                "participant_id": participant_id,
                "ineligible": True,
                "reason": "Participant did not meet eligibility criteria",
                "condition": None,
                "condition_order": []
            }

        return {
            "participant_id": participant_id,
            "session_token": session_token,
            "condition": condition,
            "condition_order": order,
            "ineligible": False
        }

    except Exception:
        logger.exception("🛑 Error assigning condition")
        raise HTTPException(status_code=500, detail="Internal error assigning condition")


# ---------- Submit endpoint ----------
@app.post("/submit")
async def submit_data(data: SubmissionData):
    """
    - Verifies participant_id + session_token
    - Prevents duplicate Responses for same participant
    - Inserts Responses and marks participant status as 'completed'
    """
    pid = data.participant_id
    token = data.session_token
    answers = data.answers

    try:
        # 1) Verify participant + token
        query = supabase.table("Participants") \
            .select("id", "status") \
            .eq("id", pid) \
            .eq("session_token", token) \
            .execute()

        if not query.data:
            logger.warning("Invalid token or participant: %s", pid)
            raise HTTPException(status_code=401, detail="Invalid session token")

        # 2) Prevent duplicate responses
        exists = supabase.table("Responses") \
            .select("id") \
            .eq("participant_id", pid) \
            .execute()
        if exists.data:
            logger.warning("Duplicate submission attempt for participant: %s", pid)
            raise HTTPException(status_code=409, detail="Submission already exists")

        # 3) Insert response
        resp = supabase.table("Responses").insert({
            "participant_id": pid,
            "answers": answers,
            "submitted_at": datetime.utcnow().isoformat() + "Z"
        }).execute()
        if not resp.data:
            logger.exception("Failed to insert response for %s", pid)
            raise Exception("Failed to insert response")

        # 4) Update participant status -> completed
        update = supabase.table("Participants").update({
            "status": "completed"
        }).eq("id", pid).execute()
        if not update.data:
            logger.exception("Failed to update participant status to completed for %s", pid)
            raise Exception("Failed to update status")

        return {"success": True}

    except HTTPException:
        raise
    except Exception:
        logger.exception("🛑 Submission error")
        raise HTTPException(status_code=500, detail="Error submitting data")
