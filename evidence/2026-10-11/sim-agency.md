# Long-run sim — lever 3: villager agency (2026-10-11)

**Lever played:** teachable plant-lesson cadence in `expeditionSign`
(`src/js/villager-agency.js`): a teachable entry every **2nd** plant discovery
(was every 3rd). One number. Declining-by-construction unchanged (one entry
still spends one unique plant lesson via `agencyTeachMonster`/`agencyTeachPlant`).

**Why this lever:** baseline showed the villager→player plant-teach path was
nearly dead — 7 teachable entries created across 20 runs × 200 days
(0.35/run). Monster lessons (declining, one species ever) worked
(20 taught); plant lessons never got the chance.

**Method:** new `scripts/sweep-agency-lever.js` — 20 fixed seeds 1–20 × 200
days, competent policy + askRound hook (once/day the player asks every
villager with fresh explorer news "what did you see out there?" through the
real `startConvo`→`convoTurn` path, spending teachable entries; bounded —
each ask consumes the news entry). Seeded mulberry32 (harness). Raw JSONs:
`hidden_files/agencylever-before.json` / `agencylever-after.json` (goal
workspace, not the repo).

**Unit proof:** `scripts/test-agency-lever-20261011.js` — 17/17 × 3 seeds
(lever invariant entries===floor(plants/2); honesty; transcript; no-repeat;
chore clearing). **Sense tooling:**
`scripts/test-agency-sense-20261011.js` — restores `say`, captures 12 days
of ambient villager lines + full conversation transcripts for human reading.

## Before → after (identical seeds, lever-only commit 55ac2c9)

| measure | before | after |
|---|---|---|
| **teachable entries created** | **7** | **17 (+143%)** |
| **plants taught** (codex source 'taught') | **7** | **12 (+71%)** |
| teachable unspent at end | 0 | 5 |
| monsters taught | 20 | 21 (untouched, as designed) |
| asks made | 160 | 165 |
| expeditions launched | 48 | 45 |
| median survival | 67d | 71d |
| survived / village-lost | 2 / 18 | 4 / 16 |
| player deaths (combat / starvation) | 140 (65.7% / 34.3%) | 139 (64.7% / 33.8%) |
| villager deaths (combat share) | 58 (87.9%) | 54 (88.9%) |
| wave unlock (w1/w2/w3) | 1 / 15 / 4 | 1 / 15 / 4 |
| arc reach | 20/20 arc 3, 0 arc 4 | identical |
| won / tableWaiting | 0 / 0 | 0 / 0 |
| scale | 20/20 village; national 0; realmMax 0 | identical |
| counters discovered | 150 | 150 |
| traps crafted / looted | 0 / 0 | 0 / 0 |
| succession notes | 0 | 0 |
| mean breadth / stage / tier | 45.4 / 2.8 / 0.9 | 45.3 / 2.8 / 0.9 |
| mean slots / abilities | 5.65 / 2.7 | 5.65 / 2.95 |
| villager XP (track/surv/brave) | 1012 / 1084 / 139 | 951 / 1017 / 138 |
| range profiles (final rosters) | 5 expl / 66 wand / 123 for / 26 home | identical |
| agency tiers t1/t2/t3 villagers | 19 / 10 / 3 | 19 / 11 / 2 |
| villager monster kills | 19 | 20 |

**Lever verdict:** the lever moves exactly its channel (entries 7→17,
plants taught 7→12) and nothing else moves beyond noise — except 5/20
seeds diverged in trajectory (seed 14: 58d→survived; 17: survived→56d;
20: 75d→survived). Mechanism: the lever draws no RNG, so divergence is
second-order — more taught plants → the competent policy's
knowledge-gated behavior (`known<5` → extra talkRounds) shifts → different
RNG consumption → different days. The village sim is chaotic-coupled:
knowledge → behavior → survival. Median survival 67→71d, deaths 198→193.

**Caveat:** deed-type counts are measured over the game's last-50 deed ring
buffer per run (the game caps `ach` at 50), not run totals — windowed, not
absolute. Teachable/plant/monster counts are exact end-state reads.

## Reachability (lever-3 area)

