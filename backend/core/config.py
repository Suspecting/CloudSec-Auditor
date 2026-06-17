from datetime import timezone, timedelta
from pathlib import Path

APP_NAME = "CloudSec Auditor"
APP_VERSION = "0.1.0"
APP_DESCRIPTION = "Backend API for CloudSec Auditor Desktop"

SCAN_MODE = "mock"
SCAN_TARGET = "demo-aws-account"
REAL_AWS_MODE_STATUS = "planned"

API_BASE_URL = "http://127.0.0.1:8000"

PROJECT_ROOT = Path(__file__).resolve().parents[2]
REPORTS_DIR = PROJECT_ROOT / "reports"

IST = timezone(timedelta(hours=5, minutes=30), name="IST")

ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
