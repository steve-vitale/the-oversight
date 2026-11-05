# Journey leg ESTABLISHMENT — r105 pre-registration (2026-11-05, Lane A)

## Leg
Establishment, days 14–40 window, 42-day horizon (r71/r84/r85/r86/r99/r101/
r102/r103/r104 precedent). Death-aware: stop after 10 consecutive all-dead
daily checks; never tick a dead village to fill the leg.

## Leg question (fresh — the instrument r104's metric review named)
r104 proved diplomat held by 9 villagers and herbal_medicine by 3, firing
0 rows anywhere — and its metric review named the missing instrument: the
DUTY/CRAFT half still has no actor-attributed use (cleaning-duty
field_dressing, wound-care treatment gating, preserve_food duties). This run
builds that instrument and asks: **of the duty/craft/social holdings —
diplomat, herbal_medicine/herbal_remedy, field_dressing, preserve_food,
wound_care/triage — which are ever USED by villagers in-window, which are
held-but-unused, and which are structurally unread for villagers at all?**
In plain words: when a villager holds one of these, does the village ever
feel it — or is the holding decorative?

## Static read-site census (done BEFORE scoring; the probe test proves the
## two USED mechanisms and the two INERT mechanisms behaviorally)
Read sites in landed src/js (grep, verified 2026-11-05 in the worktree):

