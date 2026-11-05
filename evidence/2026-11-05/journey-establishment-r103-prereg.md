# Journey leg ESTABLISHMENT — r103 pre-registration (2026-11-05, Lane A)

## Leg
Establishment, days 14–40 window, 42-day horizon (r71/r84/r85/r86/r99/r101/r102
precedent). Death-aware: stop after 10 consecutive all-dead daily checks;
never tick a dead village to fill the leg.

## Leg question (fresh — NOT a re-proof of r102)
r102 proved learning propagates (89 natural lessons, 26/89 strict-use, ALL
onward-teaching; CRAFT 0, ABILITY 0, OTHER 0) and named the missing
instrument precisely: `ability_used` carries no actor, and field-fight
records carry action kinds, not skill attribution — so no taught skill was
ever seen firing in a fight. This run builds that instrument and asks, under
it: **after a skill is taught in-window, does it get USED afterwards — in a
way visible in the game's own record — or does learning stay a ledger entry?**

## The instrument (substrate, built and committed BEFORE any scored seed)
1. `ffFired` completion in `src/js/fieldFights.js`: the Arm-4 ability
   branches already record their firing on `rec.ffFired` via `ffFired(id)`;
   the older ability sites never did. Add one `ffFired(id)` call at each
   remaining honest firing point — where the held ability's effect actually
   applies, never at a mere presence check:
   game_sense / tracker / echo_location (evade computation), ambush
   (opening strike), haymaker (round-3 windup set), draw_fire / bodyguard /
   unbreakable / shield_wall (only where the blow actually changes),
   field_medicine / patient_aim (turn spent), stalk / dead_aim / blood_trail
   / trade_of_blows (strike block). Already covered, untouched: tripwire,
   leech, freeze_tag, hogtie, shoulder_check, come_get_some,
   intimidating_presence, peacemaker, brawler_instinct.
