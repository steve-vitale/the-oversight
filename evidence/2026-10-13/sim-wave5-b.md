# Wave-5 reachability confirm (2026-10-13) — MEASUREMENT ONLY

Arm: wave5-confirm — wave-pacing lens on the scale-onramp axis.
Commit under test: worktree tip (Standing bar e7c18b85, tuned e02c10a1).
No game-code changes in this run — analysis scripts + evidence only.

## Pre-registration (docs/MEASUREMENT.md §§9–12)

- **Primary metric**: wave-5 unlock rate (organic; no gates forced).
- **GO threshold**: DIAGNOSTIC — suite completes (16/16 runs finish honestly)
  and T5 reachability is characterized with numbers. If 0/16 unlock: name the
  binding constraint with numbers (max Standing reached per source, T4 day,
  the day villages died — points vs survival).
- **Horizon**: 180d death-aware (Steve's win-path horizon 180). runDays
  breaks on village-lost/pop-zero, so dead villages stop simulating; +10d
  tail inherent, no post-death projection.
- **Seeds/policies**: 11/22/33/44/55/66/77/88 × leadcourt + belongseek — the
  two high-standing roads from the tune sweep (6/8 leadcourt T4 unlocks;
  belongseek closest hybrid).

## Result

**PRIMARY: wave-5 unlock rate 0/16 = 0.000. T5 standing reached on 0/16.**
Suite completed 16/16 honestly — GO (diagnostic) met: T5 reachability is
characterized. The verdict: **wave 5 is unreachable under the current
Standing bar in honest long-run sims. The binding constraint is POINTS, not
survival.**

### The binding constraint, with numbers

- Max Standing ever reached: **127** (leadcourt s66: war 25 + diplomacy 102).
  Median end Standing: **68** (war 0 / diplomacy 68 / plenty 0).
- T5 needs 200. Closest run was 73 short.
- Diplomacy saturates at **3 seasoned links = 102** in every leadcourt run —
  nobody proposes/seasons a 4th link. War maxed at 2 wave-3 kill pts (50).
  Plenty maxed at 0 major feasts on all 16 runs.
- Survival does NOT bind: the longest survivor (leadcourt s11, d149) sat at
  **102 from d78 to d149 — 71 days with zero Standing growth**. Villages die
  with a full, saturated bar, not an empty clock. Giving more days changes
  nothing; the earning avenues are exhausted by ~d80.
- T4 context: 7/16 unlocked wave 4 (all diplomacy, all d57 except s11 d78);
  median survival 78d, max 149d.

What would open T5 (documented, not chased — this arm is measurement):
a diplomacy path that seasons more than 3 links (6 links = 204 is the pure
road), a war road where courtship policies can actually earn wave-3+ kill
pts (villager combat competence work is already queued), or major feasts
happening at all. All three are systems work, not weights work.

## Wall numbers (every run)

- national 0/16, table 0/16, won 0/16, exiled 0/16
- wave-4 unlocks: 7/16 (earliest d57, median d57, all diplomacy)
- wave-5 unlocks: 0/16
- median survival 78d, max 149d
- arc reach: 3 (all 16 runs)

## Death-cause shares (16 runs)

player:combat 32 (the scholar died ~2x/run on average — respawns as a
villager, resetting courtship momentum), player:starvation 5,
player:contest 5, villager:combat 86, villager:monster 22,
villager:villager combat 20, "a wound that wouldn't close" 13,
villager:starvation 10, villager:sickness 10, villager:wound_fever 4,
villager:thirst 2, villager:expedition 1, villager:contest 1.
Combat is the village's main killer — wave-1 ambushes plus the wave-4
losses below.

## Wave-4 fight sense-test (SENSE-TESTING LAW: read the fights)

6 wave-4 fights sampled across leadcourt s11/s66/s88 (transcript dumper:
scripts/dump-fight-wave4-20261013.js; raw logs /tmp/wave4fight-{11,66,88}.log):
**4 player deaths, 2 routed.** The fights FUNCTION — they are not a death
sentence by construction, but for these policies' builds they are one in
practice.

- **The Algorithm (s88, d84)** — legible, dramatic, works. Thumbnails
  ("a lunge"/"a feint"/"a grab — the trailer may lie"), Engagement locks
  the target (codex entry: "moving won't dodge it"), Recommended For You
  AoE. Player struck for 56 (Phase sling); Algorithm hit 32/34/36 through
  armor (absorb 15-17) for the kill at 85 HP. Sensical fight — but the
  player went in alone with an improvised build against a 35-95 band
  monster. A build/survivability problem, not a fight problem.
- **The Eater (s66, d65)** — signature mechanic engine-real: it ate 300 kcal
  twice mid-fight (600 total), belly swelled, honest counterplay text
  ("Poison the meal, starve the field, or end it"). Hit 62 then 70; player
  (88 HP, armor absorbing 4) went down in 2 rounds. The monster did exactly
  what its canon says — consume and grow.
- **The Eulogy (s11 d89 routed, s66 d63 routed, s88 d84 lost)** — engaged,
  routed twice, killed once. No mechanical oddity in the transcript.

Death fallout is the village-as-protagonist promise working: the scholar's
death toppled diplomacy — "Divya is dead — and the dead hold no treaties.
Every link Haven has shakes"; Emberhold/Stonebridge/Thornfield each pressed
tribute down while the chair was empty; mantle transfer beat ("We hardly
noticed. (That is a lie. We noticed. The audience CRIED.)"); Rosa to the
new scholar: "You're not Divya." Consequence-rich, characterful, sensical.

Verdict: wave-4 monsters function as real fights with real mechanics,
honest telegraphs, and consequential deaths. For courtship-road builds,
survivability against them is nil — which is the combat-competence lever's
territory (queued), not this arm's.

## What the villages looked like (assessor's notebook)

Leadcourt villages courted well — 3 seasoned links by d57-78, standing 102,
then flatline. They never fought enough (war 0 on most) and never feasted
major (plenty 0 everywhere): the two earning lanes the courtship road could
reach were war and plenty, and both stayed closed. The village lived as a
diplomat that couldn't fight — and when wave 4 arrived (the System's
response to its standing), the scholar walked into wave-4 fights alone and
died. Belongseek villages were quieter: 1-2 links at most, never near T4.

Villagers acted like people throughout: Thornfield sent Sanne with grain
"no tribute, no ceremony" when bins echoed; Owen taught Ivy tree ID by
description; Somchai returned from the east with a story to ask about;
gossip visibly distorted by the fire. The mantle-transfer sequence is one
of the strongest beats in the game — death of the scholar is an event,
never a respawn screen.

## Blanks filled / documented

- Filled (tooling): the T5 gate proof (16/16 green, including the
  standing>=200-but-no-w4-faced lock and the deed-feed-faced unlock),
  death-cause aggregation, wave-4 fight transcript dumper.
- Documented (appended to hidden_files/sim-findings.md): T5 structurally
  unreachable under Standing in current sims — earning avenues saturate
  (dip 102 / war 50 / plenty 0 observed caps; 71 days of zero growth at
  102 on the longest run). Points bind, not survival. The fix is systems
  throughput (more seasoned links, w3+ kill capability on the courtship
  road, major feasts), not weight tuning.
- Also noted in transcripts: THE HERALD ate 1,965 kcal overnight from
  stores on s88 — if that rate recurs, it's a standing-adjacent economy
  tax; flag for a future economy run, not chased here.

## Files

- scripts/sweep-wave5-confirm-20261013.js — the sweep (reuses the tune
  run's standing helpers)
- scripts/test-wave5-confirm-20261013.js — 16/16 green
- scripts/dump-fight-wave4-20261013.js — wave-4 fight transcript dumper
- evidence/2026-10-13/sim-wave5-b.json — 16 per-run rows (standing
  trajectories, crossings, drivers, death causes)
- evidence/2026-10-13/sim-wave5-b.md — this file
