# sim-food-closeout-round-0915 — coordinator evidence

Run fleshout-20261108T0915Z, Loop A, axis food-economy (converging, NOT converged).
Stale-lock recovery of the 0615Z run + landing of its two ready arms + adoption of its
in-flight doublenight arm. Loop B live on scale-onramp/winnability the whole run
(0830Z claim: healerbisect-mid5 DONE + binddiag IN FLIGHT) — NOT touched.
Master at run start 32d2ace79; medicdiag landed onto 8bc721195 (ladder leg1 moved
master mid-run); cheaptend landed onto 3b9353fa8; master at landings close 32c47d41e.
Doublenight judged NO-GO and PARKED on branch sim-doublenight-a (tip fc252b249,
unmerged); master unchanged by it.

## Pre-registration (binding per MEASUREMENT.md §14)

- This is a CLOSEOUT/ADOPTION run, not a new lever experiment. No new GO thresholds
  are set here. The two landed arms are judged against their own pre-registered bars
  (recorded in their evidence files, unchanged): medicdiag DIAG-GO G1–G4 pass;
  cheaptend PILOT NO-GO (CONCEPT-DEAD + METRIC-BROKEN secondary). The doublenight
  arm is judged against its own prereg (evidence/2026-11-07/sim-doublenight-fix-a-prereg.md):
  0 fires after the fix, trajectory identity per clause 2, median >= 0.8x before,
  starveDays <= before + 2.
- Horizon/seeds/policies: per each arm's own prereg (medicdiag 8 seeds competent 150d;
  cheaptend 96301–96308 competent 150d; doublenight P1 8 seeds competent 150d + F1 confirm).
- Metric binding: no re-scoring. A miss is NO-GO; if a metric proves wrong it goes under
  "metric review" for the NEXT run.

## Stale-lock recovery

Lock fleshout-20261108T0615Z (created 2026-11-08T06:18:31Z, ~2h58m old at guard check)
read before deletion (run_id confirmed). Its trees' heartbeats were 70+ min stale
(sim-doublenight-a 08:06:23Z, sim-cheaptend-a 07:35:43Z); the doublenight worker was
done/timeout with no verdict; no live Loop A worker. DEAD per the 15-min guard and
the 90-min fallback. Lock deleted; claims retired to .DEAD with notes (0315Z: adopted
by 0615Z; 0615Z: 0-byte flap debris, arms in the tracker 0615Z entry). Own lock
fleshout-20261108T0915Z created 09:20:35Z; claim written before any sims.
Pre-flight: main tree clean (0 dirty), disk 29%, flap probe 3/3 OK, reap removed
nothing (6/16 active). Both adoption trees heartbeated fresh at 09:21:23Z.

## Arm 1 — sim-medicdiag-a (LAND)

