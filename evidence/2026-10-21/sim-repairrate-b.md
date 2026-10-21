# sim-repairrate-b — does the repair rate close the post-court dissolution gap?

> **INCOMPLETE — loop run timed out before the 16-pair confirm sweep.**
> Pilot (16 runs, 8801–8804 × leadfeast/belongfeast × control/armed) complete: proof 9/9 GREEN, gate PASSED. Confirm sweep, sense-testing, and telemetry checks not run. Resume point: finish the 8805–8808 sweep with scripts/sweep-repairrate-b.sh, then judge against the pre-registered bar.

Run: fleshout-loop-b-20261021T0430Z (arm sim-repairrate-b), worker tree ~/workspace/worktrees/sim-repairrate-b.
LEVER (policy-side package, zero src/js): REPAIRRATE=1 + SUCCPOLITY=1 —
the repair-rate package (scripts/policies/repairrate.js, new files, env-gated, default-OFF).

## Pre-registration (binding, docs/MEASUREMENT.md §§9–12, 14–15 — written BEFORE any sweep sims)

- **Question**: the parent arm (sim-upkeepgate-b, NO-GO) showed the
  SURPLUSFEED post-court dissolution tradeoff is STRUCTURAL through the
  gate level: with grain flowing under lowered gates, succession-heavy
  trust decay (−8 haircuts, tribute shorts) still outruns the +8/week
  repair verb (8805/8806: trust 100→39, dissolved at 39 — one point under
  the seasoned bar). The named next is the REPAIR RATE (tending strength /
  haircut size / seasoned bar), not the pantry gate. Does the repair-rate
  package close the gap?
- **Treatment** (armed rows; control = the SURPLUSFEED substrate as-is):
  (a) REPAIRRATE=1: succession-beat gift answers — the base policies never
  call answerRenegotiation, so beats expire to silence (−6); the variant
  answers with the gift (+8, 1,500 kcal), a +14 swing per beat, additive
  repair beyond the +8/week tendLink cap ("raise tending strength").
  (b) SUCCPOLITY=1: the engine's landed experimental haircut-shrink
  (sim-succpolity 2026-10-15, GO) — polity bars read pre-death standing
  for 14d, so the realm doesn't dissolve in the funeral hour ("shrink the
  haircut / lower the bar" in its bar effect; zero kcal cost).
  Engagement attributed separately (rrBeatGifts vs graceWindows /
  loadBearingDawns).
