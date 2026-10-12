# Longsim: DISEASE PRESSURE lever r3 (2026-10-11) — alien vector findability + death-cause honesty

Lever 7 (disease pressure). Round 3. Canon read first: docs/CANON.md,
docs/DISEASES.md. r1 (evidence/2026-10-11/sim-disease.md) and r2
(evidence/2026-10-11/sim-disease-r2.md) re-read; this run closes r2's
documented gaps (a) lemons reachability, (b) alien transformation arcs,
(c) the '?' attribution gap, and re-checks (d) sense.

**STEP 0 (prerequisite, done):** the orphaned r2 commit `52fa6201` was
cherry-picked (`-n`, no conflicts) into this tree, its proofs re-run on
current master (test-disease-curepath 39/39, r14 66/66 ×3 seeds, ontology
83/83), and committed as `15ee4797` with the original [needs-eyes]
message. Nothing was forced; nothing broke.

## Lever played: VECTOR FINDABILITY + DEATH-CAUSE HONESTY [needs-eyes]

Two small halves, one lever (disease pressure). No rate changes to
mundane vectors, no mechanic changes, no pool mixing.

**A. Disease vectors findable** (src/data/monsters.json — data only):
- `alien_tick`: `"spawnWeight": 2.5`
- `giant_mosquito`: `"spawnWeight": 2`

Why: canon (DISEASES.md) calls eurika/east_nile/lemons "min-max building
blocks a seeker reaches." Measured spawn-level rate before: alien_tick
won ~1 of 24 wave-2 picks (~4%; 1/15th of a crowded wave-2 pool), 1
fight in 30 organic runs — decoration-tier for the rarest vector, the
same class of problem the landlord's `spawnWeight: 3` (parity audit
2026-10-10) already fixed by precedent. After: analytic weighted share
~9.5–11% across day parts (~2×). No mechanic touched; the tick is still
a keep-your-distance ambush, the mosquito still crepuscular.

