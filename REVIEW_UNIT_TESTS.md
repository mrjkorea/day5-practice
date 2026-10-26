# Conversation Review — merged Day 5 unit tests

Merged **Review** unit tests mix an even share of Day 5 items from the six book-units in each Review slice (three books × two units). Existing per-book midterm/final routes are unchanged.

## Regenerate packs

```bash
python3 scripts/build_review_unit_tests.py
```

## Student URLs (80% pass)

Base: https://mrjkorea.github.io/day5-practice/

### Basic Review (`basic_review`)

| Review | Units covered | Hash route |
|--------|----------------|------------|
| ONE | A/B/C U1–U2 | `#/basic_review/u1` |
| TWO | A/B/C U3–U4 | `#/basic_review/u2` |
| THREE | A/B/C U5–U6 | `#/basic_review/u3` |
| FOUR | A/B/C U7–U8 | `#/basic_review/u4` |

Full examples:

- https://mrjkorea.github.io/day5-practice/#/basic_review/u1
- https://mrjkorea.github.io/day5-practice/#/basic_review/u4

### Int 2 Review (`int2_review`) — intermediate hub

| Review | Units covered | Hash route |
|--------|----------------|------------|
| ONE | 2A/2B/2C U1–U2 | `#/int2_review/u1` |
| TWO | 2A/2B/2C U3–U4 | `#/int2_review/u2` |
| THREE | 2A/2B/2C U5–U6 | `#/int2_review/u3` |
| FOUR | 2A/2B/2C U7–U8 | `#/int2_review/u4` |

- https://mrjkorea.github.io/day5-practice/intermediate/#/int2_review/u1

### Int 3 Review (`int3_review`) — intermediate hub

| Review | Units covered | Hash route |
|--------|----------------|------------|
| ONE | 3A/3B/3C U1–U2 | `#/int3_review/u1` |
| TWO | 3A/3B/3C U3–U4 | `#/int3_review/u2` |
| THREE | 3A/3B/3C U5–U6 | `#/int3_review/u3` |
| FOUR | 3A/3B/3C U7–U8 | `#/int3_review/u4` |

- https://mrjkorea.github.io/day5-practice/intermediate/#/int3_review/u1

## `questions.json` packs (source artifacts)

| Course | Paths |
|--------|--------|
| Basic | `basic_review/u1` … `basic_review/u4/questions.json` |
| Int 2 | `int2_review/u1` … `int2_review/u4/questions.json` |
| Int 3 | `int3_review/u1` … `int3_review/u4/questions.json` |

Each pack: **24** questions (4 per book-unit), `pass_percent` / v2 `bp.pass` = **80%** (19/24 rounded to **20** correct on the live v2 engine).
