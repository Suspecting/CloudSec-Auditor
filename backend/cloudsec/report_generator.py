import json
from datetime import datetime, timezone, timedelta
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parents[2]
REPORTS_DIR = PROJECT_ROOT / "reports"

IST = timezone(timedelta(hours=5, minutes=30), name="IST")


def get_export_metadata():
    """
    Creates export timestamp data for filenames and report display.
    """
    now = datetime.now(IST)

    return {
        "exported_at": now.isoformat(),
        "exported_at_display": now.strftime("%d %b %Y, %I:%M:%S %p IST"),
        "export_stamp": now.strftime("%Y-%m-%d_%H-%M-%S"),
    }


def ensure_reports_dir():
    """
    Creates the reports folder if it does not already exist.
    """
    REPORTS_DIR.mkdir(parents=True, exist_ok=True)


def save_json_report(report_data, export_stamp):
    """
    Saves the scan result as a structured JSON report.
    JSON is useful for automation, parsing, and later frontend integration.
    """
    ensure_reports_dir()

    output_path = REPORTS_DIR / f"cloudsec_report_{export_stamp}.json"

    with output_path.open("w", encoding="utf-8") as file:
        json.dump(report_data, file, indent=4)

    return str(output_path)


def save_markdown_report(report_data, export_stamp):
    """
    Saves the scan result as a Markdown report.
    Markdown is useful for GitHub documentation and interview explanation.
    """
    ensure_reports_dir()

    output_path = REPORTS_DIR / f"cloudsec_report_{export_stamp}.md"


    summary = report_data["summary"]
    findings = report_data["findings"]

    lines = []

    lines.append("# CloudSec Auditor Report\n")
    lines.append("## Scan Summary\n")
    lines.append(f"- Tool: {report_data['tool']}")
    lines.append(f"- Mode: {report_data['mode']}")
    lines.append(f"- Scan Target: {report_data['scan_target']}")
    lines.append(f"- Generated At: {report_data['generated_at']}")
    lines.append(f"- Exported At: {report_data['exported_at_display']}")
    lines.append(f"- Total Checks: {summary['total_checks']}")
    lines.append(f"- Passed Checks: {summary['passed']}")
    lines.append(f"- Failed Checks: {summary['failed']}")
    lines.append(f"- Critical Findings: {summary['critical']}")
    lines.append(f"- High Findings: {summary['high']}")
    lines.append(f"- Medium Findings: {summary['medium']}")
    lines.append(f"- Low Findings: {summary['low']}")
    lines.append(f"- Risk Score: {summary['risk_score']}/100\n")

    lines.append("## Findings\n")

    for finding in findings:
        lines.append(f"### {finding['id']} — {finding['service']} — {finding['check']}\n")
        lines.append(f"**Severity:** {finding['severity']}")
        lines.append(f"**Status:** {finding['status']}")
        lines.append(f"**Resource:** `{finding['resource']}`")
        lines.append(f"**Region:** `{finding['region']}`")
        lines.append(f"**Category:** {finding['category']}\n")
        lines.append(f"**Evidence:** {finding['evidence']}\n")
        lines.append(f"**Remediation:** {finding['remediation']}\n")
        lines.append("---\n")

    with output_path.open("w", encoding="utf-8") as file:
        file.write("\n".join(lines))

    return str(output_path)


def severity_class(severity):
    """
    Returns a CSS class name based on severity.
    """
    return {
        "Critical": "critical",
        "High": "high",
        "Medium": "medium",
        "Low": "low",
        "Info": "info",
    }.get(severity, "info")


