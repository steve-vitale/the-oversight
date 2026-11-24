# sim-worngun-reseat-b — PREREG (frozen 2026-11-24)

**Arm:** sim-worngun-reseat-b · **Loop B run:** fleshout-loop-b-20261124T1030Z
**Axis:** winnability-chain · **Finding:** sim-findings.md — A WORN-ONLY GUN IS
DESTROYED BY THE NEXT AUTOEQUIP RE-SEAT (Loop B arm sim-guntransfer-b,
run fleshout-loop-b-20261124T0840Z, evidence/2026-11-24/sim-guntransfer-b.md §4)
**Type:** BUILD (game-code fix + proof test + before/after replay)
**Status:** FROZEN — no metric changes after this point without an appended amendment.

## 0. Verified mechanism (correction to the finding, proven on current master before any change)

The finding names `autoEquip` as the destroyer. Probes on current master
(worktree sim-worngun-reseat-b @ 9b038de58, /tmp/worngun/probe2–probe5.js,
same substrate as the guntransfer band) prove the attribution wrong and the
defect real:

- `autoEquip` NEVER runs on the scholar: every call site in `src/js`
  passes a villager person record (`villagerGearUp`, `villagerGearDay`,
  craft/ammo duties, armor gift/seed). Villager worn items live IN `items`,
  so `autoEquip`'s inventory-only rebuild cannot drop them. The equipment
  namespace is single (`Scattering.equipment === S.equipment`), so the
  probe's wrap was complete — zero scholar autoEquip calls across both
  witness replays.
- BOTH replay destructions trace to ONE call: `contestChoose`
  (`src/js/contests.js:4394`, `d.grantWeapon` branch ~4440–4460), the arena
  "choose your weapon" grant. It pushes the granted weapon into
  `scholar.inventory` AND seats it directly in `scholar.equipped[wslot]`,
  overwriting the slot WITHOUT returning the displaced piece to the pack
  (the `#806` honest-accounting return that `Game.equip` performs is
  missing here).
  - s107756 d44: `[contestChoose d44] idx=0 before={ranged: searcaster,
    invSear: 0} after={ranged: hunting_spear, invSpear: 1}` — gun gone.
  - s107751 d151: `[contestChoose d151] idx=0 before={ranged: searcaster,
    invSear: 0} after={ranged: hunting_spear, invSpear: 1}` — gun gone
    (after a double succession had seated ruth_goldstein's own gun
    worn-only that same day).
- The worn-only state itself is the scholar's NORMAL convention
  (`Game.equip`: "remove from inventory (it's worn, not carried)");
  `mantleBecome` seating the successor's worn gun worn-only is consistent
  with it. The defect is purely the re-seat site that overwrites without
  returning. `playerDeath`'s death pack DOES include the outgoing
  scholar's worn-only gear (s107751 d151 corpse held gen_ccrpfc9's gun),
  so succession itself is safe.
- Other scholar-equipped writers audited: `equip()` (returns displaced,
  #806 — safe), `unequip()` (returns to pack — safe), `tbLockpickSteal` /
  `tbLockpickReturn` (steal/return pair — safe), `equipAccessory` /
  `migrateKeepsakes` (free slots only — safe), `mantleBecome` (wholesale
  replace, covered by the death pack — safe). `grantWeapon` is the only
  overwriting writer without a return.

## 1. The fix (smallest correct)

In `contestChoose`'s `d.grantWeapon` branch (`src/js/contests.js`), before
overwriting `s2.equipped[wslot]`, return the displaced entry to
`s2.inventory` — the same `#806` shape `Game.equip` uses (itemId, name,
units, kcalEach 0, kg 0.5, bonded + alienLoot flags carried). No other
behavior changes: the granted weapon is still pushed to inventory and
seated, narration unchanged, no new narration (matches #806's silent
return for the same chosen-action swap).

Deliberately NOT changed (recorded, not chased):
- `mantleBecome`'s worn-only seating: it matches the scholar's worn∉pack
  convention; carrying the gun into the pack as well would duplicate it
  the next time `equip()` returns a displaced piece, and would double
  count multi-unit worn stacks (worn-stack #2698).
- `autoEquip` hardening: no caller can produce a worn-only scholar item,
  and no villager path does either; hardening an unreached path is not
  the smallest fix.
- The granted weapon's pre-existing double-presence (in inventory AND
  equipped after a grant): out of scope; a follow-up may seat grants via
  `equip()` instead.

## 2. Primary metric

**Worn-gun destructions on the replay band = 0**, counted as the
guntransfer analyzer's `destroyed` custody exits (loser alive, no living
gainer, no corpse gun) across the band, PLUS village gun totals conserved
(`unexplainedExits = 0`).

