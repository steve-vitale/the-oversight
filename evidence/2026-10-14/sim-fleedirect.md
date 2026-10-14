# longsim scale-wall r26 — DIRECTIONAL FLEE (flesh-out, 2026-10-14)

## PRE-REGISTRATION (docs/MEASUREMENT.md §§9–12, 14)
- **Axis:** scale-onramp (blocking; standing directive overrides rotation)
- **Question:** does judging the flee DESTINATION (toward haven/safety; refuse
  outward pushes into the unknown when hurt/hungry) fix the r1 failure —
  barrier-push extracting scholars but stranding them hurt and hungry on
  unknown nodes (median 69→28d, monster deaths 16→25, starvation 9→13)?
- **Primary metric:** median survival days, armed ≥ control + 7d
- **GO threshold:** armed median ≥ 116d (control median 109d + 7)
- **Guardrails:** national ≥ control−4 (perturbation-aware); starvation
  deaths ≤ control+2; no new death mode; combat-death share reported
- **Horizon:** 180d death-aware (dead villages stop; +10d tail max)
- **Seeds:** 11/22/33/44/55/66/77/88 × leadfeast, IDENTICAL seeds both sides
- **Policies:** leadfeast (FEASTSCALE_R13 unset = pure leadcourt delegation).
  CONTROL: FLEEDIRECT unset. ARMED: FLEEDIRECT=1. Same tree, env-var only.
- **A miss is NO-GO** — never re-scored against a friendlier metric mid-run.

## Canon check
READ docs/CANON.md FIRST, then docs/MONSTER-WAVES.md. Canon touched: none —
this is engagement/disengage JUDGMENT only (policy-side). No fight execution,
no damage math, no monster counters (villager counter-execution is the
sibling sim-learnfirst lane; race_guard honored).

## The lever (killed — deleted per protocol; spec preserved)
`scripts/policies/fleedirect.js` (DELETED) + a gated hook in competent.js
flee() (REVERTED, no trace): `fleeDecision(Game, p, ctx)` scored exits
(haven +10, havenward +4, lateral +1, away −2, known +2, monster-active −6)
and decided:
1. safe way home (haven/havenward, no monster) → push (`safe-home`)
2. known-safe ground (visited, no monster) → push (`known-safe`)
3. nothing safe left + scholar hurt (hp<50%) or hungry (kcal<35% cap) →
   HOLD — refuse the outward push into the unknown (`refuse-hurt[-hungry]`)
4. healthy+fed → least-bad push (`least-bad`); at haven node → always hold
   (`at-haven`). After a push: recover-and-return (reused r2's
   markRecover/recovering/recoverStep).

## Mechanism proof: scripts/test-fleedirect-20261014.js — RED→GREEN, 17/17
- RED: on pristine code the require throws — behavior assertions fail
  (mechanism absent). GREEN after: all pass.
- Unit: hurt+hungry + havenward exit monster-active → hold `refuse-hurt-hungry`;
  healthy+fed same node → push `least-bad`; hurt + safe havenward exit →
  push `safe-home` havenward; known-safe beats dangerous way home;
  at-haven → hold.
- E2E (fired harness path, real tb fights): hurt+hungry scholar at (4,6),
  havenward exit monster-active → 2 disengage judgments, 2 holds, 0 pushes;
  healthy scholar at (6,6) outmatched at fight start → `safe-home` push,
  havenward exit chosen.
- Gate-off: `fleeDirectOn()` false — legacy flee byte-identical.

## Gates (before any sweep spend)
- **det-gate 16/16 GREEN** (`scripts/det-gate-fleedirect-20261014.js`):
  8 seeds × control + 8 × armed, each run twice in-process, bit-identical.
  (Post the r26 detfix — contest seeding is deterministic on this tip.)
- **SMOKE GREEN**: policy.daily invoked (3.8 calls/day), 2430 policy-origin
  acts in 15 days, and with FLEEDIRECT=1 the layer fires through the fight
  path (fleeDirectChecks=2 in the scripted disengage).

## Pilot verdict: KILLED AT PILOT — primary miss
| | median days | national | table | wins | wave4 | wave5 | starve | combat share |
|---|---|---|---|---|---|---|---|---|
| control (gate off) | 109 | 6/8 | 0/8 | 0/8 | 6/8 | 1/8 | 9 | 0.781 |
| armed (FLEEDIRECT=1) | 100 | 5/8 | 0/8 | 0/8 | 5/8 | 0/8 | 10 | 0.670 |
| GO threshold | ≥116 | ≥2 | — | — | — | — | ≤11 | report |

