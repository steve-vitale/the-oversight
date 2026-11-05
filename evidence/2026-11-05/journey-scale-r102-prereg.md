# journey-scale r102 — PRE-REGISTER (lane A, leg 3 SCALE, days 80–140 + tail)

**Run id:** laneA-scale-2026-11-05T2256Z (scheduled 16:45 CST 2026-11-05).
Rotation read 3 → leg 3 SCALE; write 3→0 at closeout on success only
(a pilot-gate stop is not success; rotation stays 3).
**Base:** master@e39227114 at worktree creation.
**Gating freeze (2026-10-27 16:53) stands** — no threshold, bar, price,
nor gate change in this run.
**Perception law (2026-10-28) stands** — all instruments read-only
except the policy arm's own pressed verbs (fillWater / donateToPantry
are offered player verbs, pressed like a player would); pickers press
offered menu items only.
**DELIVER OVER MEASURE (2026-11-01):** this run does NOT re-prove r97's,
r98's, r99's, or r100's verdicts. It tests r100's proposed NARROWED
POLICY ARM on the same matched band, with a same-base control run
FIRST so the gate's baseline is known before the arm is judged.

## Standing context (read before scoring)
- r100 (2026-11-05 midday, seeds 85501–85504, base 1a898136c): the
  BROAD fill arm FAILED its demonstration — the same-base control
  ALSO had 0 dry walk-outs (the r99 phenomenon did not occur on that
  base), the arm fired only 2 fills, and its gate was over-broad: it
  fired on study days and when water was already 3L (26 of 28 unload
  passes bought no water), and its unload pass diverged 85501 by 44
  days (arm died d106 vs control d150 — the arm's footprint, and a
  NEGATIVE one on that seed).
- r100's carried item (this run): narrow the gate to an ACTUAL
  imminent walk (dist > 2, the same condition courtship uses to walk
  rather than study) AND water < 3 before any unload runs; prove it
  on the same band with a same-base control run FIRST.
- Band: 85501–85504 is the r97/r98/r99/r100 MATCHED band, reused
  deliberately for comparability; no freshness claim is made for it.
  Freshness check per the seed-band skill: the band is named in the
  r97/r98/r99/r100 preregs, so it counts as USED — and is reused
  deliberately here for the matched comparison, recorded in this
  prereg (not a fresh-band claim).
- Canon (read): docs/CANON.md, docs/SCALE.md (national = one primary
  with ≥3 seasoned subordinates; one rung per season).

## Tooling (one policy arm + clones; zero src/js)
- **Policy arm:** scripts/policies/scalecourt-nogate-morntrace3-fillnarrow.js
  = r100 fill clone with the gate NARROWED (see Q1) + two skip
  counters (`fillSkipStudy`, `fillSkipFull`) + `topUpBeforeWalk`
  exported for the proof test. Diff vs the r100 clone must contain
  ONLY: the header, the narrowed gate + counters, the export.
  The standing scalecourt-nogate.js, morntrace3 clone, and r100 fill
  clone are untouched; this clone is this run's instrument only.
- **Driver (arm):** scripts/journey-scale-r102-20261105.js = r100
  driver, labels/seeds/EVIDIR/mode/policy-require only (85501–85504,
  DAYCAP 180), PLUS two census fields from ctx (`fillSkipStudy`,
  `fillSkipFull`). Policy require → morntrace3-fillnarrow.
- **Driver (control):** the r99 driver run as-is (policy
  scalecourt-nogate-morntrace3, no arm) with EVIDIR overridden to
  evidence/2026-11-05/journey-scale-r102-control. No new control
  driver file; the r99 driver's own filenames land in the control
  dir.
- **Analyzer:** scripts/analyze-journey-scale-r102-20261105.js =
  r100 analyzer, labels only, PLUS a PREFIX argument
  (`node scripts/analyze-...js <EVIDIR> [PREFIX]`, default
  `journey-scale-r102`; control run passes `journey-scale-r99`),
  a neutral Q1 count print (dry/partial/wet — the cross-quad
  verdict is computed in the run note, not by the analyzer), and
  the fill-skip counters in the Q1 FILL line.
- **Proof test:** scripts/test-journey-scale-r102-narrow-gate-20261105.js
  — stub-Game cases for the narrowed gate (study-day skip, full-pack
  skip, walk-imminent fill, unload-then-fill under a full pack,
  stale pilgrim, returning, no pilgrim). Must be green before any
  scored seed runs. Not on the green list (same precedent as the
  r105/r106 proof tests — do not add it).

