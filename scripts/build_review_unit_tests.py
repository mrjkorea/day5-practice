#!/usr/bin/env python3
"""Build merged Conversation Review unit tests (questions.json + v2 book JSON)."""
from __future__ import annotations

import json
import os
import re
from collections import defaultdict
from typing import Any, Dict, List, Sequence, Tuple

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

QUESTIONS_PER_UNIT = 4
PASS_PERCENT = 80

# review_id -> (unit_lo, unit_hi) within each book
REVIEW_SLICES = {
    "u1": (1, 2),
    "u2": (3, 4),
    "u3": (5, 6),
    "u4": (7, 8),
}

REVIEW_TITLES = {
    "u1": "Review ONE",
    "u2": "Review TWO",
    "u3": "Review THREE",
    "u4": "Review FOUR",
}

COURSES: List[Dict[str, Any]] = [
    {
        "course_id": "basic_review",
        "label": "Basic Review (A + B + C)",
        "manifest": "data/v2/manifest-basic.json",
        "books": [
            ("basic_a", "basic_a", "ba"),
            ("basic_b", "basic_b", "bb"),
            ("basic_c", "basic_c", "bc"),
        ],
        "questions_path": "{book}/unit{unit:02d}/questions.json",
        "v2_path": "data/v2/{book}.json",
        "pack_dir": "basic_review",
    },
    {
        "course_id": "int2_review",
        "label": "Int 2 Review (2A + 2B + 2C)",
        "manifest": "data/v2/manifest-int.json",
        "books": [
            ("int2a", "INT2A", "i2a"),
            ("int2b", "INT2B", "i2b"),
            ("int2c", "INT2C", "i2c"),
        ],
        "questions_path": "staging/{folder}/unit{unit:02d}/questions.json",
        "v2_path": "data/v2/{book}.json",
        "pack_dir": "int2_review",
    },
    {
        "course_id": "int3_review",
        "label": "Int 3 Review (3A + 3B + 3C)",
        "manifest": "data/v2/manifest-int.json",
        "books": [
            ("int3a", "INT3A", "i3a"),
            ("int3b", "INT3B", "i3b"),
            ("int3c", "INT3C", "i3c"),
        ],
        "questions_path": "staging/{folder}/unit{unit:02d}/questions.json",
        "v2_path": "data/v2/{book}.json",
        "pack_dir": "int3_review",
    },
]

GATE_TYPES_V2 = {1, 2, 8}


def load_json(path: str) -> Any:
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def save_json(path: str, data: Any) -> None:
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write("\n")


def interleave_buckets(buckets: List[List[dict]]) -> List[dict]:
    out: List[dict] = []
    if not buckets:
        return out
    max_len = max(len(b) for b in buckets)
    for pos in range(max_len):
        for b in buckets:
            if pos < len(b):
                out.append(b[pos])
    return out


def pick_even_mix(questions: List[dict], n: int) -> List[dict]:
    """Pick n questions with an even spread across types (deterministic)."""
    questions = sorted(questions, key=lambda q: q.get("id", ""))
    if len(questions) <= n:
        return questions

    by_type: Dict[Any, List[dict]] = defaultdict(list)
    for q in questions:
        by_type[q.get("type")].append(q)

    types = sorted(by_type.keys(), key=lambda t: (t is None, t))
    if not types:
        return questions[:n]

    picked: List[dict] = []
    idx = 0
    while len(picked) < n and any(by_type.values()):
        t = types[idx % len(types)]
        pool = by_type[t]
        if pool:
            picked.append(pool.pop(0))
        idx += 1

    if len(picked) < n:
        rest = [q for qs in by_type.values() for q in qs]
        for q in rest:
            if len(picked) >= n:
                break
            picked.append(q)
    return picked[:n]


def pick_v2_even_mix(items: List[dict], n: int) -> List[dict]:
    items = sorted(items, key=lambda x: x.get("id", ""))
    if len(items) <= n:
        return items
    by_type: Dict[int, List[dict]] = defaultdict(list)
    for it in items:
        by_type[int(it.get("t", 0))].append(it)
    types = sorted(by_type.keys())
    if not types:
        return items[:n]
    picked: List[dict] = []
    idx = 0
    while len(picked) < n and any(by_type.values()):
        t = types[idx % len(types)]
        pool = by_type[t]
        if pool:
            picked.append(pool.pop(0))
        idx += 1
    if len(picked) < n:
        rest = [it for pool in by_type.values() for it in pool]
        picked.extend(rest[: n - len(picked)])
    return picked[:n]


def rekey_question(q: dict, new_id: str, source_level: str, source_unit: int) -> dict:
    out = dict(q)
    out["id"] = new_id
    out["level"] = source_level
    out["unit"] = source_unit
    out["merge_source_book"] = source_level
    out["merge_source_unit"] = source_unit
    out["merge_source_id"] = q.get("id")
    return out


def rekey_v2_item(it: dict, new_id: str) -> dict:
    out = dict(it)
    out["id"] = new_id
    return out


