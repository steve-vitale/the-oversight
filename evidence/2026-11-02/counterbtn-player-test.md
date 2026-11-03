# Player counter-test button — gap round 2026-11-02

## Plain words

Villagers already test unknown monster flesh sitting on the kitchen counter
(the meat channel landed Nov 2, commit 2e591a9fc). The player could not:
the counter row offered no test button, packing the flesh refused it
(it is not finished food), and cooking it does not teach whether it is
safe. So counter flesh sat until it rotted, unless a villager happened
to test it first.

Now the counter row offers "Test cautiously" on exactly the flesh the
villager test covers. Pressing it runs the same careful taste-and-wait
the pack's test button already runs: safe flesh becomes known food (and
can then go through the normal cook-then-pack steps); poisonous flesh
is marked POISON, stays inedible, and costs the player energy — the
lesson learned the hard way, same as the villager version. No new rule
was invented: the button, its guard, and its outcomes are the existing
ones, just reachable from the counter.

What does NOT get a button, on purpose: a raw animal carcass on the
counter (for example a deer) is not monster flesh to test, and the
guard copies the villager scan exactly — cleaned-or-cooked, monster
flesh, still unknown — so it stays off animal flesh. Once flesh is
known (safe or poison-tested), the button disappears.

## What changed

- `src/js/app.js` — `stashActionsHtml`: new `data-stash-meattest`
  button under the villager counter scan's guard; wiring in the pack
  panel passes the prep stash to the existing
  `Game.testMonsterMeat(idx, stashOf())`. No `src/js/game.js` or
  `src/js/food.js` change: the engine already accepted a container.
- `scripts/test-counterbtn-20261102.js` — the proof (below).

## Proof (node, not jest)

`node scripts/test-counterbtn-20261102.js` — identical seeds
before/after. app.js is DOM-only and never loads in node, so the UI
half reads the app.js text (button present in the counter row, guard
exact, wiring passes the stash); the engine half runs the wired call
itself, `Game.testMonsterMeat(0, Game.prepStash())`.

BEFORE (unmodified tree; HEAD app.js contains 0 occurrences of
`stash-meattest`):
- UI checks 0/4 — no counter test button, no counter wiring.
- Engine checks passed even before (the engine call already worked
  with any container) — the gap was purely that the player could
  never reach it from the counter. Proof run before the change:
  9 passed, 5 failed (4 UI + 1 proof-check later corrected: revealed
  cleaned flesh is not directly packable — the designed channel is
  test -> cook -> pack, and cooking alone never teaches).

AFTER (this branch):
- `node scripts/test-counterbtn-20261102.js` — **14 passed, 0 failed**.
  Safe flesh (hushwolf, seed 20261110): player test marks it food,
  revealed flesh edible with real calories, button guard closes after
  learning; the villager beat on the identical setup gives the same
  outcome family. Toxic flesh (belltoad, seed 20261111): codex
  `foodTested=poison`, `foodSafe=false`, POISON label on the counter,
  player energy drops, flesh stays inedible. `takePrepFood` still
  refuses unknown flesh (the gap the button closes, not a bypass).
- Regression guard, untouched engine: 
  `node scripts/test-meatchannel-e2e-20261102.js` — **8 passed,
  0 failed** (S1–S6, including S6 deer carcass not monster-tested).
- `node --check src/js/app.js` — syntax OK.
- NOT run, per task: jest and `check.js` (coordinator runs
  `check.js --quick` serialized at merge). No browser playtest: this
  arm is `[needs-eyes]` UI — the button's look/feel on a phone still
  needs a human look, which node cannot prove.

## Held / open

- Phone look-and-feel of the new counter button: needs eyes (hence
  the tag), not provable in node.
- Heartbeat: `worktree-heartbeat.sh` blocked on the shared registry
  lock while sibling gap-round agents registered worktrees at the
  same time (two attempts, 60s+ waits, no output). The tree itself
  registered cleanly and is listed by `git worktree list`; the
  coordinator should re-heartbeat or confirm the registry entry at
  merge time.
