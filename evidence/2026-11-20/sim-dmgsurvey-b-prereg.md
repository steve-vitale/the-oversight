# sim-dmgsurvey-b — PREREG (frozen before any judged sim)

**Arm:** sim-dmgsurvey-b · **Loop B run:** fleshout-loop-b-20261120T0130Z · **Axis:** winnability chain
**Type:** DIAG survey, instrument-only. No game-code change, no default flipped, no lever built.
**Branch:** `sim-dmgsurvey-b` · **Worktree:** `~/workspace/worktrees/sim-dmgsurvey-b`
**Base at arm start:** master `c75503d6f02acfed7eb62cdaf1c81cf793337367` (worktree HEAD; the 0030Z adoption closeout).
**Frozen:** 2026-11-20 ~02:32 UTC, BEFORE any judged sim.
**Policy:** competent verbatim (`scripts/policies/competent.js`),
sha256 `150229eda010b89e4c73c0e7e68d06d30a7191cc3748778339c81f09e470161a`
(first 12: `150229eda010`; git blob `8f8307b54dee`). Same file the
dmgshape-rerun-b leg ran (r148 + bowcraft turn-on live on this base).
**Bands:** 106161–106168, 106171–106178, 106181–106188, 106191–106198
(4 bands × 8 seeds = 32 seeds) · **Horizon:** 150d death-aware.

## The question (finding #2605 prerequisite; finding #2616)

sim-dmgshape-b NO-GO'd METRIC-BROKEN on a thin pool (5 launches, n=3
fled launched-quad fights). sim-dmgshape-rerun-b NO-GO'd
METRIC-BROKEN again: on the designated band, under the full
substrate and the current policy, **8 launches, 4 launches with a
first fight against the target (floor 6), 3 fled first-fights
(floor 4)** — and the launch rate fell 17 → 9 → 8 on identical
seeds as the substrate moved (finding #2616: a survey designation
is valid ON THE SURVEY SUBSTRATE, not a property of the seeds).
The damage question cannot be re-measured until a band exists
whose launched parties actually reach first fights. This arm is
that survey: screen 4 FRESH bands under the FULL LANDED substrate
so the next dmgshape run has a band worth measuring. The survey IS
the arm — it does NOT re-run the damage decomposition.

## What was read first (do not re-measure what they answered)

- `evidence/2026-11-19/sim-dmgshape-rerun-b.md` + prereg — the
  re-measurement: 8 launches / 4 first-fights / 3 fled on the
  designated band; the 4 no-fight launches all re-launched a
  target type whose last fight predated the launch (dead-target
  launches); launch engines moved (106084: 4, 106081: 3;
  106083: 1). First-fight definition (frozen there, reused
  verbatim here): earliest `v4encounters` row with
  `mid === launch.target`, day in `[launch.day, launch.day+21]`,
  fought (`rounds > 0` or `mDealt > 0`), ANY origin, ANY fighter.
- `evidence/2026-11-19/sim-launchfunnel-b.md` + prereg — the
  launch survey: designated band 106081–106088 (17 launches,
  9 quads, 4 joined quad meetings); launch richness is lumpy
  (2 seeds carry 15/17); binding stage candidate-not-bid tied
  with plan-churned-before-dawn.
- `evidence/2026-11-19/sim-rageholder-survey-b.md` + prereg —
  the holder survey pattern (survey JSON, per-seed maps, wall
  numbers, flap-hardened legs): designated band 106151–106158
  (33 holder-fights, 19 contact, 12 fires).
- `docs/CANON.md`, `docs/MONSTER-WAVES.md` — read first; wave-4
  bands (damage 35–95, HP 850–1500) and the readiness bars are
  canon, not re-invented. No canon doc covers expedition
  destination picking (haventarget CANON GAP, inherited).

## Band freshness (verified 2026-11-20, before this prereg)

