# Journey leg ESTABLISHMENT — r104 run note (2026-11-05, Lane A)

## Prereg
`evidence/2026-11-05/journey-establishment-r104-prereg.md` (committed
6d5842c6d BEFORE any scored seed; driver + analyzer + proof committed in
the same commit). Driver
`scripts/journey-establishment-r104-20261105.js` (r103 driver clone +
holdings census), analyzer
`scripts/analyze-journey-establishment-r104-20261105.py`. Seeds 1501–1504
(IDENTICAL to r102/r103), competent policy, 42-iteration horizon,
death-aware tail (never hit). Base: master 6b516a7ea at branch time.

## Leg question
r103 proved taught skills visibly fire in fights but left a set of
abilities that never fired (haymaker, draw_fire, bodyguard, unbreakable,
shield_wall, patient_aim, freeze_tag, tripwire, hogtie, Arm-4 set) without
saying whether villagers HOLD them. This run built the holdings census
r103's metric review named and asked: of the abilities that never fired,
how many are held-but-never-fired vs never-held?

## Instrument (what was built)
- Holdings census in the driver (read-only state reads, no src/js change):
  per roster villager at start AND end — raw granted System slots
  (`state.village.npcAbilities`), owned union (`Game.npcOwnedIds`, verified
  a pure Set union), raw skills (`state.village.npcSkills`), raw XP record
  (`state.village.npcXp`). Start snapshot uses raw reads ONLY — never
  `skillsKnownBy`, which seeds background skills (a state write) and would
  have broken M0. Plus the player's owned abilities
  (`Game.ownedAbilityIds()`) at end, for contrast.
- Proof test `scripts/test-journey-establishment-r104-holdings.js`:
  magic grant lands in slots AND union; skill-lane grant lands in union
  but NOT slots; ungranted villager shows no delta; census reads change
  no state; player owned list is an array. **24/24 PASS** (seeds 7, 42, 99).

## Panel verdict (BINDING metrics, unfixed code)
- M0 INSTRUMENT-NEUTRALITY: **PASS 4/4.** endDay, aliveEnd,
  pantryKcalEnd reproduce r103 EXACTLY on all four seeds
  (43/9/46221, 44/6/40850, 43/9/11794, 42/9/25575); lesson sets
  identical (21/14/28/25). The census changes no gameplay.
- M1a HOLDINGS SHARE: **WIDESPREAD — corrected 29/29 = 100%.** Every
  living non-player villager holds ≥1 granted (magic) ability at end.
  As-printed raw was 29/33; the correction is below (M1a correction).
  Distinct granted magic ids across the panel (13): beard_moss,
  echo_location, green_whisper, lucky_rock, night_eyes, pocket_sand,
  beast_calm, bloodhound, green_thumb, iron_stomach, scream_cheese,
  the_touch, translator — ALL utility/field/social/craft. **ZERO
  combat-kit ids held by any villager on any seed** (the player holds
  one: adrenaline_control, 1504).
- M1b SILENT-SET CLASSIFICATION: **MIXED** (held-silent 6, never-held 15,
  fired 0). The R103-SILENT set is 21 ids (ffFired sites minus the 6
  that fired in r103).
  - HELD-BUT-SILENT: come_get_some (Quinn 1502), draw_fire (Caleb 1504),
    echo_location (Greta, Katarina 1501; Ethan 1502; Sebastian 1504),
    patient_aim (Meera 1501; Ethan 1502), rally (Caleb 1504),
    scream_cheese (Caroline 1504).
  - NEVER-HELD (15): ambush, bodyguard, brawler_instinct, dead_aim,
    freeze_tag, haymaker, hogtie, intimidating_presence, leech,
    shield_wall, shoulder_check, trade_of_blows, tripwire, unbreakable,
    war_cry.
  - Source split (per id): echo_location and scream_cheese are System
    GRANTS; the other four held-silent ids are SKILL-derived (known
    skills, never slotted). The silence is therefore two different
    things: granted abilities that never fire, and skills whose fight
    use never comes up.
- M1c IN-WINDOW GRANTS: **GRANTS-HAPPEN, 22 villagers' owned sets grew.**
  Split: 15 magic (System) grants vs 167 skill gains in-window — growth
  is overwhelmingly skill learning (lessons + background seeding), not
  System grants. Nearest-to-next-threshold: Hassan craft 17/18, Ethan
  combat 17/18, Katarina social 16/18, Yara social 16/18, Priya social
  15/18. **No villager crosses the first combat-XP threshold (18) in 42
  days** — the closest is Ethan at 17 combat XP. That is why the combat
  kit stays locked: villagers earn combat XP too slowly in-window to
  ever be granted a combat ability.
