# Gear-bar autopsy — prereg (Loop A, run fleshout-20261103T1819Z, arm sim-gearbar-a)

Committed BEFORE any judged sim. Anchor: current branch HEAD at prereg
commit (sibling winnability arms arm-1 ally-join + arm-2 field-dmg are
already on this branch; they are part of the baseline, NOT this arm's
change — this arm touches neither the wild-router ally-join code nor
field-fight damage/staying code). This arm carries the never-started
1415Z gearbar arm and vetbar-a next blank 2.

## Grounding (read in code, not assumed)

- `evidence/2026-11-03/sim-vetbar-a.md` (seeds 99101–99108, competent,
  140d): veterans bar counted correctly (CLEAN KILL, no counting bug)
  and readiness-5 is ALSO short on armor and weapons. Readiness-5
  release is the wall; this arm autopsies the gear half.
- Gate code: `src/js/standing.js` `waveCombatReadiness(w)` + `readyDemand`:
  wave 5 demands armored 4 / armorP 15 / armed 6 / tricks 3 / veterans 2
  (wave 4: 3 / 10 / 5 / 3 / 1). Demands are NOT changed by this arm.
- Gate semantics, verified in code:
  - ARMORED: living roster members whose WORN armor P >= demand.
    Non-scholar: `S.equipment.armorOf(vp, itemDefs)` — counts EQUIPPED
    slots only (pieces + coordination, or full-set torso); pack items
    do NOT count. Scholar: `Game.armorBonus()` (equipped + flat mods).
    The gate counts EVERY living roster member, not a fighter subset —
    there is no fighter/non-fighter distinction in the gate, so no
    "not a fighter" class is used; stay-home roster members count
    exactly like departing ones.
  - ARMED: living roster members with a weapon TO HAND — equipped
    melee/ranged (`meleeWeaponOf`/`rangedWeaponOf`), OR a weapon item
    carried in their pack (`carriesWeapon`: any pack entry whose def
    has `.weapon`). Scholar: `equippedWeapon()` (not unarmed) OR a
    weapon in scholar inventory. Pack ownership therefore COUNTS for
    weapons but NOT for armor — the owns-vs-wears split is asymmetric
    by design, and the instrument reports it as such.
- Wear/equip mechanism, verified in code (the only area this arm may fix):
  - `src/js/equipment.js` `autoEquip(v, itemDefs)`: equips best gear
    from the villager's OWN pack items; any armor piece with
    protection > 0 scores > 0 in its slot, so pack armor SHOULD end up
    worn after an autoEquip run (set-vs-pieces choice still yields
    worn armor). A fighter with armor in pack but none worn therefore
    means autoEquip has not run since acquisition, or a defect.
  - `src/js/villager-build.js` `villagerGearDay()`: daily, home
    villagers only, scholar SKIPPED: (1) autoEquip + own-stash fetch
    of any weapon/armor beating the worn slot value; (2) spares
    (carried-but-unworn weapons/armor) redistributed to whoever gains
    most (worn gear never taken); (3) communal armory weapons, then
    (3b) communal deposited armor, biggest gains first, one per
    villager per day, replaced piece returned to the pile.
    Deposit-is-consent throughout; no automatic redistribution of
    personal gear.
  - `src/js/game.js` `villagerGearUp(vid, acquire)`: departure-time
    re-equip; with acquire, fetches best own-stash armor, then own
    stash weapon, then communal deposited weapon, then whittles a
    sharpened stick (weapon, bonus 5) if village wood > 3.
  - Armor recipes: bark_armor P10 (torso; recipe L1 via the old-cuirass
    dawn beat), hide_armor P20 (torso; recipe L1 via handling a hide).
    Bark alone (10) is BELOW the wave-5 demand (15); a fighter needs
    hide, or bark + other pieces (+2 coordination per extra piece).
    Communal armor pile: `stashState().armor` (deposited only).
