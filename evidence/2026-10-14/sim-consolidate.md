# sim-consolidate — haven-consolidation vs the mortality wall (2026-10-14)

> KILL PROCEDURE APPLIED: the arm was killed at pilot, so per procedure the
> lever's code was removed — `scripts/policies/consolidate.js`,
> `scripts/test-consolidate-20261014.js`,
> `scripts/sweep-consolidate-20261014.js`, and
> `scripts/sense-consolidate-villagers.js` are deleted. Proof results (24/24
> green), pilot numbers, and the full mechanism design are recorded below so
> a future trigger-gated follow-up can rebuild it. This commit is
> evidence-only.

## Pre-registration (MEASUREMENT.md §§9–12, 14 — binds this run)

- **Axis**: scale-onramp (topmost non-converged). **Lens**: mortality wall —
  the Standing gate opened (loop B r19: feast policy arm → first wave-5
  unlocks, 5/8 crossed T5=200 with wave-4 faced, 2/8 reached the table), but
  every run still dies by d149, 0 wins, median 78d on the plenty suite.
- **Question**: is the mortality wall ranging-exposure? Arm = policy-side
  haven-consolidation layer (`scripts/policies/consolidate.js`, opt-in
  `CONSOLIDATE=1`, default OFF, layered on `leadfeast` with `FEASTSCALE_R13=1`).
  Once national reached OR Standing total ≥150: stop ranging expeditions,
  defend haven, plenty at home (feast upkeep, garden, near-haven traps),
  fight only when attacked at haven. All verbs already exist in the engine —
  no game-code changes.
- **Primary metric**: median survival days.
- **GO threshold**: median ≥ baseline+20d AND table ≥ baseline on identical seeds.
- **Horizon**: 180d death-aware (runDays stops on Game.over / pop zero).
- **Seeds**: 8 identical (11/22/33/44/55/66/77/88) — baseline `leadfeast`
  re-run on the current tip in the same sweep, then `leadconsolidate`.
- **Starvation watch** (the r3 lesson): declining fights / staying home is a
  FOOD decision — starvation deaths tallied separately. If the village
  starves at home, that IS the honest finding.
- **Convergence state this run**: killed-at-pilot (see verdict).

## What the layer does

`withConsolidate(leadfeast, ...)`: gate off → pure delegation (proof RED:
24/24 green, `scripts/test-consolidate-20261014.js`). Gate on but below bar →
courtship continues unchanged. Trigger (latched): `scaleRank()` national/global
OR `villageStanding().total >= 150`. Consolidated daily: (1) answer mail
(counter/accord/national/global), tend subordinate links weekly from the
pantry; (2) subordinate defense calls REFUSED — design call (documented, Steve
can overrule): defenders stay at haven; (3) walk home honestly; (4) parent's
daily with OUTBOUND travelTo vetoed (forage trips, stone-run frontier pushes
declined; haven chores — garden/creek-crew/cook staffing, sorting, cleaning,
sowing, donating, teaching, talking, feasts — untouched); (5) near-haven trap
perimeter: one honest hop to the nearest wild tile, `setTrap` via the
engine-honest `workTraplineSet`, walk home. Upkeep/fight/contest inherit
(feast upkeep at dusk rides the base layer).

## Pilot results (8 seeds × 180d, identical seeds, current tip)

Baseline `leadfeast`: median 73d, max 109d, national 1/8, table 0/8, won 0/8,
vests 0, t4 3/8, t5 1/8, wave-4 unlock 3/8, wave-4 faced 3/8, feasts 17,
starvation deaths 0.

Arm `leadconsolidate`: trigger fired 2/8 seeds (s55 d57 standing150, s77 d57
standing150); median 73d, max 178d, national 2/8, table 0/8, won 0/8, vests 0,
t4 3/8, t5 0/8, wave-4 unlock 3/8, wave-4 faced 2/8, feasts 14, starvation 0.

Trigger seeds (identical-seed pairs):
- s55: d109 → d178 (+69d), national held both, t5 0 both. The run of the
  suite — consolidation bought two extra months on the longest baseline run.
- s77: d75 → d80 (+5d), national 0 → 1, but Standing max 212 → 187 (−25 war
  pts), wave-4 faced → not faced, t5 1 → 0. The price of turtling: defense
  refusal + no new proposals cost the war path and the wave-4 facing on
  this seed.

