# SIM-PACKBANK — pack-banking policy instrument (ARM 3, food economy)

Date: 2026-10-14 · Loop: oversight-flesh-out-loop-b · Worker tree: sim-packbank
Run id: oversight-flesh-out-loop-b-2026-10-14-0629-cdt · Axis: food economy (scale-wall lens)
Claims: sim-findings item #161 (BATCH-PATH POLICY GAP: the batchpolicy arm built
the pressing instrument and measured DIAGNOSTIC-NEGATIVE — the competent pack
never holds a batch-able pool; "the missing instrument is a pack-banking
policy, not a pressing one").
Canon: docs/CANON.md, docs/PRESERVATION.md (the ladder). No canon doc covers
the batch UI verb specifically — eligibility is the button's own filter
(app.js fire panel), stated rather than invented.

## Pre-registration (MEASUREMENT.md §§9-12, 14 — binding)

- **Road:** 8 seeds (11/22/33/44/55/66/77/88) x leadcourt/belongseek, 180d
  death-aware, identical seeds control vs armed. Control: PACKBANK unset
  (wrapper passthrough).
- **Det-gate:** bit-identical rerun gate before trusting comparisons.
- **PRIMARY (mechanism):** batch-eligible raw items present at the daily hook
  on >= 50% of measured days AND batch cooks firing >= 1/week on average
  (armed; control is 0/120 by the batchpolicy finding — reproduce that on
  the control as the RED baseline).
- **GUARDRAILS:** median survival >= control-10d (report-only); starvation
  deaths report; banked-raw rot kcal reported honestly (if the bank wastes
  more than it cooks, that IS the finding).
- **SECONDARY:** batch-cooked kcal outflow, cook efficiency vs per-item,
  pack-bank size distribution.
- **GO** on primary + guardrails, else **KILL** per §14. If the mechanism is
  real but neutral on survival, that is a GO for the instrument (diagnostic
  arm — say so; do not claim a wall lever).

## The instrument (scripts/policies/packbank.js)

