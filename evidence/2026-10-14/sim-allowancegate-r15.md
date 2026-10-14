# SIM-ALLOWANCEGATE r15 — pantry-state gate as a separate policy layer (loop B, food-economy, sim-findings #187)

Date: 2026-10-14 · Loop: oversight-flesh-out-loop-b · Worker tree: sim-allowancegate
Axis: food-economy (scale-wall lens) — sim-findings #187 (FEAST AS TABLE-PATH OPENER, claimed: FEASTDOOR'S CALIBRATED PRICE next arm). Stale-lock adoption: this tree held uncommitted work from a dead run (verified: no live agents, heartbeats 106m stale). The coordinator's task carried the full brief; I inventoried every uncommitted file and re-ran the proof myself — REAL RED→GREEN confirmed independently, then adopted.

## The lever (ADOPTED, then KILLED AT PILOT — layer deleted per kill protocol)

scripts/policies/allowancegate.js wrapped leadfeast/belongfeast (the r13 allowance layer). THE GATE (ALLOWANCEGATE=1, default OFF; requires FEASTSCALE_R13=1): the allowance may NOT fire a feast when pantry fresh-days < 2 (Game.pantryFreshDays() — the same number prodThrottle gates on). Suppressed feasts POSTPONED, never displaced: the shared cadence tracker (ctx._fsLastFeastDay) is NOT marked, so the next dusk re-tests and an opening is never displaced by a postponement. Held feasts counted ctx.agGateHeld (per-hold). Gate-off = pure delegation (the proof's R1 pins leadgate/belonggate gate-off == leadfeast/belongfeast per-day hashes). Gate inert without FEASTSCALE_R13 (proof G6). Policy-side only; ZERO src/js changes.

Design rationale (documented — Steve can overrule): r14's 4-day-floor gate (FEASTGATE_R13) worked — starvation 21→16, 123 candidate feasts held — but was killed on the hungryDays guardrail. The r15 hypothesis: the pantry-blind harm driver is feasts fired when the fresh floor is THIN (<2d), measured with the engine's own fresh-days number instead of r14's cost-vs-surplus computation. Simpler, and the floor concept stays the engine's.

## Pre-registration (docs/MEASUREMENT.md §§9-12, 14 — binding)

- **Question**: can a <2 fresh-days pantry-state gate on the r13 allowance remove the measured pantry-blind harm (starvation 15→21, hungryDays 35→48, median 151→92d vs pristine) while keeping the deed-opening (r13-only: 13/16 deeds, 4/16 tables)?
- **Lever**: scripts/policies/allowancegate.js (ALLOWANCEGATE=1, default OFF; requires FEASTSCALE_R13=1). All r13 gates untouched (dusk, haven, one feast/day, cadence, contribution ≥1500, affordability ×1.5, fusion ceiling). Zero src/js changes.
- **Horizon**: 180d death-aware (reachability lever per §10; pacing-law absolute max). Dead villages stop; +10d tail max.
- **Seeds**: 11/22/33/44/55/66/77/88 × leadcourt/belongseek = 16 runs/side, IDENTICAL seeds control vs armed. BOTH sides run FEASTSCALE_R13=1 (leadfeast/belongfeast = the r13 allowance). Control: ALLOWANCEGATE unset. Armed: ALLOWANCEGATE=1. (The dead run's shared baseline hidden_files/evidence/2026-10-14/sim-feastbase-b.json is INVALID — pristine fingerprint, FEASTSCALE_R13 never set. This sweep measures its OWN paired r13-only control on identical seeds; judged against the paired control only.)
- **PRIMARY**: armed starvation deaths <= control − 5 AND armed hungryDays <= control × 1.409 (the A/A noise-calibrated ceiling from the feastdoor r25b precedent).
- **GUARDRAILS**: national >= control − 4 (perturbation-aware); table >= control − 2 (the price ceiling, inside the [1,2,3] noise band); no new death mode; median report-only.
- **SECONDARY**: allowance feast counts (fsFeasts, fsArmedFeasts), gate holds (agGateHeld), per-seed deed attribution, Standing per avenue, wave reach 1–5, Arc reach, table seats, fresh-days trajectory, death-cause shares, exiled.
- **Det-gate**: 16/16 bit-identical both sides first (r27 rule; scripts/det-gate-allowancegate-r15-20261014.js). SMOKE=1 instrument-honesty both sides (policy actually ran; gate-contrast fixtures: thin-fresh → control FIRES / armed HOLDS; deep-fresh → both fire).

## Proof results (RE-RUN BY ME, not trusted from the dead run)

scripts/test-allowancegate-20261014.js — REAL RED → GREEN, both phases green on my own invocations.

RED (FEASTSCALE_R13=1, gate off): R1 gate-off byte-identical — leadgate/belonggate == leadfeast/belongfeast per-day hashes, 40d ×2 seeds, IDENTICAL (the layer adds zero trajectory delta when off). R2: the un-gated allowance FIRES pantry-blind on the thin-fresh fixture (freshDays=1.67, total kcal 64000 via pemmican stockpile so the 1.5x buffer passes): fsFeasts=1, pantry 64000→59000 — the harm mechanism in miniature.

GREEN (FEASTSCALE_R13=1 + ALLOWANCEGATE=1): G1 holds on the thin-fresh fixture (no feast, pantry untouched at 64000, agGateHeld=1, cadence NOT marked). G2 fires on the deep-fresh fixture (freshDays=6.46, pantry 8000→3000, agGateHeld=0). G3 postponed feasts fire on recovery (day-30 hold, cadence unmarked; fresh food arrives, day-31 fires, _fsLastFeastDay=31). G4 armed determinism (identical fixture twice → identical outcome). G5 no double-feast (second upkeep same day doesn't re-fire). G6 gate inert without FEASTSCALE_R13 (no holds, no feasts; textual guard `if (!gateOn() || !FS.layerOn())` present).

Det-gate: 16/16 bit-identical CONTROL, 16/16 bit-identical ARMED — no waiver needed. SMOKE=1: green both sides (unwrap + live drive + gate-contrast fixtures).

Also verified by me: Game.pantryFreshDays() (src/js/game.js:13870) is a pure read — fresh kcal over the rolling 7-day burn, same number the engine's own throttle gates on. withAllowanceGate's armed path (parent.upkeep + FS.scaleFeast) is textually equal to withFeastScale.upkeep when the gate doesn't trigger.

## Pilot results

16 runs/side, identical seeds, 180d death-aware. Det-gate 16/16 both sides; SMOKE green both sides. BOTH sides FEASTSCALE_R13=1 (the r13 allowance); armed adds ALLOWANCEGATE=1.

| metric | control (gate off) | armed (gate on) | pre-reg | verdict |
|---|---|---|---|---|
| starvation deaths (**PRIMARY**) | 21 | **21** | ≤16 | **MISS** |
| hungryDays (**PRIMARY**) | 48 | **45** | ≤67.6 | GO |
| national (GUARDRAIL) | 7 | 7 | ≥3 | GO |
| table (GUARDRAIL) | 4 | 5 | ≥2 | GO |
| no new death mode | — | same modes | — | GO |
| median survival (report-only) | 92d | 79d | — | — |
| max survival | 180d | 180d | — | — |
| food-deeds | 13/16 | 13/16 | — | — |
| wave-4 / wave-5 | 11 / 4 | 10 / 4 | — | — |
| wins / exiled | 0 / 0 | 0 / 0 | — | — |
| allowance feasts | 107 | 105 | — | mechanism |
| gate holds | 0 | 757 | — | telemetry (see blanks) |

Per-seed (control → armed): starvation deaths IDENTICAL on all 16 seeds (21=21 — the miss is a flat no-effect, not noise). 13 of 16 seeds have IDENTICAL days/feasts/deeds/seat/rank/arc with only agGateHeld differing — the gate held on thin-pantry dusks where the allowance wouldn't have fired anyway. Only 3 seeds diverge: belongseek-s22 (d128 village-lost → d180 survived, feasts 15→17, lesser→FULL seat — a genuine trajectory improvement), belongseek-s44 (d72 both, hungry 2→3), belongseek-s55 (d92→d79, hungry 2→3), belongseek-s66 (d135→d112, lesser seat kept, rank regional→global). Feast counts barely moved: 107→105; leadcourt feasts 58→58 (the gate changed literally nothing on the leadcourt road).

Death-cause shares — control: combat 62, starvation 21, monster 20, sickness 19, villager combat 18, wound 14, contest 4, lockjaw 2, ambush 1, Choir Toad 1, dehydration 1, alien 1, the expedition 1. Armed: combat 60, starvation 21, monster 17, contest 3, ambush 1, villager combat 18, sickness 20, wound 18, Choir Toad 1, lockjaw 2. Same modes — no new death mode. Villages die of violence, not hunger, on both sides.

**Verdict: KILLED AT PILOT per §14.** The primary requires BOTH clauses (AND): hungryDays passed (45 ≤ 67.6) but starvation 21 ≤ 16 missed cleanly — flat no-effect, not borderline.

## Wall numbers (every run)

| side | national | table | wins | w4 | w5 | median | max |
|---|---|---|---|---|---|---|---|
| control (r13, gate off) | 7/16 | 4/16 | 0/16 | 11/16 | 4/16 | 92d | 180d |
| armed (r13 + r15 gate) | 7/16 | 5/16 | 0/16 | 10/16 | 4/16 | 79d | 180d |

Exiled: 0 both sides. (Control exactly reproduces the r14 control aggregate — 21/48/107/7/4/11/4 — the substrate is bit-stable across runs.)

## Sense-testing (SENSE-TESTING LAW — read, not counted)

Armed 120d transcript (FEASTSCALE_R13=1 + ALLOWANCEGATE=1; scripts/sense-allowancegate-r15-20261014.js; leadcourt seed 22: 13 feasts, 3 gate holds).

Every feast that fired was a surplus decision: fresh-days 52.3→49.8, 56.4→53.5, 47.1→45.3, 15.4→15.1, 5.8→4.9, 7.1→6.2 — all with hungryStreak 0. The lowest firing (d80: 5.8→4.9) sits far above the gate's <2 line — on this seed the gate's threshold never intercepted a real feast; its 3 holds were non-candidate dusks. The beats read as a village deciding: "🍖 FEAST 📺 — Casey opens the pantry wide: 5× Foraged food, 1× Snared meat. Zuri, Walt, Carlos, Victor and 1 more eat until the fire burns low. Somebody laughs so hard they cry. For one evening, nobody is surviving — they're just together." Named villagers open and attend; menus vary (5× foraged+1 snared, 7× foraged+1 snared, 9× foraged). The deed chain reads fine: sentimentTaught && feastSurgeUsed both marked on the surviving runs; belongseek-s22's full seat came through the gated allowance.

**PASS with the pre-existing blank re-noted**: the devotion channeling line ("💛 You hold Carpenter's square... The feast was the weapon.") fires VERBATIM every day d15–d116 — the finding #64 repetition class (competent.js channelDevotion, not this layer's doing). Filed, not chased.

## Village assessment (plain words)

Sixteen villages with the gated allowance, and the gate said no 757 times — but almost none of those nos mattered. The allowance fires on contribution ≥1500 with the 7d/14d cadence; by the time a feast is actually a candidate, the pantry almost always holds ≥2 fresh-days, so the gate's <2 line intercepted ~2 real feasts in 16 runs (107→105, leadcourt 58→58 unchanged). Starvation deaths didn't move on a single seed: 21 vs 21, per-seed identical. The villages lived and died exactly as before — raids, monsters, contests, wounds — with the same hunger in the mix (45 vs 48 hungry-days, a perturbation-class move). The deed-opening #187 exists for survived untouched: 13/16 food-deed rungs both sides, 5 table seats armed (vs 4), belongseek-s22 even upgraded lesser→full on the armed trajectory.

The lesson is a measured one, not a tragedy: the pantry-blind harm r13 measured (starvation 15→21) does NOT live below 2 fresh-days. r14's 4-day floor cut starvation 21→16 by holding feasts that would have landed below 4 — the harm lives in the 2–4d band, where the allowance fires on contribution while the fresh floor is thin-but-passing. The r15 line was drawn in the wrong place: too weak to touch the harm, too honest to cause any — a gate that only ever guards empty rooms. The per-seed identicals prove the design's safety (it cannot cause hunger — it only holds, and it barely even did that); the per-seed flatline proves its irrelevance. A no-op is not a harm, but §14 binds and the primary missed: KILL.

## Blanks filled / documented

- **GATE (this arm, KILLED AT PILOT — layer deleted per kill protocol)**: scripts/policies/allowancegate.js (ALLOWANCEGATE=1, default OFF, requires FEASTSCALE_R13=1) — the allowance could not fire below 2 pantry fresh-days; suppressed feasts postponed (cadence unmarked), never displaced; zero src/js changes. Deleted post-kill; the proof's RED phase pins gate-off == pristine, and the proof degrades to INFO-SKIP post-kill.
- **PROOF**: scripts/test-allowancegate-20261014.js (REAL RED→GREEN re-run by me; 40d gate-off byte-identical; thin-fresh/fire vs hold fixtures; postponement; determinism; no double-feast; inert-without-layer; INFO-SKIP degradation post-kill).
- **DET-GATE**: scripts/det-gate-allowancegate-r15-20261014.js (16/16 both sides, no waiver).
- **SWEEP**: scripts/measure-allowancegate-r15-20261014.js (paired r13-only control + armed, fsFeasts/fsArmedFeasts/agGateHeld telemetry, gate-contrast SMOKE both sides) + evidence/2026-10-14/ag15-control.json, ag15-armed.json and the two perseed-ag15-*/ per-seed dirs.
- **SENSE**: scripts/sense-allowancegate-r15-20261014.js (feast decision context: fresh-days before→after, hungryStreak, beats).
- **TELEMETRY BLANK (documented, not chased)**: agGateHeld counts holds at EVERY dusk with fresh-days < 2, BEFORE scaleFeast's own gating (dusk/contribution/cadence/plan) — so it counts dusks where no feast would have fired anyway. It is not a count of "pantry-blind feasts held." The honest comparison is feasts fired: 107→105. Any future gate telemetry should count holds only where the feast would otherwise have fired (inside scaleFeast's decision path, like r14's fsGateHeld).
- **HARM-DRIVER LOCATION (measured)**: the r13 allowance's starvation harm is NOT fired-below-2d feasts — the <2d gate held ~2 candidate feasts in 16 runs and changed nothing. r14's 4d-floor gate held 123 candidates and cut starvation 21→16. The harm lives in feasts fired with fresh-days in the 2–4d band (or in the contribution-rule's total-kcal blindness beyond fresh-days entirely) — an open question for the next arm, not this run's.

## Metric review (§14)

1. **The primary fired, and §14 binds — KILL stands.** Starvation 21 ≤ 16 is a clean miss on identical seeds, det-gated 16/16 both sides, SMOKE green both sides, control exactly reproducing the r14 control aggregate. This is not noise: per-seed starvation is identical on all 16 seeds. The AND-requirement fails on the first clause.
2. **The miss is a no-op, not harm.** HungryDays passed its noise-calibrated ceiling (45 ≤ 67.6); guardrails all held (national 7 ≥ 3, table 5 ≥ 2, no new death mode); the gate cannot cause hunger by construction (it only holds feasts, and it held ~2 candidates). Median dipped 92→79d (report-only) with 3 perturbed seeds — below the guardrail bar by design, but noted honestly: the gate's postponement re-sequences trajectories, and on this seed mix the re-sequencing cost ~13d of median life while buying belongseek-s22 a full seat. The primary is the verdict; the median is the texture.
3. **For the NEXT run**: the telemetry blank above must be fixed first (count holds only on feast candidates), or any gate's "held" number is theater. If #187 stays on gates, the candidate is the 2–4d band r14 proved — either r14's floor under a noise-calibrated hungryDays bound (this run's A/A numbers: starvation p90abs 9, hungryDays p90rel 0.409 from the feastdoor precedent) or a starvation-only primary. The r15 <2d line is measured dead — do not re-arm it.
4. **Telemetry note**: telemetry-check.js would fire LOUD on table (baseline 0 → current 5/4) on BOTH sides — the r13 substrate's deed-opening (measured since the feastdoor run), not this gate; the scale-wall baseline predates the r13 era. The gate's marginal table effect is 4→5 (+1), inside noise.

## Convergence state

food-economy: **killed-at-pilot** (allowancegate r15). The <2 fresh-days gate is a proven-safe no-op (starvation 21=21 on all 16 seeds, feasts 107→105, gate-off byte-identical, deeds/tables kept) killed by the pre-registered starvation primary (21 ≤ 16 missed). sim-findings #187 stays OPEN: the harm driver is now located — not below-2d firings (r15, dead) but the 2–4d band r14's floor proved live. Next arm: r14's 4d-floor gate under a noise-calibrated bound, with hold-telemetry counted on feast candidates only.
