# INT2B Wire Status

Generated: 2026-09-18 (KST)

## Result

**INT2B is wired for GitHub Pages** on branch `intermediate-int2b` → merge to `main` (Pages source: `main` / root).

- Live path: https://mrjkorea.github.io/day5-practice/intermediate/#/int2b
- Per-assessment: `#/int2b/unit01` … `#/int2b/unit08`, `#/int2b/midterm_1_4`, `#/int2b/midterm_5_8`, `#/int2b/final`

## Playable assessments (10 / 11)

Real type-1 listen_pick_picture packs (`staging/INT2B/`, `generated: false`). **Missing choice PNGs: 0.** Zero Jay cards. Unit08 pack has 0 concrete-noun questions (phrase-only source lines skipped).

| id | count | title |
|----|------:|-------|
| unit01 | 24 | Intermediate 2B Unit 1: Hello, This is Pizza Land |
| unit02 | 30 | Intermediate 2B Unit 2: What Time is it Now? |
| unit03 | 22 | Intermediate 2B Unit 3: What Do You Want to be in the Future? |
| unit04 | 16 | Intermediate 2B Unit 4: Welcome to Seven-Eleven |
| unit05 | 28 | Intermediate 2B Unit 5: Somebody Stole My Bike! |
| unit06 | 24 | Intermediate 2B Unit 6: Welcome to Parent's Night |
| unit07 | 11 | Intermediate 2B Unit 7: Have You Seen My Transit Card? |
| unit08 | 0 | Intermediate 2B Unit 8: This is Mine! |
| midterm_1_4 | 24 | Intermediate 2B Midterm Units 1–4 |
| midterm_5_8 | 20 | Intermediate 2B Midterm Units 5–8 |
| final | 23 | Intermediate 2B Final Exam |

**Total questions shipped:** 222

## PNGs

- Required unique choice stems: **83**
- Present under `images/int2b/`: **83**
- **Missing vs packs: 0**
- Each PNG ≥ 50KB; PIL-openable; Picture Maker GenerateImage pack (no Jay cards)
- `meta.images_partial` cleared to **false** after gate pass

## Audio

- Local `audio/int2b/`: **162** mp3s matching `audio_id`
- Missing: **0** — app falls back to **Web Speech TTS** (`prompt_text`)
- Not blocking push

## App / schema

- Day5 schema: `choices` / `correct` / `image_ids` are bare `int2b_*` stems
- All questions `type: 1` (listen_pick_picture)
- Manifest `data/manifest-intermediate.json` INT2B titles/counts; `staging_note` = `wired-real`; `total_questions` = 222
- Source packs: `/workspace/int2b-ready/packs/*.json`

## Deploy confirmation

- Wire PR: https://github.com/mrjkorea/day5-practice/pull/13 — **merged** to `main`
- Docs/verify PR: (this commit) — clear `images_partial`, expand status
- Pages status: **built** (commit `5648aa5`, 2026-09-18 KST)
- Verified live (HTTP 200): intermediate hub, `staging/INT2B/unit01/questions.json` (generated=false, type 1, count 24), `images/int2b/int2b_monday.png`
- Playable assessments: **10 / 11**; pack PNG missing: **0**; questions: **222**
