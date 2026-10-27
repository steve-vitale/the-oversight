# sim-scalegate-a — PRE-REGISTRATION (binding, MEASUREMENT.md §14)

Run: fleshout-20261027T1315Z. Axis: scale-onramp. Worktree:
~/workspace/worktrees/sim-scalegate-a (branch sim-scalegate-a).
Task: enforce Steve's 2026-10-27 ruling (3), plain words — national
standing IS required for the full seat — in src/js/progression.js
deedGateReady(): add `scale` to the `ok` expression and NOTHING else.

Canon read BEFORE any change: docs/CANON.md, then docs/TABLE.md.
TABLE.md contract used: the full seat keeps the national bar
(national/global scale, wave bars 5/5/4/3/2, 3+ contests, 3+ crises,
stage >= 3, food-thesis deeds); the lesser seat requires regional+.
Code as found: deedGateReady() computes `scale` (rank national/global)
and reports it in the breakdown, but `ok` excludes it, with the comment
"Scale is NOT added here (open design question)". The lesser seat
(tableSeat) ALREADY requires regional+ — the full seat being easier on
scale than the lesser seat is the asymmetry this arm closes.
NOT in scope (finding only, never bundled): the code's stage bar is
>= 2 while TABLE.md says stage >= 3 for the full seat.

## Consumer audit (done BEFORE the change — no breaker found)

- tableSeat() (table.js): full checked first; if ok flips false it
  falls through to the lesser-seat evaluation (waves 4/4/3, 2+ contests,
  2+ crises, regional+, stage >= 2, food deeds). A sub-national village
  meeting every full bar but ranked regional therefore DOWNGrades to
  lesser, not out of the table; a village-ranked one falls to none —
  which is the ruling itself, not a break. No crash path: the
  fall-through is the existing code path, exercised by every
  lesser-seat run today.
- checkArc() (progression.js): seatNow = tableSeat().seat; Arc IV
  (want = 4) fires on 'full' OR 'lesser'. A downgraded village still
  reaches Arc IV via lesser. No break.
- ledger.js tableScene re-check (table.js tableScene, called at dawn):
  seat 'none' withdraws a stale tableWaiting ALOUD via
  tableWithdrawLine(), never silently. For a scale-only loss the seat
  detail is the lesser detail, whose bars all pass except rank, so the
  voiced reason is exactly "standing too low (village)" — honest,
  not mis-blamed on deeds. Verified by reading tableWithdrawLine:
  it names rank when rank is not regional/national/global. No break;
  no silent withdrawal.
- tableEarnedPaths(): reads tableSeat() and floors paths by minSeat
  (indispensable = FULL only). A downgraded village loses only the
  indispensable door; lesser+ doors keep their own prereqs. Narrowing,
  not breaking.
- tablePreview()/tableTakeSeat(): return null / not-ready when the
  seat is none; no seat is ever offered that tableScene would refuse.
  No break.
- Diag instruments (scripts/policies/fullseat-diag.js,
  indispensable-diag.js; scripts/test-fullseat-diag-20261021.js,
  test-indispensable-diag-20261020.js): READ-ONLY reporters that
  snapshot deedGateReady() breakdown + tableSeat().seat. After the
  change they report ok=false for sub-national full-bar villages —
  the new truth, not a break. Their component-distance logic reads
  breakdown fields (w1..w5, contestsN, crisesN, stage, foodDeeds),
  which this change does not touch. The fullseat-diag TEST's mock
  fixture computes its own old-ok without scale; that fixture is a
  mock of the OLD gate, not a production consumer, and is left
  untouched (flagged here so a later reader does not mistake it for
  a regression).
- No other src/js consumer of deedGateReady() exists (grep: only
  progression.js definition + table.js tableSeat + ledger.js comment).

Verdict of audit: NO BREAKER. Proceed with the minimal change.

## The change (game code, minimal)

1. progression.js deedGateReady(): `ok` becomes
   `waves && contests && crises && stageOk && foodDeeds && scale`.
   Nothing else changes: no lesser seat, wave bars, contests, crises,
   stage bar, or foodDeeds change.
2. Comment updates, minimal, both stating the 2026-10-27 ruling:
   progression.js deedGateReady comment + table.js tableSeat comment
   (both currently say scale is not enforced / open asymmetry).
3. Unit proof: scripts/test-scalegate-a.js (real loaded Game, flags
   set on real state — no stubbed gate): all bars passing with rank
   village / regional / national / global; asserts ok false, false,
   true, true; asserts the breakdown still reports scale honestly in
   every case; asserts old-ok (bars-only, recomputed from breakdown
   fields) stays true in the village/regional cases, so the flip is
   exactly the scale term; asserts tableSeat() downgrades
   regional->lesser and village->none while national->full.

## Sim band (MEASUREMENT.md §§9-12)

- Substrate: tableseat-nowait policy
  (scripts/policies/tableseat-nowait.js, TABLESEATNOWAIT=1 +
  LEANLINKRESCUE=1), the substrate that actually reaches the table.
- Seeds: 74101–74108 (fresh — verified before this prereg: no 7410x
  hits in evidence/2026-10-27 filenames or contents, no 7410x
  per-seed corpus filenames; 74001–74008 used by sim-waitlong-a today
  and 73701–73708 by sweep-deathrow-b, both rejected).
- Horizon: 180 loop-days, death-aware (runDays breaks on Game.over).
- Legs: BEFORE (unmodified code) vs AFTER (scale-enforced code),
  identical seeds, identical policy, same sweep script
  (scripts/sweep-scalegate-a.js). Per-seed rows carry: days,
  gameDays, endReason, won, waveReach, maxArc, final/max rank,
  national ever/final, table ever, entered, best seat ever
  (full/lesser/none tracked daily), final deedGateReady breakdown,
  seat counters, deaths + starvation deaths.
- BEFORE leg runs BEFORE the game-code edit; AFTER leg after it.
  No seed is screened, cherry-picked, or excluded on any outcome.

## GO shape (pre-registered — judged below, never re-scored)

PRIMARY (ONE primary): no-regression on the lesser seat.
GO = unit proof green (all assertions) AND sim band shows
lesser-seat entries AND wins UNCHANGED vs baseline on identical
seeds (same per-seed seat/won counts, or differences confined to
seeds whose baseline seat was full — there should be none, see
below) AND no lesser-seat or win regression on any seed.
- Full-seat count is expected 0 on BOTH sides: wave 5 blocks the
  full seat everywhere in sims. A full seat DISAPPEARING after the
  change (present before, absent after, same seed) is a FINDING to
  report loudly with the seed and the bars it held — NOT a failure
  of this arm's GO, because that disappearance IS the ruling
  working; it is reported, not hidden, and the GO's no-regression
  clause is judged on lesser/wins only.
- If the sim band shows ANY lesser-seat or win regression vs
  baseline on any seed: NO-GO. Revert the game-code change, land
  instruments + evidence only, report NO-GO loudly.

## Secondary (reported, not judged)

Wave reach 1–5, arc reach, national ever/final, median/max survival,
death-cause shares, starvation deaths, seat counters, final gate
breakdowns per seed (which bar, if any, blocks the full seat).

## Sense test (pre-registered)

Read one table audit line / seat transcript from the band and
confirm in plain words the seat language still reads honestly: no
village is told it holds a full seat it no longer holds, and any
withdrawal that fires is aloud and names the real loss. If a
withdrawal fires in the band, quote it; if none fires, say so and
quote the closest audit line instead.

## Metric review

(To be filled at evidence time. Doubts about the metric go here,
never into a mid-run re-score.)