Per-seed days (control → armed): s11 86→151 (+65), s22 151→131 (−20),
s33 37→149 (+112), s44 179→86 (−93), s55 109→100 (−9), s66 178→61 (−117),
s77 88→60 (−28), s88 80→88 (+8). Median 109→100: **MISS by 16d**.
Guardrails: national 5/8 ≥ 2 ✓; starvation 10 ≤ 11 ✓; combat share 0.78→0.67
(reported); death modes: armed adds 1-count `alien`, `dehydration`,
`thirst`, `expedition` (control had 1-count `lockjaw`) — all pre-existing
engine causes at noise level, no mechanism behind them; not a new mode.

**Why (honest diagnosis):** the pilot did not test the headline feature.
Armed telemetry over 8 runs: 141 disengage judgments → **118 holds, ALL
`at-haven`**; 3 pushes (all `safe-home`); 20 edge-walks. The wilderness
refusal (`refuse-*`) fired **zero times** — leadfeast's disengages happen
at the haven node, not in the wilderness. What the pilot actually measured
was the at-haven hold: legacy flee walks to the edge and eats free hits
(the walk never exits vs chasers); the hold keeps striking instead. That
hold is high-variance coin-flippy: s33 +112d and s11 +65d (the scholar won
the haven fight), s66 −117d and s44 −93d (the scholar died standing —
s66's armed run never reached the wave-5 its control twin saw). Combat
deaths fell 66→43 but the two long runs collapsed early, and the median
moved −9d. A miss is a miss.

## Metric review (§14)
The metric (median +7d) was the right one for the r1 failure it targeted —
stranded-starvation deaths. The run is NO-GO on its own terms; no re-score.
Lesson for the metric, not this run: the refusal mechanism needs a policy
that actually disengages in the wilderness to be measurable — leadfeast is
haven-bound, so the layer's core judgment never fired. A future arm pairs
the refusal spec (preserved in the proof test) with a ranging policy, or
forces wilderness disengages. Separately, the at-haven hold accidentally
measured fight-back-vs-flee at haven (high variance, median −9d) — a data
point for sim-findings #88's open forced-flee-vs-fight-back question.

## Village assessment (control side — the honest baseline on current tip)
The wall has MOVED since r1 (2026-10-13): control national is **6/8**
(was 0/8), wave-4 6/8, one wave-5 sighting (s66, 178d). The tip's landings
since r1 changed the game more than any lever. Still: table 0/8, wins 0/8,
maxArc 3 — villages reach national and stall.
- **s66 (control)** thrived longest: 178d, wave 5, national — then bled out
  (monster 3, combat 5). **s44 (control)** 179d, national, wave 4 — combat-led
  end (12 combat deaths). **s33 (control)** collapsed day 37: combat 7,
  sickness 4, starvation 5 — the early-collapse shape.
- **Who dies and why:** scholars still die in tb fights (combat 66/114 deaths,
  share 0.78); villagers die in field fights (villager combat 5, monster 18).
  Starvation is no longer the story (9/114) — the tribute-spiral fix held.
- **Missing capabilities:** no policy judges WHERE a wilderness flee leads
  (the refusal spec exists, proven 17/17, but never fires under a haven-bound
  policy — needs a ranging policy to matter); scholars that hold at haven
  still die standing when the fight is truly lost (no sanctuary semantics —
  cf. sim-findings #87).
- **Blanks filled:** (1) the directional-flee destination judgment as a
  proven, self-contained spec (refuse-hurt-hungry logic, safe-home/
  known-safe preferences) — deleted per kill protocol, spec preserved in
  the proof test for a future ranging-policy arm. (2) The at-haven
  fight-back data point (median −9d, high variance) for #88.
- **Blanks documented (open):** wilderness-refusal measurability (needs a
  ranging policy); sanctuary semantics at haven (#87).

## Sense-testing (transcripts read)
Armed s33 (the +112d run): the scholar held at haven 32 times across the
run — each hold is a "stand and fight" where legacy would have walked to
the edge. The village survived to day 149 on the back of won haven fights,
then fell to monster pressure (3) + combat (5) in the field. Villagers read
as people throughout (distinct goals, trust 0–88, gossip with distortion) —
unchanged by this arm, as expected for a judgment-only layer.

## Convergence state: killed-at-pilot
Scale-onramp stays the blocking axis. Wall numbers this run (control):
national 6/8, table 0/8, wins 0/8, wave-4 6/8, wave-5 1/8, median 109d.

## What changed (files)
- scripts/policies/fleedirect.js — DELETED per kill protocol (was: the layer)
- scripts/policies/competent.js — hook REVERTED, no trace (verified: `git
  diff` empty vs HEAD)
- scripts/test-fleedirect-20261014.js — NEW, kept (RED spec; flips GREEN if
  the layer is ever rebuilt)
- scripts/det-gate-fleedirect-20261014.js — NEW, kept (16/16 gate)
- scripts/measure-fleedirect-20261014.js — NEW, kept (pilot driver + SMOKE)
- evidence/2026-10-14/fleedirect-control.json, fleedirect-armed.json — kept
- evidence/2026-10-14/sim-fleedirect.md — this file
