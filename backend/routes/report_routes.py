from datetime import datetime, timezone
from pathlib import Path

from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse

from cloudsec.mock_data import get_mock_findings
from cloudsec.risk_score import calculate_summary
from cloudsec.report_generator import generate_all_reports
from core.config import settings
from schemas.response_models import GenerateReportsResponse, LatestReportsResponse
from services.aws_scan_service import run_aws_scan_skeleton

router = APIRouter()


def format_report_time(report_file: Path):
    """
    Formats latest report modified time in IST for frontend display.
    """

    modified_at = datetime.fromtimestamp(
        report_file.stat().st_mtime,
        tz=settings.ist_timezone,
    )
    return modified_at.strftime("%d %b %Y, %I:%M:%S %p IST")


def get_latest_report_file(report_type: str):
    """
    Finds the latest generated report file based on report type.
    """

    report_map = {
        "html": "html",
        "json": "json",
        "markdown": "md",
    }

    if report_type not in report_map:
        raise HTTPException(
            status_code=400,
            detail="Invalid report type. Use html, json, or markdown.",
        )

    extension = report_map[report_type]

    if not settings.reports_dir.exists():
        raise HTTPException(
            status_code=404,
            detail="Reports folder does not exist. Generate a report first.",
        )

    report_files = sorted(
        settings.reports_dir.glob(f"cloudsec_report_*.{extension}"),
        key=lambda file: file.stat().st_mtime,
        reverse=True,
    )

    if not report_files:
        raise HTTPException(
            status_code=404,
            detail=f"No {report_type} report found. Generate a report first.",
        )

    return report_files[0]


@router.get("/api/reports/generate/mock", response_model=GenerateReportsResponse)
def generate_mock_reports():
    """
    Generates JSON, HTML, and Markdown reports from mock scan data.
    """

    findings = get_mock_findings()
    summary = calculate_summary(findings)

    report_data = {
        "tool": settings.app_name,
        "mode": settings.scan_mode,
        "scan_target": settings.scan_target,
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "summary": summary,
        "findings": findings,
    }

    report_paths = generate_all_reports(report_data)

    return {
        "status": "success",
        "message": "Reports generated successfully",
        "reports": report_paths,
    }



@router.get("/api/reports/generate/aws/{profile_name}", response_model=GenerateReportsResponse)
def generate_aws_reports(profile_name: str):
    """
    Generates JSON, HTML, and Markdown reports from a real AWS read-only scan.

    Security note:
    The scan result uses masked AWS identity metadata and never includes access keys,
    secret keys, or session tokens.
    """

    report_data = run_aws_scan_skeleton(profile_name)
    report_paths = generate_all_reports(report_data)

    return {
        "status": "success",
        "message": "Real AWS read-only reports generated successfully",
        "reports": report_paths,
    }


@router.get("/api/reports/latest", response_model=LatestReportsResponse)
def get_latest_reports():
    """
    Returns latest generated report filenames, access URLs, and export time.
    """

    latest_html = get_latest_report_file("html")
    latest_json = get_latest_report_file("json")
    latest_markdown = get_latest_report_file("markdown")

    exported_at = format_report_time(latest_html)

    return {
        "status": "success",
        "reports": {
            "exported_at": exported_at,
            "html": {
                "filename": latest_html.name,
                "url": f"{settings.api_base_url}/api/reports/latest/html",
            },
            "json": {
                "filename": latest_json.name,
                "url": f"{settings.api_base_url}/api/reports/latest/json",
            },
            "markdown": {
                "filename": latest_markdown.name,
                "url": f"{settings.api_base_url}/api/reports/latest/markdown",
            },
        },
    }


@router.get("/api/reports/latest/{report_type}")
def open_latest_report(report_type: str):
    """
    Opens or downloads the latest report file.
    HTML opens in browser.
    JSON and Markdown can be downloaded/viewed.
    """

    report_file = get_latest_report_file(report_type)

    media_types = {
        "html": "text/html",
        "json": "application/json",
        "markdown": "text/markdown",
    }

    if report_type == "html":
        return FileResponse(
            path=report_file,
            media_type="text/html",
            headers={"Content-Disposition": f'inline; filename="{report_file.name}"'},
        )

    return FileResponse(
        path=report_file,
        media_type=media_types[report_type],
        filename=report_file.name,
    )
