# sim-scale-onramp-round-2330 — STALE-LOCK RECOVERY + ADOPTION CLOSEOUT

Run fleshout-20261118T2330Z, Loop A (axis scale-onramp), timed out
without closeout. Recovered and closed out by run
fleshout-20261119T0115Z (this file's author is the adopting
coordinator; the arm evidence files landed here are the 2330Z
workers' own work, verified from their branches, not re-run).

## Recovery — what was found

- Lock `fleshout-loop.lock` (run fleshout-20261118T2330Z, created
  2026-11-18T23:20:19Z) was ~2h old at recovery. The run's
  coordinator was dead: both workers delivered (one done, one
  cancelled), no coordinator agent alive, no live process in either
  arm tree. One surprise: the cancelled partyform-fix-a worker's
  sim driver survived as an orphaned process and kept writing until
  2026-11-19 01:24:51Z (pilot analysis JSON), with its worktree
  heartbeat frozen at 01:24:50Z. The coordinator waited for the
  orphan to exit (PID gone ~01:24:40Z), confirmed no further writes
  or processes, and only then proceeded. A heartbeat that keeps
  updating with no live process behind it was NOT observed after
  01:24:50Z — the freeze is what the recovery judged on, per the
  closeout skill (writes under 15 minutes old = live worker).
- Claim `fleshout-20261118T2330Z.json` retired to `.DEAD` with a
  note; lock deleted as stale (>90 min, no live coordinator).
- Loop B (fleshout-loop-b-20261118T2330Z, axis winnability-chain)
  was LIVE throughout this recovery (one agent running, its own
  lock + claim). Nothing of Loop B's was touched. Master moved once
  under the recovery (be0b90b41 → d9a55ed26, Loop B's
  partysize4-confirm-b arm corpus landing) — the round branch was
  cut from the current master before merging.

## Arm verdicts (recovered, verified from branches — not re-run)

### sim-fieldcarrier-confirm-a — NO-GO THIN-POOL (finding #2552 follow-up)

Worker delivered done. Evidence, analysis, §15 panel already on
master (ca91d5952, 9a610cc93, 55ea5ef3d — the 2330Z adoption arm
landed them before the coordinator died). Fresh pilot band
104901–104908, 150d, competent policy: the carrier fires but the
pool is thin; first carrier kill observed; setup-turn cost on paired
deaths; evade cascade thins the pool. New findings #2568 (Rage
setup turn kills — next arm: survive the setup, not a bigger
multiplier), #2569 (one village's 20 awareness-evades thin the pool
more than party absence). This run spawns the #2568 follow-up as
sim-rage-setup-a. Worktree released as merged; branch deleted.

### sim-partyform-fix-a — NO-GO (finding #2547, pilot re-run)

Worker cancelled mid-run; its orphaned sims finished the pilot
re-run and wrote the analysis + panel. Verdict from
`partyform-fix-a-pilot-analysis.json` against the frozen prereg:
arm launch-with-party rate 0.364 (8/22) vs ctl 0.263 (5/19); need
>= 0.50 AND >= 2x ctl — FAIL. Floor OK (>= 8/leg); costs C1–C3 all
pass (C3 exactly at the boundary, community loss 1 → 2). Panel
review_required with one regression_signal (village deaths per 100
calendar days 57.79 → 62.97). Phase (b) NOT triggered (pool-empty 1
of 2 stalled — tied, not dominant). Full record:
`evidence/2026-11-18/sim-partyform-fix-a.md` (written by the
adopting coordinator from the analysis JSON + panel + prereg; the
worker never wrote it). Lever HELD on branch `sim-partyform-fix-a`
(tip 1ede7d6d7), UNMERGED. Evidence-only landing in this commit:
prereg (with addendum 1), arm .md, both analyses, panel files,
panel builder, attempt-1 + re-run corpora.

### Adoption arm (planned in the 2330Z claim)

Evidence-only landings of held branches sim-wildavoid-seedplan-b
(confirm NO-GO, #2556 closed) and sim-fieldcarrier-a (pilot NO-GO
THIN-POOL) were ALREADY on master before this recovery
(5c1f96f15, ac1b82736). Nothing further to land.

## Wall numbers (partyform pilot, both legs identical)

nationalStanding 2 / nationalRank 0 / table 0 / wins 0 / wave4 8 /
wave5 2 / median survival 150d. The wall does not move on this
round.

## Gate

`node scripts/check.js --quick` on tip 48c81dac6 (branch
sim-round2330-evidence-a, master 986cc5584 + this evidence commit):
**334 passed, 10 failed in 1424s, 0 attributable.** Full log:
goal `hidden_files/evidence/2026-11-18/sim-scale-onramp-round-2330-gate.log`.
The tip was rebased onto master 9da088d34 clean before the ff-merge
(new tip 36992da58); the rebase replayed only evidence files onto
evidence-only master movement (crisis r244 panel evidence + Loop B
round evidence, no src/ changes on either side), so the gate tally
stands for the merged tip.

1. `test-measurement-proof-update.js` (exit 1, 4.2s) — "Proof source
   inputs are not current". Standing staleness pair, part 1.
2. `test-measurement-workflow.js` (exit 1, 7.0s) — "retained
   neutrality proof covers the current Game/controller/harness
   inputs". Standing staleness pair, part 2. Both were already failing
   in the 1735Z round's gate before this run's arms landed; the
   neutrality proof needs a refresh (`balance-proof-update.js`) —
   standing maintenance, not an adoption task.
