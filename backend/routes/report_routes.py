from datetime import datetime, timezone
from pathlib import Path

from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse

from cloudsec.mock_data import get_mock_findings
from cloudsec.risk_score import calculate_summary
from cloudsec.report_generator import generate_all_reports
from core.config import (
    API_BASE_URL,
    APP_NAME,
    IST,
    REPORTS_DIR,
    SCAN_MODE,
    SCAN_TARGET,
)

router = APIRouter()


def format_report_time(report_file: Path):
    """
    Formats latest report modified time in IST for frontend display.
    """

    modified_at = datetime.fromtimestamp(report_file.stat().st_mtime, tz=IST)
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

    if not REPORTS_DIR.exists():
        raise HTTPException(
            status_code=404,
            detail="Reports folder does not exist. Generate a report first.",
        )

    report_files = sorted(
        REPORTS_DIR.glob(f"cloudsec_report_*.{extension}"),
        key=lambda file: file.stat().st_mtime,
        reverse=True,
    )

    if not report_files:
        raise HTTPException(
            status_code=404,
            detail=f"No {report_type} report found. Generate a report first.",
        )

    return report_files[0]


@router.get("/api/reports/generate/mock")
def generate_mock_reports():
    """
    Generates JSON, HTML, and Markdown reports from mock scan data.
    """

    findings = get_mock_findings()
    summary = calculate_summary(findings)

    report_data = {
        "tool": APP_NAME,
        "mode": SCAN_MODE,
        "scan_target": SCAN_TARGET,
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


@router.get("/api/reports/latest")
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
                "url": f"{API_BASE_URL}/api/reports/latest/html",
            },
            "json": {
                "filename": latest_json.name,
                "url": f"{API_BASE_URL}/api/reports/latest/json",
            },
            "markdown": {
                "filename": latest_markdown.name,
                "url": f"{API_BASE_URL}/api/reports/latest/markdown",
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
