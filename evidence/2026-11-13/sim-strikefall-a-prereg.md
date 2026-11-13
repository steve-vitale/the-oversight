# sim-strikefall-a — prereg

Run: fleshout-20261113T1615Z (Loop A), arm sim-strikefall-a
Axis: scale-onramp (sim-findings.md #2303 + #2304, claimed by this run)
Branch: sim-strikefall-a — worktree ~/workspace/worktrees/sim-strikefall-a
Base: master 48ed1ffd753a142286e99201d68124d9aaa0de3f (rebased cleanly at arm start)
Date: 2026-11-13
Anchor commit (check leg): the prereg commit on this branch (recorded in each
per-seed JSON as anchorCommit; driver refuses any other HEAD via EXPECTED_ANCHOR).

## Findings under check

- #2303 STRIKE-AFTER-FALL ORDERING (second observation): "The RERUN ×1 The
  Congregation falls." is followed by "You STRIKE the congregation for 18
  (Kitchen knife)." on seed 190396 d130, and "The Static Kite falls." by
  "You STRIKE the kite for 89 (Machete)." on d89 — a strike narrated against
  a monster that just fell, twice in one seed-day. First noted by
  sim-freezeline-a (evidence/2026-11-13/sim-freezeline-a.md); confirmed by
  sim-applystatus-a (evidence/2026-11-13/sim-applystatus-a.md).
- #2304 SQUARE SCREAMS TWICE (second observation): "The square SCREAMS —
  static made solid. And the kite DIPS, low, its screen strobing with footage
  of you. IT'S YOURS. NOW." fires twice identically in a row on seed 190396
  d89. First noted by sim-freezeline-a (unfiled, "needs a look"); confirmed by
  sim-applystatus-a.

## Check leg (before any fix)

Driver scripts/strikefall-check-driver-20261113.js, competent verbatim,
150d death-aware, seeds 190391–190398 (matched band — the observation seed
190396 is inside it). The driver wraps Game.say, captures the full say
stream with day + global order + live-fight id, and snapshots the live
fight's fighters (key, monsterId, name, alive) at every line of interest.
Analyzer scripts/strikefall-check-analyze-20261113.js judges the stream.

Definitions (the judge):
- STRIKE-AFTER-FALL: a monster "falls." line immediately followed (next
  say line in the stream) by a "You STRIKE the <target> for N" line whose
  target names the fallen monster (normalized label match: case-insensitive,
  "The "/"RERUN ×N " prefixes stripped, token-subset). The analyzer also
  lists every adjacent falls→STRIKE pair regardless of label match, for
  manual review — adjacency alone is the glitch; the label match confirms
  it is the same monster.
- DUPLICATE SQUARE-SCREAM: the Static Kite DIP line ("The square SCREAMS —
  static made solid. And the kite DIPS, ...") appearing 2+ times in one
  fight (same fight id). The analyzer reports the count per (fight, day),
  the adjacency of the pair, and the kite-fighter count snapshot at each
  DIP line (1 kite = double-resolve; 2+ kites = two honest dips with
  identical text).
- Controls (must not move on the after leg): freezeline count
  ("still frozen from your scream"), applyStatus freeze count
  ("is frozen — ... (stunned: no movement)"), bellow count. These pin the
  narration-only character of any fix: the fix may reorder / dedup only
  the two findings' lines.

## Fix leg (only if a clean emit-order fix exists)

Hypotheses to test at the code (pre-check reading, to be confirmed or
refuted by the check leg + targeted probes):
- #2303: tbPlayerStrike (game.js) calls tbDamage(..., {quiet:true}) and
  composes its "You STRIKE for N" line AFTER tbDamage returns — but
  tbDamage says the "falls." line inline when hp hits 0. The strike line
  must stay after damage (honesty: it states the number that LANDED, after
  tbDamage's monster-state modifiers), so the fix shape is to defer the
  death narration out of tbDamage for the player-strike path and flush it
  after the STRIKE line — every honest line kept, order fixed. If the
  deferral cannot be made airtight (every deferred line flushed on every
  path, no silent kills), report CHECK with the mechanism, do NOT force it.
- #2304: the DIP line has exactly ONE emit site (game.js tbMonsterTurn
  resolve, the statickiteIs dip block). A duplicate therefore means the
  dip block ran twice — two kites in one fight, or one kite resolving
  twice. The fix follows the mechanism: two kites → per-fight dedup or
  distinguishing text (a design-flavored call, needs care: two dips are
  two real melee windows); one kite twice → find the double-resolve.
  Do NOT just dedup the line without understanding which it is.

## GO bars (pre-registered; judge the after leg against these)

- (a) STRIKE-AFTER-FALL count 0 on the after leg (was N on the check leg,
      recorded in the evidence table).
- (b) DUPLICATE SQUARE-SCREAM count 0 on the after leg (was M on the
      check leg, recorded in the evidence table).
- (c) Survival/wave numbers BYTE-IDENTICAL check vs after on all 8 seeds:
      days, gameDays, endReason, won, over, villageLost, scaleRank,
      maxWave, unlockedWave, standing, endPantryKcal, FULL deaths arrays.
- (d) Proof test scripts/test-strikefall-a.js RED→GREEN on the fix commit
      (instrument legs + game-level legs: killing player strike orders
      STRIKE-then-falls; non-killing strike unchanged; two-kite / double-dip
      case per the confirmed mechanism).
- (e) Controls unchanged: freezeline count, applyStatus count, bellow
      count identical check vs after on all 8 seeds.

## Method notes

- Seeds are nearly free; the check and after legs run the same 8-seed band
  (190391–190398), 150d, competent, identical driver.
- The say stream is the instrument: every line carries day + sequence +
  fight id. No line is dropped from the record (the analyzer judges the
  kept stream, not a filtered one).
- Canon: docs/MONSTER-WAVES.md (Congregation wave 4, Static Kite wave 2 —
  the dip is the melee window, "It never lands; the dip is the only
  window"). No canon doc covers the square-scream event or fight-narration
  ordering beyond MONSTER-WAVES.md + the standing "no silent actions /
  honest narration" rules — the ordering fix is engine work, not canon work.
- Metric review: if a metric proves wrong (e.g. adjacency alone over- or
  under-counts), write it under "metric review" in the evidence file and
  propose the revision for the NEXT run; never re-score mid-run.

## Files

- scripts/strikefall-check-driver-20261113.js — check/after driver.
- scripts/strikefall-check-analyze-20261113.js — analyzer (judge).
- scripts/test-strikefall-a.js — proof test (RED first, then GREEN).
- evidence/2026-11-13/perseed-strikefall-a-check/ — 8 check-leg JSONs.
- evidence/2026-11-13/perseed-strikefall-a-after/ — 8 after-leg JSONs.
- evidence/2026-11-13/sim-strikefall-a-prereg.md — this file.
- evidence/2026-11-13/sim-strikefall-a.md — evidence (written at end).
