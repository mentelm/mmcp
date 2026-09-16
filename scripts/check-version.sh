#!/usr/bin/env bash
set -euo pipefail

if [ -z "${BASE_REF:-}" ]; then
  echo "BASE_REF not set, skipping version check."
  exit 0
fi

PREFIX=$(git rev-parse --show-prefix)
BASE_VERSION=$(git show "$BASE_REF:$PREFIX/package.json" 2>/dev/null | grep '"version"' | head -1) || true
CURRENT_VERSION=$(grep '"version"' package.json | head -1)

if [ "$BASE_VERSION" != "$CURRENT_VERSION" ]; then
  exit 0
fi

echo "::error::$(pwd): source changes without version bump ($BASE_VERSION -> $CURRENT_VERSION)"
exit 1