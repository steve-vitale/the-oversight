# sim-launchfunnel-b — PREREG (frozen before any judged sim)

**Arm:** sim-launchfunnel-b · **Loop B run:** fleshout-loop-b-20261119T1530Z · **Axis:** winnability chain
**Type:** DIAG survey, instrument-only. No game-code change, no default flipped, no lever built.
**Branch:** `sim-launchfunnel-b` · **Worktree:** `~/workspace/worktrees/sim-launchfunnel-b`
**Base at arm start:** master `1927a245e` (worktree HEAD; the 1230Z adoption closeout).
**Policy:** competent verbatim (`scripts/policies/competent.js`),
sha256 `729af71ccdddff5abf7e8aad555fe820cb2355d6eb9a6ed866e5ac15e94806fd`
(first 12: `729af71ccddd`). NOTE: the policy file changed since
launchfunnel-a's frozen sha (`df9b7dff4de4`, base `f9b33757a`) — journey
landings r127–r146 (door-guard, fight-step, heed fixes). This survey
uses the CURRENT file verbatim; the change is a player-side fight
movement, not a launch-mechanism change, and it is recorded here rather
than silently carried.
**Bands:** 106051–106058, 106061–106068, 106071–106078, 106081–106088
(4 bands × 8 seeds = 32 seeds) · **Horizon:** 150d death-aware.

## The question (finding #2604 + dmgshape-b §7 metric review)

sim-dmgshape-b NO-GO'd METRIC-BROKEN: its band (105931–105938) launched
5 wave-4+ hunts, all on one seed, so the judged population (launched-quad
fled fights) was n=3 and could not carry the decomposition bars. Its
metric review names the fix: "survey first — or pick a band by measured
launch rate, not by freshness alone; a survey costs ~7 minutes." Finding
#2604 (1230Z round) states the question: quad-launch rate is the binding
unknown — 5 launches/8 seeds, all on one seed; seed 105935 standing 680
with 0 launches. This arm is that survey: screen 4 fresh bands, rank by
measured launch rate, and publish the launch-rich band as the designated
band for the dmgshape/partysurvive re-runs. The survey IS the arm — it
does NOT re-run either diagnostic.

## What was read first (do not re-measure what they answered)

- `evidence/2026-11-17/sim-launchfunnel-a.md` + prereg — the unified
  launch-funnel census: binding stage candidate-not-bid (8/12), pool
  81/87 scored dawns with 0 eligible companions; 3 launched instances
  (6 launch events), 0 kills; OFF leg dry (0 instances).
- `evidence/2026-11-19/sim-dmgshape-b.md` §7 — metric review (survey
  first); decomposition bars pass on n=3 but the pool floor fails.
- `evidence/2026-11-19/sim-winnability-round-1230.md` — both 1230Z arms
  NO-GO; finding #2604 is this arm's question; walls on both bands
  (wins 0/8, national 0/8, table 0/8).
- `scripts/analyze-partyquads-b.js` perSeed — the established launch
  counting (reused verbatim): launches = `v4departs` rows with
  `result === 'launch'` and `targetWave >= 4`; quads = launches with
  `partySize >= 4`. The brain/winPlan depart paths are exclusive in
  `src/js/villager-agency.js` (brain-owns-dawn → `vbrainExecuteDepart`
  only, else `winPlanDepart`), so one launch is one row — no double
  count. dmgshape's "5 launches" and fightcap's "15 launches" use this
  same counting, so the GO floors below are calibrated to it.

## Band freshness (verified 2026-11-19, before this prereg)