Non-triggering seeds (6/8): trajectories byte-identical by construction —
the layer is inert below the bar, exactly as the RED phase pins.

Death causes (16 runs): monster/villager 109, villager/villager 60,
villager/player 43, person/villager 2. **Zero starvation deaths on either
arm** — the village did NOT starve at home. The haven food engine (garden,
creek crew, cook staffing, near-haven trapline) sustains the population;
the r3 starvation scenario did not materialize.

## Verdict: NO-GO (killed at pilot)

Median 73 vs 73 (GO needed ≥93) → miss. Table 0 = 0 (met), but the AND
fails. Per §14 the miss is NO-GO, never re-scored mid-run. The arm is
killed: `scripts/policies/consolidate.js` deleted in the landing commit;
proof test + sweep driver + this evidence kept (scripts+evidence only).

## Metric review (for the NEXT run — not this one)

1. The pre-registered median is nearly un-winnable for a rare-state lever:
   6/8 seeds never reached the trigger, so the median is dominated by
   byte-identical pre-trigger trajectories. On the 2 seeds where the arm
   engaged, survival extended (+69d, +5d) and national held 2/2. A future
   run could pre-register a trigger-gated metric (e.g. median survival
   conditional on trigger, or days-after-trigger) — but that revision
   applies to the next run, not this one.
2. The s77 pair exposes a real cost to consolidation as designed: refusing
   defense calls and stopping proposals cost 25 war points and the wave-4
   facing. If consolidation is ever revived, the defense-call policy is the
   design question (answer 'send' with a home guard minimum?).
3. The trigger bar (Standing ≥150) fires rarely (2/8) on the courtship road.
   Most runs die before it — the mortality wall binds earlier than the
   gate, which is itself a finding: consolidation can only ever be a
   late-game lever.

## Sense test (SENSE-TESTING LAW)

Read, not counted. Single `leadconsolidate` run, seed 55 (trigger d57,
died d178) — `scripts/sense-consolidate-villagers.js`, 17,717 say-lines:

- Mid-consolidation: Fernando works the garden; Abraham works the creek
  (+480 kcal to the pantry); Caleb cooks; gossip by the fire with retelling
  distortion ("Someone's added a flourish that wasn't there this morning");
  Leo and Caleb "talking low. Not business. Just people"; a joke, "Abraham
  laugh — a real one"; Lena the healer making rounds (Abraham 6→21 HP);
  palisade stone requests; trials; audience chants.
- Late: a Stonebridge night raid carries off ~640 pantry kcal ("Nobody's
  dead, but the message is clear"); a monster ("The Ugly Thing") inside the
  haven with eyes on the scholar's bedroll; spoilage thrown out with a
  muttered regret ("Should've smoked that"); "The land is getting tired."
- The scholar turtles; the village does not freeze. It works, gossips,
  jokes, heals, gets raided, and argues with its own rot. Final snapshot:
  one villager left (Nora, tailor) — the village-lost end is attrition,
  not a frozen sim. SENSE VERDICT: reads as people making decisions.

## Mechanism notes (from the pilot JSON)

- Trigger seeds: s55 consolidated 123 days (d57→d178, 369 travel vetoes —
  stone-run frontier pushes + forage picks declined ~3/day), national held
  102 days; s77 consolidated 25 days (d57→d80, 75 vetoes), national held
  4 days (reached d76, village died d80 — national arrived on the arm
  where baseline never reached it).
- `perimSets` 0/2 trigger runs: the near-haven trap perimeter never set a
  trap — the scholar holds no traps because the materials pipeline
  (forage → vine/stick → craft) is exactly what consolidation stops. Dead
  code in practice; documented, not chased.
- `defenseRefused` 0: no subordinate defense calls arrived during the
  consolidation windows on these seeds — the refusal design call was never
  exercised. Untested, still Steve's call.
- Exiles: 1/8 both arms (s44, d73, pre-trigger, byte-identical trajectories)
  — unrelated to consolidation.

## Wall numbers (this run)

national 2/16 · table 0/16 · wins 0/16 · wave 4–5 unlocks 3/16 (all wave-4,
arm+baseline) · wave-4 faced 5/16 · median survival 73d · exiled 1/8 both arms
(s44, pre-trigger) · vests 0 · starvation deaths 0/16 runs.

## Blanks

- None new chased (stayed on axis). villager/villager 60 + villager/player 43
  deaths are the sibling intraviol arm's territory (coordinator 3-arm plan) —
  not duplicated here.
