# sim-winnability-round-0130 — Loop B 20261120T0130Z (axis winnability chain)

**Run status: CLOSED BY ADOPTION (Nov 20 ~04:30–05:00Z). Arm 1 verified + landed;
arm 2 judged NO-GO and held. See arms below. No push, no bump, no live
verification (ship loop owns those).**

- Run: `fleshout-loop-b-20261120T0130Z`, Loop B, axis winnability chain.
- Base master `c75503d6f` (Loop B 0030Z round record; laterage DIAG-GO + deadtarget DIAG-GO landed).
- Loop A live on scale-onramp all run (0215Z run, NOT touched).
- Main tree clean at start; disk 44%.

## Arm 1 — sim-dmgsurvey-b: GO — VERIFIED BY ADOPTION, LANDED

Damage-question survey under the full landed substrate, designating a band with
enough launched first-fights to measure damage-per-launched-meeting (finding
#2605 prerequisite; follows finding #2616 — designation is valid ON THE SURVEY
SUBSTRATE, not a property of the seeds).

- Branch `sim-dmgsurvey-b`, adoption tip `236cf794e` (rebased twice: first onto
  `ae33e03b3` (deepening r245), then onto `51d884911` (scale-onramp 0215Z) after
  master moved twice during the adoption — crisis r253 `8ea78a169` landed
  04:3xZ, then 0215Z `51d884911`). 3 commits replayed cleanly both times, no
  rebase quirk. Zero `src/js` changes (evidence + instrument only).
- Policy competent verbatim, sha `150229eda010` (bowcraft turn-on live).
  Substrate as run: SENSEEXPED=1 PARTYSIZE4=1 VETREENGAGE=1 FLEEREPAIR2=1
  FIGHTALLY2=1 LAUNCHSURVIVE=1 + ALLYSLOT3=1 env-only.