- M2 DIPLOMAT/HERBAL: diplomat held by 9 villagers, fired 0 rows;
  herbal_medicine/remedy held by 3, fired 0 rows. Held, never seen used
  anywhere — the duty/social half still has no actor row (r103 limit).
- M3 SURVIVAL-42: **GO 4/4.** No game over; alive at end 9/6/9/9.
- M4 PANTRY-GUARDRAIL: **GO 4/4.** Zero starvation/thirst deaths.
- M5 PEOPLE: **PASS on all 8 held convos read in full** (2 per seed).
  See below.

## M1a CORRECTION — the bearer artifact (disclosed, not silently re-scored)
The first analyzer print said 29/33. The 4 "holds nothing" entries are
not villagers at all: they are the CURRENT BEARER (the player) on each
seed — Fernando (1501), Aubrey (1502), Rocco (1503), DeShawn (1504),
identified by the r103 codex-skills match. A bearer's skills live in
`state.codex.skills` and abilities in `state.scholar.abilities`, never in
npc stores, so reading npc stores for the bearer yields empty holdings.
(Two bearers reached the seat by succession mid-run: Ethel died on 1501,
Duc on 1504.) The analyzer now excludes the end-player (codex match)
from villager counts and prints both numbers: raw 29/33, corrected
29/29. The verdict label is WIDESPREAD either way; the corrected share
is 100%. The same artifact explains the probe finding that
`npcSeedSkills` "returns 0" for Aubrey — `isPlayerWho` correctly refuses
to seed the bearer as a villager. No game bug; the census needed the
exclusion, and future holdings censuses must exclude the bearer by the
codex match.

## The blank filled — patient_aim could never fire (FIXED, [needs-eyes])
The held-but-silent investigation found one real defect. `patient_aim`'s
card: "Full health, fresh monster: spend this turn going still" — but
its condition (`vHp >= vHpMax`) was judged at the villager's action,
which comes AFTER the monster's same-round hit whenever the monster wins
initiative. Initiative is speed vs speed; villagers run 2–4, hummice 6 —
the monster ALWAYS acts first. A full-HP villager facing a fresh monster
could never take the aim: **0/12 probe fights** (every one monster-first
in round 1), 0 fires in r103's 101 `skill_used` rows, 0 in Ethan's 22
leader rows while holding it. The ability was dead by arithmetic, not by
rarity.
- Fix (`src/js/fieldFights.js`, 2 lines + comment): judge full health at
  the START of the round (`vHpRoundStart`, captured before anyone acts),
  so "full health, fresh monster" means how the round opens, not winning
  initiative. The monster still gets its round-1 hit (the aim costs the
  turn); only the gate moved. The 2.5x payoff is untouched.
- Proof `scripts/test-establishment-r104-patient-aim.js`: full-HP leader
  aims round 1 and the next strike lands 2.5x on 6/6 seeds (7, 42, 99, 1,
  2, 3); controls hold — hurt leader (50 HP) never aims, spent monster
  (5/12 HP) never aims, no ability never aims. **21/21 PASS.**
- Before/after on identical seeds (1501–1504, fixed code re-run into
  `evidence/2026-11-05/perseed-r104-patientaim/`): patient_aim now FIRES
  in the wild — Ethan, day 33, seed 1502 (he held it as a background
  skill since day 12). Three seeds byte-identical on summary fields;
  1502 shifts (endDay 44→43, pantry 40850→56727, lessons 14→13) with
  deaths (41), aliveEnd (6), wave (4), contests (5/4) all identical —
  the RNG butterfly from shorter fights (aim + 2.5x kill ends fights a
  round sooner), not a break. The after-run's M0 "FAIL" on 1502 is
  EXPECTED: M0 gates the instrument, and the fix changes gameplay by
  design. Verdict: the ability is reachable now; one wild firing in 4
  villages says opportunity (full-HP leaders vs fresh monsters) is still
  the throttle, not the gate.
- echo_location, by contrast, is PROVEN working, not broken: forced
  night + awareness fires it 3/3 seeds, day + awareness correctly does
  not. Its wild silence is opportunity — only ~10–15% of awareness
  checks fall at night (probe: 4/39 on 1502, 2/13 on 1501), and holders
  gain it mid-window. Design note for Steve, not a code fix: an ability
  that only helps on night encounters will almost never be seen.
