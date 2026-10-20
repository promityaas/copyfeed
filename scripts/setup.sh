#!/usr/bin/env bash
set -euo pipefail
cd /workspace/copyfeed
npm ci --ignore-scripts --no-audit --no-fund --cache /workspace/.npm-cache
npm run build
npm test
npm run test:browser
