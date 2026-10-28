# FIELD-WOUND CARRYOVER — pre-registration (tackle-wound2)

Workstream: field-wound carryover, tackle-all program (Steve ordered "Tackle all", 2026-10-27).
Branch: `tackle-wound2` (fresh; the old `tackle-wound` worktree was NOT reused).
Base: worktree created at `e5bab2883`, an ancestor of master at registration time;
zero `src/js` drift between base and master (only w4channel evidence/scripts landed
since), so no rebase was needed before starting.

## The call (plain words — read this first)

**Field wounds carry into turn-based fights, because villagers follow the same
rules as the player.** A villager who gets hurt out in the field does not walk
into their next turn-based fight at full health. They start that fight exactly
as hurt as they were when it started — the same way the player's own wounds
carry into a fight, because the player's fighter starts at their real health.

**This is a Muse call under Steve's standing intent, NOT a Steve ruling.**
Standing intent it rests on: "tackle all", "figure it out yourself", and
"villagers are not special, same rules as the player". **Steve can overrule
this call.** If he does, the change reverts to the old behaviour (field-fight
allies at a fixed 70-health body, ally wounds dropped) and this file records
the overrule.

## What the audit found (before any change)

Read first: `docs/CANON.md`, `src/js/fieldFights.js`, `src/js/game.js`
(`tbHumanFighter`, `tbSyncHumanHealth`, `startCombat`, `hurtVillager`,
`sealDamageResult`), `src/js/equipment.js` (seal contract).

- Turn-based entry for villagers is ALREADY wired: `tbHumanFighter` starts a
  villager fighter at their real `village.health`, and `tbEnd` writes the
  fight's ending health back. So the turn-based side needs a proof lock, not
  a code change.
- The break is on the field side, and it is the ALLY, not the lead fighter:
  - A field fight's lead villager already has their wounds applied by every
    main-path caller (patrol, wild encounter, expedition, sortie, contest)
    through `hurtVillager` with the fight's sealed record.
  - But the ally who answers a shout (or is already at the door) fights at a
    FIXED 70-health body no matter what their real health is, and the damage
    they take is never written back — except a flat 30 when they go down.
    A surviving ally who took 40 damage walks away unwounded, and walks into
    their next turn-based fight at full health. That is the carryover gap.
- The fix (planned, not yet built at pre-registration time):
  1. A field-fight ally enters at their REAL health (a Haven villager's
     `village.health`, default 100 when no entry exists — the same default
     the rest of the game uses). Foreign allies (aid parties from other
     villages) keep the old 70 body: their health lives in another village,
     out of this workstream's scope.
  2. At the end of the fight, a surviving Haven ally's wounds are settled
     through the same once-only sealed-record pipeline the lead uses
     (`hurtVillager` + sealed record), so the damage lands exactly once and
     can never double-apply if a caller also settles it later.
  3. The record gains `allyTaken` / `allyHpLeft` / `allyEntryHp` so the
     carryover is observable, not just asserted.
- Deliberately NOT in this change:
  - No gating change of any kind (Steve's 2026-10-27 16:53 gating freeze):
    no deedGateReady, scale, stage, readiness-bar, or table-price touches.
  - No turn-based entry change (already wired; proof-locked only).
  - No change to the downed-ally flat 30 (a downed ally's death accounting
    stays exactly as it is).
  - No change to foreign allies, and no change to the two rare field-fight
    call sites that drop even the LEAD's wounds (alien-villager fights in
    `alienPlayers.js`, psycho attacks in `corruption.js`). Those two paths
    also have their own broken outcome/death handling, so fixing them
    properly needs its own proof — they are recorded here as KNOWN GAPS,
    not claimed fixed. (Nomad-drive kin fights also drop the record; same
    treatment.)

## Pre-registered bars (BINDING — docs/MEASUREMENT.md §14)

Measured by `scripts/test-wound-carryover-20261027.js`, one seed per process,
same seeds and same band before and after the change. A miss is NO-GO, never
re-scored mid-run. Metric doubts go under "metric review" below and apply to
the NEXT run only.

Band: wave-1 bulldozer, player at full health, one Haven ally. Field fights use
an ally already at the door (`allyFromStart`). Turn-based fights use
`startCombat` with the ally positioned beside the player, played out by a
simple strike/move/end bot (villager AI acts on its own turns, as in
`scripts/simulate-combat.js`).

- **B1 — ally carryover (the fix):** of surviving Haven allies who took damage
  in a field fight, 100% end with `village.health` reduced by exactly the
  damage they took (healthBefore − parsed ally damage = healthAfter).
  Before-fix expectation: 0% (the bug). GO requires 100% after the change.
- **B2 — turn-based entry (proof lock):** 100% of turn-based joins for a
  villager at health H start that fight's fighter at exactly H, for
  H in {30, 45, 60, 80}.
- **B3 — lead regression (already wired):** 100% of surviving lead villagers
  with damage taken end with `village.health` equal to the fight record's
  `vHpLeft` after the standard caller settlement (the patrol pattern).
- **B4 — winnability (relative bound):** turn-based party win rate
  (player + one ally at 50 health vs bulldozer) after the change is no more
  than 10 percentage points below the same-seed before-change rate.
  This is the "does not make fights unwinnable by itself" bound. The absolute
  baseline rate is reported alongside; if the baseline itself is low, the
  relative bound still governs — it is not re-scored against a friendlier
  absolute floor.
- **B4b — chain winnability (added 2026-10-27 before the after-run, bars
  unchanged, nothing dropped):** the fresh-50 band in B4 cannot move under
  this change, because turn-based entry was already wired — it is a control,
  not the channel. The channel the change actually moves is the CHAIN: a
  field fight wounds the ally, and the NEXT turn-based fight starts them
  wounded (before the fix they entered that fight at full health, because
  the wound never landed). So B4b measures turn-based win rate on chains
  (field fight, then a turn-based fight with the same ally at whatever
  health the field fight left them), and requires after-change chain win
  rate no more than 10 points below the same-seed before-change chain rate.
  The amendment is recorded here before the after-run and before any
  verdict, with B4 kept as a control — no bar is dropped or re-scored.
- **B5 — ally-survival guardrail:** field-fight ally death rate after the
  change is no more than 10 percentage points above the same-seed
  before-change rate. Per §14, a GO met with a guardrail breached is NO-GO.
- **B6 — sense (qualitative):** sample field-fight logs read as a wounded
  fighter: ally hit lines show falling health, and the turn-based fighter
  state shows the wounded entry health. Recorded as quoted log lines, not
  just flags.

## Method

1. Baseline run (before any `src/js` edit): proof script on seeds 101–108,
   30 field fights + 4 entry checks + 12 turn-based fights + 40 chain
   attempts per seed (chain attempts raised from 12 after the first baseline
   showed only 19 played chains — bulldozer charge windup makes ally hits
   sparse in short fights, so more attempts are needed for a meaningful
   chain sample; the bar itself is unchanged).
2. Implement the fix, re-run the identical script on the identical seeds.
3. Judge against B1–B6 exactly as written above. `node scripts/check.js --quick`
   after the change; green-list breaks are reported, not waived.

## Metric review

None yet — bars written before any measurement. (Filled in after the runs.)
