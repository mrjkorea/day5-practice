# INT3B staging pack

**Status: `ORIGIN_CLONE_FAILED`** (harvest ready on Origin; not imported to GitHub yet)

## Origin source (Wait for Languages)

- Git: https://origin.cursor.com/git/wait4languages/tmp-6027b4826ea45356.git
- Harvest branch: `main`
- Ferry tooling branch: `cursor/int3b-day5-ferry-e372` (bc-3cae94ea)
- Artifact: `export/INT3B-day5.tgz`
- tgz sha256: `febd99df16367d13cda93ae1cb72ff7d9d9e0ba4067f3749d5be9ab910ad76bf`
- GitHub branch: `staging-int3b`

Import:

```bash
./scripts/import_staging_from_origin.sh INT3B
# or, with a downloaded tgz:
./scripts/import_staging_from_tgz.sh INT3B /path/to/INT3B-day5.tgz
```
