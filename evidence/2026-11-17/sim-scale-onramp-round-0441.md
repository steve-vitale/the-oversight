# sim-scale-onramp-round-0441 — COORDINATOR EVIDENCE (Loop A run fleshout-20261118T0441Z, axis scale-onramp)

**Run:** fleshout-20261118T0441Z · **Axis:** scale-onramp (converging) · **Loop:** oversight-flesh-out-loop
**Arms:** sim-notickfix-a-adopt (adoption of the dead 0241Z run) + sim-notickfix3-a + sim-seedattach-a
**Master at closeout:** 4f9bdba2a (seedattach merged; notickfix-a + notickfix3-a HELD on their branches)
**Claim:** `hidden_files/lever-claims/fleshout-20261118T0441Z.json` (deleted at closeout) · **Lock:** deleted at closeout.

## STALE-LOCK RECOVERY (run start)

Lock `fleshout-20261118T0241Z` (created 2026-11-18T02:40:42Z) was ~119 min old at 04:39Z — past the
90-min fallback — and its only registered tree (sim-notickfix-a) had a heartbeat of 02:41:28Z (~118 min
stale). No coordinator process was visible. Dead per the guard; lock deleted, claim retired to
`.DEAD` with a note, and this run proceeded. Loop B was live the whole run (0330Z claim, closed
mid-run with both arms landed as 4e9fdda99; new 0430Z claim at 04:55Z, arms launchparty-b +
expedroster-b + fightgate-scope-b) — NOT touched.

## Adoption of the dead 0241Z run (axis scale-onramp)

The 0241Z coordinator died after landing two of its three arms and before writing round evidence.

- **sim-closekind-a — LANDED already** (on master as eb6ff8a27 + prereg ecfab8269): deaths-first
  closeKind recorder fix, finding #2508 FIXED.
- **sim-aguard-a — LANDED already** (on master as 7f9ff9c94 + prereg 840fd8339): shared firstNameOf
  guard, finding #2509 FIXED [needs-eyes].
- **sim-notickfix-a — HELD, NOT merged.** BUILD NO-GO, CONCEPT-DEAD (part-≥2 deferral shape).
  Coordinator verification: proof test re-run on the branch tip, 33 passed / 1 failed — the sole
  failure is the honest C5 frozen-bar miss (wave-4 launch events 18 → 17); all other checks green.
  The branch's `src/js/villager-brain.js` change must NOT land (the worker's own evidence says so).
  Worktree clean, heartbeat refreshed 2026-11-18T06:27:40Z; branch kept for its evidence + corpora.
  Numbers (band 103521–103528, PROFILEGATE=1, 150d): primary no-tick 8 → 0 PASS; launches
  instances 3 = 3, events 18 → 17 FAIL; footprint 428 deferred bids; median ratio 1.17, starvation
  5 → 3 PASS; panel `review_required` PASS; D1/D2 GREEN.

## Arm 1 — sim-seedattach-a: RECORDER FIX GO, PATCH, MERGED

Finding #2523 (seedattach closeKind uses a different mechanism than the shared churn block, same
blind spot unchecked). Probe of all 20 epoch closes on the two frozen corpora against the deaths
array, prereg frozen before any probe, no fresh sims (both corpora already carry full deaths
arrays). **PATCH — 4 closes mislabeled** (2 distinct instances × 2 legs): mateo_alvarez, seed
100874, died day 139 "the wild" (the scholar himself), and diana_osei, seed 100876, died day 47
"a wound that wouldn't close" — both read `plan-deleted`, corrected to `holder-died`. Every
`plan-deleted` close in the corpus was a mislabel (2 → 0 per leg, `holder-died` 0 → 2). Mechanism
correction vs the prereg's hypothesis: the census does NOT stop on death — it keeps emitting
`holderAlive:false` rows to the horizon, so the missing row at `runEndDay+1` is a horizon artifact,
not a deletion; the patch's scoped window + live-row guard is what keeps the 4 later-death
`stage-left-hunt` closes standing (a literal any-death rule would wrongly flip them). No past
verdict moves (buckets/subs byte-identical both legs; sim-seedattach-a DIAG-GO stands). The frozen
`evidence/2026-11-15/seedattach-a-analysis.json` was deliberately left as the before-oracle.

