# SIM-DRAWCAP — drawdown volume cap on the overdraw4 vehicle (loop B, food-economy)

Date: 2026-10-17 · Loop: oversight-flesh-out-loop-b · Worker tree: sim-drawcap-b
Axis: food-economy (scale-wall lens) — sim-findings #422 named next (cap form).

## Pre-registration (docs/MEASUREMENT.md §§9-12, 14 — binding, written BEFORE sims)

- **Question**: sim-overdraw4 (2026-10-14) PROVED the fresh-first rot mechanism but was
  KILLED on the STARVATION guardrail (3→7). sim-floorday3 (2026-10-16) proved the
  2-day/3-day drawdown FLOOR vacuous — the engine's own feast cost formula
  (max(1500, 400×(n+1)) ≤ 0.2×burn) can never approach it — and sharpened the
  suspect: the TRIGGER (fd > 4) and the UNCAPPED COMBINED OUTFLOW (layer aid +
  feast + base feastscale feasts + parent weekly tends) on thin-overstock
  pantries. THIS arm tests the cap variant: the overdraw4 vehicle rebuilt
  verb-verbatim (aid + feast, fresh-first pre-draw, siege gate, no tribute,
  NO floor — the floor is dead) with a CAP: when fresh-days < 6 at
  verb-planning time, the day's total LAYER drawdown outflow (aid kcal + feast
  cost) is capped at 1× villageDayBurn (roster pop × 2000), aid-first within
  the cap. Does the cap cut rot without reproducing the belong-road harm?
- **Lever**: scripts/policies/drawcap.js (DRAWCAP=1, default OFF; wraps
  leadfeast→drawcaplead, belongfeast→drawcapbelong). Overstock trigger pantry
  fresh-days > 4. Siege-gate clear (no lingerer/gorge threat/raid in trailing
  7d; osGateHeld counted). Verb planning: (1) AID — tend a THIN subordinate
  link (tendLink 1,500 kcal; thin = sub pantry < 5 days of sub need; skip if
  tended this week or mourning); (2) FEAST — hostFeast under the r13 allowance
  gates (dusk, at haven, one-feast/day, 7d/14d cadence, recentGives(7) +
  tribute/tend paid(7) ≥ 1500, plan.ok, 1.5× affordability, fusion-reactor
  ceiling — candidate conventions mirrored from allowgate2.js/feastscale.js).
  NO tribute verb (tribute runs on the base discipline's timing; the layer
  never calls payTribute — static + behavioral negative in proof). NO floor.
  Fresh-first ordering: aid drains via the fresh-first pre-draw (preDraw +
  answer the engine's _removePantryKcal from already-drawn food; rollback on
  tend refusal); feast drains natively fresh-first. THE CAP: at each verb's
  planning, if fresh-days < 6, the day's layer outflow is budgeted against
  1×pop×2000 — aid first (1500 ≤ cap), then feast only if aidKcalToday +
  plan.cost ≤ cap; a feast the cap refuses is cap-held (osCapHeld counted, NO
  cause line). On free-days (fd ≥ 6) the vehicle rule holds: one drawdown verb
  per day, aid priority. Cause lines follow CONFIRMED verbs only (new narration
  copy — [needs-eyes]); pre-checked refusals and cap-holds get NO cause line
  (counted in the instrument, never narrated as action). Policy-side only,
  zero src/js changes.
- **SUBSTRATE**: FEASTSCALE_R13=1 both sides; SEATDRIVE=0 EXPLICIT (unset now
  means driver ON). Base courtship policies only (leadfeast/belongfeast).
  180d death-aware; dead villages stop (+10d tail max). Assert env up front;
  SWEEP STOPS on mismatch.
