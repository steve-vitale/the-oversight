# sim-pdtradeoff-b — PLENTYDEPRI=1/0 tradeoff DIAG (measurement only)

Run: oversight-flesh-out-loop-b-20261024T0430Z (cron), axis food-economy.
Worker tree: ~/workspace/worktrees/sim-pdtradeoff-b.
DIAG arm: ZERO new lever, zero src/js changes. Measurement only.

## Canon

READ docs/CANON.md first, then docs/PRESERVATION.md (the food ladder — the
plenty-depri throttle sits on the production side of the ladder, easing
hauling when the pantry reads plentiful so the glut doesn't rot). **No
canon doc covers plentydepri's tradeoff** — the tradeoff (small
survival/national cost for large rot reduction) is a measured property of
the landed lever, not a designed value. Documented here, not invented.

## The question (resolves two open items from run 20261024T0332Z's bufferdepri arm)

1. SUBSTRATE FLAG (bufferdepri metric review #3): bufferdepri's PD=1/PD=0
   sanity replication on seeds 9250–9265 deviated on leadfeast/dg1
   (measured 1.033x vs the depinteraction substrate's 0.558x). Reported,
   not resolved — resolved here BY MEASUREMENT.
2. TRADEOFF READ (backlog #847): "The lever (already on master) trades a
   small survival/national cost for a large rot reduction — a lever-run
   question for the axis, not a self-revert." The current-master reading
   of that tradeoff.

## PRE-REGISTRATION (bound per §14 — a miss is a miss, never re-scored)

- Substrate: FEASTSCALE_R13=1, SEATDRIVE=0 (asserted FATAL in every
  script), 100d death-aware horizons (dead villages stop; +10d tail max —
  the food-economy question answers in the first 100 days), policies
  {leadfeast, belongfeast}.
- Cells: {PLENTYDEPRI=0/1} x {DEPOSITGATE=0/1} explicit env (DG explicit on
  every config, never unset).
- Seeds: 9250–9265 — the SAME seeds as the depinteraction-b /
  easingchannels-b / bufferdepri-b substrate runs; the paired design
  compares PD levels on IDENTICAL seeds, so seed identity is the control.
  16 seeds x 2 policies x 4 cells = 64 configs.
- PRIMARY (DIAG, binding as a measurement): the four PD=1/PD=0 rot/100d
  ratios (rot/100d = (rotFreshKcal + rotPreservedKcal) absolute kcal per 100
  days alive, aggregate sum(rot)/sum(days)*100 — the SAME operationalization
  as the substrate runs). DIAG-GO either way — the flag is resolved BY the
  numbers:
  - leadfeast/dg1 reproduces ~1.033x -> current master has a different
    PD=1 rot effect on dg1 than the depinteraction substrate (drift
    confirmed — candidate drift commits named via git log on the relevant
    regions);
  - leadfeast/dg1 reproduces ~0.558x -> the bufferdepri replication was
    instrument noise (which instrument differed is named — candidates: the
    DG-unset-vs-explicit cell, the analyzer's medianSurvival patch).
- SECONDARY (report-only, no verdict): the #847 tradeoff table on current
  master per cell — PD=1 vs PD=0: rot/100d ratio, exposure-normalized
  starvation (deaths/villageDays*100), national(end), table reach. No
  GO/NO-GO; it's a lever-run question for the axis.
- Instruments: scripts/sweep-pdtradeoff-b.js (derived from
  scripts/sweep-bufferdepri-b.js with the declared deltas — PD=2 cells and
  the DR dimension stripped; the identical instrument per finding #850),
  scripts/analyze-pdtradeoff-b.js (DIAG analyzer; patches cell
  medianSurvival into per-seed files like the bufferdepri analyzer),
  scripts/test-pdtradeoff-b.js (proof: instrument derivation, determinism,
  schema, FATAL asserts, analyzer exit semantics, corpus byte-reproduce).
- Balanced panel per §15: env-gated -> the documented #797 "Unmatched
  flags" invalidity by construction; the invalid compare .md is built and
  attached, the metric judged on manual paired rows.
- WATCH (report-only): wall numbers per cell (national/table/wins,
  wave 1-5 unlocks, median/max survival), death-cause shares, PD=1-vs-PD=0
  deltas.

## Metric review (pre-sims)

- This is a DIAG, not a lever: there is no GO/NO-GO bar. The binding
  element is the measurement operationalization (rot/100d aggregate,
  identical seeds, explicit DG) — a deviation from the pre-registered
  instrument would be a NO-GO on the run, not on any lever.
- The medianSurvival analyzer patch mutates per-seed corpus files (as
  bufferdepri's did); the byte-reproduce check normalizes it out on both
  sides. Schema-exactness of all other fields is the invariant.
- Seeds 9250–9265 are REUSED from the substrate runs by design (paired
  identical-seed comparison); they are fresh for the DIAG question itself.

## Results

Full analyzer report: `./pdtradeoff-b-analyzer-report.txt` (exit 0, 0 FAIL).
Sweep: 128/128 configs verified (16 seeds 9250–9265 x {leadfeast,belongfeast}
x {pd0,pd1}x{dg0,dg1}, 100d death-aware, FEASTSCALE_R13=1/SEATDRIVE=0,
DG FATAL-explicit). Proof `scripts/test-pdtradeoff-b.js`: 8/8 GREEN.
Panel compare: invalid BY CONSTRUCTION for env-gated levers (finding #797) —
`./pdtradeoff-b-panel-compare.md` documents the invalidity; the verdict was
computed by the analyzer on 128 identical-seed paired PD=1/PD=0 configs with
the manual paired rows attached (§15 fallback, in the analyzer report).

### PRIMARY (DIAG, binding): PD=1/PD=0 rot/100d per cell

| cell | control rot/100d | PD=1 rot/100d | ratio | depinteraction anchor | bufferdepri replication |
|---|---|---|---|---|---|
| leadfeast dg0 | 301.8k | 233.3k | **0.773x** | 0.647x | 0.669x |
| leadfeast dg1 | 109.9k | 100.3k | **0.913x** | 0.558x | 1.033x |
| belongfeast dg0 | 155.6k | 152.3k | **0.979x** | 0.523x | 0.482x |
| belongfeast dg1 | 89.1k | 106.7k | **1.197x** | 0.339x | 0.781x |

### SECONDARY (#847 tradeoff, report-only): current-master PD=1 vs PD=0

| cell | rot/100d ratio | starvation/100vd c→a | national(end) c→a | table c→a |
|---|---|---|---|---|
| leadfeast dg0 | 0.773x | 0.052→0.056 (7/8 deaths) | 13→11 | 0→0 |
| leadfeast dg1 | 0.913x | 0.071→0.073 (9/10 deaths) | 9→10 | 0→0 |
| belongfeast dg0 | 0.979x | 0.066→0.059 (9/8 deaths) | 8→9 | 0→0 |
| belongfeast dg1 | 1.197x | 0.078→0.066 (10/9 deaths) | 9→10 | 0→0 |

The landed headline ("rot/100d collapses 4-6x under PD=1, 302k→68k lead/dg0")
does NOT hold on current master: 0.773x on leadfeast/dg0, ~1x elsewhere, and
PD=1 *increases* rot 1.197x on belongfeast/dg1. Starvation costs are tiny
(±0.012/100vd); national roughly flat (±2). The tradeoff is much thinner than
the landed record claims — a lever-run question for the axis, NOT a verdict
here.

### Scale wall per cell (SEATDRIVE=0 pre-seat: wins structurally 0)
national 8–13, table 0, wins 0, wave≥4 2–9, wave≥5 0/128, median survival
98.5–100d. Death causes pooled: combat 77.1%, sickness 13.1%, starvation
7.2%, dehydration 2.3%, alien 0.4%.

### SENSE (SENSE-TESTING LAW)
`./pdtradeoff-b-sense.txt` (seed 9253 leadfeast, 60d, PD=0 vs PD=1 day-voice
capture): PASS. The PD=1 ease is voiced by named villagers making legible
pantry decisions — Bill: "No point hauling what'll rot. Mending the nets
instead." / Ava: "Plenty for days. Teaching the kids snares instead — they'll
need to know." / Farid: "Shelves are full to bursting. Patching the boots
today." / Jovan: "Enough. Carving bowls instead — we're down to the cracked
ones." Eased villagers do sensible alternative work; nothing is silently
throttled. Coherent with the bufferdepri sense reference.

## Metric review (post-run)

- PRIMARY resolved per the pre-registered rule (no re-scoring): the four
  ratios are the measurement; the DIAG-GO/flag-resolution is BY the numbers.
- The analyzer's byte-reproduce check (0/64 identical vs the bufferdepri PD=0
  corpus) has an instrument gap: it normalizes `medianSurvival` but NOT the
  wall-clock `diag.ms` field, so it can never fully pass. However,
  field-by-field comparison shows REAL trajectory differences beyond ms
  (daysAlive 100 vs 87, rotFreshKcal, glut channels on seed 9250 pd0-dg0
  leadfeast) — genuine drift, not just the ms artifact. The check's "drifted"
  note is directionally right but overstated by the ms gap; a future analyzer
  should normalize `ms` too.
- Drift forensics (coordinator, post-sweep): the PD=2 layer (6f6bf201a) is
  EMPIRICALLY EXONERATED — single-seed A/B (9250 pd0-dg0 leadfeast, layer vs
  6f6bf201a^ game.js, ms-normalized) → IDENTICAL trajectories; its
  byte-identical-for-PD≠2 claim holds. The `mode` string difference between
  the sweep scripts ('bufferdepri-b-' vs 'pdtradeoff-b-') is ruled out:
  `loadGame` seeds RNG from `seed` only (scripts/sim-harness.js). Named drift
  candidates between the bufferdepri corpus and this sweep: 85e42a22a (r39
  _sdNextAct dedup), 7d6f735c9 (r30 convoThreadAbout), d581d6cf2 (r42
  conversation fizzle/grief/winddown fixes), db7c5f211 (bloodrestraint hook,
  default-off, claims OFF byte-identical 27/27). The r42 grief/winddown
  changes are the most behavior-plausible; exact attribution needs per-commit
  bisection — candidates, not confirmed.
- Seeds 9250–9265 reused by design (paired identical-seed comparison); the
  pairing is within THIS sweep (PD=0 vs PD=1 on identical seeds), so the
  cross-corpus drift does not touch the primary.

## Verdict

**DIAG-GO — RESOLVED: drift CONFIRMED.** leadfeast/dg1 = 0.913x is closer to
bufferdepri's 1.033x than to the depinteraction substrate's 0.558x. Current
master has a different PD=1 rot effect on dg1 than the depinteraction
substrate; the bufferdepri sanity replication was FAITHFUL on its corpus;
the depinteraction 0.558x is a stale substrate reading. Backlog #847's
tradeoff table is updated with the current-master numbers above — the "large
rot reduction" is now 0.77–1.20x (a 1.197x *increase* on belongfeast/dg1),
materially thinner than the landed headline; the survival/national costs
remain small. Named next for the axis: a lever-run re-examination of
PLENTYDEPRI=1's value proposition on current master (the drift ate the
headline benefit), and a per-commit bisection of the depinteraction→bufferdepri
drift window if the exact cause matters.
