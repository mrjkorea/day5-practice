# INT3B Wire Status

Generated: 2026-09-18 (KST)

## Result

**INT3B is wired for GitHub Pages** on branch `intermediate-int3b` → merge to `main` (Pages source: `main` / root).

- Live path (after main deploy): https://mrjkorea.github.io/day5-practice/intermediate/#/int3b
- Per-assessment: `#/int3b/unit01` … `#/int3b/unit06`, `#/int3b/unit08`, `#/int3b/midterm_1_4`, `#/int3b/midterm_5_8`, `#/int3b/final`
- **INT3C is NOT done** — not claimed here; INT3C WIP left uncommitted.

## Playable assessments (10)

All choice PNGs present; packs are real (normalized from `int3b-ready`), not shell filler.

| id | count | title |
|----|------:|-------|
| unit01 | 30 | Intermediate 3B Unit 1: What Grade Are You In? |
| unit02 | 30 | Intermediate 3B Unit 2: Is This a Gayageum? |
| unit03 | 30 | Intermediate 3B Unit 3: Bigger Please! |
| unit04 | 30 | Intermediate 3B Unit 4: Who is This? |
| unit05 | 30 | Intermediate 3B Unit 5: EAT UP |
| unit06 | 30 | Intermediate 3B Unit 6: WHAT FRUIT ARE THESE? |
| unit08 | 30 | Intermediate 3B Unit 8: Do You Like Korea? |
| midterm_1_4 | 34 | Intermediate 3B Midterm Units 1–4 |
| midterm_5_8 | 34 | Intermediate 3B Midterm Units 5–8 |
| final | 35 | Intermediate 3B Final Exam |

**Total questions shipped:** 317

## Skipped

- **unit07** — incomplete Hermes source (missing q18–q21; 26/30). Stub `questions.json` with 0 items left on disk; **removed from manifest** so shell filler is not published.

## PNGs

- Required list: `/workspace/int3b-ready/REQUIRED_PNGS.txt` → **98**
- Present under `images/int3b/`: **98**
- **Missing: none**

## Audio

- Local `audio/int3b/`: **0** mp3s
- App already falls back to **Web Speech TTS** (`prompt_text`) when mp3 play fails / missing
- Not blocking push

## App / schema

- Normalized ready JSON → Day5 schema: `choices` / `correct` / `image_ids` are bare `i3b_*` stems (Basic-compatible)
- `assets/js/app.js` `isPictureChoice` accepts `pic_*`, `int*`, and `/^i[23][abc]?_/` (covers `i3b_*`)
- Manifest `data/manifest-intermediate.json` INT3B titles/counts updated; `staging_note` set to wired-real

## Not included in commit

- Large REUSE tarballs / MATCH_REPORT / DRAW_QUEUE under `staging/INT3B/`
- Any INT3C audio/images/questions WIP

## Push

See git log / PR for `intermediate-int3b`. Pages: deploy from **main**.
