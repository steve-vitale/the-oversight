# sim-wornstack-a — mantleBecome worn-stack collapse fixed (finding #2698)

Loop A run `fleshout-20261123T0215Z`, axis scale-onramp. Arm: **sim-wornstack-a**,
the worn-stack fix. Finding #2698 (`hidden_files/sim-findings.md` line 2698;
measured in `evidence/2026-11-22/sim-gunloss-a.md` §4.3).

## Verdict: FIXED

**The fix:** `mantleBecome` (`src/js/villager-build.js`) now carries a worn
stack's `units` onto the scholar. A 2-cell stack worn as gear survives
succession as 2 cells; nothing else about the worn copy changes.

## The defect as measured

- Seed 107369 day 134: omar's 2-cell fusion stack worn as one accessory
  collapsed to 1 on succession (net loss 1 cell; the gun survived).
- Code: the worn loop splices the pack object holding `units:2` out of the
  pool and seats `Object.assign({}, e)` — and a villager equipped entry
  never carries `units` (`equipment.js` `autoEquip` builds `{itemId, name,
  wkind/armorTier/headKind/fullSet}` only). The worn copy therefore reads
  as 1 cell. The inventory path already had this fix (GAP-W4-NARR #807:
  `toScholarItem` carries the source object's `units`); the worn path
  never got it.
- Canon: no canon doc covers succession or the worn transfer — the design
  intent lives in code comments ("what they wore stays worn, in the same
  slot", tackle-succession 2026-10-27). Noted, not invented.

## Fix shape and why

- Carry `units` in the worn copy: read the spliced pool object's units;
  when it holds more than one, set `s.equipped[sl].units`. A single unit
  stays bare, matching every other worn copy in the codebase (`game.js`
  `equipItem`, `equipment.js` `autoEquip`).
- Chose this over "stop the gear step wearing stacked consumables":
  the gear step legitimately wears any carried item as a trinket
  (`equipScore` gives any item 3 for an accessory slot), and the design
  is that the successor keeps what they wore. The loss was in the copy,
  not in the wearing.
- Other dropped fields audited: the worn copy carries `itemId`/`name`
  plus `wkind`/`armorTier`/`headKind`/`fullSet` from the equipped entry.
  The pool object also holds `kcalEach`/`kg`/`flavor`/`owner`/`bonded` —
  none of them is a quantity and nothing reads them off a worn slot, so
  only `units` destroys anything. The fix touches only the units path.
- No player-visible behavior change: a worn cell still shows as one worn
  cell; only the count behind it is preserved.

## Proof test

`scripts/test-wornstack-mantle-a.js` — 13 checks, staged on the measured
shape (searcaster + 2 cells, equipped, seed 7):

- Old code: **11/13** — exactly the two stack assertions fail (worn cell
  carries no `units`; scholar cell total 1, not 2). Defect reproduced.
- New code: **13/13** — worn cell carries `units:2`, scholar total 2,
  same slot, every other worn slot byte-identical, gun bare, villager
  record wiped.
- Regression: `scripts/test-gunloss-a.js` **42/42 green** (its §7
  assertions count worn cells per slot, so they still pass — see note
  below).

## Verification sim

The proof test calls the real `mantleBecome` in the loaded game on the
staged measured shape — the live game path, not a stub. No band re-run:
this is a single-succession defect, not a lever contrast, so no wall
numbers were produced; national / table / wins are unmeasured this run
and there is no reason to expect movement (one cell preserved per
succession). The seed-107369 day-134 replay was not re-run — the proof
covers the identical staged shape.

## Village assessment, in plain words

A village that just lost its scholar now keeps the new scholar's full
kit. The spare cell that used to vanish the day the village buries one
leader and hands the kit to the next stays on the new scholar as a worn
charm. One cell per succession is small, but it was a silent loss at the
worst possible moment — and it fired on every succession where the heir
wore a stacked consumable, not just omar's.

## Open threads (not chased this run)

- **Omar's corpse** (searcaster + worn cell, day 136, seed 107369) was
  never looted — still open, left for the backlog per the brief.
- **Sibling collapse in the scholar's own equip/unequip paths**
  (`src/js/game.js`, found while auditing the worn copy — NOT fixed
  here, out of this arm's file): `equipItem` splices a stacked inventory
  item out of the pack and seats a units-less worn entry (same collapse,
  player-initiated), and `unequip()` pushes `units:1` back to the pack,
  so a `units:2` worn cell still collapses if the player takes it off.
  Filed to the backlog as open.
- **Gunloss recorder counts worn cells per slot, not by units**
  (`scripts/gunloss-recorder-a.js`: `cellsEq += 1` per worn slot): after
  this fix its "net loss 1 cell" reading is stale as a game measurement.
  A future scholar census should read worn `units`. Instrument untouched
  this run.

## Metric review

Fix arm, not a lever contrast: no frozen bars. The judge is the proof
test — fail on old code (11/13, exactly the stack assertions), pass on
new (13/13) — plus the gunloss regression green (42/42).

## Files

- Fix: `src/js/villager-build.js` (mantleBecome worn loop)
- Proof: `scripts/test-wornstack-mantle-a.js`
- Regression: `scripts/test-gunloss-a.js` 42/42 (unchanged)
- No merge, no push, no version bump, no live verification — report to
  coordinator ("merged locally, pending ship" if merged).