Proof: `scripts/test-seedattach-a.js`, **74 passed / 4 failed** — coordinator re-ran on the branch
tip AND on merged master, identical tally both times. All 6 new #2523 checks green. The 4 failures
are pre-existing stale statics from sibling landings, verified by the coordinator on master:
the "exactly 2 hunt entries" anchors in win-plan.js / villager-brain.js now count 3 (sibling added
second-companion `cplan2` hunt writes at win-plan.js:657, villager-brain.js:1176) and the
competent-policy sha drifted (74a890f0844e → df9b7dff4de4, journey landings r127/r128/r140).
They are NOT caused by the patch. Finding #2516 filed for the stale taxonomy anchor (re-read
owed, not silently bumped). The worker's evidence/prereg headers named run
fleshout-20261118T0330Z (Loop B's run) — corrected to 0441Z by coordinator addendum 4f9bdba2a
(and in the findings file); no metric or bar changed. The worker's commit message says
"proof 74/74 new+existing"; the true tally is 74 passed / 4 failed as recorded here.

Merged: prereg e426c2ed3 + fix/evidence e66cfe1d0 + coordinator addendum 4f9bdba2a, ff-only to
master 4f9bdba2a. Tree released done-merged, worktree removed, branch deleted. Main tree clean.

## Arm 2 — sim-notickfix3-a: BUILD NO-GO, CONCEPT-DEAD (deferral shape, both scopings), HELD

The named next-run revision of the dead part-≥2 shape: defer ONLY part-3 `party_launch` commits.
Fresh band 103531–103538 (verified fresh across all preregs + dated evidence), PROFILEGATE=1 both
legs, 150d death-aware, frozen bars committed before any sims. Coordinator verification: proof test
re-run on the branch tip, **34 passed / 3 failed** — the 3 failures are the honest frozen-bar
misses (C5/C6/C8); units/static 23/23 green (part-3 held, part-2 writes, part-0/1 write, launchable
commit still launches, voice lines + firstNameOf verbatim, profilegate reverted).

| Bar | Baseline → Armed | Result |
| --- | --- | --- |
| 1. Primary: no-tick = 0 (contact ≥ 1) | 14 → 0 | PASS |
| 2. Launches held | instances 7 → 1, wave-4 events 48 → 2 | FAIL |
| 3. Footprint cap ≤ 25 | 97 deferred bids | FAIL |
| 4. Cost: median ≥ 0.8×, starvation ≤ base+2 | median ratio 0.759; starvation 5 → 8, arm-only 1 → 4 | FAIL |
| 5. Panel not `regression_signal` | `review_required` | PASS |
| 6. D1/D2 | both GREEN | PASS |
| 7. Trajectory control | first divergence ≥ first deferral, all 8 seeds | PASS |

Autopsy: the launch collapse is concentrated in seeds 103534 (29 → 0) and 103537 (14 → 0); the
wave-4 instance population shrank 22 → 7; all 4 baseline-surviving villages died (survived 4 → 0).
No deferral stands in front of any launch and no holder dies — the recovered evening actions
(water, chores, visits) reshuffle trajectories from the first deferral week (first deferrals
d33–d54, 63 of 97 bids targetless hunt plans) and the wave-4 plans never come together. Scoping
tighter (428 → 97 bids) made the launch loss WORSE (18 → 17 became 48 → 2): **the reshuffle is
the mechanism, not the scope. The deferral concept is now dead in both scopings.** The no-tick edge
itself (finding #2498) remains open: demonstrated cost one lost part-3 action per late bid, plans
re-bid or depart within two days anyway. Any future fix candidate must scope to the exact no-tick
population (not every late bid) or accept the hold as the price of a stable trajectory — a new
arm's design question, not a re-score. No 12–16-seed confirmation follows a NO-GO pilot.

The branch's `src/js/villager-brain.js` change must NOT land. Worktree clean, heartbeat refreshed
2026-11-18T06:22:53Z; branch kept for its evidence + corpora. Note: the worker's evidence/prereg
headers name run fleshout-20261118T0241Z "(continued)" — that is the dead adopted run; this arm
ran under fleshout-20261118T0441Z. The held branch was left as the worker wrote it; this file
carries the correct run_id. Sense-testing: total silence again (270 vetSays lines, 13 keyword hits
all stock broadcast lines; no deferred holder speaks).

## Wall (this run's judged corpora)

| Corpus | National standing | National rank | Table | Wins | Wave 4 | Wave 5 | Survived |
| --- | --- | --- | --- | --- | --- | --- | --- |
| notickfix3 base 103531–103538 | 3/8 | 0 | 0 | 0 | 8/8 | 3/8 | 4/8 |
| notickfix3 armed | 1/8 | 0 | 0 | 0 | 8/8 | 1/8 | 0/8 |
| notickfix base 103521–103528 | 3/8 | 0 | 0 | 0 | 8/8 | 3/8 | 3/8 |
| notickfix armed | 2/8 | 0 | 0 | 0 | 8/8 | 2/8 | 3/8 |

The wall did not move: no table, no wins anywhere; wave-5 unlocks exist but no launched party has
killed a wave-4 beast on any band this run judged. Seedattach changes no wall number (closeKind
feeds no wall metric).

## Telemetry deviation check

REFUSED recorder-corpus input by design — `node scripts/telemetry-check.js` against the
notickfix3-a armed per-seed corpus: "refusing recorder-corpus input: all 8 --current rows carry
top-level anchorCommit, so they are sweep recorder rows, not runs." Same documented refusal as
the 1729Z/2025Z/2030Z/2230Z/2315Z/0026Z/0112Z/0221Z runs. Baseline NOT rolled.

## Infrastructure

- Write flap ~05:05–05:08 UTC: the notickfix3 baseline driver's `writeRobust` left seed 103531's
  tmp file at 0 bytes and fell back to stdout piped through `tail` (lost). Recovered by identical
  re-run; summary matched the original in-memory run exactly. Recorded in prereg Correction 1.
- VM replacement SIGTERM'd the notickfix3 armed-leg driver at 7/8 seeds; seed 103538 re-run alone
  and landed cleanly (0 `@@FALLBACK`). Corpora complete 8/8, 0 instrument errors.
- `check.js --quick` was started by the notickfix3 worker but killed after ~9 min idle (0:01 CPU)
  behind a sibling's concurrent run; the proof test (full game load via sim-harness, 34/37 with the
  3 failures being the frozen-bar misses) stands as verification. The coordinator did not re-run
  the ~26-min quick check.
- Safe-commit index clobber struck both seedattach worker commits; repaired via the
  `ls-tree -r HEAD | update-index --add --index-info` pipe, commits verified byte-identical.
  It also struck the coordinator's seedattach addendum commit path (verified clean after).
- Worktree registration slow (~4.4 min + ~3.6 min: registry-lock contention + slow checkouts).
  No EPERM flap on registrations this run.
- Master moved twice under the run: Loop B 0330Z closeout (4e9fdda99, zero overlap with either
  arm) and the seedattach merge itself (4f9bdba2a). The notickfix3 branch base (6aaf09a26) is an
  ancestor of master, so the held branch stays valid with no rebase needed.
- No rebase stop-at-pick quirk (no rebases — the merged arm was already on current master tip;
  the held arm needs none).

## Metric review

- **Primary bars (no-tick 8 → 0 / 14 → 0):** both measured what the fix was built to do, and both
  fixes did it completely. Contact was real on both bands. No instrument doubt.
- **Footprint cap (notickfix3: 97 vs cap 25):** the cap as frozen counts score ROWS, but the diag
  population it was calibrated against (~8–14) counts frozen-classifier INSTANCES — a plan
  re-bidding across many evenings contributes one instance but many rows. Unit error, noted, does
  NOT change the verdict: bars 2 and 4 fail independently by wide margins. A future arm that
  wants a footprint bar should freeze it in instance units, or count distinct
  (seed, holder, plan) triples.
- **Launches (48 → 2):** the miss is real (hand-counted depart rows, frozen analyzer), but its
  mechanism is trajectory reshuffling from the fix's early, broad footprint, not a deferral
  blocking a launch. The bar as frozen counts band-level events across legs whose trajectories
  diverge from the first deferral week, so a reshuffle can swing the count by a lot on an 8-seed
  band; the prereg nevertheless froze "a single lost launch is a miss", and this miss is 46
  events, not a close call. No recalibration could rescue it.
- **Cost bar (median 0.759, starvation 5 → 8):** fails on all three legs. The fix starves nobody
  directly (recovered actions are water/chores/visits); the reshuffled villages die sooner and
  starve more. The panel's community-loss per-metric signal says the same thing.
- **Seedattach proof (74/4):** the 4 failures are stale statics, not verdict failures — triaged
  by the coordinator against master (cplan2 writes + policy sha drift). The test file's own
  commit message ("proof 74/74") overstates; the true tally is recorded here and in the arm
  evidence. Finding #2516 carries the re-read owed.

## Findings filed

- #2523 FIXED (seedattach deaths-first closeKind; 4 closes corrected; evidence
  evidence/2026-11-17/sim-seedattach-a.md).
