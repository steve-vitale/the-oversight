# sim-approachretest-b — the #1709 guardrail re-test was ALREADY RUN (twice); this arm verifies instead of re-running (Loop B run fleshout-loop-b-20261110T0122Z)

## Verdict

**NOT RUN — stale brief, verified. The owed re-test is already done, twice, and its verdict stands: NO-GO (guardrail breach, replicated). The combined variant stays blocked; the fallback mechanism is not killed.**

This run ran NO judged sims. That is a deliberate decision, not an omission, and it is the decision the task's own governing rules require:

- The brief orders a 12-seed guardrail re-test of the combined approachfall variant on band 99601–99612, "owed by sim-findings #1709", replicating approachbranch-a exactly. The brief's reading list is exclusively 2026-11-04 evidence. It does not mention sim-approachguard-b or sim-approachlive-b.
- Both exist, both ran that exact re-test, on that exact band, horizon (140d death-aware), variant (four gates, DPS_RACE off), and cost bar:
  1. **sim-approachguard-b** (Loop B, 2026-11-04 2235Z, anchor e44da039d8c7): NO-GO — totals armed 7 vs bar 3, player-flagged 2 vs 2 (pass), median 83d vs 88.8d (fail).
  2. **sim-approachlive-b** (Loop B, 2026-11-05 0930Z, anchor f4101562380d): NO-GO replicated — totals armed 6 vs bar 3, player-flagged 2 vs 2 (pass), median 83d vs 86.4d (fail). It also carried the #1708 direct-counter instrument and PROVED live firing (marks 5, repicks 3).
- The re-point section of this run's own body carries the standing rule: **no new measurement arm on an already-proven constraint unless it carries a new lever to test.** The guardrail breach is now a twice-replicated constraint; this brief carries no new lever. Approachlive finding #2 says it outright: "Do not re-run this band's guardrails a third time without a new lever."
- A third draw would not settle anything: the two existing panels already show the bars are noise-dominated at this scale (baseline starvation total 6 → 1 → 1 across the confirm, guard, and live panels with no policy change; armed median 83d on all three). A third panel's verdict would be a third draw from the same noisy distribution, not a cleaner verdict — and per the brief's own "this re-test IS the verdict, do not re-run after seeing it", iterating draws until one passes would be verdict-shopping.
- No prereg was written for a panel that will not run. Writing one and then not running it would be a false record; running a panel after writing it would be the forbidden third replication. The verification below is what this arm did instead, and it is fully proven (28/28 checks, see Proof).

What this arm DID do: (1) verified the gated code still exists verbatim on current master (worktree HEAD == main-tree master 74debf969); (2) re-derived BOTH prior panels' guardrail numbers independently from their per-seed corpus files (not from their summaries) — every judged number reproduces exactly; (3) re-derived the #1708 direct-counter totals from the approachlive corpus — live firing reproduces exactly; (4) re-read the live firing fight's transcript from the corpus for its own sense-test.

## Canon

No canon doc covers TB flee/approach fallback — verified again in this worktree: the fleerepair confirm already established that grep for flee/barrier in docs/CANON.md returns 0 hits, and what covers it instead is in-code law in src/js/game.js (tbBarrierExit) plus Steve's 2026-11-02 ruling that monsters do NOT flee while players CAN. Nothing invented. The geometry lesson (a TRUE approach geometry needs HP >= 35% and not-outmatched at fight start; the 99605 seq-2 loop was a flee-branch loop) is carried from sim-approachfire-b / sim-approachbranch-a and needed no re-derivation here.

## Verification 1 — the gated code still exists on current master

- Worktree HEAD 74debf969 == main-tree master 74debf969 (checked this run; no rebase was needed, no master move under this arm).
- `git diff HEAD` empty for scripts/policies/competent.js and scripts/policies/competent-approachfall-b.js (proven in the test).
- Gates present in competent.js: `approachFallbackOn()` (line 2772), `dirFleeOn` / `exitVerifiedFLEE` / `fleeRepairOn` (lines 2732/2739/2748), and the four direct counters `approachFallbackMarks` / `approachFallbackWaits` / `approachRepickSteps` / `approachStuckTurns` (lines 3897/3836/3820/3890), with the 3-stuck-turn mark threshold intact.
- Variant file scripts/policies/competent-approachfall-b.js is the exact combined variant from sim-approachfall-b: sets COMPETENT_DIRECTIONAL_FLEE, COMPETENT_EXIT_VERIFIED_FLEE, COMPETENT_FLEE_REPAIR, COMPETENT_APPROACH_FALLBACK, DPS_RACE off, requires ./competent verbatim. No substitution was needed and none was made.

