#!/usr/bin/env bash

set -e

echo "[CloudSec Auditor] Starting React frontend..."

cd "$(dirname "$0")/../desktop/frontend"

if [ ! -d "node_modules" ]; then
  echo "[CloudSec Auditor] node_modules not found."
  echo "[CloudSec Auditor] Run ./scripts/setup_frontend.sh first."
  exit 1
fi

npm run dev
