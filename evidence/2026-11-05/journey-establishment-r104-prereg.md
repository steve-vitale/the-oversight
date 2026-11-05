# Journey leg ESTABLISHMENT — r104 pre-registration (2026-11-05, Lane A)

## Leg
Establishment, days 14–40 window, 42-day horizon (r71/r84/r85/r86/r99/r101/
r102/r103 precedent). Death-aware: stop after 10 consecutive all-dead daily
checks; never tick a dead village to fill the leg.

## Leg question (fresh — the instrument r103's metric review named)
r103 proved taught skills visibly fire in fights (36/88 strict-use, 12 with
FIGHT evidence, 101 `skill_used` rows) — but a set of abilities never fired
in-panel: haymaker, draw_fire, bodyguard, unbreakable, shield_wall,
patient_aim, freeze_tag, tripwire, hogtie, and the Arm-4 set. r103 could not
say whether villagers HOLD those abilities. This run builds the holdings
census r103 named — `npcAbilities` per villager at end, like the
`skillsKnownBy` census — and asks: **of the abilities that never fired in
r103, how many are held-but-never-fired vs never-held at all?** In plain
words: do villagers in the establishment window actually hold combat
abilities, or is the silence because nobody holds them?

Secondary: do villagers GAIN abilities in-window (start vs end holdings)?
This speaks to Steve's 2026-11-05 ruling — abilities are granted by the
System for leveling up or completing combats, never taught, never bought —
and to the standing caveat that villagers rarely hold combat abilities.

## The instrument (substrate, built and committed BEFORE any scored seed)
1. Driver `scripts/journey-establishment-r104-20261105.js` — r103 driver
   clone (same competent policy, same 42-iteration horizon, same people
   check, same census, same telemetry dump). The ONLY driver changes:
   run tag / seed file names, plus a holdings census:
   - START census (day 1, before any play): per roster villager, the raw
     granted slots `state.village.npcAbilities[vid]` (copied), the owned
     union `Game.npcOwnedIds(vid)` (read-only Set union — verified pure,
     no writes), skills `Game.skillsKnownBy(vid)`, and the raw XP record
     `state.village.npcXp[vid]` (read-only; NOT `Game.npcXp()`, which
     creates records on first touch).
   - END census: the same four fields per roster villager, plus the
     player's owned abilities `Game.ownedAbilityIds()` (read-only, for
     contrast — the player is the only one guaranteed a sheet).
   - No new telemetry rows, no new wraps, no game-code change. The census
     reads state; it writes nothing.
2. Analyzer `scripts/analyze-journey-establishment-r104-20261105.py` —
   r103 analyzer clone, plus the holdings classification (defined here,
   not discovered after scoring):
   - For each ability id in the R103-SILENT set (haymaker, draw_fire,
     bodyguard, unbreakable, shield_wall, patient_aim, freeze_tag,
     tripwire, hogtie, plus every id that appears in `ffFired` completion
     sites but fired 0 times in the r103 panel), classify per panel:
     HELD-BUT-SILENT (holders ≥ 1 at end, fires 0 in-window),
     NEVER-HELD (holders 0 at end), FIRED (fires ≥ 1 — contradicts r103
     on these seeds, and must be reported as such, not hidden).
   - "Holders" counts living villagers at end holding the id in the owned
     union; the granted-slots vs skill-derived split is reported per id
     (a skill-lane id held via a known skill is a SKILL holding, not a
     System grant — the two sources must never be conflated).
   - "Fires" counts `skill_used` rows (field fights) + `ability_used`
     rows naming the villager as actor in this run's own telemetry.
   - In-window grants: villagers whose owned set grew start → end
     (by id, not count), and villagers whose granted slots grew.
   - Diplomat / herbal_medicine: held? (owned union at end), fired?
     (any telemetry row naming the learner as actor and the skill).
3. Proof test `scripts/test-journey-establishment-r104-holdings.js`:
   census reads on load seeds 7, 42, 99 — a villager granted an ability
   via `npcGrantAbility` shows it in granted slots AND owned union; a
   villager taught a skill-lane ability shows it in owned union but NOT
   in granted slots; an ungranted villager shows empty on both; the
   census read changes no state (endDay / roster / pantry identical
   before and after the read).

