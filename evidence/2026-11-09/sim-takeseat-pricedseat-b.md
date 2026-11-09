# sim-takeseat-pricedseat-b — verification of the landed pricedseat repair (evidence)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261109T1030Z, axis
scale-onramp / winnability chain. Worker tree:
~/workspace/worktrees/sim-takeseat-pricedseat-b, branch
sim-takeseat-pricedseat-b. Base: master `8419eefa4` (verified by
`git log --oneline -1` after a clean rebase; no conflicts). Scope:
VERIFICATION only — the repair this brief describes was already
landed on master by the 0630Z run (see below). ZERO src/js, ZERO
analyzer/lib changes in this worktree. No new sims: the verification
re-judges the existing committed corpora.
**Verdict: GO on prereg bars 1–4.** The proof test is 33/33 green,
the three analyzer verdicts reproduce the landed repair's record
exactly on current master, and the six sweep-pair judged values are
byte-identical to their goldens. Two regression suites miss their
recorded counts on current master — the takeseat and feareddoor
analyzer suites' LIVE legs fail on seed 53001 — for a PRE-EXISTING
cause (the landed sit-drive rebaseline moved that seed's trajectory;
see Regression results). That is recorded as a finding, not
re-scored, and it is not a miss on any of bars 1–4. The retained
measurement-proof staleness the prior run recorded still holds on
`8419eefa4` (same cause, same tests). Full pre-registration
(binding): evidence/2026-11-09/sim-takeseat-pricedseat-b-prereg.md.

## What was found on arrival (no repair to apply)

