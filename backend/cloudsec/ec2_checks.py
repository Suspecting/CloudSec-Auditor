from botocore.exceptions import ClientError


DANGEROUS_PORTS = {
    22: {
        "name": "SSH",
        "severity": "Critical",
        "remediation": "Restrict SSH access to trusted IP ranges or use AWS Systems Manager Session Manager.",
    },
    3389: {
        "name": "RDP",
        "severity": "Critical",
        "remediation": "Restrict RDP access to trusted IP ranges or use a VPN/bastion host with MFA.",
    },
}


def build_ec2_finding(
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
    Builds a standardized EC2 finding.
    """

    return {
        "id": finding_id,
        "service": "EC2",
        "check": check,
        "severity": severity,
        "status": status,
        "resource": resource,
        "region": region,
        "evidence": evidence,
        "remediation": remediation,
        "category": "Network Exposure",
    }


def build_ec2_error_finding(
    finding_id: str,
    check: str,
    region: str,
    error: ClientError,
) -> dict:
    """
    Builds a safe finding when an EC2 read-only check cannot complete.
    """

    error_code = error.response.get("Error", {}).get("Code", "UnknownError")

    return build_ec2_finding(
        finding_id=finding_id,
        check=check,
        severity="Low",
        status="Failed",
        resource="ec2-readonly-api",
        region=region,
        evidence=f"EC2 read-only API check could not complete. Error code: {error_code}.",
        remediation="Verify the AWS profile has SecurityAudit or equivalent read-only EC2 permissions.",
    )


def permission_allows_public_access(permission: dict) -> bool:
    """
    Checks whether a security group rule allows public IPv4 or IPv6 access.
    """

    ip_ranges = permission.get("IpRanges", [])
    ipv6_ranges = permission.get("Ipv6Ranges", [])

    public_ipv4 = any(item.get("CidrIp") == "0.0.0.0/0" for item in ip_ranges)
    public_ipv6 = any(item.get("CidrIpv6") == "::/0" for item in ipv6_ranges)

    return public_ipv4 or public_ipv6


def permission_matches_port(permission: dict, target_port: int) -> bool:
    """
    Checks whether a security group permission allows a target TCP port.
    """

    protocol = permission.get("IpProtocol")

    if protocol not in {"tcp", "-1"}:
        return False

    if protocol == "-1":
        return True

    from_port = permission.get("FromPort")
    to_port = permission.get("ToPort")

    if from_port is None or to_port is None:
        return False

    return int(from_port) <= target_port <= int(to_port)


def check_public_admin_ports_in_region(session, region: str) -> list[dict]:
    """
    Checks EC2 security groups in one region for public SSH/RDP exposure.
    """

    findings = []
    ec2_client = session.client("ec2", region_name=region)

    try:
        paginator = ec2_client.get_paginator("describe_security_groups")

        checked_groups = 0

        for page in paginator.paginate():
            security_groups = page.get("SecurityGroups", [])

            for group in security_groups:
                checked_groups += 1

                group_id = group.get("GroupId", "unknown-security-group")
                group_name = group.get("GroupName", "unknown-name")

                for permission in group.get("IpPermissions", []):
                    if not permission_allows_public_access(permission):
                        continue

                    for port, metadata in DANGEROUS_PORTS.items():
                        if permission_matches_port(permission, port):
                            findings.append(
                                build_ec2_finding(
                                    finding_id=f"EC2-REAL-{port}",
                                    check=f"Public {metadata['name']} exposure",
                                    severity=metadata["severity"],
                                    status="Failed",
                                    resource=group_id,
                                    region=region,
                                    evidence=(
                                        f"Security group {group_name} ({group_id}) allows "
                                        f"public inbound {metadata['name']} access on TCP/{port}."
                                    ),
                                    remediation=metadata["remediation"],
                                )
                            )

        if findings:
            return findings

        return [
            build_ec2_finding(
                finding_id="EC2-REAL-001",
                check="Public SSH/RDP exposure",
                severity="Info",
                status="Passed",
                resource="ec2-security-groups",
                region=region,
                evidence=f"No security groups exposing SSH or RDP publicly were detected. Security groups checked: {checked_groups}.",
                remediation="Continue restricting administrative ports to trusted networks only.",
            )
        ]

    except ClientError as error:
        return [
            build_ec2_error_finding(
                finding_id="EC2-REAL-000",
                check="Public SSH/RDP exposure",
                region=region,
                error=error,
            )
        ]


def get_scan_regions(session) -> list[str]:
    """
    Returns enabled EC2 regions for read-only scanning.

    Disabled opt-in regions are skipped to avoid unnecessary API errors.
    """

    fallback_region = session.region_name or "ap-south-1"

    try:
        ec2_client = session.client("ec2", region_name=fallback_region)
        response = ec2_client.describe_regions(AllRegions=True)

        regions = []

        for region in response.get("Regions", []):
            region_name = region.get("RegionName")
            opt_in_status = region.get("OptInStatus")

            if opt_in_status in {None, "opt-in-not-required", "opted-in"}:
                regions.append(region_name)

        return sorted(region for region in regions if region)

    except ClientError:
        return [fallback_region]


def run_ec2_security_checks(session) -> list[dict]:
    """
    Runs all real EC2 read-only security checks.
    """

    findings = []
    regions = get_scan_regions(session)

    for region in regions:
        findings.extend(check_public_admin_ports_in_region(session, region))

    return findings
