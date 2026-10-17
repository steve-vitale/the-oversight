# SIM-FLOWDRAIN — flow-triggered aid drawdown (ARM sim-flowdrain-b, loop B, food-economy)

Date: 2026-10-17 · Loop: oversight-flesh-out-loop-b · Run: fleshout-b-2026-10-17T11-06-35Z · Worker tree: sim-flowdrain-b
Axis: food-economy (scale-wall lens) — answers finding #444 lesson (c): "future drawdown levers must trigger on FLOW (income rate) not STOCK (pantry size)".

## Pre-registration (docs/MEASUREMENT.md §§9-12, 14 — binding, written BEFORE sims)

- **Question**: the killed sim-trig6-b arm proved stock-triggered drawdown goes backwards (1.36x rot): the layer's side-effects (feast buffs -> income, aid->trust->tribute, +26.5d survival) enrich faster than it drains — "you cannot drain a pantry the lever itself keeps filling". Lesson (c) names the next: trigger on FLOW (income rate), never STOCK (pantry size). This arm tests the flow form: AID ONLY (no feast verb, no buff-stacking — #444 consequence (b)) fired on fresh-INCOME days, never on pantry level. Does the flow trigger decouple the drain from the trig6 enrichment story?
- **Lever**: scripts/policies/flowdrain.js (FLOWDRAIN_B=1, default OFF; wraps leadfeast->flowlead — the FEASTSCALE_R13=1 substrate). LEAD-ROAD ONLY: the aid verb (tendLink) requires link.primary === 'haven' (a subordinate to tend); the belong road never builds subordinate links (plumbing diagnostic: 0 links across 80 flow-days on belongfeast s4301) — SUBSTRATE-MISSING for belong, not a design flaw. flowbelong exists (gate-off identical) but is not swept. FLOW METER: wraps Game.stockPantry + the pantry array's push (the two fresh-income paths; reentrancy-flagged so stockPantry's own pushes don't double-count) — records gross fresh inflow per day. FLOW GATE: inflow >= FLOW_KCAL=4000 -> ONE aid verb/day: tendLink on the thinnest eligible subordinate (primary haven, active, untended this week, not mourning, sub pantry < 4d of sub need — 4d is Haven's own comfort threshold; the trig6 5d gate left the channel empty), fresh-first pre-draw (finding #274: aid eats the food that needs eating; the engine's _removePantryKcal answered from the pre-drawn pool; rollback on refusal), siege-gate (LINGERING world-monster only — the trig6 7-day raid window is DROPPED: plumbing showed it held 71% of flow-days on the national substrate where raids recur; a raid 5 days ago is history, not a siege; holds counted, never narrated), cause line AFTER the confirmed engine beat and FLOW-honest (names the day's inflow, never the stock level). NO feast verb. NO tribute verb (do NOT touch tribute ordering — #274). NO stock gate anywhere: a mountain pantry with zero inflow fires nothing (the lesson-(c) regression, pinned by the proof). Policy-side only, zero src/js changes. The layer's aid is deliberately NOT recorded in the parent's tribute history (it fires before trackTribute installs) — counting it would feed the r13 feast gate and reintroduce the buff-stacking enrichment channel.
- **SUBSTRATE**: FEASTSCALE_R13=1 both sides; SEATDRIVE=0 EXPLICIT (unset now means driver ON); base courtship policies only. 180d death-aware; dead villages stop (+10d tail max). Assert env up front; SWEEP STOPS on mismatch.
- **SEEDS**: 8 FRESH seeds 4301-4308 x leadfeast x {control,armed} = 16 runs, IDENTICAL seeds both sides. LEAD-ROAD ONLY (see Lever). Verified 4301-4308 against the coordinator's banned list before running (no hits — sweep stops if any is banned).
- **PRIMARY** (the #444 consequence-(c) prize): paired-median waste-rate <= 0.85x armed/control, where wasteRate = freshRotKcal / (villagerDays * meanDailyPantryKcal) — rot per mouth-day per unit stocked. (Absolute rot is confounded by trajectory divergence — the trig6 lesson.)
- **VOLUME SANITY** (mandatory per trig6 metric review): max theoretical drawdown (flow-days x 1500) vs the prize's required delta (15% of control rot). Theoretical max < 25% of required delta => NO-COVERAGE (reported honestly, never a GO).
- **MECHANISM-ENGAGEMENT CHECKS** (vacuous-pass protection): (a) flow-days >= 30 across the sweep; (b) layer aids fired >= 10 armed-side; (c) aid-days <= flow-days (sanity). Mechanism never engages => KILL, not GO.
- **GUARDRAILS**: starvation <= control+2; national >= control-2; matched median survival >= control-10d (ONE-SIDED — the trig6 lesson: longer survival is not harm); table >= control-2; dehydration <= control+1; wins 0=0 both sides (pre-seat); exiled 0=0 both sides; no new death mode; half-ration rate reported (finding #385).
- **HETEROGENEITY LENS**: per-pair waste-rate direction split (how many pairs improved).
- **Measure every run**: win rate, national reach, table arrival, Arc reach, wave reach 1-5, four-realm formation, median/max survival, death-cause shares.
- **Det-gate**: bit-identical reruns both sides before trusting comparisons (r27 rule); SMOKE=1 honesty gate proving the layer actually ran.
- **Calibration** (probe, MEASUREMENT §14b pool sizing): courtship-substrate daily gross fresh inflow p50 ~1.6-2.1k, p75 ~2.9-3.2k, p90 ~3.5-4.2k, max ~5.3-6.0k (60d x 4 runs). FLOW_KCAL=4000 sits at ~p90. Max theoretical drawdown ~18 flow-days x 1500 = 27k vs required ~60k (15% of trig6-control 397k/run): 45% of required delta — above the 25% NO-COVERAGE bar. CONTACT check: flow-days occur on the substrate (probe: ~10% of days >= 4000) — the prodthrottle does NOT kill the flow signal (tribute grain, forager hauls, snared meat, expedition hauls all route through the metered paths). VERB check: tendLink exists and is proven (trig6 G2). HORIZON: 180d death-aware (trig6 precedent).

## Proof results (run BEFORE any sims)

scripts/test-flowdrain-b.js — RED (FLOWDRAIN_B unset) + GREEN (FLOWDRAIN_B=1), one process per phase. PROOF GREEN, all checks passed (re-run green on seed-shift 100):
- R1 gate-off byte-identical: flowlead == leadfeast and flowbelong == belongfeast per-day hashes, 40d x 2 seeds, IDENTICAL.
- R2: no aid fires gate-off on the fd-6.5 fixture; the parent's own tend discipline still fires.
- R3: flow meter records stockPantry inflow (4000); gate-off records nothing; setup zeroes setup-time stocking.
- G1: flow-day (5000 inflow) fires one aid (1500 kcal, sub 1000->2500, trust 30->38); cause line AFTER the engine beat and FLOW-honest ("5,000 kcal of fresh through the hall" — names inflow, never stock).
- G2 (the lesson-(c) regression): fd-6.5 mountain pantry + ZERO inflow -> NO layer aid, no cause line. Stock alone never fires.
- G3: thinnest of two thin links picked. G4: non-thin link refused (fdNoLink counted). G5: mourning refused.
- G6: lingerer holds the aid (fdGateHeld counted, silent); recent raid does NOT hold (design change — see plumbing).
- G7: fresh-first pre-draw — the +2d stack drained (96->93), +10d/+30d untouched, pantry drained exactly once.
- G8: pre-draw rollback restores the pantry exactly on refusal.
- G10: one aid/day. G11: armed determinism 40d x2 byte-identical.
- G12: no payTribute call (tribute ordering untouched). G13: no hostFeast call (no feast verb).

## Plumbing findings (pre-pilot — the 2-seed SEEDS=4301 shakedown)

The plumbing run (not the pre-registered pilot) caught three engagement bugs, all fixed BEFORE the pilot with pre-registration updated (fixing before the run is not re-scoring):

1. **Threshold miscalibration**: the v2 probe's truncated output misread the distribution (reported p90 ~4.2k). The corrected probe (v3, full meter): leadfeast p90 ~5.3-6.1k with 13k+ spikes; belongfeast p90 ~3.4-4.2k. FLOW_KCAL=4000 sits at ~p85 on the true distribution — a genuine spike bar, not a median. (The layer's meter was verified byte-correct against an independent meter: control vs armed identical inflows, d1-30.)
2. **Siege gate strangled the verb**: the trig6 7-day raid window held 71% of flow-days (123/172) — on the national substrate raids recur every few days, so "raid in trailing 7d" is almost always true. A raid 5 days ago is history, not a siege; the aid moves surplus inflow, not the war chest. REDESIGN: siege gate is lingerer-only (active pantry predator). The proof's G6b now pins that a recent raid does NOT hold.
3. **Thinness gate starved the channel**: the trig6 5d threshold left 0 thin links (healthy courtship subs sit at 5d+). REDESIGN: 4d of need (Haven's own comfort threshold — a sub below it is genuinely worse off than we are). Aid volume went 2 -> 3 per 2 runs on lead.
4. **Belong road is structurally aid-less**: 80 flow-days, 0 links, 0 aids on belongfeast s4301 — the scholar joins; there is no subordinate to tend (tendLink requires link.primary === 'haven'). SUBSTRATE-MISSING for belong. The arm is lead-only; the sweep drops belongfeast (16 runs, not 32).

## Sweep results

16 runs (leadfeast only), identical seeds, det-gate green both sides before trusting comparisons (r27), SMOKE=1 green. Seeds 4301-4308 verified against the banned list (no hits).

| metric | control | armed | pre-reg |
|---|---|---|---|
| waste-rate, paired median (**PRIMARY**) | — | 1.179x | **FAIL** (need <= 0.85x) |
| starvation deaths (guardrail) | 2 | 7 | **FAIL** (need <= 4) |
| national | 7/8 | 7/8 | ✓ (≥ 5) |
| median survival (guardrail, one-sided) | 182.0d | 137.0d | **FAIL** (need ≥ 172d) |
| table | 7/8 | 7/8 | ✓ (≥ 5) |
| wave-4 / wave-5 | 0/8 / 0/8 | 0/8 / 0/8 | — (readiness-gated shut, both sides) |
| wins | 0/8 | 0/8 | ✓ (pre-seat) |
| exiled | 0/8 | 0/8 | ✓ |
| dehydration | 3 | 0 | ✓ (≤ 4) |
| arc2 / arc3 / arc4 | 8/8 / 8/8 / 7/8 | 8/8 / 8/8 / 7/8 | — |
| four-realm | 0/8 | 0/8 | — |
| half-ration rate | 473d (0.3656/d) | 316d (0.2883/d) | (heterogeneity lens) |
| fresh-rot kcal (absolute) | 1,551k | 1,562k | — |
| layer aids fired | 0 | 74 | mechanism (b) |
| aid volume | 0 | 110k kcal | 7.0% of armed rot |
| flow-days | — | 488 | mechanism (a) |
| siege-gate holds | — | 80 | counted, not narrated |
| no-link flow-days | — | 334 | counted |

Paired waste-rate ratios (armed/control): s4301 0.920, s4302 1.299, s4303 1.085, s4304 1.449, s4305 0.747, s4306 0.083, s4307 1.273, s4308 1.274. Median 1.179. Heterogeneity: 3/8 improved (s4301, s4305, s4306 — s4306's 0.083 is the d41 collapse, meaningless).

Paired starvation deltas (armed−control): +0, +0, +0, +1, +0, **+4**, +1, −1. Max paired delta: +4 (s4306).

Paired survival deltas (armed−control, days): −88, −30, −18, −18, +0, −141, +24, +49. Median −19d. The armed village dies earlier on 5/8 pairs.

Death-cause shares — control: combat 240, villager combat 70, monster 33, sickness 10, expedition 5, dehydration 3, starvation 2, ... — armed: combat 233, villager combat 56, monster 28, expedition 11, sickness 10, contest 8, **starvation 7**, ... The starvation mode is layer-associated (s4306: 4 of the 7).

**Verdict: NO-GO — KILLED** (primary miss: 1.179x vs ≤0.85x; starvation guardrail breach: 7 vs ≤4; survival guardrail breach: 137d vs ≥172d). The mechanism ENGAGED (488 flow-days, 74 aids) — this is a real NO-GO on an engaged mechanism, not a vacuous kill. Per the kill protocol the layer file is deleted zero-trace; instruments (proof, sweep, det-gate, per-seed JSONs, beats) and this evidence are kept. **Classification: CONCEPT-DEAD** (§14a) — the mechanism was staged, the metric was fair, and the concept failed on its merits (it harms). Do not retry flow-triggered aid without a new mechanism.

## Why the aid harms (the actual finding — root-cause level)

The aid removes 1,500 kcal on "flow-days" (inflow ≥ 4000). The design assumed flow-day = surplus day. **That assumption is false.** A 4,000-kcal inflow on a 100k pantry is surplus; the same inflow on a 20k pantry (tight, early-game, post-raid) is a lifeline. The layer cannot tell the difference — it is forbidden (by the task's reading of lesson (c)) from looking at stock.

The s4306 smoking gun: 8 aids in 41 days (one every 5 days) → 4 starvation deaths → village lost at d41 (control: 182d, 0 starvations). The aids (12,000 kcal total) took food from a village that couldn't afford it. The pre-draw's "soonest-spoiling first" takes exactly what the next day's meals were going to eat.

Per-pair aids vs outcome shows no dose-response (s4301: 3 aids → −88d; s4306: 8 aids → −141d + 4 starvations; s4305: 13 aids → +0d, waste 0.75x). The harm is not linear in aid volume — it's the trajectory perturbation: each aid shifts the RNG/political stream, and on fragile seeds the new trajectory collapses. But the starvation channel (s4306, s4304 +1, s4307 +1) is direct and mechanical, not just perturbation.

**The lesson (c) refinement**: "trigger on FLOW not STOCK" is refuted in its absolute form. Flow without stock context cannot identify surplus. A future drawdown lever must trigger on flow RELATIVE TO NEED (e.g., inflow as a multiple of the burn rate, or flow-days gated on a comfort buffer) — not absolute flow, not absolute stock. The trig6 failure was "can't drain a pantry you're filling"; the flowdrain failure is "can't identify a surplus without looking at the pantry." Both point to the same underlying need: the trigger must measure SURPLUS (inflow minus need relative to buffer), not a single variable.

## Wall numbers (every run)

| side | national | table | wins | w4 | w5 | median | max |
|---|---|---|---|---|---|---|---|
| control | 7/8 | 7/8 | 0/8 | 0/8 | 0/8 | 182.0d | 182d |
| armed | 7/8 | 7/8 | 0/8 | 0/8 | 0/8 | 137.0d | 182d |

Exiled: 0 everywhere. Wave 4/5: 0/8 both sides — the readiness gate holds wave 4 shut on the pre-seat courtship substrate. The scale wall is untouched by this arm (as expected — the lever is food-economy, not scale). The lever moved median survival the WRONG way (−45d).

## Village assessment (plain words)

Sixteen villages, eight of them twinned. The armed twins fired 74 aids across 488 flow-days — the trigger works, the verb works, the villages die. Five of eight armed villages collapsed earlier than their controls (by 18 to 141 days); one (s4306) starved outright, four souls in 41 days, because the aid took their dinners eight times. The three that survived or improved (s4305: waste 0.75x; s4307: survived 24d longer) show the mechanism CAN work when the village is genuinely comfortable — but the layer can't tell comfortable from desperate, so it gambles every flow-day. The aid beats read as honest help ("1,500 kcal goes to Thornfield's fire instead of the rot pile") — the fiction is sound; the targeting is blind. Nothing reads robotic. But the prize — less waste — went backwards (1.18x), because the villages the lever "helped" were too fragile to afford the help.

## Sense-testing (SENSE-TESTING LAW — read, not counted)

Leadfeast-armed s4301 (94d, 3 aids): the aid beats (d27/d28/d77) read as surplus-sharing with honest numbers — "Today's haul ran heavy — 9,754 kcal of fresh through the hall, more than the village eats before it turns. 1,500 kcal goes to Thornfield's fire instead of the rot pile." The inflow is named, the recipient is named, the amount is exact. **PASS** — the verbs read as meaningful decisions.

Leadfeast-armed s4306 (41d, 8 aids, 4 starvations): the same beats fire — but the village is starving. The d30-something aid beat ("Today's haul ran heavy...") reads as cruel irony against the hunger. The fiction doesn't know the village is dying. **FAIL** — the narration is honest about the inflow but blind to the need. A surplus-sharing verb that can't see hunger is a design flaw, not a narration flaw.

One narration finding filed (not chased): the aid cause line fires even when the subordinate is only marginally thin — the "instead of the rot pile" framing assumes waste, but on tight days the food wasn't going to rot. The framing is flow-honest but need-blind.

## Blanks filled / documented

- **FILLED (finding)**: flow-triggered aid without stock context HARMS — 5/8 armed villages died earlier (median −45d), starvation 7 vs 2 (s4306: +4). The mechanism engages (74 aids) but the concept is CONCEPT-DEAD. Lesson (c) refined: flow must be relative to need, not absolute.
- **FILLED (finding)**: the belong road is structurally aid-less (0 subordinate links across 80 flow-days) — SUBSTRATE-MISSING for belong. Aid-as-drawdown is lead-road-only by engine design.
- **FILLED (finding)**: the trig6 7-day raid siege window held 71% of flow-days on the national substrate — a raid 5 days ago is history, not a siege. (Moot now — the layer is dead — but the siege-gate calibration lesson stands for future arms.)
- **DOCUMENTED (metric review)**: the waste-rate primary (1.179x vs 0.85x) correctly caught the harm — the metric held. The one-sided survival guardrail (trig6 lesson) fired correctly on −45d. The volume sanity (315% coverage) shows the bar was achievable in principle — the concept failed, not the calibration.
- **DOCUMENTED**: the s4305 counter-example (waste 0.75x, 13 aids, survived) — the mechanism CAN work on comfortable villages. A future arm with a need-relative trigger could revisit this.

## Metric review (§14)

- The primary (paired-median waste-rate ≤ 0.85x) missed at 1.179x. Per §14 this is NO-GO, not re-scored. The metric held — it correctly measured the harm (waste-rate up, not down).
- The starvation guardrail (≤ control+2) breached at 7 vs 2. The s4306 +4 is a concentrated harm signal, not noise.
- The one-sided survival guardrail (≥ control−10d) breached at 137d vs 182d (−45d). The trig6 lesson (make it one-sided) is validated — the symmetric version would have fired on trig6's +26.5d (a good thing); the one-sided version correctly fires here (a bad thing).
- The volume sanity check (315% of required) confirms the bar was achievable — this is CONCEPT-DEAD, not METRIC-BROKEN. The aids fired at volume (74); they just harmed.
- Metric lesson: the heterogeneity lens (per-pair deltas) was essential — the median alone (1.179x) hides the s4306 catastrophe (+4 starvations) and the s4305 success (0.75x). Always report the distribution, not just the median.

## Convergence state

**killed-at-pilot** (NO-GO on the engaged primary + guardrail breaches — the layer harms). **CONCEPT-DEAD** per §14a: do not retry flow-triggered aid without a new mechanism (need-relative triggering). The food-economy axis is not converged; the #444 line now redirects from flow-form drawdown to need-relative surplus triggers, or abandons the drawdown line entirely.