Default-OFF env gate (PACKBANK=1); chains base policies (leadcourt,
belongseek) — never clobbers (sim-findings #119). The scholar keeps a
raw-food bank in the pack, held from the FIELD (never pre-filled from the
pantry — the takedisc PANTRY-PACK CROWDING finding):

- **bankTag** (competent.daily right after cleanCatch, before donateHaul;
  catch-all at upkeep-start): tags batch-eligible arrivals (the button's own
  filter, via batchcook's exported `batchEligible`) — whole pieces only
  (Steve's no-fractionating rule), sturdiest first (spoilDay-descending),
  surplus only (the competentEat 0.85 well-fed gate: a hungry scholar eats
  first, banks later), up to PACKBANK_KCAL=1500 ("one batch worth": ~2-4
  typical hauls — Steve 2026-10-07: make the call, document it).
- **Guards** (one-liners in competent.js, inert without the flag): cookPack
  skips tagged items; donateHaul spares the tagged reserve.
- **pressStep** (wrapper daily-start, before base daily): banked-rot
  accounting (counted once, then the overnight sweepSpoiled discards
  honestly); release valves (soon-turning set-aside freed below threshold;
  full-but-unpressable bank released aloud after 2 days); the press fires
  when bankKcal >= 1500 AND pool >= 2 AND fire present, through the honest
  Game.cookAll verb.
- **Pressing vs batchcook.wrapBatch:** wrapBatch's >=2-every-daily press is
  NOT engaged (BATCHCOOK unset) — it would double-fire against the
  bank-threshold rule. The press reuses batchcook's exported primitives
  (batchEligible, fireHere): same filter, same gate, same verb, same
  telemetry. batchcook.js imported verbatim from the batchpolicy arm
  (commit b6e951c0) — composition, not clobbering.

Honest costs, instrumented: banked raw keeps its spoilDay (can rot — the
strategy's real risk); cooking costs its ticks; knowledge-gating still
applies; the bank is eaten most-perishable-first like everything else
(the honest eat-drain: a tagged reserve lasts only while the scholar
stays fed).

## Measured-reality adaptation (stated, not hidden)

On current master the brief's premise — "raw food arrives and cookPack cooks
it per-item same-day" — does not hold: Game.cookFood fires 0x over 80
measured leadcourt days; cookPack's filter (`foodState==='raw'`) matches
nothing the per-item path can even cook ("Nothing to cook there"); foraged
plants arrive `foodState:'ready'`; wild plants carry no rawKcal; the pack's
only batch-eligible field flow is cleaned meat from cleanCatch (rare). The
layer banks what actually arrives instead of what the brief assumed. If the
flow is too thin for the primary, that is the measurement — the pilot kills
the layer per §14 and the finding refines #161 (it's flow absence, not
cooking timing).

## Proof (REAL red/green) — scripts/test-packbank-20261014.js, 31/31

| phase | result |
|---|---|
| RED (PACKBANK unset): no tagging, no press, base chained, hook sampling only | PASS x4 |
| RED: gate-off byte-identical trajectories, leadcourt vs packbankLead, 2 seeds x 30d | PASS x2 |
| GREEN: bankTag tags up to cap, whole pieces, breaching piece skipped | PASS x3 |
| GREEN: hungry scholar banks nothing (surplus-only gate) | PASS x1 |
| GREEN: cookPack guard wiring (stubbed cookFood: 0 calls tagged, 1 untagged) | PASS x2 |
| GREEN: press fires exactly at threshold (1500 boundary), not below; converts; tags cleared; batch kcal counted | PASS x6 |
| GREEN: banked rot counted once; release valve; stall release | PASS x5 |
| GREEN: real-daily integration — hook-3 tags, donateHaul spares | PASS x2 |
| SENSE: "Setting aside 3 for the batch pot (1300 kcal held raw) — the fragile stuff cooks tonight."; press: "Cooked 2 over the fire. (16 ticks)" | PASS x3 |

## Pilot results — PRIMARY MISSED → KILLED per §14

Control (before, PACKBANK unset), 16/16 complete: cookAllCalls = **0/16** —
reproduces the batchpolicy RED (#161) on current master. Batch-eligible pool
at the daily hook: **0/1898 hook-days** (poolShare 0.000). cleanedArrivals:
97 (the only batch-eligible field flow). Wall: national 10/16, table 0/16,
wins 0/16, wave4 7/16, wave5 1/16, exiled 0/16; median 109d leadcourt /
148d belongseek; starvation deaths 20.

Armed (PACKBANK=1), 16/16 complete: bankTagged = **1** (a single item, one
run); poolShare **0.000**; batch presses **0** (0.00/week); batchKcal 0;
bankRotKcal 0. Per-seed days **identical** to control (no diffs); wall
numbers identical to the digit (national 10/16, table 0, won 0).

**Primary: 0.000 >= 0.50? NO. 0.00/week >= 1/week? NO. → NO-GO per §14.
The layer is KILLED at pilot.** Guardrails moot (no mechanism delta to
guard); median survival identical; starvation deaths 10/10 both sides.

### WHY the bank never fills (the filled blank — measured, not theorized)

Flow diagnostic (scripts/diag-packbank-flow-20261014.js, leadcourt seed 88,
30 cleaned arrivals): arrivals 30, well-fed-gate blocked 0, spoil-skipped 0,
**tagged 0**, max single-day arrivals 3.

1. **cleanCatch cleans in the prep stash, not the pack.** The kitchen-counter
   flow (food r6 2026-10-12) pools carcasses to the counter; `cleanCarcass`
   runs on the stash container. The cleaned meat never enters the scholar's
   inventory — bankTag scans the pack, so there is nothing to tag.
2. **The engine routes batch-eligible food away from the pack by design.**
   `isUnprocessed()` (food.js) classifies cleaned meat, carcasses,
   needsCooking items, and in-shell nuts as counter-bound — "belongs on the
   counter, not in the pantry." The village food economy processes raw at
   the counter/stash/pantry level; the pack carries finished food.
3. **What little reaches the pack is consumed same-day.** Above the 2400
   donate buffer it goes to the pantry (donateHaul); below it, the
   most-perishable-first `Game.eat()` takes it when the scholar is hungry
   (the honest eat-drain — measured live in the proof integration test).
4. **cookPack is a dead path**, not the blocker: Game.cookFood fires 0x over
   80 measured days; cookPack's filter (`foodState==='raw'`) matches nothing
   the per-item path can cook ("Nothing to cook there").

**Refinement of #161:** the batchpolicy arm's "cookPack cooks raw same-day"
was inference, and it was wrong. The batch channel isn't blocked by cooking
timing — it's blocked by **flow routing**: the batch verb (`Game.cookAll`)
reads only `state.scholar.inventory`, and the game's own logistics never put
batch-eligible food there. No policy-side banking can bank a flow that never
enters the pack. The missing piece isn't a banking policy either — it's a
design question (steve-call, filed below): should the batch verb see the
counter/stash, or is the pack "Cook N raw" button decorative in honest play?

The instrument itself works (31/31 proof, incl. real-daily integration);
the well is dry. Per kill protocol the layer is deleted; proof + sweep +
evidence retained, with graceful degradation on the missing module.

## Metric review

- Primary (mechanism): MISSED on both conjuncts (0.000 pool share,
  0.00 presses/week). NO-GO per §14 — not re-scored. The layer is killed.
- The GO bar was honest: a diagnostic arm's bar must be reachable by a
  working mechanism, and the measurement shows no mechanism can engage —
  the flow doesn't exist. A friendlier metric (e.g. "tags > 0") would have
  passed on the single tag and hidden the structural finding.
- Guardrail note: with zero mechanism delta, "median >= control-10d" is
  trivially met (identical). No rot was ever banked, so the honest-risk
  instrumentation is untested in the wild — stated, not hidden.
- Metric-review for the NEXT run: any future batch-channel arm must
  pre-measure the pack inflow of batch-eligible food (the `cleanedArrivals`
  counter in the sweep is the instrument) BEFORE building pressing/banking
  machinery. The batchpolicy arm measured the pool; this arm measured the
  flow; both were ~zero.

## Convergence report

- Arm killed at pilot. Mechanism (banking) proven on fixtures but
  unmeasurable in honest sims — the batch channel has no pack inflow.
- Food-economy axis: the batch path is now measured dead at two levels
  (press: #161; bank: this arm). The axis itself is NOT converged — the
  finding redirects it: the batch verb's pack-only scope vs the
  counter-routed food economy is the live question (steve-call below).

## Village assessment

Thirty-two runs, one village each: they court, feast, fight waves 1–4
(7/16 reach wave 4, 1/16 wave 5), link villages to national (10/16), and die
— median 109–148 days, starvation the leading scholar-killer (20 deaths),
no tables, no wins. The bank changed literally nothing (per-seed identical
trajectories): on this road the pack-raw channel is not a food-economy lever
because it is not a channel at all. The villages that thrived did it on
'ready' forage, pantry staples, and the duty drive — the systems that
actually move calories. The blank filled: we now know exactly where raw
food goes (counter → stash → pantry → drive), and the batch button watches
it all from the pack, empty-handed.
