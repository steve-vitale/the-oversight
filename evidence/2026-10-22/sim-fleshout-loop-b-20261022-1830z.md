# sim-fleshout-loop-b-20261022-1830z — run summary (axis food-economy, 3 arms, all landed)

Run: fleshout-loop-b-20261022T1830Z. Claim written before any sims
(fleshout-loop-b-20261022T1830Z.json); lock created/deleted per protocol.
Axis = topmost non-converged axis not named in a live claim (tracker:
scale-onramp + food-economy converging; loop A live claim
fleshout-20261022T1717Z.json on scale-onramp — lock matched run_id, no
race-guard wait). All 3 arms zero src/js, disjoint namespaces, offline
DIAG + instrument; all landed via ff-only merges with proofs re-verified
post-rebase (master moved 3x mid-run: loop-A landings + own landings).

## Arm 1 — sim-trailstarve-b (backlog #815, DIAG-GO, landed bffe0b331)
The #815 named next: extended starvation-channel taxonomy developed
offline against the existing meal-row corpus (perseed-deathcause-b),
census re-run. PRIMARY DIAG-GO: 13/13 starvation deaths named (100%),
0 unattributed, 0 instrumentErrors — trail-starvation 5, inflow-failure 8
(old taxonomy 8/13). Wound-compounded rides as a flag on transcript-
confirmed cases. Proof 20/20 GREEN, DET byte-identical, re-verified
post-rebase. Deliverables: scripts/taxonomy-trailstarve-b.js,
scripts/diag-trailstarve-b.js, scripts/test-trailstarve-b.js,
evidence/2026-10-22/trailstarve-census-b.json.

## Arm 2 — sim-poolscholar-b (backlog #816, DIAG-GO, landed 2cfc6b909)
Pool-thickness theory built offline on the deathcause-b corpus.
16/16 runs have ≥95% of pooled-draw kcal in named draw categories
(100% instrumented). Findings: the scholar is ~50–57% of ALL pooled
draws at EVERY thickness quintile — a fixed ~2,000–2,200 kcal/day draw on
variable inflow (s66050-leadfeast: scholar drew 126% of everything the
village pooled). Villager top-ups are counter-cyclical: 23.4% of draws in
the thinnest quintile vs ~8–14% elsewhere — hunger makes villagers draw
MORE from a thin pool; nobody defers. Thin-pool → starvation: Q1
(<589 kcal/mouth) holds 20% of days but 61.5% of starvation deaths
(3.1x enrichment); 8/13 starvation deaths are thin-pool deaths, 5/13
trail-starvation deaths are pool-independent (died away, pantry full).
Named lever for the storage-deprioritization replacement direction:
(1) "Leave it for the hungry" — villager thin-pool draw deference at
villagerMealDay when pantryFreshDays<2, voiced per-villager (villager-
side, meal stays sacred); (2) "The scholar's bowl" — player-side voiced
meal choice when thin (silent override would be sense-hostile per #761).
Proof 20/20 GREEN, re-verified post-rebase. Deliverables:
scripts/diag-poolscholar-b.js, scripts/test-poolscholar-b.js,
evidence/2026-10-22/poolscholar-b.json.

## Arm 3 — sim-rotsensor-b (backlogs #817 + #819, GO on both primaries, landed 5576e1dc0)
#817: rot-sensor phase bug fixed — the dawn scan ran after sweepSpoiled()
discarded rot inside the dawn sequence; fix wraps Game.sweepSpoiled
(before-call scan, the fragilityfeast measure's phase). The `rot` channel
boolean can now actually fire (was 0/16 runs of silence).
#819: drawn=0 final-day mystery RESOLVED to two named mechanisms,
code-grounded from src/js/game.js (Somchai d135 / Ingrid d141).
Proof 13/13 GREEN with the Usage-header env (FEASTSCALE_R13=1 SEATDRIVE=0 —
the env trap caught and honored per protocol), re-verified post-rebase.
6-seed re-run corpus at evidence/2026-10-22/perseed-rotsensor-b/.
Deliverables: scripts/rotsensor-b.js, scripts/sweep-rotsensor-b.js,
scripts/test-rotsensor-b.js.

## Telemetry deviation check (§10)
`telemetry-check.js` on the 6-file rotsensor corpus vs scale-wall.json:
3 LOUD (national/table/wins disappeared) — known regime artifact (baseline
= winseat full stack n=16; corpus = targeted DIAG n=6 on the SEATDRIVE=0
pre-seat substrate where wins are structurally 0) + schema artifact
(instrument JSONs lack wall keys). Baseline NOT rolled.

## Metric review
- Offline DIAGs: the pre-registered completeness bars (≥95% / ≥12/13)
  held without re-scoring; wound-compounded riding as a flag (never the
  primary unless it is the whole story) proved the honest way to keep the
  taxonomy's single-count discipline.
- The thin-middle fiction silence (Somchai/Ingrid drain unvoiced) is the
  standing sense gap behind the named lever — a future arm can measure
  whether the lever's voice changes deferral rates.
- food-economy stays converging: production half CONFIRMED-GO
  (plentydepri), storage half CONFIRMED-GO (depositgate), d100-150 hunger
  answered; the storage replacement now has a pool-thickness theory and
  a named behavioral lever; the trail-starvation taxonomy is closed at
  13/13; the rot sensor measures honestly. Live open lines: #643
  portion-law steve-call, expedition-recall design question (the
  trail-starvation DIAG is its prerequisite — recall needs a lever arm),
  the thin-pool draw-deference lever (poolscholar-b named next).

## Village assessment
The village produces enough (0.98–1.03x need) but starves thin: the pool
carries only 0.4–1.6 days of buffer and the scholar's fixed draw plus
counter-cyclical top-ups drain it; 61.5% of starvation deaths happen in
the thinnest quintile. The other hunger is away: villagers die on the
trail with full pantries at home — the pack is the only buffer and no
recall mechanism exists. Villagers act like people at the margins (the
drain happens without a word — that silence is now a named blank).

Infra: the trailstarve worker's pending check.js --quick flagged 3
failures in scripts/godpath/test-phone-frame-proof.js — pre-existing
phone-frame hash staleness on the stale base, unrelated to the
instrument-only change. safe-commit private-index desync recurred on
poolscholar-b — repaired surgically by the worker (byte-verified blobs);
the known signature stands.
