import os
from dataclasses import dataclass, field
from datetime import timezone, timedelta
from pathlib import Path


def get_csv_env(name: str, default: str) -> tuple[str, ...]:
    """
    Reads comma-separated environment variables safely.
    Example:
    CLOUDSEC_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
    """

    value = os.getenv(name, default)
    return tuple(item.strip() for item in value.split(",") if item.strip())


@dataclass(frozen=True)
class Settings:
    """
    Central application configuration for CloudSec Auditor.

    This keeps app settings in one place and allows future production-style
    overrides through environment variables without changing code.
    """

    app_name: str = os.getenv("CLOUDSEC_APP_NAME", "CloudSec Auditor")
    app_version: str = os.getenv("CLOUDSEC_APP_VERSION", "0.1.0")
    app_description: str = os.getenv(
        "CLOUDSEC_APP_DESCRIPTION",
        "Backend API for CloudSec Auditor Desktop",
    )

    scan_mode: str = os.getenv("CLOUDSEC_SCAN_MODE", "mock")
    scan_target: str = os.getenv("CLOUDSEC_SCAN_TARGET", "demo-aws-account")
    real_aws_mode_status: str = os.getenv("CLOUDSEC_REAL_AWS_MODE", "planned")

    api_base_url: str = os.getenv("CLOUDSEC_API_BASE_URL", "http://127.0.0.1:8000")

    project_root: Path = field(
        default_factory=lambda: Path(__file__).resolve().parents[2]
    )

    allowed_origins: tuple[str, ...] = field(
        default_factory=lambda: get_csv_env(
            "CLOUDSEC_ALLOWED_ORIGINS",
            "http://localhost:5173,http://127.0.0.1:5173",
        )
    )

    ist_timezone: timezone = field(
        default_factory=lambda: timezone(timedelta(hours=5, minutes=30), name="IST")
    )

    @property
    def reports_dir(self) -> Path:
        """
        Returns the reports directory path.
        """

        return self.project_root / "reports"


settings = Settings()
