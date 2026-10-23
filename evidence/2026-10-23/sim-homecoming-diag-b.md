# sim-homecoming-diag-b — scholarHomecoming sub-channel decomposition (2×2 factorial)

Run: oversight-flesh-out-loop-b-20261023T1241Z (cron), axis food-economy.
Worker tree: ~/workspace/worktrees/sim-homecoming-diag-b.
DIAG — MEASUREMENT ONLY, zero src/js changes, ever. Instruments only.

## The question (named next from sim-easingchannels-b)

"SCHOLAR HOMECOMING THROTTLED BY PRODUCTION EASING — on DG=0 cells the
decomposition shows scholarHomecoming falling under PD=1 (-590
kcal/glut-day leadfeast, -195 belongfeast) — production easing reaches
surplus-driven scholar homecoming deposits, not just the funnel.share raw
channel. Worth a follow-up DIAG on homecoming-channel interaction."

This arm decomposes the scholarHomecoming channel kcal-by-kcal on the same
{PLENTYDEPRI=0/1}×{DEPOSITGATE=0/1} 2×2 factorial (FEASTSCALE_R13=1,
SEATDRIVE=0, 100d death-aware), naming the inflow sub-channels, which
throttle under PD=1 and which don't, and contrasting the engagement ledger
with the funnel.share throttle.

## Canon read

