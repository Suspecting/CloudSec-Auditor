from datetime import datetime, timezone, timedelta

from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from pathlib import Path
from typing import Any
from fastapi.middleware.cors import CORSMiddleware

from cloudsec.mock_data import get_mock_findings
from cloudsec.risk_score import calculate_summary
from cloudsec.report_generator import generate_all_reports

PROJECT_ROOT = Path(__file__).resolve().parents[1]
REPORTS_DIR = PROJECT_ROOT / "reports"


def count_generated_reports():
    """
    Counts generated CloudSec report files in the reports folder.
    """

    if not REPORTS_DIR.exists():
        return 0

    report_files = list(REPORTS_DIR.glob("cloudsec_report_*.*"))

    return len(report_files)


IST = timezone(timedelta(hours=5, minutes=30), name="IST")


def format_report_time(report_file: Path):
    """
    Formats latest report modified time in IST for frontend display.
    """
    modified_at = datetime.fromtimestamp(report_file.stat().st_mtime, tz=IST)
    return modified_at.strftime("%d %b %Y, %I:%M:%S %p IST")


app = FastAPI(
    title="CloudSec Auditor API",
    description="Backend API for CloudSec Auditor Desktop",
    version="0.1.0",
)

# CORS allows the React/Electron frontend to talk to this backend.
# Later, the desktop app will run locally and call this API.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


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


@app.get("/")
def root():
    return {
        "app": "CloudSec Auditor",
        "type": "AWS Security Misconfiguration Scanner",
        "status": "running",
        "version": "0.1.0",
    }


@app.get("/health")
def health_check():
    return {"status": "healthy", "message": "CloudSec Auditor backend is working"}


@app.get("/api/status")
def get_api_status():
    """
    Returns backend runtime status for the frontend dashboard.
    """

    reports_available = REPORTS_DIR.exists()

    return {
        "app": "CloudSec Auditor",
        "version": "0.1.0",
        "mode": "mock",
        "api": "online",
        "reports_folder": "available" if reports_available else "missing",
        "generated_reports": count_generated_reports(),
        "scan_engine": "mock",
        "real_aws_mode": "planned",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


@app.get("/api/scan/mock")
def run_mock_scan():
    """
    Runs a mock AWS security scan.

    This endpoint does not connect to AWS.
    It returns safe demo findings for frontend development and screenshots.
    """

    findings = get_mock_findings()
    summary = calculate_summary(findings)

    return {
        "tool": "CloudSec Auditor",
        "mode": "mock",
        "scan_target": "demo-aws-account",
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "summary": summary,
        "findings": findings,
    }


@app.get("/api/reports/generate/mock")
def generate_mock_reports():
    """
    Generates JSON, HTML, and Markdown reports from mock scan data.
    """

    findings = get_mock_findings()
    summary = calculate_summary(findings)

    report_data = {
        "tool": "CloudSec Auditor",
        "mode": "mock",
        "scan_target": "demo-aws-account",
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


@app.get("/api/reports/latest")
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
                "url": "http://127.0.0.1:8000/api/reports/latest/html",
            },
            "json": {
                "filename": latest_json.name,
                "url": "http://127.0.0.1:8000/api/reports/latest/json",
            },
            "markdown": {
                "filename": latest_markdown.name,
                "url": "http://127.0.0.1:8000/api/reports/latest/markdown",
            },
        },
    }


@app.get("/api/reports/latest/{report_type}")
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
