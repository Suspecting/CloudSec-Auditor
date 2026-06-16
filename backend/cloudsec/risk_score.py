SEVERITY_WEIGHTS = {
    "Critical": 25,
    "High": 15,
    "Medium": 8,
    "Low": 3,
    "Info": 0
}


def calculate_summary(findings):
    """
    Calculates scan summary and overall risk score.

    Passed checks do not increase risk.
    Failed checks increase risk based on severity.
    Final risk score is capped at 100.
    """

    summary = {
        "total_checks": len(findings),
        "passed": 0,
        "failed": 0,
        "critical": 0,
        "high": 0,
        "medium": 0,
        "low": 0,
        "info": 0,
        "risk_score": 0
    }

    score = 0

    for finding in findings:
        severity = finding.get("severity", "Info")
        status = finding.get("status", "Failed")

        if status == "Passed":
            summary["passed"] += 1
            continue

        summary["failed"] += 1
        score += SEVERITY_WEIGHTS.get(severity, 0)

        if severity == "Critical":
            summary["critical"] += 1
        elif severity == "High":
            summary["high"] += 1
        elif severity == "Medium":
            summary["medium"] += 1
        elif severity == "Low":
            summary["low"] += 1
        else:
            summary["info"] += 1

    summary["risk_score"] = min(score, 100)

    return summary