def save_html_report(report_data, export_stamp):
    """
    Saves the scan result as a polished HTML report.
    HTML is useful for visual review and screenshots.
    """
    ensure_reports_dir()

    output_path = REPORTS_DIR / f"cloudsec_report_{export_stamp}.html"

    summary = report_data["summary"]
    findings = report_data["findings"]

    generated_at = report_data.get("exported_at_display", report_data.get("generated_at", "N/A"))

    finding_rows = ""

    for finding in findings:
        finding_rows += f"""
        <tr>
            <td><span class="badge {severity_class(finding['severity'])}">{finding['severity']}</span></td>
            <td>{finding['service']}</td>
            <td>
                <strong>{finding['check']}</strong>
                <p>{finding['evidence']}</p>
            </td>
            <td><code>{finding['resource']}</code></td>
            <td>{finding['region']}</td>
            <td>{finding['remediation']}</td>
        </tr>
        """

    html = f"""
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>CloudSec Auditor Report</title>
    <style>
        body {{
            margin: 0;
            background: #020617;
            color: #e5e7eb;
            font-family: Inter, Arial, sans-serif;
        }}

        .container {{
            max-width: 1180px;
            margin: 0 auto;
            padding: 40px 24px;
        }}

        .header {{
            border: 1px solid rgba(148, 163, 184, 0.18);
            background: linear-gradient(180deg, rgba(15, 23, 42, 0.95), rgba(2, 6, 23, 0.95));
            border-radius: 24px;
            padding: 28px;
            box-shadow: 0 28px 90px rgba(0, 0, 0, 0.35);
        }}

        .label {{
            color: #67e8f9;
            font-size: 12px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.18em;
        }}

        h1 {{
            margin: 10px 0 0;
            font-size: 42px;
            line-height: 1;
        }}

        .subtitle {{
            color: #94a3b8;
            margin-top: 12px;
            line-height: 1.6;
        }}

        .grid {{
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 16px;
            margin-top: 22px;
        }}

        .card {{
            border: 1px solid rgba(148, 163, 184, 0.16);
            background: rgba(15, 23, 42, 0.75);
            border-radius: 18px;
            padding: 18px;
        }}

        .card span {{
            color: #94a3b8;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.12em;
            font-weight: 800;
        }}

        .card strong {{
            display: block;
            font-size: 34px;
            margin-top: 10px;
        }}

        .risk {{
            color: #fca5a5;
        }}

        .section {{
            margin-top: 28px;
            border: 1px solid rgba(148, 163, 184, 0.16);
            background: rgba(15, 23, 42, 0.72);
            border-radius: 22px;
            overflow: hidden;
        }}

        .section-header {{
            padding: 20px 24px;
            border-bottom: 1px solid rgba(148, 163, 184, 0.16);
        }}

        .section-header h2 {{
            margin: 0;
            font-size: 20px;
        }}

        table {{
            width: 100%;
            border-collapse: collapse;
        }}

        th {{
            text-align: left;
            color: #94a3b8;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.12em;
            padding: 14px;
            background: rgba(2, 6, 23, 0.55);
        }}

        td {{
            padding: 14px;
            border-top: 1px solid rgba(148, 163, 184, 0.12);
            vertical-align: top;
            font-size: 14px;
        }}

        td p {{
            margin: 6px 0 0;
            color: #94a3b8;
            line-height: 1.5;
        }}

        code {{
            color: #67e8f9;
            font-size: 12px;
        }}

        .badge {{
            display: inline-block;
            padding: 6px 10px;
            border-radius: 999px;
            font-weight: 800;
            font-size: 12px;
            border: 1px solid;
        }}

        .critical {{
            color: #fecaca;
            background: rgba(239, 68, 68, 0.14);
            border-color: rgba(248, 113, 113, 0.35);
        }}

        .high {{
            color: #fed7aa;
            background: rgba(249, 115, 22, 0.14);
            border-color: rgba(251, 146, 60, 0.35);
        }}

        .medium {{
            color: #fef08a;
            background: rgba(234, 179, 8, 0.13);
            border-color: rgba(250, 204, 21, 0.35);
        }}

        .low {{
            color: #bfdbfe;
            background: rgba(59, 130, 246, 0.13);
            border-color: rgba(96, 165, 250, 0.35);
        }}

        .info {{
            color: #cbd5e1;
            background: rgba(148, 163, 184, 0.13);
            border-color: rgba(148, 163, 184, 0.35);
        }}

        .footer {{
            color: #64748b;
            font-size: 12px;
            margin-top: 24px;
            text-align: center;
        }}

        @media (max-width: 900px) {{
            .grid {{
                grid-template-columns: repeat(2, 1fr);
            }}

            table {{
                display: block;
                overflow-x: auto;
                white-space: nowrap;
            }}
        }}
    </style>
</head>
<body>
    <main class="container">
        <section class="header">
            <div class="label">CloudSec Auditor</div>
            <h1>AWS Security Misconfiguration Report</h1>
            <p class="subtitle">
                Scan target: {report_data['scan_target']} · Mode: {report_data['mode']} · Generated: {generated_at}
            </p>

            <div class="grid">
                <div class="card">
                    <span>Total Checks</span>
                    <strong>{summary['total_checks']}</strong>
                </div>
                <div class="card">
                    <span>Failed</span>
                    <strong>{summary['failed']}</strong>
                </div>
                <div class="card">
                    <span>Critical</span>
                    <strong>{summary['critical']}</strong>
                </div>
                <div class="card">
                    <span>Risk Score</span>
                    <strong class="risk">{summary['risk_score']}/100</strong>
                </div>
            </div>
        </section>

        <section class="section">
            <div class="section-header">
                <h2>Evidence-Based Findings</h2>
            </div>

            <table>
                <thead>
                    <tr>
                        <th>Severity</th>
                        <th>Service</th>
                        <th>Finding</th>
                        <th>Resource</th>
                        <th>Region</th>
                        <th>Remediation</th>
                    </tr>
                </thead>
                <tbody>
                    {finding_rows}
                </tbody>
            </table>
        </section>

        <p class="footer">
            CloudSec Auditor · Defensive AWS security auditing · JSON / HTML / Markdown reporting
        </p>
    </main>
</body>
</html>
"""

    with output_path.open("w", encoding="utf-8") as file:
        file.write(html)

    return str(output_path)


def generate_all_reports(report_data):
    """
    Generates JSON, Markdown, and HTML reports together with timestamped filenames.
    """
    export_meta = get_export_metadata()

    report_data = {
        **report_data,
        **export_meta,
    }

    export_stamp = export_meta["export_stamp"]

    json_path = save_json_report(report_data, export_stamp)
    markdown_path = save_markdown_report(report_data, export_stamp)
    html_path = save_html_report(report_data, export_stamp)

    return {
        "exported_at": export_meta["exported_at_display"],
        "json": json_path,
        "markdown": markdown_path,
        "html": html_path,
    }
