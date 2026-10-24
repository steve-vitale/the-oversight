# sim-pdvalue-b — PLENTYDEPRI=1 value re-examination (LEVER verdict, fresh seeds)

Run: oversight-flesh-out-loop-b-20261024T0812Z (cron), axis food-economy.
Worker tree: ~/workspace/worktrees/sim-pdvalue-b.
LEVER arm: measurement only, zero src/js changes. Backlog #871 (from loop B
arm sim-pdtradeoff-b DIAG-GO, run fleshout-loop-b-20261024T0630Z,
evidence/2026-10-24/sim-pdtradeoff-b.md — read in full before designing).

## Canon

READ docs/CANON.md first, then docs/PRESERVATION.md (the food ladder — the
plenty-depri throttle sits on the production side of the ladder, easing
hauling when the pantry reads plentiful so the glut doesn't rot). **No
canon doc covers plentydepri's tradeoff** — the tradeoff (small
survival/national cost for large rot reduction) is a measured property of
the landed lever, not a designed value, as pdtradeoff-b documented.
Documented here, not invented.

## The question (backlog #871)

On current master the PD=1 rot benefit is 0.77–1.20x (pdtradeoff,
seeds 9250–9265), vs the landed 4–6x headline, with a 1.197x rot INCREASE
on belongfeast/dg1. Does PD=1 earn its (small) survival/national costs on
current master, or did drift change the lever's rank among rot levers?
This arm answers with a LEVER verdict on FRESH seeds — never the
pdtradeoff corpus seeds (9250–9265), never sibling pooled blocks.

## PRE-REGISTRATION (bound per §14 — a miss is NO-GO, never re-scored)

- Substrate: FEASTSCALE_R13=1, SEATDRIVE=0 (asserted FATAL in every
  script), 100d death-aware horizons (dead villages stop; +10d tail max —
  the food-economy question answers in the first 100 days), policies
  {leadfeast, belongfeast}. SEATDRIVE=0 is the pre-seat regime: wins are
  structurally 0 — said here, not chased.
- Cells: {PLENTYDEPRI=0/1} x {DEPOSITGATE=0/1} explicit env (DG explicit on
  every config, never unset).
- Seeds: PILOT 94001–94008 (8 fresh seeds); CONFIRM 94011–94026 (16 fresh
  seeds) only if the pilot passes. Pilot = 8 seeds x 2 policies x 4 cells
  = 64 configs; full = 24 seeds x 2 policies x 4 cells = 192 configs.
- C1 freshness proof: seeds verified absent from all existing corpora —
  scan of per-seed "seed" fields in this worktree's corpus dirs plus the
  sibling trees' 2026-10-24 evidence filenames; pooled blocks 9250–9265,
  92801–92816, 92831–92846 are all taken and all avoided. The analyzer
  re-asserts C1 (taken blocks + pdtradeoff corpus scan) and aborts on
  any hit — a verdict on reused seeds would be void by construction.
- PRIMARY (binding): rot/100d PD=1/PD=0 ≤ 0.85 on at least 3 of 4 cells.
  rot/100d = (rotFreshKcal + rotPreservedKcal) absolute kcal per 100 days
  alive, aggregate sum(rot)/sum(days)*100 — the SAME operationalization
  as the pdtradeoff/substrate runs. Adopted as briefed (0.77–1.20 anchor
  makes 0.85 a real test, not a gimme).
- GUARDRAILS (binding, per cell): exposure-normalized starvation
  ≤ control+0.02/100vd; national ≥ control−2; no new death modes (no
  kind-mapped cause kind present in PD=1 with ≥2 deaths and absent from
  its control).
- VERDICT: GO ("earns its costs") iff PRIMARY + all guardrails pass;
  otherwise NO-GO with the rank implication written up explicitly (where
  PD=1 ranks among rot levers now — below the KEEPCEIL volume knob?
  below rack-rescue? — and whether the lever should stay, be re-priced,
  or be parked).
- PILOT GATE: the pilot's own bar is the primary on 8 seeds (≤0.85 on
  ≥3/4 cells). A pilot that already fails the primary is killed-at-pilot;
  confirm spend never rescues a failed primary — it only adds power to a
  passing one.
- Instruments: scripts/sweep-pdvalue-b.js (derived from
  scripts/sweep-pdtradeoff-b.js with the declared deltas — pdvalue
  naming/corpus/mode, default seed list 94001–94008, header rewording),
  scripts/analyze-pdvalue-b.js (verdict analyzer; C1 freshness gate,
  verdict logic, manual paired rows), scripts/test-pdvalue-b.js (proof:
  P1 derivation, P2 determinism, P3 schema, P4 FATAL asserts, P5 analyzer
  exit semantics, P6 C1 freshness, P7 verdict logic),
  scripts/run-pdvalue-b.sh (runner with verify + resume),
  scripts/panel-pdvalue-b.js (§15 panel attempt),
  scripts/sense-pdvalue-b.js (sense; seed env-driven, fresh seed only).
- Balanced panel per §15: env-gated -> the documented #797 "Unmatched
  flags" invalidity by construction; the attempt is documented in
  ./pdvalue-b-panel-compare.md and the verdict is judged on manual paired
  rows. The metric is NOT re-scored.
- WATCH (report-only): wall numbers per cell (national/table/wins,
  wave 1–5 unlocks, median/max survival), death-cause shares, PD=1-vs-PD=0
  deltas, villager behavior (SENSE-TESTING LAW: transcripts read, not
  just counts).

## Metric review (pre-sims)

- The 0.85 bar is adopted as briefed, not softened: pdtradeoff's anchor
  (0.773/0.913/0.979/1.197) already straddles it, so the bar discriminates
  rather than rubber-stamps.
- The guardrail starvation bar (+0.02/100vd) is tight relative to
  pdtradeoff's observed ±0.012 deltas — a real cost showing up above
  that line fails the lever even if rot passes. That is the intended
  tradeoff discipline: the lever must earn its costs, not merely cut rot.
- The "no new death modes" guardrail operationalization (≥2 deaths of a
  kind absent from control) is this arm's, chosen before sweeping: a
  single stray death is noise; a repeated new kind is a signal.
- The analyzer's ms field is never byte-compared (pdtradeoff metric
  review: the wall-clock ms gap made byte-reproduce unpassable by
  construction). Trajectories are compared, not timings.

## Results

[PENDING — pre-registration committed before sweeping; results appended
after the pilot gate and any confirm.]

## Metric review (post-run)

[PENDING]

## SENSE (SENSE-TESTING LAW)

[PENDING]

## Verdict

[PENDING]
