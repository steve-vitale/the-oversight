# Evidence — tackle-succession: succession inheritance feel (2026-10-27)

Workstream: tackle-all program. Steve's ruling (2026-10-27): when the
player takes over as a villager, that character must feel purpose-made and
intentional — the items they would have, the choices they have made, their
build — not a blank or reset character.

Gating freeze (Steve 2026-10-27 16:53, in force): NO gating thresholds
changed. No deedGateReady, scale, stage, readiness-bar, or table-price
edits in this work. No changes to the coordinator-owned landing branches
(gap-ammo, gap-route, gap-meat, gap-social, gap-seattaker, gap-woundmill,
gap-instruments, pack-refresh-20261027).

## Pre-registered bars (binding, MEASUREMENT.md §14)
Filed BEFORE the fix was measured, in
evidence/2026-10-27/tackle-succession-bars.md. Named takeover case: death
mantle via Game.playerDeath, heir = highest-trust NPC, seed 4242, proof
script scripts/test-succession-inherit-feel.js. Bars: items-carried,
stashed-carried, worn-preserved, abilities-carried, knack-latent,
tracks-carried, sheets-carried, plants-carried, skill-carried,
ability-knowledge-carried, languages-carried, bond-carried, goal-carried,
deedday-carried, godhood-carried, godpath-carried,
predecessor-gear-not-transferred, new-body-statuses-empty,
new-body-stats.

## Audit (master, before fix; harness probes, seed 4242, no repo writes)
1. LANGUAGES BLANK: heir planted spanish-native/english-basic woke up
   with the predecessor's {english:2}. mantleBecome/playerDeath never set
   scholar.languages. Root cause: missing carry, not a reset.
2. WORN GEAR DROPS: mantleBecome alone left scholar.equipped = {} while
   the heir had worn head + acc1-4. Two compounding causes: (a) the
   equipped loop matched pool items by (itemId||id), but villager items
   are usually plain string ids, so no worn slot ever matched; (b) the
   loop's slot list omitted acc1-4 entirely. In a full playerDeath the
   keepsake migration then re-wore a reshuffled accessory set (an unworn
   whetstone got worn; the worn multitool and mother's ring went unworn;
   the head slot was lost).
3. STASHED ORPHANED: heir person.stashed ([lighter]) survived the death
   untouched on the person record while scholar.inventory never gained
   it. After the mantle npcIds excludes the bearer, so no player path
   reads person.stashed again, and the next death's death pack (scholar
   only) deletes it outright.
4. CARRIES TODAY (verified, no fix needed): abilities, tracks, deedDay,
   godhood, godpath, plant knowledge into the codex, bonds, personal goal,
   and the predecessor-gear-stays-on-corpse rule.

