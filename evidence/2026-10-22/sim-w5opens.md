# sim-w5opens — "what opens the wave-5 door on the tributeguard substrate"

Run: fleshout-20261022T2125Z, arm sim-w5opens, axis scale-onramp. DIAG,
offline — zero new sims, zero src/js.
Worker tree: ~/workspace/worktrees/sim-w5opens. Namespace: w5opens.
The named next it answers (1121Z review): "wave-5 2/8 → 2/8 (opens on 2/8
seeds BOTH arms, guard-independent — highest open rate measured on any
substrate; the next wave-5 arm should look at what opens it there)".

## Pre-registration (binding, docs/MEASUREMENT.md §14 — written BEFORE attribution)

- **PRIMARY (DIAG):** DIAG-GO = 100% of wave-5 opens in the committed
  tributeguard corpus attributed to named mechanism legs, 0 unexplained.
  NO-GO = any open unattributable from the committed corpus — close as
  **unmeasurable-with-instrument-gap** (name the missing fields); do NOT
  invent attributions, do NOT run new sims to fill the gap (that's a
  different arm).
- **Corpus:** evidence/2026-10-21/perseed-tributeguard/*.json (16 runs,
  8 seeds 64921–64928 × {control, armed}, anchor commit c316f2ec78d6),
  _summary-control.json, _summary-armed.json,
  evidence/2026-10-21/sim-tributeguard.md,
  evidence/2026-10-21/tributeguard-transcripts/ (2 files: s64921, s64926).
- **Method:** deterministic scan of the committed corpus
  (scripts/test-w5opens-attr-20261022.js); legs from the code-grounded gate
  model (src/js/game.js unlockedWave ~L31137, src/js/standing.js
  villageStandingTotal/waveCombatReadiness ~L24–465); in-process double-run
  asserted byte-identical (sha256 of canonical table).
- **Attribution legs (code-grounded):**
  1. wave-3 rung: day ≥ 25 AND wave-2 ledger ≥ bar (kills only)
  2. standing ≥ t5 (200): villageStandingTotal()
  3. readiness deferral released: waveCombatReadiness(5) — 4 armored P≥15,
     6 armed, 3 tricks, 2 veterans (wave-4+ kills); else held at t5-1
  4. plenty cap not binding: bread ≤ plentyCapT5 toward t5
  5. wave-4 faced: waveEngaged(4) > 0 (deed-feed engagements, fleeing counts)
  6. timing vs win (unlock day before/after table+win)
  7. RERUN-overtime tier at unlock (overtime scales wave 4–5 fights
     +25% HP / +12% damage per tier; "take your seat to stop the clock")
  8. seat state at unlock
  9. guard-dependence: open in both arms / control-only / armed-only
- **Metric review** and verdict sections below.

## Canon

docs/CANON.md read first. The wave law lives in docs/MONSTER-WAVES.md:
wave 5 = "The Producers" — gate: village standing ≥ 200 AND wave-4 faced
(Steve 2026-10-13 flexible-route call, replacing the old 3-wave-4-points +
national two-rung gate that was unreachable by construction). Readiness
gates the standing number (design call #4, 2026-10-16): standing holds at
t5-1 while any readiness bar is short; wave-4 faced = waveEngaged(4) > 0
(deed-feed engagements; fleeing counts — the fled-but-unready exposure bar
was retired, engagement now only feeds the endgame deed gate, never waves).
No canon doc covers travel/regional/hierarchy or the RERUN-overtime tiers;
mechanism claims below are grounded in src/js reads, never invented.

## Corpus inventory

16 runs, 8 fresh belongfeast seeds 64921–64928 × {control, armed}, 180d
death-aware, paired same-seed, anchor c316f2ec78d6, substrate
FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 VGEAR=1.
Wave-5 opens: **4** — control/s64925, control/s64927, armed/s64925,
armed/s64927 (2/8 seeds in EACH arm — reproduces the 1121Z "2/8 → 2/8").

Per-seed JSON fields: anchorCommit, arm, arrearsTrippedDissolutions, days,
deathCauses, dissolutionDetail, dissolutions, endReason, exiled, gameDays,
instrument, maxWave, national, nationalEver, policy, rankCensusDays, seed,
substrate, table, tgEvents (tribute events only), tgGuardError,
tgGuardPaid, tgGuardPartial, tgSkips, wave4, wave5, winTrack (end-state
path/moral/track/seat), won. End-state only. No time series except tgEvents.

## Attribution table (scripts/test-w5opens-attr-20261022.js, sha256
2a6eaaeadf175f33644f55fec18ee2c429d332e27ee5c2d55a6c138531dd6f39)

| open | w3 rung | standing≥200 | readiness bars | plenty cap | w4 faced | timing vs win | overtime tier | seat at unlock | guard-indep |
|---|---|---|---|---|---|---|---|---|---|
| control/s64925 (d92, won=1, table=1, national=1) | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | SATISFIED (end-state; day unknown) | UNKNOWN | UNKNOWN | UNKNOWN | YES (both arms) |
| armed/s64925 (d92, won=1, table=1, national=1) | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | SATISFIED (end-state; day unknown) | UNKNOWN | UNKNOWN | UNKNOWN | YES (both arms) |
| control/s64927 (d179, won=1, table=1, national=1) | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | SATISFIED (end-state; day unknown) | UNKNOWN | UNKNOWN | UNKNOWN | YES (both arms) |
| armed/s64927 (d181, won=0, table=0, national=1, survived) | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | SATISFIED (end-state; day unknown) | UNKNOWN | UNKNOWN | UNKNOWN | YES (both arms) |

28 unknown legs. 0/4 opens fully attributable → **NO-GO**.

## Instrument gap (named missing fields)

To attribute an open, the per-seed instrument must record, per run:
1. `wave5UnlockDay` — the day unlockedWave() first returned 5.
2. `w4facedDay` + distinct wave-4 types engaged (deed-feed).
3. `standingAtUnlock` + composition (war/blood, diplomacy/bonds,
   bread/plenty) — which leg of the t5 bar did the work; whether the
   plenty cap bound.
4. `waveUnlockReady(5)` at unlock: which deferral hold bound t5-1 last —
   armored-P≥15 count, armed count, tricks known, veterans (wave-4+ kills)
   alive; and the hold-beat kind (cap vs defer5 vs plenty).
5. `winDay` / `tableDay` — timing of the unlock vs the table+win.
6. RERUN-overtime tier at unlock (overtime scales wave 4–5 fights +25%
   HP / +12% damage per tier).
7. Seat state at unlock (winTrack.seat is end-state only; null for all
   four won runs, and winTrack is null for the unwon armed s64927).
8. Unlock-day transcripts: ±4d say-lines around the unlock beat
   ("The Producers"), per the tributeguard-transcripts pattern.

The corpus records NONE of these. The opens cannot be attributed offline;
inventing them would be exactly what the brief forbids.

## What the corpus CAN say (end-state, honest scope)

- **Guard-independence: YES.** All four opens pair across arms on the same
  seeds; the 2/8 → 2/8 reproduction is seed-driven, not guard-driven.
  s64925 control ≡ armed byte-for-byte (deaths, days=92, endReason,
  won=1; guard fired 0 times, tgSkips=0, tgGuardPaid=0) — the guard is
  transparent there by construction.
- **Tribute cost does not stop the door.** Armed s64927 paid 7 guard + 5
  partial tributes (~48k kcal per sim-tributeguard.md), the court held
  (0 dissolutions), national end-state 1, and wave-5 still opened — but the
  village never tabled by the d181 horizon (table=0, won=0, endReason=
  'survived', winTrack null) while control tabled and won d179. The win-
  timing price of guard-paid tribute (flagged in the 10-21 evidence, not
  judged) stands unmeasured — it is orthogonal to the door question.
- **End-state conjunctions (not timing):** all four opens end with
  nationalEver=1 and maxWave=5 (which proves waveEngaged(4)>0 occurred —
  code requires it for unlock). Correlation at end-state; causation timing
  unknown.

## Sense-testing (SENSE-TESTING LAW)

Two transcripts exist: tg-armed-belongfeast-s64921.txt (maxWave 4),
tg-armed-belongfeast-s64926.txt (maxWave 3). **Neither is an unlock seed**;
no "The Producers" beat is recorded anywhere in the corpus, and no
transcript exists for s64925 or s64927. Whether the door opening reads as
an earned moment in the village's story is therefore also unmeasurable —
instrument gap, not a verdict on the fiction. The 10-21 evidence already
showed the standing hold-beat names short bars ("armor the village..."),
but no hold-beat lines were captured for these four runs.

## Verdict

**NO-GO — unmeasurable-with-instrument-gap.** DIAG-GO required 100% of
opens attributed, 0 unexplained; the corpus attributes 0/4 to named legs
(28 unknown legs). The two legs that ARE answerable from the corpus are
guard-independence (YES — the door is guard-independent, seed-driven) and
end-state w4-faced (satisfied by code requirement). Everything timing-
dependent — which standing leg fed t5, which readiness bar released last,
whether the unlock preceded the table — is absent from the instrument.

## Metric review (§14)

- PRIMARY as pre-registered: a miss is NO-GO, never re-scored against a
  friendlier metric. The "guard-independence YES" and "w4-faced satisfied
  end-state" findings do NOT convert to DIAG-GO — the binding bar was
  attribution of the opening conjunction per unlock, and it was not met.
- Metric doubt for the NEXT wave-5 arm: the primary is sound, but the
  instrument must be specified up front (the 8 fields above) — an offline
  DIAG pre-registered against a corpus whose instrument it hasn't read
  will always land here. The next arm should be instrument-first: extend
  the sweep collector, THEN re-run, THEN attribute.
- No telemetry deviation check run (this arm changed no game state and
  produced no new per-seed runs; the corpus is the 10-21 instrument's).

## Implications for the wave-5 door design

The honest implication is narrow: on the VGEAR=1 winning substrate, the
wave-5 door opens on 2/8 seeds in both arms of a tribute-policy experiment
— the highest open rate measured on any substrate — and the opens do not
care about tribute policy. What opens it there is *not* the guard, the
tribute, or the court mechanics: it is something in the seed×substrate
interaction (belongfeast + VGEAR=1 + FEASTSCALE_R13=1). The 1121Z question
("what opens it there") names the right target, but the current instrument
cannot answer it: we know the door opened, not which leg — blood, bonds,
bread, or which readiness bar — let it. The readiness deferral (design
call #4) is the newest and least-measured leg of the door: whether wave 5
is opening on earned armor/tricks/veterans or sliding through on a leg the
design intended to hold is exactly the question the missing field #4 would
answer. Until the instrument records it, every "wave-5 opened" number is a
reachability count with no mechanism attached.

## Named next

An **instrument arm** (zero game-code change; sweep-collector only):
extend the per-seed instrument to record the 8 fields above — unlock day,
w4faced day/types, standing composition at unlock, waveUnlockReady(5) bar
states + which hold bound t5-1, win/table day, overtime tier, seat at
unlock — plus ±4d unlock transcripts. Then re-run 8+ seeds of the same
belongfeast VGEAR=1 substrate and re-run
scripts/test-w5opens-attr-20261022.js. Pre-register the attribution
against the extended corpus, not the 10-21 one. The 10-21 corpus stays the
baseline for the guard question; the wave-5 question needs its own.

## Convergence state

**unmeasurable-with-instrument-gap — NO-GO.** scale-onramp stays the
blocking axis. The 2/8 wave-5 open rate on this substrate is real and
guard-independent, but the opening conjunction is unattributable from the
committed instrument. A killed question, not a killed theory (kill
discipline, Steve 2026-10-21): the theory is alive; the instrument is not.

Files: evidence/2026-10-22/sim-w5opens.md (this file),
evidence/2026-10-22/w5opens-attribution.json (canonical table, sha256
2a6eaaeadf175f33644f55fec18ee2c429d332e27ee5c2d55a6c138531dd6f39),
scripts/test-w5opens-attr-20261022.js (proof; deterministic re-run asserted
byte-identical in-process).
