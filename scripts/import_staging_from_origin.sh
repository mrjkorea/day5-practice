#!/usr/bin/env bash
# Import one Intermediate book from Cursor Origin into staging/INT*/
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

declare -A ORIGIN_GIT ORIGIN_BRANCH ORIGIN_SUBPATH ORIGIN_SHA STAGING_BRANCH

ORIGIN_GIT[INT2A]="https://origin.cursor.com/git/wait4languages/tmp-a4c737e083236982.git"
ORIGIN_BRANCH[INT2A]="main"
ORIGIN_SUBPATH[INT2A]="staging/INT2A"
ORIGIN_SHA[INT2A]="eebcf0226c4ff19ef503d59e6d2dc9874d3707bfeb48a32aef8bddca39ad5447"
STAGING_BRANCH[INT2A]="staging-int2a"

ORIGIN_GIT[INT2C]="https://origin.cursor.com/git/wait4languages/tmp-0a5450fe7d08e1b2.git"
ORIGIN_BRANCH[INT2C]="main"
ORIGIN_SUBPATH[INT2C]="."
ORIGIN_SHA[INT2C]="15997298d478199a2a6bb8a23997ae25ecd10c59fec397342fdb5ee47c6c0089"
STAGING_BRANCH[INT2C]="staging-int2c"

ORIGIN_GIT[INT3A]="https://origin.cursor.com/git/wait4languages/tmp-b8b36e4ac789c6db.git"
ORIGIN_BRANCH[INT3A]="main"
ORIGIN_SUBPATH[INT3A]="staging/INT3A"
ORIGIN_SHA[INT3A]="6d637714944a1d4734392f992e0605ae931829cbcc30be5545778376ede2a69e"
STAGING_BRANCH[INT3A]="staging-int3a"

ORIGIN_GIT[INT3B]="https://origin.cursor.com/git/wait4languages/tmp-6027b4826ea45356.git"
ORIGIN_BRANCH[INT3B]="main"
ORIGIN_SUBPATH[INT3B]="."
ORIGIN_SHA[INT3B]="f3a34700218610368994c221476d5288c4e88706cd1e0659836542645bccc8da"
STAGING_BRANCH[INT3B]="staging-int3b"

ORIGIN_GIT[INT3C]="https://origin.cursor.com/git/wait4languages/tmp-5845cb284c61d453.git"
ORIGIN_BRANCH[INT3C]="cos-ferry-int3c"
ORIGIN_SUBPATH[INT3C]="."
ORIGIN_SHA[INT3C]="2bf52d5856269f476af3ba0fd0ba4140256cbdcf0b3a54da173aba2e7c7da69d"
STAGING_BRANCH[INT3C]="staging-int3c"

BOOK="${1:-}"
if [[ -z "$BOOK" || -z "${ORIGIN_GIT[$BOOK]:-}" ]]; then
  echo "Usage: $0 INT2A|INT2C|INT3A|INT3B|INT3C"
  exit 1
fi

BOOK_LOWER=$(echo "$BOOK" | tr '[:upper:]' '[:lower:]')
CLONE_DIR="${TMPDIR:-/tmp}/origin-import-${BOOK}"
GIT_URL="${ORIGIN_GIT[$BOOK]}"
BRANCH="${ORIGIN_BRANCH[$BOOK]}"

echo "Cloning $BOOK from $GIT_URL (branch $BRANCH)..."
if ! git clone --depth 1 --branch "$BRANCH" "$GIT_URL" "$CLONE_DIR" 2>/dev/null; then
  echo "ORIGIN_CLONE_FAILED: $BOOK — could not clone $GIT_URL"
  exit 1
fi

DEST="$ROOT/staging/$BOOK"
mkdir -p "$DEST" "$ROOT/images/$BOOK_LOWER" "$ROOT/audio/$BOOK_LOWER"

SUB="${ORIGIN_SUBPATH[$BOOK]}"
SRC="$CLONE_DIR"
[[ "$SUB" != "." ]] && SRC="$CLONE_DIR/$SUB"

if [[ -d "$SRC/unit01" ]]; then
  rsync -a --delete "$SRC/" "$DEST/"
elif [[ -d "$SRC/packs" ]]; then
  rsync -a --delete "$SRC/packs/" "$DEST/"
else
  echo "No pack layout found under $SRC"
  exit 1
fi

for img in "$CLONE_DIR/images/$BOOK_LOWER" "$CLONE_DIR/images/${BOOK}" "$SRC/images"; do
  [[ -d "$img" ]] && rsync -a "$img/" "$ROOT/images/$BOOK_LOWER/"
done
for aud in "$CLONE_DIR/audio/$BOOK_LOWER" "$CLONE_DIR/audio/${BOOK}"; do
  [[ -d "$aud" ]] && rsync -a "$aud/" "$ROOT/audio/$BOOK_LOWER/"
done

TGZ=$(find "$CLONE_DIR" -maxdepth 3 \( -name '*.tgz' -o -name '*.tar.gz' \) 2>/dev/null | head -1)
if [[ -n "$TGZ" ]]; then
  ACTUAL=$(sha256sum "$TGZ" | awk '{print $1}')
  EXPECTED="${ORIGIN_SHA[$BOOK]}"
  if [[ "$ACTUAL" == "$EXPECTED" ]]; then
    echo "tgz sha256 verified"
  else
    echo "WARN: tgz sha256 mismatch (got $ACTUAL, expected $EXPECTED)"
  fi
fi

COUNT=$(find "$DEST" -name 'questions.json' | wc -l)
echo "Imported $BOOK → staging/$BOOK/ ($COUNT assessments)"
rm -rf "$CLONE_DIR"
