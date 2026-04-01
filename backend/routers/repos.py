from fastapi import APIRouter, HTTPException
from database import get_db
import hmac
import hashlib
import os
from pydantic import BaseModel

router = APIRouter()

class GitHubWebhookPayload(BaseModel):
    installation: dict | None = None
    repositories_added: list | None = None
    repositories_removed: list | None = None
    action: str | None = None

@router.post("/webhooks/github")
async def github_webhook(payload: dict, signature: str | None = None):
    """Handle GitHub App webhook events."""
    db = get_db()
    action = payload.get("action")
    event_installation = payload.get("installation", {})
    installation_id = event_installation.get("id")

    # Handle app installation
    if action == "created" and "installation" in payload:
        account = event_installation.get("account", {})
        repos = payload.get("repositories", [])

        # Find user by GitHub account — they went through our OAuth flow
        # The user_id is stored in the installation record after OAuth
        # For now, store installation with account info
        for repo in repos:
            pass  # Repos are added via the callback route

    # Handle repo additions/removals
    if action in ("added", "removed"):
        sender = payload.get("sender", {})
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
