# INT3C Wire Status

Generated: 2026-09-18 (KST)

## Result

**INT3C is wired for GitHub Pages** on branch `intermediate-int3c` → merge to `main` (Pages source: `main` / root).

- Live path (after main deploy): https://mrjkorea.github.io/day5-practice/intermediate/#/int3c
- Per-assessment: `#/int3c/unit01` … `#/int3c/unit08`, `#/int3c/midterm_1_4`, `#/int3c/midterm_5_8`, `#/int3c/final`

## Playable assessments (11 / 11)

Real type-1 listen_pick_picture packs from Hermes (`staging/INT3C/hermes_packs/`, transcript `bc-3888b75c`). Shell filler replaced (`generated: false`). **Missing choice PNGs: 0.**

| id | count | title |
|----|------:|-------|
| unit01 | 30 | Intermediate 3C Unit 1: Do You Like Sweet Food? |
| unit02 | 30 | Intermediate 3C Unit 2: Do Not Yell |
| unit03 | 30 | Intermediate 3C Unit 3: Can I Play Outside? |
| unit04 | 30 | Intermediate 3C Unit 4: Let's Play an RPG |
| unit05 | 30 | Intermediate 3C Unit 5: What Do You Have? |
| unit06 | 30 | Intermediate 3C Unit 6: How Many Cities? |
| unit07 | 30 | Intermediate 3C Unit 7: Can You Fly? |
| unit08 | 30 | Intermediate 3C Unit 8: What Time Is It? |
| midterm_1_4 | 34 | Intermediate 3C Midterm Units 1–4 |
| midterm_5_8 | 34 | Intermediate 3C Midterm Units 5–8 |
| final | 35 | Intermediate 3C Final Exam |

**Total questions shipped:** 343

## PNGs

- Unique pack choice ids required: **242**
- Present under `images/int3c/`: **332** (242 pack + orphaned REUSE leftovers)
- **Missing vs packs: 0**
- Picture Maker pack NEED_NEW (228) completed into `images/int3c/`

## Audio

- Local `audio/int3c/`: **343** mp3s (Fish); all prompt_audio stems present

## App / schema

- Day5 schema: `choices` / `correct` / `image_ids` are bare `int3c_*` stems
- `assets/js/app.js` `isPictureChoice` accepts `pic_*`, `int*` (covers `int3c_*`), and `/^i[23][abc]?_/`
- Manifest `data/manifest-intermediate.json` INT3C titles/counts updated; `staging_note` = wired-real

## Not included in commit

- Large REUSE tarballs / MATCH_REPORT / DRAW_QUEUE / `pics/` / `pics_pack/` under `staging/INT3C/`
- `_shell_backup/` (local only)

## Push

Branch `intermediate-int3c` → PR → merge `main`. Pages deploy from **main**.

## Deploy confirmation

- PR: https://github.com/mrjkorea/day5-practice/pull/3 — **merged** to `main` (2026-09-18 KST)
- Pages status: **built**
- Verified live (HTTP 200): intermediate hub, `staging/INT3C/unit01/questions.json` (generated=false, type 1), `images/int3c/int3c_u01_sweet_food_sweet_food.png`, `audio/int3c/u01_q01.mp3`
- Playable assessments: **11 / 11**; pack PNG missing: **0**; questions: **343**
