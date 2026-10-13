# sim-kitchen-r12 — the cook→eat last mile (2026-10-13)

Long-run sim loop, scale-wall r12. Lever 0 (food economy) AS A LENS on the scale wall.
Policy/tooling work only — no game-code changes. No [needs-eyes] (no feel/combat/UI change).

## Pre-registration (MEASUREMENT.md §11 — fixed BEFORE the pilot ran)

- **Primary metric:** scholar-eaten monster-meat kcal — the "eaten" column
  in r11's table (currently 0 on all arms).
- **GO threshold (pilot gate):** eaten ≥ 25% of revealed kcal on the
  addressable pair (seed 11), visible in raw numbers. Miss → killed-at-pilot,
  no confirm spend (§9 sniff test).
- **Horizon:** 150 days, death-aware (dead villages stop simulating).
- **Seeds:** 11 (belongseek pair), 22 (leadcourt pair) — identical seeds
  within each pair.
- **Policies:** belongseek-haul vs belongseek-haul-kitchen (BELONG road);
  leadcourt-haul vs leadcourt-haul-kitchen (LEAD road). The kitchen layer
  (scripts/policies/kitchen.js) extends the cook step to REVEALED cleaned
  meat (edible===true, foodKind 'meat', foodState 'cleaned', near-expiry
  first, cap 6/beat) when fire is near, then lets the existing
  competentEat/Game.eat() eat it. Gate: COMPETENT_KITCHEN=1 opt-in
  (default OFF; the before arms don't carry the layer at all). NEVER
  touches edible:false meat (r10's discovery chain owns it) or meat_human
  (trembles — prions don't cook out).
- **Convergence state:** pilot GO → confirm spend (12 seeds); pilot miss →
  killed-at-pilot.

## Canon read

- docs/CANON.md + docs/PRESERVATION.md (the ladder: cleaned 2d < cooked 5d
  < smoked 30d < rendered 90d < pemmican 120d; blind penalties teach;
  cooking never destroys honest calories) + docs/BEAR.md
  (carcass→clean→test→reveal chain; only 'cooked' clears trichinosis —
  smoking doesn't) + docs/DISEASES.md (raw-meat boundaries: cleaned meat
  carries disease risk; cooking is what makes it safe; mundane vs alien
  pools never mix — the cautious test's cost stays energy-only).
- Engine verification (not invention): food.js cookFood handles cleaned
  monster meat honestly — unknown flesh keeps kcalEach 0 + hiddenKcal
  (cooking doesn't teach), revealed flesh gets honest kcal, cooked-through
  clears diseaseRisk and deletes parasiteRisk. app.js cook button shows
  the 'Cook' verb on cleaned meat near fire. The policy gap is real and
  measured: competent.js cookPack matches foodState === 'raw' only.

## The lever (policy-side, scripts/policies/kitchen.js)

`withKitchen(base, id)` — upkeep runs cookRevealedMeat FIRST (before the
base cook+eat beat, so competentEat sees cooked food), then base.upkeep.
Proof: scripts/test-kitchen-r12.js (7/7, incl. two real RED phases: the
baseline upkeep leaves revealed meat uncooked while cooking the raw
control; the layer is inert with the gate unset). r10's suite re-verified
5/5, r11's 7/7. Instrument: scripts/kitchen-20261013.js reuses r11's
runMeatAudit (eaten measured as pack+pantry edible monster-meat kcal delta
across eat() calls — cooking keeps the signal: edible stays true).

## Results (pilot, 4 runs, 150d death-aware)

| arm | days | nat | tab | won | exiled | wave | wave45 | carcasses | gross | playerK/villagerK | hauled | gear | rotShare | potential | share | revealed | eaten | disc (tests) |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| belongseek-haul s11 | 87 | 1 | 0 | 0 | 0 | 4 | 1 | 15 | 20.4k | 8.7k/11.7k | 9.6k | 18 | 53% | 2.6k | 0.52% | 1.6k | 0 | 3 (3) |
| belongseek-haul-kitchen s11 | 83 | 0 | 0 | 0 | 0 | 3 | 0 | 13 | 18.6k | 8.3k/10.3k | 9.6k | 13 | 48% | 2.6k | 0.52% | 1.6k | 0 | 3 (3) |
| leadcourt-haul s22 | 75 | 0 | 0 | 0 | 0 | 3 | 0 | 10 | 9.9k | 1.6k/8.3k | 1.6k | 7 | 84% | 0.6k | 0.36% | 0.6k | 0 | 2 (2) |
| leadcourt-haul-kitchen s22 | 75 | 0 | 0 | 0 | 0 | 3 | 0 | 10 | 9.9k | 1.6k/8.3k | 1.6k | 7 | 84% | 0.6k | 0.36% | 0.6k | 0 | 2 (2) |

Wall numbers (4 runs): national 1/4, table 0/4, wins 0/4, wave 4–5 unlocks
1/4, median survival 79d, exiled 0/4.

### GO/NO-GO

**MISS → KILLED AT PILOT.** Pre-registered GO needed eaten ≥ 25% of
revealed kcal on the addressable pair (seed 11). Measured: eaten 0 on all
four arms; 0 / 1.6k = 0%. No confirm spend (§9: never run 12 seeds on an
invisible effect).

### What the numbers say — the full lifecycle, traced

The pilot's headline (eaten 0) needed the "why", so I traced the revealed
meat's full lifecycle on seed 11 (deterministic probes, same seed/policy):

1. **The kitchen layer fired exactly ONCE in 83 days.** Day 59:
   "Cooked The Ugly Beast (cooked): 1281 → 512 kcal, burnt at the edges —
   edible, technically. (40 ticks)". One bulldozer, cooked blind (the
   scholar never learned the 'cook' technique), burnt to 0.4×. The revealed
   pool is tiny (1.6k over 83 days) and the fire-near-upkeep timing rarely
   coincides with meat in the pack — the cook step is starved of inputs,
   not broken.
2. **The one cooked meal died with its cook.** Day 59 the scholar
   (gen_b34t, full hp, full belly) cooked at upkeep, then died in combat
   the same day — day 60 opens with successor gen_0qcg and an empty pack.
   Succession does not transfer the pack; the 512 kcal vanished with the
   dead scholar. Not eaten, not rotted, not donated — gone.
3. **The 0 is real, not a measurement gap.** I verified all three scholar
   eating paths: Game.eat() (pack), the scholar's villageMeal (pantry
   draw), and NPC villageEats — zero monster-meat kcal through all of
   them. The instrument's eaten column is complete; the meat simply never
   reached a mouth.
4. **The rot-share "improvement" (53%→48%) is a kill-count artifact, not
   the lever.** Rot per kill is byte-identical (0.22k vs 0.20k); the
   kitchen arm just fought less (21 vs 30 kills). The seed-11 pair's
   divergence (national 1→0, wave 4→3) is trajectory noise at n=1, not
   lever-caused — the one 40-tick cook can't explain it, and I don't claim
   it does.
5. **The leadcourt pair is byte-identical** (75d, same kills, same rot) —
   the layer is provably harmless when there's nothing to cook: no
   revealed meat, no behavior change, RNG undiverged.

### The honest diagnosis

The cook→eat last mile is **not the binding constraint**. The proof test
proves the mechanism end to end (revealed meat cooks honestly, is eaten,
zero disease — 7/7), but in long sims the mechanism is starved:
(a) the revealed pool is tiny — r11's structural ceiling (57–84% of
carcass kcal dies on unreachable nodes) means ~1.6k kcal over 83 days can
ever reach the fire; (b) when meat is ready the scholar is usually full —
the fish/garden base economy satiates, and Game.eat() prefers
more-perishable food; (c) succession wipes the pack, so even a cooked
meal is one bad fight from deletion; (d) blind cooking burns 60% of the
calories (technique never learned — the policy cooks before it knows
how). Twelve more seeds would size a ~0.1%-of-influx effect more
precisely without changing any decision.

## Sense-test (transcripts — SENSE-TESTING LAW)

The single cook reads as a person working a fire, not a vacuum:
"Cooked The Ugly Beast (cooked): 1281 → 512 kcal, burnt at the edges —
edible, technically. (40 ticks)". The village-named meat ("The Ugly
Beast", not "bulldozer") keeps the knowledge-gating honest; the burnt
outcome is narrated, not hidden. The succession the same day is the
game's own brutal poetry — the village that learned to cook its kills
kept dying to the things it was killing (r11's epitaph, unchanged).

## Village assessment

- **Seed 11 pair (87d/83d, village-lost):** a garden-and-fish economy
  (influx ~490k) where the monster-meat chain runs end to end — haul,
  clean, test, reveal, cook — and still feeds nobody. The baseline arm
  reached national (n=1, not claimed as lever-related); the kitchen arm
  didn't. Both died to combat. The kitchen changed the food story by
  exactly one burnt bulldozer.
- **Seed 22 pair (75d/75d, village-lost):** byte-identical runs — the
  lever had nothing addressable (0.6k revealed, 16% player-kill share)
  and correctly did nothing. Fish-and-forage economy, deaths thinner
  than seed 11.
- Villagers acted as individuals throughout (patrol kills on wild nodes,
  NPC fireside discipline unchanged). Nothing robotic flagged.

## Reachability verdict

Waves 1–3 reachable; wave 4 reached once (baseline seed-11 arm, as in
r11). Wave 5, Arc II/III/IV, the table, the win flag: unreached. The
scale wall stands: the kitchen moves 0.0k of the ~490k influx, and the
national on-ramp's food surplus must come from elsewhere — same as r11.

## Blanks filled / documented

- FILLED (mechanism): the policy-side cook→eat gap — the layer cooks
  revealed cleaned meat honestly (proof 7/7, incl. two RED phases), and
  the in-sim lifecycle is fully traced (cook → succession-wipe).
- FILLED (instrument honesty): the eaten-0 is verified complete across
  all three eating paths (Game.eat, scholar villageMeal, NPC meals) —
  not a measurement gap.
- OPEN (upstream, structural): the revealed pool — 1.6k/83d is the
  ceiling r11 named. Only a design-level carcass fix (Steve's call)
  grows it.
- OPEN (policy): blind cooking — the layer cooks before the scholar
  learns 'cook' (burnt 0.4× destroyed 769 kcal). A learn-first or
  technique-gated cook would waste less. Not this run's lever.
- OPEN (design): pack-on-succession — the dead scholar's pack (with the
  cooked meal) vanishes. Whether a successor should inherit it is
  Steve's call.
- DOCUMENTED (tooling): `quietLog` in scripts/sim-harness.js silences
  console.log for the entire runDays day loop — probes that log inside
  policy hooks print nothing. Collect in arrays, print after the run.
  (For the coordinator: worth an AGENTS.md line.)

## Convergence

**Killed-at-pilot.** The cook→eat mechanism is proven and kept behind
the opt-in gate (COMPETENT_KITCHEN, default OFF — same precedent as
r10's meatseek gate), but its measurable effect on scholar-eaten kcal is
invisible (0% vs the 25% GO). No confirm spend. The food-economy axis
stays where r11 left it: carcass-logistics policy work converging
(bounded by the structural ceiling); the wall itself unmoved — binding
constraint remains survival-to-national (combat/sickness baseline), not
the kitchen. Telemetry deviation check: the coordinator runs it vs the
shared baseline afterward; this run does not roll the baseline.
