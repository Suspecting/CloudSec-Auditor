#!/usr/bin/env bash

set -e

echo "[CloudSec Auditor] Setting up frontend..."

cd "$(dirname "$0")/../desktop/frontend"

npm install

echo "[CloudSec Auditor] Frontend setup complete."
