# Survival-collapse bisect ANCHOR — pre-registration (arm sim-bisect-anchor-a)

Run fleshout-20261111T2317Z, Loop B, axis scale-onramp / winnability
chain (tracker 2030Z next blank 1 — the survival-collapse bisect).
Written and committed BEFORE any judged sim. Base: `3f136f07e`
(journey-landing r126, the vetphantom fix-leg base; read fresh from
the worktree at run start with `git log --oneline -1`).

**Instrument-only arm — ZERO src/js changes.** This arm re-runs one
8-seed band on the OLD base to confirm the anchor reproduces before
the bisect steps forward. It changes no game code and builds nothing.

## The question

The survivalcontrol arm (evidence/2026-11-11/sim-survivalcontrol-b.md)
proved a MASTER_CHANGE: the same 8 seeds (190391–190398) that survived
6/8 on the vetphantom fix leg survive 1/8 on master `d33ca69f9`.
Coordinator archaeology shows the ONLY src/js change between the two
bases is `13e6f40ae` sim-mournblooded-b (standing.js). This anchor arm
re-runs the control on the OLD base (`3f136f07e`, the vetphantom
fix-leg base, which carries the roster-check fix) to confirm the
anchor reproduces the vetphantom fix leg's 6/8. If it does, the
bisect has a solid anchor; if it does not, the measurement itself
is suspect and the bisect must not proceed on these numbers.

| Band | Base | Survived | Median |
|---|---|---|---|
| vetphantom fix leg (seeds 190391–190398) | pre-reconcile master `5157782a4`, rebased onto `3f136f07e` | **6/8** | **150d** |
| survivalcontrol (seeds 190391–190398) | current master `d33ca69f9` | **1/8** | **126d** |
| this anchor (seeds 190391–190398) | old base `3f136f07e` | **?** | **?** |

## Canon

docs/CANON.md read first. No canon doc covers survival-collapse
attribution; the veteran-bar rule comes from docs/MONSTER-WAVES.md
design call #4 and Steve's 2026-11-10 scholar-counts ruling, same as
vetphantom-b, tributedeliv-b, and survivalcontrol-b. Nothing here
invents canon.

## Primary metric + decision rule (a miss is a verdict, never re-scored)

**Primary metric: survived count on seeds 190391–190398 on the old
base `3f136f07e`**, vs the vetphantom fix leg's 6/8 (median 150d).

| Outcome | Verdict |
|---|---|
| **≥5/8 survive** | **ANCHOR REPRODUCES** — the old base still gives the vetphantom fix leg's survival; the bisect anchor is solid and the collapse sits after this base |
| **≤2/8 survive** | **ANCHOR DOES NOT REPRODUCE** — a measurement problem to report, not re-judge; the bisect must NOT proceed on these numbers until the discrepancy is understood |
| **3–4/8 survive** | **INCONCLUSIVE** — the anchor is neither confirmed nor refuted; a bigger band or a re-trace is owed before bisecting |

The analyzer (`scripts/bisect-anchor-analyze-20261111.js`) judges
this rule and exits 0 only when it can classify the outcome under it
(any of the three verdicts is a classified outcome; exit 1 only on
instrument failure, corpus incompleteness, or an unclassifiable
read).

**Secondary (reported, not judged):** median survival vs 150d;
death-cause shares vs survivalcontrol's combat-heavy profile
(585/615 combat/expedition/wild, starvation 0); wave 4–5 unlocks;
national/table/wins; standing range; tribute-ready days; phantom
days (0 expected — the roster-check fix is on this base).

## Horizon + seeds + policies

- **Horizon: 150d, death-aware** (+10d tail max) — identical to both
  prior bands, so the survival counts are comparable.
- **Seeds: 190391–190398 (8 seeds) — deliberately the SAME band as
  vetphantom and survivalcontrol.** A control/bisect anchor re-runs
  the same seeds on old code; that is the point of an anchor, not a
  freshness violation. The seed-band freshness rule exists to stop
  re-using a band as if it were a fresh measurement; this arm
  explicitly re-uses it as a matched control and says so here, in
  the prereg, before any sim. Same justification as the
  survivalcontrol prereg.
- **Policy: competent verbatim, SINGLE leg on the old base.** The
  vetphantom fix is already on this base (roster-check marker
  present in `src/js/standing.js`, verified at run start:
  `roster.indexOf(vid)` at standing.js:239), so there is no pre-fix
  control variant to rebuild — the driver refuses to run unless the
  fix marker is present (leg guard, same as vetphantom-driver and
  survivalcontrol-driver).
- **Instrument:** `scripts/vetfirst-instrument-20261111.js` reused
  unmodified (vetfirst-b proved it neutral 8/8 exact) + the driver's
  live shadow old-rule count per snapshot, exactly as
  vetphantom-driver and survivalcontrol-driver. Driver:
  `scripts/bisect-anchor-driver-20261111.js` — a copy of
  survivalcontrol-driver with the corpus dir changed to
  `evidence/2026-11-11/perseed-bisect-anchor-a/`, RUN =
  `bisect-anchor-pilot`, arm = `bisect-anchor`, mode fixed to
  `fix` only. Analyzer:
  `scripts/bisect-anchor-analyze-20261111.js`. Proof:
  `scripts/test-bisect-anchor-a.js`.
- **Corpus:** `evidence/2026-11-11/perseed-bisect-anchor-a/` — 8
  per-seed JSONs; summary
  `evidence/2026-11-11/bisect-anchor-a-summary.json`.

## Balanced panel (§15) — N/A

Instrument-only single leg, no code change, no before/after pair to
compare on this base. The before/after comparison IS the vetphantom
fix leg (old base) vs survivalcontrol (current master) on identical
seeds — this arm re-measures the old-base side of that comparison
to anchor it. Same standing as survivalcontrol-b §7.

## Guards (reported, never verdict-flipping post-hoc)

- If any per-seed file is missing or fails to parse, the arm is
  INCOMPLETE, not a verdict — re-run the missing seed(s) only.
- If instrument errors > 0 on any seed, record them; the verdict
  stands only if the errors cannot touch the survival read (the
  survival read comes from the harness end state, not the
  instrument).
- This arm does NOT re-judge the survivalcontrol verdict
  (MASTER_CHANGE stands) and does NOT bisect — it anchors only.
- If this anchor does NOT reproduce (≤2/8), that is a measurement
  problem to report to the coordinator, not a re-judgement of
  either prior leg.
- Telemetry deviation check (Loop B body step 10): attempted; the
  tool refuses recorder-corpus input (same refusal class as
  vetphantom-b, tributedeliv-b, and survivalcontrol-b). Recorded,
  not waived.

## Metric review (§14 — filled in the evidence file, never re-scored here)

- (to be filled after the band: did the metric set hold, or does a
  metric need revision for the NEXT run?)
