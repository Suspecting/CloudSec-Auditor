#!/usr/bin/env bash

set -e

echo "[CloudSec Auditor] Cleaning generated reports..."

cd "$(dirname "$0")/.."

mkdir -p reports
touch reports/.gitkeep
find reports -type f ! -name ".gitkeep" -delete

echo "[CloudSec Auditor] Reports cleaned."
