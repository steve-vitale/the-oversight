# TB turn-economy decomposition — prereg (Loop A, run fleshout-20261103T2315Z, arm sim-tbfinish-a)

Committed BEFORE any judged sim. DIAG-ONLY arm: zero src/js, zero
game-code change. This arm DECOMPOSES where each round of a
wave-4+ turn-based (TB) fight goes; it does not fix anything —
any fix touches TB engine/policy code and belongs to a
follow-up arm with its own prereg.

## Grounding (read, not assumed)

- `evidence/2026-11-03/sim-tbleth-a.md` + its prereg, and
  `evidence/2026-11-03/sim-w4convert-a.md` + its prereg. tbleth
  proved TB wave-4 fights lose as a 9x damage race (median 3
  leader strikes before dying, median 6 rounds survived, median
  dealt fraction 0.16) but could NOT say why fighters spend most
  rounds not striking — movement intent and position were not
  instrumented. This arm is that single next blank.
- Canon: `docs/CANON.md` + `docs/MONSTER-WAVES.md` (wave 4: The
  Mirror Draft, standing >= 100; bands: damage 35–95, HP
  850–1500, pierce 0.2–0.5; "a 4–6 round fight for a godhood
  build (~220 dmg/round)") + `docs/MEASUREMENT.md` §§9–12, 14–15
  + `docs/SIMULATING.md`. No canon doc covers a TB
  turn-economy decomposition; the definitions below are this
  arm's measurement definitions, not canon.
- Scope fence (binding): TB fights only; field fights are
  win-fielddmg territory — counted, never decomposed. No
  ally-join code, no gear-wearing code, no gate/price/deed/
  win-plan changes, no veteran-counting changes. ZERO src/js
  changes in this arm (scripts + evidence only).

## Calibration gate — DIVERGED, with cause, REPRODUCIBLE (run BEFORE this prereg)

The UNMODIFIED w4convert census driver was rerun on seed 99107
(the 2-kill seed) at this worktree anchor (HEAD 42f0bd49f) with
RUN=tbfinish-calib, output
`evidence/2026-11-03/perseed-w4convert-a/w4convert-s99107-tbfinish-calib.json`:

- Result: days 38, end village-lost, spawnsW4 0, tbCalls 0,
  tbStarted 0, fieldsW4 0, killsW4 0, unlinked 0, orphans 0,
  errors 0, maxWave 3.
- 1819/tbleth numbers for that seed: days 80, spawnsW4 3,
  tbCalls 2, tbStarted 2, fieldsW4 0, killsW4 2. The gate
  DIVERGES on every measure, not marginally.
- Reproducibility: rerun with RUN=tbfinish-calib2 reproduces
  the diverged result EXACTLY (days, end, spawns, TB, field,
  kills, maxWave, and the full deathEvents list identical).
  This is a deterministic base move, not a flaky run.
- Cause, proven by elimination: the driver, the instrument,
  and the harness are UNCHANGED between the 1819 anchor
  (77ff4a807) and this anchor (`git log` on
  scripts/w4convert-driver-20261103.js,
  scripts/w4convert-instrument-20261103.js,
  scripts/sim-harness.js: no commits in range). What DID
  change: `src/js/game.js` (+178 lines) and
  `scripts/policies/competent.js` (+237 lines) via gap-audit11
  legs 1+2 (competent policy presses combat buttons; trigger
  resonance), gap-batch items 13/14/15/17 (deadfall duty
  staffing, doorstep step, promise release, night-out lines),
  and the hurttraveler narration change. The policy is part
  of the trajectory: "competent VERBATIM" at this anchor is
  not the competent of the 1819 anchor. (Hurttraveler's own
  trajectory-identity claim was 8/8 on ITS band; identity on
  one band does not transfer to 99107.)
- Consequence — RE-BASELINE (explicit, per the task brief):
  the baseline for this arm is THIS anchor's band as the
  judged leg measures it, never the 1819 numbers. If the
  judged leg's totals diverge from 1819, that divergence is
  reported as the anchor move documented here, never silently
  adjusted. The 1819/tbleth decomposition does NOT transfer
  to this anchor: at this anchor, seed 99107 produces ZERO
  wave-4 TB fights, so the turn-economy question cannot be
  answered from that seed at all.
- Open observation for the coordinator (not chased here):
  the calibration village is "lost" at day 38 with the
  scholar alive and 9 roster members in the day-38 snapshot
  — the villageLost trigger on this run is not scholar
  death. That trigger is a question for the coordinator, not
  this diag arm.

## Policy, seeds, horizon (fixed now)

- Policy: `scripts/policies/competent.js` `{competent}` VERBATIM
  (at THIS anchor — see re-baseline above), default env. No
  policy variant.
- Seeds: 99101–99108 — the SAME band as 1819/w4convert/tbleth,
  so the judged leg measures exactly how much of the 1819
  phenomenon survives at this anchor.
- Horizon: 140 days, death-aware (dead villages stop
  simulating; never a fixed 200d).

## Instrument (scripts only)

`scripts/tbfinish-instrument-20261103.js` + driver
`scripts/tbfinish-driver-20261103.js` + analyzer
`scripts/tbfinish-analyze-20261103.js`, extending the tbleth
instrument (same identity-at-start, RNG-neutral call-through
wraps, exact kill linkage, tbDamage ledger, transcript
capture) with turn economy:

- `tbBeginTurn` (pre-original): opens a player-turn record
  when the arriving fighter is the player and a TB exposure
  is open — start snapshot: player pos/moveLeft/acted/HP/
  stunned/stunFull/blindTurns, weapon range, distance to each
  live monster (fighterDistTo, Chebyshev fallback), monster
  telegraph presence per monster.
- `tbAdvance` (pre-original): closes the open player turn
  while tbCurrent is still the player — the post-action,
  pre-monster-turn state. Closing at the NEXT tbBeginTurn
  would fold monster-turn damage/movement into the player's
  turn; this ordering is the instrument's key design choice.
- Player-action wraps (strike/move/wait/study/shout/offerFood/
  talk/rally/warcry/flip/endTurn/barrierExit/useAbility):
  appended to the turn open at CALL time, with pre/post
  snapshots and the returned value — because strike/wait
  auto-advance inside the original call, appending after the
  call to "the open turn" would misattribute the action to
  the NEXT turn.
- `tbMonsterTurn` / `tbVillagerTurn` brackets: per-NPC-turn
  pre/post (pos/HP/telegraph/fled), hits inside the bracket,
  transcript slice.
- `tbDamage` hits additionally stamped with turnSeq, actor
  key/kind, and phase (player-turn / npc-turn /
  between-turns), so damage attributes to the turn that
  produced it.
- `tbEnd` pre-call closes any open player turn
  (fight-end snapshot), then the tbleth end snapshot.
- `startCombat` (new fight) closes any open player turn as
  superseded, then the tbleth identity-at-start logic.

Per wave-4+ TB exposure, record (in addition to tbleth's
fields): per player turn (round, extra-turn flag, start/end
snapshots, action list with returns, say lines during the
turn, close reason), per NPC turn (actor, round, class inputs),
and the tbDamage hit stamps above.

## Turn classes (mutually exclusive, fixed now, applied in this order)

Player turns:
1. `stunned-full`: stunFull at start, no actions.
2. `strike` / `move-strike`: a strike call returned true AND
   >=1 leader hit on a monster during the turn (move-strike
   iff a move action also fired).
3. `strike-missed` / `move-strike-missed`: a strike call
   returned true AND 0 leader hits (heron/blind/flyer/haymaker
   miss, or a strike that spent the turn without landing).
4. `wait` / `move-wait`: a wait call (move-wait iff moves also
   fired).
5. `flee-attempt`: a barrierExit call, or a move ending on an
   edge tile.
6. `trick-or-ability`: shout/offerFood/study/talk/rally/
   warcry/flip/useAbility action.
7. `move-only`: moves, nothing else.
8. `failed-strike`: strike calls all returned false; reason =
   first matching say line during the turn (Too far / can't
   reach / No movement left / Already acted / No ammo /
   afterimages / too high / already down / gone — fled), else
   UNRECORDED-reason.
9. `no-action`: nothing at all — must be 0 or explained
   (a status-tick fight end is the only expected excuse, and
   it must be named, not assumed).

Per-turn flags (not classes): outOfRangeAtStart (min distance
> weapon range), endOutOfRange, stunned (not full), blind,
edgeAtEnd, movesSpent (moveLeft start − end), minDistStart,
endMinDist, strikesAttempted, strikesLanded, dealt (hpDelta
sum on monsters during the turn).

NPC turns:
- Monster: `finisher` (any hit requested >= 9999) >
  `damage` (any hit on a human) > `telegraph` (telegraph newly
  set) > `telegraph-held` (telegraph present, not newly set) >
  `move` (position changed) > `non-damage`.
- Ally: `ally-damage` (any hit on a monster) >
  `ally-heal` (any hit on a human with positive hpDelta) >
  `ally-move` > `ally-other`.

## Exposure outcome classes (as tbleth, unchanged)

`kill` (won/routed + linked kill), `pyrrhic` (lost + linked
kill), `fighter-died` (lost, no kill), `fled`, `tb-other:<result>`,
`tb-unended`. No UNCLASSIFIED bucket: an exposure whose
outcome cannot be read is an instrument error and breaks
DIAG-GO.

## Primary metric (pre-registered, judge the arm on this)

For every wave-4+ TB exposure in the band: the per-round turn
economy — player-turn class histogram, monster-turn class
histogram, strikes attempted vs landed, moves spent,
out-of-range-at-start share, failed-strike reasons, flee
attempts, stunned-full turns, trick/ability use, the eulogy
finisher round where applicable — plus the tbleth damage
ledger reconciliation (gap 0 per monster body where
applicable). The primary metric is descriptive (diagnostic);
no rate threshold is pre-registered on any rate itself.

## Verdict classes

- DIAG-GO iff: 0 instrument errors; 0 orphan TB ends; every
  TB exposure in the band decomposed with per-round economy
  (or >=20 if the band yields more); 0 unclassified
  exposures; 0 orphan TB ends (repeated for emphasis: ends
  must all attach to exposures); damage ledger reconciled
  where applicable (gap 0 or gap explained from recorded
  events); every kill row linked or reported unlinked; a
  turn-economy table plus the single next fix-arm
  recommendation is produced; and the proof test passes.
- DIAG-GO-LOW-N (pre-registered coverage caveat, NOT a
  re-score): if the band yields fewer than 10 TB exposures,
  the decomposition is complete for what the band yielded,
  but the turn-economy question is NOT settled — the
  evidence then recommends a fresh band search at this
  anchor as the next arm, and no fix lever may be chosen
  from an under-sampled table.
- DIAG-NO-GO otherwise: the evidence names the failing leg
  (instrument, reconciliation, classification, or ledger)
  and the run does not claim a decomposition it did not
  prove.
- No fix, no confirm, no game-code change in this run.

## Proof test

`scripts/test-tbfinish-20261103.js` proves, on fixtures plus
a live-harness smoke: (1) all nine player-turn classes plus
move variants, mutually exclusive, with out-of-range flags
and failure reasons; (2) all NPC-turn classes; (3) a stub
known TB fight driven round by round — turn open at
tbBeginTurn, close at tbAdvance entry, action attribution to
the turn open at call time, monster/ally brackets, kill
linkage, unlinked reporting, ledger gap 0; (4) live-harness
smoke: all turn wraps install, chain, and uninstall cleanly.

## Balanced panel (§15)

INAPPLICABLE to a pure diagnostic with no before/after change
— there is no candidate arm to compare, so no comparison is
fabricated. The binding checks are the calibration gate above
plus the ledger reconciliation in the evidence.

## Hard limits (binding, honored)

- NO src/js changes at all. NO readyDemand, t4/t5, or
  plentyCap change. NO win-price or deed-gate change. NO
  wild-router ally-join code. NO field-fight damage/staying
  code or measurement. NO national-standing code. NO
  veteran-counting code. NO Loop B food-economy code. NO
  equipment/armor/weapon wearing code (read gear state only).
  No `[needs-eyes]` commit (diag only, no feel/combat/UI
  change).

## Metric review (pre-run doubts, for the NEXT run)

- Turn-end snapshots are post-action, pre-monster-turn by
  construction (tbAdvance-entry close). If a future reader
  sees a turn whose end HP differs from the next turn's start
  HP, that difference IS the intervening monster/ally turns —
  it is not an instrument gap, it is the round structure.
- A strike call returning true with 0 leader hits is
  `strike-missed`, not a whiff count: the engine has several
  distinct miss paths (heron stillness, blind afterimages,
  flyer height, haymaker whiff) and the transcript slice per
  turn is the evidence for which one fired — the analyzer
  does not guess which.
- `flee-attempt` counts attempts (barrierExit calls, edge
  moves), not escapes: an edge move that does not exit is
  still an attempt, and a door escape ends the fight as
  `fled`. The policy's directional-flee logic (havenward
  exit) is NOT re-derived here; only the attempt signals
  are recorded.
- movesSpent reads moveLeft deltas, which price terrain
  (difficult ground costs 2). It is a movement-budget spend,
  not a tile count; per-move pre/post positions are recorded
  for any tile-count follow-up.
