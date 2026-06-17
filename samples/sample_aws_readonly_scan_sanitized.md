# Sanitized AWS Read-Only Scan Sample

This sample demonstrates CloudSec Auditor real AWS read-only scan output with all account-specific identity details sanitized.

## Summary

- Total Checks: 8
- Passed: 6
- Failed: 2
- Critical: 0
- High: 1
- Medium: 1
- Risk Score: 23/100

## Findings

### IAM-REAL-001 — IAM — Account password policy

- Severity: Medium
- Status: Failed
- Resource: `account-password-policy`
- Region: `global`
- Category: Identity Security

Evidence: No IAM account password policy is configured.

Remediation: Create a strong IAM account password policy with length, complexity, expiration, and reuse controls.

---

### IAM-REAL-002 — IAM — Console user MFA

- Severity: Info
- Status: Passed
- Resource: `iam-console-users`
- Region: `global`
- Category: Identity Security

Evidence: No console users without MFA were detected. Console users checked: 0.

Remediation: Continue enforcing MFA for all IAM users with console access.

---

### IAM-REAL-003 — IAM — Access key age

- Severity: Info
- Status: Passed
- Resource: `iam-access-keys`
- Region: `global`
- Category: Identity Security

Evidence: No active access keys older than 90 days were detected. Keys checked: 1.

Remediation: Continue rotating access keys regularly and remove unused credentials.

---

### S3-REAL-001 — S3 — S3 Block Public Access

- Severity: Info
- Status: Passed
- Resource: `s3-buckets`
- Region: `global`
- Category: Storage Security

Evidence: No S3 buckets were found in this AWS account.

Remediation: No action required. Continue keeping public access blocked when buckets are created.

---

### S3-REAL-002 — S3 — S3 default encryption

- Severity: Info
- Status: Passed
- Resource: `s3-buckets`
- Region: `global`
- Category: Storage Security

Evidence: No S3 buckets were found in this AWS account.

Remediation: No action required. Enable default encryption when buckets are created.

---

### S3-REAL-003 — S3 — S3 bucket versioning

- Severity: Info
- Status: Passed
- Resource: `s3-buckets`
- Region: `global`
- Category: Storage Security

Evidence: No S3 buckets were found in this AWS account.

Remediation: No action required. Consider enabling versioning when buckets are created.

---

### EC2-REAL-001 — EC2 — Public SSH/RDP exposure

- Severity: Info
- Status: Passed
- Resource: `ec2-security-groups`
- Region: `multi-region`
- Category: Network Exposure

Evidence: No security groups exposing SSH or RDP publicly were detected across 17 enabled region(s).

Remediation: Continue restricting administrative ports to trusted networks only.

---

### CT-REAL-001 — CloudTrail — CloudTrail trail configured

- Severity: High
- Status: Failed
- Resource: `cloudtrail`
- Region: `ap-south-1`
- Category: Audit Visibility

Evidence: No CloudTrail trails were found in this AWS account.

Remediation: Create a multi-region CloudTrail trail to capture management events across the account.

---
