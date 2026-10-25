# sim-food-round-1530 — coordinator evidence (axis food-economy, loop B)

Run: fleshout-loop-b-20261025T1530Z (Sun 2026-10-25, loop B, second axis).
Axis: food-economy (converging). Sibling run fleshout-loop-b-20261025T1531Z
live on scale-onramp (arms poolpres-lever-b + belltoad-cand3-b) for the whole
run — NOT touched; its claim and lock were still live at closeout.

This run took the 1430Z food-economy next blanks (1) and (3) in order, as two
MEASUREMENT-ONLY arms (zero src/js, zero new sims, existing corpora only).
No village was newly simulated this run; the village assessment below is the
audited record of villages already measured, in plain words.

## Arm 1 — sim-causebase-audit-b (commit 02d16dd66): PARTIALLY SATISFIES

Question (1430Z blank 1): does the landed pooled baseline sim-causebase-b
(commit f810314b8: 570 kind-filtered villager deaths, 6 competent corpora)
already satisfy the "pooled baseline cause list before any 'new death mode'
guardrail reuse" blank, or is a new corpus still needed?

Pre-registered criteria C1–C7, judged only against that header. Reproduction:
the landed analyzer re-run is byte-identical to the committed baseline JSON
(1,302 rows, 0 kind exclusions, 732 scholar exclusions, 570 villager deaths,
48 labels, per-corpus villager deaths 40/65/71/22/247/125, seedOverlap []).
Landed test-causebase-b.js re-run: ALL LEGS PASS. New
test-causebase-audit-b.js: ALL LEGS PASS. No analyzer counting bug found;
the analyzer was deliberately not modified.

Verdict: PARTIALLY SATISFIES. C1–C5 pass (reproduction, scale, scholar/
villager separation, seed disjointness, guardrail usability). C6 fails: the
committed JSON carries no substrate metadata (no policy, horizon, or flags),
so a future arm holding only the JSON cannot verify comparability, and the
analyzer exits 0 with no warning on a different-substrate directory. C7 is
partial: the tail is quantified (26 singletons + 8 doubletons = 34/48 labels
at n<=2; 4 labels sit at the 32-char truncation edge, all singletons) but
exact-match comparison mishandles truncated near-misses.

No new corpus is needed for in-scope reuse: the tracker blank is closed for
competent-scope guardrail reuse. It survives only as a scope extension for
non-competent / longer-horizon arms, which need their own pooled list and
their own N calibration, not this list's N=3.

Worked guardrail examples (in the arm evidence): a real tableseat-nowait
deathcensus baseline side compares at 27 villager deaths, with genuine
other-substrate labels ('Nevermore', 'The Suburb') at n=1 correctly unflagged
as churn; a synthetic 19-death arm flags an absent label at n=4, churn-only
at n=2, and a starvation share shift (10/19 = 52.6% vs pooled 8.6%).

Single most important caveat, binding on future arms: "absent" from this
baseline means only "not observed among 570 kind-filtered villager deaths on
competent policy, 150d, PLENTYDEPRI=1, DEPOSITGATE=1" — never "new to the
game." Sharpest proof: 'the arena' killed the scholar 613 times in these
very corpora yet appears zero times as a villager death, so a future
villager 'the arena' death at n>=3 would flag as "new" even though it is the
commonest death label in the data. Arms must cite the full scope line in
their evidence header and check scholar-only / other-substrate labels
before calling any flagged label a new mode.

## Arm 2 — sim-rotcompanion-b (commit 9b0563200, rebased onto 02d16dd66)

Question (1430Z blank 3): build the rot+deprioritized per-village-day
companion metric as the pre-registered primary for the NEXT rot question,
so no future deciding corpus is judged on the ratio alone (the ratio
rewards a denominator blowup: rotragged-b showed down-moves driven by pd0
rot rising 2.8x–10.6x, not by depri-side improvement).

Metric (pre-registered before computing): for each anchor/side/seed,
absolute rot per 100 village-days = (rotFreshKcal + rotPreservedKcal) /
daysAlive * 100, reported separately for pd0 and pd1 beside the ratio
r = pd1/pd0. A step counts as a genuine improvement only if pd1 absolute
rot falls (or stays flat); a ratio fall driven by pd0 absolute rot rising
is classified DENOMINATOR-DRIVEN, and a split move is MIXED (reported
distinctly, never folded into genuine). The companion NEVER replaces
scripts/govern-verdict.js; it qualifies the governing verdict.

Demonstrated on both existing corpora (no new sweeps; standing verdicts
NOT re-judged):
- Primary leg2decide (9266–9281): counts genuine 2, identical 9,
  degenerate 1, denominator-driven 3, up 1. Median absolute rot pd0
  72,687 -> 95,572 (rose), pd1 18,706 -> 21,545 (rose).
  Companion-if-STEP = DENOMINATOR-DRIVEN.
- Cross-check rotdecide-govern (9310–9325): counts degenerate 4,
  identical 5, genuine 1, denominator-driven 1, mixed 2, up 3. Median
  absolute rot pd0 28,452 -> 39,139 (rose), pd1 21,445 -> 24,118 (rose).
  Companion-if-STEP = DENOMINATOR-DRIVEN.
- Pooled across the 9 down-moves on both corpora: genuine 3,
  denominator-driven 4, mixed 2. Standing verdicts stand unchanged:
  leg2decide STEP CONFIRMED 0.404x; rotdecide-govern STEP (CONTESTED)
  0.645x — the companion qualifies their reading, it does not overturn
  them.

