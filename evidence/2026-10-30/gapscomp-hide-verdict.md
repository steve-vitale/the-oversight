# gapscomp-hide verdict — HIDE WEARER GAP (2026-10-30)

## Verdict: GO (fix landed on branch gapscomp-hide, pending coordinator merge)

Hide armor now enters the world through the NPC route. The claim is ONLY
that: hide armor is crafted and worn by villagers. No claim is made that
armor helps the long climb — the multi-seed armor-on vs armor-off
comparison is still owed, as before.

## Break point (exact, reproduced pre-fix on seed 330)

- `src/js/villager-build.js` `villagerArmorCraftDay()`: NPC armor knowledge
  came ONLY from wearing — `wornIds.has('bark_armor')` /
  `wornIds.has('hide_armor')`. No other NPC knowledge source for hide.
- `src/js/game.js` `seedArmorWearer()`: seeds ONLY bark_armor (up to 3
  wearers, worn from day 0). Nothing ever seeds a first hide wearer.
- No hide-teach beat exists (bark has one, villager-objectives.js:1723).
  No NPC hide-handling beat exists: corpses.js `noteHideHandled` writes
  the PLAYER codex only; food.js restricts the butcher beat to scholar
  inventory/prepStash; stash take is a player action.
- Player side is NOT circular: handling hide teaches the player hide L1,
  and the player can craft at 35% blind. The dead end is NPC-only: the
  NPC sewing loop needs a wearer, and no NPC path creates the first one.

Probe (seed 330, fresh world, everyone home, cooldowns cleared, stash
bark/vine/hide 20, craft RNG forced to success — knowledge is the only
variable): the beat RUNS (1 bark craft: bark 20->17, vine 20->18) but hide
is never attempted: hide crafted 0, hide stash untouched at 20, worn hide 0.
A manually planted `avCraft[handler].hide_armor = 1` record is INERT
pre-fix (hide still 0) — the record alone was never wired.

## What is different about hide (why not a bark reskin)

- Bark discovery = SEEING a finished cuirass (old-cuirass beat at dawn +
  wearing + wearer-teaches-player). Hide discovery = HANDLING the material
  (player L1 from holding hide). The fix extends hide's own asymmetry to
  NPCs; it does not copy bark's seed.
- Hide material comes from hunting (stash inflow: rarest roll, 5% of the
  inflow mix), recipe 2 hide + 1 vine, protection 20 (bark: 3 bark + 2
  vine, protection 10, inflow 30%). Hide therefore enters only AFTER
  hunting brings hide home — not at creation.

## Fix (39 insertions, 2 comment lines reworded; no gate, deed bar,
## default, recipe, material, or odds changed; bark behavior untouched)

1. `src/js/villager-build.js` — new `noteNpcHideHandled(vid)`: records L1
   hide knowledge in the craft beat's own level map (`v.avCraft[vid]`),
   never lowering an earned L2, never throwing, ignoring the player id.
   Returns true only when newly set.
2. `src/js/villager-build.js` — `villagerArmorCraftDay()` known list adds
   hide when `v.avCraft[vid].hide_armor` is set (in addition to wearing).
   Bark path has no handler route and is unchanged.
3. `src/js/storage.js` — stash-inflow wrap (`npcBatchTurn`): when the
   inflow material is hide, the giver is recorded via
   `noteNpcHideHandled(giver)` (guarded try/catch so a recording failure
   can never break the inflow). Trigger (open village, 6%), mix, amounts,
   RNG draw count, cooldowns, and craft odds are all untouched.

The first NPC hide craft seeds a wearer by construction: the crafted piece
enters the crafter's items and `autoEquip` wears it (hide protection 20
beats bark 10 in `equipScore` for every temperament), and the PRACTICE
rule teaches L2 on a successful blind craft.

## Alternatives rejected (and why)

- Seed a hide wearer at creation: copies the bark mechanism (a reskin),
  grants cured hide (prot 20) before any hunt, bypassing the hunting
  economy that is hide's honest source, and would perturb bark gear-pile
  outcomes (hide outranks bark in the pile).
- Player-codex leak (NPCs know hide because the player knows it):
  violates the perception law — no sight, lesson, or handling by that
  villager. Knowledge must attach to a person who did something.
- Drop the wearer requirement entirely (any villager with mats crafts
  hide): lets villagers sew armor they never saw or handled, breaking
  "if you don't know, it doesn't show" and making bark's gating
  inconsistent.
- Narrow wearer-to-teaching-only as the sole fix: teaching is
  player-facing (bark teach beat); NPC crafting still needs its own
  knowledge source, which handling supplies. Wearing still counts for
  both craft and teach; nothing about teaching changes.

## Proof (proof test: scripts/test-hide-wearer-gap.js; probe:
## scripts/probe-hide-wearer.js; crafted counts from stash consumption,
## hide/2 and bark/3, because the worn+held census double-counts a piece
## sitting in both items and equipped)

BEFORE (pre-fix, seed 330):
- probe nohandler: hide crafted 0, bark crafted 1, worn hide 0.
- probe handler-record (manual avCraft entry): hide crafted 0 (inert).
- proof test: FAIL (Arm A passes, Arm B/C fail: no noteNpcHideHandled).

AFTER (post-fix, same fixtures):
- seed 330 proof: PASS. Arm A (gate holds): hide 0, bark 1 — identical to
  the pre-fix baseline, i.e. bark regression clean. Arm B (handler):
  hide crafted 1, worn hide 1 (noteResult true). Arm C: craft level 2
  after craft, second note does not lower it. Arm D: player codex
  unchanged (null before and after).
- seed 7 proof: PASS. Arm A: hide 0, bark 3. Arm B: hide crafted 1,
  worn hide 1. Arm C/D pass.
- probe nohandler in the worktree: hide 0, bark 1 (baseline reproduced).

## Regression

CHECK-QUICK: DONE — 284 passed, 6 failed in 918s (log:
evidence/2026-10-30/gapscomp-hide-checkquick.log).
Command: `node scripts/check.js --quick --jobs 4` in the worktree.
The 6 failures are EXACTLY the known baseline set, no new failures:
measurement-proof-update, measurement-workflow, mobile-combat-cadence,
occupation-panels, phone-frame-proof, establishment-r20-fixes.
(A first --jobs 2 run was lost when its exec session tracking dropped;
the rerun above, logged to a file, is the recorded result.)
Note: check.js --quick spawns plain node scripts (no jest process), so
the jest --cacheDirectory flag does not apply to this run.

## Scope kept

- No leg-village link touched. No gate or deed bar retuned. No default
  flipped. Bark armor behavior unchanged (Arm A bark counts identical
  before/after on both seeds). No pushes, no version bumps, no live
  verification (per task). Panel caches never committed.
- Worktree registration was blocked ~40 min by the container EPERM flap
  (write(2) returning EPERM on .git/refs/heads and other paths; sibling
  loops were hit at the same time, e.g. gapscomp-pavise retry loops).
  Registration finally succeeded on retry 10 at 16:45 UTC. The fix was
  validated in a scratch symlink tree (main-tree files linked, only the
  two edited files copied) before landing, and re-proven in the worktree
  after landing; the scratch tree was deleted.
