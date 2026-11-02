# sim-natflag-a — PREREGISTRATION (Loop A 20261102, axis scale-onramp, DIAGNOSIS ONLY)

## Primary question
On seed 97338, the musterupkeep arm's driver-computed national flag reads 1
at end (rank national/global at final read) despite village-lost d122
(evidence/2026-11-02/sim-musterupkeep-a.md, Instrument observations).
What exactly reads 1? Trace it to its source: which field, computed by the
driver or by game code (scale stage? hierarchy rank? table state? a driver
rank mapping?), at what point in the run it flips, and whether any game
path treats it as national reach (gate, table eligibility, win flag).
Comparison seed 97330 (also village-lost, flag 0 in musterupkeep) is run
identically: does it also read 1 after village loss, or is 97338 special?

## Method (no game-code change; driver instrument only)
- Reuse the musterupkeep driver pattern (scripts/musterupkeep-driver-20261102.js):
  same closecommit policy stack, same env flags
  (FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 FULLSEAT=1 HERALD=1),
  same seeds, DAYS=180, run until village-lost or the horizon.
- New driver scripts/natflag-driver-20261102-a.js records, per day from d1:
  Game.scaleRank(), state.networkLive / nationalLive / globalLive /
  nationalDay / nationalShape / pendingNational / pendingGlobal,
  Game._havenPolity() (shape, villages, size) when callable, active
  hierarchy links (id, direction, trust, arrears, link day), and every
  say-line matching national/court/realm/global/regional-dawn patterns.
- At final read, record the same national computation the musterupkeep
  driver used (scaleRank in {national, global} => 1), plus
  Game.deedGateReady() breakdown, progState table flags, Game.won,
  maxWave, and endReason — so the flag's game-path consequences are
  checked on the same run, not inferred.
- Code read (no sim needed): every scaleRank() consumer in src/js
  (hierarchy, progression deedGateReady, table, wave gating, titans)
  and whether each path fired on these runs (wave-5 unlock, table
  waiting/done, win).
- Sense check: the captured say-lines around the flip day and around
  d122 (village loss) — does anything in-game narrate a national
  standing, or does the village simply die?

## Seeds / horizon
- Seeds: 97338 (mandatory), 97330 (comparison). Identical to musterupkeep
  baseline reproduction (mu-closecommit-s97338-r1.json: national 1,
  village-lost, gameDays 122; mu-closecommit-s97330-r1.json: national 0,
  village-lost, gameDays 122).
- Horizon: DAYS=180 with death-aware stop (dead villages stop simulating;
  the musterupkeep runs ended d121/d122). The flip search runs from d1,
  because national cannot stage before regional+30d but the regional
  dawn day itself is part of the trace.

## Pre-registered verdict classes (judge against these, never re-scored)
- DIAG-GO: the artifact's source is isolated (named field + computing
  code + the day it flips) AND a verdict is stated with evidence — either
  "artifact only, no game path treats it as national reach" with the
  paths checked (deedGateReady breakdown, table flags, win flag, wave
  gating), or "real reach" with the game path that grants it (the beat
  that set the flag, its say-line, and the polity that qualified).
- DIAG-NO-GO: the flag's source or its game-path consequences stay
  unexplained after tracing the scale/rank computation.
- DIAG-NO-BAND (not expected here): the reproduction itself fails
  (97338 no longer reads 1 under the identical stack, or the driver
  cannot run) — reported as a reproduction failure, not a verdict.

## What this arm does NOT claim
- A final-read scaleRank of national/global is NOT national reach for
  loop reporting unless the verdict above says "real reach" with a
  granting game path. The 1340Z coordinator warning stands until this
  arm's verdict replaces it.

## Metric review
- To be filled in the results evidence file if the metric (the
  driver-computed final-read flag) proves wrong: the correct
  national-reach check for future runs (named field/check) goes there
  and in the final report, not as a mid-run re-score of this verdict.
