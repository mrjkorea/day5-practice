# MRJ Day 5 practice

Static GitHub Pages app for Conversation Basic and Intermediate Day 5 unit tests.

- **Basic:** https://mrjkorea.github.io/day5-practice/
- **Intermediate:** https://mrjkorea.github.io/day5-practice/intermediate/
- No login. Scores in `localStorage`.
- Pass mark: 80%.
- Basic: 33 assessments (A/B/C), pictures under `pictures/`, audio under `audio/`.
- Intermediate: 66 assessments (INT2A–INT3C), packs under `staging/INT*/`.

Pages source: **Deploy from branch `main` / root**.

## Intermediate staging (Origin → GitHub)

| Book | GitHub branch | Folder | Origin status |
|------|---------------|--------|---------------|
| INT2A | `staging-int2a` | `staging/INT2A/` | ORIGIN_CLONE_FAILED |
| INT2B | `staging-int2b` | `staging/INT2B/` | shell (Origin URL TBD) |
| INT2C | `staging-int2c` | `staging/INT2C/` | ORIGIN_CLONE_FAILED |
| INT3A | `staging-int3a` | `staging/INT3A/` | ORIGIN_CLONE_FAILED |
| INT3B | `staging-int3b` | `staging/INT3B/` | ORIGIN_CLONE_FAILED |
| INT3C | `staging-int3c` | `staging/INT3C/` | ORIGIN_CLONE_FAILED |

Import when Origin auth is available:

```bash
./scripts/import_staging_from_origin.sh INT2A
./scripts/import_staging_from_origin.sh INT3C   # uses cos-ferry-int3c branch
```

See `staging/ORIGIN_STATUS.md` and per-book `staging/INT*/ORIGIN.md`.

Shell packs: `python3 scripts/setup_staging_shells.py` (from generated `int*` if present).
