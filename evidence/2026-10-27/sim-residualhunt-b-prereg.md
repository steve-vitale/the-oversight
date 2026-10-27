# sim-residualhunt-b — PRE-REGISTRATION (written BEFORE any judged sweep)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261027T0530Z, axis
food-economy. Arm: hunt the stockdoors leg-3 residuals (DIAG/measurement
only, zero src/js changes, no default flips). This arm does NOT re-judge
the stockdoors NO-GO — its verdict is ONLY whether the hunt traces the
residuals. Judged ONLY against this prereg.

## Question (verbatim from the coordinator's assignment)

Stockdoors (branch sim-stockdoors-b, tip b55b484ec, NOT on master) closed
the generic family (0.198%) and the dried channel (0.70%) but failed leg
3a: named-family pass rate 9/12 vs the 80% bar. Failing named
family-seeds: Muscadine 9824 (+1,800), Burdock 9824 (+1,800), Lamb's
Quarters 9825 (+1,130). Also generic fail 9822 (+3,177) and 9825 Fish
catch over-explanation (+2,016). The 9824 pair (same round number, both
largely untouched by the new doors) is the prime suspect for a single
unrecorded 1,800-kcal flow or boundary artifact. Hunt them.

## Step 0 (done BEFORE this prereg's judged sections — base identification)

The stockdoors corpus was NOT reproducible from its branch tip by its
own proof (fresh seed-9820 runs: 240/1247/3/155 vs committed
255/1249/4/163; trajectories agree through day 42, fork day 43).
Step 0 result, established before this prereg was written:

- Fresh seed 9820 on current worktree code (stockdoors instrument
  vendored, see below): inflows/mealdraw/deaths/driedEvents =
  240/1247/3/155, stockdoor 656, direct 22.
- Same run with src/js/game.js temporarily replaced by the
  e69842153 version (throwaway only: backed up outside the repo
  first, restored after, `git diff HEAD -- src/js/game.js` verified
  empty, NEVER committed): 255/1249/4/163, stockdoor 640, direct 23 —
  and the full per-seed payload is BYTE-IDENTICAL to the committed
  stockdoors corpus seed-9820 JSON excluding `ms`.
- CONCLUSION: the reproducing base is the PRE-c04d4e0cb game.js
  (blob b2ba423afdfbdce8c98751ef544f10805b46cfa6, i.e.
  e69842153:src/js/game.js). The hypothesis in the coordinator's
  blocked-landing note is CONFIRMED: the stockdoors corpus is a valid
  measurement ON THAT BASE (the branch was rebased onto c04d4e0cb
  without re-running the proof). The judged sweep below runs on that
  pinned base: game.js temporarily swapped in, sweep + proof run,
  game.js restored, cleanliness verified. The pin is never committed.

## Band (substrate identical to stockdoors)

- Policy competent-nofeast: COMPETENT_FEAST=0, SEATDRIVE=0,
  PLENTYDEPRI=0, DEPOSITGATE=1, FEASTSCALE_R13 off (env asserted FATAL
  in the runner, same as stockdoors).
- Pilot seeds 9820–9827 REUSED as substrate (the stockdoors pilot band
  — stated, no freshness claim). Horizon 100d, death-aware.