- NEW #2516 (seedattach taxonomy anchor "exactly 2 hunt entries" no longer holds — cplan2 writes
  at win-plan.js:657, villager-brain.js:1176; competent sha drifted).
- NEW open entry: the part-3-only no-tick deferral is also CONCEPT-DEAD (reshuffle is the
  mechanism, not the scope); finding #2498 remains open with the new design question.
- The 0241Z claim was retired to `.DEAD` with a note; this run's claim + lock deleted at closeout.

## Convergence state

scale-onramp stays converging (NOT converged): the deferral concept is now dead in both scopings,
the seedattach blind spot is closed, but wins still come only through default-OFF courtship + seat
instruments, only through the lesser seat, wave 5 still 0 faced by a launched party, and no
launched party has ever killed a wave-4 beast on any band. The directive stands until the tracker
records this axis converged on measured evidence. Next blanks, in order: (1) range-0-holder
design call (Steve) — still open, with numbers; (2) hand-off recorder gap (#2510); (3) no-tick
edge (#2498) — new design question, not a re-scope; (4) seedattach taxonomy anchor re-read
(#2516); (5) launched-party damage wall — Loop B's territory, do NOT duplicate. food-economy stays
converging (parked); winnability chain stays converging (Loop B live on 0430Z, NOT touched).
Rotation left at 5 (convergence work does not cycle it).

## Files

- Adoption evidence (held branch): `sim-notickfix-a` — evidence/2026-11-17/sim-notickfix-a.md,
  prereg, corpora, proof scripts/test-notickfix-a.js (33/34 on re-run, sole failure honest C5).
- Arm 1 (merged 4f9bdba2a): evidence/2026-11-17/sim-seedattach-a.md + prereg,
  scripts/analyze-seedattach-a.js, scripts/test-seedattach-a.js (74/4, failures triaged stale).
- Arm 2 (held branch): `sim-notickfix3-a` — evidence/2026-11-17/sim-notickfix3-a.md, prereg
  (+ Correction 1), corpora, proof scripts/test-notickfix3-a.js (34/37 on re-run, 3 honest misses).
- This file: evidence/2026-11-17/sim-scale-onramp-round-0441.md.
