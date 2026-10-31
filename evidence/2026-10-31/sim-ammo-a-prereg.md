# sim-ammo-a — PRE-REGISTRATION (written BEFORE any judged sims)

Run: Loop A, fleshout-20261031T0016Z, axis scale-onramp, arm sim-ammo-a.
Worktree branch: sim-ammo-a. Base anchor: f52f08600550 (worktree HEAD at
prereg time; the sweep records its own anchorCommit per seed).
Substrate (shared with sim-w4field-a / sim-killconv-a / sim-w4party-a):
seeds 85101-85116, policy stack
withFullseatDiag(withSeatDrive(withWinDefer(TF leadfeast))),
FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1
FULLSEAT=1, 200d death-aware cap (runDays death-aware stop; dead
villages stop simulating, +10d tail max per the loop's horizon rule).
Instrument: scripts/ammo-diag-20261031.js (AMMODIAG=1, read-only:
wraps Game.fieldFight + Game.villagerPocketAmmo, draws NO RNG, writes
NO game state, returns original records untouched).
Sweep: scripts/ammo-sweep-20261031.js. Analyzer:
scripts/ammo-analyze-20261031.js. Proof: scripts/test-ammo-20261031.js.

## What prior work already settled (reconciliation, not re-proof)

- sim-volley-a (2026-10-26): volley engine intact; 0/1179 fighters
  carried any ammo at fight time; gate split G2-no-ranged 518,
  G6-bow-no-ammo 389, G5-spear-as-ranged 226, G7-fires 0.
- sim-ammostorage-a (2026-10-26): no code path moved ammo from any
  reservoir into a pack; arrows down to one stashed unit on 2/8
  seeds, stones piled communally (median 189) but never pocketed,
  bolts never made.
- sim-arroworigin-a (2026-10-27): the village's single arrow(s) came
  from starting stash (founder / joiner-population keep-5), never
  from a craft, loot, or trade in that band.
- sim-ammo-gap (2026-10-27, Triage A4): built + unit-proved
  villagerPocketAmmo (departure-only: own stash, then communal pile
  for stones, then one arrow/bolt craft attempt per departure) and
  showed 4 volley fires / 8 shots on a 40-day panel. That code IS in
  this base (commit 2ec0c0d5a is an ancestor of HEAD).
- sim-w4field-a (2026-10-30): ON A BASE THAT ALREADY CONTAINED the
  gap-ammo pocketing code, 14 ranged wave-4 field fights still
  fired 0 volley shots, ammo on hand 0 in every case. So pocketing
  exists but does not reach wave-4 field fighters. WHY is still open
  — that is this arm's Stage 1 question. Nothing here re-proves the
  volley engine, the storage census, or the arrow origin.

## STAGE 1 (DIAG, zero game change) — the question

On the w4field shared band, instrument volley-time ammo state for
every wave-4 field fight: weapon carried, ammo item on the
villager's OWN items (by type + units), ammo in the fighter's own
stash, raw communal-pile materials, arrows/bolts crafted this run
(state.village.ammoCraft[vid]), pocket-call history for that vid
(wrapped villagerPocketAmmo results), departure state at fight time
(on expedition? away? outdoor-crew member?), and the fieldFight
caller (stack-derived: expeditionMonster / resolveWildMonsterEncounter
/ resolvePatrol / aidFight / contest / other).

Classification (one verdict, per ranged wave-4 fight, then banded):
- (a) NEVER CRAFTED/POCKETED: no pocket call for this vid before the
  fight, or every pocket call returned pocketed 0 + craftedOk false.
- (b) CRAFTED/STORED, NOT CARRIED: pocket calls succeeded or own
  stash holds the needed ammo at fight time, but carried = 0.
- (c) CARRIED BUT SPENT BEFORE THE FIGHT: pocket calls succeeded
  and carried > 0 at some earlier observed point, but carried = 0
  at fight time (prior volley spend, prior fight spend, or loss).
- (d) SOMETHING ELSE: carried > 0 at fight time but volley still 0
  (weapon/ammo mismatch, spear-as-ranged, engine path), or the
  caller/departure pattern explains it (e.g. fights that never pass
  a departure gate). The (d) write-up must name the mechanism.

STAGE 1 DIAG-GO iff: >= 95% of wave-4 field fights carry a complete
ammo census (carried + own-stash + pile + craft counters + pocket
history + departure state + caller), AND the band verdict names
(a)/(b)/(c)/(d) with a per-weapon-type split, AND the re-baseline
reproduces the w4field shape (ranged wave-4 volleys at/near 0 shots)
or explains any change. Pilot: 8 seeds (85101-85108). Confirm to 16
only if the pilot leaves the verdict ambiguous (e.g. two classes
within one fight of each other).

## STAGE 2 (lever) — chosen from the Stage 1 verdict

The lever tests the pocketing variant the diagnosis points at:
villagers carrying a ranged weapon also carry its ammo into the
field. Policy-side preferred (policies are always safe to vary); a
game-code change only if policy cannot express it, and then only in
non-overlapping files, with the reason stated in the evidence file.
The gating freeze (Steve 2026-10-27/28) stands: NO scale-gate
numbers, deed bars, or wave-unlock thresholds are touched.
Candidate variants (Stage 1 picks one; others are NOT run):
- V-wild: pocket at the honest leaving-home hook for the caller
  class Stage 1 finds dry (only if such a hook exists that is NOT
  mid-fight — pocketing inside resolveWildMonsterEncounter or
  inside fieldFight is FORBIDDEN: it would teleport ammo to a
  fighter already facing the beast).
- V-repocket: re-pocket per expedition leg / per departure so a
  second meeting is not fought dry (only if Stage 1 says (c)).
- V-stash: pocket from the fighter's own stash at gear-up (only if
  Stage 1 says (b) with own-stash ammo present).