- No confirm band is spent by this arm: the hunt judges only the
  pilot substrate. Seeds 9768–9779 remain unspent for stockdoors
  purposes (as the blocked-landing note records, they are
  spent-but-unjudged worktree scratch from the 0049Z run's
  post-commit rerun — NOT this arm's to judge or spend).

## Instrument (DIAG only, vendored, attributed)

Vendored read-only from branch sim-stockdoors-b (tip b55b484ec) under
residualhunt names; the stockdoors branch is untouched, and no file
under a stockdoors name is committed here (that would collide with
the later stockdoors landing):
- scripts/stockdoors-capture-residualhunt.js (branch
  stockdoors-capture.js, header attribution only — body identical).
- scripts/sweep-residualhunt-b.js (branch sweep-stockdoors-b.js;
  adaptations ONLY: output dir/file prefix, mode string, staging dir,
  capture require).
- scripts/analyze-residualhunt-b.js (branch analyze-stockdoors-b.js;
  adaptation ONLY: default corpus dir + header; ledger math identical).
- scripts/test-residualhunt-b.js (branch test-stockdoors-b.js;
  adaptations: corpus dir, sweep name, analyzer require,
  allowed-modified set, and the hygiene check's pinned-base allowance:
  src/js/game.js may differ from HEAD ONLY if its blob equals the
  PINNED_GAMEJS_BLOB env value).
- scripts/trace-residualhunt-b.js (NEW, this arm): snapshot-sequence
  ledger trace. It reconstructs the analyzer's NEW-definition family
  ledger over the spoilDays snapshots (opening + each entry, in
  order), attributes each transition's flows by record day (interval
  (prevDay, snapDay]), and reports step divergences, the cumulative
  divergence series, the first persistent step (after which the
  cumulative divergence never returns to zero), and the itemized
  flows of a ±2-transition window around it. Flows dated after the
  last snapshot day are reported separately as POST-HORIZON flows
  (counted in the ledger, never reflected in closing); the identity
  analyzerResidual = withinHorizonCumDiv − postHorizonNet is checked.
  Known trace behavior (validated on passing family-seeds before the
  judged sweep): snapshot/flow day numbering lags by ~1 transition
  (inflow and draws on the same day are reflected in different
  transitions) and cancels within the horizon on closing families —
  so single-transition steps are NOT verdicts; only persistent steps
  and post-horizon flows are.
- Reused UNCHANGED from this worktree (byte-identical to the branch's
  copies, verified by diff): scripts/inflow-capture.js,
  scripts/mealdraw-capture.js, scripts/spoilvol-capture.js,
  scripts/driedpath-capture.js, scripts/stockdoor-capture.js.
  Zero src/js files touched, zero sibling capture files modified.

## Method

1. Judged sweep (8 seeds, pinned base) → corpus
   evidence/2026-10-27/sim-residualhunt-b-corpus/.
2. Analyzer on that corpus: reproduce the stockdoors legs (expect
   9/12 named, 7/8 generic, dried 0.70% — the same corpus, the same
   instrument, the same base; any deviation is reported, not hidden).
3. Trace script on the failing family-seeds (Muscadine 9824, Burdock
   9824, Lamb's Quarters 9825) and the reported-not-judged items
   (generic 9822, Fish catch 9825). A family-seed counts as TRACED
   iff the trace names the specific records (or the specific boundary
   mechanism with the specific records) whose kcal sum equals the
   residual exactly; a decomposition whose dominant component is
   exact and whose remainder is itself itemized (even if the
   remainder's ultimate cause stays open) is reported as
   traced-with-open-remainder, NOT hidden, and the verdict below
   does not hinge on it.
4. Proof (test-residualhunt-b.js) on the pinned base, then restore
   game.js and verify cleanliness before any commit of evidence.

## GO threshold (pre-registered exactly as assigned)

GO iff (a) step 0 identifies the reproducing base with seed-9820 counts
quoted, AND (b) at least 2 of the 3 failing named family-seeds are
traced to named flows or boundary artifacts with per-record evidence,
OR the 9824 pair is traced to a single flow (which alone would flip
the rate 9/12 to 11/12 on the reproduced base). A miss is NO-GO, never
re-scored against a friendlier metric mid-run; metric doubts go under
a "metric review" section for the NEXT run.

## Reported, not judged

- The 9822 generic +3,177 and the 9825 Fish catch +2,016
  over-explanation (direct-recorder portion rule): traced and
  reported, but NOT part of the GO threshold.
- The stockdoors NO-GO verdict itself: NOT re-judged here. Whatever
  the hunt finds is a metric-review input for the NEXT ledger run
  (e.g. a closing-snapshot or boundary-aware ledger definition), not
  a retroactive re-score of stockdoors.

## Canon read

docs/CANON.md + docs/PRESERVATION.md, plus the stockdoors evidence,
prereg, and the coordinator's blocked-landing note (all read before
writing this prereg). The food ladder (cleaned→cooked→smoked→rendered
→pemmican) and the "no nonsensical calorie loss" rule are the canon
background for the dried channel; this arm changes no canon.
