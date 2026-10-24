# Loop-B run fleshout-loop-b-20261024T0332Z — adoption closeout (axis food-economy)

Stale-lock recovery of dead own-loop run fleshout-loop-b-20261024T0129Z
(lock 121min stale, >90min fallback; both arm workers DEAD — no heartbeats,
zero live procs; dead claim retired to .DEAD). Adopted its two arms rather
than respawning. Loop A live-claimed scale-onramp
(flesh-out-2026-10-24-0316.json: sim-bloodrestraint + sim-wallseg) → B stayed
on food-economy, the next non-converged axis down. Zero file overlap with
loop A by design.

## Arm 1 — sim-bufferdepri-b: NO-GO, PARKED (landed 6f6bf201a + bd52fa96c)
LEVER PLENTYDEPRI=2 buffer-aware easing (sim-findings #849). Env-gated
game.js layer (default-off); 6 instruments + 192-config corpus + full
evidence at evidence/2026-10-24/sim-bufferdepri-b.md.
- PRIMARY rot/100d PD=2/PD=0: leadfeast dg0 0.749 / dg1 0.705 / belongfeast
  dg0 0.641 / dg1 0.978 — all four MISS ≤0.50 (metric-broken: bar written for
  PD=1's full easing; PD=2 eases on a subset)
- ENGAGEMENT 16/32 all four cells — PASS
- Guardrail (a) starvation PASS only leadfeast dg0; dg1 cells flow through the
  DEPOSITGATE holdback channel this lever can't touch
- Guardrails (b)(c)(d) PASS all; wall: national 6–12/16, table/wins 0/16
  (SEATDRIVE=0 regime), wave≥5 0/16, median 100d
- Proof test-bufferdepri-b.js ALL GREEN pre-sweep and post-rebase
- Metric review: mechanism fires honestly (stand-down 1.0–7.2% of ease
  volume, voiced once/day, sense-read as a person); absolute rot kcal
  punishes the repair (kept hauls add fresh that rots); sanity flag —
  PD=1/PD=0 replication deviated on leadfeast dg1 (1.033x vs 0.558 expected),
  substrate/instrument flag, not re-scored
- Infra (filed to sim-findings.md): sweep merge silently overwrote 8 pilot
  summaries (STDOUT_SPLIT node merge-READ fails silently; recovered 59
  configs by byte-identical re-run); sibling /tmp wipe killed a recovery pass
  (scratch now persistent-only); safe-commit index clobber struck both
  commits (repaired via --add --cacheinfo)
- #849 → [parked] in sim-findings.md

## Arm 2 — sim-homecoming-vol-b: DIAG-GO (landed dfc9d4439)
DIAG (offline re-analysis of landed depinteraction-b corpus, zero src/js).
Homecoming channel VOLUME decomposed by PDxDG cell: 100.0% attributed,
0 unexplained cells. DG does NOT compensate the PD throttle — it PRE-EMPTS
it (floor effect: keep-raise withholds the channel to near-zero first;
leadfeast PDΔ|dg0 −591 vs PDΔ|dg1 −26). Volume = surplus-overflow valve
(41% overnight-sweep rot, 19% rack rescue), not a knob PD can steer.
Named next: KEEPCEIL keep-ceiling volume-knob lever spec landed in
evidence/2026-10-24/sim-homecoming-vol-b.md. Verdict reproduced exactly by
re-run; analyzer SYNTAX-OK post-rebase.
- sim-findings: #846 (homecoming throttled by easing) → answered; #858 →
  follow-up note (its named-next delivered)

## Telemetry deviation check (bufferdepri corpus)
3 LOUD lines, all REGIME artifacts per the established precedents
(2330Z/2030Z/1930Z): national 12→110 (n-mismatch: baseline n=16 winseat
full-stack vs n=204/192 pre-seat corpus, includes sweep summaries);
table 16→0, wins 16→0 (WINSEAT baseline vs SEATDRIVE=0 pre-seat substrate —
structural). Baseline NOT rolled.

## Scale-wall numbers this run
Both corpora on the pre-seat substrate: wave-5 0/16 everywhere, wins 0/16
everywhere, table 0 (regime). The wall stands; food-economy stays converging
(NOT converged). Loop A is attacking the wall on scale-onramp concurrently
(its sim-wallseg DIAG-GO landed this run — wave5 8/24 on the
TRUSTBUFFER=1+VETFORMATION=1 substrate, veterans 14/14 never-met as the
defer5 bind).

## Convergence state
food-economy: converging (draw side closed: buffer-aware throttle parked
with teeth; homecoming volume question closed with a named lever).

Both arms landed to local master, proof-green post-rebase; trees released
and removed; branches deleted. Merged locally, pending ship.
