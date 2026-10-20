# Journey — crisis leg r35 (lane B): the siege season, social-fabric lens (2026-10-20)

**Pre-registration** (MEASUREMENT.md §§9–12, 14):
- **Leg question:** During a sustained monster-siege season, do villagers act
  like people — organizing defense, tending the wounded, grieving the dead —
  or does the village break (unfought raids, untended wounds, unmourned dead,
  panic/desertion)?
- **Prior art:** r10 (2026-10-15, siege+famine), r28/r29 (2026-10-19,
  schism/exile), r30 (2026-10-19, raid defense beat narration in game.js),
  sim-raidstand/raidwall/scholarraid (2026-10-19, flesh-out balance levers —
  death RATES, not social fabric), r32 (2026-10-20, disease outbreak,
  clean bill), r34 (2026-10-20, famine — sieges dominated the death profile
  but the siege social response was unassessed). This run takes the
  social-fabric lens the raid sims did not.
- **Canon:** docs/MONSTER-WAVES.md (wave law; "Monster encounters are fought,
  not rolled", Steve 2026-10-08), docs/CORRUPTION.md (fear),
  docs/PRESERVATION.md (pantry defense relevance), Steve: "violence desperate
  and traumatic, not power fantasy".
- **Interesting-finding bars (any):** (a) ≥2 raids with zero defender
  engagement AND zero lingering response (unfought siege); (b) wounded
  villagers (health<70) with no triage while raid relief is open (untended
  wounded); (c) siege death with no mourning response within 7d; (d) raid
  dialogue reading as theater (fabricated history, filler loops).
- **Seeds:** 101, 202, 303 (pilot; continuity with r34). **Policy:** oracleV2
  (competent). **Horizon:** establish 20d + 70d siege season (90d), death-aware
  stop (+10d tail max, never tick a dead village).
- **Staging:** none — raids are reactive (havenRaidTick in the daily tick:
  3+ world monsters, 3k+ pantry, 7-day cooldown, 18% roll). r34 saw 8–12
  raids/45d naturally; the pilot confirms density before judging.
- **Bound metrics (§14):**
  - M1 (siege is lived): ≥3 raids per seed in the 70d window. GO if met
    (else the run cannot judge — restage, never re-score).
  - M2 (defense organizes): ≥50% of raids have ≥1 defender engagement
    (resolveWildMonsterEncounter {raid:true} records). GO if met.
  - M3 (the wounded are tended): raid relief opens after ≥50% of fought raids
    (raiseRelief('raid')), AND triage is taken when wounded exist. GO if both.
  - M4 (the dead are mourned): ≥80% of siege deaths (monster/raid cause)
    get first-grave within 7d OR a grief convo surfacing mourning. GO if met.
  - M5 (no theater): 0 fabricated-history lines in raid transcripts
    (sense-read). GO if 0.
- **Driver:** scripts/journey-crisis-r35-siege-20261020.js (call-through
  instrumentation only: havenRaidTick, say-filter, resolveWildMonsterEncounter
  {raid:true}, raiseRelief, answerRelief, registerDeath, fireCrisis,
  buryCorpse; driven defense/grief convos with the r34 fixed instruments).

## Rotation note

Found journey-rotation-b.txt = 6 at run start (r34 advanced 5→6 before dying;
its work was timeout-recovered and landed as b7ed22d20). Playing leg 6
(crisis), the siege-season flavor — famine (r34) and outbreak (r32) were
covered today. Next index after this run: 7.

## Stale-lock recovery

Lock from the 14:00Z run (r34) was still present at 15:01Z; its worktree
heartbeat was 14:44:41Z (~17 min stale, past the 15-min bar) and the run hour
had ended — declared dead per the guard, lock deleted, "stale-lock recovery"
noted. Registered a distinct slug (journey2-crisis-r35) since the dead run's
slug was still registry-active. The dead run's tree was timeout-recovered
mid-my-run (b7ed22d20 landed its driver+evidence+mourning expansion); its
registry entry was released and the tree removed. No work lost — verified the
landed commit contains r34's full payload (driver, evidence, 18-line
convoTopics.js mourning expansion, proof test).

## Results — timeout recovery (2026-10-20, lane B r36 run completed r35's writeup)

The r35 run died after the sims completed but before results were written.
All three pilot seeds finished cleanly (ended d91/d92/d92, no game-over,
death-aware stop never triggered). The recovery below analyzes the landed
evidence as-is; nothing was re-run.

### Metric verdicts (§14 binding)

| Metric | Bar | 101 | 202 | 303 | Verdict |
|---|---|---|---|---|---|
| M1 siege is lived | ≥3 raids/seed | 8 | 9 | 8 | **GO** |
| M2 defense organizes | ≥50% raids with ≥1 defender | 8/8 | 9/9 | 8/8 | **GO** |
| M3 the wounded are tended | relief after ≥50% fought raids + triage taken | 7/8, triage 14/14 | 7/9, triage 7/10 (3× noneed = no wounded) | 5/8, triage 11/11 | **GO** |
| M4 the dead are mourned | ≥80% siege deaths get first-grave ≤7d OR grief convo | ~19% | ~12% | 0% | **NO-GO** |
| M5 no theater | 0 fabricated-history lines | 0 (sampled) | 0 (sampled) | 0 (sampled) | **GO** |

