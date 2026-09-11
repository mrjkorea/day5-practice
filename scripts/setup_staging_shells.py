#!/usr/bin/env python3
"""Copy shell packs into staging/INT*/ and update manifest-intermediate.json."""
import json
import os
import shutil

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MANIFEST = os.path.join(ROOT, "data", "manifest-intermediate.json")

BOOKS = {
    "int2a": "INT2A",
    "int2b": "INT2B",
    "int2c": "INT2C",
    "int3a": "INT3A",
    "int3b": "INT3B",
    "int3c": "INT3C",
}

ORIGIN_SOURCES = {
    "INT2A": {
        "git": "https://origin.cursor.com/git/wait4languages/tmp-a4c737e083236982.git",
        "branch": "main",
        "path": "staging/INT2A/",
        "sha256": "eebcf0226c4ff19ef503d59e6d2dc9874d3707bfeb48a32aef8bddca39ad5447",
    },
    "INT2B": {
        "git": "https://origin.cursor.com/git/wait4languages/tmp-8b71226a906aee3d.git",
        "branch": "main",
        "path": "main (~133MB, 157 PNGs, 11 packs)",
        "sha256": "113c826487c71322bc171d4515245ea733bc8c1e5bbb90328d839e3f998848ff",
    },
    "INT2C": {
        "git": "https://origin.cursor.com/git/wait4languages/tmp-0a5450fe7d08e1b2.git",
        "branch": "main",
        "path": "local staging assembled",
        "sha256": "15997298d478199a2a6bb8a23997ae25ecd10c59fec397342fdb5ee47c6c0089",
    },
    "INT3A": {
        "git": "https://origin.cursor.com/git/wait4languages/tmp-b8b36e4ac789c6db.git",
        "branch": "main",
        "path": "staging/INT3A/",
        "sha256": "6d637714944a1d4734392f992e0605ae931829cbcc30be5545778376ede2a69e",
    },
    "INT3B": {
        "git": "https://origin.cursor.com/git/wait4languages/tmp-6027b4826ea45356.git",
        "branch": "main",
        "path": "main",
        "sha256": "f3a34700218610368994c221476d5288c4e88706cd1e0659836542645bccc8da",
    },
    "INT3C": {
        "git": "https://origin.cursor.com/git/wait4languages/tmp-5845cb284c61d453.git",
        "branch": "cos-ferry-int3c (packs) / main (full)",
        "path": "staging/INT3C/",
        "sha256": "2bf52d5856269f476af3ba0fd0ba4140256cbdcf0b3a54da173aba2e7c7da69d",
    },
}


def copy_shell(book_id, folder):
    src = os.path.join(ROOT, book_id)
    dst = os.path.join(ROOT, "staging", folder)
    if not os.path.isdir(src):
        if os.path.isdir(dst):
            return
        raise SystemExit(f"Missing source {src}")
    os.makedirs(dst, exist_ok=True)
    for name in os.listdir(src):
        if name == "ORIGIN.md":
            continue
        s, d = os.path.join(src, name), os.path.join(dst, name)
        if os.path.isdir(s):
            if os.path.exists(d):
                shutil.rmtree(d)
            shutil.copytree(s, d)
        else:
            shutil.copy2(s, d)
    img = os.path.join(ROOT, "images", book_id)
    os.makedirs(img, exist_ok=True)
    keep = os.path.join(img, ".gitkeep")
    if not os.path.exists(keep):
        open(keep, "a").close()


def write_origin_md(folder, book_id):
    src = ORIGIN_SOURCES.get(folder, {})
    path = os.path.join(ROOT, "staging", folder, "ORIGIN.md")
    lines = [
        f"# {folder} staging pack\n",
        "**Status: `ORIGIN_CLONE_FAILED`**\n",
        "Shell pack — playable via TTS until Origin import succeeds.\n",
    ]
    if src:
        lines += [
            "## Origin source\n",
            f"- Git: {src['git']}\n",
            f"- Branch/path: {src['branch']} / {src['path']}\n",
            f"- tgz sha256: `{src['sha256']}`\n",
            f"- GitHub branch: `staging-{book_id}`\n",
        ]
    lines += ["\nImport: `./scripts/import_staging_from_origin.sh " + folder + "`\n"]
    with open(path, "w", encoding="utf-8") as f:
        f.writelines(lines)


def update_manifest():
    with open(MANIFEST, encoding="utf-8") as f:
        data = json.load(f)
    for level in data["levels"]:
        bid = level["id"]
        folder = BOOKS.get(bid)
        if not folder:
            continue
        prefix = f"staging/{folder}/"
        level["asset_prefix"] = {
            "pictures": f"images/{bid}",
            "audio": f"audio/{bid}",
        }
        level["staging_note"] = "ORIGIN_CLONE_FAILED — shell until Origin import"
        for a in level["assessments"]:
            old = a["path"]
            if old.startswith(prefix):
                continue
            parts = old.split("/", 1)
            if len(parts) == 2:
                a["path"] = prefix + parts[1]
    with open(MANIFEST, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def main():
    for book_id, folder in BOOKS.items():
        copy_shell(book_id, folder)
        write_origin_md(folder, book_id)
    update_manifest()
    status = os.path.join(ROOT, "staging", "ORIGIN_STATUS.md")
    with open(status, "w", encoding="utf-8") as f:
        f.write("# Origin import status\n\n**All books: `ORIGIN_CLONE_FAILED`** on cloud agent (no Origin auth).\n\n")
        f.write("| Book | GitHub branch | Folder | Origin git | tgz sha256 |\n")
        f.write("|------|---------------|--------|------------|------------|\n")
        for book_id, folder in BOOKS.items():
            src = ORIGIN_SOURCES.get(folder, {})
            git = src.get("git", "TBD")
            sha = src.get("sha256", "—")[:8] + "…" if src.get("sha256") else "—"
            f.write(f"| {folder} | staging-{book_id} | staging/{folder}/ | {git} | `{sha}` |\n")
    print("Staging shells ready for", ", ".join(BOOKS.values()))


if __name__ == "__main__":
    main()
