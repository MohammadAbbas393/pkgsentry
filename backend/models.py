from pydantic import BaseModel
from typing import Optional

class ScanRequest(BaseModel):
    repo_id: str
    triggered_by: str = "manual"
    commit_sha: Optional[str] = None

class ScanSummary(BaseModel):
    critical: int = 0
    high: int = 0
    medium: int = 0
    low: int = 0
    total: int = 0
    abandoned: int = 0
    license_issues: int = 0

class Vulnerability(BaseModel):
    package: str
    version: str
    severity: str
    description: str
    cve_id: Optional[str] = None
    fix_version: Optional[str] = None
    ai_summary: Optional[str] = None

class ScanResults(BaseModel):
    vulnerabilities: list[Vulnerability] = []
    abandoned: list[dict] = []
    license_issues: list[dict] = []