- The other held-but-silent ids are opportunity, not firing: Quinn
  (come_get_some), Caleb (draw_fire, rally), Meera (patient_aim on 1501)
  never LED a field fight in-window — the engine reads only the lead
  villager's abilities, so a non-lead holder cannot fire. Caroline
  (scream_cheese) led once. Scream cheese / rally / war_cry are all
  flee-line gated (fire when hurting and about to run), which is honest
  design, not a defect.

## Village assessment, in plain words
Four villages started with 12 people each and all four are still
standing at day 42–44 — the fourth establishment panel in a row with no
scatter, and (identical seeds) the same four villages r102/r103 saw:
1501 is the quiet one (wave 2 only, pantry fat at 46k, 9 alive); 1502 is
the hard one (reached wave 4, pantry fat at 40k, but only 6 alive at the
end — 41 death records, almost all monster fights and expeditions, no
starvation); 1503 is the lean one (wave 3, pantry 11.8k, 9 alive, the
most lessons at 28); 1504 is the steady one (wave 3, pantry 25.6k, 9
alive, 5 contests all won). Living villagers end knowing 1–16 skills
each (the 16 is the player's codex; most villagers hold 3–8) and — the
new census — every living villager holds at least one System-granted
ability, most hold 1–4 grants plus 3–11 skill-derived abilities. Nobody
on any final roster is dead; the 21–41 death records per seed are
fight/expedition/wound/sickness records. Two villages changed bearers
mid-run by succession (Ethel→Fernando, Duc→DeShawn) without scattering.

## Contests (r101 metric-review rule applied)
Fired/ended per seed: 3/3, 5/4, 3/2, 5/5 — identical to r102/r103. Under
the corrected rule (exclude fired within 2 days of run end): 1502's
calorie_run (fired day 43, endDay 44) and 1503's drop (fired day 41,
endDay 43) are excluded — ZERO stuck contests on any seed. No seed fired
zero contests. Results are mostly wins (1504: 5/5 won).

