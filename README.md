# MRJ Day 5 practice

Static GitHub Pages app for Conversation Basic and Intermediate Day 5 unit tests.

- **Basic:** https://mrjkorea.github.io/day5-practice/
- **Intermediate:** https://mrjkorea.github.io/day5-practice/intermediate/
- No login. Scores in `localStorage`.
- Pass mark: 80%.
- Basic: 33 assessments (A/B/C), pictures under `pictures/`, audio under `audio/`.
- Intermediate: 66 assessments (INT2A–INT3C), 8 units + 2 midterms + final per book (~30 Q/unit).

Pages source: **Deploy from branch `main` / root** (same pattern as youtube-free-practice).

To regenerate intermediate shell packs: `python3 scripts/generate_intermediate.py`

### INT3C staging

Real INT3C pack target: `staging/INT3C/` (wired in manifest). Import from Cursor Origin:

```bash
./scripts/import_int3c_from_origin.sh          # branch cos-ferry-int3c (packs only)
./scripts/import_int3c_from_origin.sh main     # full tree
```

**Status:** `ORIGIN_CLONE_FAILED` on this agent — shell packs in `staging/INT3C/` until Origin auth is available. See `staging/INT3C/ORIGIN.md`.
