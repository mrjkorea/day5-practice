# Blocker: Cursor Origin unreachable from GitHub cloud VMs

**Status:** `ORIGIN_CLONE_FAILED` — **all six books** (last full retry **2026-09-17**, Jay GO)

## What was tried

```bash
# Direct clone (all six tmp-* remotes)
git clone --depth 1 https://origin.cursor.com/git/wait4languages/tmp-*.git

# Per-book import helper
./scripts/import_staging_from_origin.sh INT2A   # … INT3C

# Origin CLI
origin auth status    # Not logged in
origin auth login     # browser flow started; no completion on cloud VM (timeout)
```

Each HTTPS operation to `origin.cursor.com` failed with **no authentication** unless a human completes `origin auth login` in that environment.

## Impact

- **Shell packs** in `staging/INT2A/` … `staging/INT3C/` on PR #1 remain playable (text/TTS, 80% pass, localStorage).
- **Real harvest assets** (listen-and-tap picture choices, `int2a_*` / `int2b_*` PNGs, MP3 when present, `export/*.tgz`, `FERRY_*.md` trees on Origin) are **not** on GitHub.
- GitHub branches `staging-int2a` … `staging-int3c` were checked: still shell JSON, **0** intermediate PNGs under `images/int*/`.

See **`IMPORT_REPORT.md`** for the per-book table.

## Unblock options

1. **Desktop / local Cursor with Origin auth** — run `./scripts/import_staging_from_origin.sh INT2A` (etc.), commit, push to `staging-int*` or PR #1 branch.
2. **Manual tgz drop** — verify sha256 from `staging/ORIGIN_STATUS.md`, extract into `staging/INT*/` and `images/int*/`, push.
3. **Provision Origin credentials on the cloud environment** — then re-run this import job (not available on the 2026-09-17 run).

GitHub cloud agents can push to GitHub but **cannot** read Cursor Origin without an authenticated `origin` session or git credentials for `origin.cursor.com`.
