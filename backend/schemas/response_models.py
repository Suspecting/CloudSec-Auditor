from typing import Any, Optional

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


class ErrorResponse(BaseModel):
    status: str
    error_type: str
    message: str
    path: str
    details: Optional[list[dict[str, Any]]] = None


class AwsProfilesResponse(BaseModel):
    status: str
    profiles: list[str]
    count: int
    credential_values_exposed: bool


class AwsProfileValidationResponse(BaseModel):
    status: str
    profile: str
    valid: bool
    account_id_masked: str | None = None
    arn_preview: str | None = None
    user_id_preview: str | None = None
    credential_values_exposed: bool
    safe_for_read_only_scan: bool
    message: str | None = None
