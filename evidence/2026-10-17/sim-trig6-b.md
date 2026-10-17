# SIM-TRIG6 — lifted-trigger overstock drawdown (ARM sim-trig6-b, loop B, food-economy)

Date: 2026-10-16/17 · Loop: oversight-flesh-out-loop-b · Run: fleshout-loop-b-20261017T0130Z · Worker tree: sim-trig6-b
Axis: food-economy (scale-wall lens) — answers sim-findings #200's named next ("cap total daily drawdown outflow when fd < 6, or lift the trigger to fd > 6"; this arm tests the TRIGGER form — the sibling sim-drawcap-b tests the volume-cap form).

## Pre-registration (docs/MEASUREMENT.md §§9-12, 14 — binding, written BEFORE sims)

- **Question**: sim-overdraw4 (2026-10-14) PROVED the fresh-first rot mechanism but was KILLED AT CONFIRM on the STARVATION guardrail. The sim-floorday3-b autopsy (2026-10-16) root-caused the floor as near-vacuous (never bound once in 174 feast events — the engine's cost formula cannot produce it) and named the real channel: drawdown VOLUME on thin-overstock pantries, fd hovering just above 4, where layer aid + layer feast + base feastscale feasts + the parent's weekly tend all fire in the same window on a pantry one raid away from hunger. THIS arm lifts the overstock trigger from fd > 4 to fd > 6 — the layer simply never engages on the thin-overstock pantries where the harm lived. Does the drawdown still cut rot without reproducing the belong-road harm?
- **Lever**: scripts/policies/trig6.js (TRIG6=1, default OFF; wraps leadfeast→trig6lead, belongfeast→trig6belong — the FEASTSCALE_R13=1 substrate). ONE drawdown verb per day, priority: (1) AID — tend a THIN subordinate link (tendLink 1,500 kcal; thin = sub pantry < 5 days of sub need; skip if tended this week or mourning), (2) FEAST — hostFeast under the r13 allowance gates (dusk, at haven, one-feast/day, 7d/14d cadence, recentGives(7)+tribute/tend paid(7) >= 1500, plan.ok, 1.5x affordability, fusion-reactor ceiling — mirror allowgate2.js/feastscale.js conventions). NO tribute verb (tribute runs on the parent's own timing; the layer never calls payTribute). NO floor (dead — floorday3 proved it vacuous). NO fragility gate (overdrawfloor's own killed experiment). Fresh-first ordering: aid drains via the fresh-first pre-draw (preDraw + answer the engine's _removePantryKcal from already-drawn food; rollback on tend refusal); feast drains natively fresh-first (hostFeast already uses pantryDraw ordering). THE VARIANT: the overstock trigger is LIFTED to pantry fresh-days > 6 (no cap). Siege-gate clear required (no lingerer/gorge threat/raid in trailing 7d). Cause lines follow CONFIRMED verbs only; pre-checked refusals get NO cause line (counted in the instrument, never narrated as action). Policy-side only, zero src/js changes. Cause-line copy reused verbatim from the overdraw lineage — no new narration.
- **SUBSTRATE**: FEASTSCALE_R13=1 both sides; SEATDRIVE=0 EXPLICIT (unset now means driver ON); base courtship policies only. 180d death-aware; dead villages stop (+10d tail max). Assert env up front; SWEEP STOPS on mismatch.
- **SEEDS**: 8 FRESH seeds 4101-4108 x {leadfeast,belongfeast} x {control,armed} = 32 runs, IDENTICAL seeds both sides. Verified 4101-4108 against the coordinator's banned list before running (no hits — sweep stops if any is banned).
- **PRIMARY** (the killed harm): starvation deaths (absolute) armed <= control. Also per-day-alive rate armed <= control x 1.15.
- **CO-PRIMARY** (the lever's prize): fresh-rot kcal armed <= 0.75x control.
- **GO = both gates** (every-gate rule). A miss is NO-GO, never re-scored mid-run; metric doubts go under "metric review".
- **MECHANISM-ENGAGEMENT CHECKS** (vacuous-pass protection): (a) layer drawdown verbs fire >= 20 combined armed-side; (b) lifted-trigger candidate-days (fd>6 days) >= 30 across the sweep; (c) verb-days armed <= 0.9x the instrument's fd4-candidate-day counter (proving the lift discriminates). If the mechanism never engages, the run is a KILL (invisible effect), not a GO.
- **GUARDRAILS**: national >= control-2; median survival within 10d of control; no new death mode; table >= control-2; dehydration <= control+1; wins 0=0 both sides (pre-seat); exiled 0 both sides.
- **HETEROGENEITY LENS**: max per-seed starvation delta (armed-control) <= +3; report half-ration rate both sides.
- **Measure every run**: win rate, national reach, table arrival, Arc reach, wave reach 1-5, four-realm formation, median/max survival, death-cause shares.
- **Det-gate**: bit-identical reruns both sides before trusting comparisons (r27 rule); SMOKE=1 honesty gate proving the layer actually ran.
- **Metric-review note (§14)**: the floor's vacuous pass (floorday3) is why this run pre-registers mechanism-engagement checks alongside the outcome primaries — an outcome primary on an unengaged mechanism is uninformative. The lift discriminates by construction (G1/G9b/G14 pin it), but the sweep must show it engaging at volume, not just at the fixture level.

## Proof results (run BEFORE any sims)

scripts/test-trig6-20261017.js — RED (TRIG6 unset) + GREEN (TRIG6=1), one process per phase. PROOF GREEN, all checks passed (independently re-runnable; re-run green on 3 seed-shifts: 0, 100, 200):
- R1 gate-off byte-identical: trig6lead == leadfeast and trig6belong == belongfeast per-day hashes, 40d × 2 seeds, IDENTICAL.
- R2: no trig6 verb fires gate-off on the fd-6.5 overstock fixture; the parent's own tend discipline still fires (pantry 156000→154500).
- R3 (NAIVE RED foil): Game._removePantryKcal on a 3-stack fixture drains the +30d stack first — documents the failure mode and proves the G13 fixture discriminates.
- G1 trigger discrimination: aid HELD at fd 5.2, FIRES at fd 6.5 and 7.1 — the lift is the dial.
- G2 AID: 1,500 kcal tended fresh-first (sub pantry 1000→2500, trust 30→38), cause line AFTER the confirmed engine beat (tend@0 cause@1 — the honesty ordering is pinned), one verb/day.
- G3 thinness gate: non-thin subordinate (200k ≥ 5d of need) refused — no cause line, no layer draw; the parent keeps its own rhythm (tendedWeek marked).
- G4 mourning: mourning link refused, no cause line.
- G5/G6/G7: lingerer / recent-raid / gorge-night fixtures all hold verbs off; holds counted (t6GateHeld).
- G8: pre-draw rollback restores the pantry exactly on refusal.
- G9 FEAST: fires at fd 6.5 when no aid channel (r13 gates, lifted trigger, cause narrated); G9b: HELD at fd 5.2, pantry untouched.
- G10 tribute-untouched negative: no t6Tribute counter, no early-tribute cause line; the aid tends the thin link, the owed link left to base-discipline timing.
- G11 priority: aid > feast in both call orders (dusk-upkeep-before-daily and reverse); feast yields to an existing aid channel.
- G12 armed determinism: 40d × 2 byte-identical.
- G13/G13b fresh-first: aid and feast both eat the +2d stack first (+30d untouched); pantry drained exactly once.
- G14 mechanism instrument: fd 6.5 counts as both fd6 and fd4 day; fd 5.2 counts as fd4 only — the lift discriminates.

## Sweep results

32 runs, identical seeds, det-gate green both sides before trusting comparisons (r27), SMOKE=1 green. Seeds 4101-4108 verified against the banned list (no hits).

| metric | control | armed | pre-reg |
|---|---|---|---|
| starvation deaths (**PRIMARY**, absolute) | 1 | 0 | **PASS** (0 ≤ 1) |
| starvation per villager-day | 0.000052 | 0.000000 | **PASS** (≤ 1.15×) |
| fresh-rot kcal (**CO-PRIMARY**, absolute) | 6,347k | 8,628k | **FAIL** (1.36×, need ≤ 0.75×) |
| fresh-rot per villager-day | 330 | 434 | FAIL (1.31×) |
| national | 12/16 | 12/16 | ✓ (≥ 10) |
| median survival | 152.0d | 178.5d | **FAIL as written** (+26.5d — longer, not harm; see metric review) |
| table | 15/16 | 16/16 | ✓ (≥ 13) |
| wave-4 / wave-5 | 0/16 / 0/16 | 0/16 / 0/16 | — (readiness-gated shut, both sides) |
| wins | 0/16 | 0/16 | ✓ (pre-seat) |
| exiled | 0/16 | 0/16 | ✓ |
| dehydration | 3 | 2 | ✓ (≤ 4) |
| arc2 / arc3 / arc4 | 16/16 / 16/16 / 15/16 | 16/16 / 16/16 / 16/16 | — |
| four-realm | 0/16 | 0/16 | — |
| half-ration rate | 0.3686/d | 0.3229/d | (heterogeneity lens) |
| drawdown verbs (aid / feasts) | 0 / 0 | 69 / 100 | mechanism (a) |
| drawdown volume | 0 | 337k kcal | 3.9% of armed rot |
| siege-gate holds | 0 | 419 | counted, not narrated |
| fd>6 days / fd>4 days | — | 1840 / 1968 | mechanism (b) |
| verb-days | 0 | 169 | mechanism (c): 169 ≤ 0.9×1968 ✓ |

Paired starvation deltas (armed−control): +0 on 15 pairs, −1 on belongfeast/s4105. Max paired delta: 0 (≤ +3 ✓).

Death-cause shares — control: combat 496, villager combat 152, monster 77, expedition 20, contest 16, dehydration 3, lockjaw 3, sickness 3, starvation 1, ... — armed: combat 496, villager combat 133, monster 83, expedition 15, contest 8, sickness 6, dehydration 2, lockjaw 2, the night 1, ... No starvation on armed. The single NIGHT-OVER death (armed belongfeast/s4102, day-45 village collapse) is noise, not a lever-introduced mode — the layer's verbs cannot cause overnight deaths, and the run was already collapsing (see guardrail note).

**Verdict: NO-GO — KILLED** (co-primary miss: 1.36× vs the ≤0.75× bar). The mechanism ENGAGED (169 verbs, 1840 fd>6 days, discrimination proven) — this is a real NO-GO on an engaged mechanism, not a vacuous kill. Per the kill protocol the layer file is deleted zero-trace; instruments (proof, sweep, det-gate, per-seed JSONs, beats) and this evidence are kept.

## Why the rot went the wrong way (the actual finding — root-cause level)

The drawdown volume (337k kcal across 16 runs: 69 aids × 1500 + 100 feasts) is **3.9% of the armed rot** and **14.8% of the rot delta**. The drawdown cannot explain the delta — the delta comes from trajectory divergence, and the divergence points one way: **the layer makes villages richer, and richer villages rot more**.

Per-pair verbs vs rot-delta (armed−control), sorted:
- 2–10 verbs: deltas −355k, −275k, −35k, −22k, −4k, +28k, +92k (mixed, mostly negative)
- 13–27 verbs: deltas +185k, +202k, +214k, +279k, +302k, +305k, +311k, +455k, +591k (all positive)

The more the layer engages, the more the armed twin rots relative to its control. The channels:
1. **Feast buffs → income.** The layer's feasts (100 across the sweep) stack on the r13's own feasts, each granting the FEASTED buff (×2.53 strikes/abilities until dawn). More buffs → more successful food acquisition → bigger pantry → more rot.
2. **Aid → politics → tribute.** The aid verb (69, lead road only) builds trust with subordinates; stronger links pay more tribute → bigger pantry → more rot. (Belongfeast/s4101: 7 feasts, 0 aids, +591k — the feast channel alone suffices.)
3. **Longer survival → more rot-days.** Armed median +26.5d. But per-vday rot is ALSO up (434 vs 330), so it's not just longevity — the armed pantries are richer per day.

The lever is "rich get richer": it engages most on the most overstocked villages, and its side-effects (buffs, tribute) grow the pantry faster than the drawdown drains it. **You cannot drain a pantry that the lever itself keeps filling.**

Consequence for the drawdown line: the overdraw3 precedent (0.517×) is not replicable here — its drawdown included the tribute verb (much larger volume) and its substrate lacked the r13 feast (no buff-stacking). A future drawdown lever must either (a) decouple the drain from village-enriching side-effects (a verb that drains without buffs or politics), or (b) trigger on the FLOW (income rate) rather than the STOCK (pantry size), or (c) measure the prize as rot-per-pantry-kcal (waste rate), not absolute rot.

## Wall numbers (every run)

| side | national | table | wins | w4 | w5 | median | max |
|---|---|---|---|---|---|---|---|
| control | 12/16 | 15/16 | 0/16 | 0/16 | 0/16 | 152.0d | 182d |
| armed | 12/16 | 16/16 | 0/16 | 0/16 | 0/16 | 178.5d | 182d |

Exiled: 0 everywhere. Wave 4/5: 0/16 both sides — the readiness gate holds wave 4 shut on the pre-seat courtship substrate (see the sim-arming/sim-trickmatter findings). The scale wall is untouched by this arm (as expected — the lever is food-economy, not scale).

## Village assessment (plain words)

Thirty-two villages, sixteen of them twinned. The armed twins live longer (median 178.5 vs 152 days), starve less (0 vs 1), and reach the table slightly more (16 vs 15) — but they rot more (8.6M vs 6.3M kcal) because they're richer. The drawdown beats read as people deciding: the aid cause lines name the subordinate and the honest fresh-day count ("Haven's shelves hold ~129 days of fresh — more than the village eats before it turns. The surplus goes to Emberhold's fire, not the rot"), and the counts move honestly as pantries change (129→167→110→117). The feast beats carry the televised presentation, the named villagers eating, and the consequence — "The cookfire's smell carried further than the laughter did — smoke and grease on the night wind. The Moderator is circling the edge of the light. It followed the feast." The feast has a cost; the village knows it. Nothing reads robotic. But the prize — less rot — went backwards, because the village the lever built was too successful to need draining.

## Sense-testing (SENSE-TESTING LAW — read, not counted)

Leadfeast-armed s4101 (182d, 4 aids, 6 feasts): the aid beats (days 28/35/56/63) read as surplus management with honest declining counts; the day-81 feast (fd ~9) shows the full consequence chain — televised feast, FEASTED buff, the Moderator attracted by the smell, then the layer's cause line. **PASS** — the verbs read as meaningful decisions with visible consequences.

One narration finding filed (not chased): the ambient line "Someone's been leaving food out. Good food. Don't ask me how I know it wasn't one of us." fires byte-identical across 8 speakers (days 63–174) — same repetition class as the peoplefood-b feast-prose finding. Filed in sim-findings.md.

## Blanks filled / documented

- **FILLED (finding)**: the lifted trigger discriminates as designed (G1/G9b/G14 pin it; sweep: 169 verb-days vs 1968 fd>4-days, 91% fewer). The trigger form of the #200 named next is answered: lifting the trigger does not reproduce the overdraw4 starvation harm (0 vs 1 starvation), but it also does not cut rot — the drawdown volume is too small and its side-effects enrich.
- **FILLED (finding)**: the "rich get richer" dynamic — drawdown levers with village-enriching side-effects (feast buffs, aid→tribute) grow the pantry faster than they drain it. Future drawdown work must decouple the drain from enrichment, or measure waste-rate not absolute rot.
- **DOCUMENTED (metric review)**: the co-primary (absolute rot ≤ 0.75×) is confounded by trajectory divergence — the lever's signal (337k drained) is swamped by its noise (±591k per-pair rot swings from enriched trajectories). Proposed for the next run: pre-register rot-per-pantry-kcal or a pantry-size-controlled comparison, not absolute rot.
- **DOCUMENTED (brief correction)**: the task brief's "wins 0=0" and telemetry expectation (wins 16→0 LOUD) confirmed — the LOUD is the pre-seat substrate by design, investigated and cleared.

## Metric review (§14)

- The co-primary (armed ≤ 0.75× control on absolute fresh-rot) missed at 1.36×. Per §14 this is NO-GO, not re-scored. The metric was miscalibrated for this lever: it was set from the overdraw3 precedent (0.517×), but overdraw3's drawdown included the tribute verb (order-of-magnitude larger volume) and ran without the r13 feast substrate (no buff-stacking). A 0.75× bar requires removing 25%+ of the rot; this lever's maximum theoretical drawdown (~80k: 13 feasts × 5k + aids) is <15% of typical rot on overstock-mountain villages. The bar was unachievable by construction.
- The median guardrail ("within 10d") fired at +26.5d on longer survival. The #223 precedent (guardrail firing on trajectory perturbation, not harm) applies: the movement is away from harm (villages live longer, starve less). The guardrail as written is symmetric; a future revision should make it one-sided (fire only on shorter survival) or harm-anchored. Proposed for the next run, not this one.
- The "no new death mode" guardrail: 1 NIGHT-OVER death on armed (vs 0 control) is a single event on a day-45 collapse, not a pattern. Judged noise; the layer's verbs have no overnight-death channel. Documented, not re-scored.
- Metric lesson (carrying forward the floorday3 lesson): pre-register mechanism-engagement checks AND a volume-sanity check (max theoretical drawdown vs the prize's required delta) for any future drawdown arm. An unachievable bar wastes a sweep.

## Convergence state

**killed** (NO-GO on the engaged co-primary — the rot prize went backwards). The food-economy axis is not converged; the #200 line now redirects from trigger-form drawdown to decoupled-drain designs (drain without enrichment) or waste-rate metrics. The starvation harm that killed overdraw4 did NOT reproduce (0 vs 1) — the trigger lift is safe, just not useful for rot.
