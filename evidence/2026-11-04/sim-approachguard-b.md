# sim-approachguard-b — 12-seed GUARDRAIL RE-TEST of the combined approachfall variant (Loop B run fleshout-loop-b-20261104T2235Z)

## Verdict

**NO-GO (guardrail breach) — the combined variant stays blocked.**

This arm judged GUARDRAILS ONLY, as pre-registered. Firing of the
approach fallback is already replay-PROVEN by sim-approachbranch-a.md
and was NOT re-judged here; loop/firing counts below are descriptive
only. A guardrail breach blocks landing the variant; it does NOT kill
the fallback mechanism.

- (a) starvation totals: armed 7 vs bar baseline + 2 = 1 + 2 = 3 → **FAIL by 4.**
- (b) player-flagged starvation: armed 2 vs bar 0 + 2 = 2 → **PASS, exactly at bar.**
- (c) median survival: armed 83d vs bar 0.8 × 111d = 88.8d → **FAIL by 5.8 days.**

GO required all three. Two halves failed, so the verdict is NO-GO
under §14 — a miss is NO-GO, never re-scored against a friendlier
metric mid-run. The variant as measured here is NOT landable. What
this does not decide: whether the fallback mechanism itself is at
fault. The panel variant carries all four gates and trajectories
diverge chaotically seed by seed (e.g. 99601: 116d baseline → 79d
armed; 99609: 113d → 127d), so the starvation excess cannot be
attributed to the fallback specifically — the same attribution limit
the branch arm recorded.

Convergence state: not converged — variant blocked pending a
coordinator/Steve decision (see Metric review). This is the second
consecutive guardrail breach on the starvation-totals half (branch
pilot: armed 7 vs bar 4; this re-test: armed 7 vs bar 3).

## Design (from the prereg, committed before any judged sim)

- Prereg: evidence/2026-11-04/sim-approachguard-b-prereg.md (commit
  e52c9fb4, before any judged sim; anchor note e44da039, also
  pre-sweep; GO bars unchanged by the note).
- Sweep anchor (driver-recorded in every corpus file): e44da039d8c7.
  All 24 legs share it; game + policy bytes identical between the
  prereg game base 3f92c4d3d and the sweep anchor (verified by
  scripts/test-approachguard-20261104.js, ALL PASS before and after
  the sweep). No pull/rebase mid-sweep.
- Band reuse BY DESIGN: 99601–99612 is the pre-stated confirm band
  named in sim-approachbranch-a.md's metric review. Trajectories are
  new (master moved since the confirm), so judgement is ONLY against
  this run's own baseline leg, never against the confirm's numbers.
  No other band was run; no substitution was needed.
- Baseline = scripts/policies/competent.js VERBATIM. Armed =
  scripts/policies/competent-approachfall-b.js VERBATIM (four gates,
  DPS_RACE off). Policy-side only: ZERO src/js changes, no
  gate/price/deed/standing change, no default flip. Verified before
  and after the sweep: `git diff HEAD` empty for both policy files,
  worktree hashes equal HEAD blobs.
- Horizon: 140 days, death-aware. Driver:
  scripts/approachguard-driver-20261104.js (copy of the branch
  driver, new corpus dir). Summarizer:
  scripts/approachguard-summarize-20261104.js (copy of the branch
  summarizer, same confirm counting rule: cause string containing
  'starv'; player-flagged = player === true).
- Balanced-panel note (§15, stated up front in the prereg): no
  balance-panel.js compare — the variant is not a registry policy.
  The comparison is the pre-registered per-seed table + summarizer
  aggregates, never a fabricated panel compare.

## Per-seed table (12 seeds, 140d death-aware)

starv = starvation deaths (confirm counting rule); starvP =
player-flagged subset; kills = linked TB wave-4 kills (summarizer
killsLinked); maxW = max wave unlocked; standing = final standing.

Baseline (competent verbatim):