## Q1 — NARROWED FILL ARM ELIMINATES DRY WALK-OUTS (binding, arm-vs-control)
**Question:** on the matched band and the same base, does the
narrowed top-up (walk-imminent AND water < 3) eliminate dry
walk-outs without the broad arm's unload footprint?
**Walk-out day (operational, as r99/r100):** a day D whose entry
snapshot is at Haven (4,4) and whose postCourt snapshot is away
from Haven with a pilgrim set. DRY = postCourt packW 0; WET =
postCourt packW ≥ 2; PARTIAL = postCourt packW 1 (counted
separately, neither dry nor wet).
**Control FIRST:** r99 policy, no arm, band 85501–85504, DAYCAP 180.
Record control dry walk-outs D_ctrl. The arm quad runs only after
the control quad's D_ctrl is known.
**FINDING clause (pre-registered, not re-scored):**
- **PASS:** arm dry = 0 AND D_ctrl ≥ 1 AND the arm fired
  (`fillTopUps` ≥ 1 across the quad).
- **INSUFFICIENT-DATA:** D_ctrl = 0 — nothing to eliminate on this
  base; the arm cannot be demonstrated. Same vacuity as r100's
  control finding, NOT a pass.
- **PARTIAL:** 0 < arm dry < D_ctrl.
- **FAIL:** arm dry ≥ D_ctrl ≥ 1.
The FIRST-vs-RETRY cut is NOT the judge (r99 metric review); DRY-vs-WET
at postCourt is. Also report the unload footprint: unloads per fill
(r100 broad arm: 28 unloads / 2 fills) and the skip counters —
a narrowed arm must show unloads only on walk-imminent days.
**What would count as interesting:** PASS with the unload footprint
gone (unloads ≈ fills, no study-day unloads, skip counters naming
the skipped days) = the reset loop was a bot artifact AND the
narrow gate is the correct layer. A dry walk-out that SURVIVES the
arm (refusal lines on that day in the water-watch) names the NEXT
mechanism: cistern genuinely dry at postCompetent time (not just at
dawn) or room < 3 even after the unload pass.
**Pilot gate:** control seed 85503 runs first; if it crashes or
pilgrimages == 0, STOP.

## Q1b — RESET-LOOP CONSEQUENCE (report-only, expectation named)
Resets arm vs control (r99: 28; r100: 0 either way). A collapse
corroborates Q1; a surviving loop with 0 dry walk-outs would mean
the reset has a second cause and gets carried as the next
micro-question. No threshold, no verdict.

## Q1c — MOVER + DRAIN REGRESSION (report-only; r97/r98/r99 checks rerun)
The r99 Q1b/Q1c classifications run unchanged on both quads' output.
The regression check is on the BURN MODEL, not the counts: on the
nights that remain, drain must still separate on pack water / tile
water and match the burn prediction within ±10 (r98 metric review).
If the burn model breaks on remaining nights, report it; do not
re-score r97/r98/r99/r100.

## Q2 — CENSUS CONTINUITY (report-only; r93–r100 metric unchanged)
Seasoned-peer count AND scatter-day gap per seed; national count
reported alongside, not the judge. No threshold, no verdict.

## Q3 — PEOPLE CHECK (sense law; corpus rule as r96–r100)
One full sitting read in full from a surviving seed at day 90 if one
exists; no day substitution if none survives to day 90. Corpus size
is reported, not padded. Verdict: real vs filler/faked-history, with
quoted lines.

## Metric review (carried)
- Q1's FINDING clause is revised for this run (r100 metric review):
  the gate judges arm-vs-control on the SAME base, not a prior run's
  number. The 0-dry bar + control≥1 is set from what the band is
  known to hold, NOT from a statistical-power claim — this is a
  mechanism test on a small-n matched band, and the note must say so.
- The INSUFFICIENT-DATA arm of the clause is new: r100 showed a
  control with 0 dry walk-outs makes "0 dry" vacuous. If the base
  move erases the phenomenon again, the run says so plainly instead
  of claiming a pass.
- Burn-prediction tolerance (r98 metric review): ±10 stands; any
  outside-±10 drink-night case is reported as timing noise, not
  re-scored.
- Telemetry baseline: scripts/telemetry-check.js step 14 runs at
  closeout against telemetry-baselines/scale.json; baseline NOT
  rolled forward without a LOUD-line investigation.

## Fix gate (clause (a) discipline, as r96–r100)
A src/ change lands only if this run's trace identifies a concrete
mechanism AND the fix is a policy-instrument-proven or shipped-study
mechanic change — a trace alone does not meet the gate. This run's
arm is POLICY-side (the bot), not game code: if Q1 passes, the
finding is that the reset loop was a bot artifact and the narrowed
policy clone's behavior is the correct layer — the standing
competent policy does NOT change in this run (a standing-policy
change is a separate decision, proposed for the next run with its
own prereg). If a dry walk-out SURVIVES the arm with a cistern-dry
refusal at postCompetent time, that names the next instrument (what
drains / refills the cistern across the day boundary), not a
same-run game fix.