- Canon: `docs/CANON.md` + `docs/MONSTER-WAVES.md` readiness section
  (armored = armor WORN at P >= demand; armed = weapon TO HAND).
  No canon doc covers the wear/equip mechanism in detail; the code
  facts above are the ground truth for this arm, not invented canon.

## Phase 1 — diagnostic pilot (this prereg judges Phase 1 completeness, not a fix)

- Policy: `scripts/policies/competent.js` `{competent}` VERBATIM,
  default env.
- Seeds: 99101–99108 — the SAME band as the vetbar pilot, so gear
  numbers pair seed-for-seed with its veteran numbers.
- Horizon: 140 days, death-aware (dead villages stop simulating;
  never a fixed 200d). Why 140: the vetbar pilot on these seeds had
  median survival 111d with 7/8 dead before the cap — the same window
  covers the readiness-5 story with headroom.
- Instrument (scripts only, ZERO src/js in Phase 1): daily snapshots
  of `waveCombatReadiness(5)` (armored, armed, tricks, veterans,
  demand, short) PLUS a per-fighter recount for every living roster
  member: worn armor P (gate reader + manual equipped-slot sum side
  by side), pack armor items + their P, stash armor items + P,
  equipped weapon ids, pack weapon ids, stash weapon ids, scholar
  flag, plus village context (communal stash weapons/armor counts,
  village wood, scholar codex bark/hide recipe levels, total armor
  and weapon items village-wide: worn / pack / stash / communal).
  Every bar value must reconcile to the per-fighter recount (see
  below). Sense sample: capped say-lines matching
  armor/weapon/ready/standing per seed, judged for meaning, not counts.
- Primary metrics (Phase 1, descriptive): per seed, end + transient-max
  armored / armed vs demands (4 / 6), per-fighter ap distribution,
  max ap, owns-vs-wears split (armor items worn vs pack vs stash vs
  communal; weapons equipped vs carried vs stash vs communal).
- Phase 1 succeeds iff: 0 instrument errors, gate armored == recount
  armored AND gate armed == recount armed on EVERY daily snapshot,
  no worn-gear-missed flag (gate ap < manual equipped-slot sum for
  any fighter, scholar flat mods accounted for), and EVERY end
  shortfall fighter classifies into exactly one reason class below.
- Reason classes — armor shortfall (worn P < 15), priority order,
  first match wins (mutually exclusive by construction):
  1. `owns-not-worn` — armor item in own pack while worn P < 15
     (autoEquip should have worn it; persistence across home days
     is the mechanism-bug signal — see Phase 2).
  2. `stashed-not-fetched` — armor in own stash, none in pack,
     worn P < 15 (daily gearDay / departure gearUp should fetch it).
  3. `wears-below-demand` — worn P 1–14, no armor in own pack/stash
     (geared, just not enough: e.g. bark-only 10).
  4. `no-armor-owned-exists-elsewhere` — no armor of their own
     anywhere, but armor exists elsewhere in the village (worn /
     pack / stash / communal of others, or scholar inventory).
  5. `no-armor-not-crafted` — no armor anywhere village-wide, and
     scholar codex knows bark_armor and/or hide_armor at L>=1
     (production failure, not knowledge failure).
  6. `no-armor-recipe-unlearned` — no armor anywhere village-wide,
     scholar codex knows neither bark nor hide at L>=1.
  Classes 5–6 use the scholar codex as the village-knowledge proxy
  and are reported as such; villager-side recipe knowledge is not
  separately instrumented in Phase 1.
- Reason classes — armed shortfall (no weapon equipped AND none in
  pack), priority order, first match wins:
  1. `stashed-not-fetched` — weapon in own stash (gearDay /
     departure fetch should have moved it; whittle fallback also
     applies at departure when wood > 3).
  2. `communal-untaken` — no own weapon anywhere, but a weapon sits
     in the communal stash weapons section (gearDay armory / gearUp
     should have taken it if the fighter was home / departing).
  3. `no-weapon-anywhere` — no weapon in own pack/stash/equipped and
     none communal (village context reported: total weapons
     village-wide, village wood at end — the whittle fallback needs
     wood > 3 at departure).
  Scholar shortfall fighters use the same classes with pack =
  scholar inventory and stash = none (scholar has no personal stash
  in this instrument; scholar is skipped by gearDay, so scholar
  classes are play/policy context, never mechanism-bug evidence).