2. `src/js/telemetry-hooks.js` wrap on `fieldFight` (observe-only, the
   file's own pattern): after the original returns, emit one `skill_used`
   row per UNIQUE id in `rec.ffFired`:
   `{vid, skill: id, context: 'field_fight', outcome}`. Deduplicated
   (shield_wall / dead_aim can fire several rounds in one fight). The wrap
   covers every return path uniformly (including the early evade return).
3. `actor` on the two `ability_used` wraps: `actor: 'player'`.
   `useAbility` is the player-facing entry point (app.js taps; the sim
   policy drives player fights through it); villager field fights translate
   abilities inline and are covered by `skill_used`, not by `useAbility`.
4. Analyzer mapping (defined here, not discovered after scoring): a row's
   skill is its skill-lane ability's `skillId` where one exists
   (`game_sense`/`tracker`/`blood_trail` → `track_read`,
   `field_medicine`/`triage` → `wound_care`, `peacemaker` → `mediate`,
   etc.), else the id itself (`stalk` → `stalk`, `dead_aim` → `dead_aim`).
   r102's analyzer returned None for non-skill-lane `ability_used` ids;
   r103 falls back to the id, which can only add evidence the strict
   definition already allowed.

## Why this question is fresh
- Named directly by r102's metric review as the next instrument to build.
- Canon: docs/CANON.md (human skills ≠ alien abilities; skills are
  teachable earthly knowledge, "it levels by use" — src/js/skill-teaching.js
  header). No canon doc covers specialist emergence specifically (r99
  recorded this); the mechanic is taken from landed code, not invented.
- The instrument changes NO gameplay: `ffFired` is a record-only array
  push, the wrap emits telemetry only, `tele()` draws no RNG. M0 below
  proves it on identical seeds.

## Method
- Driver: `scripts/journey-establishment-r103-20261105.js` — r102 driver
  clone (same competent policy, same 42-iteration horizon, same people
  check, same census). Only the run tag / seed file names change.
- Analyzer: `scripts/analyze-journey-establishment-r103-20261105.py` —
  r102 analyzer clone with the FIGHT category and the id-fallback mapping.
- Seeds: **1501, 1502, 1503, 1504 — IDENTICAL to r102** (MEASUREMENT §1:
  before/after on identical seeds; the instrument is the only change, so
  the lesson set must reproduce exactly — see M0).
- Policy: `competent` (default switches; COMPETENT_CRAFT_ARMOR unset = on).
- Pilot: seed 1501 runs first; the pilot must show `skill_used` rows
  firing in the wild AND reproduce r102-seed1501's summary fields exactly
  (M0). If either fails, fix the instrument before scoring the rest.
- §14b substrate checklist (before the sweep): contact — field fights
  occur in-window (r102: 21–41 death records/seed, mostly fights;
  14–34 `ability_used` rows/seed); pool — ~89 lessons in r102, bar 1/3
  of lessons; verb — `fieldFight` + `ffFired` exist in landed code;
  horizon — 42d contains fights and lessons on all four r102 seeds.

## STRICT-USE instrument (binding definition, r102 + FIGHT)
For each telemetry `skill_lesson` row L (teacher, learner, skill, seq S):
- EVIDENCE = a telemetry row R with sequence index > S, R.type is NOT
  `villager_skill` (the grant echo is excluded entirely, on any day),
  and R names the learner as an actor (vid/teacher/learner/who/actor
  field, resolved through the census id↔name map, 'player' kept as-is) AND
  names the skill (skill/ability/track/id/item field, with the §-mapping
  above: skill-lane ability id → skillId, else the id itself).
- Categories (a lesson counts once, first evidence wins):
  (a) ONWARD — R.type == 'skill_lesson' with teacher == learner and
      skill == L.skill (the learner teaches it onward);
  (b) CRAFT — R.type in ('armor_craft','ammo_craft') with vid == learner
      and item == L.skill;
  (c) ABILITY — R.type == 'ability_used' with the mapped skill ==
      L.skill and actor == learner (player or villager);
  (d) FIGHT — R.type == 'skill_used' with vid == learner and mapped
      skill == L.skill (NEW: a held skill/ability changed a field fight);
  (e) OTHER — any other row type meeting the actor+skill rule.
- Lessons on the final day of a run, or where the learner dies before any
  later row exists, are counted in the denominator and flagged
  (no-opportunity), never dropped.

## Binding metrics
- M0 INSTRUMENT-NEUTRALITY (gate, judged BEFORE M2): r103 seed files
  reproduce r102's per-seed endDay, aliveEnd, pantryKcalEnd, and lesson
  count exactly. A divergence stops the run for investigation — the
  instrument must not change gameplay, and M2 is not judged on a
  diverged panel.
- M1 LESSONS (descriptive baseline, must be non-zero to judge M2):
  natural lessons per seed; GO if ≥5 per seed on ≥3/4 seeds and ≥3
  distinct skills per seed on ≥3/4 seeds (r99's floor, not its verdict).
- M2 STRICT-USE (the leg question): share of lessons with strict
  post-lesson evidence (categories above). Verdict labels, fixed now:
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
- `pack_hunt` is NOT covered: its effect routes through Godpath
  (`gpF.used.pack_hunt`), not through a `vHasAb` firing point.
- The ALLY in a field fight has no ability reads: the engine reads only
  the lead villager's held abilities, so `skill_used` names the lead.
- Godpath subclass actives (`gpF.*`: blind/birds, rally aura, broadcast,
  aegis) are NOT attributed: they fire through `Godpath.fieldAct`, not
  through `vHasAb` sites.
- Non-fight skill use still has no actor row (cleaning-duty
  `field_dressing`, wound-care treatment gating, `preserve_food` duties):
  FIGHT covers field fights only. If M2 stays low, the next instrument
  is the duty/craft half, not a re-score of this one.
- Scholar-day labels skip/repeat (r101 metric review): all ordering in
  this run uses telemetry sequence index; scholar days are display only.
- Census `equipped` first-row duplication (r99) still stands; not relied on.
- The telemetry ring is uncapped in sims (sim-harness sets
  TELEMETRY_FULL=1), so added rows evict nothing.

## Metric review (for the NEXT run, not this one)
- To be written after scoring.