Proof: test-rotcompanion-b.js all assertions passed, on the rebased branch
and on merged master. The arm's check.js --quick attempt is INCONCLUSIVE,
not a pass and not a failure: the worker's own 300s shell timeout wrapper
killed it before the failure report, and the single visible F was never
identified. It cannot be from this arm's files: check.js --quick runs only
quick-tagged green-list jobs plus godpath tests, and none of this arm's
three files appears in either list (verified 0 matches). The ship loop's
full check run, not this arm, should identify that one F.

Remaining limitation the next rot arm must still solve: haul-vs-preserve
cause is still unmeasured in these files — the companion metric shows
WHICH side of the ratio moved, not WHY villages preserved or hauled
differently. The arm evidence carries the verbatim pre-registration
template the next deciding rot run must copy (definition, verdict rule,
degenerate handling, what to report).

## Village assessment, in plain words

No new village was simulated, so there is no new village to describe — and
that is the honest shape of this run: it audits the record instead of adding
to it. What the record now says, plainly: (1) villages die in ways we can
now guardrail against, but only if future measurers cite the exact patch of
ground the guardrail was built on — a death that looks brand-new may just be
a scholar's death wearing a villager's coat, or a table-road death measured
against a pantry-road list; (2) the famous preserver improvement, read
through absolute rot instead of the ratio, is mostly villages whose plenty
side rotted MORE, not villages whose deprioritized side preserved better —
three genuinely better villages against four denominator-driven ones and
two split ones. The next rot question must be asked in absolute terms, or
it will keep rewarding rot.

## Wall numbers (analyzed corpora only — NOT new measurements)

Leg2decide / rotdecide corpora (SEATDRIVE=0 pre-seat regime): national
59/64 and 55/64, table 0, wins 0 (structural — no seat instrument in the
substrate), wave 5 0, median survival 100d capped. Causebase corpora
(competent-only): national/table/wins 0, as expected for a seatless
substrate. The scale wall is unmoved by these levers, as expected — they
are measurement instruments, not reach levers.

## Telemetry deviation check

`node scripts/telemetry-check.js --baseline .../telemetry-baselines/scale-wall.json
--current 'evidence/2026-10-24/leg2decide-b-corpus/*.json' --metrics
national,table,wins,exiled` returns 3 LOUD lines (national 12 -> 59,
table 16 -> 0, wins 16 -> 0; n=68 files, the glob also picks up the 4 sweep
summaries beside the 64 per-seed files). All three are the known
WINSEAT-baseline vs pre-seat-substrate regime artifact class, identical to
the 1430Z/1630Z/1735Z readings on this corpus family. Baseline NOT rolled,
no new investigation item.

## Balanced panel / metric review

No balance-panel compare .md is attached: balance-panel.js is a live-sim
observer instrument with no corpus input and cannot compare recorder
corpora (seventh sighting of the known ingestion class). The arms'
pre-registered analyzers, coordinator-reproduced on merged master, are
this run's comparison. Metric reviews in each arm evidence file: (a) the
audit arm's review asks whether "pooled cause list" is the right guardrail
instrument at all — its answer is yes for in-scope reuse, with the scope
line as the load-bearing part; (b) the companion arm's review finds the
companion fixes the ratio's failure mode (denominator blowup now visible)
but still cannot attribute cause — the next rot arm needs haul/preserve
action counts the per-seed files do not carry.

## Infrastructure

No EPERM flap blocked this run's ref writes. Worktree registrations slow
(~2 min each) under sibling load, all succeeded. Safe-commit index clobber
hit the causebase-audit worker commit (repaired by the worker via cacheinfo,
commit verified correct); no clobber on the rotcompanion worker commit, the
coordinator merges, or (see tracker) the coordinator evidence commit.
Merge sequence: causebase-audit merged --ff-only first; rotcompanion
rebased onto it inside its own worktree (arm diff identical to the worker
commit), proof re-run green, then merged --ff-only. Post-merge proofs on
merged master: test-causebase-audit-b ALL LEGS PASS,
test-rotcompanion-b all assertions passed. Sibling 1531Z run (scale-onramp)
still live at closeout — its trees, claim, and lock untouched; its landing
may move master under this run's merged commits, which is normal and needs
no action from this run. check.js --quick NOT re-run by the coordinator:
zero src/js in either arm, and loop A's 1226Z addendum already attributed
the standing 8 quick failures to pre-existing causes; the rotcompanion
worker's inconclusive quick attempt is recorded above, not hidden.

food-economy stays converging (NOT converged): the pooled-cause guardrail
blank is closed for competent-scope reuse and the next rot question now
has a pre-registered companion metric — but no food-economy lever moves
the scale wall, the haul-vs-preserve cause is still unmeasured, and the
scope extension for non-competent / longer-horizon arms is still open.
scale-onramp stays converging (untouched; sibling run).

## Next blanks, in order

(1) Scope extension: a pooled cause list for non-competent / longer-horizon
substrates (tableseat-nowait first), with its own N calibration — NOT a
reuse of the competent list's N=3. (2) The rot companion template adopted
verbatim by the next deciding rot corpus, plus haul/preserve action counts
in the per-seed files so the next question can attribute cause, not just
direction. (3) Machine-readable scope metadata in the causebase JSON
(audit C6) so a future arm holding only the JSON can verify comparability.

Claim deleted; lock deleted. Evidence: evidence/2026-10-25/sim-food-round-1530.md
(coordinator) + sim-causebase-audit-b.md + sim-rotcompanion-b.md (commits
02d16dd66, 9b0563200).
