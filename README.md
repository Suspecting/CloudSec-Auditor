# CloudSec Auditor

**CloudSec Auditor** is a local-first AWS security misconfiguration scanner built with a **React + Vite frontend** and **FastAPI backend**. It audits AWS-style cloud security posture in safe mock mode, calculates a risk score, prioritizes findings, and generates timestamped **JSON, HTML, and Markdown** reports.

The project is designed for defensive cloud security learning, portfolio demonstration, interview explanation, and future extension into real AWS read-only auditing using `boto3`.

---

## Author

**Prakhar Shakya**
B.Tech CSE — Cybersecurity
Lloyd Institute of Engineering and Technology, Greater Noida
Delhi NCR, India

* GitHub: [@Suspecting](https://github.com/Suspecting)
* LinkedIn: [@Prakhar Shakya](https://www.linkedin.com/in/shakyaprakhar/)

---

## Project Overview

CloudSec Auditor helps identify and present common cloud security misconfigurations in a clean dashboard format. The current version runs in **mock mode**, which means it does not require AWS credentials and is safe for demos, screenshots, and local testing.

It simulates AWS security checks across IAM, S3, EC2, CloudTrail, encryption, and network exposure areas, then generates audit-ready output with evidence and remediation guidance.

---

## Key Features

* Modern AWS-style security dashboard
* FastAPI backend with structured scan APIs
* React frontend with premium dark cybersecurity UI
* Safe mock scan mode with no AWS credentials required
* Risk score calculation based on severity
* Prioritized findings with evidence and remediation
* Findings Explorer with:

  * Severity filters
  * Service filters
  * Search functionality
  * Clear filters option
  * Severity summary cards
* Backend health and API version indicator
* Timestamped report export system
* Latest report viewer from frontend
* JSON, HTML, and Markdown report generation
* Report metadata survives page refresh
* Helper scripts for local setup and development
* Local-first security design

---

## Tech Stack

### Frontend

* React
* Vite
* Tailwind CSS
* Framer Motion
* Axios
* Lucide React

### Backend

* Python
* FastAPI
* Uvicorn
* Pydantic
* pathlib
* boto3 planned for real AWS read-only mode

---

## Project Structure

```text
CloudSec-Auditor/
├── backend/
│   ├── core/
│   │   ├── __init__.py
│   │   ├── config.py
│   │   ├── error_handlers.py
│   │   └── logging_config.py
│   │
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── report_routes.py
│   │   ├── scan_routes.py
│   │   └── status_routes.py
│   │
│   ├── schemas/
│   │   ├── __init__.py
│   │   └── response_models.py
│   │
│   ├── cloudsec/
│   │   ├── __init__.py
│   │   ├── cloudtrail_checks.py
│   │   ├── ec2_checks.py
│   │   ├── iam_checks.py
│   │   ├── mock_data.py
│   │   ├── report_generator.py
│   │   ├── risk_score.py
│   │   └── s3_checks.py
│   │
│   ├── main.py
│   └── requirements.txt
│
├── desktop/
│   └── frontend/
│       ├── public/
│       ├── src/
│       │   ├── App.jsx
│       │   ├── index.css
│       │   └── main.jsx
│       ├── package.json
│       └── vite.config.js
│
├── reports/
│   └── .gitkeep
│
├── screenshots/
├── scripts/
│   ├── clean_reports.sh
│   ├── run_backend.sh
│   ├── run_frontend.sh
│   ├── setup_backend.sh
│   └── setup_frontend.sh
│
├── .gitignore
└── README.md
```

---

## How It Works

```text
User clicks Scan
        ↓
React frontend calls FastAPI backend
        ↓
Backend returns mock AWS security findings
        ↓
Risk score is calculated
        ↓
Dashboard updates with findings
        ↓
Reports are generated
        ↓
Latest JSON, HTML, and Markdown reports become available
```

---

## Security Checks Covered

Current mock checks include:

* S3 public bucket exposure
* S3 bucket default encryption
* IAM users without MFA
* IAM access key age
* EC2 SSH exposure to `0.0.0.0/0`
* EBS encryption status
* CloudTrail audit visibility
* Passed informational checks

Each finding includes:

* Service
* Severity
* Status
* Resource
* Region
* Category
* Evidence
* Remediation guidance

---

## Quick Start with Helper Scripts

CloudSec Auditor includes helper scripts for easier local setup and development.

### Backend Setup

```bash
./scripts/setup_backend.sh
```

### Run Backend

```bash
./scripts/run_backend.sh
```

The backend runs at:

```text
http://127.0.0.1:8000
```

FastAPI docs:

```text
http://127.0.0.1:8000/docs
```

### Frontend Setup

Open another terminal:

```bash
./scripts/setup_frontend.sh
```

### Run Frontend

```bash
./scripts/run_frontend.sh
```

The frontend runs at:

```text
http://localhost:5173
```

### Clean Generated Reports

```bash
./scripts/clean_reports.sh
```

---

## Manual Backend Setup

Open a terminal in the project root:

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

Backend runs at:

```text
http://127.0.0.1:8000
```

FastAPI docs:

```text
http://127.0.0.1:8000/docs
```

---

## Manual Frontend Setup

Open another terminal:

```bash
cd desktop/frontend
npm install
npm run dev
```

Frontend runs at:

```text
http://localhost:5173
```

---

## API Endpoints

| Endpoint                       | Method | Purpose                                         |
| ------------------------------ | -----: | ----------------------------------------------- |
| `/`                            |    GET | Root API information                            |
| `/health`                      |    GET | Basic backend health check                      |
| `/api/status`                  |    GET | Backend status, version, mode, and report count |
| `/api/scan/mock`               |    GET | Runs mock AWS security scan                     |
| `/api/reports/generate/mock`   |    GET | Generates JSON, HTML, and Markdown reports      |
| `/api/reports/latest`          |    GET | Returns latest report metadata                  |
| `/api/reports/latest/html`     |    GET | Opens latest HTML report                        |
| `/api/reports/latest/json`     |    GET | Opens latest JSON report                        |
| `/api/reports/latest/markdown` |    GET | Opens latest Markdown report                    |

---

## Report Generation

CloudSec Auditor generates timestamped report files inside the `reports/` folder.

Example output:

```text
cloudsec_report_2026-06-16_14-35-22.json
cloudsec_report_2026-06-16_14-35-22.html
cloudsec_report_2026-06-16_14-35-22.md
```

Reports are ignored by Git to keep the repository clean. The folder structure is preserved using:

```text
reports/.gitkeep
```

---

## Screenshots

### Hero Dashboard

![Hero Dashboard](screenshots/hero-dashboard.png)

### Findings Explorer

![Findings Explorer](screenshots/findings-explorer.png)

### Reports Section

![Reports Section](screenshots/reports-section.png)

### HTML Report

![HTML Report](screenshots/html-report.png)

---

## Security Note

CloudSec Auditor currently runs in mock mode and does not require AWS credentials.

No AWS access keys, secrets, or credentials are stored in the frontend. Real AWS mode is planned for a future version and should only use read-only AWS permissions through local AWS CLI profiles.

Recommended future permissions for real AWS mode:

* SecurityAudit
* ViewOnlyAccess
* Custom least-privilege read-only policy

---

## Current Status

This project currently includes:

* React dashboard
* FastAPI backend
* Mock scan engine
* Risk scoring
* Findings explorer
* Report generation
* Latest report serving
* API status indicator
* Helper scripts
* GitHub-ready project structure

---

## Roadmap

Planned improvements:

* Real AWS read-only scanning with `boto3`
* AWS CLI profile selector
* IAM policy analysis
* S3 public access analyzer
* EC2 security group analyzer
* CloudTrail configuration validation
* PDF report export
* Electron desktop packaging
* CI/CD workflow
* Release builds

---

## Disclaimer

This project is built for defensive cloud security auditing, learning, and portfolio demonstration. It should only be used on cloud accounts and environments where proper authorization exists.
