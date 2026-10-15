# SIM-ALLOWGATE5 — confirm of the landed allowgate2 4-day-floor gate on FRESH seeds (loop B, food-economy, sim-findings #187)

Date: 2026-10-15 · Loop: oversight-flesh-out-loop-b · Worker tree: sim-allowgate5
Axis: food-economy (scale-wall lens) — sim-findings #187 (FEAST AS TABLE-PATH OPENER).

## The lever

scripts/policies/allowgate2.js (LANDED on master by the r16 arm — GO 2026-10-14, default OFF) wraps leadfeast/belongfeast (the r13 allowance). THE GATE (ALLOWGATE2=1, default OFF; requires FEASTSCALE_R13=1): the allowance may only spend SURPLUS above the game's own 4-day fresh floor (Game.pantryFreshDays — the same floor prodThrottle uses): spendTarget = (freshDays − 4) × burn; hold when plan.cost > spendTarget. The floor never moves. Gate on pantry STATE, never on contribution — the contribution rule is untouched (recentGives(7)+tributePaid(7)+tendPaid(7) ≥ 1500). Hold telemetry is candidate-only: ctx.ag2GateHeld counts ONLY when the full r13 candidacy chain passes and ONLY the floor test fails. Suppressed feasts POSTPONED, never displaced (cadence tracker unmarked; the next dusk re-tests). Policy-side only; ZERO src/js changes.

THIS RUN (sim-allowgate5): EVIDENCE ONLY — the layer is already landed; NO game-code change, NO new layer file. This run confirms the landed claim on FRESH seeds with a composite primary, because the tracker's caveat stands: the substrate moved hard between r16 and r54b (control starvation 21→3), so a starvation-only primary is now a ±1-death bar. r54b's GO (16 runs/side on seeds 11/22/33/44/55/66/77/88, same seeds as r16): starvation 3→2, hungryDays 49→39, 101 candidate-only holds, all guardrails held.

## Pre-registration (docs/MEASUREMENT.md §§9-12, 14 — binding, written BEFORE any sims)

