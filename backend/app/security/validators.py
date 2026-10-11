import re
from typing import Tuple
from fastapi import HTTPException, UploadFile
from app.config import settings

# Prompt injection patterns commonly used to attack RAG / LLM systems
SUSPICIOUS_PATTERNS = [
    r"ignore\s+(all\s+)?(previous|above|system)\s+instructions",
    r"disregard\s+(all\s+)?(previous|above|system)\s+instructions",
    r"system\s*override",
    r"you\s+are\s+now\s+dan",
    r"jailbreak",
    r"pretend\s+you\s+are\s+not\s+a\s+legal\s+assistant",
    r"delete\s+all\s+databases",
    r"drop\s+table",
    r"<\s*script[^>]*>",
]

EXECUTABLE_SIGNATURES = [
    b"MZ",          # Windows PE Executable / DLL
    b"\x7fELF",     # Linux ELF Executable
    b"\xca\xfe\xba\xbe", # Java Class
    b"PK\x03\x04",  # ZIP archive (if disguised as pdf)
]

def sanitize_and_check_prompt_injection(text: str) -> Tuple[bool, str]:
    """
    Scans text for prompt injection patterns.
    Returns (is_safe, detected_pattern_description).
    """
    for pattern in SUSPICIOUS_PATTERNS:
        if re.search(pattern, text, re.IGNORECASE):
            return False, f"Prompt injection attempt detected: matched '{pattern}'"
    return True, "Safe"

def validate_uploaded_file(file: UploadFile, content_bytes: bytes) -> None:
    """
    Validates file extension, size limit, and header magic bytes.
    Raises HTTPException 400 or 413 if invalid.
    """
    # 1. Size check
    max_bytes = settings.MAX_UPLOAD_FILE_SIZE_MB * 1024 * 1024
    if len(content_bytes) > max_bytes:
        raise HTTPException(
            status_code=413,
            detail=f"File exceeds maximum allowed size of {settings.MAX_UPLOAD_FILE_SIZE_MB}MB."
        )

    # 2. Extension check
    filename = (file.filename or "").lower()
    ext = filename.split(".")[-1] if "." in filename else ""
    if ext not in settings.allowed_extensions_list:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file extension '.{ext}'. Only PDF and TXT legal documents are permitted."
        )

    # 3. Header magic bytes check
    for sig in EXECUTABLE_SIGNATURES:
        if content_bytes.startswith(sig):
            if sig == b"PK\x03\x04" and ext == "pdf":
                raise HTTPException(status_code=400, detail="Disguised archive detected. Upload rejected.")
            elif sig in (b"MZ", b"\x7fELF", b"\xca\xfe\xba\xbe"):
                raise HTTPException(status_code=400, detail="Executable binary detected. Upload rejected.")

    # 4. Content sanity check
    if ext == "pdf":
        if not content_bytes.startswith(b"%PDF-"):
            raise HTTPException(status_code=400, detail="Invalid PDF format: Missing %PDF- signature.")
    elif ext == "txt":
        try:
            content_bytes.decode("utf-8")
        except UnicodeDecodeError:
            try:
                content_bytes.decode("latin-1")
            except Exception:
                raise HTTPException(status_code=400, detail="Unable to decode text document encoding.")

def redact_secrets(text: str) -> str:
    """Masks potential API keys and tokens in output/logs."""
    if not text:
        return ""
    # Redact OpenAI, Gemini, or Telegram bot token patterns
    text = re.sub(r"sk-[a-zA-Z0-9_-]{20,}", "sk-[REDACTED]", text)
    text = re.sub(r"AIza[a-zA-Z0-9_-]{30,}", "AIza[REDACTED]", text)
    text = re.sub(r"\d{9,11}:[a-zA-Z0-9_-]{30,}", "[BOT_TOKEN_REDACTED]", text)
    return text

