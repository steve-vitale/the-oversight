# SIM-ALLOWGATE4 — r14's 4-day-floor gate re-run under noise-calibrated bounds, candidate-counted holds (loop B, food-economy, sim-findings #187)

Date: 2026-10-15 · Loop: oversight-flesh-out-loop-b · Worker tree: sim-allowgate4
Axis: food-economy (scale-wall lens) — sim-findings #187 (FEAST AS TABLE-PATH OPENER). ARM 2 of 2.

## The lever

scripts/policies/allowgate2.js (LANDED on master by the r16 arm — GO 2026-10-14, default OFF) wraps leadfeast/belongfeast (the r13 allowance). THE GATE (ALLOWGATE2=1, default OFF; requires FEASTSCALE_R13=1): the allowance may only spend SURPLUS above the game's own 4-day fresh floor (Game.pantryFreshDays — the same floor prodThrottle uses): spendTarget = (freshDays − 4) × burn; hold when plan.cost > spendTarget. The floor never moves. Gate on pantry STATE, never on contribution — the contribution rule is untouched (recentGives(7)+tributePaid(7)+tendPaid(7) ≥ 1500). Hold telemetry is candidate-only: ctx.ag2GateHeld counts ONLY when the full r13 candidacy chain passes (dusk, haven, one-feast/day, cadence incl. fusion ceiling, contribution ≥1500, plan.ok, have ≥ cost×1.5) and ONLY the floor test fails. Suppressed feasts POSTPONED, never displaced (cadence tracker unmarked; the next dusk re-tests). Policy-side only; ZERO src/js changes.

ENV-VAR NOTE (documented, not a design change): this arm's brief names FEASTGATE_R13 (the r14 env var) for the armed side. That var no longer exists in the tree — the r14 hunk was reverted per kill protocol (verified: zero hits in scripts/policies/*.js). The layer file's gate is ALLOWGATE2=1 ("Opt-in via ALLOWGATE2=1 (default OFF); requires FEASTSCALE_R13=1"). This run uses the layer's actual gate var: armed = FEASTSCALE_R13=1 + ALLOWGATE2=1.

