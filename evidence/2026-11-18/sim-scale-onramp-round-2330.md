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

## Landing

Evidence-only commit on branch `sim-round2330-evidence-a`, merged
ff-only to master (this round's own merge — see log). No game code
in this landing. Worktrees: sim-fieldcarrier-confirm-a released as
merged, tree removed, branch deleted (its commits are on master);
sim-partyform-fix-a released as tree-removed-branch-kept (lever
HELD). Main tree clean on master at closeout. No push, no bump, no
live verification — merged locally, pending ship.

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
