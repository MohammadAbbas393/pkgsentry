import requests
import json
from typing import Optional

OSV_URL = "https://api.osv.dev/v1"

ECOSYSTEMS = {
    "package.json": "npm",
    "requirements.txt": "PyPI",
    "go.sum": "Go",
    "Cargo.lock": "crates.io",
    "pom.xml": "Maven",
    "Gemfile.lock": "RubyGems",
}

ABANDONED_DAYS = 365 * 2  # 2 years no commit = abandoned

def query_osv(package: str, version: str, ecosystem: str) -> list[dict]:
    """Query OSV.dev for vulnerabilities for a package@version."""
    try:
        res = requests.post(
            f"{OSV_URL}/query",
            json={"version": version, "package": {"name": package, "ecosystem": ecosystem}},
            timeout=10,
        )
        if not res.ok:
            return []
        data = res.json()
        return data.get("vulns", [])
    except Exception:
        return []

def parse_severity(vuln: dict) -> str:
    """Extract severity from OSV vuln data."""
    severity = "LOW"
    for s in vuln.get("severity", []):
        score = s.get("score", "")
        if "CRITICAL" in score or (score and float(score.split("/")[0]) >= 9.0 if "/" in score else False):
            return "CRITICAL"
        elif "HIGH" in score:
            severity = "HIGH"
        elif "MEDIUM" in score and severity == "LOW":
            severity = "MEDIUM"
    # Also check database_specific
    for aff in vuln.get("affected", []):
        for sev in aff.get("ecosystem_specific", {}).get("severity", []):
            s = str(sev).upper()
            if "CRITICAL" in s:
                return "CRITICAL"
            elif "HIGH" in s and severity in ("LOW", "MEDIUM"):
                severity = "HIGH"
    return severity

def parse_npm_packages(content: str) -> dict[str, str]:
    """Parse package.json for dependencies."""
    try:
        data = json.loads(content)
        deps = {}
        for section in ("dependencies", "devDependencies"):
            for name, ver in data.get(section, {}).items():
                # Strip range specifiers
                clean = ver.lstrip("^~>=<").split(" ")[0].split("-")[0]
                deps[name] = clean
        return deps
    except Exception:
        return {}

def parse_requirements_txt(content: str) -> dict[str, str]:
    """Parse requirements.txt for packages."""
    deps = {}
    for line in content.splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        for sep in ("==", ">=", "<=", "~=", "!="):
            if sep in line:
                name, ver = line.split(sep, 1)
                deps[name.strip()] = ver.strip().split(",")[0]
                break
    return deps

def scan_packages(packages: dict[str, str], ecosystem: str) -> list[dict]:
    """Scan a dict of {package: version} against OSV."""
    results = []
    for pkg, ver in packages.items():
        vulns = query_osv(pkg, ver, ecosystem)
        for v in vulns:
            aliases = v.get("aliases", [])
            cve_id = next((a for a in aliases if a.startswith("CVE-")), v.get("id"))

            # Get fix version if available
            fix_ver = None
            for aff in v.get("affected", []):
                for rng in aff.get("ranges", []):
                    for evt in rng.get("events", []):
                        if "fixed" in evt:
                            fix_ver = evt["fixed"]
                            break

            results.append({
                "package": pkg,
                "version": ver,
                "severity": parse_severity(v),
                "description": v.get("summary", v.get("details", "No description"))[:300],
                "cve_id": cve_id,
                "fix_version": fix_ver,
            })
    return results