## Fix (src/js/villager-build.js, mantleBecome only)
- Worn slots: body + acc1-4, matched by string-or-object id, kept in the
  same slot. (Nomad-road mantle shares mantleBecome, so it gains this too;
  nomadKill's own body-state handling is untouched.)
- Stashed belongings: mapped into scholar.inventory like carried items;
  person.stashed cleared with the rest of the kit. Rationale: the
  successor is the bearer now, so person.stashed is unreachable afterwards;
  their own things belong in their own pack.
- Languages: scholar.languages/englishLevel from the heir's own languages
  via npcLangs + levelsOf, plus the heir occupation's polyglot tongues
  (mirrors newGame).
- Comment/header updates only; no behavior change anywhere else.

## Proof test result (worktree, after fix)
scripts/test-succession-inherit-feel.js — ALL GREEN (20/20):
- old bearer gen_3uowwtn, heir gen_b36nqjb (Gabriel Hong), goal prove
- heir wore: head energy_bar_wrapper, acc1 trail_compass, acc2
  mothers_ring, acc3 tasting_spoon, acc4 whetstone — all preserved
  in the same slots after death
- carried 5 items: all in pack/equipped; stashed multitool: in pack,
  person.stashed emptied
- abilities: beast_calm, knack latent; tracks combat 6 / field 12 /
  strange 3 (= heir record + the two documented death deeds, see metric
  review); level-up sheet carried; plants, skill purify_boil, and
  ability knowledge all carried
- languages after: {spanish:2, english:1}, englishLevel 1 — the heir's
  own tongues, not the predecessor's {english:2}
- bond unchanged (v 6, depth 0); goal prove unchanged; deedDay, godhood,
  godpath markers carried; no predecessor gear leaked; statuses/diseases/
  poisons empty; stats 5/7/6/6/5 (heir occupation bonuses)
- SENSE: "bearer Gabriel Hong | goal prove | wears energy_bar_wrapper,
  trail_compass, mothers_ring, tasting_spoon, whetstone | carries
  multitool | speaks spanish, english | knows beast_calm" — the new
  bearer reads as the heir who lived here: his worn gear, his pack, his
  tongues, his goal, his build.

First run note (transparency, not a re-score): the first post-fix run
failed tracks-carried only, because the TEST setup overwrote the heir's
npcXp record with a sheets-only object, clobbering his real combat/field
xp. Root cause was the test, not the game: the game had carried exactly
the record it was given. The test now reads the heir's effective record
the same way mantleBecome does (map entry, else npcXp()) and adds the
sheet to a copy of it. The game code did not change between the two runs.

## Regression checks
- scripts/test-succession-inherit-feel.js (this work): ALL GREEN (20/20).
- scripts/test-succession-inheritance.js (pre-existing): ALL GREEN.
- Targeted mantle/succession neighbours, all green: fusion-mantle,
  mantle-coalition, mantle-memory, playstyle-succession, orientation,
  exile-docket, grief. mantlechain: gate-stop (needs pinned substrate
  env, not a failure). mantlebeat: throws at require time on a missing
  scripts/policies/mantlebeat module — absent from this checkout and
  from master alike, pre-existing, before any game code runs.
- node scripts/check.js --quick (two full runs, same result both times):
  278 passed, 9 failed. All 9 are pre-existing base failures, none
  touching mantleBecome/playerDeath (0 references in any of the 9 test
  files; this diff touches only mantleBecome + comments, and check.js
  runs each test as its own process):
  - godpath/test-hide-discovery.js (1 counter-butchering case)
  - godpath/test-measurement-comparison.js (balance-windows throw)
  - godpath/test-measurement-proof-update.js ("Proof source inputs are
    not current" — stale measurement proof)
  - godpath/test-measurement-workflow.js (stale neutrality proof)
  - godpath/test-mobile-combat-cadence.js (Continue round-wrap)
  - godpath/test-occupation-panels.js (CLI workflow throw)
  - godpath/test-phone-frame-proof.js (stale phone receipt hashes)
  - scripts/test-foodpower-20261014.js (ontology validator: exactly 1
    error, in src/js/table.js's seat-taker provides line — a file this
    work never touched; villager-build.js itself validates clean)
  - scripts/test-establishment-r20-fixes-20261020.js (racks-full voice
    gate, next-day case)
  These 9 fail on the base for reasons unrelated to succession; they are
  reported here, not fixed here (out of this workstream's scope, and
  several belong to other lanes' proof-refresh work).

## Metric review
One bar clarification, recorded here (not a mid-run re-score of a game
result): tracks-carried reads "scholar.tracks xp equals the heir's npcXp
per track", but two documented death deeds land on the NEW bearer after
the mantle (tracks.json: mantle +2 strange, death_in_family +1 strange),
so strange expects heir + 3. The bar's intent — the heir's record carries
— is unchanged; the +3 is the death's own event, also visible in the
deedDay record (death_in_family {day:1, n:1}). No other metric changed.
Nothing in this run was judged against a friendlier metric after a miss:
the single first-run tracks failure was traced to a test-setup bug (see
above), fixed in the test, and re-run green with the game code untouched.

## Verdict
GO: the taken-over character keeps their own items, worn gear, stashed
belongings, build, knowledge, tongues, relationships, and goals, and all
pre-registered bars pass. The 9 quick-check failures are pre-existing
base failures in unrelated systems (listed above), not regressions from
this change. Ready to merge through the normal review/ship process;
not pushed, not version-bumped, not live-verified (per task). Worktree
left clean, branch tackle-succession committed, not deleted.
