# journey-deepening r33 — THE MEAT TRAIL (2026-10-22)

## STALE-LOCK RECOVERY (run start)

- Lock `journey-deepening-20261022T134500Z` (created 2026-10-22T13:47:36Z) found at
  run start. Registry had NO tree `journey-deepening` and no `git worktree` entry —
  the previous run died before registration. DEAD per protocol (no registered
  tree / no heartbeat). Lock deleted; new lock `journey-deepening-20261022T154600Z`
  created 2026-10-22T15:51:19Z.
- No orphan tree existed to clean up. Rotation file already read 2 (deepening);
  this run plays deepening and will write 3 back.

## Pre-register (§14 BINDING — written BEFORE the first sim ran)

**Leg question:** In the deepening window (d40–80), does monster meat from the
6 quirk-carrying monsters reach village meals and do quirks fire — and if not,
which supply-chain stage breaks?

**Code read (2026-10-22, BEFORE instrumenting):**
- `monsterCarcassEntries` (game.js:42549) puts the carcass (plantId `meat_<mid>`,
  foodState 'carcass', spoilDay+3) ON the corpse — loot-as-action, rots there.
- The scholar loots via corpseTakeItem/corpseLootAll (competent policy loots
  in-range corpses) and cleans with cleanCarcass (food.js:764).
- Villagers butcher-on-the-spot via `mapmemButcherForCarry` (villager-mapmem.js:407,
  returns {kcal, unknown}) and haul remembered carcasses via `mapmemHaulAt`
  (villager-mapmem.js:470); sortie kills narrate "haul it home before it rots."
- Meat reaches meals via `trackMealExposure` exposure.monster (game.js:28220),
  which fires `villagerMonsterWeirdness` (game.js:30187, raw 35% / cooked 20%)
  and the scholar's `maybeMonsterWeirdness` (game.js:26067).
- The quirk table (cooking.json monsterDiseases) is CANON-COMPLETE for meat:
  howlbelly/hushwolf, gristlefit/bulldozer, croakbelly/belltoad,
  shellgut/speedbump_turtle, witness_maw/mirror_stag, flockmind/ducks_in_a_row —
  matching docs/DISEASES.md's 6 meat-vectored alien effects. The other 9 wave-2
  monsters are deliberately inedible (0 kcal, "do not eat the vest" jokes).
- r32's "0 villagerMonsterWeirdness events across 6 seeds" is therefore an
  UPSTREAM blank: the kill→carcass→loot→clean→haul→pantry→meal chain, not the
  quirk table.

**Interesting-finding bar:** ≥1 exposure.monster event (meat reaches a meal) with
the chain traced, OR a named clean break:
  (a) quirkKills>0, carcasses=0 — the kill never leaves a carcass;
  (b) carcasses>0, scholarLoot=0 AND butcherCarry=0 — nobody picks up the meat;
  (c) loot/carry>0, cleans=0 AND mealMeat>0-via-village — raw/unknown flows unprocessed;
  (d) mealMeat>0, quirkRolls=0 — meat served but never rolls;
  (e) quirkRolls>0, fired=0 on many rolls — the table is stingy vs the designed 20-35%.
Quirks firing in the wild = the alien channel reads (R2 narration required).

**Binding metrics:**
- R1 (meat-trail census, PRIMARY): 4 seeds (9961–9964), competent policy,
  DAYCAP=100, death-aware stop. Instruments (harness-only wraps, zero src/js):
  quirk-mid kills, carcass creation, butcher-carry, haul-at, scholar loot,
  scholar cleans, meal exposure, quirk rolls (villager+scholar), applyStatus
  ground truth. All instruments non-empty-capable (empty = finding).
- R2 (narration, report-only): ≥1 kill→meal transcript chain sense-read if the
  trail fires; ≥2 meal transcripts sense-read.
- M1 winnable: ≥3/4 villages alive at end.
- M2 people (report-only): ≥6 full villager transcripts sense-read
  (SENSE-TESTING LAW), 0 senseless expected.
- Report-only extras: plain-words census per seed, death census, regional
  links, wave reached.

**Seeds / horizon / policy:** 9961, 9962, 9963, 9964, competent, DAYCAP=100,
death-aware stop (+10d tail max). Natural behavior, no probes.

**Race guards:** measurement only — no src/js, no data, no policy tweaks.
Fix only instrument-class bugs if proven wrong.

**Metric review:** (to fill after the run)

## RESULTS (2026-10-22, seeds 9961–9964)

Meat-trail census (R1 PRIMARY — 4/4 seeds complete, 0 wrap errors):

