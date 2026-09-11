# Blocker: Cursor Origin unreachable from GitHub cloud VMs

**Status:** `ORIGIN_CLONE_FAILED` (all six books, retried 2026-09-11)

## What was tried

```bash
./scripts/import_staging_from_origin.sh INT2A
./scripts/import_staging_from_origin.sh INT2B
./scripts/import_staging_from_origin.sh INT2C
./scripts/import_staging_from_origin.sh INT3A
./scripts/import_staging_from_origin.sh INT3B
./scripts/import_staging_from_origin.sh INT3C
```

Each clone to `https://origin.cursor.com/git/wait4languages/tmp-*.git` failed with **no authentication**. `origin auth status` reports *Not logged in*. No Origin or GitHub device-login was started (per instructions).

## Impact

- **Shell packs** in `staging/INT2A/` … `staging/INT3C/` remain playable (text/TTS, 80% pass, localStorage).
- **Real assets** (PNG/audio packs from Origin) are **not** on GitHub yet.

## Unblock options

1. **Local machine with Origin auth** — run `./scripts/import_staging_from_origin.sh INT2A` (etc.), commit, push to `staging-int*` branches or this PR.
2. **Manual tgz drop** — verify sha256 from `staging/ORIGIN_STATUS.md`, extract into `staging/INT*/` and `images/int*/`, push.
3. **Cursor desktop session** — import from Origin in an environment where `origin auth login` is already complete, then push to `mrjkorea/day5-practice`.

GitHub cloud agents can push to GitHub but **cannot** reach Cursor Origin without a pre-provisioned Origin credential on the VM.
