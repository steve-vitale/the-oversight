# Abilities + XP — first numbers: pre-registration (arm sim-abilityfirst-a)

Run fleshout-20261111T1015Z, Loop A. Coverage Program Tier 2 (Steve
order 2026-11-10 11:11 CST "Measure all"). Written BEFORE any judged
sim. Base commit 5bb3c595a. No judged sim has run on this base yet;
the pilot runs on 5bb3c595a, recorded in the evidence.

## Canon

- docs/CANON.md read first. **There is NO dedicated abilities/XP
  canon doc in the CANON.md manifest.** The manifest points at
  docs/SYSTEMS.md for "abilities, slots, deepening" — read in full.
  SYSTEMS.md tabs the ability engine (abilities.json, modifiers,
  `modTarget()`), the 6-slot economy, the blood-magic / field-medicine
  synergy, and the status-effect table; it is a map, not a design
  doc for how abilities are earned or what XP does. The operative
  canon law is in CANON.md itself: **"Human skills ≠ alien
  abilities (Steve 2026-10-11): human skills are teachable earthly
  knowledge — occupations grant them as background, practice and
  discovery earn them, and they never take System slots. Alien
  abilities work like magic and come ONLY from the System (offers,
  trials, System milestones) into the 6 slots."** Canonical example:
  **purify is magic** (System offers it, including a reactive offer
  when poisoned); **herbal_remedy is a human skill**. Nothing is
  invented here; the code citations below are the source of truth.
  (Canon gap, recorded in the evidence: abilities/XP needs a canon
  doc the way diseases have docs/DISEASES.md. SYSTEMS.md's ability
  section is a file map, not a design.)
