# sim-food-economy-round-1430-b — coordinator evidence (loop B, 2026-10-27)

Run: fleshout-loop-b-20261027T1430Z. Axis: food-economy (second
non-converged axis; loop A had no live lock or claim at run start, and
the race guard says never take the topmost when A timing is uncertain).
Loop A 1315Z landings (scalegate, defiantdoor) NOT touched. Base at run
start: master 60e260dc0 (journey crisis r57, instrument only).

## Arms (both measurement only, zero src/js, both LANDED, merged locally pending ship)

### Arm 1 — sim-raidday100-general-b: GO (backlog line 1224)
Prereg d07987ce7 (committed before any sweep, after rebase), evidence
611202b91. Fresh judged sweep of seed 20118 (competent-nofeast, 100d
death-aware) under a focal-or-taken generalization of the raidday100 GO
clauses. The 1330Z judge-b corpus was NOT re-scored.
- (a) Re-verified on the fresh sweep: daysAlive 100, survived,
  lastSnapDay 100, demand day 99, take day 100. Counts match judge-b
  exactly (inflow 257, meal draws 1,336, deaths 2, dried events 120).
- (b) PASS (generalized): the day-100 take touches one focal-or-taken
  row — Canned soup (taken item), raid100 = 1,000. No focal row touched;
  no longer a failure under this prereg.
- (c) PASS, non-vacuous: the taken row closes exactly — rBResidual = 0
  with the adjustment.
- (d) PASS: without the adjustment the row is off by exactly the raid
  amount (WITHOUT +1,000 vs WITH 0); dried 0 = raid100D.
- (e) PASS (focal control, taken row excluded): named 0/15,660, generic
  −191/382,626 (0.050%), dried 0/132,518 — all under the raiddor bars.
- (f) PASS: proof scripts/test-raidday100-general-b.js GREEN 40/40
  post-rebase on merged master, including the rewritten section 3d
  passing non-vacuously on the taken row.
- Honest limit (carried, not hidden): under the new wording (b) is
  satisfied by the taken row itself whenever a take is recorded — the
  discrimination lives in (c)'s exact-0 rule and (d)'s exact identity,
  both exact here. A focal-row demonstration on its own terms remains
  unshown; it is an optional future arm, not a gap in this verdict.
- Recorder fidelity: judged trajectory is a sweep-instrument trajectory
  (death wrapper suppresses the original Game.registerDeath); faithful
  TRACE_FULL replay reproduces demandDays [99] / takeDays [100] exactly.
- The judge-b NO-GO stands for the OLD focal formulation; this GO is
  for the generalized formulation only.

### Arm 2 — sim-cultnest-b: NESTED (backlog line 1225)
Prereg f486b43b4 (before any replay), evidence a7055539. Proof
scripts/test-9954cultnest-b.js 97/97, re-run green on merged master.
- Both meal draws execute INSIDE the cultivate useAbility span that
  creates direct record seq 124, in one monotonic event order:
  evt 241 span enter (day 35) → evt 242–243 draw seq 466 (player meal,
  2,200 kcal) → evt 244–245 draw seq 474 (commons raid, 1,620 kcal) →
  evt 246 span exit, record seq 124 created (day 36).
- The day-35 vs day-36 puzzle is settled as H1 (span crosses a day
  boundary): garden work's tickAction(16) runs the day budget out inside
  the span, endDay fires (meals + raid), the day rolls to 36, and only
  then does the stockdoors wrapper read the day for the record. The
  record's day-36 date is a post-span read, not the span's date.
- Nothing else happens inside the span; the other 11 cultivate spans
  in the run create no record — only the span that swallows an endDay
  creates a diff. Code read agrees with the replay (no disagreement).
- Fix target SETTLED, documented, NOT landed (follow-up arm): the
  phantom count is the directRecords useAbility diff; the meal draws
  are real. The summing ledger (analyzer) must de-duplicate: for any
  draw whose entry falls inside a useAbility span, count its kcal once
  under the meal-draw record and exclude those exact items
  (key-matched, never amount-matched) from the containing directRecord's
  summed kcal, retaining the record flagged as span-duplicate for
  audit. Scope is by span, not by ability name — any action long
  enough for night to fall inside it inherits that night's meals and
  raids. Follow-up verification bar (stated in arm evidence): re-run
  the family ledger on the same 9954 corpus and show the generic
  residual at 0 with seq 124 flagged at 0 summed generic kcal and no
  other record changed.
- Canon note: no docs/ canon doc covers garden cultivate; the operative
  design text cited is the gardenCultivation.js module header plus
  abilityActions.js useAbility, stated as such in the arm evidence.
- Out-of-scope gaps noted in arm evidence only (not chased): the
  span-draw class beyond cultivate, and an unjudged pantryDraw
  over-draw observation (seq 474 wants 1,468, takes 1,620 — plausibly
  best-fit whole-piece overshoot, not asserted as bug or feature).

## Wall numbers
- Raidday100 judged seed (fresh, n=1): national/table/wins 0/1, wave 2
  max, waves 3–5 0/1, median survival 100d. Deaths 2: ambush (day 7),
  "the night" (day 81). Closing pantry 110,054 kcal.
