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

## Shared-file note (2026-10-15, Muse)
- Codex's `codex/resume-claude` branch is fleshing out `src/data/regions.json`
  (region-livelihood: Europe now playable with biome/gen/fauna/landingVariants).
- Muse's next lane item (region systems: temperature, weather) also touches
  `src/data/regions.json` — restricted to `climate`/temperature blocks and a
  new `src/js/temperature.js` module; will not touch Codex's livelihood fields
  (biome, gen, fauna, landingVariants, lifeseedRegions). Rebase care on landing.

## Coordination rule (2026-10-17, Steve: "we can't keep doing such uncoordinated work")

The 2026-10-17 state showed the failure mode: `codex/resume-claude` sat
~3,470 commits ahead of master (92 on 2026-10-15) — ~18.8k committed panel
cache archives plus real divergence in 69 `src/js`, 36 `scripts/policies`,
22 `src/data` files. Two agents measuring differently and merging never is
how drift compounds silently.

1. **Shared measurement is the coordination surface.** Both agents run
   before/after comparisons through the balanced panel
   (`scripts/balance-panel.js` + `scripts/balance-metrics.json`) per
   `docs/MEASUREMENT.md` §15. Same contract digest or the comparison is
   invalid — the scorecard rejects it mechanically. Arguments about "whose
   numbers" end at the digest.
2. **Drift cap.** No agent branch goes more than ~200 commits ahead of
   master, or 7 days, without a reconcile: rebase onto master, land in
   reviewable pieces through the normal worktree + `--ff-only` flow. A
   branch past the cap stops new work until it reconciles.
3. **Cache hygiene.** Panel `cases/` caches and other per-run archives never
   commit. Commit `panel.json.gz` + compare reports only.
4. **This file is the surface.** Pending reconciles and lane changes get
   noted here by either agent; Steve adjudicates disputes.

### Pending reconcile (2026-10-17)
- `codex/resume-claude` ~3,470 commits ahead of master: needs a dedicated
  reconcile pass (rebase, drop/`.gitignore` the ~18.8k cache archives, land
  the 69 `src/js` + 36 `scripts/policies` + 22 `src/data` files of real
  divergence in reviewable pieces). Not started — scoping is the next step.
- `codex/balanced-measurement`: measurement package ported to master
  2026-10-17 (commit e7440ed0); branch itself needs no further action.