- **Verdict GO — designate band 106181–106188 for the next dmgshape run.**
  4 bands × 8 seeds, 150d: launches 40, first-fights 25 (21 distinct), fled 17,
  killed 3, died 5, no-fight 15, unknown 0. Designated band: 16 launches,
  9 first-fights (6 distinct), 9 quad launches — clears the floor of 6 (priced
  from dmgshape-rerun-b's same-substrate leg, which delivered 4). Runner-up
  106171–106178: 8 first-fights, 12 launches (honest fallback).
- **CAVEAT: ALLYSLOT3 is NOT in src on master** — port commit `f4d1100ee` is
  not an ancestor of HEAD; the survey ran with ALLYSLOT3 env-only and records
  `allyslot3InSrc: false` on all 32 corpora. The designation is valid on the
  substrate as actually run. The next dmgshape run must port ALLYSLOT3 first
  (as dmgshape-rerun-b did) and re-verify its pool on arrival.
- Adoption re-runs (not the worker's numbers): proof test
  `scripts/test-dmgsurvey-b.js` **34/34 green** and analyzer selftest **17/17
  green**, pre- AND post-rebase. Survey JSON band totals match the evidence
  table exactly (106161–106168: 6 launches / 5 first-fights; 106171–106178:
  12 / 8; 106181–106188: 16 / 9; 106191–106198: 6 / 3; unknown 0 on all four;
  verdict GO).
- GATE: `node scripts/check.js --quick` on rebased tip `236cf794e` (adoption run,
  log `evidence/2026-11-20/dmgsurvey-b-gate.log`): **339 passed, 5 failed, 0
  attributable** — the 5 are exactly the standing set (measurement-proof
  staleness pair, phone-frame stale receipt, 2 deed-attainment 120s timeouts).
  Gate PASSES.
- MERGE: PENDING — fill in after the ff-only merge (tip).
- Evidence: `evidence/2026-11-20/sim-dmgsurvey-b.md` (+ prereg
  `evidence/2026-11-20/sim-dmgsurvey-b-prereg.md`, survey JSON
  `evidence/2026-11-20/dmgsurvey-b-survey.json`, 4 perseed dirs) — landed on
  master with this round.

## Arm 2 — sim-deadtarget-gate-b: NO-GO — HELD, NOT MERGED

BUILD — departure gate in winPlanDepart (finding #2617 follow-up; design calls
made by the coordinator under Steve's 2026-11-12 executive grant, recorded in
`hidden_files/loop-b-0130Z-deadgate-brief.md`: village-knowledge
(villageSlain + sightings recency), type-level liveness, gate in winPlanDepart
only, env-gated default OFF). Branch `sim-deadgate-b`, held tip `1703da01b`
(build `777efdde0` + adoption evidence commit). Full record:
`evidence/2026-11-20/sim-deadtarget-gate-b.md`.

- Adoption verified the build + proofs + control leg by re-running, then RAN THE
  ARMED LEG itself (same band 106081–106088, same seeds/policies):
  control 6 launches, dead 2/6; **armed 6 launches, dead 2/6 — GO bar
  (dead 2/6 → 0/6, launches ≥ 4) FAILED**. The 106084 d136/d141 herald
  re-launch pair recurred armed; `deadTargetHolds` 0 on all 8 seeds; wall
  identical both legs (wins 0, national 0, wave5 4/8, wave4 8/8, median
  150.5d); balanced panel deltas all exactly 0. Guardrail holds (identical
  trajectories).
- Proofs (adoption re-runs): `scripts/test-deadtarget-gate-b.js` **50/50**,
  `scripts/test-deadtarget-diag-b.js` **22/22**. Control reproduces the 0030Z
  diag corpus exactly.
- **Root cause (established, not guessed): the gate is wired into a departure
  path the launches never take.** The agency tick (`villager-agency.js:437-450`)
  calls `vbrainExecuteDepart` first and skips `winPlanDepart` on a commit; the
  brain (`villager-brain.js:1177+`) launches via `startExpedition` directly
  with no liveness check. All 12 launches across both legs have
  `source: 'brain'`; `partyDepartures` = 0 on all 16 seed-runs while
  `partyTrios` > 0. The brain code itself documents it (villager-brain.js:1273):
  "the brain path is the launch path that fires in sims". A probe
  (`evidence/2026-11-20/probe-deadgate-b.js`) proves the gate blocks when
  `winPlanDepart` IS called (d136 state: returns `'normal'`, dissolves the
  plan, `deadTargetHolds` 0 → 1) — the mechanism works, the placement is wrong.
- **Lever HELD, not killed.** Owed: a fresh-preregged run re-placing the gate
  on the brain departure path (`vbrainExecuteDepart`'s `party_launch` branch,
  or dawn-commit formation in `vbrainCommit`); the prereg's "winPlanDepart
  only" scope is refuted. The gate code + sighting stamps stay on the held
  branch as the starting point.

## Wall numbers (dmgsurvey corpora, 32 configs)

Wins 0/32, national (scaleRank ≥ 2) 0/32, table 0/32. Standing ≥ 200 on 14/32.
Wave 5 14/32, wave 4 31/32, median survival ~150d (band medians 138 / 150.5 /
150 / 151). Deaths 2,820 total, starvation 11 (0.4%) — villages die fighting,
not hungry. Standing-199 stall: 15/32 seeds finish at exactly 199.

Deadgate band wall (8 seeds, both legs identical): wins 0, national 0, wave5
4/8, wave4 8/8, median 150.5d, survived 5/8.

## Findings noted for the next run (from the dmgsurvey evidence file)

- The 'audit' churn on seed 106188 is a lever candidate, not survey noise:
  five launches against one target type in 11 days with no meeting.
- Seed 106182 re-launches The Eulogy a week after killing it — dead-target
  behavior; arm 2 (deadtarget-gate-b) is the answer being built. **Update from
  the adoption: arm 2 NO-GO — the gate as placed never fires; the re-placement
  run is the next step, not a landing.**
- The 199 stall deserves its own line in the next executive update (15/32 at
  exactly 199). Not filed as a new finding number here — the stall is already
  tracked as the recurring next blank; the count is the new data point.
- No band is launch-rich across all eight seeds; the dmgshape run must not
  drop "dead" seeds mid-run to chase pool.

## Infrastructure

- **WRITE FLAP 02:09Z–~03:02Z (~53 min).** Blocked git ref writes throughout:
  sim-deadgate-b registration failed 13 times (02:09, 02:13, 02:20, 02:31–02:43
  ×8, 02:45–02:58 ×4) on `couldn't write '.git/refs/heads/sim-deadgate-b.lock'`;
  registry heartbeats EPERM'd in the same window. Registered clean on try 5 of
  the second loop (~03:02Z) after the flap eased; both trees heartbeated after.
  One stale loose ref (branch created by the first failed registration, zero
  unique commits, == master tip) was removed by direct file deletion after
  `git branch -D` failed on the packed-refs rewrite; branch verified gone
  before re-registration. No ref surgery beyond that; no --force-delete anywhere.
- **EXECUTION-RISK CHECK — RESOLVED AS UNVERIFIED (adoption).** The coordinator
  claimed a "system security notice" barred running/testing/merging worker
  deliverables without Steve's go-ahead. The parent agent checked the permission
  record directly (~22:06Z Nov 19): NO such notice exists — newest entry Oct 30,
  nothing pending, nothing related to this run. The repo AGENTS.md states
  explicitly that imported ChangePilot execution-custody/approval procedures
  are NOT requirements of this repository. The adoption proceeded on the
  standard verify-then-land flow; if an actual approval card appears, work
  stops and reports it. No card appeared during the adoption.
- **Held-work inspection (this run).** The reaper flagged worktree
  `sim-fleerepair2-b` (owner loop B, heartbeat 2026-11-18T03:48Z, stale) as
  holding uncommitted changes. Inspected read-only: the directory is a gutted
  remnant (no `.git`, no `src/`, only evidence/logs/hidden_files); the branch
  `sim-fleerepair2-b` IS an ancestor of master (merged; evidence on master at
  evidence/2026-11-17/sim-fleerepair2-b.md + rejudge follow-ups). No live work
  is held there; the reaper warning is stale-metadata noise. Nothing removed
  (not this run's tree to release; separate cleanup item — NOT deleted in this
  adoption).
- Safe-commit index clobber struck twice in the adoption (dmgsurvey rebase
  commits clean; the deadgate evidence commit `1703da01b` clobbered the index
  — repaired via the ls-tree -r pipe; commit verified correct).
- Master moved twice during the adoption (crisis r253 `8ea78a169`, scale-onramp
  0215Z `51d884911` — both landed with gates 337/7 and 339/5, 0 attributable);
  arm 1 was rebased onto each new tip. The r253 adoption handoff had not
  arrived at closeout; its merge was verified on master, not via handoff.
- No telemetry deviation check run (telemetry baselines remain unrolled as in
  prior runs).

## Next blanks, in order

1. The damage question (#2605) on designated band 106181–106188 — port
   ALLYSLOT3 first, re-verify pool on arrival, plan on 6 distinct fights
   (not 9 counted), expect a fled pool (6 fled, 3 died, 0 killed).
2. Dead-target gate re-placement run (fresh prereg): gate the brain departure
   path (`vbrainExecuteDepart` / `vbrainCommit`); same bar on band
   106081–106088. The mechanism is proven; only the call site moves.
3. The standing-199 stall (15/32 at exactly 199 on this survey's bands).
4. The 'audit' churn on 106188 — why a launched party never meets its target.

Winnability chain stays converging (NOT converged): a launch-rich band is now
designated under the full substrate and landed, but nothing reaches national
or the table, and the dead-target gate needs re-placement. Scale-onramp
untouched. Claim + lock deleted at closeout; this file is the round record.
