# Wave-2 item 10: player hide-armor recipe fires from pack materials

Branch: `gap-hidecraft`, base `d8f334da8` (master at branch time; the branch was
created at `3688fa9bf` and fast-forwarded to `d8f334da8` before any edit, no
work of mine rebased).

## Plain-words meaning

Before this change, the simulated player could learn how to make hide armor
(picking up a hide teaches the shape of it), carry everything needed for it
(2 hides, 1 vine), and still never even try to make it — on any day, on any
seed. The player's armor routine only ever tried bark armor, and only when
nothing decent was already worn or owned. So anyone who had already made or
worn bark armor — the normal path — was locked out of the better hide armor
forever, no matter how many hides they carried.

After this change, the player tries hide armor first whenever it would be an
upgrade: the recipe is known, the materials are in the pack, and nothing as
good is already owned or worn. The attempt still goes through the game's own
rules — a barely-seen recipe is a long shot that risks the materials, and a
lucky first success teaches the hands for next time. Nothing about hide
armor itself changed: same protection, same materials, same odds.

## Diagnosis (what was actually broken)

Ruled out, in order:

1. **Learning path — works.** Handling a hide teaches `hide_armor` L1
   (`via: 'witnessed'`, corpses.js `noteHideHandled`). Proven in the proof
   script, variant E.
2. **Engine craft — works.** `Game.craft('hide_armor')` with L1+ and pack
   materials (material-tagged hide x2, vine x1) consumes and produces through
   the normal gates (L1 blind 35%, L2+ 85%, blind success teaches L2). The
   pack UI also lists the recipe at L1+ with a "Try blind" button.
3. **Villager crafting — works and untouched.** `villagerArmorCraftDay`
   draws from the communal stash, not the pack. No villager file is touched
   by this change (see diff stat below).
4. **The player's decision path — broken.** `gearUp` in
   `scripts/policies/competent.js` (the balance-panel player; `capable` and
   the scale-courtship policies all delegate to it) had exactly one armor
   craft: bark, inside `if (abestI < 0 && wornMax < 10)` — nothing owned,
   nothing decent worn. There was no hide branch anywhere in the default
   player. A bark wearer (P=10) fails `wornMax < 10`; an owner of any armor
   fails `abestI < 0`. So with the recipe learned and the materials in the
   pack, the attempt count was structurally zero.

So the block was not a wrong inventory, a wrong gate, or a missing
precondition in the engine — it was a missing attempt in the player's upkeep.
The fix adds the attempt; it does not change any gate, threshold, rate, cost,
or effect (gating freeze respected).

## The fix

In `gearUp`'s armor section, before the bark branch, in all three copies of
the player policy (`competent.js`, `competent-nofallback.js`,
`competent-nofallback-socialD.js` — their armor blocks were byte-identical):

- Attempt `hide_armor` when: armor crafting is on, no owned/worn armor beats
  P=20, hide armor is not already owned or worn, the recipe is L1+, and the
  pack holds 2 hide + 1 vine.
- Once per day (a blind attempt 3x/day would burn scarce hides), and never on
  a day the opt-in hide layer already tried (reads the layer's
  `ctx.hideCraftDay` marker, so the two paths never double-burn one day).
- Through `Game.craft` only — all engine gates, odds, and the blind-teaches-L2
  rule apply unchanged. On success the pack is re-scanned so the equip step
  below wears the fresh piece the same upkeep.
- Hide joins bark as a vine competitor in `vinebank.js` (VINEBANK=1 only,
  default off): while the trapper is banking vine for the snare blind band,
  the hide attempt defers like bark does, instead of eating banked vine.
- `COMPETENT_CRAFT_ARMOR=0` still disables both armor crafts, preserving the
  old-behavior switch for before/after measurement.

No new system, no new tier, no retune: hide armor keeps P=20, 2 hide + 1 vine,
35% blind / 85% known.

## Proof (identical seeds, before/after)

Script: `scripts/test-gap-hidecraft-player.js` (node, never jest). It forces
the craft roll to succeed so it measures the *attempt*, not the roll, and runs
one `gearUp` per day for 5 days per variant. Seeds 7, 42, 99 throughout.

| Variant | Before (unpatched tree) | After (patched tree) |
|---|---|---|
| A: L1 witnessed + 2 hide + 1 vine in pack, nothing worn | 0 crafts, 0 worn, materials untouched (2/1) — all 3 seeds | Crafted day 1, worn on torso, materials consumed (0/0) — all 3 seeds |
| B: same, while wearing bark (P=10) | 0 crafts, bark stays, materials untouched — all 3 seeds | Crafted day 1, torso upgraded bark → hide, materials consumed — all 3 seeds |
| C: L0 + materials (knowledge gate) | No craft, materials untouched — all 3 seeds | Same — gate holds |
| D: already wearing hide + materials (no duplicate) | No craft, materials untouched — all 3 seeds | Same — no duplicate |
| E: witnessing-learn path | Handling a hide teaches L1 (witnessed) | Same — untouched |
| A through nofallback copies (seed 7) | (same missing branch, byte-identical block) | Crafted day 1, worn — both copies |

Before: 14 passed / 15 failed (every A and B craft assertion failed).
After: 35 passed / 0 failed (exit 0).

## Regression sanity

- `scripts/test-hide-r15.js`: RED phase updated in this commit (see below);
  L0, RE-CRAFT, and SWEEP phases green. GREEN2–5 and the FIGHT phase fail —
  **pre-existing on this base, not caused by this change**: with all four
  policy files stashed (same `d8f334da8` base, unpatched code) the run fails
  GREEN2–5 and crashes at the same FIGHT line, byte-identical in outcome.
  The coordinator/ship loop owns that base regression; this arm does not fix
  it and does not hide it.
- `scripts/test-armor-up-20261012.js` (bark armor): 5/5 — the bark path
  still crafts and equips.
- `scripts/godpath/test-livelihood-controllers.js`: 23/23 (maker path intact).
- `scripts/godpath/test-counter-material.js`: 48/48 (counter pickup → craft
  chain intact).
- Villager hide crafting: no file under `src/js/villager-build.js`,
  `src/js/storage.js`, `src/js/corpses.js`, or `src/js/game.js` is touched.
  Diff stat: 3 policy files +43 lines each, `vinebank.js` +2 lines,
  `test-hide-r15.js` RED update, new proof script, this note.

## test-hide-r15 RED update (intentional, same commit)

Repo rule: a green test that breaks because the design changed on purpose is
updated in the same commit and the change is stated. The old RED premise was
"gate off = no craft at all". That is now false by design: gate off means the
*layer* adds nothing, while the base policy crafts. RED now asserts, with the
craft roll forced to fail so it is deterministic:

- RED1: layer counters undefined (layer off) — unchanged.
- RED2/RED3: no piece created, level stays L1 under the forced-fail roll.
- RED4: no phantom piece created — relabeled (the old "consumed nothing"
  wording was wrong once the base attempt consumes on failure).
- RED5 (new): the base policy attempted (attempt counter ≥ 1, materials
  consumed 2 hide + 1 vine → 0/0) while the layer stayed off.

## Open items for the coordinator

- `test-hide-r15` GREEN2–5 + FIGHT crash fail on base `d8f334da8` with or
  without this change (stash-proven). Needs a base-side look before
  `check.js --quick` can go green on this test again.
- Balance-panel effect of the new attempt (more P=20 wearers in sims) is for
  the coordinator's before/after measurement, not claimed here. The
  `COMPETENT_CRAFT_ARMOR=0` switch restores the old behavior for that
  comparison.
