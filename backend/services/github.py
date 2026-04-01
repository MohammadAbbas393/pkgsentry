import os
import requests
from typing import Optional
import jwt
import time

def get_installation_token(installation_id: int) -> str:
    """Generate a GitHub App installation access token."""
    app_id = os.environ["GITHUB_APP_ID"]
    private_key = os.environ["GITHUB_PRIVATE_KEY"].replace("\\n", "\n")

    now = int(time.time())
    payload = {"iat": now - 60, "exp": now + 600, "iss": app_id}
    app_jwt = jwt.encode(payload, private_key, algorithm="RS256")

    res = requests.post(
        f"https://api.github.com/app/installations/{installation_id}/access_tokens",
        headers={
            "Authorization": f"Bearer {app_jwt}",
            "Accept": "application/vnd.github+json",
        },
        timeout=10,
    )
    res.raise_for_status()
    return res.json()["token"]

def get_file_content(token: str, repo_full_name: str, path: str, ref: Optional[str] = None) -> Optional[str]:
    """Fetch a file from a GitHub repo."""
    url = f"https://api.github.com/repos/{repo_full_name}/contents/{path}"
    params = {}
    if ref:
        params["ref"] = ref
    res = requests.get(
        url,
        headers={"Authorization": f"Bearer {token}", "Accept": "application/vnd.github+json"},
        params=params,
        timeout=10,
    )
    if not res.ok:
        return None
    data = res.json()
    if data.get("encoding") == "base64":
        import base64
        return base64.b64decode(data["content"]).decode("utf-8", errors="ignore")
    return data.get("content")

MANIFEST_FILES = ["package.json", "requirements.txt", "go.sum", "Cargo.lock", "pom.xml"]

def fetch_manifests(token: str, repo_full_name: str, ref: Optional[str] = None) -> dict[str, str]:
    """Fetch all dependency manifest files from a repo."""
    manifests = {}
    for filename in MANIFEST_FILES:
        content = get_file_content(token, repo_full_name, filename, ref)
        if content:
            manifests[filename] = content
    return manifests
