# sim-instruments-gap — Triage B12 + B16 (measurement instruments only)

Run: gap-closure worker, branch gap-instruments, 2026-10-27.
ZERO src/js changes, ZERO game-behavior changes, ZERO contract changes
(`scripts/balance-metrics.json` untouched — metric/tolerance/direction
changes are Steve's call). No [needs-eyes] flag: instruments do not
change game feel. This file's pre-registration was written and committed
BEFORE any fix; the run is judged against it exactly as written (§14).

## Canon read first

- docs/CANON.md (manifest; no canon doc names alien-player duels or
  sweep-corpus ingestion as systems — mechanisms below are cited from
  code comments and prior evidence, not invented canon).
- docs/MEASUREMENT.md §9–12 (staged measurement, pre-registration
  binding), §14 (a miss is NO-GO, never re-scored; doubts go under
  "metric review" for the NEXT run), §15 (balanced panels are the
  shared instrument; the panel is the instrument, not the judge).

## Standing verdicts being closed (both verified still open, 2026-10-27)

### B12 — Balanced-panel compare does not ingest per-seed sweep corpora (finding 1217)

- Located: the compare path is `scripts/lib/balance-scorecard.js`
  `comparePanels` (line 44), reached via
  `node scripts/balance-panel.js compare --before <file> --after <file>`.
  There is no `scripts/balance-scorecard.js` — the finding's filename
  was shorthand for `scripts/lib/balance-scorecard.js`.
- Reproduced (before any fix, this worktree):
  `node scripts/balance-panel.js compare --before
  evidence/2026-10-27/sim-waitlong-a-sweep.json --after (same) --out
  /tmp/waitlong-panel-repro` throws
  `TypeError: Cannot read properties of undefined (reading 'days')`
  at `balance-scorecard.js:44`, exactly as disclosed in the 1215Z
  round (`evidence/2026-10-27/sim-waitlong-a.md`, "Balanced panel"
  section) and both 1955Z arms. Direct API call
  `comparePanels(sweepDoc, sweepDoc)` throws identically.
- Root cause (read, not guessed): `comparePanels` assumes panel-driver
  output (`panel.json.gz` with `.options`, `.sources`, `.rows` of
  `{row, metrics}`); a per-seed sweep corpus carries flat rows
  (`{policy, seed, won, entered, ...}`) and no `.options`, so the
  options-equality loop at line 44 dereferences `undefined.options`.
  The strict panel path is a safety property (§15 digest/validity
  gates) and must NOT be weakened — the fix adds a labeled
  sweep-corpus ingestion path alongside it, never a fake panel.

### B16 — Recorder rule for startAlienCombat (d94 finding 1213)

- Located: the recorder is `scripts/policies/tbstarts-diag.js`
  (sim-tbstarts-a). It wraps `startCombat`, `tbEnd`, `tbBarrierExit`
  and does NOT wrap `startAlienCombat` (grep: zero mentions).
- Reproduced (before any fix, this worktree): the d94 corpus row
  `evidence/2026-10-27/perseed-tbstarts-a/s73671-armed.json` carries a
  tbEnd row (day 94, result 'lost', id `fmgpspijo_f53f9n`, token 15,
  fighters player 'p' + hostile 'sarge') with NO start row carrying
  that id, that token, or that call index; `scripts/test-d94-a.js`
  re-derives this classification (44 PASS, 0 FAIL). Cause, quoted from
  `src/js/encounters.js`: `startAlienCombat` "builds the fight
  directly instead of via Game.startCombat". Note: encounters.js
  already emits a `tele('combat_start', {alien: true})` event on this
  path — but function-wrap recorders (the tbstarts census) never see
  it, because no `startCombat` call ever runs. The fix belongs in the
  recorder, not the game.
- Scope ruling: only the tbstarts-diag census (the recorder behind
  the finding) is extended. Other startCombat-wrapping recorders in
  the repo (compchan, compresence, dayfreeze, feastconv censuses)
  stay as they are — extending every census in the repo is out of
  scope for this item and is noted under "metric review" as follow-up.

## PRE-REGISTRATION (binding — written before any fix)

### B12 bars (all required for GO)

- B12-1 (ingest, no crash): the exact 1215Z attempt —
  `node scripts/balance-panel.js compare --before
  evidence/2026-10-27/sim-waitlong-a-sweep.json --after (same) --out
  <prefix>` — exits without the TypeError and writes a compare
  report (`.json` + `.md`).
- B12-2 (non-empty, paired): the report carries all 3 policies in
  the corpus (baseline, seatonly, seatwait) with cases = 8 paired
  seeds each (seeds 74001–74008), not zero, not unpaired.
- B12-3 (real values, no invention): the mapped contract metrics
  (won, entered, table, national, playerDeaths — mapped only where
  the corpus definition matches the panel definition exactly, see
  "Mapping" below) report pairs = 8 with real paired deltas; every
  other contract metric reports `not_observed`, never an invented
  value. Self-compare deltas are 0 (same corpus both sides).
- B12-4 (strict path untouched): genuine panel-shaped inputs still
  flow through the strict `comparePanels` gates unchanged (digest /
  options / source / validity mismatches still yield
  `decision: 'invalid'` with errors, never a sweep report); the
  contract file is byte-unchanged; no `src/js` file changes.
- B12-5 (no regressions): existing panel/compare instrument tests
  still pass (see Proof section for the list actually run).

### B16 bars (all required for GO)

- B16-1 (duel start recorded): a proof harness loads a real game,
  installs the tbstarts-diag recorder, calls `startAlienCombat`
  with a person-fighter, and the recorder's `starts` gain exactly
  one row whose postId/postToken match the live fight and whose
  fighter list includes the alien fighter — where the pre-fix
  recorder recorded no start row for the same call (proven by the
  d94 corpus re-derivation above + the proof script's
  startCombat-only control view).
- B16-2 (end joins to it): ending that fight via `tbEnd` produces
  an end row that joins the new start row by fight id AND token
  (the exact join the d94 end failed on every leg).
- B16-3 (observation-only): recorder errors stay 0; the wrapped
  call's return value is untouched; no game state is written by
  the recorder (it only reads and appends to its own store).
- B16-4 (no regressions, no game changes): zero `src/js` changes;
  `scripts/test-tbstarts-a.js` and `scripts/test-d94-a.js` still
  pass; startCombat/tbEnd/tbBarrierExit row shapes are unchanged
  for ordinary monster fights.

### Guardrails (a GO met with a guardrail breached is NO-GO)

- Zero `src/js` changes. If a game-code touch proves unavoidable,
  STOP and report instead of improvising.
- Zero changes to `scripts/balance-metrics.json`.
- No merge to master, no push, no version bump, no live verification
  (parent handles merge + ship). Branch committed, hashes reported.
- No two jest processes at once; ad-hoc jest uses
  `--cacheDirectory=/tmp/jest-cache-gap-instruments`.
- If git writes fail with "couldn't write" (container EPERM flap),
  STOP git writes and report loudly; never force writes.

## Mapping (B12 — decided before running, from definitions read in code)

Panel-row definitions live in `scripts/sweep-compare.js`
(`runComparison` row) and `scripts/balance-panel.js` (`finish`):

- won: panel `row.won` (0/1). Sweep rows carry `won` 0/1. Direct.
- entered: panel "sat at the table" (everEntered || tableEntered).
  Sweep rows carry `entered` with the identical definition
  (tbstarts, waitlong). Direct.
- table: panel "INVITED" (everTable || tableWaiting). Sweep rows
  carry `table` (tbstarts) or `tableInvited` (waitlong, identical
  definition at `test-waitlong-sweep.js:209`). Map `table`, else
  `tableInvited`. Never map invitations from any other field.
- national: panel "max rank reached is national or higher".
  Sweep rows carry `nationalEver` with the identical definition
  (tbstarts, waitlong), or `national` (panel-shaped rows), or
  `maxRank` (village/regional/national/global). Map `national`,
  else `nationalEver`, else rank-order of `maxRank`.
- playerDeaths: panel = sum of `row.deaths` map entries keyed
  `player:*`. Sweep rows carry `deaths` either as that same map
  (tbstarts `deathSummary`) or as an array of death records with a
  boolean `player` flag (waitlong) — count the flagged entries.
  Any other `deaths` shape maps to null (not_observed).
- Every other contract metric (survival30/60, communityLost,
  livingNpcs, lowFood/lowWater/lowHealth, npcHungry, classAccess,
  gear metrics, usefulIntake, bearerChanges, abilityAccepted, luck):
  NOT carried by per-seed sweep rows → null → `not_observed`.
  A sweep-corpus compare is therefore a partial compare and is
  labeled as such in every report (`source: 'sweep-corpus'`,
  note stating it is not a balanced-panel verdict). §15 still
  governs real panel verdicts; this path never claims one.

## RESULTS

(Pending — written after the fix. Pre-registration above is binding.)

## PROOF

(Pending — scripts, commands, counts.)

## METRIC REVIEW

(Pending — even if it says "none — metrics held.")

## WHAT REMAINS / FOLLOW-UP

(Pending.)
