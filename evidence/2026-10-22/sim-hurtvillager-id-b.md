# sim-hurtvillager-id-b — evidence (adoption, run fleshout-b-20261022T035902Z)

## Pre-registration
- **Question**: backlog #788 — the HURTVILLAGER "monster" literal blocks monster-level death attribution (38/230 person deaths in the deathcensus-b corpus classified only to combat-unknown because the engine passed the literal cause string "monster" at hurtVillager time without threading the fight record's monster id).
- **Fix design** (from the dead worker's proof header, completed in adoption): the 9 'monster' hurtVillager call sites pass `{monsterId, monsterName}` via the existing optional 5th arg (`damageContext`); the lethal NPC death block forwards them into `registerDeath` opts and the `v.fallen` entry. Cause strings UNCHANGED. No combat outcomes, damage numbers, or fiction text change.
- **GO bar**: proof 26/26 green (PART A fixtures 18/18 + PART B det-gate byte-identical + PART C same-base before/after: zero outcome drift, zero row drift outside the new fields, combat-unknown share strictly improved, remaining combat-unknown player-vessel only).
- **Substrate**: FEASTSCALE_R13=1 / SEATDRIVE=0, 180d death-aware, seeds 66041-66044 x {leadfeast, belongfeast} (8 runs/side for the before/after corpora).
- **Policies**: n/a (instrument-only fix).

## What the dead worker left
The 2330Z run's worker died at ~02:02Z with uncommitted work: 8 game.js call-site hunks passing the 5th arg + the proof script (PART A/B/C written). The forwarding into registerDeath/v.fallen was MISSING — the 5th arg was silently ignored, so the fix was a no-op. The fieldFights.js 9th site (ally-down) was also unthreaded. Adoption completed both.

## The fix (landed 5d8f5d551 + eb45a5c53)
- `src/js/game.js` hurtVillager lethal block: `registerDeath({... monsterId: damageContext?.monsterId || null, monsterName: damageContext?.monsterName || null})` and `v.fallen.push({..., monsterId, monsterName})`.
- 8 game.js 'monster' call sites (patrol cluster x4, wild/expedition cluster x4): 5th arg `{monsterId: m.id, monsterName: mName}`.
- `src/js/fieldFights.js:1063` ally-down: 5th arg `{monsterId: mdef.id, monsterName: mName}`.
- `registerDeath` already supports monsterId/monsterName (corpses.js monster-kill path). The new fields are write-only for census/display: no engine decision reads death-row monsterId (verified: all `.monsterId` reads are on monster/draw/UI objects); `v.fallen` readers check only `.day`/`.cause`.

## Proof results
- PART A (fixtures): 18/18 — threaded rows carry monsterId/monsterName, classify `combat-highbeam_deer`; unthreaded rows (no context, sickness path) land nulls and classify combat-unknown; cause strings unchanged.
- PART B (det-gate): paired 60d re-runs byte-identical — the new fields add no nondeterminism.
- PART C (same-base before/after, 8 pairs): zero outcome-level drift (all non-death fields byte-identical across the 8 runs — end reasons, days, national/table/won, death counts all identical); zero row-level drift outside monsterId/monsterName; classification moves only combat-unknown -> combat-<mid>; combat-unknown 26/296 (8.8%) -> 1/296 (0.3%); the remaining 1 is player-vessel (playerDeath pipeline, documented out-of-scope).
- Honest adaptation note: the dead worker's PART C design compared against the committed 2026-10-21 corpus (anchor 961321a40857), but that anchor predates behavior-changing commits (SURPLUSFEED removal, journey-succession r36 death mechanics, cisterncheck-b dispatch, plentydepri default-ON) — byte-identity across that gap is unachievable and would not be evidence about this fix. Same-base before/after is the honest gate; documented in the test header.
- Test-harness bug caught by the proof: duplicate (vid,day,who) keys for monster rows sharing null vids — fixed by pairing duplicates in file order.

## Reachability / village assessment
Instrument-only attribution fix; no lever, no reachability change. The village assessment stands on the deathcensus-b corpus: combat remains 73.9% of deaths; the census can now name the killer monster for 25 of 26 previously-unknown NPC monster deaths.

## Metric review
- The pre-registered GO bar held as written; no re-scoring.
- Proposal for the next run: the deathcensus instrument's `pclass`/`detail` fields should be versioned alongside the corpus anchor so future cross-base comparisons degrade gracefully instead of demanding byte-identity.

## Blanks filled
- Backlog #788 -> fixed (this run). The death census can now claim monster-level attribution for NPC monster deaths; the remaining combat-unknown class is player-vessel only.
