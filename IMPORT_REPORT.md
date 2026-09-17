# Intermediate Day 5 — Origin harvest import report

**Last updated:** 2026-09-17 (post–INT3B ferry completion notice)

## Result summary

| Book | Harvest on Origin | Imported to GitHub | Status |
|------|-------------------|--------------------|--------|
| INT2A | Yes (`intermediate-int2a`, export tgz) | No | **ORIGIN_CLONE_FAILED** |
| INT2B | Yes (`intermediate-int2b`, export tgz) | No | **ORIGIN_CLONE_FAILED** |
| INT2C | Yes (`intermediate-int2c`, export tgz) | No | **ORIGIN_CLONE_FAILED** |
| INT3A | Unknown / not in this update | No | **ORIGIN_CLONE_FAILED** |
| INT3B | **Yes** — harvest on `main`, ferry `cursor/int3b-day5-ferry-e372`, `INT3B-day5.tgz` sha256 `febd99df…` | No | **ORIGIN_CLONE_FAILED** |
| INT3C | Pending prior ferry | No | **ORIGIN_CLONE_FAILED** |

**Real harvest packs on GitHub: 0/6.** All `staging/INT*/` on PR #1 remain **shell** JSON (TTS-only). **Do not merge PR #1 as content-complete.**

## Blocker

Cloud VM has **GitHub** credentials (`gh` push works) but **no Cursor Origin session**:

- `origin auth status` → not logged in
- `git clone https://origin.cursor.com/git/wait4languages/tmp-*.git` → no username/password
- `CURSOR_AUTH_TOKEN` / `CURSOR_API_KEY` not set in environment
- Browser `origin auth login` opened; login not completed on the agent desktop

## INT3B Origin pointers (bc-3cae94ea)

| Field | Value |
|-------|--------|
| Remote | https://origin.cursor.com/git/wait4languages/tmp-6027b4826ea45356.git |
| Harvest | `main` |
| Ferry | `cursor/int3b-day5-ferry-e372` |
| Artifact | `export/INT3B-day5.tgz` |
| sha256 | `febd99df16367d13cda93ae1cb72ff7d9d9e0ba4067f3749d5be9ab910ad76bf` |

## Unblock → import → push

**Option A — Origin auth on this environment**

1. Add environment secret `CURSOR_API_KEY` (or complete `origin auth login` on the agent desktop).
2. Re-run this agent or:

```bash
./scripts/import_staging_from_origin.sh INT2A
./scripts/import_staging_from_origin.sh INT2B
./scripts/import_staging_from_origin.sh INT2C
./scripts/import_staging_from_origin.sh INT3B
git add staging/ images/ audio/ && git commit -m "Import real INT2A–INT3B harvest from Origin"
git push -u origin cursor/intermediate-day5-practice-c003
```

**Option B — manual tgz** (from Origin `export/` after download)

```bash
./scripts/import_staging_from_tgz.sh INT3B ./INT3B-day5.tgz
```

Verify real packs: `questions.json` has `audio_id` / `pic_*` choices; `images/int3b/*.png` non-empty; meta should **not** say `Shell pack`.

Brand: **Wait for Languages** (not LAL).
