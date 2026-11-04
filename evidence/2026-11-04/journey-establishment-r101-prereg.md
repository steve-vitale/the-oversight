# Journey leg ESTABLISHMENT — r101 pre-registration (2026-11-04, Lane A)

## Leg
Establishment, days 14–40 window, 42-day horizon (r71/r84/r85/r86/r99 precedent).
Death-aware: stop after 10 consecutive all-dead daily checks; never tick a
dead village to fill the leg.

## Leg question (fresh — NOT a re-proof of r99)
r99 settled the villager side of the specialist economy: NPC→NPC lessons
16/23/22/18 per seed, every one villager-to-villager, first taught day 3–5.
It left the player side explicitly untested: the competent policy never
holds teaching conversations, so teacher='player' lessons were 0/4 seeds.
This run asks: if the player deliberately seeks teaching conversations
every day in-window, can they teach a villager a real skill — and does the
lesson land (learner gains it), read as a real conversation, and ever get
used or taught onward? The gates are known from code
(src/js/skill-teaching.js: trust 15+, a shared language, one lesson per
learner per day, 3 ticks for the player's lesson); what is NOT known is
whether a real player ever clears them in-window, because the player
starts knowing few skills, trust builds slowly, and the menu only offers
what already passes.

## Why this question is fresh
- r99's metric review named it directly: "Future runs should also
  separate player-taught lessons by driving a teaching conversation,
  since competent policy alone never teaches."
- No canon doc covers specialist emergence specifically (r99 recorded
  this); the mechanic is taken from landed code (skill-teaching.js
  header rules) + docs/CONVERSATIONS.md, not invented.
- This is a blank about REACHABILITY of a promised verb ("I could show
  you X."), not a re-score of r99's villager economy. The villager-side
  counts are recorded descriptively only, never re-judged.

## Method
- Driver: `scripts/journey-establishment-r101-20261104.js` — clone of the
  r99 driver loop (competent policy, 3 day-parts/day, fights + contests
  driven, sleep, daily alive/pantry trace, end census, wave/ledger trace)
  PLUS one teaching-seeking conversation per day, attempted at dawn
  before the day-parts:
  - Candidate = a living non-player villager for whom
    `teachableSkills('player', vid)` filtered by `canTeachSkill(...).ok`
    is non-empty. Roster order, rotating start index by day so the
    intervention spreads instead of always picking the first villager.
  - If a candidate exists: `startConvo`, pick the `skill_teach:<skill>`
    choice if the menu offers it (full transcript recorded); if the menu
    does NOT offer it although the computation said ok, record a
    menu-mismatch with the full choice-id list and end the convo
    unpicked. Verify the lesson by the telemetry `skill_lesson` row
    (teacher='player') and by `npcKnowsSkill` before/after.
  - If no candidate exists: no convo is opened; the day's gate census
    is recorded from `canTeachSkill` (first teachable gap per villager,
    `why` counted: trust / words / today / teacher / known / gone).
  - Teaching convos never pick `skill_learn:` (player learning) or the
    plant `teach` choice — the intervention stays pure player-teaches,
    and the reverse direction is descriptive only (offers seen).
- Analyzer: `scripts/analyze-journey-establishment-r101-20261104.js`
  (r99 analyzer + player-teach summary: offers, picks, lessons, gate
  census, onward-use check).
- Seeds (fresh, unused band): 1401, 1402, 1403, 1404. One process per seed.
- Policy: `competent` (default switches; COMPETENT_CRAFT_ARMOR unset = on).
- Base: master at branch time (worktree `journey-establishment`).
- Pilot FIRST: seed 1401 alone, before the panel. If the pilot shows the
  teaching loop itself is broken (crash, menu never matches computation,
  convo state corrupts later days), fix the instrument and re-pilot
  before scoring any panel seed. If the pilot shows zero offers with a
  clear gate reason, that is a finding, not an instrument failure — the
  panel still runs to measure how universal the gate is.

## Pre-registered metrics (BINDING — §14; a miss is NO-GO, never re-scored)
- M1 PLAYER-TEACHES (interesting bar): per seed, >= 1 `skill_lesson` row
  with teacher='player' AND the learner verified knowing the skill
  after (npcKnowsSkill). INTERESTING if >= 3/4 seeds meet it; a panel
  with 0/4, or offers that never appear, is a blank (the player-teach
  verb is unreachable in-window as played).
- M2 OFFER-RATE (descriptive, with named bars): per seed, teaching days
  attempted, candidate days, menu offers seen, picks made, lessons
  completed, menu-mismatches. A mismatch count > 0 is a UI-fidelity
  blank regardless of M1.
- M3 GATE-CENSUS (descriptive): on no-candidate days, the dominant
  `why` (trust / words / today / teacher / known). The run reports
  which gate binds; it does not re-score M1 against a friendlier gate.
- M4 SURVIVAL-42 (guardrail, r85/r86/r99 precedent): village not over
  AND >= 1 villager alive at day 42. GO: >= 3/4 seeds.
- M5 PANTRY-GUARDRAIL (guardrail): no death with cause matching
  starvat|hunger|thirst before end of run. GO: >= 3/4 seeds with zero.
- M6 PEOPLE: the teaching convo transcripts (at least one completed
  lesson convo per seed that has one; else the fullest attempted convo),
  read IN FULL, judged on meaning / coherence / consequence
  (SENSE-TESTING LAW) — verdict per convo in the run note, not
  exchange counts. A lesson that lands but reads as a bare system line
  with no human content is a blank to document.
- M7 ONWARD-USE (descriptive, NON-binding): for each player-taught
  (learner, skill), any later `skill_lesson` row with teacher=learner
  and that skill, or any later `villager_skill` row for that learner +
  skill, within the 42-day window. Low counts are expected on this
  horizon and are not a failure of M1.

## What counts as an interesting finding
- A player-taught lesson landing in-window on most seeds: the verb is
  reachable, and the r99 zero was purely a policy artifact.
- Zero offers on most seeds with one dominant gate (e.g. trust never
  reaching 15 in-window, or the player knowing no skill any villager
  lacks): the verb exists but is unreachable as played — a blank to
  fill (menu honesty, earlier trust, or starting-skill shape), not a
  reason to re-score.
- Menu offers that the computation promised but the convo never shows
  (or vice versa): a fidelity bug between the teaching system and the
  conversation menu.
- A lesson landing that then gets taught onward by the learner: the
  specialist economy closing through the player, not just around them.

## Out of scope
- No re-verdict on r99's villager teaching economy, wave scope, or
  armor crafting (recorded descriptively only where the driver already
  instruments them).
- No armor-on vs armor-off panel. No game-code change unless the run
  finds a concrete, fixable blank; any fix gets its own proof test and
  a re-run of affected seeds.
- No live-build screenshot pass this run (no dialogue/UI change is in
  scope unless a menu-mismatch blank forces one); the people check is
  transcript-based, as in r81–r99.

## Metric review (carried from r99, applied here, not re-litigated)
- Contest "dangling" excludes contests fired within 2 days of run end
  or on the scatter day: r99's count fired on truncation, not on stuck
  contests. A true stuck contest fired >= 3 days before run end with
  no end row.
- Census `equipped` for the first roster member duplicates the player's
  equipped list (r99 finding); treat first-row equipped as unreliable.
  matTrace armor is the reliable armor source.
- Census `skills` per person is null everywhere (no such person field);
  telemetry skill rows + npcKnowsSkill checks are the only skill
  sources. Do not re-add a census-skills instrument without finding
  the real field first.

## Instrument correction (pre-scoring, pilot seed 1401 only)
The v1 driver checked ONLY the opening menu for `skill_teach:`. Pilot
1401 on v1 scored 42/42 'mismatch' — but that was the instrument, not
the game: conversation.js suppresses pivots (including skill lessons)
while a direct question hangs (`suppressPivot = reactiveQ ||
genericQ || grief/cheer thread`, line 4628), and skill lessons also
ride the subject menu (`dlg:subject` -> subject menu appends
convoSkillChoices). A real player answers the question and/or changes
the subject; the v1 driver ended the convo at the opening menu instead.
v2 driver navigates like a player: answer `ans:*` choices, then take
`dlg:subject`/`subject` (then `dlg:more` at most 3 turns), up to 8 turns,
picking any `skill_teach:*` offer found, and records every menu visited
(`menusVisited`) when none is found (kind `nomenu`). M1's bar is
UNCHANGED (>= 1 verified player lesson on >= 3/4 seeds); only the search
procedure changes, to match real play. Pilot seed 1401 is re-run on v2
so the whole panel shares one instrument; the v1 pilot is discarded
from scoring (its trajectories are not comparable — v1 convos ended
immediately, v2 convos answer and navigate).