DIAG-GO, ready since the 0615Z run (branch dfa8659b6, proof 8/8 on base 1cac498d5).
Coordinator landing (no new worker): fresh worktree sim-medicdiag-land-b attached to
the existing branch (register.sh cannot reuse a registered slug; manual `git worktree
add` + manual registry entry under flock, atomic tmp+fsync+replace — the 0530Z
precedent; entry released as done-merged after the merge).
- Rebased onto explicit master SHA 8bc721195 (ladder leg1 final gate note; master had
  moved from 32d2ace79 under the run — the stale-ref hazard, handled by re-reading
  master immediately before the rebase). 2 picks, no quirk stop, no conflicts
  (zero master-side touches to the branch's files since its base). New tip 3b9353fa8.
- Proof re-run on the rebased tip: node scripts/test-medicdiag-a.js — 8 PASS, 0 FAIL
  (L1 healer definition, L2 care never cures, L3 coverage accounting, L4 live leg
  neutral vs feveranat recorder on 96301+96302, L5 analyzer gates G1–G4).
- Merged --ff-only into master (master verified 8bc721195 immediately before the merge).
  Worktree released, branch deleted. Main tree clean after.
- Content: village-side care census (DIAG ONLY, zero src/js) — prereg, recorder/analyzer/
  proof, 8-seed medicDetail corpus + bare fingerprints. Verdict unchanged: cure channel
  ABSENT (0 cures / 0 treatVillager calls), 16.24 modeled deaths avoided, Haven Medic
  Duty named next arm.
- Evidence: evidence/2026-11-07/sim-medicdiag-a.md (on master via 3b9353fa8).

## Arm 2 — sim-cheaptend-a (LAND)

PILOT NO-GO, closeout finished by the 0615Z run (branch 623d8de25, proof 19/19 pre-rebase).
Coordinator landing in the existing tree sim-cheaptend-a (clean, heartbeated 09:21:23Z).
- Rebased onto explicit master SHA 3b9353fa8 (post-medicdiag tip). 8 picks, no quirk
  stop, no conflicts (zero master-side touches to the branch's files since its base
  f5cf45250; the docs/ONTOLOGY.md 15-line diff in master..HEAD was master-side ladder
  regeneration, brought in cleanly by the rebase).
- Proof re-run on the rebased tip: node scripts/test-cheaptend-a.js — 19 PASS, 0 FAIL.
- Merged --ff-only into master (master verified 3b9353fa8 immediately before the merge).
  Worktree released, branch deleted. Main tree clean after. Master now 32c47d41e.
- Content: cheap-tending shape (policy scripts/policies/cheaptend-a.js + sweep/analyzer/
  proof + corpora + §15 panels). Verdict unchanged: PILOT NO-GO, CONCEPT-DEAD +
  METRIC-BROKEN secondary (fever 0.057 -> 0.084, median 113d -> 83d; forage cost PASS).
  The §15 compare came back `invalid` (COMPARE-CONTRACT: wrapper-policy arms cannot
  match policies/cases) — a tooling-failure class, verdict untouched; repair route
  (rebuild the before-panel under the wrapper policy with the flag unset) is recorded
  in the arm evidence and stays open for the next food-economy run.
- Evidence: evidence/2026-11-07/sim-cheaptend-a.md (on master via 32c47d41e).

## Arm 3 — sim-doublenight-fix-a (ADOPTION — NO-GO, PARKED)

Worker report verified by the coordinator (branch tip, worktree clean, goBar read
from analysis.json, src/js diff inspected — not taken on the worker's word).
Branch tip fc252b249, worktree clean, all work committed. Verdict **NO-GO** per
the binding prereg; the fix does **not** land. Disposition: **PARKED, not killed,
not merged** (see below).

- Rebase: onto explicit master SHA 32c47d41e (read fresh from the main tree),
  clean 7/7, no sequencer quirk. Fix commit now dde5c0c75, identical diff
  (src/js/game.js 9 lines: endDay death branch falls through to shared
  day-advance + dawn). Master never moved again during the worker's run.
- Discarded: all 22 uncommitted stale after-files (written on superseded base
  a04a6c0fc, incl. 2 `.tmp-` flap remnants). The committed partial P1 trace0 7/8
  was re-run too — fresh files came out **byte-identical** (sha match), so nothing
  stale remains. Full AFTER sweep re-run fresh via the runner (24 seed-runs,
  ~5 min, all VERIFY OK attempt 1).
- GO bar vs the prereg (all must hold):
  1. **0 fires after — PASS.** 19 → 0 dedupe fires on all 16 judged seeds
     (P1 19→0, F1 0→0), 13,459 calls recorded, 0 unclassified, capture 100%.
  2. **Trajectory identity (Amendment A1) — PASS.** All 14 zero-fire seeds exact
     end-to-end (daysAlive, deathRows, mealRows); firing seeds exact before their
     first firing day (preDiffs 0); single-pass shape on both firing days
     (98028 d37: 10 rows, 98079 d10: 11 rows; after-rows are the before first-pass
     values).
  3. **Survival/starvation — FAIL on the starvation sub-bar.** Median daysAlive
     100.5 → 100.5 (ratio 1.0, PASS), but total starveDays **356 → 359, delta +3,
     bar ≤ +2 — missed by 1 day.** goBar.go=false. Not re-scored.
- The +3, investigated (not a real starvation regression): all 14 zero-fire seeds
  delta exactly 0. 98028: 8→18 (+10) while living 37 days longer (113→150,
  survived to cap); 98079: 22→15 (−7) while living 25 days shorter (147→122).
  starveDays counts village-days with anyone hungry, so longer-lived villages
  mechanically accumulate more. Starvation rate: **0.2176 → 0.2178 hungry-days
  per lived day** (lived days 1,636→1,648). The metric review in the arm evidence
  proposes a rate-based re-judge (or zero-fire-seeds-only) for the next run —
  no new sims needed, the corpora are complete and deterministic. The runner now
  refuses re-runs (`VERDICT-RENDERED: NO-GO` line is in the evidence).
- Per-seed before → after daysAlive (16 judged seeds): P1: 98067 85→85, 98052
  52→52, 98079 147→**122**, 98062 130→130, 98034 129→129, 98095 51→51, 98022
  94→94, 98028 113→**150** (survived to cap). P1 median 103.5→108.0. F1
  (17901–17908): 150, 61, 150, 89, 150, 85, 107, 43 — identical before/after
  on all 8.
- Proof: 70/70 PASS on the rebased tip, incl. live leg E (seed 98079: 0 fires,
  determinism vs after-corpus). No src/js touched this run (fix already committed
  in the branch), so check.js --quick was not run.
- Sense: after windows line-identical to before except Paola's death line is
  gone — her d10 dehydration death vanished exactly as the prereg predicted (she
  lives to d68 "the wild"); Dylan's d37 death row identical. No duplicated beats;
  normal nights unchanged. Dawn-header singularity rests on proof legs U1e/U1f +
  single-pass meal rows (the corpus records no dawn lines — stated honestly in
  the evidence).
- §15 panel-after done (head 597e61740, sourcesStable true); **compare decision
  "invalid"** — sibling harness churn between panel legs (sweep-compare.js
  cheaptend-a registration + 3 new sibling policy files). Rows directly compared:
  6 zero-fire seeds identical except stateHash (ladder bookkeeping fields in the
  hashed state). The cheaptend-a registration is the one this run landed on
  master — i.e. this run's own landing is what moved the harness between the
  doublenight panel legs. Second instance of the COMPARE-CONTRACT class;
  finding appended to sim-findings.md.
- **Substrate correction (coordinator's brief was wrong):** the brief said only
  conversation.js recap changes landed between bases. `src/js/ladder.js` (+494,
  new, wraps endDay with a daily ladderTick) also landed, plus a build.js stamp.
  The worker caught it: ladderTick is RNG-inert by code read (pure arithmetic,
  no Math.random), and clause 2 passing with zero pre-first-fire diffs confirms
  no drift empirically. The coordinator owns the wrong brief note; the arm's
  judgment is unaffected.
- PARKED (not deleted, not merged): the fix is proven correct on the two bars
  that measure correctness (0 fires, trajectory identity) and fails only a
  count-based sub-bar by 1 day that the evidence shows is mis-specified. The
  corpora are complete and deterministic — a re-judge under a rate-based bar
  needs no new sims, but only if the branch survives. Deleting it would force a
  full rebuild (~60 min of sweeps) for a re-judge the metric review explicitly
  proposes. The branch stays unmerged with no path to master except a future
  re-judge + landing decision. Exact resume step for the next run: re-run the
  analyzer's goBar under the amended (rate-based) bar on the committed corpora
  in evidence/2026-11-07/doublenight-fix-a-corpus-{before,after}/; if GO, land
  fix + evidence together; if the re-judge is rejected, delete branch
  sim-doublenight-a. Worktree removed at closeout (all committed); branch kept.
- Evidence: evidence/2026-11-07/sim-doublenight-fix-a.md (on branch
  sim-doublenight-a, tip fc252b249 — NOT on master), corpus-after analysis.json
  (goBar), doublenight-fix-a-panel.md/.json (compare invalid), panel-after.

## Wall numbers (scale wall — standing directive)

Landed arms are measurement/DIAG arms on competent-only 150d substrates, not
win-seeking runs; wall numbers from their judged corpora (unchanged from the 0615Z
closeout, which judged them):
- medicdiag corpus: national 0/8, table 0, wins 0, wave-5 reach 3/8, median survival 128d.
- cheaptend corpus: baseline median 113d / armed 83d, national 0/8, table 0, wins 0,
  wave-5 2/8.
- doublenight corpus (16 judged seeds, competent-only 150d): national 0, table 0,
  wins 0 (same before and after). Wave 5 on 98034 + 17901, wave 3 on 17908, wave 4
  on the other 13. Median survival 100.5d. Endings after: village-lost 12/16,
  survived-to-cap 4/16 (was 13/3).

## Telemetry deviation check

Run by the coordinator on the doublenight after-corpus (per-seed glob,
--sweep-rows, metrics national,table,wins,exiled):
`node scripts/telemetry-check.js --baseline hidden_files/telemetry-baselines/scale-wall.json --current 'evidence/2026-11-07/doublenight-fix-a-corpus-after/doublenight-fix-a-competent-s*.json' --metrics national,table,wins,exiled --sweep-rows`
- 3 LOUD lines: national 12→0, table 16→0, wins 16→0 (n=24 seed rows, 16 distinct
  seeds — trace0+trace1 pairs). All REGIME artifacts of a competent-only 150d
  measurement substrate vs the WINSEAT baseline; before→after is 0→0 on all three.
  Baseline NOT rolled, no investigation item.
- The medicdiag/cheaptend corpora were already checked by their own runs (3 LOUD
  lines each, same regime-artifact class; baseline NOT rolled).

## Metric review

- No re-scoring happened in this run: both landed arms were judged by their own
  pre-registered bars in their own runs; this run only re-verified (rebase + proof
  re-run) and merged. The doublenight verdict is judged by its own prereg, not by
  this file.
- Doublenight: the starveDays count bar (after ≤ before + 2) mis-specifies the
  quantity it claims to guard — starveDays counts village-days with anyone hungry,
  so a fix that lets a village live 37 days longer mechanically adds hungry-days
  (+10 on 98028) while the hungry-day RATE is flat (0.2176→0.2178) and the median
  is unchanged (100.5→100.5). The arm evidence proposes a rate-based re-judge
  (or zero-fire-seeds-only) for the NEXT run. This run does not re-score: the
  NO-GO stands and the fix stays parked. A bar that punishes longer life is the
  wrong bar for a correctness fix; the next run decides the amendment before
  re-judging, and judges only the committed corpora (no new sims).

## Infrastructure

- EPERM flap: probes 3/3 OK at run start (09:1xZ); the 07:39–08:01Z flap from the
  0615Z run had cleared. No flap block encountered during the landings.
- Full worktree checkout is slow under sibling load: the medicdiag-land-b checkout
  (84,397 files) took ~11 min (load ~5.3, four sibling loops active), stalling at
  71–81% for minutes before resuming. The 0530Z sparse-checkout note stands: a
  future register.sh should gain a sparse mode.
- Safe-commit index clobber: none on this run's coordinator commits (both landings
  were merges of worker branches). The doublenight worker hit it once after a
  commit — repaired via `ls-tree -r` + `update-index --add --index-info`, verified
  status empty + diff HEAD empty.
- worktree-heartbeat.sh hung once for the doublenight worker (120s) and landed on
  retry (36s). Coordinator heartbeats worked instantly (09:21Z).
- worktree-heartbeat.sh worked instantly twice (09:21Z) — no hang this run.
- Registry flock: the manual registry write for sim-medicdiag-land-b waited behind
  the checkout, not the flock; no contention observed.
- check.js --quick NOT re-run: zero src/js in either landed arm; the standing 280/7
  pre-existing profile was last recorded by the 2315Z/2215Z runs. [Update if the
  doublenight arm touches src/js — it should not; the fix is already committed.]

## Blanks filled or documented

- FILLED (landing): the 0615Z run's two ready-but-unmerged arms are now on master
  (medicdiag 3b9353fa8, cheaptend 32c47d41e).
- PARKED (fix proven correct, bar missed by 1 day on a mechanical artifact):
  doublenight, branch sim-doublenight-a tip fc252b249. Re-judge under a rate-based
  bar is the next blank for this arm (no new sims; committed corpora only).
- DOCUMENTED (still open, from the 0615Z next-blanks list): (3) Haven Medic Duty,
  the village-side care lever named by medicdiag G4; (4) the COMPARE-CONTRACT repair
  route for wrapper-policy panels — second instance this run (doublenight panel
  compare invalidated by this run's own cheaptend landing moving sweep-compare.js
  between panel legs). Neither was taken this run — the doublenight adoption filled
  the window.

## Convergence state

food-economy stays converging (NOT converged): the fever/wound→production link is
answered three ways (medicdiag census, cheaptend killed shape, doublenight fix proven
correct but parked on a 1-day bar miss), but no food-economy fix has landed from this
round — medicdiag is DIAG-only, cheaptend is killed, doublenight is parked pending a
re-judge decision. scale-onramp stays converging (untouched; sibling Loop B live).
Next blanks, in order: (1) doublenight re-judge under a rate-based starvation bar
(committed corpora only; land fix + evidence together if GO, delete the branch if
the re-judge is rejected); (2) Haven Medic Duty (medicdiag G4); (3) the
COMPARE-CONTRACT repair route.
