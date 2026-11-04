# Journey leg ESTABLISHMENT — r99 pre-registration (2026-11-04)

## Leg
Establishment, days 14–40 window, 42-day horizon (r71/r84/r85/r86 precedent).
Death-aware: stop after 10 consecutive all-dead daily checks; never tick a
dead village to fill the leg.

## Leg question (fresh — NOT a re-proof of r85/r86)
r85/r86 settled the wave question (wave 3 on 8/8 seeds, kill-earned, at the
day-25 floor) and the armor question (attempts happen, zero pieces crafted
in-window on 8/8 seeds). The leg definition also promises "village
routines, specialists, pantry, first contests" — none of which r85/r86
scored. This run asks: in the establishment window, does a specialist
economy actually emerge — villagers learning and teaching real skills
beyond their starting occupations — and do first contests fire and
resolve with real stakes, or does the village run on starting occupations
plus the player alone?

## Why this question is fresh
- r86 telemetry shows the raw material exists: seed 1201 alone logged
  57 villager_skill rows, 25 skill_lesson rows, 2 skill_taught rows,
  6 villager_level_up rows — but no run has ever counted distinct
  learners, distinct skills, or whether teaching crosses between
  villagers (vs. the player teaching everyone).
- r85 M6 (descriptive) found 1–4 contests fired per seed, all but one
  ended (won); no run has checked whether a fired contest ever dangles
  unresolved to day 42, or who the contest touches.
- Canon read: docs/CANON.md + docs/MONSTER-WAVES.md (wave gates, already
  settled — recorded as background only this run). No canon doc covers
  specialist emergence specifically; the skill flow is taken from landed
  code + the r86 telemetry shapes, not invented.

## Method
- Driver: `scripts/journey-establishment-r99-20261104.js` — clone of the
  r86 driver loop (competent policy, 3 day-parts/day, fights + contests
  driven, sleep) with NO favor wedge, NO door-walk, NO travel-out, plus
  read-only skill-economy instruments: telemetry rows of types
  skill_lesson / skill_taught / villager_skill / villager_grant /
  villager_level_up / villager_seek_knowledge (day, actor, skill), and a
  best-effort per-person skills list in the end census. Kept from r86:
  wave/ledger daily trace, armor attempt signals + equipped slots,
  per-dawn material trace, daily alive + pantry trace, end census,
  2 held end-of-run convos (goon-first, r81–r86 method).
- Analyzer: `scripts/analyze-journey-establishment-r99-20261104.js`
  (r86 analyzer + skill/contest-dangling summary).
- Seeds (fresh, unused band): 1301, 1302, 1303, 1304. One process per seed.
- Policy: `competent` (default switches; COMPETENT_CRAFT_ARMOR unset = on).
- Base: master at branch time (worktree `journey-establishment`).

## Pre-registered metrics (BINDING — §14; a miss is NO-GO, never re-scored)
- M1 SPECIALIST-EMERGENCE (descriptive, with a named interesting bar):
  per seed: distinct villagers appearing in skill rows, distinct skills,
  skill_taught count + first taught day, and whether any skill_taught
  actor is a non-player villager (teaching crossing between villagers).
  INTERESTING if >= 3/4 seeds show >= 2 distinct learners AND >= 1
  skill_taught row; a panel where teaching never happens, or only the
  player teaches, is a blank (specialists never emerge in-window).
- M2 FIRST-CONTESTS (descriptive): contests fired per seed, ended vs
  dangling at day 42 (fired minus ended), outcomes. INTERESTING if any
  seed dangles a contest to day 42, or any seed fires zero contests.
- M3 SURVIVAL-42 (guardrail, r85/r86 precedent): village not over AND
  >= 1 villager alive at day 42. GO: >= 3/4 seeds.
- M4 PANTRY-GUARDRAIL (guardrail): no death with cause matching
  starvat|hunger|thirst before end of run. GO: >= 3/4 seeds with zero
  such deaths.
- M5 PEOPLE: 2 held convos per seed, read IN FULL, judged on meaning /
  coherence / consequence (SENSE-TESTING LAW) — verdict per convo in the
  run note, not exchange counts. A nonsense convo is a blank to fill or
  document.
- M6 ARMOR-REPLICATION (descriptive, NON-binding): armor craft attempts
  (player + NPC attempt signals, r86 method) and pieces made, as an
  r85/r86 replication check on fresh seeds. A third 0/4 strengthens the
  bootstrap-gap finding; it does not re-bind this run.
- Background only (NOT scored): wave reached, wave-2/3 arrival days,
  ledger points — r86 already settled these; recorded so a regression
  would be visible, not judged.

## What counts as an interesting finding
- A village where a non-player villager teaches another villager a real
  skill in-window: specialists emerging without the player.
- A panel where skill_taught = 0 everywhere despite dozens of
  villager_skill rows: learning without teaching — the specialist
  economy never closes the loop.
- A contest fired but never ended by day 42, or a seed with zero
  contests: the leg's "first contests" promise not firing.
- Either way: no re-scoring against a friendlier metric mid-run. If a
  metric proves wrong, it goes under "metric review" for the NEXT run.

## Out of scope
- No armor-on vs armor-off panel (still needs a villager-armor toggle
  that does not exist). No wave re-scope verdict (r86 delivered it).
  No game-code change unless the run finds a concrete, fixable blank;
  any fix gets its own proof test and a re-run of affected seeds.
- No live-build screenshot pass this run (no dialogue/UI change is in
  scope); the people check is transcript-based, as in r81–r86.