## Why this question is fresh
- Named directly by r103's metric review as the next instrument to build.
- Canon: docs/CANON.md (human skills ≠ alien abilities; abilities come
  ONLY from the System into the 6 slots). Steve 2026-11-05: abilities are
  granted by the System as a person gains experience through any
  path-type skill, for leveling up or completing combats — never taught,
  never bought. The holdings census measures the villager side of that
  grant path in the establishment window.
- The census changes NO gameplay: read-only state reads, no telemetry
  rows added, no wraps, no src/js change. M0 below proves it on
  identical seeds.

## Method
- Seeds: **1501, 1502, 1503, 1504 — IDENTICAL to r102/r103**
  (MEASUREMENT §1: before/after on identical seeds; the census is the
  only change, so the panel must reproduce r103 exactly — see M0).
- Policy: `competent` (default switches; COMPETENT_CRAFT_ARMOR unset = on).
- Pilot: seed 1501 runs first; the pilot must show the holdings census
  populated (≥1 villager holding ≥1 ability OR an explicit all-empty
  census with the raw fields present — an empty census is a finding, not
  a broken instrument, but the fields must be present and well-formed)
  AND reproduce r103-seed1501's summary fields exactly (M0). If M0
  fails, fix the instrument before scoring the rest.
- §14b substrate checklist (before the sweep): contact — field fights
  occur in-window (r103: 101 `skill_used` rows across the panel);
  pool — r103's silent set is named above; verb — `npcAbilities`,
  `npcOwnedIds`, `npcGrantAbility` exist in landed code; horizon — 42d
  contains fights, lessons, and XP deeds on all four r103 seeds.

## Binding metrics
- M0 INSTRUMENT-NEUTRALITY (gate, judged BEFORE M1): r104 seed files
  reproduce r103's per-seed endDay, aliveEnd, pantryKcalEnd exactly,
  and lesson sets identical modulo the r103 correction (same
  teacher/skill/day, learner matched by name/role — wall-clock-id'd
  joiners may flip one 15% roll). A divergence in endDay/aliveEnd/
  pantryKcalEnd stops the run for investigation — the census must not
  change gameplay.
- M1 HOLDINGS (the leg question): per-seed and panel.
  - M1a SHARE: share of living villagers at end holding ≥1 granted
    (magic) ability. Labels, fixed now: WIDESPREAD if ≥50%, SPARSE if
    10–50%, RARE if <10%. The label is descriptive — any of the three is
    reported with the per-villager table, never re-scored.
  - M1b SILENT-SET CLASSIFICATION: for each id in the R103-SILENT set,
    HELD-BUT-SILENT / NEVER-HELD / FIRED as defined above. Verdict:
    HOLDINGS-EXPLAIN-SILENCE if every silent id is NEVER-HELD (the
    silence is a holdings gap, not a firing gap); FIRING-GAP if any
    silent id is HELD-BUT-SILENT (someone holds it and it never fires —
    the next run's question is why it never fires, not whether it is
    held); MIXED if both classes appear.
  - M1c IN-WINDOW GRANTS: count of villagers whose owned set grew
    start → end. GRANTS-HAPPEN if ≥1; NO-GRANTS if 0 (reported with the
    XP levels at end — how close the nearest villagers sit to their next
    threshold — so a zero is explained, not just stated).
- M2 DIPLOMAT/HERBAL (descriptive): held (owned union at end) and fired
  (any actor row) counts for `diplomat` and `herbal_medicine`. r103:
  0/5 lessons with evidence for each. Any holder or firing is reported
  by name and seed.
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
- The duty/craft half of "use" (cleaning-duty `field_dressing`,
  wound-care treatment gating, `preserve_food` duties) still has no
  actor-attributed row (r103 limit, unchanged). This run does not build
  it; it stays the next instrument after holdings.
- Scholar-day labels skip/repeat (r101 metric review): all ordering uses
  telemetry sequence index; scholar days are display only.
- Census `equipped` first-row duplication (r99) still stands; not relied on.
- Player codex start snapshot is missing (end snapshot only) — r103
  limit, unchanged; holdings are end snapshots for villagers too.

## Metric review (for the NEXT run, not this one)
- To be written after scoring.
