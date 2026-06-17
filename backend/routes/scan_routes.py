from datetime import datetime, timezone

from fastapi import APIRouter

from cloudsec.mock_data import get_mock_findings
from cloudsec.risk_score import calculate_summary
from core.config import settings
from schemas.response_models import ScanResponse

router = APIRouter()


@router.get("/api/scan/mock", response_model=ScanResponse)
def run_mock_scan():
    """
    Runs a mock AWS security scan.

    This endpoint does not connect to AWS.
    It returns safe demo findings for frontend development and screenshots.
    """

    findings = get_mock_findings()
    summary = calculate_summary(findings)

    return {
        "tool": settings.app_name,
        "mode": settings.scan_mode,
        "scan_target": settings.scan_target,
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "summary": summary,
        "findings": findings,
    }