Search scope: (1) `git grep` over the whole worktree (tracked files);
(2) `grep -r` over `evidence/` — filenames AND contents, all files
incl. corpora and dated `.md` (the 2215Z lesson: a band that appears
in any other corpus is contaminated); (3) `grep -r` over `scripts/`;
(4) `grep -r` over goal `hidden_files/convergence-tracker.md`,
`hidden_files/sim-findings.md`, and `hidden_files/lever-claims/*.json`.
Pattern: each candidate seed as a standalone 6-digit number
(not preceded/followed by a digit — floats and kcal values excluded).
Result: **zero hits naming any of the 32 seeds as a sim seed**
anywhere. Every apparent hit was adjudicated by hand: (a) pantry-kcal
values (`"pantryKcal": 106051`, `[45, 106075]` day/kcal pairs in
`evidence/2026-11-08/journey-establishment-r114-after-seed1502.json`
and the 2026-11-16 seedland/tricklearn corpora — the same false-positive
class launchfunnel-a documented); (b) the 7-digit October census seed
`s1060511` (filenames + 9 dated `.md` files + one sim-findings.md line
— a different seed, not a candidate); (c) float fragments. No file
carries `"seed": 10605[1-8]` (or 10606/10607/10608) in `evidence/` or
`scripts/` (ripgrep), no candidate in any `SEEDS=` line, no candidate
in any dated `.md` as a seed, no exact-seed filename. **Bands FRESH.**
Prereg mentions nearby (for the record): 106001–106008, 106011, 106026,
106031, 106044, 106046, 106101, 106108, 106201, 106365, 106419 — none
inside 106051–106088.

## Substrate (env flags only — no port, no src change)

`SENSEEXPED=1 PARTYSIZE4=1 VETREENGAGE=1 FLEEREPAIR2=1 FIGHTALLY2=1`,
all env-gated on master on this tip (verified by the proof test):
- VETREENGAGE: the seed call (`game.js` world-tick) + second companion
  (`villager-brain.js` candidate + depart mirror).
- PARTYSIZE4: the third companion — the dawn candidate sets
  `companion3` (`villager-brain.js:249-262`, via
  `winPlanThirdCompanion`, earned on the wave-4 unlock) and the depart
  mirror launches it (`villager-brain.js:1244-1300`, bumps
  `partyQuads`). A quad launch (holder + 3) is possible under this
  substrate with NO port. NOTE: the comment at `villager-brain.js:676`
  ("companion3 is set by no candidate on this tip") is STALE — it
  predates the PARTYSIZE4 candidate code at :249-262, which does set
  it. Recorded, not acted on (comment-only staleness).
- SENSEEXPED / FLEEREPAIR2 / FIGHTALLY2: the re-run substrate's
  remaining flags (sense sourcing, flee repair, 2nd-ally fight slot).
- ALLYSLOT3 is DELIBERATELY NOT ported: it gates only the fight
  engine's 4th slot (whether ally3 can fight/deal damage), never
  launch formation. The survey ranks bands by LAUNCH rate, which the
  port cannot change; the re-run ports ALLYSLOT3 again if it needs the
  fight-side slot. Zero `src/` lines change in this arm by construction.

## Legs (one per band, recorder ON)

One leg per band, differing ONLY by SEEDS. No OFF leg (launchfunnel-a
already established the master-default funnel is dry: 0 instances)
and no REC leg (D1/D2 neutrality was proven for this instrument on
this base family by launchfunnel-a, and re-proven for this copy at
30d by the proof test — the copy changes no wrap logic, only output
naming + one extra recorded field). A band's 8 seeds run sequentially
in one driver invocation.

## Instrument (reused, not rebuilt)

- `scripts/launchfunnel-driver-20261119.js` — a copy of
  `scripts/launchfunnel-driver-20261117.js` (the proven instrument).
  Deltas, all recorded here: (1) output evidence dir `2026-11-19`
  (`EVIDENCE_DATE` env override, default `2026-11-19`); (2) arm/run
  `launchfunnel-b` (out object + file names
  `launchfunnel-b-s<seed>-launchfunnel-b-vre.json`); (3) `companion3`
  recorded on brain depart rows (`v4departs` + `dawnbidDeparts`) so a
  quad launch is visible even if `plan.party` is stale at read time.
  All wraps remain pure reads + driver-local writes; no game-state
  writes, no RNG.
- `scripts/analyze-launchfunnel-b.js` — the survey ranker (new). Reuses
  `analyze-partyquads-b.js` `summarizeLeg` for the launch/quad counts
  + wall, and `analyze-launchfunnel-a.js` `funnelForSeed`/`summarize`
  for the funnel taxonomy per band. Writes
  `evidence/2026-11-19/launchfunnel-b-survey.json`.
- `scripts/test-launchfunnel-b.js` — proof (fixtures + live 5d shape
  + D1/D2 at 30d on a survey seed under the full substrate).

## Counting (frozen definitions)

