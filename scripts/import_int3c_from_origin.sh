#!/usr/bin/env bash
# Import INT3C packs from Cursor Origin into staging/INT3C/
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ORIGIN_GIT="https://origin.cursor.com/git/wait4languages/tmp-5845cb284c61d453.git"
CLONE_DIR="${TMPDIR:-/tmp}/int3c-origin-import"
BRANCH="${1:-cos-ferry-int3c}"
EXPECTED_SHA256="2bf52d5856269f476af3ba0fd0ba4140256cbdcf0b3a54da173aba2e7c7da69d"

echo "Cloning Origin branch ${BRANCH}..."
if ! git clone --depth 1 --branch "$BRANCH" "$ORIGIN_GIT" "$CLONE_DIR" 2>/dev/null; then
  echo "ORIGIN_CLONE_FAILED: could not clone $ORIGIN_GIT (branch $BRANCH)"
  echo "Authenticate with: origin auth login"
  exit 1
fi

mkdir -p "$ROOT/staging/INT3C" "$ROOT/images/int3c"

if [[ -d "$CLONE_DIR/packs" ]]; then
  rsync -a --delete "$CLONE_DIR/packs/" "$ROOT/staging/INT3C/"
elif [[ -f "$CLONE_DIR/unit01/questions.json" ]]; then
  rsync -a --delete "$CLONE_DIR/" "$ROOT/staging/INT3C/"
else
  echo "No packs found in clone root; check branch layout"
  exit 1
fi

if [[ -d "$CLONE_DIR/images/int3c" ]]; then
  rsync -a "$CLONE_DIR/images/int3c/" "$ROOT/images/int3c/"
fi

TGZ=$(find "$CLONE_DIR" -maxdepth 2 -name '*.tgz' -o -name '*.tar.gz' 2>/dev/null | head -1)
if [[ -n "$TGZ" ]]; then
  ACTUAL=$(sha256sum "$TGZ" | awk '{print $1}')
  if [[ "$ACTUAL" != "$EXPECTED_SHA256" ]]; then
    echo "WARN: tgz sha256 mismatch (got $ACTUAL, expected $EXPECTED_SHA256)"
  else
    echo "tgz sha256 verified"
  fi
fi

echo "Imported INT3C to $ROOT/staging/INT3C/"
find "$ROOT/staging/INT3C" -name 'questions.json' | wc -l