## Verification 2 — both prior re-tests re-derived from per-seed files

Counting rule = the fleerepair confirm's (a death-tele record whose cause contains 'starv'; player-flagged = player === true). Median over per-seed days. Re-derived with /tmp/approachretest-rederive.js (read-only) and pinned by scripts/test-approachretest-20261109.js (28/28 ALL PASS).

### sim-approachguard-b (anchor e44da039d8c7, 24 files, single anchor on all 24)

| leg | starv totals | starv player-flagged | median survival |
|-----|--------------|----------------------|-----------------|
| baseline (12) | 1 | 0 | 111d |
| armed (12) | 7 | 2 | 83d |
| bar | baseline + 2 = 3 | 0 + 2 = 2 | 0.8 x 111 = 88.8d |
| verdict | FAIL by 4 | PASS, exactly at bar | FAIL by 5.8d |

GO required all three. Verdict re-derived: **NO-GO**. Matches sim-approachguard-b.md exactly.

### sim-approachlive-b (anchor f4101562380d, 24 files, single anchor on all 24)

| leg | starv totals | starv player-flagged | median survival |
|-----|--------------|----------------------|-----------------|
| baseline (12) | 1 | 0 | 108d |
| armed (12) | 6 | 2 | 83d |
| bar | baseline + 2 = 3 | 0 + 2 = 2 | 0.8 x 108 = 86.4d |
| verdict | FAIL by 3 | PASS, exactly at bar | FAIL by 3.4d |

GO required all three. Verdict re-derived: **NO-GO**. Matches sim-approachlive-b.md exactly — the breach replicates on a second independent panel, same shape.

Note on the totals bar's noise (both prior arms documented it, and the re-derivation confirms the shape): the SAME band's baseline starvation total moved 6 (fleerepair confirm, earlier master) → 1 (guard) → 1 (live) with no policy change, while the armed total is 7, 7, 6 and the armed median is 83d on all three panels. The breach replicates, but the bar's margin swings with the baseline's luck. Any future bar revision (e.g. an absolute floor) needs a new pre-registration approved by the coordinator/Steve — not applied retroactively here, and not a reason to run a third panel.

## Verification 3 — #1708 direct-counter instrument (live firing)

Re-derived from the approachlive corpus (evidence/2026-11-05/perseed-approachlive-b/), which carries the #1708 instrument (driver wraps policy.fight call-through, snapshots the policy's OWN ctx counters before/after every call, joins by fightId):

| leg | marks | waits | repicks | fights with marks |
|-----|-------|-------|---------|-------------------|
| baseline (12) | 0 | 0 | 0 | 0 |
| armed (12) | 5 | 0 | 3 | 4 |

Baseline marks 0 everywhere, so the counter cannot be a proxy artifact. The armed marks split as: 99606 seq 5 (marks 2, repicks 2 — true-approach exposure), 99609 seq 8 (marks 1 — true-approach exposure, then fled), plus two non-exposure fights (99601 moderator wave 2, marks 1; 99607 ducks wave 1, marks 1, repick 1). Waits 0 across all 24 legs — the wait branch still has NO live-sim exercise; the frozen-wait bound (10) stands untested. **#1708 is closed by measurement: live firing is PROVEN, by the policy's own counter, not assumed.** No future arm needs to re-prove that the fallback CAN fire live. (The instrument files — scripts/approachlive-bus-20261105.js, approachlive-driver-20261105.js — already exist in this worktree; this arm reused their design by re-derivation, not by re-running them.)

## Sense-test (SENSE-TESTING LAW): my own read of the live firing fight

Read from the corpus (approachlive-s99606-armed.json, exposure seq 5, algorithm, day 92, fighter petra_novak, HP 100, Hatchet range 1, monster at (4,6) never moving):

| turn | round | HP | action |
|------|-------|----|--------|
| 28 | 2 | 100 | tbPlayerMove(3,5) "No path there." |
| 29 | 3 | 100 | tbPlayerMove(3,5) "No path there." |
| 30 | 4 | 100 | tbPlayerMove(3,5) "No path there." MARK 1 |
| 31 | 5 | 100 | tbPlayerMove(6,2), lands (repick) |
| 32 | 6 | 100 | tbPlayerMove(3,5) "No path there." |
| 33 | 7 | 100 | tbPlayerMove(3,5) "No path there." |
| 34 | 8 | 100 | tbPlayerMove(3,5) "No path there." MARK 2 |
| 35 | 9 | 100 | tbPlayerMove(7,5), lands (repick) |
| 36 | 10 | 100 | tbPlayerMove(5,6), lands |
| 37 | 11 | 72 | tbPlayerStrike(m_0) |
| 38 | 12 | 35 | tbPlayerStrike(m_0), then dies |