| seed | days | end | starv | starvP | kills | maxW | standing |
| 99601 | 116 | lost | 1 | 0 | 0 | 4 | 125 |
| 99602 | 73 | lost | 0 | 0 | 0 | 4 | 120 |
| 99603 | 140 | survived | 0 | 0 | 1 | 4 | 215 |
| 99604 | 109 | lost | 0 | 0 | 3 | 5 | 225 |
| 99605 | 101 | lost | 0 | 0 | 2 | 4 | 245 |
| 99606 | 119 | lost | 0 | 0 | 1 | 5 | 235 |
| 99607 | 67 | lost | 0 | 0 | 0 | 4 | 175 |
| 99608 | 67 | lost | 0 | 0 | 0 | 4 | 100 |
| 99609 | 113 | lost | 0 | 0 | 0 | 4 | 245 |
| 99610 | 124 | lost | 0 | 0 | 1 | 4 | 125 |
| 99611 | 117 | lost | 0 | 0 | 2 | 4 | 175 |
| 99612 | 45 | lost | 0 | 0 | 0 | 3 | 70 |
| TOTAL / MEDIAN | median 111 | 11 lost, 1 survived | 1 | 0 | 10 | — | median 175 |

Armed (competent-approachfall-b verbatim):

| seed | days | end | starv | starvP | kills | maxW | standing |
| 99601 | 79 | lost | 0 | 0 | 0 | 4 | 145 |
| 99602 | 60 | lost | 0 | 0 | 1 | 4 | 150 |
| 99603 | 104 | lost | 1 | 0 | 1 | 4 | 225 |
| 99604 | 87 | lost | 2 | 1 | 1 | 4 | 175 |
| 99605 | 45 | lost | 0 | 0 | 0 | 3 | 75 |
| 99606 | 94 | lost | 0 | 0 | 0 | 4 | 140 |
| 99607 | 77 | lost | 0 | 0 | 1 | 4 | 200 |
| 99608 | 67 | lost | 0 | 0 | 0 | 4 | 100 |
| 99609 | 127 | lost | 0 | 0 | 1 | 4 | 205 |
| 99610 | 136 | lost | 1 | 0 | 2 | 4 | 175 |
| 99611 | 49 | lost | 1 | 1 | 0 | 3 | 50 |
| 99612 | 88 | lost | 2 | 0 | 0 | 3 | 140 |
| TOTAL / MEDIAN | median 83 | 12 lost | 7 | 2 | 7 | — | median 147.5 |

## Guardrail judgement (binding bars)

- (a) totals: armed 7 <= baseline 1 + 2 = 3? NO — FAIL by 4.
- (b) player-flagged: armed 2 <= baseline 0 + 2 = 2? YES — PASS at bar.
- (c) median survival: armed 83 >= 0.8 × 111 = 88.8? NO — FAIL by 5.8d.
- Overall: NO-GO. The variant stays blocked; the mechanism is not killed.

## Sense-test (pre-registered)

Armed starvation deaths read individually — all 7 are real
starvation tele records (cause "starvation", kind villager), not a
counting artifact:

- 99603 day 103, app_mgpspj12880 (non-player)
- 99604 day 85, visjoin_72 (non-player); day 86, hassan_ali (PLAYER-flagged)
- 99610 day 129, visjoin_122 (non-player)
- 99611 day 20, gen_b0mmq68 (PLAYER-flagged) — the one early outlier;
  a player-character starving on day 20 is early-game food pressure,
  still a real record under the pre-registered rule. Excluding it
  would not change the verdict (armed 6 still > bar 3).
- 99612 day 62, owen_smith; day 64, benoit_lambert (both non-player)

Baseline's single starvation death is likewise real: 99601 day 115,
visjoin_71 (non-player).

Fight transcripts read (one armed, one baseline), judged for meaning:

- Armed 99606 seq 5 (day 92, vs the algorithm beast): the only armed
  fight with approach-classified turns. A full-HP fighter spends
  rounds 2–8 trying to close on a beast holding at (4,6), targeting
  tile (3,5) again and again, then loses the fight. It reads as a
  person doggedly pressing in on an unreachable beast, not as a robot
  swapping one loop for another — but the effort does not save the
  fight, and the village still loses. (Descriptive only; firing is
  not judged here.)
- Baseline 99604 (14 fights): a long, mixed arc — 3 wins (a strike
  fight, an influencer fight, a eulogy fight on day 107) against 11
  losses, with the village still reaching wave 5. Varied monsters,
  mixed outcomes, no robotic repetition in the outcome shape.

Nothing robotic flagged. The sense finding that matters is the
starvation shape itself: armed villages do not starve in one place
or at one moment — the deaths spread across 5 seeds and days 20–129,
which reads as broad food-pressure churn under divergent
trajectories, not a single broken food interaction.

## Scale-wall numbers (reported every run, NOT judged)

