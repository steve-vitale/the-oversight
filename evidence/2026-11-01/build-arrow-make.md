# BUILD ARM 5 — ARCHER ARROW-MAKING (2026-11-01)

## Question
Bows with NO arrows in 24/65 wave-4 fights, volley literally 0% — a whole
combat verb never fires. Why do bow-carriers reach fights arrowless, and
what is the honest fix?

## Mechanism found
The volley engine (fieldFights.js) already fires when the fighter CARRIES
matching ammo, and villagerPocketAmmo (game.js) already crafts arrows at
DEPARTURE (one attempt, blind 35% / learned 85%, from the communal pile,
using the existing arrow/bolt recipes). The gap is everything that is NOT
a departure: a bow-carrier who never departs (home defense), whose blind
departure craft failed, or whose arrows were spent in an earlier fight
reaches a fight arrowless — and nothing at home ever re-arms them. The
shipped self-craft pattern (villagerWeaponCraftDay, lootabilities-w3 Arm
6: a weaponless villager at home crafts a spear/bow for themselves
through the daily beat) had no ammunition counterpart.

## Route call (and the rejected route)
CHOSEN: extend the shipped self-craft pattern with a daily at-home beat,
`villagerAmmoCraftDay()` in src/js/villager-build.js, called from
`villagerBuildDay()` right after `villagerWeaponCraftDay()`. A
bow/crossbow-carrier AT HOME carrying fewer than one batch (5, the
recipe's makesUnits; the volley caps at 4 shots per fight) crafts one
batch from their own carried materials first, then the communal camp
pile, using the EXISTING arrow/bolt recipes and the player's craft odds
exactly (blind 35%, learned 85%; a blind success teaches, the PRACTICE
rule), sharing the v.ammoCraft record villagerPocketAmmo already writes
— carrying the weapon IS the showing, so no new knowledge system. At
most 1 attempt per villager per 3 days (the weapon-craft cooldown), so a
failed blind craft cannot drain the pile day after day. Spear-carriers
fall out honestly: spear defs carry no weapon.ammo. No deedGateReady /
stage / scale / gate retunes, no win-price changes. PERCEPTION LAW
holds: every input is the villager's OWN state or the camp pile they
are standing at; the roster is iterated only to schedule each
villager's own decision, and no "who is arrowless" list is built or
consulted.

REJECTED: fight-entry top-up. fieldFight deliberately gears up
acquire=false ("a fighter doesn't whittle a spear mid-fight"); a
fighter far from home cannot honestly spend pile materials. The beat
fires only at home, standing at the pile.

## Before / after (identical seeds, seed 31101, proof script)
Proof: scripts/test-build-arrow-make-20261101.js — 20/20 PASS.
Scenario: villager with an equipped bow, no arrows, vs a wave-4
Congregation (speed 2; bow range 5 → up to 3 volley shots).

- BEFORE (no arrows, no duty): volley = 0 shots, 0 hits, 0 dmg; the
  "has a bow but no arrows — the string stays drawn, useless" line is
  narrated, never silent. Fight outcome vDie (the beast is untouched
  at range, as before).
- AFTER (same villager, after the daily beat with pile materials
  stick 10 / stone 10 / fiber 10): duty crafts exactly 1 batch = 5
  arrows; pile pays exactly the recipes.json arrow cost
  (stick 2 + stone 1 + fiber 1); ammo_craft tele ok=true; workbench
  narration witnessed at haven. The same fight then volleys 3 shots,
  2 hits, 34 dmg, arrows 5 → 2 (the quiver empties honestly).
- Controls, all PASS: no ranged weapon → no attempt, pile untouched;
  bow but no materials → no craft, stays arrowless; bow + 5 arrows
  already → no attempt, pile untouched.
- Proof-first gate: on pre-fix master the same script fails 0/6
  (A1–A5, B0) and exits 1 — the duty does not exist there.
- Note on proof determinism: the MAIN craft pins Math.random to 0.0
  for the duty call only (guaranteed success), so the mechanism and
  pile accounting are deterministic; controls assert NO attempt and
  need no RNG. A proof-quality catch during the run: the first GREEN
  attempt's controls passed vacuously (a leftover cooldown pin made
  the duty skip every scenario villager); the pin helper now clears
  the scenario villager's cooldown, so every control genuinely
  reaches its decision point.

## Commit
- Code + proof: 0e169fd4511d3dab9ff6e2d8d55ec71e54876b67 (branch
  build-arrow-make, base current master 8231797bc at commit time;
  spawn-time base 85953640e is an ancestor — master advanced while
  the worktree queue was blocked, see below).
- This evidence note: committed on the same branch (see branch tip).

## Infrastructure notes (for the coordinator)
- Worktree registration was blocked ~1.5 h by two unrelated
  conditions: (1) the registry-lock queue behind sibling registers
  (each running the slow reaper sweep), and (2) an intermittent
  container EPERM flap on .git writes (refs/heads lock, worktrees
  admin lock, index reset — failures across seconds, also hitting
  /tmp at one point). Five register-script runs failed on the ref
  write; the branch ref was then created with a tight retry loop
  (succeeded on attempt 39), the worktree checkout with a second
  retry loop (two attempts reached the index-reset stage before one
  succeeded), and the registry entry was appended by replicating the
  register script's own mechanism (registry-lock flock, same schema,
  atomic tmp + fsync + replace, validated before replace) because
  the script cannot attach an already-existing path. The resulting
  worktree + branch + registry entry are exactly what the script
  creates; heartbeat verified after registration.
- After the code commit, the worktree index showed the documented
  safe-commit index clobber (full commit as staged deletions);
  repaired with `git read-tree HEAD` in the worktree, then verified
  `git status --short` empty and both file hashes identical to HEAD
  before proceeding.
- The 1415Z ammo census numbers (24/65, volley 0%) are REUSED as
  instructed, not re-run.

## EXPLICIT CAVEAT (volleyfix)
This arm restores a verb — it does NOT claim to fix lethality.
Volleyfix already proved perfect ammo alone is only ~2% of a wave-4
beast's HP (this run's 34 volley damage against a 900–1100 HP
Congregation is the same shape). A bow-carrier who now volleys still
faces the same wave-4 wall; what changes is that the bow is no longer
a club with a drawn, useless string.
