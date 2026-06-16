def get_mock_findings():
    """
    Returns mock AWS security findings.

    This is safe demo data.
    It does not connect to a real AWS account.
    The frontend dashboard will use this data before we add real boto3 checks.
    """

    return [
        {
            "id": "S3-001",
            "service": "S3",
            "check": "Public bucket exposure",
            "severity": "Critical",
            "status": "Failed",
            "resource": "demo-public-assets-bucket",
            "region": "ap-south-1",
            "evidence": "Block Public Access is disabled and bucket policy allows public read.",
            "remediation": "Enable S3 Block Public Access and review bucket policy permissions.",
            "category": "Storage Security"
        },
        {
            "id": "S3-002",
            "service": "S3",
            "check": "Bucket default encryption",
            "severity": "High",
            "status": "Failed",
            "resource": "demo-logs-bucket",
            "region": "ap-south-1",
            "evidence": "Default server-side encryption is not enabled.",
            "remediation": "Enable default encryption using SSE-S3 or SSE-KMS.",
            "category": "Encryption"
        },
        {
            "id": "IAM-001",
            "service": "IAM",
            "check": "IAM user MFA",
            "severity": "High",
            "status": "Failed",
            "resource": "developer-user",
            "region": "global",
            "evidence": "IAM user has console access but no MFA device configured.",
            "remediation": "Enable MFA for all human IAM users.",
            "category": "Identity Security"
        },
        {
            "id": "IAM-002",
            "service": "IAM",
            "check": "Access key age",
            "severity": "Medium",
            "status": "Failed",
            "resource": "automation-user",
            "region": "global",
            "evidence": "Access key is older than 90 days.",
            "remediation": "Rotate old access keys and remove unused credentials.",
            "category": "Credential Hygiene"
        },
        {
            "id": "EC2-001",
            "service": "EC2",
            "check": "Security group exposes SSH",
            "severity": "Critical",
            "status": "Failed",
            "resource": "sg-0123456789abcdef0",
            "region": "ap-south-1",
            "evidence": "Inbound rule allows TCP/22 from 0.0.0.0/0.",
            "remediation": "Restrict SSH access to trusted IP ranges or use AWS Systems Manager Session Manager.",
            "category": "Network Exposure"
        },
        {
            "id": "EC2-002",
            "service": "EC2",
            "check": "EBS volume encryption",
            "severity": "Medium",
            "status": "Failed",
            "resource": "vol-0123456789abcdef0",
            "region": "ap-south-1",
            "evidence": "EBS volume encryption is disabled.",
            "remediation": "Enable EBS encryption by default and migrate unencrypted volumes.",
            "category": "Encryption"
        },
        {
            "id": "CT-001",
            "service": "CloudTrail",
            "check": "CloudTrail enabled",
            "severity": "Info",
            "status": "Passed",
            "resource": "management-events-trail",
            "region": "ap-south-1",
            "evidence": "CloudTrail is enabled for management events.",
            "remediation": "Continue monitoring logs and enable log file validation if not already enabled.",
            "category": "Logging and Monitoring"
        },
        {
            "id": "EC2-003",
            "service": "EC2",
            "check": "Security group blocks RDP",
            "severity": "Info",
            "status": "Passed",
            "resource": "sg-0fedcba9876543210",
            "region": "ap-south-1",
            "evidence": "No inbound TCP/3389 rule open to the internet was detected.",
            "remediation": "No action required.",
            "category": "Network Exposure"
        }
    ]
