from fastapi import APIRouter, HTTPException
from database import get_db
from pydantic import BaseModel
from typing import Optional, List

router = APIRouter()

class GitHubWebhookPayload(BaseModel):
    installation: Optional[dict] = None
    repositories_added: Optional[List] = None
    repositories_removed: Optional[List] = None
    action: Optional[str] = None

@router.post("/webhooks/github")
async def github_webhook(payload: dict):
    """Handle GitHub App webhook events."""
    db = get_db()
    action = payload.get("action")
    event_installation = payload.get("installation", {})
    installation_id = event_installation.get("id")

    if action in ("added", "removed"):
        added = payload.get("repositories_added", [])
        removed = payload.get("repositories_removed", [])

        for repo in added:
            db.table("repositories").upsert({
                "installation_id": installation_id,
                "github_repo_id": repo["id"],
                "full_name": repo["full_name"],
                "enabled": True,
            }, on_conflict="github_repo_id").execute()

        for repo in removed:
            db.table("repositories").delete().eq("github_repo_id", repo["id"]).execute()

    return {"ok": True}

@router.get("/repos/{user_id}")
async def get_repos(user_id: str):
    db = get_db()
    res = db.table("repositories").select("*").eq("user_id", user_id).execute()
    return res.data
