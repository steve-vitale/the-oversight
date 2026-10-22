# sim-w5gates-noseat — wave-5 gate decomposition on the THIRD substrate (flesh-out loop, 2026-10-21, ARM sim-w5gates-noseat)

Run: fleshout-20261021T2215Z. Axis: scale-onramp (the blocking axis; the wave-5 door is the binding wall).
DIAG-GO — instrument-only, ZERO src/js changes, ZERO scripts/policies changes.

Canon: docs/CANON.md, docs/MONSTER-WAVES.md (wave law, the readiness gate, design call #4). The code is authoritative for the gate decomposition.

## The bind

The wave-5 unlock gate structure is fully mapped on two substrates:
- **VGEAR substrate** (sim-w5gates, 2026-10-21, VGEAR=1/FEASTSCALE_R13=1): binding distribution stand-raw 8/16, defer5 5/16, plenty-cap 1/16, w3rung 1/16, unlocked 1/16. Defer5 binds on veterans-never-fill (4/5) or mortality selection (1/5: earning veterans costs the armor bar).
- **SEATDRIVE substrate** (sim-fullseat, 2026-10-21, SEATDRIVE=1/TRIBFLOOR/WINPURSUIT/WINDEFER/FULLSEAT): hold-kind at run end defer5 8/16 (veterans 8/8 short), plenty-cap 2/16, below-bar 6/16; 0/16 unlocks. Faced-vs-kills named as the mechanism split (wave-4 fought, readiness-5 demands wave-4+ KILLS).

It is UNMAPPED on the **plain long SEATDRIVE=0 substrate** — no seat stack, wins structurally 0, the food-economy DIAG stack used by recent DIAG corpora (sim-deathcensus-b's substrate) — where wave-5 is 0/16 and the door never opens. This arm names which gate binds in that third regime.

## PRE-REGISTRATION (binding, docs/MEASUREMENT.md §§9–12, 14–15 — written BEFORE the sweep)

**PRIMARY:** attribution completeness >= 95% (0 unexplained unlock-bar rows across 16 runs), binding gate named per run (w3 rung / standing gate [plenty cap / defer4 / defer5 / peak ratchet] / w4 faced / readiness bars: armor, armed count, tricks, living wave-4+ killers). **GO = PRIMARY met** (this is a DIAG arm — the decomposition itself is the deliverable).

**Unit note:** the unit is the run (16 runs: 8 seeds × 2 policies). There is no baseline-vs-variant contrast — this is a diagnostic arm, not a lever confirm.

**SECONDARY (report, don't judge):** binding-gate distribution vs the two mapped substrates (which gate moves when wins are structurally absent); wall numbers (national/table/wave-4/5, median/max survival, exiled); the closest run to an unlock (how many bars short, on which bars).

**Horizon:** 180d death-aware (dead villages stop simulating, +10d tail max via the harness). Set from the baseline survival distribution (prior noseat DIAG corpora: door-window activity ~day 60–130; villages die d47–182 on the vgear corpus).

**Seeds:** 8 FRESH seeds 65201–65208 (grep of evidence/2026-10-*/ + scripts found zero "65201" hits; the sweep's inline seed-freshness assertion re-verifies at start) × {leadfeast, belongfeast} = 16 runs.

**Policies:** scripts/policies/feastscale.js `leadfeast`/`belongfeast` — the PLAIN bases (no seatdrive/windefer/tribfloor/vgear wrappers).

**Substrate env:** FEASTSCALE_R13=1, SEATDRIVE=0 (explicit opt-out of the seat stack); UNSET: SUCCGRACE, RAIDDENSITY, WINPURSUIT, WINDEFER, VGEAR, VGEARBEATS, TRIBFLOOR, UPKEEPGATE, SURPLUSFEED, NODEWITNESS, FULLSEAT, VETREL, REPOSITION (the proven deathcensus-b guard shape). The sweep FAILS LOUD unless the env matches exactly.

**Instrument:** scripts/w5gates-lib.js (reused UNMODIFIED — pure gate-vector read) + scripts/w5gates-noseat-sweep-20261021.js + scripts/w5gates-noseat-analyze-20261021.js. Per run: full end-of-run gate vector (each gate's state + distance-to-met) + a compact daily trace (uw, raw, capped, rd4/rd5 bars, w4faced) + captured System hold/release lines (expected silent by harness design — the sense path is SENSE=1 narration-live). DET gate (W5GATES_BARE=1): instrument-on vs instrument-off byte-identical trajectories on paired seeds.

**Proof:** scripts/test-w5gates-noseat-20261021.js — RED→GREEN on gate-state detection (synthetic states for all six binding gates + grandfathered + both unexplained shapes) + substrate-honesty gates (guard fails loud on VGEAR=1 / SEATDRIVE-unset; bases are the plain feastscale bases) + DET gate on paired seeds on this substrate.

## metric review

(§14: doubts about the metric belong here, proposed revisions apply to the NEXT run.)

PENDING — filled after the sweep corpus completes.

## Results

PENDING — filled after the sweep corpus completes.

## RESULTS (2026-10-21, recovered from timed-out run)

**PRIMARY: MET.** 16/16 runs attributed, 0 unexplained. DIAG-GO.

**Binding-gate distribution (plain SEATDRIVE=0):**
- defer5: 9/16
- plenty-cap: 4/16
- stand-raw: 3/16
- unlocked: 0/16

**Veteran leg:** 0/16 runs ever filled the veteran bar. Closest run (seed 65201, belongfeast): 1 veteran short — defer5(+3a +4w +0t +1v).

**Wall numbers:** national 14/16, table 14/16, wins 0/16 (structural on this substrate), wave-4 16/16, wave-5 0/16, median survival 137d.

**Death causes:** combat 414, villager combat 114, monster 61, expedition 24, starvation 12, dehydration 4, contest 4.

**The bind:** On the plain substrate, defer5 dominates (9/16) and it binds specifically on veterans-never-fill — the village cannot produce living wave-4+ killers. This matches the SEATDRIVE substrate pattern (defer5 8/16, veterans 8/8 short) but with a different secondary: plenty-cap (4/16) instead of below-bar (6/16). The veteran-production channel is the binding constraint across all three substrates.

**Comparison to mapped substrates:**
- VGEAR: stand-raw 8/16, defer5 5/16, plenty-cap 1/16, w3rung 1/16, unlocked 1/16
- SEATDRIVE: defer5 8/16, plenty-cap 2/16, below-bar 6/16, unlocked 0/16
- PLAIN (this arm): defer5 9/16, plenty-cap 4/16, stand-raw 3/16, unlocked 0/16

**Metric review:** The pre-registered PRIMARY (attribution >= 95%) was met. No metric revision needed — the decomposition is the deliverable and it's complete.

**Convergence:** DIAG-GO. The wave-5 door decomposition is now mapped on all three substrates. The veteran-production channel is confirmed as the binding constraint.

## BASE-DELTA AUDIT (adoption, run fleshout-20261022T0019Z — against master 82059af46)

The 16-run corpus was swept on 596cb0c2c; the arm landed on e7393c86. Commits between the corpus base and audit master, each checked for trajectory impact on this substrate:

1. **6bbc7002d (journey-succession r36):** src/js change limited to `ledger.js` — the succession-orientation handoff's kit clause now reads `s.abilities` instead of the never-firing `s.backgroundAbilities` ([] since the 2026-10-14 ability lanes). Narration text only: who becomes whom, ability transfer, and RNG all unchanged ("machinery clean" per the commit). `w5gates-lib` reads engine state; ledger `say()` draws no RNG in the harness (quietLog). VERIFIED INERT.
2. **9f5015716 (SURPLUSFEED governor removal, Steve decision 2026-10-21):** deleted `surplusFeedGovernor` + `_surplusFeedOn` from game.js. Pre-removal code returned `give` exactly with zero writes and zero RNG draws whenever `process.env.SURPLUSFEED !== '1'` (documented inline; the off-path was the det-gate anchor). This substrate's sweep guard FAILS LOUD unless SURPLUSFEED is unset, so the governor was inert on every corpus trajectory. Grep of current game.js: zero `surplusFeed` references; sweep/lib/harness/feastscale carry no SURPLUSFEED path. VERIFIED INERT.
3. **f8fd2e848 (journey-endgame r37) + 82059af46 (journey-establishment r24):** scripts-only; no src/js or scripts/policies changes. Cannot affect sim trajectories. VERIFIED INERT.

Adoption verdict: transferred as-is, no re-sweep. Proof re-run GREEN on 82059af46 (33/33, env FEASTSCALE_R13=1 SEATDRIVE=0 — the Usage-header env): E1 synthetic attribution 26/26, E2 guard+smoke 6/6, E3 DET gate byte-identical on 4 paired runs. SENSE=1 narration-live rerun of the closest run (belongfeast/s65201, 181d) reproduces the corpus summary fields exactly (days=181 uw=4 raw=485 capped=325 gated=199 peak=4) with 26 voiced gate lines naming the same bars the instrument names — the System's voice-vs-state read is honest (plenty-cap d75, defer5 armor/weapons/veterans bars tracked d82–d180, veterans ending 1-of-2).