| metric | baseline (12) | armed (12) |
| wins | 0 | 0 |
| national reached | 0 | 0 |
| table reached | 0 | 0 |
| wave-5 unlocked (maxWave >= 5) | 2 (99604, 99606) | 0 |
| wave-5 kills | 0 | 0 |
| wave-4 kills (linked TB) | 10 | 7 |
| wave-4 field fights (fieldCallsW4 total) | 60 | 40 |
| wave-4 spawns (spawnsW4 total) | 103 | 82 |
| median survival | 111d | 83d |
| survived to 140d | 1 (99603) | 0 |

All per-seed scale fields measured (scaleMeasured 12/12 both legs);
nothing hard-coded. No village in either leg reached national or the
table; the full seat stays unwon on this band, as on the pilot.

## Village assessment (plain words)

The baseline villages lived longer and reached further: one village
survived the whole 140 days, two unlocked the fifth wave, and the
typical village lasted 111 days. The armed villages died sooner
(typical 83 days, none surviving to 140) and none unlocked the fifth
wave, even though their final standing was only modestly lower
(median 147 vs 175). Both sets of villages fought hard and mostly
lost: baseline villages won 10 linked wave-4 kills across the band,
armed villages 7. The armed villages also starved more — seven
villagers starved across five villages, against one in the baseline
villages — and that starvation, plus the shorter lives, is exactly
what the guardrails caught. In plain terms: on this band, the
combined variant's villages were hungrier and shorter-lived than
the plain competent villages, and they got less far up the climb.
That is a guardrail failure, not a claim that the fallback idea is
wrong — the fallback itself was proven to fire in replay, and this
panel cannot say which of the four carried gates, if any, moved the
food outcomes.

## Metric review

- The bars were honored as pre-registered; no re-scoring happened.
  The verdict stands on the bars as written.
- The starvation-totals bar is noisy at this scale, and this run
  proves it twice over: the SAME band's baseline starvation total
  moved from 6 (confirm corpus, earlier master) to 1 (this run) with
  no policy change at all — pure trajectory churn from master
  moving. The armed total, strikingly, is 7 on both the branch pilot
  and this re-test. A bar of baseline + 2 therefore swings with the
  baseline's luck: on the pilot it was 4, here 3. Proposal for the
  NEXT run (not this one): keep the guardrail, but report the
  absolute totals alongside the relative bar, and consider a
  floor (e.g. bar = max(baseline + 2, 5)) only if Steve/coordinator
  approves it as a new pre-registration — do not apply it
  retroactively to this verdict.
- The median-survival bar flipped for the same reason: the armed
  median is 83d on BOTH the pilot and this re-test, but the baseline
  median rose 93.5d → 111d, moving the bar from 74.8d (pass) to 88.8d
  (fail). The armed villages did not get shorter-lived; the baseline
  got longer-lived. Same proposal as above: report absolutes, and
  let the next pre-registration decide whether a relative median bar
  is the right guardrail shape.
- Descriptive loop counts (NOT judged): baseline old approach steps
  0, armed old 6 / approach 6, all on armed 99606 seq 5; true loops 0
  both legs. No old approach loop appeared anywhere in this panel's
  baseline leg — the trajectories that used to loop simply did not
  recur on the moved master.
- Canon note (from prereg): no canon doc covers turn-based flee;
  what covers it is in-code law in src/js/game.js (tbBarrierExit)
  and Steve's 2026-11-02 ruling that monsters do NOT flee while
  players CAN. This arm changed no src/js and no flee law.

## File list

- Prereg: evidence/2026-11-04/sim-approachguard-b-prereg.md
- This evidence: evidence/2026-11-04/sim-approachguard-b.md
- Corpus (24 files, new dir, no confirm/branch file overwritten):
  evidence/2026-11-04/perseed-approachguard-b/approachguard-s99601..99612-{baseline,armed}.json
- Summaries: evidence/2026-11-04/approachguard-summary-baseline.json,
  evidence/2026-11-04/approachguard-summary-armed.json
- Sweep logs: evidence/2026-11-04/approachguard-sweep-baseline.log,
  evidence/2026-11-04/approachguard-sweep-armed.log
- Driver: scripts/approachguard-driver-20261104.js
- Summarizer: scripts/approachguard-summarize-20261104.js
- Proof test: scripts/test-approachguard-20261104.js (ALL PASS
  before and after the sweep)
- Policies untouched (verified): scripts/policies/competent.js,
  scripts/policies/competent-approachfall-b.js
