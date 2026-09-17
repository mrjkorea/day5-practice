# Intermediate Day 5 — Origin harvest import report

**Jay GO 2026-09-17** · Cloud agent `bc-3a0e5181-e3d6-5932-ad51-9210a419a7b0`

## Result summary

| Book | Origin remote | Expected branch(es) | GitHub `staging-int*` | `staging/INT*/` on PR #1 | `images/*` PNG | `audio/*` MP3 | Status |
|------|---------------|---------------------|-------------------------|---------------------------|----------------|---------------|--------|
| INT2A | [tmp-a4c737e…](https://origin.cursor.com/git/wait4languages/tmp-a4c737e083236982.git) | `main`, `intermediate-int2a` | shell only | shell (66 assessments wired) | 0 | 0 | **ORIGIN_CLONE_FAILED** |
| INT2B | [tmp-8b71226a…](https://origin.cursor.com/git/wait4languages/tmp-8b71226a906aee3d.git) | `main`, `intermediate-int2b` | shell only | shell | 0 | 0 | **ORIGIN_CLONE_FAILED** |
| INT2C | [tmp-0a5450fe…](https://origin.cursor.com/git/wait4languages/tmp-0a5450fe7d08e1b2.git) | `main`, `intermediate-int2c` | shell only | shell | 0 | 0 | **ORIGIN_CLONE_FAILED** |
| INT3A | [tmp-b8b36e4a…](https://origin.cursor.com/git/wait4languages/tmp-b8b36e4ac789c6db.git) | `main`, `intermediate-int3a` | shell only | shell | 0 | 0 | **ORIGIN_CLONE_FAILED** |
| INT3B | [tmp-6027b482…](https://origin.cursor.com/git/wait4languages/tmp-6027b4826ea45356.git) | `main`, `intermediate-int3b` | shell only | shell | 0 | 0 | **ORIGIN_CLONE_FAILED** |
| INT3C | [tmp-5845cb28…](https://origin.cursor.com/git/wait4languages/tmp-5845cb284c61d453.git) | `cos-ferry-int3c`, `intermediate-int3c` | shell only | shell | 0 | 0 | **ORIGIN_CLONE_FAILED** |

**Books landed with real harvest assets on GitHub: none (0/6).**

Shell packs remain playable on the PR branch (text + browser TTS, 80% pass). They are **not** a substitute for harvested listen-and-tap PNG/audio packs. **Do not merge PR #1 as “content complete.”**

## What was tried (2026-09-17)

1. `git clone` (depth 1) for all six `https://origin.cursor.com/git/wait4languages/tmp-*.git` URLs → `fatal: could not read Username for 'https://origin.cursor.com'`.
2. `git ls-remote` for `intermediate-int2a` … `intermediate-int3c` on each remote → same auth failure.
3. `origin auth status` → **Not logged in**.
4. `origin auth login` (browser deep link) → **timed out** waiting for human completion on the cloud VM.
5. GitHub `staging-int2a` … `staging-int3c` → still **shell** `questions.json` (no `int2a_*` / `int2b_*` PNGs under `images/int*/`).

## Unblock (Wait for Languages harvest → GitHub)

On a machine with Origin auth (`origin auth login` complete):

```bash
git clone https://github.com/mrjkorea/day5-practice
cd day5-practice
git checkout cursor/intermediate-day5-practice-c003   # or main after merge scaffolding
./scripts/import_staging_from_origin.sh INT2A
# repeat INT2B … INT3C
git add staging/ images/ audio/ data/manifest-intermediate.json
git commit -m "Import real INT2A harvest from Origin"
git push -u origin staging-int2a   # or one branch for PR #1
```

Verify after import: `questions.json` should reference `audio_id` / `pic_*` choices; `images/int2a/*.png` (etc.) should be non-empty. tgz sha256 targets are in `staging/ORIGIN_STATUS.md`.

Brand for published copy: **Wait for Languages** (not LAL).