- **The one progression system** (src/js/tracks.js, header, Steve
  2026-10-14: "Villagers and players should get the same XP, when
  in doubt we treat them the same way."): five tracks — combat,
  field, social, craft, strange — fed by real deeds. Thresholds
  from src/data/tracks.json: **[18, 48, 96, 192, 384]**, offerSize 3,
  maxAbilities 6. Kits are magic only (93 magic abilities across
  the five kits: combat 18, field 19, social 15, craft 20, strange
  21; 142 abilities total in abilities.json: 94 magic, 48 skill;
  42 with combat actions). Skill-lane entries become villager
  SKILLS, never a slot.
- **The one XP engine** — `gainTrackXP(who, track, n, why)`, who =
  'player' or a villager id (the bearer's id IS the player).
  Player: `_playerTrackXP` — xp accrues, each threshold crossing
  queues a level-up (`scholar.levelUpQueue`) and `pumpLevelUps()`
  opens the next sheet when the System has arrived and no sheet
  is pending. Villager: `_villagerTrackXP` — the dead earn nothing;
  skill learning at `skillLevels [2, 4]` (their track skill, no
  System needed); once the System has arrived, each crossing queues
  a sheet on `npcXp.sheets` and `villagerResolveLevelUps(vid)`
  picks by buildScore (swap or keep when full, defer up to 3 days
  when build knowledge is too thin). **Before the System arrives
  (pre-day-7), villager XP accrues but no sheets are queued.**
- **Deeds** (tracks.json, 24 deeds): foraging/hunting/fishing/
  trapping/preserving/discovery/gardening (field, n=1, perDay 1–2);
  cooking/crafting/healing (craft, n=1, perDay 1–2); conversation/
  trade/teaching (social, n=1, perDay 1); contest (social, n=1),
  contest_won (social, n=3), fight_won (combat, n=2, perDay 3),
  fight_survived (combat, n=1, perDay 2), patrol (combat, n=1);
  contest_survived/alien_fight/audience_trial/integration/mantle/
  death_in_family (strange, n=1–3). **Per-day caps per doer** —
  chores are capped, decisions not grinding. `creditDeed(who,
  deedId)` is the one table for everyone.
- **Synergy XP** — `creditSynergy(who, synergyId)`: 5 synergies
  (fight_with_ability +1 combat, teach_learned_skill +1 social,
  craft_taught_recipe +1 craft, heal_save +2 craft,
  forage_new_plant +1 field), per-day capped per doer, tele
  'track_synergy' + a say line for the player. The caller judges
  the shape; the bonus is extra track XP, never a granted ability.
- **The level-up sheet** — `levelUpOffers(track, level)`: the next
  3 unheld kit abilities, shaped by `kitSheet` (godpath.js:
  recognised class first, before that the bearer's job path).
  Player picks via `chooseAbility(id, replaceId)` — full slots
  means the pick REPLACES a held ability (or `keepAbilities()`
  declines). `trackStat` counters: offered/picked/replaced/kept.
  A skill-lane id slipping through teaches the skill instead of
  taking a slot.
- **The slot ladder** — `abilitySlots()` (game.js): integration
  20→2, 35→3, 50→4, 65→5, 80→6, else 1. Slot moments (progression.js
  `slotMoment`): 20 spark, 40 mentor, 60 trial (+ sentiment taught),
  70 creep, 80 grant. Each unlock is a beat, not a number.
- **Ability-level XP** — `gainAbilityXP(abilityId, amount)`:
  scholar-only. Practice thresholds 6 (L1→L2) / 12 (L2→L3) via
  `advanceAbilityPractice`; L3 is max and stages an evolution
  choice (`stageEvolution`) when the family has evolutions.
  Every call also feeds `surgeResonance` (+1 per use, +5 per
  level-up) — the feast-surge devotion lane — and `noteAbilityUse`
  (synergy-attempt tracking), and `codexLearnAbility(id, 3,
  'personal-use')`. `useAbility` grants +2 ability XP per real
  attempt (keepsake/god excluded). Skill-lane ids route to
  `gainSkillLaneXP` — they deepen a skill, never a slot entry.
- **Ability use** — `useAbility(abilityId, actionId, target)` is
  the single entry point (abilityActions.js); costs paid after
  prechecks; every action narrates, even on failure. The competent
  policy DOES press abilities in fights now
  (`abilityPressPlay`, competent.js ~2380: turncoat, war_cry,
  bird_strike, pocket_sand, freeze_tag, fear_aura, …; dinner
  reserve 200 kcal; at most one turn-costing press per turn) and
  takes the first level-up offer (competent.js ~3406:
  `chooseAbility(ch[0].id)`). Villager combat abilities fire via
  `tbVillagerAbility(v)` inside `tbVillagerTurn`.
- **Synergies (the mechanic)** — 57 entries in synergies.json;
  `unlockSynergy(syn)` on the 3rd successful combined use;
  `recomputeActiveSynergies` keeps `scholar.activeSynergies`;
  villager synergies discovered by 12 days of paired use
  (`npcSynergyDays`, tele 'villager_synergy', a say line).
- **Passives** — `checkPassiveUnlock(stat)` / `passiveBonus(id)`:
  stat-based (scholar.stats reaching 6/8/10), tiers 1–3, stored
  in `scholar.passives`. NOT ability-based — recorded separately
  so the two are never conflated.
- **Godpath/godhood is OUT OF SCOPE for this arm** (Tier 3,
  unmeasured): a new ability can complete a godhood build
  (`checkPlayerGodhoodAscension` / `checkVillagerGodhoodAscension`,
  capstone items), but this arm measures abilities + XP as played
  and notes godpath reachability only where the census touches it
  (ascension events observed, if any).
- **First-ability-magic check** (Steve's law): the first ability
  must read as magic, never a learned skill. Test
  test-first-ability-magic-20261014.js proves the arrival gift
  is magic; this arm measures what the first ability actually IS
  in lived play, for the scholar and for each villager's first
  grant.
- Audit row: hidden_files/coverage-audit-20261110.md §4,
  Abilities / XP — **Partial**: capable scores/offers/uses
  abilities in fights; competent takes first offer; panel
  `abilityAccepted` (events only); **no panel metric for XP
  gain, ability effects, or synergy use**. This arm supplies the
  first-numbers analogue. (Caveat recorded in the audit: the
  audit's "competent never uses abilities" line is stale —
  competent.js presses abilities since the 2026-11-02 gap audit.)

## What the existing ability tests prove — and what they do NOT

The ability tests (test-ability-xp-use, test-ability-gaps,
test-first-ability-magic, test-ability-lanes, test-abilityuse-*,
test-xp-coverage, test-xp-synergy, test-xp-gear-panel,
analyze-xp-gear-panel, test-villager-xp, test-villager-wave-xp,
test-xphalf, test-expaware-a, test-bankxp, test-craftxp) prove
the verbs work when CALLED: XP accrues, level-ups queue, sheets
offer 3, slots gate, skill-lane grants become skills, synergy
bonuses credit, ability XP deepens to L3. None of them measures
whether abilities or XP ever HAPPEN in a lived village under
default competent play: no grant counts by path, no XP flow by
track and doer, no slot-fill distribution, no casts in real
fights, no synergy unlocks, no first-ability lane in the wild.
This arm measures exactly that, on a plain competent band.

## Backlog claim

No sim-findings.md line is claimed by this arm. (Checked
2026-11-11: no open line names abilities/XP first numbers; the
closest lines are about specific levers, not this census.) Any
abilities/XP gap this arm surfaces is APPENDED as [open] in the
evidence file's findings section and in sim-findings.md, not
claimed mid-run.

## Pre-pilot substrate checklist (§14b)

1. **Contact**: the XP/grant/use verbs exist and are wired —
   `gainTrackXP` is called from deed sites, combat, teaching,
   healing, foraging and more; `pumpLevelUps` fires on XP gain;
   competent picks the first offer and presses combat abilities
   in fights (see canon above). The pilot will confirm live
   counts in the corpus, not assume them. `stageEvolution`
   (L3 mastery) and `channelSentiment` (keepsake channeling) are
   expected rare-or-zero under competent — proven live in the
   fixture by direct calls and marked dead-under-competent if
   the pilot never fires them.
2. **Pool sizing**: measurement arm, no lever bar — no pool/bar
   ratio to size. The addressable pool is every track-XP credit,
   every deed/synergy credit, every ability grant, every
   ability-XP credit, every ability press, every synergy unlock,
   every slot moment on the band. The engagement floor (GO table)
   is set from the pool's nature: if the band produces <5 XP
   events total, the census is uninterpretable, not a GO.
3. **Verb existence**: gainTrackXP, creditDeed, creditSynergy,
   gainAbilityXP, chooseAbility, keepAbilities, pumpLevelUps,
   levelUpOffers, npcGrantAbility, npcLearnSkill,
   villagerResolveLevelUps, useAbility, tbVillagerAbility,
   unlockSynergy, stageEvolution, channelSentiment, slotMoment,
   checkPassiveUnlock, passiveBonus, abilitySlots, npcXp,
   playerTracks, trackLevelFor all exist in the engine
   (citations above). The policy drives XP through deeds and
   fights and picks level-ups — that asymmetry (what the
   scholar earns vs what villagers earn in the wild) IS one of
   the first numbers.
4. **Horizon fit**: 150d covers the full village life (sibling
   pilots' median survival 122.5–140d); abilities/XP is a
   whole-life question (slot ladder needs integration 80, L3
   mastery needs ~18 uses, villager sheets need the System +
   thresholds). Same horizon as the siblings for comparability.

## Primary metric + GO threshold

Primary metric: **complete first-numbers capture of abilities +
XP in a lived village** — every track-XP credit classified by
track, doer (scholar vs villager-in-the-wild) and why; every
ability grant attributed by path (level-up pick, villager sheet,
other); every ability-XP credit classified; every ability press
classified by context and outcome; every synergy unlock counted;
every slot moment counted; every metric in the list below counted
or explicitly marked unmeasurable.

GO (instrument validity + complete capture — a GO makes NO landing
claim and spends NO confirm band; there is no lever here to land):

| GO check | Bar |
|---|---|
| Every gainTrackXP call classified by track + doer + why, none 'unclassified' | 0 unclassified XP events across the pilot (track known, who player-or-vid, why non-empty) |
| Every ability grant attributed by path, none 'unattributed' | 0 unattributed grants across the pilot (scholar snapshot deltas reconcile against chooseAbility picks + mantle transitions; villager deltas against npcGrantAbility events; residue 0) |
| Every useAbility call classified by context + outcome, none 'unclassified' | 0 unclassified presses (context combat/field/other, returned true/false) |
| Every wrapped method's call path verified live or marked dead | each wrap live in the pilot, or proven live in a fixture and marked dead under competent / dead-under-harness |
| Neutrality: OFF leg matches instrumented leg | days + end pantry kcal + deaths match exactly, 8/8 seeds |
| Instrument errors | 0 on all seeds, all legs |
| Complete first-numbers capture | per-seed tables for metrics 1–10; sense-test scenes quoted |
| Engagement floor | ≥5 XP events band-wide, else the pilot is uninterpretable, not GO |

A miss on any row is NO-GO against the pre-registered bar (metric
review records why; never re-scored mid-run, §14).

## Metrics (all 10)

1. Ability grants: who gets what, by what path (level-up pick,
   villager sheet resolve, arrival gift, contest prize, other);
   first ability per holder (scholar + each villager) and its
   lane (magic vs skill — the first-ability-magic check, live);
   grants by track kit; replacements (full-slot swaps) and keeps.
2. XP flow: gainTrackXP events by track (combat/field/social/
   craft/strange), by doer (scholar vs each villager), by why
   (deed id / synergy: / other caller); creditDeed events by
   deed with granted vs per-day-capped; creditSynergy events by
   synergy; XP totals per track per doer; levels reached per
   track per holder (threshold crossings).
3. The 6-slot economy: abilitySlots() over time (integration
   trajectory); slots filled per holder at day 30/60/90/120/150
   (or death); which abilities sit in scholar slots at end;
   slot moments fired (20/40/60/70/80) and when; full-slot
   replacements vs keeps.
4. Ability XP / deepening: gainAbilityXP events by ability id,
   amount, level before/after; abilities reaching L2/L3; L3
   masteries and evolutions staged (stageEvolution); surge
   resonance totals; channelSentiment calls (practice vs surge
   arming vs trauma soothe).
5. Ability USE: useAbility presses by ability/action, context
   (turn-based fight wave / field / other), returned true/false,
   kcal paid, dinner-reserve respected or not; scholar casts in
   real fights vs unknown monsters (wave of the fight); villager
   casts via tbVillagerAbility (calls, returns, fired-ability
   identity from flag diffs where the engine records it);
   passive unlocks (checkPassiveUnlock) and passiveBonus values
   held at end.
6. Synergy/unlock ladder: unlockSynergy events (which synergy,
   who, when); active synergies held at end (scholar +
   villagers); synergy XP credits (metric 2's synergy rows);
   godhood ascensions observed, if any (out of scope, counted
   only — no judgement).
7. Villagers in the wild: per-villager XP totals by track,
   levels reached, skills learned (npcLearnSkill), abilities
   held (magic, in slots), sheets queued vs resolved vs
   deferred (villagerResolveLevelUps outcomes); how many
   villagers hold ANY combat ability at end; how many hold any
   ability at all.
8. Food-powered conversions: ability presses that spend kcal
   (food→effect); the dinner test (does a cast ever leave the
   scholar under the 200-kcal dinner reserve?); blood_magic /
   field_medicine and other food-power lines in the say corpus;
   "does this let you skip dinner?" — casts per day vs dinners
   skipped, as observed, not assumed.
9. Say-line coherence: every ability/XP say line in the corpus
   classified (grant line vs applied grant, level-up line vs
   queued level, slot-moment line vs slots opened, synergy line
   vs unlocked synergy); any line whose number contradicts the
   live state it describes; the first-ability line's wording
   (does it read as magic?).
10. Wall numbers: national / table / wins, wave 4–5 unlocks,
    median survival, deaths, standing, scale.

## Horizon + seeds + policies

- **Horizon: 150d, death-aware** (dead villages stop, +10d tail max).
  Why 150d: abilities/XP is a whole-life question (slot ladder
  to integration 80, L3 mastery, villager sheets after the
  System arrives); sibling first-numbers pilots ran 150d with
  median survival 122.5–140d, so 150d captures the full village
  life without ticking dead villages. Same horizon as the
  siblings for comparability.
- **Seeds: 190221–190228 (8 seeds).** Freshness search (skill
  local_seed_band_freshness, full scope):
  - Searched every `evidence/*/sim-*-prereg.md` for 190221–190228:
    zero hits.
  - Searched ALL dated evidence `.md` (full evidence/ tree,
    word-boundary grep, one seed at a time): zero hits for all
    eight seeds.
  - Searched ALL dated evidence `.json` (ripgrep word-boundary):
    NOT completed — the full-tree grep over the evidence corpus
    (which holds multi-MB per-seed JSONs) ran past 100s on the
    first seed with no hit returned before it was stopped; the
    .md scan + perseed-directory scan + used-band list below
    cover the naming surface. Recorded honestly: a stray
    `"totalDraws": 19022x`-style numeric coincidence inside a
    per-seed JSON cannot be excluded by this search — the band
    is fresh as a SEED naming, which is what the skill guards.
  - No perseed directory names any seed 190221–190228 (listing
    of evidence/ checked).
  - Known used 19xxxx bands: 190211–190218 (trustfirst-a),
    190301–190308 (vetfirst-b), 191702, 199585 — none overlap.
  - No standalone forbidden/contaminated band list exists in the
    goal hidden_files (listing checked).
  - Search scope recorded so a later reader can retrace it.
- **Policies (TWO legs on identical seeds):**
  - **control:** competent verbatim, default env, instrument ON (the
    judged leg). No COMPETENT_TALK, no other env gate — default
    competent is the measurement substrate.
  - **neutral:** control policy, instrument OFF (no wraps, no
    snapshots; end-of-run wall numbers + days + end pantry kcal +
    deaths only), same seeds — must match the instrumented control
    leg exactly on days + end pantry kcal + death count (8/8).
  - No other policy change. No src/js change.

## Instrument

scripts/abilityfirst-instrument-20261111.js — wraps (record-only,
never alter state, never consume RNG; recording failures go to
instrumentErrors, never thrown into the game).
- gainTrackXP: every call — who, track, n, why, xp/level
  before/after (playerTracks / npcXp reads).
- creditDeed: every call — who, deed, track, granted (return),
  capped (return 0 on a known deed).
- creditSynergy: every call — who, synergy, bonus, granted.
- gainAbilityXP: every call — id, amount, level/xp before/after
  (scholar ability entry), lane.
- chooseAbility: every pick — id, src, replaced id, granted or
  refused (return null), slots before/after.
- keepAbilities: every call — track, kept.
- pumpLevelUps: every call — offered or not, choices offered
  (ids + srcs) after the call.
- levelUpOffers: every call — track, level, ids offered.
- npcGrantAbility: every call — vid, id, lane, ok (skill-lane
  ids route to npcLearnSkill — recorded there too, never double
  counted as a slot grant).
- npcLearnSkill: every call — vid, ability id, skill id, ok.
- villagerResolveLevelUps: every call — vid, return, sheets
  before/after, npcAbilities before/after.
- useAbility: every call — id, action, target, in turn-based
  fight or not, monster wave if in a fight, kcal before/after,
  returned.
- tbVillagerAbility: every call — vid, round, returned, fired
  identity from villager/monster flag diffs (same flag set as
  the abilityuse instrument; 'wrapped-unknown' when the return
  is true and no flag moved — never invented).
- unlockSynergy: every call — synergy id, day.
- stageEvolution: every call — ability id, choices staged.
- channelSentiment: every call — ref, message returned.
- slotMoment: every call — threshold, slots after.
- checkPassiveUnlock: every call — stat, passives before/after.
- tele cross-check: 'track_level', 'ability_granted',
  'villager_skill', 'track_synergy', 'ability_replaced',
  'level_up_kept' tele events only.
- Daily snapshot: scholar integration, slots, abilities
  [{id, level, xp, lane}], tracks {xp, level}, levelUpQueue,
  abilityChoices, surgeResonance, sentimentTaught,
  pendingEvolution, activeSynergies, passives, trackStats;
  per-villager npcAbilities, npcSkills, npcXp (tracks, granted,
  skilled, sheets count); bearer id (mantle detection);
  pantry kcal, roster size, standing, scaleRank, nationalLive,
  wave.
Driver: scripts/abilityfirst-driver-20261111.js (mirrors
trustfirst-driver; Game.say wrap with an ability/XP regex for
the sense corpus, 200 lines/seed cap — same early-game-only
caveat as the siblings). Analyzer:
scripts/abilityfirst-analyze-20261111.js (classifiers for XP
events by why, grants by path, presses by context; snapshot
reconciliation for grants). Proof:
scripts/test-abilityfirst-a.js (each wrap proven live on a
fixture or miniature; RED checks on the pre-fix instrument
where a wrap is dead by construction).

## Balanced panel (§15)

Attempted and recorded honestly: this is a MEASUREMENT arm with no
lever change and no before/after arms, so there is no panel
comparison to fabricate (same position as sim-trustfirst-a,
sim-fishstaff-b, cookfirst-a, preserve-a, fishfirst-a,
travelfirst-a, tradefirst-a). The control/neutral legs are the
neutrality proof, not a panel. Panel context: **no panel metric
for XP gain, ability effects, or synergy use** (coverage audit
§4) — this arm supplies its first-numbers analogue (Metrics
1–9); the panel's `abilityAccepted` (events only) is the only
existing ability-adjacent panel field.

## Guards (reported, never verdict-flipping post-hoc)

daysAlive, deaths, starvation share vs the sibling first-numbers
corpus shape (trustfirst-a: median survival 133d, 2/8 survived,
651 deaths over 1,150 village-days). If the instrument changes
any numeric field vs the recorder-free baseline, the arm is NO-GO
on neutrality.

## Metric review (§14 — filled in the evidence file, never re-scored here)

- (to be filled after the pilot: did the metric set hold, or does a
  metric need revision for the NEXT run?)
