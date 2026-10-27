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

### B12 — GO (all five bars met)

What changed (instruments only):
- `scripts/lib/balance-scorecard.js`: `comparePanels` now routes
  sweep-shaped inputs to a new, separately labeled
  `compareSweepCorpora` path (paired by policy+seed, reusing the
  existing `compareMetric` engine) and returns `decision: 'invalid'`
  with a readable error for mixed shapes or garbage — instead of
  throwing `TypeError` at line 44. The strict panel path is
  untouched: same gates, same digest/options/source/validity
  checks, same `invalid` outcomes. `markdown` titles sweep reports
  as "not a balanced-panel verdict". The contract file is
  byte-unchanged; no `src/js` file changed.
- Mapping (exactly as pre-registered): won, entered, table
  (`table`, else `tableInvited`), national (`national`, else
  `nationalEver`, else rank-order of `maxRank`), playerDeaths
  (`player:`-keyed map sum, or count of `player`-flagged death
  records). All other contract metrics → null → `not_observed`.

Bars, judged exactly as pre-registered:
- B12-1: the exact 1215Z CLI attempt now writes a compare report
  (`.json` + `.md` under a /tmp prefix) instead of throwing.
- B12-2: all 3 policies (baseline, seatonly, seatwait), 8 paired
  cases each (seeds 74001–74008).
- B12-3: all 5 mapped metrics report pairs = 8 with delta 0 on the
  self-compare; all 24 unmapped metrics report `not_observed`.
- B12-4: synthetic genuine panel pair still compares through the
  strict path (cases = 1); an options mismatch is still `invalid`
  with an `Unmatched days` error; contract untouched; zero
  `src/js` changes (`git diff --stat` shows only the two
  instrument files).
- B12-5: existing recorder proofs still pass (tbstarts validator
  10 PASS, d94 proof 44 PASS — see below); repo quick check result
  recorded in Proof.

One honest clarification (not a bar change — no bar named a
decision): the self-compare's overall decision is
`review_required`, not `no_material_signal`, because the shared
`compareMetric` engine counts `not_observed` as review-triggering
(the same rule that makes a strict panel with a null metric
review-triggering). Status census on the self-compare:
descriptive 3, no_material_signal 12, not_observed 72, and zero
change/regression signals. A partial compare must not claim a
clean bill — `review_required` here means "24 metrics unobserved",
nothing more. The CLI therefore exits 2, which is its existing
contract for any non-clean decision, and the report is still
written. The first proof run expected `no_material_signal` and
failed on exactly this point; the proof expectation was corrected
to the engine's documented semantics (the pre-registered bars
never named a decision, so no bar moved).

### B16 — GO (all four bars met)

What changed (instruments only):
- `scripts/policies/tbstarts-diag.js`: new `startAlienCombat`
  wrap recording the same start-row shape as `startCombat`
  (`via: 'startAlienCombat'`, `alien: true`, same pre/post id,
  token, fighter-list, refused-token rule, throw counting, and
  active-call index so a duel that settles inside its own start
  call still joins its end). No `src/js` change; the game's own
  `tele('combat_start', {alien: true})` event was left alone —
  the gap was in the function-wrap census, and that is where the
  fix sits.

Bars, judged exactly as pre-registered:
- B16-1: live duel start recorded — proof harness loads a real
  game (seed 73671), installs the recorder, calls
  `startAlienCombat` with the module-built fighter
  (`apBuildFighter('sarge', 4, 4)`), and gains exactly one start
  row whose postId matches the live fight and whose fighter list
  carries the hostile 'sarge' fighter. The startCombat-only
  control view shows no `startCombat` row for the fight — the
  pre-fix recorder would still miss it, exactly as the d94 corpus
  shows.
- B16-2: the duel's `tbEnd` row joins the new start row by fight
  id AND by recorder token — both joins the d94 end failed.
- B16-3: recorder errors 0 before, during, and after the duel;
  no throws recorded; the wrapped call's return value is the
  live fight object, untouched.
- B16-4: zero `src/js` changes; `test-tbstarts-a.js` (validator
  10 PASS) and `test-d94-a.js` (44 PASS) still pass;
  startCombat/tbEnd/tbBarrierExit wraps untouched (the diff to
  tbstarts-diag.js is purely additive: header note + the new wrap).

Old corpora are historical and stay as-is: the d94 end in the
tbstarts corpus remains unmatched in that file (it predates the
fix), which is correct — a regenerated corpus with the new
recorder would carry the matching start row. No resweep was run
for this instrument fix; a full 180-day resweep would only
regenerate a corpus, not change the verdict.

## PROOF

- `node scripts/test-instruments-gap-b12.js` — B12 proof:
  31 PASS, 0 FAIL (API self-compare, policy/case counts, mapped
  pairs + deltas, unmapped not_observed, mixed-shape + garbage
  invalid, strict panel pair + mismatch, CLI end-to-end with
  /tmp output).
- `node scripts/test-instruments-gap-b16.js` — B16 proof:
  16 PASS, 0 FAIL (live game load, recorder install, module-built
  fighter, duel start row + control view, tbEnd join by id and
  token, zero errors/throws).
- `node scripts/test-tbstarts-a.js` — tbstarts validator:
  10 PASS, 0 FAIL (unchanged recorder behavior for ordinary
  fights).
- `node scripts/test-d94-a.js` — d94 classification re-derived
  from the historical corpus: 44 PASS, 0 FAIL (the old corpus
  still shows the miss, as it should — it predates the fix).
- `node scripts/check.js --quick` — started, but still running with
  no output after ~14 minutes (its output is pipe-buffered and the
  suite is long; the green list holds only one balance-adjacent
  test, run separately below). It was stopped rather than left
  hanging, and it is NOT claimed as a gate here: the task's
  regression bars are the targeted proofs above, all green.
  The parent's merge process runs its own checks before ship.
- `node scripts/test-trap-balance-20261010.js` (the green list's
  one balance-adjacent test) — ALL GREEN.
- `git diff --stat`: only `scripts/lib/balance-scorecard.js`
  (+98/−2 area) and `scripts/policies/tbstarts-diag.js` (+70)
  changed; `scripts/balance-metrics.json` untouched; zero
  `src/js` changes. New files: the two proof scripts above.

## METRIC REVIEW

- B12: the pre-registered bars held, with one proof-expectation
  correction disclosed above (decision `review_required` on a
  partial compare is the engine's honest semantics, not a miss).
  No metric re-scored; no bar moved after seeing results.
- B16: metrics held as written. One scope note for the NEXT run
  (not this one): other startCombat-wrapping censuses in the repo
  (compchan, compresence, dayfreeze, feastconv) still do not see
  direct-build duels. They were deliberately left alone here —
  extending every census is a separate item, and the d94 finding
  names the tbstarts census. A future arm that needs duel counts
  from those censuses should extend them the same way or route
  them through the `combat_start` telemetry event, which the game
  already emits on this path.
- No other metric doubts. Nothing here changes what any game
  measurement means — both fixes only let existing instruments
  see inputs they previously crashed on (B12) or missed (B16).

## WHAT REMAINS / FOLLOW-UP

- Parent handles merge + ship; this branch is committed and NOT
  pushed, NOT version-bumped, NOT live-verified (per assignment).
- Suggested follow-up (not this worker's scope): extend the other
  startCombat-wrapping censuses to the direct-build path, or
  document that duel counts come from tbstarts-diag only.
- Suggested follow-up (not this worker's scope): a future arm
  that wants a full §15 panel verdict from a sweep corpus still
  needs real panels — the sweep-corpus compare is a partial
  compare by design (24 metrics unobserved) and never substitutes
  for one.
