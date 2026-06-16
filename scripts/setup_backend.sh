#!/usr/bin/env bash

set -e

echo "[CloudSec Auditor] Setting up backend..."

cd "$(dirname "$0")/../backend"

if [ ! -d ".venv" ]; then
  echo "[CloudSec Auditor] Creating Python virtual environment..."
  python3 -m venv .venv
fi

source .venv/bin/activate

echo "[CloudSec Auditor] Installing backend dependencies..."
pip install -r requirements.txt

echo "[CloudSec Auditor] Backend setup complete."
