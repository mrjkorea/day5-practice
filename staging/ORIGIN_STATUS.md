# Origin import status

**All books: `ORIGIN_CLONE_FAILED`** on cloud agent (no Origin auth). Last retry: **2026-09-17**.

| Book | GitHub branch | Folder | Origin git | Origin branch(es) | export tgz sha256 |
|------|---------------|--------|------------|-------------------|-------------------|
| INT2A | `staging-int2a` | `staging/INT2A/` | https://origin.cursor.com/git/wait4languages/tmp-a4c737e083236982.git | `main`, `intermediate-int2a` | `eebcf0226c4ff19ef503d59e6d2dc9874d3707bfeb48a32aef8bddca39ad5447` |
| INT2B | `staging-int2b` | `staging/INT2B/` | https://origin.cursor.com/git/wait4languages/tmp-8b71226a906aee3d.git | `main`, `intermediate-int2b` | `113c826487c71322bc171d4515245ea733bc8c1e5bbb90328d839e3f998848ff` |
| INT2C | `staging-int2c` | `staging/INT2C/` | https://origin.cursor.com/git/wait4languages/tmp-0a5450fe7d08e1b2.git | `main`, `intermediate-int2c` | `15997298d478199a2a6bb8a23997ae25ecd10c59fec397342fdb5ee47c6c0089` |
| INT3A | `staging-int3a` | `staging/INT3A/` | https://origin.cursor.com/git/wait4languages/tmp-b8b36e4ac789c6db.git | `main`, `intermediate-int3a` | `6d637714944a1d4734392f992e0605ae931829cbcc30be5545778376ede2a69e` |
| INT3B | `staging-int3b` | `staging/INT3B/` | https://origin.cursor.com/git/wait4languages/tmp-6027b4826ea45356.git | `main` (harvest), `cursor/int3b-day5-ferry-e372` (ferry) | `febd99df16367d13cda93ae1cb72ff7d9d9e0ba4067f3749d5be9ab910ad76bf` (`INT3B-day5.tgz`) |
| INT3C | `staging-int3c` | `staging/INT3C/` | https://origin.cursor.com/git/wait4languages/tmp-5845cb284c61d453.git | `cos-ferry-int3c`, `intermediate-int3c` | `2bf52d5856269f476af3ba0fd0ba4140256cbdcf0b3a54da173aba2e7c7da69d` |

On Origin, harvest agents are expected to publish `export/*.tgz`, `FERRY_*.md`, `staging/`, `images/`, and `audio/` on the branches above.

Import (after `origin auth login`):

```bash
./scripts/import_staging_from_origin.sh INT2A   # … INT3C
```

Full report: `IMPORT_REPORT.md` at repo root.
