from typing import Any

from pydantic import BaseModel


class RootResponse(BaseModel):
    app: str
    type: str
    status: str
    version: str


class HealthResponse(BaseModel):
    status: str
    message: str


class ApiStatusResponse(BaseModel):
    app: str
    version: str
    mode: str
    api: str
    reports_folder: str
    generated_reports: int
    scan_engine: str
    real_aws_mode: str
    timestamp: str


class ScanResponse(BaseModel):
    tool: str
    mode: str
    scan_target: str
    generated_at: str
    summary: dict[str, Any]
    findings: list[dict[str, Any]]


class GenerateReportsResponse(BaseModel):
    status: str
    message: str
    reports: dict[str, str]


class LatestReportsResponse(BaseModel):
    status: str
    reports: dict[str, Any]
