# Pre-registration — sim-fleerepair-a (Loop A run fleshout-20261104T0115Z, axis scale-onramp)

Committed BEFORE any judged sweep. Judge strictly against this file; a miss
is NO-GO, never re-scored against a friendlier metric mid-run. Metric doubts
go under "metric review" in the evidence file, for the NEXT run.

## Canon (read first)

- docs/CANON.md: grep for flee/barrier returns NOTHING — no canon doc covers
  TB flee. Verified 2026-11-04. What covers it instead: in-code law in
  src/js/game.js (tbBarrierExit: "only a deliberate exit attempt" exits;
  sealed fights hold; chasers pursue across the barrier) and src/js/app.js
  (flee-by-barrier note, Steve 2026-10-11), plus Steve's 2026-11-02 ruling
  that monsters do NOT flee while players CAN. This arm is PLAYER flee only:
  no monster-flee change, no gate/price/deed change, no default flip (below).

## Code read (the flee path, exact)

Policy scripts/policies/competent.js, fight(), closure `flee()`:

- Directional branch (gate COMPETENT_DIRECTIONAL_FLEE=1, default OFF):
  chooseFleeDir() picks the havenward exit; on the chosen edge it calls
  Game.tbBarrierExit(dir) and ends the turn; off the edge it steps one tile
  toward it (tbPlayerMove) and ends the turn. It does NOT check the
  stuck-flee state and does NOT mark a consumed (non-exiting) push
  unfleeable — those live only in the legacy branch.
- Legacy branch (default, all gates off): a barrier push happens ONLY if
  dpsRaceOn() (COMPETENT_DPS_RACE=1, killed at pilot long ago — NOT enabled
  here). Otherwise it walks to the nearest x-edge (tx = 0 or 8, same y) via
  tbPlayerMove, then ends the turn. That is the tbfinish loop: self-move on
  the edge, "No path there" on terrain-blocked edge tiles, "Too far" on
  over-budget walks, repeated until death. 0 tbBarrierExit calls band-wide.
- Stuck-flee resolution (gate COMPETENT_EXIT_VERIFIED_FLEE=1, default OFF):
  legacy branch only — 3 consecutive zero-progress flee turns mark the fight
  unfleeable and the NEXT flee() call returns false BEFORE endTurn, so
  fight() falls through to tricks/strikes. With directional on, this never
  fires (directional branch bypasses it entirely).
- Engine src/js/game.js tbBarrierExit(dx,dy): requires standing on the
  pushed edge; sealed fights / world edge / blocked far side CONSUME the
  push (return true, no exit); chasers pursue across; non-chasers give up.

## Fork-rule ruling (NOT a DIAG outcome)

The brief's fork rule fires only if the ONLY route to a barrier push is
flipping a default gate value in code. That is not the case here:

- The barrier push already exists behind an explicit opt-in gate
  (COMPETENT_DIRECTIONAL_FLEE=1). A variant policy that opts into an
  existing gate for measurement is the standing multi-arm mechanism
  (policy-side arms are always safe; cf. scripts/policies/fleepolicy-a.js,
  which likewise changes no default). Defaults in competent.js are
  UNTOUCHED by this arm.
- The genuinely new behavior (directional walk-failure fallthrough +
  directional stuck resolution) is added behind a NEW gate,
  COMPETENT_FLEE_REPAIR=1, default OFF, in policy code only. Gate-off
  behavior is byte-identical by construction and pinned by the proof test.
- No src/js change. No gate/price/deed default change. If this arm GOes,
  making any of it default play is a coordinator/Steve landing call, never
  made here.

## The arm (policy-side only)

Variant policy scripts/policies/competent-fleerepair-a.js: sets
COMPETENT_DIRECTIONAL_FLEE=1, COMPETENT_EXIT_VERIFIED_FLEE=1, and
COMPETENT_FLEE_REPAIR=1, then re-exports competent unchanged otherwise.

competent.js change, gated by COMPETENT_FLEE_REPAIR=1, directional branch
only (legacy branch untouched):

1. BARRIER PUSH ACTUALLY HAPPENS: via the directional branch (already
   implemented; the variant opts in). On-edge push that is consumed
   WITHOUT exiting (map unchanged, fight not over) now marks the fight
   unfleeable (ctx._fleeBlockedFor = f.id), exactly as the legacy
   exit-verified branch does; the next flee() call returns false before
   endTurn and falls through to combat.
2. WALK-FAILURE FALLTHROUGH: if the directional step changes the
   fighter's grid position NOT AT ALL (blocked/occupied/refused step) and
   a monster is in weapon range, flee() returns false WITHOUT ending the
   turn — fight() falls through to ability/trick/strike logic and strikes.
   If no monster is in range, the turn ends as before (a strike is
   impossible) but the turn counts toward stuck tracking.
3. STUCK-FLEE RESOLUTION (directional): consecutive zero-progress flee
   turns (step failed, or push consumed without exit — the latter marks
   unfleeable immediately per (1)) are counted per fight; at 3, the fight
   is marked unfleeable and subsequent flee() calls return false before
   endTurn, so the fighter fights it out. A progress turn resets the
   counter. This mirrors the legacy resolution's threshold (3), extended
   to the branch that actually runs.
4. NOT in this arm: DPS_RACE (killed lever, stays off), more-swings
   (move+strike), the eulogy clock, trick availability (next arm),
   the Rage gate (arm after that), gear, gates/prices/deeds, monster flee.

## Pre-registered metrics

