# Journey leg ESTABLISHMENT — r102 pre-registration (2026-11-05, Lane A)

## Leg
Establishment, days 14–40 window, 42-day horizon (r71/r84/r85/r86/r99/r101
precedent). Death-aware: stop after 10 consecutive all-dead daily checks;
never tick a dead village to fill the leg.

## Leg question (fresh — NOT a re-proof of r99/r101)
r99 proved villagers teach each other in-window (16–33 NPC→NPC lessons per
seed). r101 proved the player can teach too (126 player lessons, 4/4 seeds)
and left exactly one open item in its metric review: its onward-use
instrument counted the lesson's own track echo, so "used" was never
actually measured. This run asks: **after a skill is taught in-window,
does it get USED afterwards — in a way visible in the game's own record
— or does learning stay a ledger entry?** The instrument is strict by
design (see below); a low visible-use rate is a finding about the
record and/or the game, not a re-score of r99/r101's lesson counts,
which are recorded descriptively only and never re-judged.

## Why this question is fresh
- Named directly by r101's metric review as the next instrument to build:
  "exclude rows on the lesson day itself, or require the skill to fire in
  a fight/craft row."
- Canon: docs/CANON.md (human skills ≠ alien abilities; skills are
  teachable earthly knowledge, learned at L1, "it levels by use" —
  src/js/skill-teaching.js header). No canon doc covers specialist
  emergence specifically (r99 recorded this); the mechanic is taken
  from landed code, not invented.
- This is a blank about USE of a proven verb, not a re-proof that
  teaching happens. The role-census running in another lane measures
  long-run task profiles (days 90–121); this run is leg-scoped
  (days 1–42) and lesson-scoped, not a duplicate of it.

## Method
- Driver: `scripts/journey-establishment-r102-20261105.js` — r101 driver
  clone with the teaching intervention REMOVED (natural lessons only:
  NPC→NPC and NPC→player, competent policy driving fights/contests/
  sleep as in r101). The unused `attemptTeach` function remains in the
  file (dead code in a sim driver, never called); the people check
  (2 held convos at end of run) is kept. Additions over r101:
  full telemetry dump (`teleAll`, sequence-indexed, so ordering uses
  sequence, not the skipping/repeating scholar-day labels flagged in
  r101's metric review), end census skills via the real
  `Game.skillsKnownBy(vid)` API (r99/r101 census `skills` was null),
  player codex-skills snapshot, villager `avCraft` snapshot.
- Analyzer: `scripts/analyze-journey-establishment-r102-20261105.js`
  (written after the pilot seed inspects raw lesson-row shape; the
  analyzer may change, the metrics below may not).
- Seeds (fresh, unused band): 1501, 1502, 1503, 1504. One process per
  seed. Pilot: seed 1501 runs first; if the raw `skill_lesson` row
  shape differs from the r101 assumption, the analyzer is corrected
  before scoring and 1501 is re-run so the whole panel shares one
  instrument.
- Policy: `competent` (default switches; COMPETENT_CRAFT_ARMOR unset = on).

## STRICT-USE instrument (binding definition)
For each telemetry `skill_lesson` row L (teacher, learner, skill, seq S):
- EVIDENCE = a telemetry row R with sequence index > S, R.type is NOT
  `villager_skill` (the grant echo is excluded entirely, on any day),
  and R names the learner as an actor (vid/teacher/learner/who field,
  resolved through the census id↔name map, 'player' kept as-is) AND
  names the skill (skill/ability/track/id/item field, with
  skill-lane abilities mapped to their skill via data.abilities
  lane='skill' skillId where the row carries an ability id).
- Categories (a lesson counts once, first evidence wins):
  (a) ONWARD — R.type == 'skill_lesson' with teacher == learner and
      skill == L.skill (the learner teaches it onward);
  (b) CRAFT — R.type in ('armor_craft','ammo_craft') with vid == learner
      and item == L.skill (armor lessons are recorded as recipe ids);
  (c) ABILITY — R.type == 'ability_used' with the ability's skill ==
      L.skill and learner == 'player' (player-only attribution: in this
      driver the player's fights go through useAbility; villager
      field-fight ability use has no actor field and is explicitly
      NOT counted here — see limits);
  (d) OTHER — any other row type meeting the actor+skill rule.
- Player-learned skills additionally: player codex skill level at end
  vs the lesson (a level increase after the lesson is practice-use
  evidence, reported descriptively, not counted in the strict rate
  unless it also appears as (c)).
- Lessons on the final day of a run, or where the learner dies before
  any later row exists, are counted in the denominator and flagged
  (no-opportunity), never dropped.

## Binding metrics
- M1 LESSONS (descriptive baseline, must be non-zero to judge M2):
  natural lessons per seed; GO if ≥5 per seed on ≥3/4 seeds and ≥3
  distinct skills per seed on ≥3/4 seeds (r99's floor, not its verdict).
- M2 STRICT-USE (the leg question): share of lessons with strict
  post-lesson evidence. Verdict labels, fixed now:
  USE-VISIBLE if ≥1/3 of all panel lessons have evidence;
  USE-INVISIBLE if <1/3. Either label is reported with the per-category
  and per-skill breakdown — a low rate names WHERE use is invisible
  (which skill families, which categories are empty), it is not
  silently re-scored.
- M3 SURVIVAL-42: GO if ≥3/4 seeds alive at 42 (no scatter).
- M4 PANTRY-GUARDRAIL: GO if starvation/thirst deaths are zero on
  ≥3/4 seeds (r101 standard).
- M5 PEOPLE: PASS if the 2 held convos per seed, read in full, are
  coherent (NPC wants something, options engage/deflect, endings
  resolve/plant/owe; no fabricated shared history, no filler loops).

## Known limits (stated before scoring, not discovered after)
- Villager non-armor skill use in fights/crafts has no actor-attributed
  telemetry row (ability_used carries no actor; field-fight records
  carry action kinds, not skill attribution). If M2 comes back low,
  the verdict is "invisible in the record" first and "unused in the
  game" only where a category SHOULD have fired (armor craft, onward
  teaching, player ability use). A tooling fix (actor on ability_used)
  may be proposed, not smuggled in as a game fix.
- Scholar-day labels skip/repeat (r101 metric review): all ordering in
  this run uses telemetry sequence index; scholar days are display only.
- Census `equipped` first-row duplication (r99) still stands; not relied on.

## Metric review (for the NEXT run, not this one)
- To be written after scoring. Candidate: actor-attributed ability use
  for villagers, so field-fight skill use becomes measurable.