- **Wave-4+ launch (event):** a `v4departs` row with `result:
  'launch'` and `(targetWave | 0) >= 4`. One row per launch (paths
  exclusive, see above). A holder re-launching on a later dawn counts
  again — the re-runs' pool floor counts events the same way.
- **Quad launch:** a wave-4+ launch with `partySize >= 4` (holder + 3
  companions). `partySize` is read off the depart row (`plan.party`
  post-launch); `companion3` is recorded alongside as the cross-check.
  The analyzer's `launchedSizes` (funnel taxonomy) is the second
  count — the two must agree on the best band.
- **Joined quad meeting:** a `v4encounters` row joined to a
  quad-launched instance by the launchfunnel-a window rule
  (day in [launchDay, closeDay], mid == target, fighter in the
  launched party). Tie-break only.
- **Launched instance:** a plan instance in a `launched-*` funnel
  bucket (launchfunnel-a precedence). Reported alongside, not the
  primary — the re-run floors count events.
- **Ranking:** launches desc, then quadLaunches desc, then joined
  quad meetings desc, then median survival desc.

## Primary metric (frozen)

Wave-4+ launches per 8-seed band (event count above), with quad
launches as the co-primary, on the survey substrate.

## GO bars (frozen — a miss is NO-GO, never re-scored)

1. **Launch-rich band:** at least one screened band meets
   **≥ 6 wave-4+ launches AND ≥ 2 quad launches per 8 seeds.**
2. **Taxonomy completeness:** the funnel taxonomy is complete
   (**0 `unknown`**) on ALL screened bands; all files parse (8/8 per
   band); 0 instrument errors on every file.
3. **Instrument validity:** proof test `scripts/test-launchfunnel-b.js`
   green; D1 repeatability + D2 wrap neutrality green (30d, survey
   seed 106051, full substrate); `check.js --quick` green if run
   (scripts-only change; proof-covered).
4. **Designation:** the best band (by the frozen ranking) is published
   as the designated band for the dmgshape/partysurvive re-runs, with
   its seed range in the evidence file.

If no band meets bar 1, the verdict is **NO-GO** — report the best
band and its rate, do NOT lower the bar mid-run; the bar question goes
in "metric review".

## Wall numbers (reported every run, both national definitions)

Wins, national by scaleRank ≥ 2, national by standing ≥ 200, table
seats, wave-4 unlocked, wave-5 unlocked, median survival, total
deaths, starvation deaths — per band.

## Sense-testing (SENSE-TESTING LAW)

Read transcripts. Quote real `vetSays` lines and at least one
launched-party meeting end to end on the best band (or, if none
launches anywhere, the nearest launch-adjacent fight lines the corpora
carry). Judge meaning, coherence, consequences — never just counts.
The evidence carries a "metric review" section.

## Instrument limitations (pre-registered, not hidden)

1. **Survey substrate ≠ re-run substrate on ALLYSLOT3** (see above):
   the designated band is designated by launch rate. The re-run's own
   prereg re-verifies its pool on arrival (with the port); a band that
   launches richly here but starves there is a re-run finding, not a
   survey error.
2. **Launch rate is substrate-sensitive:** the ranking holds under the
   survey substrate. A band's rate under a different flag set may
   differ — the designation names the substrate it was measured under.
3. **Skip-recorder pre-tick staleness** (launchdef finding, inherited):
   handled by the analyzer's `other` reclassification, as in
   launchfunnel-a.
4. **No canon doc covers expedition destination picking** (haventarget
   CANON GAP, inherited). The funnel stages are code-grounded, not
   canon-invented. Canon read: docs/CANON.md, docs/MONSTER-WAVES.md.

## Files

- Prereg: `evidence/2026-11-19/sim-launchfunnel-b-prereg.md` (this file)
- Instrument: `scripts/launchfunnel-driver-20261119.js`,
  `scripts/analyze-launchfunnel-b.js`, `scripts/test-launchfunnel-b.js`
- Corpora: `evidence/2026-11-19/perseed-launchfunnel-b-<band>/`
  (8 files each; band dirs named by seed range, e.g.
  `perseed-launchfunnel-b-106051-106058`)
- Survey: `evidence/2026-11-19/launchfunnel-b-survey.json`
- Evidence: `evidence/2026-11-19/sim-launchfunnel-b.md`
- `src/` diff: 0 lines (DIAG, recorder wraps only).