- **Expeditions:** reachable and real (48/45 launches; blow-by-blow field
  fights, real deaths — 87.9% of villager deaths are combat). But rare:
  2.4/run/200d. The dawn objective re-pick parks many wanderers/explorers
  on indoor objectives, so the expedition dice often never rolls.
- **Teaching:** plant path was near-dead (the blank this lever addresses);
  monster path works (declining by construction). After the lever both fire.
- **Objectives:** the village visibly lives — VISIT/HAVEN_CHORE/GUARD/WATER/
  EAT departures and returns all fire; indoor life (eat, sleep, chores,
  visits, teach-flavor) reads in the narration feed.
- **Deeds/outshining:** deeds fire and surface (kill/stood-down/haul/
  rescue/mapped). The contest board moves.

## Village assessment (plain words)

The village feels inhabited: people set out to find each other ("Nobody
walks alone today"), come back with water, sit and eat without talking,
tend fires, and a few walk far and come back changed (or don't). Two
things are missing: (1) almost nobody teaches — explorers return with
knowledge they never pass on unless the player interrogates them (the
lever opens this channel); (2) the middle of the roster is static —
foragers/homebodies cycle VISIT↔HAVEN_CHORE↔idle with little differentiation
over 200 days (agency tiers: 175/211 villagers never leave t0).

Who thrived: bold explorers/wanderers with rangy occupations — they rack
XP, kills, deeds, and trust (the mantle math favors them, as designed).
Who died: expeditioners (combat 88% of villager deaths) and the player
(combat 65%, starvation 34%). Missing capabilities: plant-teach cadence
(fixed by lever), honest deed reporting (fixed), teach conversation
records (fixed).

## Blanks FILLED (commit 6b82fedc, proof 17/17 ×3)

1. **Dishonest 'taught' deeds** — every ask recorded "taught you something
   from the wild" + trust +2 even with no lesson (133/160 baseline asks).
   Now fires only when a lesson lands (taughtMid || taughtPlant).
2. **Teaching left no transcript** — agencyTurn bypassed the convoTurn
   wrapper; the whole teaching conversation was invisible in dialogue
   history. Now speaks through `sayLine` (transcript beats + no-repeat
   ledgers), player's question recorded, transcript slice returned.
3. **Verbatim repeats** — the same generic line 3 asks in a row (observed
   in sense read). Lines now name the taught plant/monster (specific by
   construction); sayLine's per-convo + run-wide ledgers block any repeat,
   with an honest fallback.
4. **Stale chore tags** — census showed `VISIT/out(fire)`,
   `GUARD/out(teach)`: objPick now clears `o.chore` on fresh picks.

## Blanks DOCUMENTED (not fixed — out of lane or queued)

- **Water-fetch to a full cistern** (sense read): "returns with 8L, but the
  cistern only holds 0L more" ×6+ — villagers haul water nobody can store.
  Fetch trigger doesn't check capacity. Water/objective area.
- **Betrayal-beat duplication in transcripts**: the same THEM beat twice in
  a row (observed 2/2 sense runs, main convoTurn path, not agency).
  Conversation-engine area.
- **Pre-existing test failures** (verified on pristine HEAD~1 code, not
  mine): `test-villager-agency.js` "monster: kill reachable" 1 fail;
  `test-villager-agency-20261007.js` harness crash (`Game.daylifeOf is not
  a function` — stale test vs current API).
- **HAVEN_CHORE 'teach' is theater**: objTick's teach chore says "showing
  someone something from the wild" but transfers nothing (no
  agencyTeachPlant call). Real fix would spend teachable entries — kept out
  of this run to protect lever attribution; queued.

## Sense findings (transcripts read, seed 7)

- Agency teach conversation, after fix: "The Flashbulb Moth — the tracks,
  the sound it makes before it moves, where not to stand. That's the one
  that matters." — specific, sensical, in-transcript. Before fix it was the
  same generic line 3× with an empty transcript.
- Ordinary conversation (Kayden): real back-and-forth — grief, a buried
  food bundle (+882 kcal, consequence), mourning thread. Reads human.
  (Minus the duplicated beat noted above.)
- Ambient lines: departures/returns/visits/guards all read as people
  doing things, with motive in the line. No robotic repetition except the
  cistern waste noted above.
- Objective census: differentiated — one villager on LEAVE (walking away
  for good), one on expedition at (0,0), visits, guards, indoor eaters.