Search scope: (1) `grep -rn` over `evidence/*/sim-*-prereg.md`
(all dated preregs); (2) `rg -P` bounded-pattern search
(standalone 6-digit, not preceded/followed by a digit) over the
whole worktree (contents + filenames) and over goal
`hidden_files/` (convergence-tracker, sim-findings, lever-claims,
plus the evidence mirror and arm partials it holds);
(3) targeted seed-field checks: `"seed": 1061[6-9][1-8]`,
`SEEDS=...1061[6-9][1-8]`, `s1061[6-9][1-8]`, and dated
`sim-*.md` mentions. Result: **zero hits naming any of the 32
seeds as a sim seed anywhere.** Every apparent hit was
adjudicated by hand, all the same false-positive class
launchfunnel-b documented (pantry/kcal values in October
census/sweep JSON): `"pantryFreshAfter": 106165`,
`"pantryFreshAfter": 106176`, `"pantryKcalAtShare": 106168`,
`/village/pantryKcal after: 106168`, `"expected": 106174`,
`"pantry": 106187`, `"funnelShareEased": 106172` — none a seed
use. No candidate in any `SEEDS=` line, no candidate in any
dated `.md` as a seed, no exact-seed filename, no candidate in
any prereg, tracker, findings, or claim file. **Bands FRESH.**

## Substrate (env flags — see the ALLYSLOT3 note, it matters)

`SENSEEXPED=1 PARTYSIZE4=1 VETREENGAGE=1 FLEEREPAIR2=1 FIGHTALLY2=1 ALLYSLOT3=1 LAUNCHSURVIVE=1`,
competent verbatim, 150d death-aware, one leg per band (recorder ON).
Five of the seven flags are env-gated on master on this tip
(verified by the proof test): SENSEEXPED (`party-wiring.js`),
PARTYSIZE4 (`villager-brain.js`, `win-plan.js`), VETREENGAGE
(`game.js`, `villager-brain.js`, `win-plan.js`), FLEEREPAIR2
(`win-plan.js`), FIGHTALLY2 (`fieldFights.js`,
`party-wiring.js`). LAUNCHSURVIVE is driver-local (the launch
tracker rows; no game-code read — same as the launchfunnel and
dmgshape-rerun drivers).

**ALLYSLOT3 DISCREPANCY (verified, not assumed): ALLYSLOT3 is NOT
landed on master `c75503d6f`.** The port commit `f4d1100ee`
(sim-fightcap-b) is NOT an ancestor of HEAD
(`git merge-base --is-ancestor f4d1100ee HEAD` = no), and
`src/js/` contains ZERO occurrences of `ALLYSLOT3` or `ally3Vid`
(`grep -rn` over `src/js/`). The brief's "as landed on master"
is wrong on this one flag. Consequences, all recorded here
before freezing:
- The leg command still sets `ALLYSLOT3=1` (frozen substrate),
  but the flag is unread by game code on this tip — the driver
  asserts the ENV var is set and records `allyslot3InSrc: false`
  on every corpus (self-describing, never silent).
- **ZERO `src/js` changes in this arm** (evidence-only, per the
  brief). Porting the slot would violate that rule, so no port.
  The coordinator decides separately whether a port belongs on
  the next dmgshape run's branch (dmgshape-rerun-b did exactly
  that, coordinator-authorized, evidence-only).
- The survey's primary metric is **first-fight EXISTENCE**, and
  the slot cannot change it: it gates only whether ally3 can
  fight/deal damage inside a fight that already happens
  (launchfunnel-b prereg), never launch formation, never whether
  `fieldFight` is called, never whether a fight is fought
  (`rounds > 0` comes from the fighter striking). A first fight
  counts the same with or without the slot. What the slot DOES
  change is fight OUTCOMES (damage, fled vs killed) — so the
  survey designates on first-fight counts, and the next dmgshape
  run (which ports the slot, as dmgshape-rerun-b did) re-verifies
  its pool on arrival per its own prereg, exactly as the
  launchfunnel-b designation required.
