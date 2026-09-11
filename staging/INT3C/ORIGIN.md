# INT3C staging pack

**Status: `ORIGIN_CLONE_FAILED`**

This cloud agent could not authenticate to Cursor Origin to import the real INT3C pack.

## Source of truth (Cursor Origin)

| Item | Location |
|------|----------|
| Git | https://origin.cursor.com/git/wait4languages/tmp-5845cb284c61d453.git |
| Codebase | https://cursor.com/codebase/wait4languages/tmp-5845cb284c61d453 |
| Full tree | branch `main` (packs, `images/int3c`, specs, tgz) |
| Packs only | branch `cos-ferry-int3c` |
| Artifact | sha256 `2bf52d5856269f476af3ba0fd0ba4140256cbdcf0b3a54da173aba2e7c7da69d` (1.89MB tgz) |

## Current contents

Shell question packs (text/TTS, no images) so Intermediate 3C stays playable until Origin import succeeds.

## Import (when Origin auth is available)

```bash
./scripts/import_int3c_from_origin.sh
```

Or manually:

```bash
git clone --branch cos-ferry-int3c https://origin.cursor.com/git/wait4languages/tmp-5845cb284c61d453.git /tmp/int3c-origin
rsync -a /tmp/int3c-origin/packs/ staging/INT3C/
rsync -a /tmp/int3c-origin/images/int3c/ images/int3c/
# Update data/manifest-intermediate.json counts/titles from pack meta if needed
```