STAGE 2 PILOT GATE: 8 seeds before/after (Stage 1 baseline corpus
vs lever corpus, identical seeds + policy stack) before ANY confirm
spend. Kill the lever fast at pilot if volley damage does not move
— do not run 12-16 seeds on an invisible effect.

STAGE 2 GO (binding, judged exactly as written):
- PRIMARY: volley shots > 0 on >= 50% of ranged wave-4 field fights
  in the lever corpus, AND median volley damage per fought wave-4
  fight meaningfully above 0 (strictly > 0; the baseline median is 0).
- COST BAR (binding, from sim-scalemetric): starvation deaths <=
  control + 2 on totals AND on arm-only deaths, AND median survival
  >= 0.8x control median survival.
- A kill is NOT required for GO, but field kills (vKill + mFlee
  drive-offs) are reported either way — that is the number the wall
  cares about. A GO lever lands as its own commit with its own proof
  test; a killed lever leaves no trace (policy files deleted,
  game-code reverted before commit).
- If Stage 1 returns (d) with no honest lever (e.g. the dry fights
  are a class no departure hook can reach without mid-fight
  teleport), Stage 2 is NOT run and the verdict is DIAG-GO with the
  (d) mechanism documented as the blank — that is a completed
  diagnosis, not a failed lever.

## Panel (§15)

Before/after comparison for Stage 2 runs through scripts/balance-panel.js
where the driver can express the arm; the compare .md is attached to
the evidence file. If the panel driver cannot express a game-code
lever arm (it is a policy/scorecard driver), the identical-seed sweep
comparison + cost bar above is the judge, and the evidence file says
so explicitly instead of fabricating a panel. Stage 1 is a
single-base measurement: no panel exists, none fabricated (same
rationale as sim-w4field-a / sim-killconv-a).

## Sense-testing

Read full records for at least one volley fight per outcome class
present (volley fires / volley dry / volley kill or drive-off if
any). Judge meaning and coherence, not just counts.

## Metric review (for the NEXT run, never a re-score of this one)

Doubts about the metrics above go here in the evidence file after
the run; they do not change this run's verdict.
