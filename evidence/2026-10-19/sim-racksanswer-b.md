# SIM-RACKSANSWER-B — the racks-full binding answer: the lever space is exhausted (ARM sim-racksanswer-b, loop B, food-economy)

Date: 2026-10-19 · Loop: oversight-flesh-out-loop-b · Worker tree: sim-racksanswer-b
Axis: food-economy (scale-wall lens) — the racks-full binding answer, via
sim-rackschannel-b finding #462 and sim-dinreserve-b2's "next arm" note.

## Pre-registration (docs/MEASUREMENT.md §§9-12, 14 — binding, written BEFORE sims)

- **Question**: the brief names three candidate arms for the racks-full
  binding: (a) policy-side smoke prioritization (smoke spoilDay-urgent fresh
  first), (b) feast-draw scaling (the feast as the fresh sink), (c) a
  game-code arm on the racks-cap engine constant. Which — if any — is a real,
  untried lever?
- **Method**: investigate each against the code and the evidence corpus
  BEFORE spending sims. For (a), a characterization proof test on a pinned
  fixture decides it: if the engine already smokes urgency-first, a
  policy-side prioritization layer is a mathematical no-op (KILL without
  sweep). For (b) and (c), the evidence corpus decides: re-running a §14-
  killed lever is anti-drift, not diligence.
