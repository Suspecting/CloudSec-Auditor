#!/usr/bin/env python3
import json
import os
import sys
from urllib.error import HTTPError, URLError
from urllib.request import urlopen


BASE_URL = os.getenv("CLOUDSEC_API_URL", "http://127.0.0.1:8000")
PROFILE = os.getenv(
    "CLOUDSEC_AWS_PROFILE",
    sys.argv[1] if len(sys.argv) > 1 else "cloudsec-auditor",
)


def get_json(path: str) -> dict:
    url = f"{BASE_URL}{path}"

    try:
        with urlopen(url, timeout=90) as response:
            body = response.read().decode("utf-8")
            return json.loads(body)

    except HTTPError as error:
        body = error.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"HTTP {error.code} for {path}: {body}") from error

    except URLError as error:
        raise RuntimeError(
            f"Could not reach backend at {BASE_URL}. Start FastAPI first."
        ) from error


def assert_true(condition: bool, message: str):
    if not condition:
        raise AssertionError(message)


def main():
    print("CloudSec Auditor Real AWS Smoke Test")
    print(f"Backend: {BASE_URL}")
    print(f"Profile: {PROFILE}")
    print("-" * 60)

    status = get_json("/api/status")
    assert_true(isinstance(status, dict), "Backend status response is invalid")
    print("Backend status: OK")

    profiles = get_json("/api/aws/profiles")
    profile_names = profiles.get("profiles", [])

    assert_true(PROFILE in profile_names, f"AWS profile '{PROFILE}' not found")
    assert_true(
        profiles.get("credential_values_exposed") is False,
        "Profile endpoint exposed credential values",
    )

    print(f"AWS profile discovery: OK ({len(profile_names)} profile(s), credentials hidden)")

    validation = get_json(f"/api/aws/profiles/{PROFILE}/validate")

    assert_true(validation.get("valid") is True, "AWS profile validation failed")
    assert_true(
        validation.get("credential_values_exposed") is False,
        "Validation endpoint exposed credential values",
    )
    assert_true(
        validation.get("safe_for_read_only_scan") is True,
        "Profile is not marked safe for read-only scanning",
    )

    print("AWS profile validation: OK")

    scan = get_json(f"/api/scan/aws/{PROFILE}")
    summary = scan.get("summary", {})
    identity = scan.get("aws_identity", {})

    assert_true(scan.get("mode") == "aws-read-only", "Scan mode is not aws-read-only")
    assert_true(
        identity.get("credential_values_exposed") is False,
        "Scan response exposed credential values",
    )
    assert_true(isinstance(scan.get("findings"), list), "Findings field is not a list")
    assert_true(summary.get("total_checks", 0) > 0, "No checks were executed")

    print("AWS read-only scan: OK")
    print(
        "Summary:",
        f"total={summary.get('total_checks')}",
        f"passed={summary.get('passed')}",
        f"failed={summary.get('failed')}",
        f"critical={summary.get('critical')}",
        f"high={summary.get('high')}",
        f"medium={summary.get('medium')}",
        f"risk={summary.get('risk_score')}",
    )

    reports = get_json(f"/api/reports/generate/aws/{PROFILE}")

    assert_true(reports.get("status") == "success", "AWS report generation failed")
    assert_true("reports" in reports, "Report response missing reports object")

    report_files = reports.get("reports", {})
    assert_true("json" in report_files, "JSON report missing")
    assert_true("html" in report_files, "HTML report missing")
    assert_true("markdown" in report_files, "Markdown report missing")

    print("AWS report generation: OK")

    latest = get_json("/api/reports/latest")

    assert_true(latest.get("status") == "success", "Latest report lookup failed")

    print("Latest report lookup: OK")
    print("-" * 60)
    print("Smoke test passed. No credential values were printed.")


if __name__ == "__main__":
    try:
        main()
    except Exception as error:
        print(f"Smoke test failed: {error}", file=sys.stderr)
        sys.exit(1)