- **GO:** `destroyedExits = 0` AND `unexplainedExits = 0` on the fixed leg,
  with the control leg reproducing the known 2 (`s107756 d44`,
  `s107751 d151`).
- **NO-GO:** any `destroyed` exit on the fixed leg, or any unexplained
  exit, or the control leg failing to reproduce the known 2 (instrument
  invalid — the fix would be unproven, not passed).

## 3. Guardrails (report deltas control → fixed; regression is NO-GO unless adjudicated)

- holder-days (guntransfer census definition) must not fall.
- searcaster volleys (shots > 0) must not fall.
- deaths (all causes, band total) within ±10% of control.
- median survival (game-days) within ±10% of control.
- No new instrument errors; anchors + policySha match within each leg.

## 4. Legs (frozen)

- **Control:** current master (this worktree HEAD, unfixed code),
  guntransfer driver verbatim (`scripts/guntransfer-driver-b.js`,
  RUN=worngun-reseat-control-b, OUTDIR=perseed-worngun-reseat-control-b),
  seeds 107750–107757 + witness 107741, 150d, competent verbatim,
  substrate `VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1 FIGHTALLY2=1
  SENSEEXPED=1 BOWOPEN=1 SPEARGATE=1 GUNRATE=1 CELLGATE=1 KILLBUNDLE=1
  STAGE_SEAR=1 REARM_CELLS=1`, LEND unset, PRESENCE unset.
- **Fixed:** same driver, same seeds, same substrate, after the fix
  (RUN=worngun-reseat-b, OUTDIR=perseed-worngun-reseat-b).
- **Analyzer:** `scripts/analyze-guntransfer-b.js` (destroyed-exit
  classification) + `scripts/analyze-gunholder-census-b.js`
  (holder-days/volleys reproduction) on both corpora.
- **Balanced panel:** `scripts/balance-panel.js` (§15) control vs fixed
  compare `.md` attached to the evidence file.

## 5. Proof test (must FAIL on old code, PASS on new)

`scripts/test-worngun-reseat-b.js` — harness-loaded game, staged
worn-only searcaster on the scholar + a `grantWeapon` contest choice:
- T1: worn-only gun + `grantWeapon: hunting_spear` (ranged) → gun in the
  pack (count 1), spear equipped. FAILS on old code (pack count 0).
- T2: worn-only gun + `grantWeapon: stone_knife` (melee) → gun stays
  worn in ranged, knife in melee (no over-broad return).
- T3: gun carried in the pack (not worn) + `grantWeapon: hunting_spear`
  → pack still holds the gun (no loss, no duplication).
- T4: worn gun with bonded flag → returned entry keeps the flag
  (conservation of flags, #806 shape).

## 6. Reachability / sense-test

- Reachability: the fix touches only the contest grant path; wave /
  standing / table numbers are reported per seed (scale-wall table) but
  no reachability change is claimed.
- Sense-test: read the contest-choice transcript lines around both
  witness re-seats (what the player was told when the spear was taken);
  judge whether the swap reads honestly, in plain words.

## 7. Metric review (filled at evidence time; the metric binds — a miss is NO-GO, never re-scored)

- (to be filled in evidence/2026-11-24/sim-worngun-reseat-b.md)

## Amendment log

- None.