- **Question**: does the landed 4-day-floor gate still do its job on the current tip on FRESH seeds — starvation no worse than control AND hunger no worse than the noise-calibrated bound — with the mechanism live (candidate-only holds, floor honored on every firing)?
- **Lever**: scripts/policies/allowgate2.js (ALLOWGATE2=1, default OFF; requires FEASTSCALE_R13=1). All r13 gates kept. Zero src/js changes.
- **Horizon**: 180d death-aware (reachability lever per §10; pacing-law absolute max). Dead villages stop; +10d tail max.
- **Seeds**: FRESH — 101,202,303,404,606,707,808,909 × leadcourt/belongseek = 16 runs/side, IDENTICAL seeds control vs armed. Deliberately NOT the r54b seeds (11/22/33/44/55/66/77/88). BOTH sides FEASTSCALE_R13=1 (leadfeast/belongfeast; armed wraps with leadgate2/belonggate2). Control: ALLOWGATE2 unset. Armed: ALLOWGATE2=1. OWN control measured in the SAME sweep (never inherit a baseline — #247).
- **Det-gate**: 16/16 bit-identical both sides first (r27 rule; scripts/det-gate-allowancegate5-20261015.js on the FRESH confirm seeds). SMOKE=1 instrument-honesty gate both sides.
- **Proof**: scripts/test-allowgate5-20261015.js — REAL RED (gate-off byte-identical to pristine leadfeast/belongfeast; allowance fires gate-off on a 3.9d fixture) → GREEN (holds below 4 fresh-days on a feast candidate, fires above, floor honored; adapted from the r54b proof and verified passing on THIS tree's HEAD).
- **PRIMARY (composite — BOTH must hold)**:
  1. starvation deaths armed ≤ control (directional, no worse).
  2. hungryDays: 1000×armed ≤ 1409×control (the #208 noise-calibrated ratio bound). Degenerate case control=0 → pass requires armed ≤ 5 (absolute, pre-registered).
- **GUARDRAILS**: rot/villager-day ≤ control × 1.335 (rotcal A/A p90rel per-vd); food-deeds ≥ control−2; table ≥ control−1; national ≥ control−2; no new death mode (n≥3). Median survival report-only.
- **SECONDARY**: gate holds (candidate-only ag2GateHeld), feast counts (fsFeasts, fsArmedFeasts), wave reach 1–5, Arc reach, four-realm formation (_havenPolity), death-cause shares (villager-only kind filter), exiled, wall numbers (national/table/wins/wave4-5/median).
- **Decision rule**: GO = the landed claim CONFIRMED on fresh seeds (composite primary holds + every guardrail holds). NO-GO = report honestly; the layer STAYS landed (no deletion — it is already live on master, dormant), but the confirm claim WEAKENS and that goes into the tracker + findings. §14 binds: a miss is NO-GO, never re-scored mid-run; metric doubts go under "metric review" for the NEXT run.
- **Substrate check**: r54b's control on the old seeds measured starvation 3 / hungryDays 49 / 141 feasts / table 16/16 / national 6/16 / median 123d. Fresh seeds on this tip are expected near that, but may move — a moved control is reported, not "fixed"; the verdict is vs the paired control only.

## Proof results

scripts/test-allowgate5-20261015.js — REAL RED → GREEN, ALL GREEN both phases on THIS tree's HEAD (9cdbe8d1, 2026-10-15, worktree sim-allowgate5), two consecutive invocations.

RED (FEASTSCALE_R13=1, ALLOWGATE2 unset): R1 gate-off byte-identical — leadgate2/belonggate2 == leadfeast/belongfeast per-day hashes, 40d ×2 seeds, IDENTICAL (the layer adds zero trajectory delta when off). R2: the un-gated allowance FIRES pantry-blind on the 3.9d fixture (freshDays 3.96 → ~1.9 — the r14 harm mechanism in miniature).

GREEN (FEASTSCALE_R13=1 + ALLOWGATE2=1): G1 holds on the 3.9d fixture (no feast, pantry untouched at 9500, ag2GateHeld=1 counted on the FEAST CANDIDATE — fixture passes the full r13 chain: cost 4800 > spendTarget −100; cadence NOT marked). G2 fires on the 6.2d fixture (pantry 15000→10000, freshDays 6.25→4.17 — floor honored; ag2GateHeld=0). G3 postponed feasts fire on recovery (day-30 hold, cadence unmarked; fresh food arrives, day-31 fires, _fsLastFeastDay=31). G4 armed determinism (identical fixture twice → identical outcome `1|0|5000|4.167`). G5 no double-feast. G6 gate inert without FEASTSCALE_R13 (no holds, no feasts; textual guard `if (!gateOn() || !FS.layerOn())` present). G7 60d armed run — 2 feasts, floor ≥ 4 after EVERY one (min post-feast freshDays 119.71). ALL GREEN.

## Det-gate + SMOKE

Det-gate (scripts/det-gate-allowancegate5-20261015.js, r27 rule — 16/16 bit-identical before trusting a before/after comparison, run on the FRESH confirm seeds): CONTROL 16/16 identical (FEASTSCALE_R13=1, ALLOWGATE2 unset; 8 fresh seeds × leadcourt/belongseek, each twice in-process, 180d death-aware). ARMED 16/16 identical (FEASTSCALE_R13=1 + ALLOWGATE2=1) — no waiver needed on either side. SMOKE=1 instrument-honesty gate GREEN both sides (named-export unwrap + harness actually invokes policy.daily 18.3 calls/day + ≥1 policy-origin deliberate act per side).

## Confirm results

16 runs/side, IDENTICAL fresh seeds, 180d death-aware. Det-gate 16/16 both sides; SMOKE green both sides. BOTH sides run FEASTSCALE_R13=1 (the r13 allowance); armed adds ALLOWGATE2=1. OWN paired control measured in the same sweep (#247).

| metric | control (gate off) | armed (gate on) | pre-reg | verdict |
|---|---|---|---|---|
| starvation deaths (**PRIMARY 1**) | 11 | **11** | armed ≤ control | **GO** (exactly at bound) |
| hungryDays (**PRIMARY 2**) | 44 | **47** | 1000×47=47000 ≤ 1409×44=61996 | **GO** (armed 1.068×, bound 1.409×) |
| rot/villager-day (GUARDRAIL) | 354.21 | **324.14** | ≤ 472.87 (×1.335) | **GO** (improved) |
| food-deeds (GUARDRAIL) | 16/16 | **15/16** | ≥ 14 | **GO** |
| table (GUARDRAIL) | 13/16 | **14/16** | ≥ 12 | **GO** (improved) |
| national (GUARDRAIL) | 12/16 | **14/16** | ≥ 10 | **GO** (improved) |
| new death mode (GUARDRAIL) | — | all armed kinds n≥3 present in control; control-only "The Audit" n=1 | none n≥3 | **GO** |
| median survival (report-only) | 130d | **135d** | — | +5d armed |
| max survival | 180d | 180d | — | — |
| wave-4 / wave-5 | 13 / 7 | 14 / 7 | — | — |
| wins / exiled | 0 / 0 | 0 / 0 | — | — |
| four-realm (_havenPolity) | 13/16 | 15/16 | — | — |
| max Arc | 4 | 4 | — | — |
| allowance feasts | 159 | 146 | — | mechanism (−13) |
| armed-cadence feasts | 115 | 102 | — | mechanism (−13) |
| gate holds (candidate-only) | 0 | **71** | — | gate live |

Per-seed starvation (control → armed): improved on 2 seeds (belon-s707 4→0, leadc-s808 5→0 — combined −9), worsened on 3 (belon-s808 0→3, leadc-s707 1→2, leadc-s909 1→6 — combined +9), flat on 11. Net 11→11. HungryDays improved-or-flat on 9 seeds, worse on 7 (worst: leadc-s909 1→5, leadc-s202 0→3, leadc-s909's starvation crisis). The gate held feasts on 9/16 runs (holds 1–18; seven runs saw zero holds).

**Verdict: GO — the landed claim is CONFIRMED on fresh seeds.** Composite primary: both components hold (starvation 11 ≤ 11 exactly at the directional bound; hungryDays 47 well inside the noise-calibrated ceiling). Every guardrail holds; three guardrails (rot/vd, table, national) IMPROVED on the armed side. The mechanism is live: 71 candidate-only holds, floor honored on every firing, postponement-not-displacement (13 fewer feasts).

## Wall numbers (every run)

| side | national | table | wins | w4 | w5 | median | max | realm |
|---|---|---|---|---|---|---|---|---|
| control (r13, gate off) | 12/16 | 13/16 | 0/16 | 13/16 | 7/16 | 130d | 180d | 13/16 |
| armed (r13 + gate) | 14/16 | 14/16 | 0/16 | 14/16 | 7/16 | 135d | 180d | 15/16 |

Exiled: 0 both sides. Max Arc 4 both sides. Reachability verdict: national, table, wave-4/5, Arc IV, and four-realm formation all reachable on both sides — the gate changed none of the reachability; the armed side reached MORE of it (national 12→14, table 13→14, realm 13→15, w4 13→14, median +5d).

Death-cause shares (villager-only, kind person/villager/player) — control: combat 121, monster 78, sickness 22, wound 13, starvation 11, contest 8, Suburb 3, ambush 3, dehydration 2, Focus Group 1, Audit 1, Grief Counselor 1, Algorithm 1, Editor 1, lockjaw 1. Armed: combat 120, monster 71, sickness 29, wound 16, starvation 11, contest 9, Suburb 4, dehydration 3, ambush 3, Focus Group 1, Grief Counselor 1, Editor 1, lockjaw 1. Villages die of violence, not hunger, on both sides. Sickness 22→29 on armed is noted (not a pre-registered metric; flagged for the next run's metric review rather than re-scored here).

## Sense-testing (SENSE-TESTING LAW — read, not counted)

Armed 120d transcript (FEASTSCALE_R13=1 + ALLOWGATE2=1; scripts/sense-allowgate2-20261014.js; belongseek seed 707: 11 feasts, 8 candidate-only holds, survived).

Every fired feast landed above the floor: d21 21.1→18.1, d36 19.5→16.5, d58 15.8→9.7, d65 7.1→6, d72 9.5→8.4, d80 7.3→6, d87 8.6→7.7, d94 10.2→9.5, d101 8→7, d108 12.5→11.3, d115 16.1→14.9. The beats read as a village deciding: "🍖 FEAST 📺 — Marvin opens the pantry wide: 11× Muscadine Grapes, 6× Burdock, 4× Cattail. Autumn, Santiago, Wilhelm, Mateo and 1 more eat until the fire burns low. Somebody laughs so hard they cry. For one evening, nobody is surviving — they're just together. (−3,480 kcal from the pantry)". Named openers, varying menus, honest kcal drawdowns; a d36 feast refused the buff for want of an armed keepsake's reactor ceiling ("1.25x, always, is all there is").

**PASS with the pre-existing blank re-noted (fifth run in a row)**: the devotion channeling line ("💛 You hold Home key... The feast was the weapon.") fires VERBATIM every day — the finding #64 repetition class (competent.js channelDevotion, not this layer's doing). Filed, not chased.

**PASS with the r16 question re-opened**: two feasts (d21, d58) fired at hungryStreak 3–4 — the gate guards the fresh FLOOR, not hunger-state firing; the hunger-state firing question is still open and untouched by this layer.

## Village assessment (plain words)

Sixteen villages with the gated allowance, and the gate said no 71 times — every one of those nos a feast the allowance would actually have fired, on a pantry too thin for the 4-day floor. The un-gated allowance fired 159 feasts across the control runs; the gated one fired 146 and postponed 71 — the postponed ones re-tested on later dusks and mostly fired when the pantry recovered (that's why 71 holds cost only 13 feasts).

On these fresh seeds the villages starve more than on the r54b seeds — eleven starvation deaths per side instead of three/two — but the composite primary was built for exactly this substrate (the tracker's caveat), and it held: no worse starvation, hunger well inside the noise bound. Violence still dominates both sides' death ledgers (120 combat, 71 monster on armed), and the armed villages reached MORE of the map — national 12→14, tables 13→14, four-fire realms 13→15, median survival +5 days.

The honest footnote is leadc-s909, and it matters. There, the un-gated allowance fired 15 feasts and the village survived 158 days with a lesser seat; the gate held 8 candidates on a pantry that stayed perpetually marginal, only 2 feasts ever fired, and the village died at 109 days with 6 starvation deaths. This is the gate's real failure mode, stated plainly: on a pantry that never climbs above the floor, "not tonight" becomes "not ever," the feast engine never engages, and a trajectory the un-gated side survived collapses. The aggregate says the trade is neutral-or-better; the per-seed says it is heterogeneous, and the guard that removes harm can also strand a village. This does not re-open the verdict (§14 binds — the header's bar is the verdict), but it is now a documented finding for the next run (see metric review).

The villagers read like people: named feast-openers, menus that vary with what's actually in the pantry, keepsakes channeled or refused for legible reasons, a village that waits out thin pantries and feasts when the shelves are deep. Nothing in the transcripts reads as the gate making decisions for them — it only says "not tonight," and the village decides again tomorrow.

## Blanks filled / documented

- **CONFIRM (this arm, GO — no landing commit needed)**: the r14 4-day-floor gate (scripts/policies/allowgate2.js, ALLOWGATE2=1, default OFF, requires FEASTSCALE_R13=1 — landed by the r16 GO arm, dormant) confirmed on FRESH seeds (101/202/303/404/606/707/808/909, not the r54b seeds) under the composite header: starvation 11≤11 (directional), hungryDays 47≤61.996 (×1.409), guardrails all green (rot/vd 324.14≤472.87, deeds 15≥14, table 14≥12, national 14≥10, no new death mode). Zero src/js changes; the layer file is byte-identical to master.
- **PROOF**: scripts/test-allowgate5-20261015.js (REAL RED→GREEN, ALL GREEN both phases on this tree's HEAD; INFO-SKIP degradation if the layer is ever removed).
- **SWEEP**: scripts/measure-allowgate5-20261015.js (paired r13-only control + armed on fresh seeds, fsFeasts/fsArmedFeasts/ag2GateHeld telemetry, rot instrumentation, villager-only death-kind filter, realm via _havenPolity, gate-contrast SMOKE both sides) + evidence/2026-10-15/ag5-control.json, ag5-armed.json and the two perseed-ag5-*/ per-seed dirs.
- **DET-GATE**: scripts/det-gate-allowancegate5-20261015.js on the fresh confirm seeds (16/16 bit-identical CONTROL, 16/16 bit-identical ARMED — no waiver).
- **SENSE**: scripts/sense-allowgate2-20261014.js reused (armed, belongseek s707: 11 feasts, 8 holds, all surplus decisions, floor honored every firing).
- **[open] GATE FAILURE MODE — leadc-s909 (documented, not chased)**: on a perpetually-marginal pantry the gate's "not tonight" became "not ever" (8 holds, 2 feasts vs 15 control), the feast engine never engaged, and the village collapsed in a 6-starvation-death death spiral at 109d vs 158d control (which held a lesser seat). The composite primary absorbed it (net starvation 11→11; two seeds improved 9 deaths, three worsened 9), but the heterogeneity is real: the guard that removes pantry-blind harm can also strand a marginal village. The next run on this axis should pre-register a heterogeneity lens (e.g. max per-seed starvation delta, or a hold-spiral counter: holds on runs where feasts fired <25% of control) — proposed for the NEXT header, not scored here.
- **[open] r16 hunger-state firing question**: still open — two sense feasts fired at hungryStreak 3–4; the gate guards the floor, not hunger-state firing. No new evidence either way.
- **[open] finding #64 repetition class**: the devotion channeling line fires verbatim daily (competent.js channelDevotion) — re-noted for the fifth consecutive run, not chased.
- **[open] sickness 22→29 armed**: not a pre-registered metric; flagged for the next run's header rather than re-scored mid-run (§14).
- **[open] SUBSTRATE SEED VARIANCE (documented, not chased)**: control starvation on fresh seeds is 11 vs 3 on the r54b seeds (same policies, same tip) — the r13 allowance substrate has real seed-to-seed variance. The det-gate proves determinism within seeds, so this is seed heterogeneity, not drift. Confirms the composite-primary design decision; a starvation-only primary on 16 runs is underpowered on this substrate.
- **TELEMETRY NOTE**: telemetry-check.js would fire LOUD on table/national on BOTH sides vs the scale-wall baseline (13–14/16 tables vs baseline 0) — that's the r13 substrate's deed-opening on the new tip, not this gate; the gate's marginal table effect is 13→14 (+1) and national 12→14 (+2).

## Metric review (§14)

1. **GO stands — the header's bar is the verdict.** Starvation 11 ≤ 11 (directional, exactly at bound) and hungryDays 47000 ≤ 61996 (armed 1.068× vs the 1.409× ceiling) on identical fresh seeds, det-gated 16/16 both sides, SMOKE green both sides, own paired control in the same sweep. All guardrails held; three improved (rot/vd, table, national). Not a re-score: the composite primary was pre-registered precisely because the r54b pilot said a starvation-only primary was a ±1-death bar.
2. **The starvation primary held at exactly 11=11.** The per-seed pattern is heterogeneous (−9 on two seeds, +9 on three), which is why the composite's second component matters: hunger 47 vs 44 shows no systemic harm. The header's design worked as intended — the primary is not a coin flip on one metric anymore.
3. **leadc-s909 is the one flag the next header should price in.** A conservative floor guard has a failure mode: perpetual postponement on a marginal pantry. The proposed next-header lens: pre-register a per-seed heterogeneity guard (e.g. armed per-seed starvation ≤ control+3 on every seed, or a hold-spiral counter) so the aggregate can't hide a stranded village. For THIS run it is documented under blanks, not scored — §14.
4. **Seed variance is the substrate fact.** Fresh-seed control starvation (11) vs r54b-seed control (3) is not a substrate move — it is seed heterogeneity on a stable tip (det-gate proves determinism within seeds). Composite primaries, not larger single-metric bars, are the answer for this axis; the ×1.409 hungryDays bound had room to spare.
5. **Sickness 22→29 (armed) is flagged for the next header**, not re-scored here — §14.

## Convergence state

food-economy: **converging** (allowgate5). The 4-day-floor gate is now CONFIRMED on fresh seeds under the composite header (starvation no worse 11≤11, hungryDays 47≤62, all guardrails green, three improved, 71 candidate-only holds, floor honored on every firing, determinism 16/16 both sides) — GO. The landed claim stands, strengthened by the fresh-seed confirm. sim-findings #187 stays OPEN: the feast-as-door mechanism is proven with a proven-safe gate (landed, dormant default-OFF); remaining work is the gate's heterogeneity failure mode (leadc-s909 documented, next header needs a heterogeneity lens), the hunger-state firing question, and the #64 repetition class.