- Cultnest reused corpus (no new band): raidcallers numbers stand —
  pilot national-or-better 6/8, confirm 9/12, table 0/20, wins 0/20;
  seed 9954 itself: wave 4, national, survived 100 days.
- The scale wall stands: these arms measure ledger legs; neither moves
  national/table/wins. The full seat and wave 5 remain unreached in
  this run's judged material.

## Village assessment (plain words)
Two ledger questions that have been hanging over the food books are now
closed with numbers, not hunches. First, the raid tax that lands after
the day-100 snapshot is real and now counted exactly: Andre of
Thornfield's unanswered day-99 demand became a day-100 take of four
cans of soup — 1,000 kcal out of a six-figure pantry, a tax, not a
famine — and the ledger closes to zero on it once the adjustment is
applied. Second, the village never lost that night of food twice: the
garden magic ran so long the day ended mid-task, the village ate and a
raid took its cut while the magic was still in hand, and two counters
both wrote the night down. The meal counter was right; the magic
counter double-tallied. The fix is to make the summing ledger count a
night's meals once, key by key — a follow-up arm's job, with its
passing bar already written down.

## Sense-testing note
Both arms read transcripts/replays rather than counts alone: the
raidday100 arm re-verified the demand/take story on the fresh sweep,
and the cultnest arm walked the event order (span enter → meals →
raid → span exit) to settle which count was phantom. No villager
dialogue was in scope for these ledger arms; nothing robotic was
sampled or hidden — the arms' scope is stated, not papered over.

## Metric review
- Raidday100: the generalized wording's (b) is weaker than the focal
  (b) by construction — it counts the taken row. That is the point of
  the arm (the mechanism was already exercised in substance), and the
  verdict's strength rests on (c) exact-0 and (d) exact identity, both
  of which are exact here. A future focal-row arm may still be run;
  it must pre-register its own wording and sweep fresh.
- Cultnest: the walk proves nesting, not which count is phantom, on its
  own — the direction argument (pantryDraw return lists vs inferred
  diff; 200-kcal/bed cost vs a 3,820 diff) is what names the direct
  diff as phantom. If a future nesting-direction proof reversed it,
  the row stays closed; only the fix target changes. Stated here so
  the follow-up arm does not mistake the direction argument for the
  nesting proof.
- Balanced panel (§15): no corpus-ingest mode for paired per-seed
  ledger corpora (prior rounds' finding, repeated here); no panel
  artifact faked. The pre-registered thresholds are the judge.

## Telemetry deviation check
`node scripts/telemetry-check.js --baseline .../telemetry-baselines/scale-wall.json
--current 'evidence/2026-10-27/sim-raidday100-general-b-corpus/*.json'
--metrics national,table,wins,exiled` → 3 LOUD lines (national 12→0,
table 16→0, wins 16→0, n=1), all the KNOWN regime-artifact class
(WINSEAT baseline vs pre-seat competent-nofeast judged corpus);
no exiled LOUD line. Baseline NOT rolled.

## Infrastructure
- No EPERM flap blocked this run's writes. Worktree registration slow
  (~2–4 min/tree, sibling I/O contention, same class as 1330Z).
- Safe-commit index clobber hit both workers' commits — repaired via
  HEAD-blob cacheinfo each time, commits verified correct before
  landing. No clobber on the coordinator commit (verified below).
- Merge order: cultnest merged ff-only first (a7055539); raidday100
  branch then diverged, rebased clean onto the new master in its own
  worktree (611202b91), proof re-run green post-rebase, then merged
  ff-only. No force, no merge commits.
- check.js --quick NOT re-run: zero src/js across both arms; arm proofs
  are the attributable verification (1016Z/1130Z/1230Z/1330Z precedent).
- Sibling note (NOT this run's, left alone): main tree carries other
  runs' stale worktrees with uncommitted changes (sim-leg2drift-b,
  sim-belongcost-b, panel-contract-rulings, sim-fullpantry-casecount-b,
  sim-finalloss-a, journey2-crisis) — never touched, never released.
- Origin/master ancestry verified at run start (master 60e260dc0 was
  the landing base for both branches); ship loop owns pushes.

## Next blanks, in order
1. Ability-span de-duplication rule arm: implement the cultnest rule in
   the summing ledger, verify on the 9954 corpus (residual 0, seq 124
   flagged at 0 summed generic kcal, no other record changed).
2. Optional focal-row raid arm: a take touching a focal row under a
   focal-only prereg, fresh sweep (do NOT re-score this run's corpus).
3. The 0530Z carried blanks, still open: garden-attributed deposits
   with zero garden harvest, starting-stock draw order,
   spoilage-boundary split (meal vs cook), ~5,900 kcal non-draw
   removal day-82/83.
4. A treeline give/overrun band (seeds where holds fail).
5. Span-draw class beyond cultivate (cultnest evidence note).

food-economy stays converging (NOT converged): the raid adjustment is
now exercised under a generalized GO and the 9954 row's mechanism is
proved nested with its fix target settled, but the de-duplication fix
itself is unlanded and the carried blanks stand. scale-onramp stays
converging (untouched; sibling loop A). Claim deleted; lock deleted.
Merged locally, pending ship.
