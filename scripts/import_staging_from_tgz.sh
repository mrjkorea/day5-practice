#!/usr/bin/env bash
# Import harvested Intermediate pack from a local export/*.tgz (when Origin git clone is unavailable).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

declare -A ORIGIN_SHA
ORIGIN_SHA[INT2A]="eebcf0226c4ff19ef503d59e6d2dc9874d3707bfeb48a32aef8bddca39ad5447"
ORIGIN_SHA[INT2B]="113c826487c71322bc171d4515245ea733bc8c1e5bbb90328d839e3f998848ff"
ORIGIN_SHA[INT2C]="15997298d478199a2a6bb8a23997ae25ecd10c59fec397342fdb5ee47c6c0089"
ORIGIN_SHA[INT3A]="6d637714944a1d4734392f992e0605ae931829cbcc30be5545778376ede2a69e"
ORIGIN_SHA[INT3B]="febd99df16367d13cda93ae1cb72ff7d9d9e0ba4067f3749d5be9ab910ad76bf"
ORIGIN_SHA[INT3C]="2bf52d5856269f476af3ba0fd0ba4140256cbdcf0b3a54da173aba2e7c7da69d"

BOOK="${1:-}"
TGZ="${2:-}"
if [[ -z "$BOOK" || -z "$TGZ" || -z "${ORIGIN_SHA[$BOOK]:-}" ]]; then
  echo "Usage: $0 INT2A|…|INT3C /path/to/BOOK-day5.tgz"
  exit 1
fi
[[ -f "$TGZ" ]] || { echo "Missing file: $TGZ"; exit 1; }

BOOK_LOWER=$(echo "$BOOK" | tr '[:upper:]' '[:lower:]')
ACTUAL=$(sha256sum "$TGZ" | awk '{print $1}')
EXPECTED="${ORIGIN_SHA[$BOOK]}"
if [[ "$ACTUAL" != "$EXPECTED" ]]; then
  echo "WARN: sha256 mismatch (got $ACTUAL, expected $EXPECTED)"
fi

WORKDIR=$(mktemp -d)
trap 'rm -rf "$WORKDIR"' EXIT
tar -xzf "$TGZ" -C "$WORKDIR"

PACK_SRC=""
for try in "$WORKDIR/staging/$BOOK" "$WORKDIR/packs" "$WORKDIR"; do
  [[ -d "$try/unit01" ]] && PACK_SRC="$try" && break
done
if [[ -z "$PACK_SRC" ]]; then
  echo "No unit01 pack found inside $TGZ"
  exit 1
fi

DEST="$ROOT/staging/$BOOK"
mkdir -p "$DEST" "$ROOT/images/$BOOK_LOWER" "$ROOT/audio/$BOOK_LOWER"
rsync -a --delete "$PACK_SRC/" "$DEST/"

for img in "$WORKDIR/images/$BOOK_LOWER" "$WORKDIR/images/${BOOK}"; do
  [[ -d "$img" ]] && rsync -a "$img/" "$ROOT/images/$BOOK_LOWER/"
done
for aud in "$WORKDIR/audio/$BOOK_LOWER" "$WORKDIR/audio/${BOOK}"; do
  [[ -d "$aud" ]] && rsync -a "$aud/" "$ROOT/audio/$BOOK_LOWER/"
done

COUNT=$(find "$DEST" -name 'questions.json' | wc -l)
echo "Imported $BOOK from tgz → staging/$BOOK/ ($COUNT assessments)"
