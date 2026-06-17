from datetime import datetime, timezone

from botocore.exceptions import ClientError


ACCESS_KEY_MAX_AGE_DAYS = 90


def build_iam_finding(
    finding_id: str,
    check: str,
    severity: str,
    status: str,
    resource: str,
    evidence: str,
    remediation: str,
) -> dict:
    """
    Builds a standardized IAM finding.
    """

    return {
        "id": finding_id,
        "service": "IAM",
        "check": check,
        "severity": severity,
        "status": status,
        "resource": resource,
        "region": "global",
        "evidence": evidence,
        "remediation": remediation,
        "category": "Identity Security",
    }


def build_iam_error_finding(finding_id: str, check: str, error: ClientError) -> dict:
    """
    Builds a safe finding when an IAM read-only check cannot complete.
    """

    error_code = error.response.get("Error", {}).get("Code", "UnknownError")

    return build_iam_finding(
        finding_id=finding_id,
        check=check,
        severity="Low",
        status="Failed",
        resource="iam-readonly-api",
        evidence=f"IAM read-only API check could not complete. Error code: {error_code}.",
        remediation="Verify the AWS profile has SecurityAudit or equivalent read-only IAM permissions.",
    )


def check_account_password_policy(iam_client) -> list[dict]:
    """
    Checks whether the AWS account has an IAM password policy configured.
    """

    try:
        policy = iam_client.get_account_password_policy().get("PasswordPolicy", {})

        minimum_length = policy.get("MinimumPasswordLength", "unknown")
        require_symbols = policy.get("RequireSymbols", False)
        require_numbers = policy.get("RequireNumbers", False)
        require_uppercase = policy.get("RequireUppercaseCharacters", False)
        require_lowercase = policy.get("RequireLowercaseCharacters", False)

        return [
            build_iam_finding(
                finding_id="IAM-REAL-001",
                check="Account password policy",
                severity="Info",
                status="Passed",
                resource="account-password-policy",
                evidence=(
                    "IAM password policy is configured. "
                    f"Minimum length: {minimum_length}, "
                    f"symbols: {require_symbols}, numbers: {require_numbers}, "
                    f"uppercase: {require_uppercase}, lowercase: {require_lowercase}."
                ),
                remediation="Continue enforcing a strong password policy for IAM console users.",
            )
        ]

    except ClientError as error:
        error_code = error.response.get("Error", {}).get("Code", "")

        if error_code == "NoSuchEntity":
            return [
                build_iam_finding(
                    finding_id="IAM-REAL-001",
                    check="Account password policy",
                    severity="Medium",
                    status="Failed",
                    resource="account-password-policy",
                    evidence="No IAM account password policy is configured.",
                    remediation="Create a strong IAM account password policy with length, complexity, expiration, and reuse controls.",
                )
            ]

        return [build_iam_error_finding("IAM-REAL-001", "Account password policy", error)]


def list_all_iam_users(iam_client) -> list[dict]:
    """
    Returns all IAM users using paginator.
    """

    users = []
    paginator = iam_client.get_paginator("list_users")

    for page in paginator.paginate():
        users.extend(page.get("Users", []))

    return users


def user_has_console_access(iam_client, username: str) -> bool:
    """
    Checks whether an IAM user has a console login profile.
    """

    try:
        iam_client.get_login_profile(UserName=username)
        return True

    except ClientError as error:
        error_code = error.response.get("Error", {}).get("Code", "")

        if error_code == "NoSuchEntity":
            return False

        raise


def check_console_users_without_mfa(iam_client) -> list[dict]:
    """
    Checks IAM users with console access but no MFA device.
    """

    findings = []

    try:
        users = list_all_iam_users(iam_client)
        console_users_checked = 0

        for user in users:
            username = user.get("UserName", "unknown-user")

            if not user_has_console_access(iam_client, username):
                continue

            console_users_checked += 1

            mfa_devices = iam_client.list_mfa_devices(UserName=username).get(
                "MFADevices",
                [],
            )

            if not mfa_devices:
                findings.append(
                    build_iam_finding(
                        finding_id="IAM-REAL-002",
                        check="Console user MFA",
                        severity="High",
                        status="Failed",
                        resource=username,
                        evidence="IAM user has AWS console access but no MFA device configured.",
                        remediation="Enable MFA for every human IAM user with console access.",
                    )
                )

        if findings:
            return findings

        return [
            build_iam_finding(
                finding_id="IAM-REAL-002",
                check="Console user MFA",
                severity="Info",
                status="Passed",
                resource="iam-console-users",
                evidence=f"No console users without MFA were detected. Console users checked: {console_users_checked}.",
                remediation="Continue enforcing MFA for all IAM users with console access.",
            )
        ]

    except ClientError as error:
        return [build_iam_error_finding("IAM-REAL-002", "Console user MFA", error)]


def check_old_access_keys(iam_client) -> list[dict]:
    """
    Checks IAM access keys older than ACCESS_KEY_MAX_AGE_DAYS.
    """

    findings = []

    try:
        users = list_all_iam_users(iam_client)
        total_keys_checked = 0
        now = datetime.now(timezone.utc)

        for user in users:
            username = user.get("UserName", "unknown-user")

            access_keys = iam_client.list_access_keys(UserName=username).get(
                "AccessKeyMetadata",
                [],
            )

            for key in access_keys:
                total_keys_checked += 1

                key_status = key.get("Status", "Unknown")
                created_at = key.get("CreateDate")

                if not created_at:
                    continue

                key_age_days = (now - created_at).days

                if key_status == "Active" and key_age_days > ACCESS_KEY_MAX_AGE_DAYS:
                    findings.append(
                        build_iam_finding(
                            finding_id="IAM-REAL-003",
                            check="Access key age",
                            severity="Medium",
                            status="Failed",
                            resource=username,
                            evidence=(
                                f"Active access key is {key_age_days} days old, "
                                f"which is older than {ACCESS_KEY_MAX_AGE_DAYS} days."
                            ),
                            remediation="Rotate old access keys and remove unused IAM credentials.",
                        )
                    )

        if findings:
            return findings

        return [
            build_iam_finding(
                finding_id="IAM-REAL-003",
                check="Access key age",
                severity="Info",
                status="Passed",
                resource="iam-access-keys",
                evidence=f"No active access keys older than {ACCESS_KEY_MAX_AGE_DAYS} days were detected. Keys checked: {total_keys_checked}.",
                remediation="Continue rotating access keys regularly and remove unused credentials.",
            )
        ]

    except ClientError as error:
        return [build_iam_error_finding("IAM-REAL-003", "Access key age", error)]


def run_iam_security_checks(session) -> list[dict]:
    """
    Runs all real IAM read-only security checks.
    """

    iam_client = session.client("iam")

    findings = []
    findings.extend(check_account_password_policy(iam_client))
    findings.extend(check_console_users_without_mfa(iam_client))
    findings.extend(check_old_access_keys(iam_client))

    return findings
