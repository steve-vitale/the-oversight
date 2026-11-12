# Survival-collapse bisect TRUE ANCHOR — pre-registration (arm sim-bisect-anchor2-a)

Run fleshout-20261111T2317Z, Loop B, axis scale-onramp / winnability
chain (tracker 2030Z next blank 1 — the survival-collapse bisect,
ROUND 2). Written and committed BEFORE any judged sim. Base:
`5157782a4` — the TRUE vetphantom measurement base, read fresh from
the worktree at run start with `git log --oneline -1` (tip:
`5157782a4 sim-corruptfirst-a: fill rebase note ...`).

**Instrument-only arm — ZERO src/js changes.** This arm re-runs one
8-seed band on the TRUE measurement base to confirm the anchor
reproduces before the bisect steps forward. It changes no game code
and builds nothing.

## The question

The round-1 anchor arm (evidence/2026-11-11/sim-bisect-anchor-a.md,
LANDED on master as `54ac6040d`) ran the 8-seed survival control on
`3f136f07e` and got 1/8, NOT the vetphantom fix leg's 6/8 — and its
corpus is sha-identical to survivalcontrol's on all 8 seeds. That
exonerated mournblooded and moved the collapse window: the vetphantom
6/8 was measured on `5157782a4`, and the band was never re-run after
the rebase to `3f136f07e`. This arm re-runs the control on the TRUE
measurement base (`5157782a4`) to confirm the anchor reproduces
there. If it does, the bisect has a solid anchor and the collapse
sits in `5157782a4..3f136f07e`; if it does not, the measurement
itself is suspect in a deeper way and the bisect must not proceed
on these numbers.

| Band | Base | Survived | Median |
|---|---|---|---|
| vetphantom fix leg (seeds 190391–190398) | `5157782a4` | **6/8** | **150d** |
| anchor-a (seeds 190391–190398) | `3f136f07e` | **1/8** | **126d** |
| survivalcontrol (seeds 190391–190398) | `d33ca69f9` | **1/8** | **126d** |
| this anchor (seeds 190391–190398) | `5157782a4` | **?** | **?** |

Base-verification note (the lesson of anchor-a §8): this prereg's
base label was verified from the prior arm's corpus, not from the
brief — vetphantom-b's evidence header states the band ran on base
`5157782a4` and only the proof was re-run after the rebase to
`3f136f07e`; the worktree tip here (`5157782a4`) matches, and
`src/js/standing.js` at this base carries the roster-check fix with
sha256 `f8fda4295a99` — the same sha the vetphantom fix leg recorded.

## Canon

docs/CANON.md read first, plus docs/MONSTER-WAVES.md design call #4
(veteran bar) and Steve's 2026-11-10 scholar-counts ruling, same as
vetphantom-b, tributedeliv-b, survivalcontrol-b, and anchor-a. No
canon doc covers survival-collapse attribution; nothing here
invents canon.

## Primary metric + decision rule (a miss is a verdict, never re-scored)

**Primary metric: survived count on seeds 190391–190398 on the TRUE
measurement base `5157782a4`**, vs the vetphantom fix leg's 6/8
(median 150d).

| Outcome | Verdict |
|---|---|
| **≥5/8 survive** | **ANCHOR REPRODUCES** — the TRUE base still gives the vetphantom fix leg's survival; the bisect anchor is solid and the collapse sits after this base |
| **≤2/8 survive** | **ANCHOR DOES NOT REPRODUCE** — a deeper measurement problem to report, not re-judge; the bisect must NOT proceed on these numbers until the discrepancy is understood |
| **3–4/8 survive** | **INCONCLUSIVE** — the anchor is neither confirmed nor refuted; a bigger band or a re-trace is owed before bisecting |

The analyzer (`scripts/bisect-anchor2-analyze-20261111.js`) judges
this rule and exits 0 only when it can classify the outcome under it
(any of the three verdicts is a classified outcome; exit 1 only on
instrument failure, corpus incompleteness, or an unclassifiable
read).

**Secondary (reported, not judged):** median survival vs 150d;
death-cause shares vs survivalcontrol's combat-heavy profile
(585/615 combat/expedition/wild, starvation 0); wave 4–5 unlocks;
national/table/wins; standing range; tribute-ready days; phantom
days (0 expected — the roster-check fix is on this base).
**Blooded is reported from the summary JSON, not by eyeballing
text** — survivalcontrol-b §2 text said "Blooded 0/8" while its own
summary JSON says 1/8.

## Horizon + seeds + policies

- **Horizon: 150d, death-aware** (+10d tail max) — identical to both
  prior bands, so the survival counts are comparable.
- **Seeds: 190391–190398 (8 seeds) — deliberately the SAME band as
  vetphantom, survivalcontrol, and anchor-a.** A control/bisect
  anchor re-runs the same seeds on old code; that is the point of an
  anchor, not a freshness violation. The seed-band freshness rule
  exists to stop re-using a band as if it were a fresh measurement;
  this arm explicitly re-uses it as a matched control and says so
  here, in the prereg, before any sim. Same justification as the
  survivalcontrol prereg.
- **Policy: competent verbatim, SINGLE leg on the TRUE base.** The
  vetphantom fix is already on this base (roster-check marker
  present in `src/js/standing.js`, verified at run start:
  `roster.indexOf(vid)` at standing.js:239, sha256
  `f8fda4295a99`), so there is no pre-fix control variant to rebuild
  — the driver refuses to run unless the fix marker is present (leg
  guard, same as vetphantom-driver, survivalcontrol-driver, and
  bisect-anchor-driver).
- **Instrument:** `scripts/vetfirst-instrument-20261111.js` reused
  unmodified (already present at this base; vetfirst-b proved it
  neutral 8/8 exact) + the driver's live shadow old-rule count per
  snapshot, exactly as vetphantom-driver, survivalcontrol-driver,
  and bisect-anchor-driver. Driver:
  `scripts/bisect-anchor2-driver-20261111.js` — a copy of
  survivalcontrol-driver with the corpus dir changed to
  `evidence/2026-11-11/perseed-bisect-anchor2-a/`, RUN =
  `bisect-anchor2-pilot`, arm = `bisect-anchor2`, mode fixed to
  `fix` only. Analyzer:
  `scripts/bisect-anchor2-analyze-20261111.js`. Proof:
  `scripts/test-bisect-anchor2-a.js`.
- **Corpus:** `evidence/2026-11-11/perseed-bisect-anchor2-a/` — 8
  per-seed JSONs; summary
  `evidence/2026-11-11/bisect-anchor2-a-summary.json`.

## Balanced panel (§15) — N/A

Instrument-only single leg, no code change, no before/after pair to
compare on this base. The before/after comparison IS the vetphantom
fix leg (TRUE base) vs survivalcontrol (current master) on identical
seeds — this arm re-measures the TRUE-base side of that comparison
to anchor it. Same standing as survivalcontrol-b §7 and anchor-a §7.

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
  vetphantom-b, tributedeliv-b, survivalcontrol-b, and anchor-a).
  Recorded, not waived.

## Metric review (§14 — filled in the evidence file, never re-scored here)

- (to be filled after the band: did the metric set hold, or does a
  metric need revision for the NEXT run?)