- Designation is a (substrate, policy) designation (finding
  #2616 extends): this survey's substrate is the seven-flag
  command above with ALLYSLOT3 set-but-unread, on policy
  `150229eda010`. A re-run under a different flag set or policy
  must re-verify, not assume.

## Legs (one per band, recorder ON)

One leg per band, differing ONLY by SEEDS. No OFF leg
(launchfunnel-a already established the master-default funnel is
dry) and no REC leg (D1/D2 neutrality proven for this instrument
family by launchfunnel-a/b, re-proven for this copy at 30d by
the proof test). A band's 8 seeds run sequentially in one driver
invocation (≤8 seeds per exec call — a 16-seed driver exec was
SIGTERM-killed at ~25 min on this box). Each leg's stdout is
tee'd to `evidence/2026-11-20/dmgsurvey-b-legs.log` so a
`@@FALLBACK` corpus dump (write-flap fallback) is recoverable
from the log, per the rageholder-survey-b precedent.

## Instrument (reused, not rebuilt)

- `scripts/dmgsurvey-driver-b.js` — a copy of
  `scripts/launchfunnel-driver-20261119.js` (the proven unified
  launch-funnel census instrument). Deltas, all recorded here:
  (1) output evidence dir `2026-11-20` (`EVIDENCE_DATE` env
  override, default `2026-11-20`); (2) arm/run `dmgsurvey-b`
  (out object + file names
  `dmgsurvey-b-s<seed>-dmgsurvey-b-vre.json`); (3) substrate
  self-description on every corpus (`senseexpedFlag` … `allyslot3Flag`,
  `launchsurviveFlag`, `allyslot3InSrc`, `launchTrackOn`);
  (4) CLI substrate assertions (the five landed flags + LAUNCHSURVIVE
  must be `1`; ALLYSLOT3 env must be `1`, src presence is
  RECORDED, never asserted); (5) driver-filename strings in
  `firstCallerFrame`/`fightOrigin` updated to this file so the
  driver's own stack frames are skipped. All wraps remain pure
  reads + driver-local writes; no game-state writes, no RNG.
- `scripts/analyze-dmgsurvey-b.js` — the survey ranker (new).
  Reuses `analyze-launchfunnel-b.js` `bandOf` for launch/quad
  counts + wall + funnel taxonomy, and
  `analyze-dmgshape-rerun-b.js` `launchesOf`/`firstFight`
  (imported — not copied) for the first-fight join. Writes
  `evidence/2026-11-20/dmgsurvey-b-survey.json`.
- `scripts/test-dmgsurvey-b.js` — proof (fixtures + live 5d shape
  + D1/D2 at 30d on survey seed 106161 under the full substrate).

## Counting (frozen definitions)

- **Wave-4+ launch (event):** a `v4departs` row with `result:
  'launch'` and `(targetWave | 0) >= 4`. One row per launch (paths
  exclusive — brain-owns-dawn → `vbrainExecuteDepart` only, else
  `winPlanDepart`). A holder re-launching on a later dawn counts
  again — the re-runs' pool floor counts events the same way.
- **Quad launch:** a wave-4+ launch with `partySize >= 4`
  (holder + 3 companions).
- **Launched first-fight (primary metric):** for each launch, the
  earliest `v4encounters` row with `mid === launch.target`
  (the monster TYPE id — the recorder carries no instance id),
  `day` in `[launch.day, launch.day + 21]` (the family's 21-day
  window), fought (`rounds > 0` or `mDealt > 0`), ANY origin
  (expedition, world-tick, aid, patrol, other), ANY fighter
  (the launched party or any other party that meets the target
  first). Earliest day wins; file order breaks a same-day tie
  (the recorder appends chronologically). Two launches against
  the same target type may share one first fight — each launch
  maps to its own first fight; the count of distinct fights is
  reported beside the count of launches. A launch with no such
  row in its window has no first fight and does not enter the
  population. This is the dmgshape-rerun-b definition verbatim
  (the 0030Z decision: "first fight against the launch target,
  any origin").
- **Ranking:** firstFights desc, then launches desc, then
  quadLaunches desc, then median survival desc.

## Primary metric (frozen)

Launched first-fights against the launch target per 8-seed band
(any-origin definition above), with per-seed launches /
first-fights / quads reported.

## GO bars (frozen — a miss is NO-GO, never re-scored)

1. **First-fight-rich band:** at least one screened band meets
   **≥ 6 launched first-fights per 8 seeds** (the
   dmgshape-rerun-b pool floor). Floor pricing, same-substrate:
   the floor is the next dmgshape run's own pool floor (its
   prereg binds it at ≥6 first-fights / ≥4 fled), NOT a number
   imported from the launch survey's 17 launches — and the
   same-substrate reference point sits BELOW it: the last leg on
   the designated band under the full substrate + current policy
   delivered 4 first-fights. A band meeting 6 is therefore
   better than the band the re-run just starved on, measured on
   the same substrate.
2. **Taxonomy completeness:** the funnel taxonomy is complete
   (**0 `unknown`**) on ALL screened bands; all files parse (8/8
   per band); 0 instrument errors on every file.
3. **Instrument validity:** proof test
   `scripts/test-dmgsurvey-b.js` green; analyzer selftest
   (`analyze-dmgsurvey-b.js --selftest`) green; D1 repeatability
   + D2 wrap neutrality green (30d, survey seed 106161, full
   substrate).
4. **Designation:** the best band (by the frozen ranking) is
   published as the designated band for the next dmgshape run,
   with its seed range and per-seed map in the evidence file.

If no band meets bar 1, the verdict is **NO-GO** — report the
best band and its rate, do NOT lower the bar mid-run; the bar
question goes in "metric review".

## Wall numbers (reported every run, both national definitions)

Wins, national by scaleRank ≥ 2, national by standing ≥ 200, table
seats, wave-4 unlocked, wave-5 unlocked, median survival, total
deaths, starvation deaths — per band.

## Sense-testing (SENSE-TESTING LAW)

Read transcripts. Quote real `vetSays` lines and at least one
launched first-fight end to end on the best band (or, if no band
launches anywhere, the nearest launch-adjacent fight lines the
corpora carry). Judge meaning, coherence, consequences — never
just counts. The evidence carries a "metric review" section.

## Instrument limitations (pre-registered, not hidden)

1. **ALLYSLOT3 set-but-unread** (see above): the survey
   designates on first-fight counts, which the slot cannot
   change; the re-run re-verifies its pool on arrival with the
   slot ported. If the coordinator rules the designation must
   be measured WITH the slot live, this survey must be re-run
   on a ported branch — the designation as published is on the
   set-but-unread substrate.
2. **Target matching is by TYPE, not instance** (dmgshape-rerun-b
   metric review): a first fight against "the target" may be
   against a different individual of the target species than
   the one the plan tracked. The evidence names the target type
   beside every first fight so this stays auditable.
3. **Day granularity:** a same-day fight may precede the launch
   within the day (the analyzer sees days, not parts). The
   family's convention (day >= launch.day) is kept; same-day
   first fights are flagged in the per-launch table.
4. **Survey corpora carry no decomposition fields** (no
   `roundsDetail` on encounter rows — the launchfunnel recorder
   shape). The survey judges COUNTS only; the damage
   decomposition is the re-run's job on its own corpora. No
   D_meas / accounted / top numbers are judged here.
5. **Launch rate is substrate-sensitive** (finding #2616): the
   ranking holds under the survey substrate. A band's rate under
   a different flag set or policy may differ — the designation
   names the substrate it was measured under.
6. **Write flap is ACTIVE** (~02:09Z onward): fresh-file writes
   and git ref writes intermittently EPERM. Legs tee to
   `dmgsurvey-b-legs.log` (fallback recovery); writes are probed
   before they matter and verified by size/readback; a blocked
   final commit leaves files on disk intact for coordinator
   adoption, never forced.

## Files

- Prereg: `evidence/2026-11-20/sim-dmgsurvey-b-prereg.md` (this file)
- Instrument: `scripts/dmgsurvey-driver-b.js`,
  `scripts/analyze-dmgsurvey-b.js`, `scripts/test-dmgsurvey-b.js`
- Corpora: `evidence/2026-11-20/perseed-dmgsurvey-b-<band>/`
  (8 files each; band dirs named by seed range, e.g.
  `perseed-dmgsurvey-b-106161-106168`)
- Survey: `evidence/2026-11-20/dmgsurvey-b-survey.json`
- Evidence: `evidence/2026-11-20/sim-dmgsurvey-b.md`
- Leg log: `evidence/2026-11-20/dmgsurvey-b-legs.log`
- `src/` diff: 0 lines (DIAG, recorder wraps only).
