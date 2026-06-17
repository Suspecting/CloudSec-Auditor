from botocore.exceptions import ClientError


def build_s3_finding(
    finding_id: str,
    check: str,
    severity: str,
    status: str,
    resource: str,
    region: str,
    evidence: str,
    remediation: str,
) -> dict:
    """
    Builds a standardized S3 finding.
    """

    return {
        "id": finding_id,
        "service": "S3",
        "check": check,
        "severity": severity,
        "status": status,
        "resource": resource,
        "region": region,
        "evidence": evidence,
        "remediation": remediation,
        "category": "Storage Security",
    }


def build_s3_error_finding(finding_id: str, check: str, error: ClientError) -> dict:
    """
    Builds a safe finding when an S3 read-only check cannot complete.
    """

    error_code = error.response.get("Error", {}).get("Code", "UnknownError")

    return build_s3_finding(
        finding_id=finding_id,
        check=check,
        severity="Low",
        status="Failed",
        resource="s3-readonly-api",
        region="global",
        evidence=f"S3 read-only API check could not complete. Error code: {error_code}.",
        remediation="Verify the AWS profile has SecurityAudit or equivalent read-only S3 permissions.",
    )


def get_bucket_region(s3_client, bucket_name: str) -> str:
    """
    Gets bucket region. AWS returns None for us-east-1.
    """

    try:
        response = s3_client.get_bucket_location(Bucket=bucket_name)
        location = response.get("LocationConstraint")

        if location is None:
            return "us-east-1"

        return str(location)

    except ClientError:
        return "unknown"


def list_all_buckets(s3_client) -> list[dict]:
    """
    Lists all S3 buckets visible to the selected AWS profile.
    """

    response = s3_client.list_buckets()
    return response.get("Buckets", [])


def check_bucket_public_access_block(s3_client, buckets: list[dict]) -> list[dict]:
    """
    Checks whether each bucket has S3 Block Public Access fully enabled.
    """

    if not buckets:
        return [
            build_s3_finding(
                finding_id="S3-REAL-001",
                check="S3 Block Public Access",
                severity="Info",
                status="Passed",
                resource="s3-buckets",
                region="global",
                evidence="No S3 buckets were found in this AWS account.",
                remediation="No action required. Continue keeping public access blocked when buckets are created.",
            )
        ]

    findings = []

    for bucket in buckets:
        bucket_name = bucket.get("Name", "unknown-bucket")
        bucket_region = get_bucket_region(s3_client, bucket_name)

        try:
            config = s3_client.get_public_access_block(Bucket=bucket_name)
            block_config = config.get("PublicAccessBlockConfiguration", {})

            required_flags = [
                "BlockPublicAcls",
                "IgnorePublicAcls",
                "BlockPublicPolicy",
                "RestrictPublicBuckets",
            ]

            missing_flags = [
                flag for flag in required_flags if block_config.get(flag) is not True
            ]

            if missing_flags:
                findings.append(
                    build_s3_finding(
                        finding_id="S3-REAL-001",
                        check="S3 Block Public Access",
                        severity="Critical",
                        status="Failed",
                        resource=bucket_name,
                        region=bucket_region,
                        evidence=f"Bucket public access block is not fully enabled. Missing or false flags: {', '.join(missing_flags)}.",
                        remediation="Enable all S3 Block Public Access settings for the bucket unless public access is explicitly required and approved.",
                    )
                )
            else:
                findings.append(
                    build_s3_finding(
                        finding_id="S3-REAL-001",
                        check="S3 Block Public Access",
                        severity="Info",
                        status="Passed",
                        resource=bucket_name,
                        region=bucket_region,
                        evidence="All S3 Block Public Access settings are enabled.",
                        remediation="Continue keeping public access blocked for this bucket.",
                    )
                )

        except ClientError as error:
            error_code = error.response.get("Error", {}).get("Code", "")

            if error_code == "NoSuchPublicAccessBlockConfiguration":
                findings.append(
                    build_s3_finding(
                        finding_id="S3-REAL-001",
                        check="S3 Block Public Access",
                        severity="Critical",
                        status="Failed",
                        resource=bucket_name,
                        region=bucket_region,
                        evidence="Bucket does not have a public access block configuration.",
                        remediation="Enable S3 Block Public Access for the bucket.",
                    )
                )
            else:
                findings.append(
                    build_s3_error_finding("S3-REAL-001", "S3 Block Public Access", error)
                )

    return findings