- **diplomat** — ZERO villager-aware read sites. Every read is the
  PLAYER bearer's level: `this.abilityLevel('diplomat')` in nonverbalRead
  (game.js:2993) and teaching trust (game.js:3387); `gainAbilityXP
  ('diplomat', 1)` per convo exchange (conversation.js:7097, player-side).
  No `npcHasAbility('diplomat')` site anywhere. The abilities.json entry
  has no `actions` array and no `modifiers` — and no diplomat incident
  trigger exists in src/js (the "once per week you can start a diplomatic
  incident" half appears unimplemented even for the player).
  Hypothesis: STRUCTURALLY-INERT for villagers.
- **herbal_medicine → herbal_remedy** — ZERO villager-aware read sites.
  treatDisease (game.js:13879) and treatVillager (game.js:14209) are
  player-only (`this.hasAbility`). Every villager care path gates on
  OCCUPATION regex (nurse|medic|doctor|paramedic|midwife|veterinarian|
  pharmacist|herbalist|dentist), never on holdings: villagerCareTick
  (game.js:32456), healerRounds via campHealerId (game.js:14166), and
  villagerTreatTick (game.js:32499). A villager holding herbal_remedy with
  a non-medical occupation is never a tender or healer.
  Hypothesis: STRUCTURALLY-INERT for villagers.
- **wound_care → triage** — ONE villager-aware read: villagerCareTick
  reach 2 via `npcHasAbility(mid, 'triage')` (game.js:32477), and only for
  occupation-medics. The wound_care skill itself has only a player-side
  read (game.js:15678).
  Hypothesis: USED, but only if an occupation-medic holds triage.
- **field_dressing** — ONE villager-aware read: villagerHuntResolve
  cleaning frac 0.60 → 0.78 via `npcHasAbility(vid, 'field_dressing')`
  (game.js:6744).
  Hypothesis: USED whenever a holder hunts.
- **preserve_food** — ZERO villager-aware read sites for the learned
  skill. The cook/preserver duty uses `specialistSkill(person,
  'preserver')` (food.js:1230), which reads ONLY formerOccupation
  keywords + foodXp practice — never learned skills or holdings. The
  smoke-rack rate ("keeps for weeks" vs "a couple of weeks", game.js:7294)
  is set by that occupation skill, not by the preserve_food skill.
  Hypothesis: STRUCTURALLY-INERT for villagers (learning preserve_food
  changes nothing at the racks).

## The instrument (substrate, built and committed BEFORE any scored seed)
1. Driver `scripts/journey-establishment-r105-20261105.js` — r104 driver
   clone (same competent policy, same 42-iteration horizon, same people
   check, same census, same telemetry dump, same holdings census). The
   ONLY driver changes: run tag / seed file names, plus five read-only
   driver-side wraps (original called exactly once, log after, NO
   Math.random draws inside any wrap — the r104 armor-wrap pattern):
   - `Game.villagerHuntResolve` → per call: {day, vid, name,
     heldFieldDressing, kcal, aid}. kcal>0 is a kill.
   - `Game.villagerCareTick` → per call: medics present [{vid, name,
     occ, heldTriage, heldHerbalRemedy}], sick before/after (daysLeft per
     vid), tends (sum of daysLeft decreases), tended pairs.
   - `Game.healerRounds` → when it acts: {day, caregiver, caregiverName,
     caregiverHeldHerbalRemedy, caregiverHeldTriage, patient, hpBefore,
     hpAfter}.
   - `Game.villagerTreatTick` → per call: {day, healer (campHealerName),
     playerSickBefore, playerSickAfter}.
   - `Game.resolveOneAssignment` → only when a.task === 'cook': {day,
     vid, name, occ, specPreserver, holdsPreserveFood,
     preservedKcalBefore, preservedKcalAfter, rackLines (new say lines
     from this call mentioning the smoke racks)}.
   Read purity: holdings via raw `state.village.npcSkills` /
   `npcOwnedIds` / `npcHasAbility` (pure union/read — verified in the
   proof test by state-equality before/after); `specialistSkill` is a
   pure occupation read. `skillsKnownBy` is NEVER called (it seeds).
2. Analyzer `scripts/analyze-journey-establishment-r105-20261105.py` —
   r104 analyzer clone, plus the use classification (defined here, not
   discovered after scoring). For each of the six ids:
   - USED: ≥1 actor-attributed use in-window naming a villager holder
     (hunt kill with field_dressing; triage reach-2 tend; care/healer
     act by a holder; rack run at specialist rate by a holder).
   - HELD-UNUSED: held by ≥1 living villager at end, 0 uses.
   - NEVER-HELD: held by nobody at end.
   - STRUCTURALLY-INERT: no villager-aware read site (static census
     above) AND the probe confirms the mechanism (see proof test). An
     INERT verdict is a finding about the code, not a re-score: the id
     is still reported under USED/HELD-UNUSED/NEVER-HELD from the panel,
     with the INERT flag alongside.
3. Proof test `scripts/test-journey-establishment-r105-dutyuse.js`:
   - P1 hunt frac: same seed, same villager — without field_dressing
     vs with (npcGrantAbility): a kill's kcal rises by the 0.78/0.60
     ratio (1.25–1.35). Proves field_dressing works for villagers.
   - P2a specialistSkill ignores learned preserve_food: a villager
     with a non-preserver occupation scores 0 before AND after the
     preserve_food skill is recorded in npcSkills (verified visible via
     skillsKnownBy).
   - P2b careTick medic filter is occupation-only: a non-medical
     villager holding herbal_medicine is NOT a medic (no tend); a
     medical-occupation villager holding triage tends TWO patients
     (reach 2); the same medic without triage tends ONE.
   - P3 diplomat: granting diplomat to a villager leaves the player's
     `abilityLevel('diplomat')` at 0, and an identical 1-exchange convo
     with that villager moves trust identically with/without the grant
     (the NPC's holding changes nothing the player can feel).
   - P4 wrap purity: each r105 wrap's reads change no state (endDay /
     roster / pantry / sick identical before/after the reads).

## Why this question is fresh
- Named directly by r104's metric review as the next instrument to build.
- Canon: docs/CANON.md (human skills ≠ alien abilities; herbal_remedy is
  a human skill, occupations grant it — the System doesn't need to).
  Steve 2026-11-05: abilities are granted by the System as a person gains
  experience through any path-type skill, for leveling up or completing
  combats — never taught, never bought. The use census measures the
  villager side of that grant path in the establishment window.
- The wraps change NO gameplay: read-only driver-side wraps, no telemetry
  rows added, no src/js change. M0 below proves it on identical seeds.

## Method
- Seeds: **1501, 1502, 1503, 1504 — IDENTICAL to r102/r103/r104**
  (MEASUREMENT §1: before/after on identical seeds; the wraps are the
  only change, so the panel must reproduce r104 exactly — see M0).
- Policy: `competent` (default switches; COMPETENT_CRAFT_ARMOR unset = on).
- Pilot: seed 1501 runs first; the pilot must show the wraps populated
  (≥1 hunt-resolve log, ≥1 cook-resolve log; care/healer/treat logs may
  be 0 if nobody is sick — an empty care log with zero sick villagers is
  a finding, not a broken instrument, but the wrap-call counts must be
  present and well-formed) AND reproduce r104-seed1501's summary fields
  exactly (M0). If M0 fails, fix the instrument before scoring the rest.
- §14b substrate checklist (before the sweep): contact — field fights
  and hunt duties occur in-window (r104: 101 `skill_used` rows; hunt
  duties daily); pool — the six ids are named above; verb —
  villagerHuntResolve / villagerCareTick / healerRounds /
  villagerTreatTick / resolveOneAssignment exist in landed code; horizon
  — 42d contains hunts, sickness, and cook duties on all four r104 seeds.

## Binding metrics
- M0 INSTRUMENT-NEUTRALITY (gate, judged BEFORE M1): r105 seed files
  reproduce r104's per-seed endDay, aliveEnd, pantryKcalEnd exactly,
  and lesson sets identical modulo the r104 correction (same
  teacher/skill/day, learner matched by name/role — wall-clock-id'd
  joiners may flip one 15% roll). A divergence in endDay/aliveEnd/
  pantryKcalEnd stops the run for investigation — the wraps must not
  change gameplay.
- M1 USE CLASSIFICATION (the leg question): per id, USED /
  HELD-UNUSED / NEVER-HELD (+ INERT flag from the static census +
  probe). Labels, fixed now:
  - Verdict DUTY-WORKS if field_dressing AND triage both USED.
  - Verdict DUTY-DEAD if ≥1 id is HELD-UNUSED while its mechanism is
    villager-aware (someone holds a working tool and it never fires —
    the next run's question is why, not whether it is held).
  - Verdict HOLDINGS-DECORATIVE if ≥1 id is STRUCTURALLY-INERT and
    held by ≥1 villager (the holding can never matter — a design fact
    to report to Steve, and a fix candidate, not a defect claim from
    the panel alone).
  - MIXED if classes split across ids. Any verdict is reported with
    the per-id table, never re-scored.
- M2 CARE-VISIBILITY (descriptive): counts of villagerCareTick tends,
  healerRounds rescues, villagerTreatTick easings in-window, with actor
  names and whether the actor held a care ability/skill. Also: how many
  tends were by occupation-medics vs ability-holders (the overlap question
  the static census raises).
- M3 SURVIVAL-42: GO if ≥3/4 seeds alive at 42 (no scatter).
- M4 PANTRY-GUARDRAIL: GO if starvation/thirst deaths are zero on
  ≥3/4 seeds (r101 standard).
- M5 PEOPLE: PASS if the 2 held convos per seed, read in full, are
  coherent (NPC wants something, options engage/deflect, endings
  resolve/plant/owe; no fabricated shared history, no filler loops).

## Known limits (stated before scoring, not discovered after)
- The census is an end snapshot: an ability held mid-window and lost
  (revoked, or the holder died) before the end is invisible. Deaths
  mid-window are covered only by the death records, not by holdings.
- `npcOwnedIds` unifies granted magic + skill-derived lanes; the split is
  reported per id, but a skill-lane id held via a skill the villager
  learned before the window is still a holding, not a grant.
- The ALLY in a field fight has no ability reads: the engine reads only
  the lead villager's held abilities, so `skill_used` names the lead
  (r103 limit, unchanged).
- Godpath subclass actives (`gpF.*`) are NOT in `npcOwnedIds` (they fire
  through `Godpath.fieldAct`, not through `vHasAb` sites) — a villager
  holding only godpath verbs shows an empty owned union. Reported as a
  limit, not silently treated as holding nothing.
- Scholar-day labels skip/repeat (r101 metric review): all ordering uses
  telemetry sequence index; scholar days are display only.
- Census `equipped` first-row duplication (r99) still stands; not relied on.
- Player codex start snapshot is missing (end snapshot only) — r103
  limit, unchanged; holdings are end snapshots for villagers too.
- The diplomat "incident" half: no trigger found in src/js. If the panel
  or probe finds an incident offer, it is reported as a correction to
  this prereg, not hidden.
- `ability_used` double-emission (pre-existing, r104): a composite
  `activateAbility('purify.cleanse')` emits TWO rows. The analyzer counts
  first evidence only, so rates are unaffected.

## Metric review (for the NEXT run, not this one)
- To be written after scoring.