Counters on this fight: marks 2, waits 0, repicks 2, stuck 6. This reads as a person: three failed tries is already patient, the fourth turn tries another way in instead of hammering the wall, and once adjacent the fighter fights every turn — including at HP 35 on the last turn. No sense veto fires. The fighter still died — a loop-breaker is not a survival guarantee — and the wait branch never runs here (a reachable tile exists both times), so the frozen-geometry wait-cycle caution remains untested in live shape, still an open design question, not a veto on this firing. My read agrees with approachlive-b's sense-test; I read the corpus turns myself rather than copying its verdict.

## Scale-wall numbers (REPORTED, not judged — and NOT fresh from this run)

This run ran no sims, so there are no fresh wall numbers from this run. The freshest measured wall numbers on this band are the approachlive panel's, re-derived by me from its per-seed corpus files (scaleMeasured 12/12 both legs, single anchor f4101562380d):

| metric | baseline (12) | armed (12) |
|--------|---------------|------------|
| wins | 0 | 0 |
| national reached | 0 | 0 |
| table reached (sat, end-state tableDone) | 0 | 0 |
| table invited (end-state tableWaiting) | 0 | 0 |
| wave-5 UNLOCKED (seeds with maxWave >= 5) | 1 (99606) | 0 |
| wave-5 kills | 0 | 0 |
| wave-4 linked kills | 6 | 6 (per approachlive-b's summarizer; my re-derivation script did not reproduce the linkage field — killRows carry no `linked` flag in this corpus shape — so this row is cited from the evidence, not re-derived) |
| median survival (days) | 108 | 83 |
| median standing (final) | 150 | 142.5 |
| survived to 140d | 1 (99604) | 0 |

Rank stayed 'village' on ALL 24 legs — the same standing-without-rank pattern the pilot, the confirm, approachbranch, approachguard, and approachlive reported. The scale wall is unchanged by this arm (as expected — a verification arm was never going to move the wall). Full seat still unwon, wave-5 kills still 0.

## Village assessment (plain words)

Nothing about the village's arc changes in this arm, because this arm changed nothing and measured nothing new: the villages in the two re-derived panels still mostly die (11 of 12 lost baseline, 12 of 12 armed in the live panel), combat deaths dominate, no win, no national, no table. What this arm adds is narrow and honestly bounded: it stops the loop from spending a third run re-proving a twice-proven cost. The two things the approach line was owed are both now on record with direct evidence — the fallback DOES fire in a live sim (five marks, three re-picks, two strikes out of a real blocked fight), and the combined variant DOES cost more than its bar allows on this band (twice: 7 vs 3, then 6 vs 3, with the median short both times). The blank filled is the verification itself: the brief's re-test is not owed any more, the gated code is still where the evidence says it is on current master, and the numbers check out when re-derived from the raw per-seed files. The blank documented is everything downstream — the variant's cost still cannot be pinned on the fallback specifically (four gates ride along), and the comparative kill claim (armed loops vs baseline loops on the same band) still needs a band whose BASELINE leg stages true-approach turns on the current tree, which 99601–99612 does not (baseline true-approach turns 0 in the live panel).

## Metric review (for the NEXT run, not a re-score of anything)

- This arm's non-run is itself a metric-review datum: the queue carried a stale item (brief drafted from the 2026-11-04 state; the 2235Z guard run and the 2026-11-05 live run landed after it). The coordinator should close sim-findings #1709 (re-test done twice, verdict NO-GO replicated) and reframe #1708 (live firing proven; what remains is the COMPARATIVE kill claim, which needs a baseline-screened band — see approachlive finding #3). Do not queue a third guardrail re-test of this band without a new lever.
- The next arms the evidence actually points at (both already named by approachlive, neither taken here): (a) a cost-attribution arm — single-gate legs (approach-fallback alone vs flee-repair alone) to learn whether the starvation excess belongs to the fallback or rides along with the other three gates; (b) a screen-first firing arm — screen the BASELINE leg for a band that stages >= 1 true-approach fight on the current tree, then run the armed leg against it. Either needs its own prereg; neither is this arm.
- The starvation-totals bar's noise is now a three-panel fact (baseline 6 → 1 → 1; armed 7, 7, 6; armed median 83d every time). Any future guardrail pre-registration on this band should report absolutes alongside the relative bar, and any floor (e.g. max(baseline + 2, 5)) needs coordinator/Steve approval in advance — never applied retroactively.
- TELEMETRY DEVIATION CHECK (run-book step 10): not run — there is no new corpus from this run to check. The prior arms' check attempts refused in the same tool-shape (recorder corpus vs run-shaped scale-wall baseline); the wall numbers above are reported directly from the measured per-seed scale fields, as they did.
- check.js --quick was NOT run: this arm adds no src/js, policy-default, or game-code change (one proof script + evidence only), per the confirm's/approachbranch's/approachlive's precedent. The relevant proofs are green (below).

## Findings for the coordinator (do NOT edit hidden_files from this arm)

1. STALE BRIEF — QUEUE HYGIENE: the #1709 re-test brief was drafted from the 2026-11-04 state and fired on 2026-11-09/10 after approachguard-b (2235Z 11-04) and approachlive-b (0930Z 11-05) had already executed it. The queue item should have been retired when the guard arm landed. Recommend the coordinator close #1709 in sim-findings.md (re-test done twice, NO-GO replicated) and reframe #1708 (live firing proven; comparative kill claim is the open item, needing a baseline-screened band). No third re-test of this band without a new lever.
2. NEXT BLANK (cost attribution, for whoever owns the variant): the combined variant's starvation excess cannot be attributed to the fallback specifically (four gates ride along; both re-tests recorded the same limit). An attribution arm needs single-gate legs — a new lever design, not another combined re-test.
3. NEXT BLANK (comparative kill claim): screen the BASELINE leg first — find a band (or policy x band combination) whose verbatim-competent baseline stages >= 1 true-approach fight on the current tree, then run the armed leg against it. The fleerepair corpus is not that band under the current master (live baseline: 0 true-approach turns in 62 exposures).
4. Wait branch untested live: waits 0 in 24 legs of the approachlive panel. The frozen-wait bound (10) is pre-registered and waiting for an all-adjacent-blocked board test.
5. Re-derivation caveat (mine, not theirs): my re-derivation script could not reproduce the "wave-4 linked kills 6 / 6" row — killRows in the approachlive corpus carry no `linked` field, so linkage is computed by the summarizer from exposures, not stored per kill. That row above is cited from sim-approachlive-b.md, not re-derived. Every judged number (starvation totals, player-flagged, medians, fallback counters) DID re-derive exactly.

## Proof

`node scripts/test-approachretest-20261109.js` — ALL PASS (28/28, exit 0). Coverage: all four gates + four counters present in competent.js on current master; variant file sets exactly the four gates, DPS_RACE off, requires ./competent verbatim; policy files unmodified vs HEAD; both corpora 24 files with a single anchor each; guardrail numbers re-derived to the published values for both panels (guard 1/0/111 vs 7/2/83; live 1/0/108 vs 6/2/83); both verdicts re-derived NO-GO; direct-counter totals re-derived (armed marks 5, waits 0, repicks 3, fightsWithMarks 4; baseline marks 0); live firing case 99606 seq 5 marks 2, repicks 2.

Sibling proof, no regression (this arm changes no policy or src file): `node scripts/test-approachlive-20261105.js` — ALL PASS (10 checks, exit 0), re-run this run; its smoke legs write into /tmp per the driver's OUTDIR override, so no corpus file was touched (verified: `git status` clean apart from this arm's own two files).

Heartbeat: `bash scripts/worktree-heartbeat.sh sim-approachretest-b` landed this run.

## Verdict (restated)

**NOT RUN — verified instead.** The #1709 guardrail re-test was already executed twice on the exact band, horizon, variant, and cost bar (approachguard-b NO-GO, approachlive-b NO-GO replicated); the #1708 live firing is already proven by direct counter (marks 5, repicks 3). A third run would violate the standing rule and add only noise. The combined variant stays blocked; the fallback mechanism is not killed. No default flip, no src/js change, no policy change, no push, no version bump, no live verification — those belong to the coordinator and the ship loop. Branch tip at report time: the evidence commit itself (below).

## Files

- Evidence (this file): evidence/2026-11-09/sim-approachretest-b.md
- Proof: scripts/test-approachretest-20261109.js (28/28 ALL PASS)
- Re-derived corpora (read, not re-run; untouched by this arm):
  - evidence/2026-11-04/perseed-approachguard-b/ (24 files, anchor e44da039d8c7)
  - evidence/2026-11-05/perseed-approachlive-b/ (24 files, anchor f4101562380d)
- Variant used verbatim (untouched by this arm): scripts/policies/competent-approachfall-b.js, scripts/policies/competent.js
