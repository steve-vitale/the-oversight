# journey-scale r29 — PRE-REGISTER (written before any sim, 2026-10-24, lane A leg 3 SCALE)

**Leg question:** r28 proved the LEAD national beat's famine-reserve line is
announcement-only on the lead road (leaguePoolKcal 0 on all seeds — the lead
road has no pool). The covenant road is the one with a pool. In the wild,
under competent covenant-road play, does the league granary actually FILL
from real pantries, and does its famine draw ever FIRE?

**Code reading before the run (not a substitute for the wild test):**
- Pool fills weekly in hierarchy linkTick: Haven's share + each member's share
  from their own stores (short pours cost trust, said aloud).
- Draw fires in villageEats: pantry bare (<=0 kcal) at day start AND pool > 0
  -> draw min(pool, 7-day rolling burn), said aloud twice (famine framing +
  "Haven draws X kcal ... remain under no one's roof").
- So the draw can only fire on a seed that BOTH forms a pool-live covenant
  link AND ends some day with a bare pantry. Competent play rarely ends a
  day bare — the trigger may never arm. That outcome is a finding, not a
  re-score (see C2).

**Policy:** scalecourt (competent + covenant-road courtship). **Seeds:**
fresh 84001-84004. **Horizon:** DAYCAP=150, death-aware stop. **Pilot:**
seed 84001 runs clean before the other three launch.
**Driver:** scripts/journey-scale-r29-20261024.js (r28 driver, policy swapped
leadcourt->scalecourt, + weekly poolWatch samples). **Analyzer:**
scripts/analyze-scale-r29-20261024.js.

**Binding metrics (§14 — a miss is NO-GO, never re-scored):**
- C1 pool fills: leaguePoolKcal > 0 at end (or pool ever sampled > 0) on
  >=3/4 seeds that form >=1 covenant link. If fewer than 3 seeds form a
  covenant link, C1 reads NOT-ARMED (link formation is the gate, not the pool).
- C2 draw when armed: on any seed where a bare-pantry day-start occurs
  while pool > 0, a granaryDraw line fires. GO if every armed day draws;
  NO-GO if an armed day passes with pool > 0 and no draw. If NO seed ever
  arms the trigger (no bare day-start with pool > 0), C2 reads NOT-ARMED —
  a finding about trigger rarity, stated here in advance, not a GO.
- L1 stay-green: national <=d140 on >=2/4 seeds (covenant road may run
  slower than lead's 3/4 in r28; bar set lower in advance).
- L5 stay-green: every scatter/wipe ending voiced in full; no silent death.
- M4 people: convo transcripts at d90/d120 sense-read (want/engage-or-deflect/
  resolve-plant-owe); senseless-as-played transcripts named, not hidden.

**Findings (not binding):** court-calendar lines after the first court on the
covenant road (r28 found 0 on lead); pool short-pour trust voicing; seat arc
on covenant national seeds.