**B. Death-cause honesty** (src/js/game.js `villageSicknessTick`, +
sweep measurement): the engine KNEW the disease id
(`villagerDiseaseId`) and the death narration already said the true
name when the village knew it (diagnosed / villageKnowsDisease) — but
`registerDeath` got a bare `'sickness'`, so the corpse/fallen record
and telemetry lost it (r2's '?' gap). Now the hurt cause carries the
disease id under exactly the narration's naming gate; unknown stays
`'sickness'` (symptom-honest — "diseases never announce their names");
food-poisoning vector names (`food poisoning (raw)`, `bad belly`,
`spoiled gut`, `poisoned`) pass through as the cause. Verified no
player-visible surface renders the raw villager corpse cause
(examineCorpse doesn't; journal lineage is player-lives only; gossip
'death' carries no cause text). Sweep's `bucket()`/`diseaseIdOf()`
extended so the new causes stay in the disease bucket and get named.

## Before/after on identical seeds (6 seeds × 3 policies, 200d horizon)

scripts/sweep-disease-lever.js. BEFORE = r2 HEAD (15ee4797) with the
lever stashed; AFTER = lever applied. Same seeds, same RNG consumption
(the weight change shifts picks, not RNG positions).

| measure | before | after |
|---|---|---|
| giant vector fights /18 runs | 1 (alien_tick 1) | **6** (alien_tick 4, giant_mosquito 2) |
| alien cases | 2 (howlbelly 2) | **5** (howlbelly 2, eurika 2, **lemons 1**) |
| diseaseDeaths '?' (unattributed) | 6 | **3** (all genuinely unnamed — village never learned the name) |
| diseaseDeaths named | 1 (lockjaw, player) | **5** (wound_fever 4, lockjaw 1) |
| median/max survival (competent) | 59/68d | 57/68d (noise) |
| median/max survival (careless) | 37/47d | 37/50d (noise) |
| median/max survival (treatment) | 55/68d | 49/73d (noise) |
| player death causes | combat+starvation dominate | unchanged — combat 50, starvation 21, disease 3 /18 |
| wave reach (competent) | w2 5/6, w3 1/6 | w2 5/6, w3 1/6 (unchanged) |
| arc reach | II+III 12/12, IV 0/18 | identical |
| cures (treatment_seeking) | 6 wound_fever | 3 wound_fever (variance; cure path intact — r2 proof green) |

No destabilization: survival, wave/arc reach, and death-cause shares
are within noise. The lever moved only what it aimed at: vector
findability and attribution honesty.

## Reachability verdicts

- **Lemons: REACHED (first time in sims).** treatment_seeking seed
  2026: alien_tick spawn → fight → latch → 50% roll → `lemons` case,
  then the engorge ability fired the next day ("Your occupied joints
  drink deeper — the food goes further. (+130 kcal, Lemons engorge)").
  The full seeker chain completed end to end. Before: 0 cases in 30
  runs. Not decoration anymore — rare, but findable.
- **Eurika/east_nile: REACHED; arcs complete.** Seed 7 (competent +
  treatment_seeking, same trajectory): giant_mosquito fight → bite →
  `eurika` case. Arcs verified structurally too (proof test): all three
  viruses apply permanent (no duration — canon warping), appear on the
  alien-affliction readable surface with transformation text, the
  eurika-sense line fires (wandererTentBreach), mosquitoBiteVirus is
  50/50 over 400 seeded calls. East Nile had no case this batch
  (50/50 per bite; small sample) — the machinery is identical to
  eurika's, verified in code + proof.
- **Do carriers die first?** The viruses don't kill carriers — combat
  does. Scripted eurika carrier (seed 42) died day 10 of combat, mantle
  passed; the virus was a passenger, not the killer. Canon-consistent:
  the arc is gated by surviving the world, which is the game's whole
  thesis. A carrier who lives keeps the warping permanently.
- **'?' gap: CLOSED as far as honesty allows.** Remaining '?'
  = genuinely unnamed sickness (village never learned the name —
  symptom-honest by canon). Named ids flow when known; food-poisoning
  vectors are labeled; everything stays in the disease bucket.
- **Meat-quirks:** howlbelly 2 cases (players ate hushwolf meat).
  **Trembles:** still 0 (corruption lever's territory — documented,
  not chased). **Cure tiers:** r2's diagnosis→cure path intact
  (treatment_seeking cures 3 wound_fever this batch).

## Sense findings (SENSE-TESTING LAW — transcripts read)

scripts/sense-disease-r3-20261011.js. Two arcs, read whole:

**S1 — the lemons arc (treatment_seeking, seed 2026):** "Something
moves out there — tick." (map-visible, plainly "tick" — canon) →
"In the grass: legs waving, slow. Questing. It's not hiding — it's
fishing, and you're warm." → "You don't know what that was. A tick
the size of a thumbnail, legs waving slow in the grass." (ambiguity
honest — descriptor, never the true name) → "⚔ TICK! You're on your
own." → "It's on you — mouthparts in before you can move. (14)
LATCHED. (torch burns it off; it feeds 4 turns then drops)" →
"Something was in you before you felt the bite — the tick's bite.
The joints ache, and a ringed red circle blooms on the skin."
(transformation narrated AT application — the body horror is a story
beat, not just a panel) → player wins, learns the counter ("Keep two
squares away…"), then "Your occupied joints drink deeper — the food
goes further. (+130 kcal, Lemons engorge)." A complete min-max
seeker story: the bargain is legible (achy joints forever, food goes
further), earned through a real fight. This is what canon meant.

**S2 — the eurika arc (competent, seed 7):** mosquito fight with real
telegraphs ("The whine steadies on one note. It's picked its line.")
→ "Something lands on your neck with real weight — the mosquito's
bite. It drinks, and something cold goes in with the bite." →
counter learned ("Hit it after it drinks"). Meanwhile the village
dies around the carrier: "💀 Wei succumbed to the fever. The village
is 11 now." → "💀 Emma succumbed to the fever. The village is 3
now." → "💀 Sirikanya succumbed to the fever. The village is 0
now." A fever outbreak wiping a village reads as FEARED — canon's
"sickness must be feared and avoided at all costs" lands. The
unnamed dead stay symptom-honest ("the fever"), never leaking names.

**Villagers act like people:** "🤒 Marcus is feverish, a cut gone hot
and angry. Rest and clean water — or it gets worse. Lena is already
boiling water. It's handled." — named sitters, unasked tending,
self-organizing. (r2's beats holding.)

**Nit (documented, not changed):** "tick is BLEEDING — and it likes
it. Louder, faster, no more feints." — the generic enrage line reads
odd for a tick (it doesn't feel; it feeds). Flavor backlog, not this
lever. Also: raid system cast the alien tick as a haven raider
("One of them is coming for YOU — tick, inside the haven") — the
raid roster pulls from the monster pool; whether a sessile ambush
predator should raid is a raids-lever question, noted not chased.

## Village assessment (plain words)

Villages still live ~2 months and die of violence and hunger, not
sickness: 50 combat + 21 starvation vs 3 disease player-deaths across
18 runs. The wound vector keeps taxing fighters; lockjaw certainty
keeps killing the careless and undiagnosed (1 player lockjaw death,
villager wound_fever deaths now honestly named). What's new this run
is that the alien pool finally shows up in the village's story: a
seeker can now plausibly find the tick, survive the latch, and walk
away changed — ringed rashes at every joint, drinking deeper from
every meal. Who thrives: fighters who keep HP up and learn counters
(the tick's "keep 2 squares away" is learnable and true). Who dies:
the wounded who keep fighting, the thirsty, the outmatched — and now,
sometimes, the feverish, in a way the record remembers by name.

Knowledge missing: nothing structural — the map was always there.
What was missing was (1) findable vectors (filled: spawnWeight), and
(2) honest death records (filled: sickCause). The cure path (r2)
remains the thing sims do and the transcript confirms.

## Run-wide measures

- Win rate: 0/18. Four-realm formation: 0/18 (no national reach).
- Arc reach: I 18/18, II 12/12, III 12/12, IV 0/18.
- Wave reach: competent w1 6/6, w2 5/6, w3 1/6; careless w2 2/6;
  treatment_seeking w2 5/6; w4/w5 0/18.
- Median/max survival: competent 57/68d, careless 37/50d,
  treatment_seeking 49/73d.
- Death-cause shares (players): combat 50, starvation 21, disease 3,
  contest 0. (Villagers): combat 47, wound 9, starvation 7, thirst 6,
  disease 5 (now: wound_fever 4, lockjaw 1, unnamed 3), murder 2.
- Trap acquisition by source / counter discovery rate /
  young-link succession survival / tier-2 reach: not this sweep's
  instrumentation (noted, not faked). Counter discovery observed in
  transcript (tick + mosquito counters learned, codex entries written).
- The table / win flag: unreached in 200d sim horizons (consistent
  with all prior disease-lever runs).

## Tooling

- scripts/test-disease-r3-20261011.js (new) — 31 assertions, ALL
  GREEN: spawnWeight data + weighted shares, arc permanence +
  transformation surface + eurika-sense line + 50/50 virus roll,
  carrier mortality honesty, '?' fix (named/unnamed/food-poisoning),
  pool separation.
- scripts/probe-disease-r3-20261011.js, scripts/probe-spawnrate-20261011.js
  (new) — investigation probes (spawn-level vector rates, say-stream
  capture).
- scripts/sense-disease-r3-20261011.js (new) — S1/S2 transcripts.
- scripts/sweep-disease-lever.js — bucket()/diseaseIdOf() extended
  for the new cause strings (measurement).

## Regressions

- scripts/test-disease-curepath-20261011.js: 39/39 (r2 proof, green
  on the new base).
- scripts/test-disease-break-r14-20261011.js: 66/66 × 3 seeds
  (7, 999, 4242).
- scripts/validate-ontology.js: 83/83, release permitted.
- monsters.json: valid JSON, diff is +2 lines.

## Blanks filled vs documented

Filled: (1) alien vector findability (spawnWeight 2.5 / 2 —
lemons + eurika reached in sims for the first time); (2) the '?'
attribution gap (disease ids named when known, food-poisoning
vectors labeled, unknown stays symptom-honest); (3) orphaned r2
commit landed (15ee4797) with proofs re-run.
Documented: trembles still decoration (corruption lever); east_nile
no case this batch (machinery verified, 50/50 roll); tick-enrage
flavor nit; tick-as-raider roster question (raids lever); trap/
counter/young-link/tier-2 instrumentation gaps in this sweep.
