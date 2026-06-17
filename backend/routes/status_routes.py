from datetime import datetime, timezone

from fastapi import APIRouter

from core.config import settings

router = APIRouter()


def count_generated_reports():
    """
    Counts generated CloudSec report files in the reports folder.
    """

    if not settings.reports_dir.exists():
        return 0

    report_files = list(settings.reports_dir.glob("cloudsec_report_*.*"))

    return len(report_files)


@router.get("/")
def root():
    return {
        "app": settings.app_name,
        "type": "AWS Security Misconfiguration Scanner",
        "status": "running",
        "version": settings.app_version,
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

    reports_available = settings.reports_dir.exists()

    return {
        "app": settings.app_name,
        "version": settings.app_version,
        "mode": settings.scan_mode,
        "api": "online",
        "reports_folder": "available" if reports_available else "missing",
        "generated_reports": count_generated_reports(),
        "scan_engine": settings.scan_mode,
        "real_aws_mode": settings.real_aws_mode_status,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