Commit `9d6ebf59c` ("sim-pricedseat-b: takeseat analyzer earned-count
repair via pricedSeatOf") IS an ancestor of master `8419eefa4`
(verified with `git merge-base --is-ancestor`). Its evidence
(`evidence/2026-11-09/sim-pricedseat-b.md`), prereg, and proof test
(`scripts/test-pricedseat-b.js`) are on this base. Code read confirms
the repair present: `scripts/lib/seat-taken.js` `pricedSeatOf`
prefers `row.finalSeatPriced` and falls back to `row.finalSeat`, and
all three analyzers carry `finalSeatPriced: pricedSeatOf(o)` on each
analyzed row and count substrate-sanity `baseSeats` from
`r.finalSeatPriced`. The defect the brief describes (takeseat
sanity bar counting TAKEN seats as EARNED, 0/8 vs recorded 5/8) is
gone on this base. This run therefore re-verified the landed repair
independently rather than re-applying it; the only commits in this
worktree are the prereg and this evidence file.

## Before / after (pre-repair record vs re-verified on 8419eefa4)

Pre-repair values are the sim-pricedseat-b before-record; the
re-verified values are this run's direct analyzer re-runs on the
same corpora, same seeds:

| analyzer | pre-repair overall | pre-repair `baseSeatsEarned` | re-verified overall | re-verified `baseSeatsEarned` |
|---|---|---|---|---|
| takeseat (8 seeds) | NO-GO (substrate) | 0/8 | **GO** | **5/8** |
| feareddoor (12 seeds) | NO-GO | 5/12 | NO-GO | **6/12** |
| darkwit fresh pair (8 seeds) | NO-GO | 5/8 | NO-GO | 5/8 (unchanged) |

Per-row earned/taken on the known corpora (through the repaired
`analyzeSeed` / `pricedSeatOf`, re-derived this run from the analyzer
outputs):
- takeseat baseline 5/8 earned + 0/8 taken; armed 5/8 + 5/8.
- darkwit 53201-baseline leg 3/8 earned + 0/8 taken (per-row read —
  `perseed-darkwit-b-armed` does not exist, so the darkwit analyzer
  cannot run on its defaults; verified by the proof test's
  known-darkwit-53201 checks).
- feareddoor seed 53210, both legs: earned 'lesser', taken 'none'.
- feareddoor baseline 6/12 earned + 5/12 taken.
- darkwit fresh baseline 5/8 earned, fresh armed 6/8 earned;
  sittings **5/8 → 2/8** — the corrected expectation from sweep-b's
  metric review (the conflated 0/8 → 5/8 expectation is NOT used),
  invited 5/8 → 6/8.

## Analyzer re-runs (bars 1–3) — verdicts as computed on 8419eefa4

- **takeseat: GO.** Primary sat 5/8 armed vs 0/8 baseline, pass;
  sanity baseSeatsEarned 5/8, pass; guard 8/8; costBar pass
  (starvation 3 → 1, arm-only 0; median 116.5d → 150d; pairDays 65
  ≥ 14).
- **feareddoor: NO-GO stands.** Primary fails as recorded (feared
  entered 5/5, feared wins 5/5, wins 5 vs 5, winDelta 0). Sanity
  passes (baseSeatsEarned 6, baseSat 5, armedSat 5); guard 12/12;
  costBar passes.
- **darkwit fresh pair: NO-GO at pilot stands.** Primary fails as
  recorded (dark entered 0/8 armed, dark wins 0, winDelta −3).
  Sanity passes (baseSeatsEarned 5, baseSat 5, armedSat 2); guard
  8/8; costBar fails on starvation (5 vs 1, arm-only 5), as
  recorded.

No other verdict field moves against the sim-pricedseat-b record on
any re-run: every primary/guard/cost/wall value above matches that
record exactly.

## Proof

`scripts/test-pricedseat-b.js` — **33/33 PASS** on current master:
pricedSeatOf fixtures on both corpus generations (10), known-case
earned/taken counts on the real corpora (9, incl. the 53210
single-seed case), the three analyzer verdicts re-run (3), six-pair
invariance through the unchanged scorecard (6: full judged-metrics
digests identical to the sweep-b goldens — takeseat /
darkwit-53201 / fightloop `460a36fd…`, feareddoor `eeaa356c…`,
darkwit-fresh `f202d5ba…`, feareddoor-53210 `53b95785…`), and the
cross-check that `pricedSeatOf` agrees with the raw `finalSeat` on
every old-corpus row (1 check over 80 rows, 0 disagreements). The
brief's filename `scripts/test-takeseat-pricedseat-b.js` does not
exist on this base — the repair's proof is `test-pricedseat-b.js`,
and no duplicate test file was created for the same repair.

## Regression results

At the recorded counts, except the two live-leg failures below
(pre-existing, attributed):

- `scripts/test-sitmetric-b.js`: 34/34 PASS.
- `scripts/test-sitmetric-sweep-b.js`: 30/30 PASS.
- `scripts/godpath/test-balance-scorecard.js`: 35/35 PASS.
- `scripts/godpath/test-panel-contract-rulings.js`: 9/9 PASS.
- `scripts/test-comparecontract-a.js`: 25/25 PASS.
- `scripts/test-darkwit-b-20261107.js`: 23 checks passed.
- `scripts/godpath/test-measurement-workflow.js`: 8 passed,
  **1 failed** — "retained neutrality proof covers the current
  Game/controller/harness inputs".
- `scripts/godpath/test-measurement-proof-update.js`: **fails at
  load** — "Proof source inputs are not current".

The two measurement failures are the SAME pre-existing staleness
sim-pricedseat-b recorded (the retained proof panel was built before
`src/js/conversation.js` changed on master); this run refreshed
nothing, per its prereg. No file this verification touches is a
proof input (it touches no code at all).

### LIVE-LEG FAILURES — takeseat + feareddoor suites (pre-existing, not this repair)

- `scripts/test-takeseat-b-20261107.js`: FAILS at line 272 —
  `assert.strictEqual((a.takeseatStats || {}).seatTaken, 0)` reads
  **1**. Section (D) LIVE: the ARMED leg on seed 53001 now takes a
  seat. The leg's own output (`/tmp/takeseat-b-proof-armed/`):
  150d survived, standing 209, maxWave 5, `finalSeat` "lesser",
  `seatTaken` 1; baseline leg unchanged (150d, standing 250,
  `seatTaken` 0). The test's premise — "no-seat seed 53001 — the
  drive never fires in either leg" — no longer holds on current
  master.
- `scripts/test-feareddoor-b-20261107.js`: FAILS at line 446 —
  `assert.strictEqual((a.feareddoorStats || {}).doorsEntered, 0)`
  reads **1**. Same section (D) LIVE, same seed: the armed leg
  enters 1 door. Its output: 97d, endReason "over-other", standing
  209, `finalSeat` "lesser", `seatTaken` 1, `doorsEntered` 1; the
  baseline leg ends identically except `doorsEntered` 0 (and it too
  now takes the lesser seat, `seatTaken` 1, where the test expected
  finalSeat 'none').

Attribution (verified, not assumed): the sim-pricedseat-b run
recorded BOTH suites green on base `ba21ca026`. Between `ba21ca026`
and `8419eefa4` the sit-drive rebaseline landed
(`ff8b9869f` 0930Z round: "sitdrive adopted … landed b5d1eb923";
`b5d1eb923`, `38389defb`, `f37924c96` sitdrive-winseek-b) — game-code
landings that change what the sit drive does on seed 53001. The
pricedseat repair touches no `src/js`, no driver, and no live-leg
input (its diff is `seat-taken.js`, three analyzers, one proof test,
evidence), and this verification run touches no code at all — so
neither can have moved a live trajectory. The failing assertions are
trajectory pins whose premise the landed sit drive overturned; the
drive still discriminates (takeseat baseline still 0 sits vs armed
1), so this is stale-pin staleness, not a broken drive. Re-pinning
belongs to those suites' owners (or the sit-drive arm), not to this
verification. The analyzer verdicts above are unaffected: they judge
committed corpora, not live legs.

## Wall numbers (this run's re-judged corpora)

No new sims: nothing moves. The re-run corpora (national / tableSat
/ wins, wave 4–5 unlocks, median survival):
- takeseat: baseline national 0/8, sat 0/8, wins 0/8, wave-4 7/8,
  wave-5 3/8, median 116.5d; armed national 0/8, sat 5/8, wins 0/8,
  wave-4 7/8, wave-5 4/8, median 150d. Invitations 5/8 both legs.
- feareddoor: national 0/12 both legs, sat 5/12 both legs, wins
  5/12 both legs, wave-4 12/12, wave-5 4/12, median 112.5d both
  legs. Invitations observed 4/12 (the end-of-run note from
  sweep-b still applies).
- darkwit fresh: baseline national 0/8, sat 5/8, wins 5/8, wave-4
  8/8, wave-5 5/8, median 90.5d; armed national 0/8, sat 2/8, wins
  2/8, wave-4 8/8, wave-5 4/8, median 86d.
- No telemetry deviation check was run: there is no new per-seed
  evidence glob for `telemetry-check.js` — this run re-judged
  existing corpora only.

## Metric review

- Bars 1–4 all hold exactly as pre-registered: the earned counts
  match the recorded counts on every known corpus (including the
  corrected darkwit-fresh expectation, sittings 5/8 → 2/8, which
  this run pins rather than the conflated 0/8 → 5/8); the takeseat
  verdict computes GO; the feareddoor/darkwit verdicts stand with
  only `baseSeatsEarned` differing from the pre-repair record; the
  six sweep pairs judge identically to their goldens; the proof
  test is 33/33 green.
- The prereg's Method list expected the takeseat/feareddoor
  analyzer suites at their recorded counts (23 / 33). They miss on
  current master for the pre-existing live-leg reason above. Per
  §14 this is recorded here as a miss on the Method list, NOT
  re-scored and NOT folded into the GO bars (which are the proof
  test, the analyzer re-judgments, and the golden invariance — all
  of which hold). The re-pinning is owed by the suites' owners.
- The sweep `table` metric's raw-invitation-flag label question
  ("Table sitting rate (seat taken...)") is a Steve-call, NOT this
  run's to change; carried as an open question, not fixed.
- The sim-sitmetric-sweep-b verdict (NO-GO on bars 1 and 4 as
  written) stands as recorded and is NOT re-scored here.

## Village assessment in plain words

No new villages were simulated — this run checked the ruler, not
the village, and found the ruler already fixed: the analyzer that
once called a priced seat a taken seat now keeps both readings side
by side on every row, and the takeseat verdict reads GO on the same
villages, with the same sits, that it read NO-GO on before. While
checking, the run caught something the ruler did not cause: the
"no-seat seed" the two analyzer suites pin their live legs on is no
longer a no-seat seed — the sit drive the game landed since then
now takes the lesser seat there. The villages moved; the test pins
did not. Nothing about any village changed under this verification;
the counts did, in the repair that already landed.

## Blanks filled or documented

- FILLED (verified): the landed pricedseat repair reproduces
  exactly on current master `8419eefa4` — takeseat GO with sanity
  5/8, feareddoor NO-GO with sanity 6/12, darkwit fresh NO-GO with
  sanity 5/8; six-pair judged values byte-identical to goldens;
  proof 33/33.
- DOCUMENTED (not built): the takeseat/feareddoor analyzer suites'
  live legs fail on current master because seed 53001 is no longer
  a no-seat seed after the sit-drive rebaseline landings — the
  "drive never fires" pins are stale. Re-pinning belongs to the
  suites' owners or the sit-drive arm.
- DOCUMENTED (not built): the retained measurement proof is still
  stale on current master (`src/js/conversation.js` changed after
  the proof panel was built) — a fresh real neutral panel refresh
  is still owed by the next run that touches a proof input or by
  the coordinator.
- CARRIED (not built): the prior run's findings — sweep
  `tableReach` shows no earned count; analyzer guards compare the
  raw corpus `finalSeat`; `perseed-darkwit-b-armed` does not exist;
  the sweep `table` metric label is a Steve-call.

## Findings for the backlog

- [open] 2026-11-09 — takeseat/feareddoor live-leg pins stale on
  seed 53001 — after the sit-drive rebaseline landings
  (ff8b9869f/b5d1eb923/38389defb/f37924c96), the armed takeseat leg
  on seed 53001 now takes the lesser seat (seatTaken 1, 150d,
  standing 209) and the armed feareddoor leg enters 1 door, so
  `test-takeseat-b-20261107.js:272` and
  `test-feareddoor-b-20261107.js:446` fail their "no-seat seed —
  drive never fires" pins. The drive still discriminates
  (baseline 0 sits); the pins need re-pinning to a still-quiet
  seed or to the new trajectory (sim-takeseat-pricedseat-b
  evidence, re-verified on master 8419eefa4).
- [open] 2026-11-09 — retained measurement proof stale on master
  — `src/js/conversation.js` (journey crisis r156, f496b0072)
  landed after the sweep-b proof panel was built, so
  `test-measurement-workflow.js` (8/9) and
  `test-measurement-proof-update.js` (load failure) fail on current
  master with "Proof source inputs are not current". The refresh (a
  fresh real neutral panel via `scripts/balance-proof-update.js`)
  is still owed; re-confirmed on 8419eefa4
  (sim-takeseat-pricedseat-b evidence; first recorded in
  sim-pricedseat-b).
- [open] 2026-11-09 — duplicate arm spawn — this run
  (fleshout-loop-b-20261109T1030Z) was briefed to perform the
  pricedseat repair that the 0630Z run had already landed as
  `9d6ebf59c` on master. The repair was verified rather than
  re-applied; coordinators should check for a landed
  sim-pricedseat-b before briefing the same arm again
  (sim-takeseat-pricedseat-b evidence).

## Convergence

scale-onramp stays converging (NOT converged): the metric gap is
closed on the analyzer side and the repair is verified on current
master, but the underlying picture is unchanged — the full seat is
still unreached, wins still come only through the lesser seat, and
the re-run corpora still sit 0–5 per leg. No src/js change; nothing
held unlanded except the coordinator's calls on the live-leg
re-pinning and the proof refresh (both pre-existing, neither this
run's to fix).

## Run notes (infrastructure)

- Index clobber struck on the prereg commit (safe-commit left the
  committed file as staged-deleted + untracked); repaired with
  `git ls-tree -r HEAD -- <path> | git update-index --add
  --index-info` after verifying hash-object == HEAD blob;
  `git status --short` empty, `git diff HEAD` empty after.
- Analyzer scratch JSON was written to /tmp (not committed) and
  read back for the verdict/count tables above.
- No EPERM flap encountered this run; no preload needed.
