from datetime import datetime, timezone

from fastapi import APIRouter

from core.config import (
    APP_NAME,
    APP_VERSION,
    REPORTS_DIR,
    SCAN_MODE,
    REAL_AWS_MODE_STATUS,
)

router = APIRouter()


def count_generated_reports():
    """
    Counts generated CloudSec report files in the reports folder.
    """

    if not REPORTS_DIR.exists():
        return 0

    report_files = list(REPORTS_DIR.glob("cloudsec_report_*.*"))

    return len(report_files)


@router.get("/")
def root():
    return {
        "app": APP_NAME,
        "type": "AWS Security Misconfiguration Scanner",
        "status": "running",
        "version": APP_VERSION,
    }


@router.get("/health")
def health_check():
    return {
        "status": "healthy",
        "message": "CloudSec Auditor backend is working",
    }


@router.get("/api/status")
def get_api_status():
    """
    Returns backend runtime status for the frontend dashboard.
    """

    reports_available = REPORTS_DIR.exists()

    return {
        "app": APP_NAME,
        "version": APP_VERSION,
        "mode": SCAN_MODE,
        "api": "online",
        "reports_folder": "available" if reports_available else "missing",
        "generated_reports": count_generated_reports(),
        "scan_engine": SCAN_MODE,
        "real_aws_mode": REAL_AWS_MODE_STATUS,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