- **SEEDS**: 8 FRESH seeds 4101-4108 × {leadfeast, belongfeast} × {control,
  armed} = 32 runs, IDENTICAL seeds both sides. Verified 4101-4108 against the
  coordinator's banned list (none of [982-989],[3101-3108],[3301-3308],
  [3201-3208],[171,282,393,504,615,726,837,948],[931-938],[111-888],
  [121,232,343,454,565,676,787,898],[131,242,353,464,575,686,797,908],
  [151,262,373,484,595,706,817,928],[163,274,385,496,607,718,829,940],
  [1701..1708],[205,246,321,412,523,634,745,856],[307,418,529,640,751,862,973,84],
  [917,928,939,104,215,326,437,548],[141,252,363,474],[101,202,303,404,606,707,808,909],
  [137,248,359,470,581,692,803,914],[11-88],[1201-1208],[991-998],[4201-4208],
  [5101-5108],[201-208]) — the sweep asserts this and STOPS on any hit.
- **PRIMARY** (the killed harm): starvation deaths (absolute), armed ≤
  control. Also per-day-alive rate armed ≤ control × 1.15.
- **CO-PRIMARY** (the lever's prize): fresh-rot kcal, armed ≤ 0.75× control.
- **GO** = both gates (every-gate rule). A miss is NO-GO, never re-scored
  mid-run; metric doubts go under "metric review".
- **MECHANISM-ENGAGEMENT CHECKS** (vacuous-pass protection): (a) layer drawdown
  verbs fire ≥ 20 combined armed-side; (b) the cap BINDS on ≥ 8 candidate-days
  (osCapHeld ≥ 8). If the mechanism never engages, the run is a KILL
  (invisible effect), not a GO.
- **GUARDRAILS**: national ≥ control−2; median survival within 10d of control;
  no new death mode; table ≥ control−2; dehydration ≤ control+1; wins 0=0 both
  sides (pre-seat); exiled 0 both sides.
- **HETEROGENEITY LENS**: max per-seed starvation delta (armed−control) ≤ +3;
  report half-ration rate both sides.
- **Measure every run**: win rate, national reach, table arrival, Arc reach,
  wave reach 1–5, four-realm formation, median/max survival, death-cause shares.
- **Proof**: scripts/test-drawcap-20261017.js RED→GREEN before sims (fixtures:
  cap binds vs holds, fd 5.x cap-day vs fd 7.x free-day, aid priority,
  fresh-first ordering, rollback on tend refusal, tribute-untouched negative),
  re-run green on ≥3 seeds; det-gate byte-identical reruns; SMOKE=1 honesty
  gate. Convergence verdict at end: converging | converged | parked |
  killed-at-pilot.
- **Metric-review note (§14)**: the cap's 1×burn budget (pop×2000) vs the
  engine's own cost formula (feast ≤ 400×pop ≤ 0.2×burn; aid = 1500) means the
  cap may be structurally unable to bind on realistic rosters — the same class
  of vacuity sim-floorday3 proved for the floor. The proof's R9 fixture tests
  this BEFORE sims. If R9 shows vacuity, the sweep still runs (the layer's own
  rot/starvation numbers are the evidence), but (b) is expected to fail and the
  CAP — not the layer — is the kill candidate.

## Proof results

scripts/test-drawcap-20261017.js — RED→GREEN, PROOF GREEN (33/33 checks,
independently re-runnable; run BEFORE any sims):

- R0 (gate-off): DRAWCAP unset → byte-identical to leadfeast over 20d
  (n=20/20) — the layer changes nothing when off.
- R-naive (foil): a naive feast-only cap budget WRONGLY allows aid(1500) +
  feast(23000) against a 24000 cap; the real aid-first capAllows HOLDS it —
  the foil fails the priority fixture, the real one passes.
- G1: capAllows binds vs holds pure — aid+deep-feast HELD, aid+normal-feast
  FIRES, aid alone FIRES; villageDayBurnOf == pop×2000 exact.
- G2: fd 5.31 cap-day → cap branch EVALUATED (osCapDays 0→1); fd 7.52
  free-day → cap branch SKIPPED (osCapDays 0→0).
- G3: aid priority — thin link is the candidate, aid FIRES in daily, feast
  YIELDS on the aid-day (free-day one-verb rule), no cap-hold counted for
  the yield.
- G4: fresh-first ordering — pre-draw takes soonest-spoiling lots first
  (drawn=[soon,mid], taken=1500; finding #199).
- G5: rollback on tend refusal — refused aid does not confirm; pantry
  byte-identical after rollback.
- G6: tribute-untouched — static (no payTribute call in the layer) +
  behavioral (0 payTribute calls across daily+upkeep with an owed-tribute
  link present).
- G7: thin check — fat sub (200k kcal, pop 10) NOT a candidate; thin sub IS;
  aid fires (osAidKcal=1500).
- G8: cap-hold path — over-cap feast HELD (candidacy null), osCapHeld
  counted, NO cause line narrated (said +0); cap-fitting feast on the same
  day still fires.
- G9 (FINDING, not a failure): for every realistic roster pop 1..30,
  aid(1500) + max-formula feast (400×pop) fits inside 1×burn (2000×pop) —
  worst outflow/cap ratio 0.950 (pop=1). The cap CANNOT bind on
  engine-realistic costs: same vacuity class as the sim-floorday3 floor.
  Predicts the sweep's (b) engagement check will fail; the CAP — not the
  layer — is the kill candidate.
- DET-GATE: 3 seeds (4101/4102/4103) × 2 reps, DRAWCAP=1, 40d,
  byte-identical per-day hashes on rerun (r27 rule).
- SMOKE: id + _dcFeastEvents present when DRAWCAP=1; no layer state when
  unset (pure delegation).

check.js --quick (before sims): 96 passed, 1 failed in 437s — the 1 failure
is pre-existing (new files are not in the green list; nothing references
them). Noted, not chased.

## Sweep results

32 runs (8 fresh seeds 4101–4108 × {leadfeast, belongfeast} × {control, armed}),
180d death-aware, identical seeds both sides. Det-gate green (armed 40d
byte-identical reruns, 2 seeds) before trusting comparisons; SMOKE=1 green
both sides. Banned-seed assertion passed (4101–4108 not on the list).

| metric | control | armed | pre-reg |
|---|---|---|---|
| starvation deaths (**PRIMARY**, absolute) | 1 | 3 | **FAIL** (≤ 1) |
| starvation / 1000 villager-days | 0.05 | 0.16 | **FAIL** (≤ 0.0575) |
| fresh-rot kcal (**CO-PRIMARY**) | 6347k (330/vday) | 7562k (397/vday) | **FAIL** (≤ 4760k) |
| national | 12/16 | 13/16 | ✓ (≥ 10) |
| median survival | 152.0d | 145.5d | ✓ (within 10d) |
| table | 15/16 | 16/16 | ✓ (≥ 13) |
| wave-4 / wave-5 | 0/16 / 0/16 | 0/16 / 0/16 | — (readiness gate holds w4 shut on this substrate; see wallcensus-b) |
| wins | 0/16 | 0/16 | ✓ (pre-seat) |
| exiled | 0/16 | 0/16 | ✓ |
| dehydration deaths | 3 | 5 (3 dehydration + 2 thirst) | **FAIL** (≤ 4, marginal) |
| half-ration rate | 0.3686/day | 0.3439/day | — (heterogeneity lens) |
| layer verbs (armed) | — | 69 aid / 103 feasts (172) | engagement (a) ✓ (≥ 20) |
| siege-gate holds | — | 84 | — |
| cap-days evaluated | — | 23 | — |
| **cap-holds** | — | **0** | engagement (b) **FAIL** (≥ 8) |
| death modes | combat 496, villager combat 152, monster 77, ... | combat 574, villager combat 139, monster 79, ... | no new MECHANICAL mode (armed-only names are monster proper nouns: Static, the night, alien; thirst = dehydration-mode) |

Paired starvation deltas (armed−control): +3 on belongfeast/s4102, −1 on
belongfeast/s4105, +0 on all 14 other pairs. Max +3 (heterogeneity lens ✓,
boundary). Starvation concentrates on the belong road (3/3 armed starvations
there; lead road 0/0 both sides) — the same road-concentration as the
overdraw4 kill.

**Verdict: NO-GO — killed.** PRIMARY fails (3 > 1), CO-PRIMARY fails
(1.19×, prize was ≤ 0.75×), engagement (b) fails (0 cap-holds — the cap never
bound once in 32 runs, exactly as the proof's G9 predicted). Per the kill
protocol the layer file is deleted zero-trace; instruments (proof, sweep,
analyzer, det-gate, per-seed JSONs, beats) and this evidence are kept.

## Why the cap never binds (the finding — root-cause level, predicted by G9)

The cap (1× villageDayBurn = pop×2000, live when fd < 6) is structurally
vacuous given the engine's own cost formulas: aid is a fixed 1500 kcal and
feast cost is max(1500, 400×(n+1)) ≤ 400×pop ≤ 0.2×burn. Aid + max-formula
feast can never exceed 1×burn for any realistic roster (proof G9: worst
outflow/cap ratio 0.950 at pop=1, for pop 1..30). The sweep confirms:
23 cap-days evaluated, 0 holds. Same vacuity class as the sim-floorday3 floor —
a gate designed against a threat the engine's cost formula cannot produce.
(Sibling sim-drawvol-b's 2,500-kcal cap DID bind — 13 holds — because it was
set from the substrate's measured outflow distribution, not from 1×burn.)

## Why the prize missed (rot 1.19×, not ≤ 0.75×)

The layer's 103 feasts (235k kcal) + 69 aids (121k kcal) moved real volume,
but the rot reduction did not replicate: overdraw4's 0.517× was seed-set
fortune. On this seed set the pair deltas are mixed (−275k on s4107,
+592k on s4101) — trajectory noise on villages whose pantries swing to
100+ fresh-days either way. The drawdown volume is two orders of magnitude
smaller than the pantry swings it rides on. The honest read: on fresh seeds
the vehicle neither reliably cuts rot nor avoids the starvation elevation.

## Starvation census (the +3)

belongfeast armed s4102 (village lost d126): 3 starvation deaths in a village
hunger-fragile from day 1 (scholar STARVING beats from d1). The layer's 5
feasts (13.2k kcal) fired 3× on thin-overstock pantries — d31 fd 4.33→3.14,
d38 fd 4.19→2.99, d57 fd 4.77→3.18 — draining ~3k kcal each time the pantry
sat just above the trigger. The paired control (same seed) had 0 starvations
(died d123 of other causes). This is the floorday3-autopsy volume channel,
reproduced: the harm is not the floor (dead) nor the cap (vacuous) — it is
the drawdown VOLUME firing while fd hovers just above 4.

## Wall numbers (every run)

| side | national | table | wins | w4 | w5 | median | max |
|---|---|---|---|---|---|---|---|
| control | 12/16 | 15/16 | 0/16 | 0/16 | 0/16 | 152.0d | 182d |
| armed | 13/16 | 16/16 | 0/16 | 0/16 | 0/16 | 145.5d | 182d |

Exiled: 0 everywhere. Wave 4/5: 0/32 — the readiness gate holds wave 4 shut
on the pre-seat courtship substrate (see sim-wallcensus-b; the trick game is
measurable only via the companion-veteran channel per sim-arming). The scale
wall is untouched by this arm (as expected — the cap never engaged).

## Death-cause shares

control: combat 496, villager combat 152, monster 77, expedition 20,
contest 16, wound 4, dehydration 3, lockjaw 3, sickness 3, starvation 1, ...
armed: combat 574, villager combat 139, monster 79, expedition 16,
contest 13, sickness 7, starvation 3, dehydration 3, thirst 2, ...
No new mechanical death mode (armed-only labels are monster proper nouns or
the thirst/dehydration mode).

## Village assessment (plain words)

Sixteen villages, each living the same seed twice — once plain, once with
the drawdown layer. The layer is a busybody: 172 verbs across 16 runs, feasts
every week or two whenever the shelves look full, grain riding out to thin
subordinates on the lead road (69 aids — Emberhold and Stonebridge ate well).
The villages don't notice the cap; it never says no. What they notice is the
feasts arriving right when the pantry is at its thinnest-full — 4 days of
fresh, the trigger's edge — and each feast takes another 3,000 kcal off a
shelf that was already one bad week from hunger. On most seeds nothing
happens (the pantry recovers, the village lives or dies of teeth and claws).
On s4102 the village was already hungry and the feasts kept coming: three
villagers starved who didn't have to. The rot the layer was built to fight
doesn't move reliably — some villages rot less, some rot more, and the
difference is the weather of the seed, not the lever. The village that
thrived (leadfeast s4105, survived 182d) did it with 15 aids and 8 feasts and
never missed a meal — the layer is harmless when the pantry is deep, and
that is most of the time. The blank this run fills: the 1×burn cap is not a
dial — it cannot bind, and the volume channel it was meant to tame is still
the open question (sibling sim-drawvol-b's 2.5k cap is the live form of that
question, and it went GO).

## Metric review (§14)

- The PRIMARY and CO-PRIMARY both failed; per §14 they are not re-scored.
  The arm is NO-GO, not "close."
- The dehydration guardrail missed by 1 (5 vs bar 4; the 2 'thirst' deaths
  are the same dehydration mode under the engine's other label). Marginal;
  recorded as a miss, not re-scoped — the PRIMARY already kills the arm.
- The "no new death mode" check flagged monster proper nouns (Static, the
  night, alien). For future runs: the check should compare mechanical modes
  (starvation/dehydration/combat/sickness/...) not monster names — monster-
  name variance is expected across seeds. Proposed for the NEXT run's
  pre-reg, not this one.
- G9's vacuity prediction was confirmed exactly (0 holds). The pre-reg's
  (b) check did its job: it killed the cap instead of letting a vacuous
  0≤0 "pass" through.

## Convergence verdict

**killed-at-pilot** (sweep-stage kill, not pilot-stage: the layer engaged but
both binding gates failed and the cap never bound). The drawdown-volume
question stays open in its live form (sim-drawvol-b's 2.5k cap, GO and
landed); the 1×burn cap form is dead. The trigger (fd > 4) remains the prime
suspect for the volume harm — sibling sim-trig6-b (same vehicle, trigger
lifted to fd > 6) is the live test.

## Telemetry

node scripts/telemetry-check.js --baseline
…/hidden_files/telemetry-baselines/scale-wall.json --current
'evidence/2026-10-17/perseed-drawcap/*.json' --metrics national,table,wins,exiled:
- LOUD national 12→25, LOUD table 16→31: n-mismatch artifacts (baseline n=16,
  current n=32 files) — rates consistent (national 78% vs 75%, table 97% vs
  100%). Not real deviations.
- LOUD wins 16→0: real, expected by design — SEATDRIVE=0 (pre-seat
  substrate); the baseline was measured with the seat driver on.
- exiled 0=0: quiet.

## Sense reads (SENSE-TESTING LAW)

3 reads: (1) belongfeast-armed-s4102 (the +3 starvation village) — coherent:
hunger-fragile from day 1, Cole's hunger plea at the fire, the d111 feast,
the fusion-reactor choice; the layer's thin-pantry feasts read as the
village eating its seed corn. (2) leadfeast-armed-s4105 (aid-heavy, 15 aids)
— aid beats coherent; the Emberhold d26/d28 double-tend is a week-boundary
rollover (week=floor(day/7): d26→w3, d28→w4), not a bug; villagers teach
trick counters in dialogue (Boris on Paparazzo, Salvador on Inspiration) —
people acting like people. (3) Layer feast narration ("We eat the mountain
tonight, or it eats itself") — honest, varies the day-count; same static-
prose class as the already-filed feast-opener finding, not a new filing.
No new [open] findings filed (the week-boundary check was a false alarm).