- PRIMARY: escapes per TB exposure, and escapes per flee-triggered fight
  (a fight with >= 1 flee-attempt turn under the tbfinish classes).
  Escape = exposure end result 'fled' (tbEnd 'fled'; chase continuations
  that later end fled still count as the exposure's escape).
- SECONDARIES: strikes per fight (all TB exposures; and lost fights only),
  median strikes in lost fights, median damage fraction dealt (ledger
  dealt / summed maxHp, tbfinish definition), barrier pushes per
  flee-triggered fight, zero-tile-move turns per fight, flee-attempt turns
  per flee-triggered fight.
- COST BAR (the scalemetric deciding bar, both halves must pass):
  (a) starvation deaths in the armed leg <= control total + 2, on totals
  AND on arm-only deaths (deaths attributable to this arm's fights are
  counted by the same death-cause accounting as the baseline leg);
  (b) median survival (days) in the armed leg >= 0.8 x control median.
  Death-cause shares and median survival are reported for both legs
  regardless of the bar.
- WALL NUMBERS (both legs): wins, national reached, table reached,
  wave-4 faced (TB + field), wave-4 kills, wave-5 faced, median survival.
  These are reported, not judged — the pilot is too small to move them.

## Design (seeds, policy, horizon, calibration)

- Seeds 99101–99108 (the 1819/w4convert/tbleth/tbfinish band).
- Policy: baseline = scripts/policies/competent.js VERBATIM (all gates at
  default); armed = scripts/policies/competent-fleerepair-a.js (the three
  env gates above, nothing else). Default env otherwise.
- Horizon 140 days, death-aware (dead villages stop simulating, +10d tail
  max, per the harness).
- Instrument: scripts/fleerepair-instrument-20261104.js (copy of the
  tbfinish instrument + the round-1 pending buffer, below) and
  scripts/fleerepair-driver-20261104.js (policy selectable via POLICY
  env, output to evidence/2026-11-04/perseed-fleerepair-a/, refuses to
  overwrite). Analyzer: scripts/fleerepair-analyze-20261104.js (tbfinish
  analyzer verbatim; turn classes unchanged).
- ROUND-1 CAPTURE (tbfinish's pending-buffer spec, implemented here):
  during startCombat, player actions are recorded into a pending record
  (actions + pre/post snapshots + fight round at first action) and, when
  the W4 exposure is created after the call returns, attached as its
  first turn (turnSeq 0, round 1, closeReason 'round1-pending'). Player-
  phase tbDamage hits during the opening pass get turnSeq 0; NPC-phase
  hits are appended to the ledger with turnSeq null (they reconcile the
  ledger but are NOT attributed to the player turn). Residual gap,
  disclosed: round-1 NPC turns are still not bracketed as npcTurns
  (their hits are in the ledger; npcHist undercounts round-1 monster
  turns by construction). A zero-turn scripted rout (tbfinish's 99102
  suburb orphan) is PRE-REGISTERED as a non-exposure class: an orphan
  tbEnd with no exposure and no turns is reported separately, not scored
  as a missed fight, and does not fail the calibration gate.
- BALANCED PANEL (§15): the before/after comparison runs through
  scripts/balance-panel.js if it accepts a two-corpus (baseline vs armed
  per-seed JSON) comparison; otherwise the comparison is the
  pre-registered per-seed table + analyzer aggregates, with the reason
  stated (never a fabricated compare).
- PILOT GATE: 8 seeds before ANY confirm spend. Confirm on 12–16 seeds
  ONLY if the pilot passes GO.

## Calibration gate (run FIRST, as the baseline leg)

Base is master tip dbfeb63eb, the 2315Z coordinator commit. The gate is:
baseline leg reproduces the tbfinish judged leg on this anchor —
51 TB exposures, 2 TB kills, per-seed days/ends matching the tbfinish
table (99101:134 lost, 99102:115 lost, 99103:75 lost, 99104:66 lost,
99105:140 SURVIVED, 99106:78 lost, 99107:38 lost, 99108:42 lost),
spawnsW4/TB-calls/fieldW4 per seed as in tbfinish, 0 instrument errors.
Turn totals DIFFER by construction: tbfinish censused 284 rounds-2+
turns; this instrument adds exactly one round-1 turn per exposure
(expected total 284 + 51 = 335, one pending turn on every exposure).
If exposures/kills/days diverge, the gate FAILS: re-baseline (the judged
baseline becomes whatever the baseline leg measures, stated in the
evidence) and do NOT cite tbfinish numbers as the baseline.

## GO threshold (pilot, judge strictly)

GO iff ALL THREE hold on the 8-seed pilot:

1. escapes >= 2 (across all TB exposures in the armed leg), AND
2. median strikes/fight (armed) >= median strikes/fight (baseline), AND
3. cost bar clean (both halves above).

A miss on ANY leg is NO-GO: kill cleanly — revert the competent.js
change, delete the variant policy file, keep instruments + evidence +
proof (if the proof tests deleted code, archive it as tbpolicy-a did and
say so — no dangling test left in the suite). If GO, confirm on 12–16
seeds before any landing claim; landing itself is the coordinator's
--ff-only merge, pending ship.

## Sense-test (pre-registered)

Read transcripts of flee fights before and after. Judge meaning: does a
repaired flee read as a person escaping, a person giving up and fighting,
or a robot? Flag anything robotic, static, or repeated. A repaired flee
that reads as a silent no-op loop is a sense NO-GO even if the numbers
pass, and will be reported as such.
