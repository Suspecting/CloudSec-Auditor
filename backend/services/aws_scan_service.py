from datetime import datetime, timezone

from cloudsec.iam_checks import run_iam_security_checks
from cloudsec.risk_score import calculate_summary
from services.aws_session_service import create_aws_session, get_safe_profile_identity


def run_aws_scan_skeleton(profile_name: str) -> dict:
    """
    Runs real AWS read-only scan foundation.

    Current checks:
    - validates selected AWS CLI profile
    - confirms STS identity works
    - runs real IAM read-only checks

    Security note:
    This function never exposes AWS access keys, secret keys, session tokens,
    or raw credential values.
    """

    identity = get_safe_profile_identity(profile_name)
    session = create_aws_session(profile_name)

    findings = []
    findings.extend(run_iam_security_checks(session))

    summary = calculate_summary(findings)

    return {
        "tool": "CloudSec Auditor",
        "mode": "aws-read-only",
        "scan_target": profile_name,
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "aws_identity": {
            "profile": identity["profile"],
            "account_id_masked": identity["account_id_masked"],
            "arn_preview": identity["arn_preview"],
            "credential_values_exposed": False,
            "safe_for_read_only_scan": True,
        },
        "summary": summary,
        "findings": findings,
        "message": "AWS read-only IAM checks completed successfully.",
    }
