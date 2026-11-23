# sim-wornstack-equip-a — FROZEN prereg

Arm: sim-wornstack-equip-a (Loop A, axis scale-onramp)
Run: fleshout-20261123T0815Z
Finding: #2707 (open, sim-findings.md) — scholar equip/unequip also collapse
  a worn stack. Sibling of #2698 (mantleBecome, FIXED ff17699c7).
Date frozen: 2026-11-23 (UTC). No edits after freezing except the result
  section at the end.

## Canon note

READ docs/CANON.md first (done). No canon doc covers equip/unequip stack
units — the canon manifest lists no equipment-units doc, and no doc in
docs/ covers how many units a worn entry carries. Nothing is invented
here: the fix follows the already-landed mantle rule (#2698, same >1
carry rule as toScholarItem #807) and the honest single-unit rule the
accessory path already uses (keepsakes.js equipAccessory moves exactly
one unit; its unequip wrapper returns the whole entry).

## The defect, in plain words

When the scholar wears something from their pack, the game takes the
whole stack out of the pack and puts one copy on their body — but the
copy forgets how many were in the stack. Wearing a stack of two stone
knives destroys one knife; wearing a 2-cell stack as a trinket loses
the second cell. Taking it off again is no rescue: unequip() always
puts exactly one back. The round trip pack -> body -> pack loses one
unit of anything stacked. The same collapse already bit succession
(#2698, fixed); this is the player's own hands doing it.

## Observable effect (what is proven, not the plumbing)

A stacked equip + unequip round-trip preserves units: equip a 2-unit
stack, take it off, and the pack holds 2 again — 0 lost. The proof
artifact is the round-trip itself, plus an old-code-fails control
(the same test run against unpatched code must fail exactly the
stack assertions).

## Fixture (encounter-gear rule, Steve 2026-11-13)

The staged scholar carries the same geared shape omar carried on seed
107369 — a searcaster with 2 cells — plus a stacked melee weapon, so
both the task's trinket framing and the genuine player path are
staged:
- stone knife, units:2 — equipped via Game.equip(idx, 'melee'), the
  path the pack's Equip button takes for a melee weapon.
- fusion_cell, units:2 — equipped via Game.equip(idx, 'head'), the
  slot the game's own autoEquip chose for the cell in the mantle case
  ("wear anything as a hat" fallback), i.e. the trinket framing.
- A second stone-knife stack (units:2) stages the overwrite case: the
  displaced worn piece must come home with its units too.

## GO threshold (frozen)

GO iff ALL of:
1. Weapon round-trip: equip knife units:2 -> worn entry carries
   units:2; unequip -> pack holds knife units:2 (0 lost).
2. Trinket round-trip: equip cell units:2 -> worn entry carries
   units:2; unequip -> pack holds cell units:2 (0 lost).
3. Displacement: equipping a second knife stack over a worn knife
   stack returns the displaced stack to the pack with units:2.
4. Single-unit stays bare: a 1-unit equip seats a worn entry with NO
   units field, and unequip returns units:1 (no inflation).
5. No duplication: total units across pack + worn are conserved at
   every step (knives and cells counted separately).
6. Old-code control: the same test on unpatched code FAILS exactly
   the stack assertions (1, 2, 3) and passes the rest — proving the
   test measures the defect, not the harness.

## Scope (frozen)

IN: src/js/game.js equip()/unequip() only — carry units on the worn
  entry when >1 (same rule as the mantle fix), restore them on
  unequip, and carry the displaced piece's units home on overwrite.
  Plus the gunloss recorder (scripts/gunloss-recorder-a.js): it counts
  worn cells per slot (cellsEq += 1), which undercounts a worn 2-cell
  stack — after the mantle fix it already misreads; the fix makes the
  misread reachable from the player's own hands. Recorder shape
  unchanged (cellsEq stays a number, now units-aware); the analyzer
  is untouched. Finding #2707 itself names this recorder correction
  as the follow-up.
AUDITED, NO CHANGE: keepsakes.js equipAccessory (moves exactly one
  unit, honest already) and its unequip wrapper (returns the whole
  entry, units intact); equipment.js migrateEquipment (moves slot
  keys only, never rebuilds entries); villager-build.js mantleBecome
  (already fixed, ff17699c7).
OUT: no tracker or claim-file edits (coordinator owns those); no
  corpse-loot lever (the Omar corpse thread is a non-gating diag from
  existing corpora only, reported separately); no balance change —
  this restores units the player already owned, it grants nothing.

## Metric review (to fill at run end)

This is a fix + proof-test arm, not a balance lever: there is no
before/after sim panel and no seed band. The binding metric is the
round-trip itself (GO threshold above). If the round-trip proves
insufficient as a metric (e.g. a worn-units consumer elsewhere in the
codebase is found that the test does not cover), that goes here and
the revision is proposed for the NEXT run, not re-scored mid-run.

## Result (filled at run end)

- Proof test: scripts/test-wornstack-equip-a.js — 21/21 on new code,
  9/21 on old code (stack + conservation assertions fail; staging,
  slot-landing, and single-unit-bare checks pass on old code).
  Nuance vs bar 6: conservation checks also fail on old code because
  they count the same lost units; see evidence metric review.
- Gunloss regression: scripts/test-gunloss-a.js — 42/42 (after four
  assertions that encoded the old collapse were updated to the fixed
  readings: worn 2 / total 2 / scholar +2 / net loss 0).
- Mantle regression: scripts/test-wornstack-mantle-a.js — 13/13.
- Analyzer selftest: 20/20.
- Verdict: GO — fix landed as its own commit (see evidence file).
