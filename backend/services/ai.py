import os
from groq import Groq

_client: Groq | None = None

def get_client() -> Groq:
    global _client
    if _client is None:
        _client = Groq(api_key=os.environ["GROQ_API_KEY"])
    return _client

def summarize_vulnerability(package: str, version: str, description: str, severity: str) -> str:
    """Generate a plain-English AI summary of a vulnerability."""
    try:
        client = get_client()
        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{
                "role": "user",
                "content": (
                    f"Explain this security vulnerability in 1-2 sentences for a developer:\n"
                    f"Package: {package}@{version}\nSeverity: {severity}\nDescription: {description}"
                ),
            }],
            max_tokens=150,
            temperature=0.3,
        )
        return completion.choices[0].message.content.strip()
    except Exception:
        return ""
