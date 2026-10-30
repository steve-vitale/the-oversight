# sim-titanexcl-a — PREREGISTRATION (binding, committed BEFORE any new sims)

Run: flesh-out loop, run fleshout-20261030T1924Z, worker sim-titanexcl-a
(Loop A). Axis: scale-onramp (blocking axis, converging, NOT converged).
Backlog #1550 (claimed by this run) + evidence/2026-10-30/sim-muster-a.md.

## Canon read first

docs/CANON.md, then docs/MONSTER-WAVES.md (wave law; the Herald is wave 4)
and docs/CONTESTS.md (contests played, not RNG — the feast draw is a
pending encounter, not a contest roll, but the same played-not-rolled
principle bounds what a "scavenger" draw may deal). NO CANON-registered doc
covers the titan muster mechanism or the castMonster pool in detail — the
mechanism below is read from code (src/js/game.js castMonster,
src/js/titans.js titanDefs/isTitan + monsterWavePool wrapper,
src/data/titans.json, src/js/feastBuff.js drawFeastScavenger) and stated
exactly so it can be checked, and is NOT canon.

## Mechanism, read from code (leads, NOT findings)

- castMonster (src/js/game.js) pools `data.monsters` with
  `(m.wave || 1) <= unlockedWave()` and `waterAffinity !== 'in'`. It does
  NOT exclude titans.
- monsterWavePool (src/js/game.js) is wrapped by src/js/titans.js to filter
  out titan-def keys ("titans never wander. They arrive by omen only"),
  but castMonster does NOT call monsterWavePool — it filters
  `data.monsters` directly. So the titan filter never reaches the cast.
- Titan monster ids in data: titans.json keys finale / nielsen / herald /
  the_network, with `.monster` values finale / nielsen / herald /
  network_heart. monsters.json carries herald at wave 4 and finale +
  nielsen at wave 5, so at unlockedWave >= 4 the cast pool contains the
  Herald, and at wave 5 also the Finale and the Nielsen.
- Feast draws (src/js/feastBuff.js drawFeastScavenger) call castMonster and
  leave the result as a pending encounter. sim-muster-a §"Layer three":
  when the player faces that pending Herald, the titan startCombat wrapper
  (src/js/titans.js) refuses on the muster gate BEFORE core startCombat
  runs, so the pending encounter is never cleared and the same Herald is
  re-faced (3x the same day on seed 75123, day 84).
- GATING FREEZE STANDS. This arm is a pool-exclusion parity fix, NOT a
  gating change: it does NOT touch monsterWavePool, titans.js gate logic,
  or the muster UI verbs (soundTitanCall / titanCommitOwn). The refusal
  survival itself is out of scope; removing titans from the cast removes
  the cast-sourced faces that re-face.

## Arm (one change, game code)

In castMonster only: exclude titan monster ids from the pool — every
titans.json key (minus `_`-prefixed) PLUS every def's `.monster` value
(the_network's monster is network_heart, wave 6, never unlocked, but the
superset is the honest complete titan set and costs nothing). Read from
`this.data.titans` inline so the fix does not depend on titans.js load
order or on Game.isTitan existing. Fallback ('hummice') unchanged; the
pool can never empty on this exclusion (wave-1 non-titans always remain).
No other src/js change. Policy-side recorder only for the sweep
(scripts/policies/titancast-diag.js, TITANCAST=1): wraps castMonster /
drawFeastScavenger, records after, draws no RNG, writes no game state.

## Pre-registered metrics (bind the run, MEASUREMENT.md §14)

A miss is NO-GO, never re-scored against a friendlier metric mid-run.
Metric doubts go under "metric review" in the evidence file.

### Leg F1 — cast distribution (PRIMARY, fixture, discriminating)

Setup: shared sim-harness loadGame, fresh game, `Game.unlockedWave`
stubbed in the TEST ONLY to return 4, then 5 (input control: castMonster
is the function under test, unlockedWave is its input, and on this base
waveLedgerPoints has no live definition so a natural wave-4 state cannot
be built honestly through state alone — the stub is disclosed, not hidden).
2000 castMonster draws per wave, control (pre-fix) vs armed (post-fix),
same seed sequence per leg (fresh loadGame per leg, same seed).