3. `test-phone-frame-proof.js` (exit 1, 6.0s) — phone receipt stale
   (index.html + data files). Standing.
4. `test-living-garden-deed-attainment.js` (TIMEOUT 120s) — solo
   re-runs expired at 300s AND 600s mid-run (seed 3 of 16) under box
   load 21.8 (the sibling Loop B adoption was running identical solo
   re-runs concurrently); not re-proven this round. Same 120s
   gate-timeout signature as the standing load artifact (it passed
   solo in 63s on a quiet box in the 2015Z round).
5. `test-one-person-army-deed-attainment.js` (TIMEOUT 120s) — passes
   solo, exit 0 in 289s. Load artifact.
6. `test-occupation-panels.js` (TIMEOUT 120s) — passes solo, exit 0
   in 174s, 25/25. Load artifact.
7. `test-trust-observer-neutrality.js` (TIMEOUT 120s) — passes solo,
   exit 0 in 183s, 6/6. Load artifact.
8. `test-synergy-stall.js` (TIMEOUT 120s) — passes solo, exit 0 in
   132s. Load artifact.
9. `test-capable-bot-20261014.js` (TIMEOUT 120s) — solo exit 1 at
   225s, all 15 sub-assertions pass; the failure is
   `spawnSync /usr/bin/node ETIMEDOUT` on the test's self-spawn
   (`--campaign 1234`) under load. Spawn budget, not an assertion.
   Load artifact.
10. `test-measurement-cache-flags.js` (exit 1, 93.1s) — solo: 3 of 4
    sub-assertions pass; "both actual CLI configurations complete
    valid neutral panels" still fails. The test spawns
    `balance-panel.js` with a 30s timeout per configuration; under
    load 21.8 the spawn exceeds its budget. The test's inputs
    (`balance-panel.js`, the observer lib, game src/) are
    byte-identical between this tip and master — this landing changes
    no file the test reads — so the failure is a load artifact, not
    attributable to this landing. No pristine-vs-tip A/B was run: a
    full worktree checkout for the A/B was not justified once the
    mechanism (30s spawn budget under saturation) plus the
    identical-inputs argument was established.

**Ladder-bundle control: CONFIRMED FIXED (still).** Absent from this
gate's failure list — it was failing in the 1735Z and 1715Z gates,
fixed by the ladderbase-cause-a fix, and stays absent here.

The gate ran 1424s vs 689s in the 2015Z round: the box was saturated
(load 21.8 at adjudication; Loop B's gate + solo re-runs and the
0115Z workers concurrent). That saturation is the common cause of the
six timeouts. **0 attributable:** no failure is attributable to this
landing (evidence-only; no src/ changes; the one panel-builder script
is not read by any failing test).

## Telemetry

`node scripts/telemetry-check.js --baseline
evidence/2026-11-18/telemetry-baselines/scale-wall.json --current
'evidence/2026-11-18/perseed-partyform-fix-a-arm/*.json' --metrics
national,table,wins,exiled` — ENOENT: the baseline file does not
exist in the repo (no `telemetry-baselines/` directory). The deviation
check could not run; same outcome as the fieldcarrier-confirm-a arm
and the 2015Z/2030Z rounds (telemetry-check refuses the recorder
corpora). Baseline NOT rolled. No LOUD line to investigate — there is
no baseline to compare against, and the arm-vs-ctl comparison in the
analyzer + panel is the operative contrast for this round.

## Landing

Evidence-only commit on branch `sim-round2330-evidence-a`, merged
ff-only to master (this round's own merge — see log). No game code
in this landing. Worktrees: sim-fieldcarrier-confirm-a tree removed,
branch KEPT (its evidence commits are on master, but the tooling
commit 9dd183c4b is branch-only — deleting the branch would lose the
driver/analyzer/panel-builder; the draft's "branch deleted" line was
corrected at closeout); sim-partyform-fix-a released as
tree-removed-branch-kept (lever HELD). Main tree clean on master at
closeout. No push, no bump, no live verification — merged locally,
pending ship.

## This run's own arms (fleshout-20261119T0115Z, spawned, in flight)

- sim-rage-setup-a (#2568): survive the Rage setup turn — HP/armor
  floor or free-action strike, launch-rich band, pilot 8 seeds.
- sim-sense-guard-diag-a (#2571): is the launch-party sense's
  same-expedition tile guard too strict, or do expeditions genuinely
  split? Diag, 8-seed pilot.
Both workers were spawned from registered worktrees and report to
the next adoption run; their verdicts are NOT in this file.

## Next blanks (scale-onramp, in order)

1. #2568 Rage setup survival (in flight as sim-rage-setup-a).
2. #2571 sense-guard diag (in flight as sim-sense-guard-diag-a).
3. #2561 ranger-gated companion pool / #2562 range-0 holder — the
   partyform funnel after seeding (deletion/retarget dominates).
4. Fight-ally cap (#2559) via the fightcap arm — quads travel but
   cannot join the fight.
5. Carrier retune argues from 3/11 tier-denial, not 5/11
   ever-blocked; hunger-gate rate needs a hungrier band.

## Metric review

- The partyform pilot's frozen primary separated the legs and was
  reachable in principle; no revision proposed. Its (b)-trigger
  wording needs a tie rule for tiny stalled populations (proposed in
  sim-partyform-fix-a.md §9).
- Telemetry: deviation check attempted against the scale-wall
  baseline (see below); baseline NOT rolled.

Scale-onramp stays converging (NOT converged). Winnability chain
stays converging (NOT converged; Loop B live).
