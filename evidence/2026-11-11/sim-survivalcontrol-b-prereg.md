# Survival-collapse control — pre-registration (arm sim-survivalcontrol-b)

Run fleshout-loop-b-20261111T2030Z, Loop B, axis scale-onramp /
winnability chain (tracker 1830Z next blank #2). Written and committed
BEFORE any judged sim. Base: local master `d33ca69f9` (read fresh from
the main tree at run start; it had not moved since spawn).

**Instrument-only arm — ZERO src/js changes.** This arm re-runs one
8-seed band on current master to decide whether the survival collapse
seen by sim-tributedeliv-b is the reconcile merge or band variation.
It changes no game code and builds nothing.

## The question

Two bands, same policy (competent verbatim), same horizon (150d
death-aware), same instrument family:

| Band | Base | Survived | Median |
|---|---|---|---|
| vetphantom fix leg (seeds 190391–190398) | pre-reconcile master `5157782a4` (anchor `7d93e418a`) | **6/8** | **150d** |
| tributedeliv fresh band (seeds 190411–190418) | post-reconcile master `3eec28a81` | **1/8** | **130d**, deaths combat-heavy (591/737 combat/expedition/wild, starvation 4) |

The tributedeliv re-trace of vetphantom seeds 190393/190397 on the
new base did NOT reproduce (both village-lost d149/d142 vs survived
150d) but was declared VOID because master had moved (4,677 src/js
insertions) — so whether the collapse is the reconcile merge or band
variation is UNDECIDED. This control leg decides it by re-running the
vetphantom seeds on current master.

## Canon

docs/CANON.md read first. No canon doc covers survival-collapse
attribution; the veteran-bar rule comes from docs/MONSTER-WAVES.md
design call #4 and Steve's 2026-11-10 scholar-counts ruling, same as
vetphantom-b and tributedeliv-b. Nothing here invents canon.

## Primary metric + decision rule (a miss is a verdict, never re-scored)

**Primary metric: survived count on seeds 190391–190398 on current
master**, vs the vetphantom fix leg's 6/8 (median 150d).

| Outcome | Verdict |
|---|---|
| **≥5/8 survive** | **BAND VARIATION** — the 190411–190418 band is harder; the collapse is NOT the merge |
| **≤2/8 survive** | **MASTER CHANGE implicated** — name the candidates in order: reconcile merge, dawn scorer, mournblooded standing.js. Do NOT bisect yet; that is a follow-up arm |
| **3–4/8 survive** | **INCONCLUSIVE** — a bigger band is owed before anyone blames the merge or the band |

The analyzer (`scripts/survivalcontrol-analyze-20261111.js`) judges
this rule and exits 0 only when it can classify the outcome under it
(any of the three verdicts is a classified outcome; exit 1 only on
instrument failure, corpus incompleteness, or an unclassifiable
read).

**Secondary (reported, not judged):** median survival vs 150d;
death-cause shares vs tributedeliv's combat-heavy profile
(combat/expedition/wild vs starvation/sickness/thirst); wave 4–5
unlocks; national/table/wins; standing range; tribute-ready days.

## Horizon + seeds + policies

- **Horizon: 150d, death-aware** (+10d tail max) — identical to both
  prior bands, so the survival counts are comparable.
- **Seeds: 190391–190398 (8 seeds) — deliberately the SAME band as
  vetphantom.** A control re-runs the same seeds on new code; that is
  the point of a control, not a freshness violation. The seed-band
  freshness rule exists to stop re-using a band as if it were a fresh
  measurement; this arm explicitly re-uses it as a matched control
  and says so here, in the prereg, before any sim.
- **Policy: competent verbatim, SINGLE leg on current master.** The
  vetphantom fix is already on master (roster-check marker present in
  `src/js/standing.js`, verified at run start), so there is no
  pre-fix control variant to rebuild — the driver refuses to run
  unless the fix marker is present (leg guard, same as
  vetphantom-driver).
- **Instrument:** `scripts/vetfirst-instrument-20261111.js` reused
  unmodified (vetfirst-b proved it neutral 8/8 exact) + the driver's
  live shadow old-rule count per snapshot, exactly as
  vetphantom-driver. Driver:
  `scripts/survivalcontrol-driver-20261111.js` — a copy of
  vetphantom-driver with the corpus dir changed to
  `evidence/2026-11-11/perseed-survivalcontrol-b/`, RUN =
  `survivalcontrol-pilot`, arm = `survivalcontrol`, mode fixed to
  `fix` only. Analyzer:
  `scripts/survivalcontrol-analyze-20261111.js`. Proof:
  `scripts/test-survivalcontrol-b.js`.
- **Corpus:** `evidence/2026-11-11/perseed-survivalcontrol-b/` — 8
  per-seed JSONs; summary
  `evidence/2026-11-11/survivalcontrol-b-summary.json`.

## Balanced panel (§15) — N/A

Instrument-only single leg, no code change, no before/after pair to
compare on this base. The before/after comparison IS the vetphantom
fix leg (old base) vs this control (current master) on identical
seeds — the analyzer's decision rule is the judge. Same standing as
tributedeliv-b §7.

## Guards (reported, never verdict-flipping post-hoc)

- If any per-seed file is missing or fails to parse, the arm is
  INCOMPLETE, not a verdict — re-run the missing seed(s) only.
- If instrument errors > 0 on any seed, record them; the verdict
  stands only if the errors cannot touch the survival read (the
  survival read comes from the harness end state, not the
  instrument).
- The tributedeliv re-trace stays VOID — this arm does NOT re-judge
  it. Only the fresh 8-seed control is judged here.
- If this control ALSO shows collapse (≤2/8), the follow-up owed is
  a bisect arm; this arm does not attempt it.
- Telemetry deviation check (Loop B body step 10): attempted; the
  tool refuses recorder-corpus input (same refusal class as
  vetphantom-b and tributedeliv-b). Recorded, not waived.

## Metric review (§14 — filled in the evidence file, never re-scored here)

- (to be filled after the band: did the metric set hold, or does a
  metric need revision for the NEXT run?)
