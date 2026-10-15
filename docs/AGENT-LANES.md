# Agent lanes (2026-10-15)

Two agents work this repo. This note prevents file-level collisions.
Steve adjudicates; either agent may update this file when lanes change.

## Codex (taking over Claude's godpath work)
- Lane: `docs/godpath/PLAN.md` "What's left" — ascension gates, villager active
  verbs, early-kit subclass visibility, `god.scale` wiring, Table endings by
  class/god x light/dark.
- Files: `src/data/godpaths.json`, `src/js/godpath.js`, `src/js/godhood.js`,
  `src/data/table-endings.json` (endings side), `scripts/godpath/`.
- Status 2026-10-15 ~07:55 CDT: unreachable — no local session, no remote
  branch, no PR, no commits; reported internet problems. Nothing visible yet.

## Muse
- Lane: Claude roadmap `docs/ROADMAP.md` §2 minus the godpath files —
  region content wave 1 (done, on branch `region-content-wave1`), then
  The Long Way Home (nomad ending, `docs/WORLD-REGIONS.md` §6), then region
  systems (temperature, weather).
- Explicitly avoiding until lanes are confirmed: `src/data/godpaths.json`,
  `src/data/table-endings.json` (Table codas), godpath scripts.
- Files: `src/js/world.js`, region engine, new nomad-ending modules.

## Rule
Neither agent edits the other's listed files without a note here first.
Content merges happen through the normal worktree + `--ff-only` flow.