def build_questions_pack(
    course: dict,
    review_id: str,
    unit_lo: int,
    unit_hi: int,
) -> Tuple[dict, List[dict]]:
    all_q: List[dict] = []
    units_covered: List[int] = []

    for book_id, folder, short in course["books"]:
        for unit in range(unit_lo, unit_hi + 1):
            units_covered.append(unit)
            path = os.path.join(
                ROOT,
                course["questions_path"].format(book=book_id, folder=folder, unit=unit),
            )
            if not os.path.isfile(path):
                raise FileNotFoundError(path)
            data = load_json(path)
            picked = pick_even_mix(data.get("questions", []), QUESTIONS_PER_UNIT)
            for i, q in enumerate(picked, start=1):
                new_id = f"{course['course_id']}_{review_id}_{short}_u{unit:02d}_q{i:02d}"
                all_q.append(rekey_question(q, new_id, book_id, unit))

    buckets: List[List[dict]] = []
    for book_id, folder, short in course["books"]:
        for unit in range(unit_lo, unit_hi + 1):
            chunk = [
                q
                for q in all_q
                if q.get("merge_source_book") == book_id and q.get("merge_source_unit") == unit
            ]
            buckets.append(chunk)
    interleaved = interleave_buckets(buckets)

    count = len(interleaved)
    pass_need = max(1, int(round(count * PASS_PERCENT / 100.0)))

    meta = {
        "level": course["course_id"],
        "title": f"{course['label']} — {REVIEW_TITLES[review_id]}",
        "kind": "review",
        "review_id": review_id,
        "units_covered": sorted(set(units_covered)),
        "books_mixed": [b[0] for b in course["books"]],
        "count": count,
        "pass_percent": PASS_PERCENT,
        "pass_need": pass_need,
        "schema": "id,type,prompt_text,audio_id,image_ids,choices,correct,why_wrong,unit,level",
        "merge_rule": "even_share_per_book_unit",
        "questions_per_book_unit": QUESTIONS_PER_UNIT,
    }
    return {"meta": meta, "questions": interleaved}, interleaved


def compute_bp_from_v2_items(items: Sequence[dict]) -> dict:
    n = len(items)
    pass_need = max(1, int(round(n * PASS_PERCENT / 100.0)))
    gate_n = sum(1 for it in items if int(it.get("t", 0)) in GATE_TYPES_V2)
    gate_right_need = max(1, int(round(gate_n * PASS_PERCENT / 100.0))) if gate_n else 0
    types: Dict[str, int] = defaultdict(int)
    for it in items:
        types[str(int(it.get("t", 0)))] += 1
    return {
        "n": n,
        "pass": pass_need,
        "gateN": gate_n,
        "gateNeed": gate_right_need,
        "types": dict(types),
    }


def build_v2_book(course: dict) -> dict:
    units: Dict[str, dict] = {}
    tests: List[dict] = []
    v2_cache: Dict[str, dict] = {}

    for review_id, (unit_lo, unit_hi) in REVIEW_SLICES.items():
        unit_keys: List[str] = []

        for book_id, folder, short in course["books"]:
            if book_id not in v2_cache:
                v2_path = os.path.join(ROOT, course["v2_path"].format(book=book_id))
                v2_cache[book_id] = load_json(v2_path)
            book = v2_cache[book_id]
            for unit in range(unit_lo, unit_hi + 1):
                unit_key = f"{review_id}_{short}_u{unit:02d}"
                unit_keys.append(unit_key)
                src_unit = book["units"][f"unit{unit:02d}"]
                picked = pick_v2_even_mix(src_unit.get("items", []), QUESTIONS_PER_UNIT)
                items = []
                for i, it in enumerate(picked, start=1):
                    new_id = f"{course['course_id']}-{review_id}-{short}-u{unit:02d}-{i:02d}"
                    items.append(rekey_v2_item(it, new_id))
                units[unit_key] = {
                    "title": f"{book.get('label', book_id)} Unit {unit}",
                    "items": items,
                }
        buckets: List[List[dict]] = []
        for book_id, folder, short in course["books"]:
            for unit in range(unit_lo, unit_hi + 1):
                unit_key = f"{review_id}_{short}_u{unit:02d}"
                buckets.append(units[unit_key]["items"])

        interleaved = interleave_buckets(buckets)

        bp = compute_bp_from_v2_items(interleaved)
        tests.append(
            {
                "id": review_id,
                "title": REVIEW_TITLES[review_id],
                "units": unit_keys,
                "items": interleaved,
                "bp": bp,
            }
        )

    return {
        "book": course["course_id"],
        "label": course["label"],
        "level": "review",
        "units": units,
        "tests": tests,
    }


def wire_manifest(manifest_path: str, course_id: str, label: str) -> None:
    path = os.path.join(ROOT, manifest_path)
    manifest = load_json(path)
    entry = {
        "id": course_id,
        "label": label,
        "file": f"data/v2/{course_id}.json",
    }
    books = manifest.get("books", [])
    if any(b.get("id") == course_id for b in books):
        manifest["books"] = [entry if b.get("id") == course_id else b for b in books]
    else:
        books.append(entry)
        manifest["books"] = books
    save_json(path, manifest)


def main() -> None:
    for course in COURSES:
        pack_root = os.path.join(ROOT, course["pack_dir"])
        for review_id, (unit_lo, unit_hi) in REVIEW_SLICES.items():
            pack, _ = build_questions_pack(course, review_id, unit_lo, unit_hi)
            out = os.path.join(pack_root, review_id, "questions.json")
            save_json(out, pack)
            print("wrote", out, "count=", pack["meta"]["count"])

        v2_book = build_v2_book(course)
        v2_out = os.path.join(ROOT, "data", "v2", f"{course['course_id']}.json")
        save_json(v2_out, v2_book)
        print("wrote", v2_out)

        wire_manifest(course["manifest"], course["course_id"], course["label"])
        print("manifest", course["manifest"], "->", course["course_id"])


if __name__ == "__main__":
    main()