docs/CANON.md (manifest + standing rules), docs/PRESERVATION.md (food
ladder; not directly the homecoming path, but the preservation rungs are
what the scholar's pack food travels). The homecoming decision mechanics
(game.js returnToVillage: keep-a-day's-food, DEPOSITGATE keep 2000→6000
when plentiful, pantry cap, trail-spoilage discard) are game code, not
canon-doc'd — the instrument attributes them, it does not redesign them.

## Instrument

scripts/homecoming-instruments-b.js — a CLONE of the proven
scripts/easingchannels-instruments-b.js (choke points, daily sampler,
ledgers, say capture, taxonomy byte-identical in behavior) PLUS
kcal-by-kcal sub-channel instrumentation at the homecoming decision
(returnToVillage / returnToOldVillage), all read-only:
  hc.brought    — scholar's pack food kcal at the decision (supply side)
  hc.kept       — kcal kept in the pack (KEEP_KCAL ceiling)
  hc.keepRaise  — extra kcal kept DUE TO the DG 2000→6000 raise
                  (max(0, kept-2000) on raise-engaged decisions)
  hc.deposit    — kcal that left the pack for the pantry (the channel;
                  from the choke-point channel delta across the decision)
  hc.spoiled    — kcal discarded on the trail (never reaches the pantry)
  hc.capStranded— kcal kept because the pantry cap bound (pantryRoom<=0)
  hc.decisions  — engagement: decisions with brought>0 (daysAway>=1 split)
  scholarPackEaten / scholarPantryDrawn — consumption context
Identities: hc.deposit == scholarHomecoming channel total;
hc.brought == hc.kept + hc.deposit + hc.spoiled. Both asserted per seed
in scripts/test-homecoming-diag-b.js.

## PRE-REGISTRATION (§14 — written BEFORE any sims)

- Substrate: FEASTSCALE_R13=1, SEATDRIVE=0 (asserted FATAL in every script),
  100d death-aware horizons (dead villages stop; +10d tail max),
  policies {leadfeast, belongfeast}. PLENTYDEPRI=0/1 x DEPOSITGATE=0/1 explicit.
- Cells: pd0dg0, pd0dg1, pd1dg0, pd1dg1.
- Seeds: 8-seed pilot 92801–92808 (scanned scripts/ + evidence/ — zero
  collisions); extend to 16 (92801–92816) if the signal is rich
  (pilot shows a named, signed homecoming throttle on ≥1 cell).
- PRIMARY (per feast-side, per DG setting — PD=1 vs PD=0): the
  scholarHomecoming channel per glut-day, decomposed into sub-channels:
    (i)   hc.brought/glut-day Δ — the supply-side throttle (named in kcal)
    (ii)  hc.keepRaise/glut-day Δ — the DG-side throttle (named in kcal;
          0 by construction on DG=0 cells)
    (iii) hc.decisions engagement Δ — fewer returns vs smaller hauls
          (brought/decision named)
- DIAG-GO iff: the scholarHomecoming channel is FULLY attributed per cell —
  inflow sub-channels named (which throttle under PD=1, which don't), the
  engagement-ledger contrast with the funnel.share throttle drawn
  (funnel.share: PD-side depriKcal + DG-side funnelShareEased;
   scholarHomecoming: PD-side brought Δ + DG-side keepRaise Δ), and
  0 unexplained cells (every cell's PD=1 deposit Δ accounted to named
  sub-channels within rounding).
- A miss is DIAG-NO-GO, never re-scored. Verdict classes:
  DIAG-GO / DIAG-NO-GO / killed-at-pilot.
- GUARDRAILS (watch, report-only — both levers are on master; same bars as
  sim-easingchannels-b): (a) paired survival-diff ≥ −10d; (b)
  exposure-normalized starvation ≤ control + 2/(armedVD/100); (c) no new
  death modes; (d) national ≥ control − 2; (e) freshDays ≥ 0.5× control.
- SECONDARY (reported): rot/100d, engagement (depriKcal>0, easedKcal>0,
  hc decisions), wall numbers per cell (national/table/wins, wave 4–5,
  median survival), sense read of homecoming beats.
- Instruments: scripts/sweep-homecoming-diag-b.js (per-seed JSONs to
  evidence/2026-10-23/perseed-homecoming-diag-b/), scripts/proof →
  scripts/test-homecoming-diag-b.js (fixture + det-gate + hook
  byte-identical + channel identities + determinism + corpus
  reproduction), scripts/analyze-homecoming-diag-b.js (DIAG verdict).
  Balanced panel per §15: invalid BY CONSTRUCTION on DIAG corpora (#797 —
  env-gated levers change the flag snapshot; identical code); the invalid
  compare .md is attached alongside the manual paired rows, metric NOT
  re-scored.

## Metric review (§14)

(pre-sims)
- The DIAG-GO bar is MECHANISM attribution (every scholarHomecoming kcal
  assigned to a named sub-channel: brought/kept/deposit/spoiled/capStranded/
  keepRaise; "unexplained" = identity mismatch only), per the
  sim-easingchannels-b metric-review operationalization. The five-DIAG-
  channel taxonomy coverage is the sibling arm's line, not this DIAG's.
- The keepRaise sub-channel is a COUNTERFACTUAL measure (max(0, kept−2000)
  on raise-engaged decisions): the keep logic packs whole stacks, so the
  extra-kept kcal is exactly the deposit the raise withheld. On DG=0 cells
  it is 0 by construction — the PD=1 throttle there must be supply-side
  (brought) or the cell is unexplained.
- Observer effect (sim-findings.md): the sweep's daily policy-wrapper reads
  perturb trajectories. This DIAG uses the IDENTICAL daily wrapper as
  sim-easingchannels-b; determinism claims name the instrument, and the
  proof test shows the identical instrument reproduces the easingchannels
  corpus numbers (seed 9250/pd0dg0/leadfeast) exactly.
- Balanced panel §15 invalid by construction (#797) on DIAG corpora —
  attach the invalid compare .md + manual paired rows instead.

(TBD — post-analysis review)

## Results

**INCOMPLETE — run timed out at 7200s during the sweep. 57/128 configs
complete. No verdict; do not judge.**

Corpus state at timeout (2026-10-23 ~19:32Z):
- pd0dg0: belongfeast 14/16, leadfeast 16/16
- pd0dg1: belongfeast 7/16, leadfeast 16/16
- pd1dg0: belongfeast 0/16, leadfeast 2/16
- pd1dg1: belongfeast 0/16, leadfeast 2/16

The pd1 cells (PLENTYDEPRI=1 — the throttle under test) are barely
started. The 8-seed pilot (92801–92808) is 29 configs short of the 64
needed. The analyzer (scripts/analyze-homecoming-diag-b.js) exits 2
(corpus incomplete) on this corpus — verified, not run to verdict.

**Resume instructions for the next run:** the sweep script resumes
from existing files (verified: r2b log shows "+32 resumed"). Run the
missing configs per cell/policy with the pinned substrate
(FEASTSCALE_R13=1, SEATDRIVE=0 — asserted FATAL in every script):
  CELL=pd1dg0|pd1dg1 POLICY=belongfeast|leadfeast SEEDS=<missing>
  node scripts/sweep-homecoming-diag-b.js
Then run the analyzer for the DIAG verdict.

## Verdict

(TBD)