## People check (M5), in plain words
All eight held conversations read as people with business, not menus
(the same eight villagers r102/r103 sampled — the villages reproduced):
- 1501 Ana dreams of taken kin in humming pods, asks the player to ask
  the System, and accepts a promise; Greta tests whether the player can
  be trusted and judges the answer ("The wrong one would've been 'yes'
  too fast").
- 1502 Ezequiel needs hands on a wound and a Haven-door condition;
  Quinn confesses skimming food, ashamed and unable to stop, then notices
  who eats first and who waits.
- 1503 Priya's cut, a gossip thread, and three confront picks that
  escalate instead of looping ("I confessed that already. I'm not
  confessing it twice for dramatic effect"); James keeps a mental list of
  everyone still kind.
- 1504 Caroline and Sebastian both carry taken kin (sister Wanda,
  brother Kuba) and the pod dreams; Sebastian's trap-line invitation ends
  with a gifted tool.
Flat notes, stated not hidden: repeated "goon" picks return templated
mood lines ("The ease drains out of it, a little") — readable as mood,
not nonsense. Driver hygiene (not a game bug, same as r102/r103): the
people-check driver picked a betrayal:accept verdict on Sebastian's case
while sampling; held-convo drivers should avoid story verdicts the way
the teaching driver did.

## Telemetry deviation check (step 14)
Baseline: `telemetry-baselines/establishment.json` (r40 re-seed).
Per-seed JSONs carry derived `guardrails` + `c3` blocks (same derivation
as r103: deaths / aliveEnd / pantryKcalEnd / starvation count, computed
from each file's own fields).
Command: `node scripts/telemetry-check.js --baseline
.../telemetry-baselines/establishment.json --current
'evidence/2026-11-05/journey-establishment-r104-seed*.json' --metrics
guardrails.deaths,guardrails.popAlive,guardrails.pantryKcal,c3.starvationDeaths`
- LOUD: `guardrails.deaths` 41 -> 114 (+178%).
- Quiet: popAlive, pantryKcal, starvationDeaths.
- Verdict: same class as r85/r86/r99/r101/r102/r103, now a seventh
  consecutive panel — and the numbers are IDENTICAL to r102/r103 (same
  seeds, same deaths: 21+41+22+30=114). NOT a village-mortality
  regression — rosterDead 0 on all four seeds, and villager-combat /
  expedition / wound / sickness rows dominate every seed's death list, so
  most death records are fight records, not village deaths. **Baseline
  NOT rolled forward** in this run; the roll needs its own regime note
  (per the baselines NOTES.md) and is not done silently here.

## Metric review (for the NEXT run, not this one)
- M1a's bearer artifact is now handled in the analyzer (codex-match
  exclusion, both numbers printed). Future holdings censuses must exclude
  the bearer the same way — the roster includes the bearer, and npc
  stores are empty for them by design.
- The missing instrument is still the DUTY/CRAFT half: cleaning-duty
  `field_dressing`, wound-care treatment gating, `preserve_food` duties
  have no actor-attributed row, and diplomat/herbal_medicine are now
  proven HELD (9 and 3 villagers) but never seen firing anywhere — the
  next instrument should give those two a visible use (or prove their use
  is conversational and record it there).
- The next question after holdings is combat-XP velocity: no villager
  crosses the first combat threshold (18) in 42 days, so the combat kit
  is unreachable in the establishment window by construction. Whether
  that is too slow is a BALANCE question for the XP work (build-xp-gear
  lane), not a defect claim from this run — but the number (max 17/18)
  is now measured and should be cited, not guessed.
- Still standing, unchanged: scholar-day labels skip/repeat (all ordering
  uses telemetry sequence index); census `equipped` first-row duplication
  (r99); player codex start snapshot is missing (end snapshot only);
  armor lessons are not skill_lesson rows and armor-craft attempts are
  near-zero in-window.
- `ability_used` double-emission (pre-existing, not introduced here):
  a composite `activateAbility('purify.cleanse')` emits TWO rows — one
  from the `useAbility` wrap, one from the `activateAbility` wrap. The
  analyzer counts first evidence only, so rates are unaffected.

## Reachable / fun / winnable (establishment)
- Reachable: YES for holdings — every living villager holds a granted
  ability by day 42, and 22 of 29 grew their holdings in-window; and now
  YES for patient_aim firing in the wild (Ethan, day 33) after the fix.
- Fun: IMPROVED — a held ability that could never fire now fires with a
  visible 2.5x payoff ("goes still... strikes for 15 (aimed 2.5x)").
  What still doesn't show: diplomat and herbal_medicine are held and
  never seen doing anything, and the combat kit (haymaker, war_cry,
  unbreakable, and 12 more) is held by nobody in the whole window.
- Winnable: PARTIAL, same shape as r101/r102/r103 — survival, wave
  progression (to wave 4 on one seed), contests, and teaching all work
  in-window, no scatter, no starvation. The establishment risk this
  panel is not food but fights: 1502 lost half its roster to monster
  fights/expeditions while its pantry stayed fat — and no villager in
  any village is earning the combat XP that would grant a combat ability.

## Infrastructure notes
- Registration was slow (~7 min) under REGISTRY.lock flock contention
  (three flock waiters queued); the register script itself was healthy,
  just queued. Heartbeat loop held throughout (600s loop, log:
  goal hidden_files/journey-establishment-r104-heartbeat.log).
- safe-commit index clobber hit on the prereg commit (4 files staged as
  deleted after a correct commit); repaired with `git update-index
  --cacheinfo` from HEAD blobs, verified clean `git status` + empty
  `git diff HEAD` and correct `git show --stat`.
- `check.js --quick`: **281 passed, 9 failed in 1104s** — and ZERO of the 9
  are caused by this run's fix. Breakdown, each verified: 7 fail identically
  on clean master (stash comparison — same failures with the fix stashed):
  test-measurement-proof-update, test-measurement-workflow,
  test-measurement-cache-flags, test-occupation-panels (all the "retained
  neutrality proof covers the current inputs" family — the proof is stale
  on master itself, most likely since r103's own fieldFights.js instrument
  landed without a refresh; refreshing it is a separate maintenance job,
  `scripts/balance-proof-update.js`), test-mobile-combat-cadence (same 2
  sub-failures clean and fixed), test-phone-frame-proof and
  test-establishment-r20-fixes (the two known baseline failures from r103).
  The other 2 were 120s timeouts under parallel load (a sibling loop ran
  its own check.js concurrently) and PASS alone: test-trust-observer-
  neutrality 6/6, test-capable-bot 38/38. Targeted proofs on the touched
  areas: holdings 24/24, patient-aim 21/21.
- No EPERM flap this run.
- Rotation advanced 1 -> 2 (deepening next).