- PILOT GATE: control wave-4 titan count > 0 (the leak demonstrates on
  this base). If control = 0, the lever is KILLED: no leak, revert game
  code, leave no trace.
- GO: armed titan count = 0 at wave 4 AND = 0 at wave 5, with total draws
  = 2000 per wave per leg and non-titan draws > 0 (the pool still casts).

### Leg F2 — feast-draw channel (fixture, the #1550 channel)

Setup: same harness, stubbed wave 4, real drawFeastScavenger, pending
reset between draws (pendingEncounter=false, feastDraw deleted), 500
draws per leg, same seed. GO: armed titan draws = 0. Control must show
>= 1 titan draw, else the channel is unproven on this base and F2 is
reported INSUFFICIENT-DATA (F1 still judges).

### Leg S — sense (transcripts, SENSE-TESTING LAW)

Before fix: capture one full Herald-face chain — feast-draw narration
for a Herald draw, then faceFeastDraw -> startCombat gate-refusal text,
then pending state after the refusal (pendingEncounter still set, same
monsterId). After fix: capture one feast-draw transcript from the armed
fixture (non-titan draw, same narration shape) + the 500-draw zero from
F2. Judge: the before transcript must show the nonsense (a coalition-only
titan narrated as a feast scavenger, refused without clearing); the after
transcript must show no titan face at all. A transcript that is merely
functional without being sensical fails this leg.

### Leg W — wild sweep (GUARD, not GO) + wall numbers

Pilot: 8 seeds, control vs armed, IDENTICAL seeds, same base, 180d
death-aware horizon, tableseat-nowait policy (the muster lineage's
policy, so wall numbers stay comparable) + titancast recorder.
Seeds 75131-75138. Confirm (only on F1 GO + guard pass): 16 seeds
75131-75146. Per-seed rows carry: days, endReason, won, waveReach,
maxArc, final/max rank, nationalEver/Final, table, entered, deathTotal
+ death-cause shares, titanCasts {total, titan, byId}, feastDraws
{total, titan}, pendingTitanFace episodes.
- TOTAL-DEATHS GUARD (binding): armed deathTotal <= control deathTotal
  x 1.10 AND armed median survival >= control median survival - 15d.
  A win gain bought with more deaths is not a GO.
- Wild titan casts are REPORTED, never judged: wave-4 reach is rare on
  the scale wall, so wild absence proves nothing (the muster-a lesson:
  never pass by absence). F1/F2 judge; W guards.
- Before/after comparisons run through scripts/balance-panel.js (§15):
  the panel is the instrument, this header is the judge. The compare
  .md is attached to the evidence file.

### Verdict rule

- GO iff F1 GO + F2 GO-or-INSUFFICIENT-DATA-with-cause + S pass +
  W guard pass (+ confirm guard pass if confirm runs).
- NO-GO iff F1 fails (armed titan > 0) or W guard fails.
- KILLED iff F1 pilot gate fails (control leak = 0).
- DIAG-* only if the run becomes diagnosis-only by coordinator order;
  not planned.

## Deliverables (each committed; killed game code reverted before commit)

- evidence/2026-10-30/sim-titanexcl-a-prereg.md (this file, committed
  before any sims)
- scripts/test-titanexcl-a.js (F1 + F2 + sense transcripts)
- scripts/policies/titancast-diag.js + scripts/sweep-titanexcl-a.js
  (W sweep + per-seed corpus evidence/2026-10-30/perseed-titanexcl-a/)
- evidence/2026-10-30/sim-titanexcl-a.md (verdict, numbers, wall numbers,
  village assessment in plain words, metric review, balance-panel compare)
- src/js/game.js castMonster exclusion (GO only; reverted if killed)

No push, no version bump, no live verification, no merge to master —
coordinator owns landing. Worktree must contain ONLY committed work at
end of run. No [needs-eyes]: a pool-exclusion parity fix changes no feel,
combat tuning, or UI surface a player should playtest.
