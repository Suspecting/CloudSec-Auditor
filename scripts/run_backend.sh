#!/usr/bin/env bash

set -e

echo "[CloudSec Auditor] Starting FastAPI backend..."

cd "$(dirname "$0")/../backend"

if [ ! -d ".venv" ]; then
  echo "[CloudSec Auditor] Backend virtual environment not found."
  echo "[CloudSec Auditor] Run ./scripts/setup_backend.sh first."
  exit 1
fi

source .venv/bin/activate

uvicorn main:app --reload --host 127.0.0.1 --port 8000
