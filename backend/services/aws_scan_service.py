from datetime import datetime, timezone

from cloudsec.risk_score import calculate_summary
from services.aws_session_service import get_safe_profile_identity


def run_aws_scan_skeleton(profile_name: str) -> dict:
    """
    Runs the safe foundation for real AWS read-only scanning.

    Current behavior:
    - validates the selected AWS CLI profile
    - confirms STS identity works
    - returns scan metadata
    - returns empty findings until real IAM/S3/EC2/CloudTrail checks are added

    Security note:
    This function never exposes AWS access keys, secret keys, session tokens,
    or raw credential values.
    """

    identity = get_safe_profile_identity(profile_name)

    findings = []
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
        "message": "AWS read-only scan foundation is working. Real service checks will be added next.",
    }