def check_bucket_encryption(s3_client, buckets: list[dict]) -> list[dict]:
    """
    Checks whether each S3 bucket has default encryption enabled.
    """

    if not buckets:
        return [
            build_s3_finding(
                finding_id="S3-REAL-002",
                check="S3 default encryption",
                severity="Info",
                status="Passed",
                resource="s3-buckets",
                region="global",
                evidence="No S3 buckets were found in this AWS account.",
                remediation="No action required. Enable default encryption when buckets are created.",
            )
        ]

    findings = []

    for bucket in buckets:
        bucket_name = bucket.get("Name", "unknown-bucket")
        bucket_region = get_bucket_region(s3_client, bucket_name)

        try:
            encryption = s3_client.get_bucket_encryption(Bucket=bucket_name)
            rules = encryption.get("ServerSideEncryptionConfiguration", {}).get(
                "Rules",
                [],
            )

            if rules:
                findings.append(
                    build_s3_finding(
                        finding_id="S3-REAL-002",
                        check="S3 default encryption",
                        severity="Info",
                        status="Passed",
                        resource=bucket_name,
                        region=bucket_region,
                        evidence="Bucket default server-side encryption is enabled.",
                        remediation="Continue enforcing default encryption for this bucket.",
                    )
                )
            else:
                findings.append(
                    build_s3_finding(
                        finding_id="S3-REAL-002",
                        check="S3 default encryption",
                        severity="High",
                        status="Failed",
                        resource=bucket_name,
                        region=bucket_region,
                        evidence="Bucket encryption configuration exists but no encryption rules were found.",
                        remediation="Enable default server-side encryption using SSE-S3 or SSE-KMS.",
                    )
                )

        except ClientError as error:
            error_code = error.response.get("Error", {}).get("Code", "")

            if error_code in {"ServerSideEncryptionConfigurationNotFoundError", "NoSuchBucket"}:
                findings.append(
                    build_s3_finding(
                        finding_id="S3-REAL-002",
                        check="S3 default encryption",
                        severity="High",
                        status="Failed",
                        resource=bucket_name,
                        region=bucket_region,
                        evidence="Bucket default server-side encryption is not configured.",
                        remediation="Enable default server-side encryption using SSE-S3 or SSE-KMS.",
                    )
                )
            else:
                findings.append(
                    build_s3_error_finding("S3-REAL-002", "S3 default encryption", error)
                )

    return findings


def check_bucket_versioning(s3_client, buckets: list[dict]) -> list[dict]:
    """
    Checks whether each S3 bucket has versioning enabled.
    """

    if not buckets:
        return [
            build_s3_finding(
                finding_id="S3-REAL-003",
                check="S3 bucket versioning",
                severity="Info",
                status="Passed",
                resource="s3-buckets",
                region="global",
                evidence="No S3 buckets were found in this AWS account.",
                remediation="No action required. Consider enabling versioning when buckets are created.",
            )
        ]

    findings = []

    for bucket in buckets:
        bucket_name = bucket.get("Name", "unknown-bucket")
        bucket_region = get_bucket_region(s3_client, bucket_name)

        try:
            versioning = s3_client.get_bucket_versioning(Bucket=bucket_name)
            status = versioning.get("Status", "Disabled")

            if status == "Enabled":
                findings.append(
                    build_s3_finding(
                        finding_id="S3-REAL-003",
                        check="S3 bucket versioning",
                        severity="Info",
                        status="Passed",
                        resource=bucket_name,
                        region=bucket_region,
                        evidence="Bucket versioning is enabled.",
                        remediation="Continue using versioning for recovery and accidental overwrite protection.",
                    )
                )
            else:
                findings.append(
                    build_s3_finding(
                        finding_id="S3-REAL-003",
                        check="S3 bucket versioning",
                        severity="Medium",
                        status="Failed",
                        resource=bucket_name,
                        region=bucket_region,
                        evidence="Bucket versioning is not enabled.",
                        remediation="Enable S3 versioning for important buckets to improve recovery from accidental deletion or overwrite.",
                    )
                )

        except ClientError as error:
            findings.append(
                build_s3_error_finding("S3-REAL-003", "S3 bucket versioning", error)
            )

    return findings


def run_s3_security_checks(session) -> list[dict]:
    """
    Runs all real S3 read-only security checks.
    """

    s3_client = session.client("s3")

    try:
        buckets = list_all_buckets(s3_client)
    except ClientError as error:
        return [build_s3_error_finding("S3-REAL-000", "List S3 buckets", error)]

    findings = []
    findings.extend(check_bucket_public_access_block(s3_client, buckets))
    findings.extend(check_bucket_encryption(s3_client, buckets))
    findings.extend(check_bucket_versioning(s3_client, buckets))

    return findings