- **PRIMARY (binding)**: post-court dissolution pairs-net (armed vs
  control) ≤ +1. A pair = one seed + one policy; pairs-net = (# pairs
  armed_diss > control_diss) − (# pairs control_diss > armed_diss) — the
  parent's binary counting. Baseline context: grandparent SURPLUSFEED
  tradeoff +3 (5v2); parent gate arm +2 (3v1). This arm's control IS the
  SURPLUSFEED substrate (SURPLUSFEED=1, base policies), so the pairs-net
  reads the repair-rate package directly.
- **GO** = pairs-net ≤ +1 AND all guardrails pass:
  - starvation deaths (armed) ≤ control + 1
  - median survival (armed) ≥ control − 10d (the parent's −35d lead
    variant×trim interaction is legible — investigate per-policy, don't
    average away; note this package's kcal cost is ~1,500×beats, far below
    the parent's 46k/run, and SUCCPOLITY costs zero kcal)
  - no new death modes (armed cause set ⊆ control cause set; per-seed
    monster-name kills are pre-existing engine vocabulary — the parent's
    honest category reading)
  - ever-national (armed) ≥ control − 2
  GO means the tradeoff is repair-elastic (evidence FOR the SURPLUSFEED
  default-ON call, with repair-rate guidance). **NO-GO** = gap persists →
  the trim's upkeep cost is structural through both the gate AND the
  repair-rate levels.
- **Seeds/method/horizon**: 8801–8808 × {leadfeast-repairrate,
  belongfeast-repairrate} × {control (SURPLUSFEED=1, package unset), armed
  (SURPLUSFEED=1, REPAIRRATE=1, SUCCPOLITY=1)}, FEASTSCALE_R13=1,
  SEATDRIVE=0, 180d death-aware (the post-court window runs ~d77–175 on
  this substrate; 180d captures it plus tails). PAIRED REUSE of the
  8801-8808 set (same documented exception as the parent — not a
  fresh-seed claim). Same-commit paired control (re-run on this base;
  NEVER compare across commits). STAGED: pilot = 8801–8804 ×
  {leadfeast, belongfeast} × {control, armed} (16 runs) first; the full 32
  only if the pilot passes its gate. Never below 8 seeds per arm.
- **PILOT GATE (pre-registered)**: proceed to the full sweep iff (1) the
  package ENGAGED (≥1 beat-gift fired OR ≥1 SUCCPOLITY grace window stamped
  across the 8 armed runs) AND (2) armed dissolutions ≤ control
  dissolutions (directional movement). Kill fast otherwise.
- **Instrument proof (pre-sweep, all must pass — scripts/test-repairrate-b.js)**:
  (a) ENGAGE: REPAIRRATE=1+SUCCPOLITY=1 on 8805/8806 leadfeast armed —
  beat-gifts fired AND grace windows stamped; (b) RED: package unset ≡
  baseline policies byte-identical (leadfeast/belongfeast, SURPLUSFEED=1);
  (c) DET: same seed twice in-process byte-identical, package unset and
  engaged. Proof ran with FEASTSCALE_R13=1 SEATDRIVE=0 SURPLUSFEED=1 per
  the Usage header (ENV TRAP honored).
- **Honesty bars**: the parent's link instrument reused unchanged (polity
  agreement 100% required); dissolution events come from the same
  attachLinkProbe; the SUCCPOLITY grace sensor is additive RNG-clean pure
  reads at dawn; driver rows extended additively (rr block, succScan,
  death causes).
- **Balanced panel (§15)**: inexpressible — same class as the parent
  (documented there): the treatments (REPAIRRATE=1 / SUCCPOLITY=1 env vars)
  are not part of panel case identity and the pre-registered primary is
  not a contract metric. No bogus compare shipped; the before/after is
  the paired analysis on identical seeds, commit, and instruments
  (scripts/analyze-repairrate-b.js).

## Metric review (§14 — mandatory section)

(TBD after the sweep — judged as written; a miss is NO-GO, never re-scored.)

## Canon

- docs/CANON.md read first, then docs/PRESERVATION.md. Policy-side lever
  only: the feast is the village's social engine; tribute/tend are real
  pantry outflow. New for this arm: succession beats are answerable
  (hierarchy.js answerRenegotiation: gift/visit/wait); the base policies'
  silence is a POLICY choice (they never answer), not an engine default —
  the −6 lapse is the cost of that choice. SUCCPOLITY=1 is loop A's landed
  lever (sim-succpolity 2026-10-15, GO); this arm re-tests it on a NEW
  question (post-court dissolution on the SURPLUSFEED substrate), not a
  re-litigation of succession-collapse demotions.

## Proof results (pre-sweep — 9/9 GREEN)

scripts/test-repairrate-b.js: **9/9 GREEN** (run with FEASTSCALE_R13=1
SEATDRIVE=0 SURPLUSFEED=1 per the Usage header — ENV TRAP honored).

- ENGAGE (8805/8806 leadfeast-repairrate armed, 180d): beat-gifts fired
  (3 and 5), SUCCPOLITY grace windows stamped (21 and 21), polity
  agreement 100% (agreeBad 0). Both runs: courts=1, diss=0 (villages died
  d109/d117 — chaotic seeds — with the realm intact, vs the parent's
  d142 dissolution on 8806; not a paired claim, engagement only).
- RED: REPAIRRATE/SUCCPOLITY unset ≡ baseline policies byte-identical
  (leadfeast/belongfeast, seeds 8801/8802, SURPLUSFEED=1 — this arm's
  substrate; 4/4).
- DET: same seed twice in-process byte-identical, package unset and
  engaged (2/2).

### Pilot (8801–8804 × {leadfeast, belongfeast} × {control, armed} — 16 runs, complete)

Pilot-gate decision (pre-registered): (1) ENGAGED ✓ — 27 beat-gifts fired
and 100s of SUCCPOLITY grace dawns across the 8 armed runs; (2) armed
dissolutions (binary) 4 ≤ control 4 ✓ — a tie, no harm. Directional hints
beyond the binary: belong-8801 armed dissolved once, RE-FORMED (court
d107), and held national to d180 — control dissolved and ended regional;
event counts 5v6 favor armed. Gate PASSES as written (not a failed sniff
test). Proceeding to the full 16-pair sweep (8805–8808; pilot rows kept,
merged by seed — no re-runs).

Wall numbers, pilot (paired, armed / control, n=8):
binary dissolutions 4/8 / 4/8; the full read comes from the 16-pair sweep.

## Sense-testing (SENSE-TESTING LAW — read, not counted)

(TBD)

## Telemetry deviation check

(TBD)

## Convergence state

(TBD)