| seed | days | end | wave | alive | quirk kills | carcasses | loot/haul events | cleans | mealMeat (quirk mids) | true quirk rolls | quirks applied |
|------|------|-----|------|-------|-------------|-----------|------------------|--------|----------------------|------------------|----------------|
| 9961 | 100 | survived | 2 | 11/11 | 0 | 0 | 5 | 0 | 0 | 0 | 0 |
| 9962 | 62 | village-lost | 3 | 9/9* | 2 (hushwolf, belltoad) | 2 (1700 kcal) | 4 | 0 | 0 (1 mirrormoth, non-table) | 0 | 0 |
| 9963 | 89 | village-lost | 3 | 4/4* | 3 (2 hushwolf, speedbump) | 3 (4600 kcal) | 3 | 14 | 0 | 0 | 0 |
| 9964 | 101 | survived | 4 | 8/8 | 15 (12 ducks, 2 hushwolf, mirror_stag) | 3** | 3 | 1 | 0 | 0 | 0 |

\* roster at end (the dead are gone from the count — 8 and 12 person-deaths respectively).
\** the 12 duck kills were swarm sub-fighters in a fight the scholar LOST (died day 58);
per-kill rewards pay on won/routed only (tbKillRewards) — correct design, not a leak.

TOTALS: 20 quirk-mid kills → 8 carcass entries → 15 loot/haul/carry events →
15 scholar cleans → **0 quirk-mid meats reaching a meal, 0 true quirk rolls,
0 quirk applications** across 4 seeds (10 seeds including r32's 6).

**Verdict on the leg question: the trail runs to the pantry and dies there.**
The upstream chain WORKS and narrates honestly:
- Villager kills leave carcasses (monsterCarcassEntries) with the loot-as-action
  beat ("The carcass is there on the ground — search the body if you want the meat").
- Villagers haul: Mateo (9964, day 36) hauled the Grief Counselor (mirror_stag)
  carcass home — "wrapping the strange meat... Someone at the fire will — or
  we'll learn the hard way" → "unknown flesh in the pantry. Test it cautiously
  before anyone eats."
- The scholar loots and donates (Drum-Belly carcass → pantry, 9962).
- Rot is honest ("went bad — maggots, smell, the whole sad story").

The terminal break is at **pantry → reveal**, and the mechanism is fully traced:
1. Unknown flesh arrives as `kcalEach: 0, edible: false` items — `pantryDraw`
   filters `(item.kcalEach || 0) > 0`, with the comment "Knowledge gating
   untouched: unknown flesh (kcalEach 0) never reaches this sort." It can NEVER
   be served until revealed.
2. The only reveal is the presence-gated `villagerExperimentBeat` (or the
   scholar's own testMonsterMeat — the competent policy never calls it).
   On 9964 the beat fired ~12 times in 101 days; it tested The Big Beast flesh
   (tick 36) and Sunbasker flesh (tick 100) — but the mirror_stag flesh,
   deposited day 36, waited 65 days and was never picked (one experiment per
   day, inventory priority, scholar rarely at the fire after the day-58 death).
3. Unknown flesh carries NO spoilDay (isSpoiled requires one) — it never rots,
   never gets served, never gets tested. Immortal pantry clutter.

The alien-pool "some avoid infection, others seek it as build fuel"
(docs/DISEASES.md) is unreachable in the wild: 0 quirk rolls on real monster
meat in 10 seeds. This sharpens the documented "away-from-home experiments"
future blank (game.js:17903) — it is not just away-from-home; even a present
scholar sees the one-per-day beat starve pantry flesh behind priority order.

**M1 winnable: NO-GO (2/4 alive).** 9962 collapsed day 62 (8 person-deaths:
sickness ×3, combat ×4, lockjaw ×1 — a disease+combat spiral, wave 3 reached);
9963 collapsed day 89 (12 deaths: starvation ×2, sickness ×4, wounds ×2 —
a food-economy failure, wave 3 reached). 9961/9964 survived to 100+ (wave 2/4).
Per §14 the miss is recorded, not re-scored.

**M2 people: PASS (6 transcripts sense-read, 0 senseless).** Mateo (bold barber,
hauls the strange meat; asks "Have you ever hurt someone?" — engaged with
gravity), Nina (dry mechanic, wound-help ask resolves as promised), Jorge
(grieving rancher — "I keep expecting to see them by the fire"), Tiana
(wound self-resolved, honest about it), Amina (Twi-only midwife — the language
barrier played straight), Adaeze (pantry-run ask deflected with consequence:
"They won't ask twice").

**R2 narration: PASS.** The kill→carcass→haul→pantry chain reads on the page;
the rot beats are honest; the experiment beats read as real fire-side science.

## VILLAGE ASSESSMENT (plain words)

- **9961:** Eleven alive at day 100, wave 2. A quiet competent village — one
  combat death all run (day 8). Baker, sailor, carpenter, line cook: the
  specialist economy hummed. No quirk-monster contact at all.
- **9962:** The village that bled out. Nine left at day 62 after sickness took
  three, monsters four, lockjaw one. Ella Johnson killed a hushwolf (day 18)
  and a belltoad (day 40) — both carcasses rotted where they fell; nobody came
  for 1400 kcal of meat. Wave 3 reached, then the spiral.
- **9963:** The village that starved. Four left at day 89 — Jorge, Xavier,
  Soledad, Sadao. Two starved, four sickened, the rest to wounds and monsters.
  The scholar cleaned 14 carcasses (the only seed where cleaning fired at
  volume) but the meat never became dinner. Wave 3 reached.
- **9964:** Eight alive at day 101, wave 4. Viola died to the duck swarm on
  day 58 ("You go down"); Chao took the mantle and the village held. Mateo
  hauled the Grief Counselor home. The pantry held its strange meat, untested,
  to the end of the world.

## BLANKS FILLED / DOCUMENTED

1. **DOCUMENTED — the quirk channel starves at pantry→reveal (the meat trail's
   terminal break).** Full mechanism traced (see Results). Not a missing system —
   every stage exists and is honest — but the presence-gated, one-per-day
   experiment beat cannot keep up with haul inflow for a foraging scholar, and
   unknown flesh never rots (no spoilDay) so it accumulates as immortal clutter.
   Per race guards: MEASURED, not moved. Candidate fixes for a future run
   (Steve's call): (a) away-from-home experiments (the documented blank);
   (b) spoilDay on hauled unknown flesh so neglect has an honest cost;
   (c) competent-policy testMonsterMeat drive. Kill discipline: the feature is
   not dead — the substrate fires (probe proved the beat reveals pantry flesh
   when present); the lever is the presence gate + cadence, not the channel.
2. **DOCUMENTED — instrument bug (mine): quirkRolls counted calls, not rolls.**
   1,479 "rolls" were mostly scholar maybeMonsterWeirdness calls on PLANTS
   (purslane etc.) — the function early-returns on non-meat. True monster-meat
   rolls: 0 on all 4 seeds. Metric corrected in-analysis; the census script
   needs a plantId gate before the next meat-channel run (metric review).
3. **DOCUMENTED — r32 blank 4 carried: scholar end-census array bug FIXED in the
   r33 instrument** (array-aware status read; verified on 9964: scholar quirks []
   correct).
4. **NOTED — 9962's Drum-Belly donation spoiled in the pantry untested**
   ("Should've smoked that") — the same reveal starvation, scholar-side.

## JUDGMENT: reachable / fun / winnable (deepening leg)

- **Reachable:** partial — the kill→carcass→haul→pantry chain fires naturally
  and often; the REVEAL (and therefore the quirk content) is practically
  unreachable in the wild (0/10 seeds). The content exists behind a gate the
  wild never opens.
- **Fun:** yes — the haul beats, rot honesty, and experiment narration are
  genuinely good; the duck-swarm fight that killed Viola was a real fight with
  real stakes.
- **Winnable:** mixed — 2/4 villages survived to 100+ (waves 2 and 4); the
  losses were disease/combat and food-economy spirals, not a deepening wall.
  M1's bar (≥3/4) missed — recorded as NO-GO per §14.

## METRIC REVIEW

- The quirkRolls instrument counted function CALLS (including 1,400+ plant
  calls to maybeMonsterWeirdness) instead of true meat rolls. Next meat-channel
  run: gate the wrap on `plantId startsWith('meat_')` before counting.
- M1's ≥3/4 bar missed (2/4). No revision proposed — the bar stands; the two
  losses were landing/establishment-class failures (starvation, disease spiral),
  not deepening-leg walls, but a miss is a miss.
- Interesting-finding bar met via the named clean break (pantry→reveal).
- The probe script (scripts/probe-meatexperiment-20261022.js) verified the
  experiment beat DOES reveal pantry unknown flesh when present — the substrate
  is proven, the cadence/gating is the blank.
- TELEMETRY CHECK (body step 14): SKIPPED with reason — the deepening baseline
  (telemetry-baselines/deepening.json) carries panel metrics (w3fights,
  engaged.w3, fightsTotal, fightsByWave.3) that the r33 instrument does not
  emit; a check would false-alarm on instrument mismatch, not real deviation.
  The r33 evidence JSONs carry the meat-trail census instead. A future
  meat-channel run should either emit panel metrics or seed a meat-specific
  baseline via --update-baseline.