R14/R16 HISTORY (why this re-run exists): r14 (FEASTGATE_R13 hunk) measured starvation 21→16 (0.762×) but was KILLED per §14 on the hungryDays guardrail (44 vs ≤43.2 — a bound ~4× tighter than the suite's own A/A noise, finding #208). r15 (the <2d gate) was KILLED AT PILOT as a proven-safe no-op (harm lives in the 2–4d band, not below 2d) and located the harm driver + fixed the hold-telemetry blank (candidate-only holds). r16 (allowgate2.js, the layer) re-armed r14's design under the noise-calibrated header: starvation 21→16, hungryDays 44 ≤ 67.6, candidate-only holds = 123 — GO, landed. THIS arm (allowgate4) re-runs the same layer on the current tip under the coordinator's tighter header below. The layer is already on master (dormant, default OFF); this run changes NO game code and adds NO new layer file — the instruments are new (test/measure/det-gate/sense scripts + this evidence).

## Pre-registration (docs/MEASUREMENT.md §§9-12, 14 — binding, written BEFORE any sims)

- **Question**: does r14's 4-day-floor gate (as the landed allowgate2 layer) still remove the r13 allowance's measured pantry-blind harm on the current tip — starvation 15→21, hungryDays 35→48, median 151→92d vs pristine — while keeping the deed-opening (r13-only: 13/16 deeds, 4/16 tables)?
- **Lever**: scripts/policies/allowgate2.js (ALLOWGATE2=1, default OFF; requires FEASTSCALE_R13=1). All r13 gates kept (dusk, haven, one feast/day, armed 7d / unarmed 14d cadence, contribution ≥1500, affordability have ≥ cost×1.5, fusion-reactor ceiling, plan.ok). Zero src/js changes.
- **Horizon**: 180d death-aware (reachability lever per §10; pacing-law absolute max). Dead villages stop; +10d tail max.
- **Seeds**: 11/22/33/44/55/66/77/88 × leadcourt/belongseek = 16 runs/side, IDENTICAL seeds control vs armed. BOTH sides run FEASTSCALE_R13=1 (leadfeast/belongfeast; armed wraps with leadgate2/belonggate2). Control: ALLOWGATE2 unset. Armed: ALLOWGATE2=1. OWN control measured in the SAME sweep (never inherit a baseline — #247).
- **Det-gate**: 16/16 bit-identical both sides first (r27 rule; scripts/det-gate-allowancegate2-20261014.js). SMOKE=1 instrument-honesty gate both sides.
- **Proof**: scripts/test-allowgate4-20261015.js — REAL RED (gate-off byte-identical to pristine parent; allowance fires gate-off on a 3.9d fixture) → GREEN (fires on 6.2d, holds on 3.9d with the hold counted on a FEAST CANDIDATE, floor ≥4 after every feast in a long armed run, gate inert without FEASTSCALE_R13, armed determinism).
- **PRIMARY**: starvation deaths armed ≤ 0.75 × control (r14 measured 0.76×). Integer rule: 4×armed ≤ 3×control.
- **GUARDRAILS**: hungryDays ≤ control × 1.409 (#208; integer rule: 1000×armed ≤ 1409×control); rot/villager-day ≤ control × 1.335 (rotcal A/A p90rel per-vd); food-deeds ≥ control−2; table ≥ control−1; national ≥ control−2; no new death mode (n≥3). Median survival report-only.
- **SECONDARY**: allowance feast counts (fsFeasts, fsArmedFeasts), candidate-only gate holds (ag2GateHeld), per-seed deed attribution (feastSurgeUsed day, table day, seat), Standing per avenue, wave reach 1–5, Arc reach, four-realm formation (_havenPolity), table seats, fresh-days trajectory, death-cause shares, exiled.
- **Decision rule**: KILL at pilot on any primary/guardrail miss (§14 — a miss is NO-GO, never re-scored). On GO (pilot): stop and report — confirm runs later. On kill: delete the layer per kill protocol, keep instruments INFO-SKIP.
- **Substrate check**: the r13-only control is expected near 21 starvation / 48 hungryDays / 107 feasts (r14/r15/r16 all measured exactly this — the substrate is bit-stable). A moved control is reported, not "fixed" — the verdict is vs the paired control only.

## Proof results

scripts/test-allowgate4-20261015.js — REAL RED → GREEN, both phases ALL GREEN on the current tip (2026-10-15, worktree sim-allowgate4).

RED (FEASTSCALE_R13=1, ALLOWGATE2 unset): R1 gate-off byte-identical — leadgate2/belonggate2 == leadfeast/belongfeast per-day hashes, 40d ×2 seeds, IDENTICAL (the layer adds zero trajectory delta when off). R2: the un-gated allowance FIRES pantry-blind on the 3.9d fixture (freshDays 3.96, pantry 9500→4500 kcal, fresh-days 3.96→1.88 — the harm mechanism in miniature, exactly the r14/r16 R2 numbers).

GREEN (FEASTSCALE_R13=1 + ALLOWGATE2=1): G1 holds on the 3.9d fixture (no feast, pantry untouched at 9500, ag2GateHeld=1 counted on the FEAST CANDIDATE — the fixture passes the full r13 chain: cost 4800 > spendTarget −100 — cadence NOT marked). G2 fires on the 6.2d fixture (cost 4800, pantry 15000→10000, freshDays 6.25→4.17 — floor honored; ag2GateHeld=0). G3 postponed feasts fire on recovery (day-30 hold, cadence unmarked; fresh food arrives, day-31 fires, _fsLastFeastDay=31). G4 armed determinism (identical fixture twice → identical outcome). G5 no double-feast. G6 gate inert without FEASTSCALE_R13 (no holds, no feasts; textual guard `if (!gateOn() || !FS.layerOn())` present). G7 60d armed run — 2 feasts, floor ≥ 4 after EVERY one (min post-feast freshDays 119.71). ALL GREEN on two consecutive invocations (RED then GREEN).

Note: G7's 60d run fired only 2 feasts (vs r16's 3) — fixture-count noise, not a gate change; the invariant (floor after every firing) is what G7 pins.

## Det-gate + SMOKE

Det-gate (scripts/det-gate-allowancegate2-20261014.js, r27 rule — 16/16 bit-identical before trusting a before/after comparison): CONTROL 16/16 identical (FEASTSCALE_R13=1, ALLOWGATE2 unset; 8 seeds × leadcourt/belongseek, each twice in-process, 180d death-aware). ARMED 16/16 identical (FEASTSCALE_R13=1 + ALLOWGATE2=1) — no waiver needed on either side. SMOKE=1 instrument-honesty gate GREEN both sides (scripts/measure-allowgate4-20261015.js SMOKE=1: unwrap + live drive, policies genuinely drive).

## Pilot results

16 runs/side, identical seeds, 180d death-aware. Det-gate 16/16 both sides; SMOKE green both sides. BOTH sides run FEASTSCALE_R13=1 (the r13 allowance); armed adds ALLOWGATE2=1. OWN paired control measured in the same sweep (#247 — the r16 numbers are history, not baseline; the tip moved, see below).

| metric | control (gate off) | armed (gate on) | pre-reg | verdict |
|---|---|---|---|---|
| starvation deaths (**PRIMARY**) | 3 | **2** | ≤ 0.75×control (4×2=8 ≤ 9) | **GO** |
| hungryDays (GUARDRAIL) | 49 | **39** | ≤ 69.0 (×1.409) | **GO** |
| rot/villager-day (GUARDRAIL) | 302.4 | **305.1** | ≤ 403.7 (×1.335) | **GO** |
| food-deeds (GUARDRAIL) | 16/16 | **15/16** | ≥ 14 | **GO** |
| table (GUARDRAIL) | 16/16 | **15/16** | ≥ 15 | **GO** (at bound) |
| national (GUARDRAIL) | 6/16 | **9/16** | ≥ 4 | **GO** |
| new death mode (GUARDRAIL) | — | "the night" n=1 | none n≥3 | **GO** |
| median survival (report-only) | 123d | 123d | — | — |
| max survival | 180d | 180d | — | — |
| wave-4 / wave-5 | 15 / 6 | 15 / 5 | — | — |
| wins / exiled | 0 / 0 | 0 / 0 | — | — |
| four-realm (_havenPolity) | 8/16 | 10/16 | — | — |
| max Arc | 4 | 4 | — | — |
| allowance feasts | 141 | 131 | — | mechanism |
| armed-cadence feasts | 107 | 92 | — | mechanism |
| gate holds (candidate-only) | 0 | 101 | — | gate live |

Per-seed (control → armed) starvation: fell on 3 seeds (belon-s11 1→0, belon-s66 1→0, leadc-s22 1→0), rose on 2 (belon-s22 0→1, leadc-s77 0→1), flat on 11. HungryDays: improved-or-flat on 12 seeds, worse on 4 (belon-s55 3→5, leadc-s22 2→3, leadc-s88 1→5, belon-s22 5→0 improved). The gate held feasts on 11/16 runs (holds 2–35; five runs saw zero holds: belon-s33/s44, leadc-s11/s33/s44). Deed seats: the one lost table seat is leadc-s66 (full→none, deeds 1→0 — a held candidate cost the deed rung there); leadc-s88 stepped full→lesser; belon-s22/s55/s66 each gained national+realm on the armed trajectory.

**Verdict: GO at pilot per §14.** The primary passed (2 ≤ 0.75×3) and every guardrail held. Per the arm brief: stop and report — confirm runs later. The layer needs no landing commit (already on master from the r16 GO, dormant default-OFF).

## Wall numbers (every run)

| side | national | table | wins | w4 | w5 | median | max | realm |
|---|---|---|---|---|---|---|---|---|
| control (r13, gate off) | 6/16 | 16/16 | 0/16 | 15/16 | 6/16 | 123d | 180d | 8/16 |
| armed (r13 + gate) | 9/16 | 15/16 | 0/16 | 15/16 | 5/16 | 123d | 180d | 10/16 |

Exiled: 0 both sides. Max Arc 4 both sides. Reachability verdict: national, table, wave-4/5, Arc IV, and four-realm formation all reachable on both sides — the gate changed none of the reachability, only the hunger mix (and it improved national 6→9 and realm 8→10 on the armed trajectories).

Death-cause shares (villager-only, kind person/villager/player) — control: monster 77, combat 116, contest 11, wound 4, ambush 4, sickness 4, dehydration 3, starvation 3, alien 2, lockjaw 1, "The Reunion" 1, "the expedition" 1, "The Eulogy" 1, "The Callback" 1. Armed: combat 117, monster 99, contest 6, wound 5, ambush 4, dehydration 4, starvation 2, sickness 2, alien 2, lockjaw 2, "the night" 1. Same modes — no new death mode (the single "the night" is n=1, below the n≥3 bar). Villages die of violence, not hunger, on both sides; the armed side starves less (3→2) and goes hungry less (49→39).

## Sense-testing (SENSE-TESTING LAW — read, not counted)

Armed 120d transcript (FEASTSCALE_R13=1 + ALLOWGATE2=1; scripts/sense-allowgate2-20261014.js; belongseek seed 88: 6 feasts, 23 candidate-only holds).

Every feast that fired was a surplus decision: d25 5.8→5.1, d40 6.3→4.7, d58 5.3→4.3, d87 10.4→5.4, d100 10.4→8.0 — all with hungryStreak 0, all landed above the floor. The beats read as a village deciding: "🍖 FEAST 📺 — Jerome opens the pantry wide: 5× Rice, 5× Dried beans, 1× Foraged food (dried). Cormac, Nikolai, Raj, Zoltan eat until the fire burns low. Somebody laughs so hard they cry. For one evening, nobody is surviving — they're just together. (−2,150 kcal from the pantry)". Named openers, varying menus, honest kcal drawdowns, the keepsake/devotion mechanics interleaving legibly (a d25 feast refused the buff for want of an armed keepsake; the d40 feast channeled one for FEASTED ×2.03).

**PASS with the pre-existing blank re-noted**: the devotion channeling line ("💛 You hold Dorothy's Ring... The feast was the weapon.") fires VERBATIM every day — the finding #64 repetition class (competent.js channelDevotion, not this layer's doing). Filed, not chased (fourth run in a row).

## Village assessment (plain words)

Sixteen villages with the gated allowance, and the gate said no 101 times — every one of those nos a feast the allowance would actually have fired, on a pantry too thin for the 4-day floor. The un-gated allowance fired 141 feasts across the control runs; the gated one fired 131 and postponed 101 — the postponed ones re-tested on later dusks and mostly fired when the pantry recovered (that's why 101 holds cost only 10 feasts).

The villages on this tip barely starve to begin with — three starvation deaths across sixteen control villages, down from twenty-one when r14 ran. The harm the gate was built to remove has mostly evaporated with the tip's movement (villages die of violence now: 116 combat and 77 monster deaths on the control side). Against that background the gate still did its job: two starvation deaths instead of three, hungry-days down a fifth (49→39), and — unexpectedly — more villages reached national (6→9) and formed four-fire realms (8→10) on the armed trajectories. The price was one table seat (leadc-s66, where two held candidates cost the deed rung) — inside the pre-registered guardrail, and the honest price of a harm guard.

The villagers read like people: named feast-openers, menus that vary with what's actually in the pantry, keepsakes channeled or refused for legible reasons, a village that waits out thin pantries and feasts when the shelves are deep. Nothing in the transcripts reads as the gate making decisions for them — it only says "not tonight," and the village decides again tomorrow.

## Blanks filled / documented

- **RE-RUN (this arm, GO AT PILOT — no landing commit needed)**: the r14 4-day-floor gate (scripts/policies/allowgate2.js, ALLOWGATE2=1, default OFF, requires FEASTSCALE_R13=1 — landed by the r16 GO arm, dormant) re-measured on the current tip under the coordinator's tighter header (primary ≤ 0.75×control; guardrails hungryDays ×1.409, rot/vd ×1.335, deeds ≥ −2, table ≥ −1, national ≥ −2, no new death mode n≥3). Zero src/js changes; the layer file is byte-identical to master.
- **PROOF**: scripts/test-allowgate4-20261015.js (REAL RED→GREEN, ALL GREEN both phases on the current tip; INFO-SKIP degradation if the layer is ever removed).
- **SWEEP**: scripts/measure-allowgate4-20261015.js (paired r13-only control + armed, fsFeasts/fsArmedFeasts/ag2GateHeld telemetry, rot instrumentation, villager-only death-kind filter, realm via _havenPolity, gate-contrast SMOKE both sides) + evidence/2026-10-15/ag4-control.json, ag4-armed.json and the two perseed-ag4-*/ per-seed dirs.
- **DET-GATE**: scripts/det-gate-allowancegate2-20261014.js reused (16/16 bit-identical CONTROL, 16/16 bit-identical ARMED — no waiver).
- **SENSE**: scripts/sense-allowgate2-20261014.js reused (armed, belongseek s88: 6 feasts, 23 candidate-only holds, all surplus decisions).
- **[open] SUBSTRATE MOVE (documented, not chased)**: the r13-only control moved hard between r16 (2026-10-14) and this run (2026-10-15): starvation 21→3, feasts 107→141, table 4/16→16/16, deeds 13/16→16/16, w4 11/16→15/16, median 92d→123d, villager violent deaths way up (combat 62→116, monster 20→77). Same seeds, same policies, same env — the det-gate proves determinism within the tip, so this is game-code movement (standing readiness gates, SUCCPOLITY, scholar self-learn, diplomacy ceiling lift all landed 2026-10-14/15). The r13 allowance's starvation harm barely exists on this tip; the gate's primary is now a ±1-death bar. The confirm run should consider a composite primary (starvation + hungryDays) or a larger seed set.
- **[open] r16 hunger-state firing question**: still open — the gate guards the fresh FLOOR, not hunger-state firing. This run's sense feasts all fired at hungryStreak 0, so no new evidence either way.
- **[open] finding #64 repetition class**: the devotion channeling line fires verbatim daily (competent.js channelDevotion) — re-noted, not chased.
- **TELEMETRY NOTE**: the tele death stream mixes villager deaths (kind person/villager) with monster/enemy kills — this run's sweep filters to villagers only (the r16 sweep evidently did the same; its script was never committed). Future sweeps must keep the kind filter or death-cause shares inflate ~3.5×.

## Metric review (§14)

1. **The primary fired GO, and §14 binds — GO stands.** Starvation 2 ≤ 0.75×3 (4×2=8 ≤ 9) on identical seeds, det-gated 16/16 both sides, SMOKE green both sides, own paired control measured in the same sweep. This is not re-scoring: the header's bar is the verdict.
2. **The primary is thin on this tip — stated honestly.** Control starvation is 3 (r16: 21); the 0.75× bar is a ±1-death bar, and the per-seed pattern is −1 on three seeds, +1 on two. The gate's effect is real but small in absolute terms because the harm it guards barely exists on the current substrate. The more robust movement is hungryDays 49→39 (−20%, well inside its noise-calibrated ceiling) — but hungryDays is a guardrail here, not the primary, and the verdict is the header's.
3. **The guardrails held with margin except table.** Table 15 ≥ 15 passes exactly at the bound (leadc-s66's lost seat is the gate's honest price: two held candidates cost the deed rung). National improved (6→9), realm improved (8→10), rot/vd flat (305.1 vs 403.7 ceiling), no new death mode.
4. **For the CONFIRM run**: the substrate move means a 16-seed starvation-only primary is underpowered. Recommend either a composite primary (starvation deaths + hungryDays, both noise-calibrated) or a larger seed set (24–32), pre-registered before the confirm. The gate's mechanism (101 candidate-only holds, floor honored on every firing, postponement-not-displacement) is proven live; what needs confirming is the effect size on the new substrate.
5. **Telemetry note**: telemetry-check.js would fire LOUD on table (baseline 0 → current 15/16) on BOTH sides — the r13 substrate's deed-opening on the new tip (measured: control 16/16 seats), not this gate; the scale-wall baseline predates the r13 era. The gate's marginal table effect is 16→15 (−1, the leadc-s66 price).

## Convergence state

food-economy: **converging** (allowgate4). The 4-day-floor gate re-passed its pilot header on the current tip (starvation 3→2, hungryDays 49→39, all guardrails green, 101 candidate-only holds, floor honored on every firing) — GO at pilot; confirm runs pending. sim-findings #187 stays OPEN: the feast-as-door mechanism is proven with a proven-safe gate (landed, dormant default-OFF); remaining work is the confirm run on the new substrate (composite primary or larger seed set), the hunger-state firing question, and the #64 repetition class.