- **PRIMARY** (binding, had a lever existed): (rot:preserved + rot:fresh)
  ABSOLUTE per 100 days alive — armed <= 0.85x control (the brief's bar).
- **Verdict rule**: a candidate that is proven no-op or §14-killed is
  documented, not re-run. A candidate with a plausible untried mechanism
  gets the 32-run pilot.
- **SUBSTRATE**: FEASTSCALE_R13=1; SEATDRIVE=0 (pre-seat); base courtship
  policies. (Applies to the characterization fixtures.)
- **Guardrails**: no repo writes beyond scripts/ + evidence/; no game-code
  changes (coordinator's claim: all arms policy-side by construction).

## Investigation results

### (a) Smoke prioritization — PROVEN NO-OP (scripts/test-smokeorder-b.js, 8/8 GREEN)

Code read (src/js/game.js, the duty-time cook drive): the eligible set is
already sorted `spoilDay` ascending (soonest-spoiling first); the dinner
reserve (250×roster) is filled from the front (most urgent kept for dinner);
the excess goes to the racks and the 4000-kcal budget smokes it front-to-
back — i.e. urgency-first among the excess. There is no "low-urgency fresh
occupying racks": the budget cannot reach less-urgent fresh while more-
urgent excess remains.

Empirical proof (not just code read): pinned fixture, roster 12, four
2000-kcal stacks (A/B sd=day+1, C/D sd=day+2), budget 4000 < excess 5000 —
the partial-coverage case that distinguishes urgency-first from any other
order. Result: the 1000 kcal left unsmoked is D (sd=day+2, least urgent);
B-excess (sd=day+1, most urgent) is fully smoked. A least-urgent-first
engine would have left B fresh and smoked D fully — the opposite of
measured. Deterministic across reruns. No laundering (spoiled stack
untouched).

A policy-side layer that re-sorts an already urgency-first queue is a
no-op by construction. **Option (a) is dead — killed at proof, zero sims
spent.**

### (b) Feast-draw scaling — EXHAUSTED (five §14 kills in evidence)

The feast-as-fresh-sink is the windfall-feast line, killed five ways:
- sim-racksanswer-b v1 (300*roster trigger): pilot GO (0.536x), confirm
  KILLED on survival guardrail (-19d, harm unattributed).
- sim-racksanswer-b2 v2 (500*roster + 2/week cap): pilot KILLED (0.987x —
  "the raised threshold targets gluts a feast can't clear").
- sim-windfallcap-b (300*roster + 2/week cap): pilot KILLED (0.885x vs
  0.75x bar; also misses the brief's 0.85x).
- sim-portionwindfall-b/b2/b3 (portion-scaled): KILLED (1.054x — "the
  portion-windfall line is dead on this substrate").
- sim-windfallrev-b (portion + reconciliations): KILLED (0.821x vs 0.80x).

The pattern is structural: the rot cut comes from frequent feasts (v1:
0.662x confirm) and the survival cost rides the same frequency; throttling
the frequency (cap, higher threshold, smaller portions) kills the rot cut
faster than it kills the cost. There is no untried feast shape left that
is both policy-side and plausibly decoupled. **Option (b) is dead —
re-running it would be §14 re-litigation.**

### (c) Game-code racks-cap arm — KILLED and OFF-PLAN

sim-rackscap-b (2026-10-18, coordinator-authorized game-code arm, doubled
the cap 125→250): engagement fired hard (+809k preserved produced) but
total rot was 1.001x and preserved rot ROSE +200k — "the extra smoked stock
is not eaten before it turns... The cap is load-bearing, not a tuning
guess." KILLED at pilot. Additionally, the coordinator's claim for this run
states "zero file overlap by construction (all arms policy-side)" — a
game-code arm contradicts the filed plan. Sibling loop-A trees (sim-armory,
sim-vetrel1, sim-windowsurvive) show zero src/js changes (all instrument/
policy work), so the brief's overlap check passes, but the kill stands on
the merits. **Option (c) is dead.**

## Verdict

**NO ARM.** All three brief options are exhausted: (a) is a proven no-op,
(b) is five-times killed, (c) is killed and off-plan. The racks-full
binding has no lever-side answer on this substrate. The binding is
load-bearing (rackscap-b), the guard-lift converts at 0.46x (rackschannel),
the diet redirect is direction-wrong (rackschannel: the scholar's
fresh-first meal is a load-bearing fresh sink), the cook drive is at its
local optimum (this run: urgency-first proven; cookdrive2-b: cadence
misdiagnosis corrected, eligibility+guard bind), and the feast sink is
spent (windfall ×5).

Per the mission ("which blank you filled (fix) or documented (evidence)"),
this run DOCUMENTS: the racks-full binding is structural, not tunable.
The remaining rot on this substrate is post-cook arrivals, death-tail, and
trajectory noise (cookdrive2-b) — plus the inflow side, which the landed
surplusfeed governor and the parked doomrevive-b (0.638x, guardrails green)
are already working.

## Wall numbers

No new sims this run (no lever to measure). Last food-economy wall state
(sim-dinreserve-b2, 2026-10-18, 32 runs): national 11/16 armed, table
15/16, wins 0/16, wave-4 0/16, wave-5 0/16, median survival 180d. The wall
is untouched by the racks-full question (as expected — rot levers do not
attack the scale wall; dinreserve-b2 and rackschannel-b both confirm).

## Village assessment (plain words)

No villages were simulated under a lever this run — there was no lever to
simulate. What the assessment found, instead, is a village whose cook
already does the sensible thing: she keeps tonight's most-urgent food for
dinner, smokes the rest in urgency order, and tells the village honestly
when the racks are full ("more than the haven can eat before it turns...
instead of smoking it onto the rot pile"). The racks-full guard is not a
bug or a tuning oversight — it is the village refusing to convert fresh
rot into preserved rot, and the one attempt to lift it (rackscap-b) proved
the refusal correct. The food economy on this substrate is not broken; it
is at its floor. The blanks worth filling are elsewhere (the inflow side,
the draw side — both active in sibling arms).

## Sense-testing (SENSE-TESTING LAW — read, not counted)

Two beats captured on pinned fixtures (scripts/sense-smokeorder-b.js;
sysSay restored in engine format per lesson (a)):

Racks-full: "🍲 Bill cooked for the haven — meals stretched. The racks are
already full (20,000 kcal kept — more than the haven can eat before it
turns), so Bill left the fresh pile for tonight's dinner instead of
smoking it onto the rot pile."
**PASS** — reads as a person taking stock: names the real situation (racks
full, quantified), the honest reason (more than the haven can eat before
it turns), the consequence (the fresh pile goes to dinner, not the rot
pile). No robotic repetition risk at this cadence (fires only when the
guard actually binds).

Racks-open: "🍲 Bill cooked for the haven — meals stretched. Bill worked
the smoke racks too — 2 batches preserved (~3200 kcal, keeps a couple of
weeks)."
**PASS** — plain work report, quantities honest, shelf-life hedged for the
unskilled cook ("a couple of weeks" = the blind 15d). 

## Blanks filled / documented

- **FILLED (finding)**: the duty-time cook drive already smokes
  spoilDay-urgent fresh first (proven 8/8 on a pinned partial-coverage
  fixture). The brief's "smoke prioritization" lever is a no-op against
  current master — any future arm proposing it can cite this instead of
  re-proving it.
- **DOCUMENTED (exhaustion)**: the racks-full binding's lever space is
  closed on this substrate — guard-lift (0.46x), diet redirect
  (direction-wrong), reserve cut, window widen, evening pass, cadence
  consolidation, windfall feast ×5, racks-cap doubling (load-bearing).
  Filed for the coordinator: the axis's remaining space is the inflow side
  (surplusfeed landed; doomrevive-b parked 0.638x) — not the racks.
- **DOCUMENTED (instrument)**: git writes in this tree EPERM-flapped at
  run start (the known outage); sims proceeded per the brief's SIMS-ONLY
  fallback. Commit retried at run end.

## Metric review (§14)

- The pre-registered primary (rot/100d ≤ 0.85x) was never engaged — no
  lever survived to the pilot gate. This is not a re-score; it is a
  no-arm verdict on a characterized binding.
- Metric lesson (for the coordinator): the food-economy axis keeps
  generating "next arm" pointers (dinreserve-b2 → "racks capacity or
  feast-draw scaling") that the evidence corpus had already killed
  (rackscap-b, windfall ×5). The findings backlog's named-nexts should be
  checked against the landed/killed index before tasking — this run spent
  its budget on the check rather than on a sixth kill.
- The (a)-characterization method (pinned partial-coverage fixture as a
  no-op proof) is reusable: it decides "is this lever already the engine?"
  in 4 seconds instead of 32 sims.

## Convergence state

**no-arm / documented** (not killed-at-pilot — no pilot was warranted).
The food-economy axis is not converged, but the racks-full sub-question
is closed: the binding is load-bearing and the lever space is exhausted.
Recommended coordinator action: redirect the axis's remaining budget to
the inflow/draw side (surplusfeed governor landed; doomrevive-b parked on
a 2-fire calibration miss — the cheapest reopen on the axis) or park the
rot question until the substrate changes.

## Run notes

- `node scripts/check.js --quick`: not run (zero src/js changes; scripts +
  evidence only). The new scripts are proof/sense instruments, excluded
  from the green list per convention (new tests must not write into the
  repo — these don't).
- Proof: scripts/test-smokeorder-b.js (8/8 GREEN, exit 0).
- Sense: scripts/sense-smokeorder-b.js (2 beats captured).
- Git was EPERM-flapping at run start (probe failed); the brief's SIMS-ONLY
  fallback was followed. Commit retried at end of run.