- No-regression bars (Phase 1, descriptive): deaths/wins per seed,
  end standing, unlocked wave — reported, not judged (no game change).

## Phase 2 — fix + identical-seed rerun (ONLY on a mechanism bug)

- A numbers shortfall (classes wears-below-demand /
  no-armor-owned-exists-elsewhere / no-armor-not-crafted /
  no-armor-recipe-unlearned / no-weapon-anywhere dominating, gate
  counting correctly) is a CLEAN KILL of this arm: no fix is forced,
  the blank is documented precisely (seed-exact), and the run ends.
- Phase 2 triggers ONLY on a MECHANISM bug, defined narrowly:
  (a) gate-vs-recount mismatch on any snapshot (gate miscounts worn
  vs owned), or (b) a non-scholar fighter spends >= 7 consecutive
  HOME days in owns-not-worn / stashed-not-fetched /
  communal-untaken AND a focused repro on their actual state shows
  the mechanism failing (autoEquip / gearDay leaves a positive-gain
  item unmoved), or (c) a worn-gear-missed flag (gate ap below the
  manual equipped-slot sum). A single-day snapshot of unmoved gear
  is NOT a trigger — gearDay is daily and one-per-day, so only
  persistence + repro counts.
- If Phase 2 triggers: fix it small and exact in the wear/equip
  mechanism only, with a proof test, then rerun the IDENTICAL 8 pilot
  seeds with the fix.
- Primary metric (Phase 2): per-seed end armored and armed counts,
  gate values AND recounts (both reported; disagreement is a failure).
- GO threshold (fixed now, judged later): fixed arm beats baseline
  by >= 1 armored fighter and/or >= 1 armed fighter on >= 2/8 pilot
  seeds AND no pilot seed loses an armored or armed fighter vs
  baseline. No-regression bars: no seed's end standing falls vs
  baseline, no new win loss, instrument errors stay 0.
- A miss is NO-GO per MEASUREMENT §14: never re-scored against a
  friendlier metric mid-run; doubts go under "metric review".
- Confirm (12–16 seeds) ONLY on pilot GO.

## Hard limits (binding, honored)

- NO `readyDemand`, t4/t5, or `plentyCap` change; NO win-price or
  deed-gate change; NO wild-router ally-join code; NO field-fight
  damage/staying code; NO national-standing code; NO veteran-counting
  code (settled by vetbar); NO Loop B food-economy code. Fix area is
  the gear bars + wear/equip mechanism ONLY. If a fix needs another
  lane's file, report HELD with the exact shape instead of editing it.
- If the change needs Steve's eyes (feel/combat/UI): include
  [needs-eyes] in the commit message.

## Balanced panel (§15)

- If a fix is judged: run it through `scripts/balance-panel.js` and
  attach the compare .md; the paired identical-seed diff remains the
  GO judge. If no fix triggers: say so explicitly and fabricate no
  comparison (same stance as the vetbar prereg — a custom corpus is
  not a sweep output).

## Metric review (pre-run doubts, for the NEXT run)

- Daily snapshots come from the policy.daily wrapper (same cadence
  as vetbar); a fighter who acquires and loses gear within one day
  could be mis-dated by a day — end CLASS is not affected (it reads
  terminal state), persistence counts are day-granular by design.
- Scholar succession changes the scholar id mid-run; the recount
  follows the live scholar id per snapshot, and the scholar's
  predecessor becomes an ordinary roster member thereafter — both
  are counted under the gate's own rule (current scholar special,
  everyone else via vpOf).
- 140d may truncate late gearing on long-lived seeds; if Phase 1
  shows seeds alive at cap with armor/weapons still accumulating,
  the confirm horizon (if any) should extend — recorded as a doubt,
  not a silent change.
