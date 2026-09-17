# INT2A Wire Status

Generated: 2026-09-18 (KST)

## Result

**INT2A is wired for GitHub Pages** on branch `intermediate-int2a` → merge to `main` (Pages source: `main` / root).

- Live path: https://mrjkorea.github.io/day5-practice/intermediate/#/int2a
- Per-assessment: `#/int2a/unit01` … `#/int2a/unit08`, `#/int2a/midterm_1_4`, `#/int2a/midterm_5_8`, `#/int2a/final`

## Playable assessments (11 / 11)

Real type-1 listen_pick_picture packs (`staging/INT2A/`, `generated: false`). **Missing choice PNGs: 0.** Zero Jay cards.

| id | count | title |
|----|------:|-------|
| unit01 | 29 | Intermediate 2A Unit 1: How is the Weather? |
| unit02 | 24 | Intermediate 2A Unit 2: There are Snakes! |
| unit03 | 25 | Intermediate 2A Unit 3: Can You Speak Chinese? |
| unit04 | 24 | Intermediate 2A Unit 4: What do you Want? |
| unit05 | 24 | Intermediate 2A Unit 5: Where is My Phone? |
| unit06 | 27 | Intermediate 2A Unit 6: Look at This Funny Video |
| unit07 | 27 | Intermediate 2A Unit 7: Where is the Teacher? |
| unit08 | 21 | Intermediate 2A Unit 8: What Do You Do After School? |
| midterm_1_4 | 27 | Intermediate 2A Midterm Units 1–4 |
| midterm_5_8 | 29 | Intermediate 2A Midterm Units 5–8 |
| final | 30 | Intermediate 2A Final Exam |

**Total questions shipped:** 287

## PNGs

- Required unique choice stems: **90**
- Present under `images/int2a/`: **90**
- **Missing vs packs: 0**
- Each PNG ≥ 50KB; PIL-openable; Picture Maker GenerateImage pack (no Jay cards)
- `meta.images_partial` cleared to **false** after gate pass

## Audio

- Local `audio/int2a/`: **259** mp3s matching `audio_id`
- Missing: **28** — app falls back to **Web Speech TTS** (`prompt_text`)
- Not blocking push

## App / schema

- Day5 schema: `choices` / `correct` / `image_ids` are bare `int2a_*` stems
- All questions `type: 1` (listen_pick_picture)
- Manifest `data/manifest-intermediate.json` INT2A titles/counts; `staging_note` = `wired-real`; `total_questions` = 287
- Source packs: `/workspace/int2a-ready/packs/*.json`

## Deploy confirmation

- Wire PR: https://github.com/mrjkorea/day5-practice/pull/9 — **merged** to `main`
- Docs PR: https://github.com/mrjkorea/day5-practice/pull/10 — **merged** to `main`
- Pages status: **built** (commit `40e7765`, 2026-09-18 KST)
- Verified live (HTTP 200): intermediate hub, `staging/INT2A/unit01/questions.json` (generated=false, type 1, count 29), `images/int2a/int2a_hot.png` (+ washroom/funny/bike/blanket/ants)
- Playable assessments: **11 / 11**; pack PNG missing: **0**; questions: **287**
