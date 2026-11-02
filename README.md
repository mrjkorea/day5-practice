# MRJ Day 5 practice

Static GitHub Pages app for Conversation Basic and Intermediate Day 5 unit tests.

- **Basic:** https://mrjkorea.github.io/day5-practice/
- **Intermediate:** https://mrjkorea.github.io/day5-practice/intermediate/
- No login. Scores in `localStorage`.
- Pass mark: 80%.
- **Teacher unlock:** After MRJ sign-in, use the **Teacher** chip (PIN) → **Unlock** panel or **Start from here** on a test row. Saves per student in `localStorage` (`d5v2-teacher-<student>` and `d5v2-lock-<student>-<book>`). **Temporary `UNLOCK_ALL = true`** in `assets/js/app.js` keeps every test open until Jay turns it off (`UNLOCK_ALL = false`); teacher grants still save and apply once that flag is off.
- **Conversation Review** merged unit tests (Basic / Int 2 / Int 3): see [REVIEW_UNIT_TESTS.md](REVIEW_UNIT_TESTS.md).
- Basic: 33 assessments (A/B/C), pictures under `pictures/`, audio under `audio/`.
- Intermediate: 66 assessments (INT2A–INT3C), packs under `staging/INT*/`.

Pages source: **Deploy from branch `main` / root**.

- **INT3B (real packs):** https://mrjkorea.github.io/day5-practice/intermediate/#/int3b — all 11 packs incl. unit07 (built 2026-09-25); Fish mp3s baked for every question.
- Optional question field `speak_text`: the line spoken (TTS fallback) when `prompt_text` is only an on-screen instruction, so the audio sentence is not printed.
- Live inventory: see `/workspace/day5-audit/INVENTORY.md` on the build box.


## Intermediate staging (Origin → GitHub)

| Book | GitHub branch | Folder | Origin status |
|------|---------------|--------|---------------|
| INT2A | `staging-int2a` | `staging/INT2A/` | ORIGIN_CLONE_FAILED |
| INT2B | `staging-int2b` | `staging/INT2B/` | ORIGIN_CLONE_FAILED |
| INT2C | `staging-int2c` | `staging/INT2C/` | ORIGIN_CLONE_FAILED |
| INT3A | `staging-int3a` | `staging/INT3A/` | ORIGIN_CLONE_FAILED |
| INT3B | `staging-int3b` | `staging/INT3B/` | ORIGIN_CLONE_FAILED |
| INT3C | `staging-int3c` | `staging/INT3C/` | ORIGIN_CLONE_FAILED |

Import when Origin auth is available:

```bash
./scripts/import_staging_from_origin.sh INT2A
./scripts/import_staging_from_origin.sh INT2B
./scripts/import_staging_from_origin.sh INT3C   # uses cos-ferry-int3c branch
```

See `IMPORT_REPORT.md`, `staging/ORIGIN_STATUS.md`, and per-book `staging/INT*/ORIGIN.md`.

Shell packs: `python3 scripts/setup_staging_shells.py` (from generated `int*` if present).

## Update prompt
When you push new code, set ONE new build value everywhere: `version.json`, plus in index.html and intermediate/index.html the mrj-build meta, `window.D5_BUILD_ID`, and the ?v= on mrj-scores.js, version-watch.js and app.js (test/score_log.test.js checks this). Open tabs then get a "Day 5 has an update. Reload now?" prompt (never mid-test).