### What the numbers say

- **Defense is total.** 100% of raids met organized defenders (Courtney,
  Willie, Aurora, Shaaban core across seeds). Fight outcomes are mFlee-heavy
  (31/37, 30/43, 27/31) — villagers drive raiders off more than they kill,
  which reads as Steve's "violence desperate and traumatic, not power
  fantasy" in the wild. Lingering raiders remained after 3 raids
  (101:d88×2, 202:d54×1/d62×2, 303:d69×2) — their fate unassessed, filed
  as named next.
- **Triage is honest.** The policy answered triage every time wounded
  existed; 'noneed' fired only when nobody was hurt (202 d11–13). Raid
  relief opened after 62–88% of fought raids. The wounded are tended.
- **Attrition is brutal, villages hold.** 12 → 9/10/7 over ~90 days.
  Death causes mix combat, expedition, monsters (Dustboar, White Noise),
  dehydration. Pantries overflow (11k–115k kcal) — competent villages do
  not famine; consistent with r34 (forced famine required).
- **The dead are grieved in dialogue, not in mechanics.** first-grave
  fired 2/1/0 times (it is a once-per-run beat by design — the 2 in seed101
  needs a look, likely re-armed); grief convos were driven once per seed.
  The mourning pool (r34) sense-reads as people: "Since Ananya died... I
  keep expecting to see Ananya at the fire. Stupid." / "Ananya always took
  the burnt piece. Said someone had to. I take it now." / "We bury, we
  grieve, we keep going. There's no step four." Seed202 opened with "We
  gave them a good burial. Doesn't feel like enough, does it?" — the
  grief engine is alive. But per-death mechanical mourning (grave beats,
  targeted grief convos) does not reach most siege dead.

### Metric review (§14)

M4 as written is NO-GO, but the metric was instrumented wrong, not just
failed:
1. The driver's death instrument read `o.vid || o.id`; the game passes
   `o.villagerId` (verified in src/js/game.js registerDeath calls).
   Every person death arrived as vid '?' → the grief-targeting collapsed
   to one convo per seed. The instrument, not the game, undercounted.
2. The bar conflated the once-per-run first-grave beat with per-death
   mourning. The game's mourning = villageEvent('death') → grief dialogue
   pool (per death) + manual burial (player action, app.js corpse panel)
   + first-grave (once). Demanding first-grave per death was the wrong
   shape.
3. Also: cause 'villager combat' = MONSTER corpses killed by villagers
   (kind:'monster'), not villager deaths — the initial M4 count double-
   counted kills as losses. Person deaths ≈ total minus 'villager combat'.

**Proposed revision for the next crisis run:** measure per-death grief
reach as spontaneous grief-topic NPC lines in sayLog within 7d of each
person death (kind:'person' filter on registerDeath opts), plus whether
buryCorpse is offered/used when a person corpse persists. Bind that,
not this bar.

### Blanks filled / documented

- **Documented (no code fix warranted):** mourning per-death reachability
  by the game's own systems is unproven — the r35 grief convos were
  driver-forced. Burial is correctly a manual player action (earned
  visibly), not a bug; Aurora's "We bury, we grieve" is color, not false.
- **Documented (polish):** the Taken pod-dream line ("rows of them,
  humming... I can't tell if it was a dream or a broadcast") is
  byte-identical across two NPCs. Shared trauma, but the phrasing should
  vary per person (unique-person law).
- **Filed as named next:** lingering-raider fate after 3 raids (lingeringAfter
  > 0); spontaneous (non-driver) grief-dialogue reachability per the
  revised metric above.

### Village assessment (plain words)

Three competent villages under a 70-day siege season. Everybody fights —
the same names keep meeting raiders at the door, and the relief tent goes
up after most raids. The wounded get bandaged. People die anyway: a
quarter to a third of the village over the season, and the survivors talk
about them like people, not counters. The pantry stays full — sieges kill
people, not food. Nobody deserts, nobody panics, nobody leaves a raid
unfought. The village bends (fewer faces at the fire) and does not break.

### Reachable / fun / winnable

- **Reachable:** yes — raids fire naturally off pantry size and world
  monsters (8–9 per 70d window, no staging).
- **Fun:** the siege beats land — raid narration, relief triage, grief
  dialogue all read as a living village under pressure. The mourning
  writing is some of the best in the game.
- **Winnable:** all three villages survived the season with 7–10 alive;
  the siege is a tax, not a wall.

### Telemetry check

Skipped-instrument-incompatible: telemetry-baselines/crisis.json carries
paths (defenderFights, defendedCount, latelyDefenseCount) absent from the
r35 record schema — running the check would fire schema-artifact LOUD
lines, and rolling the baseline would cement the mismatch. Named next:
align the crisis schema before the next run seeds a fresh baseline.
