from botocore.exceptions import ClientError


def build_cloudtrail_finding(
    finding_id: str,
    check: str,
    severity: str,
    status: str,
    resource: str,
    region: str,
    evidence: str,
    remediation: str,
) -> dict:
    return {
        "id": finding_id,
        "service": "CloudTrail",
        "check": check,
        "severity": severity,
        "status": status,
        "resource": resource,
        "region": region,
        "evidence": evidence,
        "remediation": remediation,
        "category": "Audit Visibility",
    }


def build_cloudtrail_error_finding(
    finding_id: str,
    check: str,
    region: str,
    error: ClientError,
) -> dict:
    error_code = error.response.get("Error", {}).get("Code", "UnknownError")

    return build_cloudtrail_finding(
        finding_id=finding_id,
        check=check,
        severity="Low",
        status="Failed",
        resource="cloudtrail-readonly-api",
        region=region,
        evidence=f"CloudTrail read-only API check could not complete. Error code: {error_code}.",
        remediation="Verify the AWS profile has SecurityAudit or equivalent read-only CloudTrail permissions.",
    )


def get_scan_region(session) -> str:
    return session.region_name or "ap-south-1"


def check_cloudtrail_trails(session) -> list[dict]:
    region = get_scan_region(session)
    client = session.client("cloudtrail", region_name=region)

    try:
        response = client.describe_trails(includeShadowTrails=True)
        trails = response.get("trailList", [])

        if not trails:
            return [
                build_cloudtrail_finding(
                    finding_id="CT-REAL-001",
                    check="CloudTrail trail configured",
                    severity="High",
                    status="Failed",
                    resource="cloudtrail",
                    region=region,
                    evidence="No CloudTrail trails were found in this AWS account.",
                    remediation="Create a multi-region CloudTrail trail to capture management events across the account.",
                )
            ]

        findings = []

        multi_region_trails = [
            trail for trail in trails if trail.get("IsMultiRegionTrail") is True
        ]

        if multi_region_trails:
            findings.append(
                build_cloudtrail_finding(
                    finding_id="CT-REAL-001",
                    check="CloudTrail multi-region trail configured",
                    severity="Info",
                    status="Passed",
                    resource=multi_region_trails[0].get("Name", "cloudtrail"),
                    region=region,
                    evidence=f"At least one multi-region CloudTrail trail is configured. Trails found: {len(trails)}.",
                    remediation="Continue using a multi-region CloudTrail trail for account-wide audit visibility.",
                )
            )
        else:
            findings.append(
                build_cloudtrail_finding(
                    finding_id="CT-REAL-001",
                    check="CloudTrail multi-region trail configured",
                    severity="Medium",
                    status="Failed",
                    resource="cloudtrail",
                    region=region,
                    evidence=f"CloudTrail trails exist, but no multi-region trail was detected. Trails found: {len(trails)}.",
                    remediation="Enable a multi-region CloudTrail trail to capture activity across all enabled regions.",
                )
            )

        active_logging_count = 0

        for trail in trails:
            trail_name = trail.get("TrailARN") or trail.get("Name")

            if not trail_name:
                continue

            try:
                status = client.get_trail_status(Name=trail_name)

                if status.get("IsLogging") is True:
                    active_logging_count += 1

            except ClientError:
                continue

        if active_logging_count > 0:
            findings.append(
                build_cloudtrail_finding(
                    finding_id="CT-REAL-002",
                    check="CloudTrail logging enabled",
                    severity="Info",
                    status="Passed",
                    resource="cloudtrail",
                    region=region,
                    evidence=f"{active_logging_count} CloudTrail trail(s) are actively logging.",
                    remediation="Continue monitoring CloudTrail delivery and retention.",
                )
            )
        else:
            findings.append(
                build_cloudtrail_finding(
                    finding_id="CT-REAL-002",
                    check="CloudTrail logging enabled",
                    severity="High",
                    status="Failed",
                    resource="cloudtrail",
                    region=region,
                    evidence="CloudTrail trails were found, but none appear to be actively logging.",
                    remediation="Start CloudTrail logging and verify trail delivery to S3/CloudWatch Logs.",
                )
            )

        return findings

    except ClientError as error:
        return [
            build_cloudtrail_error_finding(
                finding_id="CT-REAL-000",
                check="CloudTrail trail visibility",
                region=region,
                error=error,
            )
        ]


def run_cloudtrail_security_checks(session) -> list[dict]:
    return check_cloudtrail_trails(session)
