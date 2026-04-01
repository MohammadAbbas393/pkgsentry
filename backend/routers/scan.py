from fastapi import APIRouter, HTTPException, BackgroundTasks
from database import get_db
from models import ScanRequest
from services import github as gh_service
from services import scanner as scan_service
from services import ai as ai_service
import os

router = APIRouter()

@router.post("/scan")
async def trigger_scan(req: ScanRequest, background_tasks: BackgroundTasks):
    db = get_db()

    # Get repo info
    repo_res = db.table("repositories").select("*").eq("id", req.repo_id).single().execute()
    if not repo_res.data:
        raise HTTPException(404, "Repository not found")

    repo = repo_res.data
    installation_id = repo["installation_id"]
    full_name = repo["full_name"]
    user_id = repo["user_id"]

    # Create scan record
    scan_res = db.table("scans").insert({
        "repo_id": req.repo_id,
        "user_id": user_id,
        "status": "running",
        "triggered_by": req.triggered_by,
        "commit_sha": req.commit_sha,
    }).execute()

    scan_id = scan_res.data[0]["id"]

    # Run scan in background
    background_tasks.add_task(run_scan, scan_id, installation_id, full_name, req.commit_sha)

    return {"scan_id": scan_id, "status": "running"}

async def run_scan(scan_id: str, installation_id: int, full_name: str, ref: str | None):
    db = get_db()
    try:
        # Get GitHub token
        token = gh_service.get_installation_token(installation_id)

        # Fetch manifest files
        manifests = gh_service.fetch_manifests(token, full_name, ref)

        all_vulns = []

        # Scan each manifest
        for filename, content in manifests.items():
            ecosystem = scan_service.ECOSYSTEMS.get(filename)
            if not ecosystem:
                continue

            if filename == "package.json":
                packages = scan_service.parse_npm_packages(content)
            elif filename == "requirements.txt":
                packages = scan_service.parse_requirements_txt(content)
            else:
                continue  # TODO: add parsers for Go, Rust, etc.

            vulns = scan_service.scan_packages(packages, ecosystem)
            all_vulns.extend(vulns)

        # AI summaries for critical/high only (to save quota)
        for v in all_vulns:
            if v["severity"] in ("CRITICAL", "HIGH"):
                v["ai_summary"] = ai_service.summarize_vulnerability(
                    v["package"], v["version"], v["description"], v["severity"]
                )

        # Build summary
        summary = {"critical": 0, "high": 0, "medium": 0, "low": 0, "total": len(all_vulns)}
        for v in all_vulns:
            key = v["severity"].lower()
            if key in summary:
                summary[key] += 1

        db.table("scans").update({
            "status": "done",
            "results": {"vulnerabilities": all_vulns, "abandoned": [], "license_issues": []},
            "summary": summary,
        }).eq("id", scan_id).execute()

    except Exception as e:
        db.table("scans").update({"status": "failed"}).eq("id", scan_id).execute()

@router.get("/scan/{scan_id}")
async def get_scan(scan_id: str):
    db = get_db()
    res = db.table("scans").select("*").eq("id", scan_id).single().execute()
    if not res.data:
        raise HTTPException(404, "Scan not found")
    return res.data
