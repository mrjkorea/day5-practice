# INT3A Wire Status

Generated: 2026-09-18 (KST)

## Result

**INT3A is wired for GitHub Pages** on branch `intermediate-int3a` → merge to `main` (Pages source: `main` / root).

- Live path (after main deploy): https://mrjkorea.github.io/day5-practice/intermediate/#/int3a
- Per-assessment: `#/int3a/unit01` … `#/int3a/unit08`, `#/int3a/midterm_1_4`, `#/int3a/midterm_5_8`, `#/int3a/final`

## Playable assessments (11 / 11)

Real type-1 listen_pick_picture packs (`staging/INT3A/`, `generated: false`). **Missing choice PNGs: 0.**

| id | count | title |
|----|------:|-------|
| unit01 | 30 | Intermediate 3A Unit 1: I Can Draw a Monster |
| unit02 | 30 | Intermediate 3A Unit 2: What Flavor Do You Like? |
| unit03 | 30 | Intermediate 3A Unit 3: Opposites |
| unit04 | 30 | Intermediate 3A Unit 4: How Old Is He? |
| unit05 | 30 | Intermediate 3A Unit 5: What Is This Bug? |
| unit06 | 30 | Intermediate 3A Unit 6: What Is Your Name? |
| unit07 | 30 | Intermediate 3A Unit 7: Gym Class |
| unit08 | 30 | Intermediate 3A Unit 8: Introduction |
| midterm_1_4 | 34 | Intermediate 3A Midterm Units 1–4 |
| midterm_5_8 | 34 | Intermediate 3A Midterm Units 5–8 |
| final | 35 | Intermediate 3A Final Exam |

**Total questions shipped:** 343

## PNGs

- Required unique choice stems: **89**
- Present under `images/int3a/`: **89**
- **Missing vs packs: 0**
- Picture Maker pack completed into `images/int3a/`

## Audio

- Local `audio/int3a/`: **280** mp3s (units u01–u08 + mid14 + partial mid58)
- Missing: **63** (`final` 35 + `midterm_5_8` 28) — app falls back to **Web Speech TTS** (`prompt_text`) same as INT3B
- Not blocking push

## App / schema

- Day5 schema: `choices` / `correct` / `image_ids` are bare `int3a_*` stems
- `assets/js/app.js` `isPictureChoice` accepts `pic_*`, `int*` (covers `int3a_*`), and `/^i[23][abc]?_/`
- Manifest `data/manifest-intermediate.json` INT3A titles/counts updated; `staging_note` = wired-real

## Not included in commit

- DRAW_QUEUE / SPEC / NEED_NEW / `_shell_backup/` under `staging/INT3A/`
- INT2A/B/C and INT3B/C WIP

## Push

Branch `intermediate-int3a` → PR → merge `main`. Pages deploy from **main**.

## Deploy confirmation

- PR: https://github.com/mrjkorea/day5-practice/pull/5 — **merged** to `main` (2026-09-18 KST)
- Pages status: **built**
- Verified live (HTTP 200): intermediate hub, `staging/INT3A/unit01/questions.json` (generated=false, type 1), `images/int3a/int3a_draw-monster_circle.png`, `audio/int3a/u01_q01.mp3`
- Playable assessments: **11 / 11**; pack PNG missing: **0**; questions: **343**
