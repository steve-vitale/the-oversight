# sim-winnability-round-1729 — coordinator evidence (Loop B)

Run: fleshout-loop-b-20261117T1729Z (Loop B), axis winnability chain.
Adoption closeout of the dead 1521Z Loop B run: BOTH its arms adopted,
verified, and disposed — arm 1 LANDED, arm 2 HELD (pilot NO-GO on
instrument, lever not killed). Loop A live on scale-onramp the whole run
(1535Z claim: poolshape-a + part2target-a) — NOT touched.

## Stale-lock recovery (run start)

1521Z lock 128 min old (created 15:21:00Z); tree heartbeats 73 min
(sim-partysize-b, 16:12:28Z) / 98 min (sim-nondeathplan-live-b,
15:46:40Z) stale — dead by the 15-min guard and past the 90-min
fallback. Lock deleted, 1521Z claim retired to .DEAD with a note,
this run's lock + claim written before any adoption work. Pre-flight:
main tree clean (tracked + untracked, verified 17:31Z), disk 46%,
reap skipped — registry lock held by another reaper (consecutive
skips: 2; known self-contention, same as Loop A's note). Merge-base
check per finding #2476 before adopting: neither branch is an
ancestor of master (both genuinely stranded, not stale snapshots of
landed work). Both adopted trees re-heartbeated at adoption.

## Arm 1 — sim-nondeathplan-live-b: LANDED, GO (merged b921fde4f)

Adoption of the stranded 1521Z arm (prereg commit 69aa09174, evidence
+ proof test drafted uncommitted, proof claimed 103/103). Verified,
not re-measured: proof re-run 103/103 on the adopted tip AND on the
rebased tip; #2482 classifier fix verified independently by
re-classifying the frozen corpora in the main tree (read-only):
slotTotal 0 / NOISE-ONLY on both legs. Findings #2476/#2481 already
correctly [fixed]; the worker corrected the one thing the dead run
got wrong — sim-findings.md carried a duplicate tail [fixed] line for
#2482 while the original line was left [open]; the original line is
now [fixed] in place, duplicate removed. Scratch oexcl-test.txt
(0 bytes) deleted, not committed. No game-code change (src/ diff 0).

- Landing: rebased onto master c5af0c082 clean (stop-at-pick quirk
  struck on the arm pick — verified unapplied via `git diff`,
  `git rebase --continue`, sailed through); ff-only merge then
  refused because sibling journey-crisis r230 (7eb8ffc22) landed
  under the run — rebased onto 7eb8ffc22 clean, coordinator re-ran
  the proof on the rebased tip 103/103 (gate 87 passed / 2 failed,
  both known pre-existing artifacts), merged ff-only as b921fde4f
  (5 files, +1389/−3). Tree released done-merged, branch deleted.
  Main tree clean after the merge (tracked + untracked empty).
- Verdict: GO on all 5 frozen bars — every non-death how fired LIVE
  through its real trigger, 0 lingering at 10 days, no ignition,
  proof green, cost clean. Findings #2476/#2481/#2482 [fixed]; the
  village-talk observation (leavers never mentioned again in 10
  days) stays [open] as a talk question for a Steve-call.
- Wall (parent band, unchanged by this arm): national-standing 2/8,
  national-rank 0/8, table 0/8, wins 0/8, wave-4 reached 8/8,
  wave-5 reached 2/8, wave-4 kills 15, wave-5 kills 3, median
  survival 143d, deaths 570.
- Evidence: evidence/2026-11-17/sim-nondeathplan-live-b.md (with an
  adoption-verification section appended by the worker).

## Arm 2 — sim-partysize-b: PILOT NO-GO on instrument; lever HELD (NOT merged)

Adoption of the stranded 1521Z BUILD arm on damage wall #2484 (prereg
+ probe corpus + prereg CORRECTION committed; lever built but
uncommitted). The worker finished the lever, committed it, finished
the proof test, rebased onto c5af0c082 clean, and ran the frozen
8-seed pilot (band 103601–103608, 150d, competent verbatim, legs ctl
VETREENGAGE=1 vs arm +PARTYSIZE4=1). Coordinator verified: branch
tip 02117e2e8 (5 commits ahead of master), worktree clean, evidence +
analysis JSON + both corpora present, proof re-run 44/0 on the branch
tip by the coordinator.

- Pilot numbers: launches 32 → 39; sizes ctl {1:2, 2:20, 3:10} →
  arm {1:5, 2:23, 3:5, 4:6}; trio fills 10 → 5, quad fills 0 → 6.
  Third-companion stage split: picks 20 → dawn commits 20 → quad
  launches 6 (the writeCommit carry works end to end). Launched
  fought meetings 3 → 8. Deaths total 624 → 640, expedition
  181 → 174, starvation 6 → 6.
- Bars (frozen prereg, judged strictly): B1 PASS (6 size-4 launches
  ≥ 1); B2 PASS as computed — fragile, unsettled (size-4 mean share
  0.0415, n=4, vs ctl 0.0179, n=1 — the ctl baseline is ONE 1-round
  fight; 31 fought meetings excluded for missing HP; absolute
  shares 2–5.5% sit below the 8.5% reference and a size-2 meeting
  on the same seed dealt more, 10.1%); B3 PASS (expedition 174 ≤
  199.1, total 640 ≤ 686.4); B4 PASS (proof 44/0); B5 PASS with
  review (panel `review_required`; both `regression_watch` rows
  investigated — deaths/run +2 inside B3, the 103606 community-loss
  flip a thin-roster wild-death bleed with expedition deaths down
  35→20, not an expedition price).
- Instrument FAIL: analyzer exit 1 — 72 encounter rows lack
  `mHpStart` (33 ctl / 39 arm), 31 of them fought rows.
  Root-caused: the expedition path passes the monster DEF (hp is a
  range, e.g. eater [950,1150]), so the pre-call wrap can never read
  spawned HP; repair specified (post-call `rec.mHpLeft +
  rec.mDealt`, vKill rule; stop counting no-contact evades as
  missing). The pilot as staged cannot certify the damage question.
- Disposition: NO-GO on the measurement — but the lever passed
  every lever bar, so per kill discipline it is HELD, not killed.
  The lever commit (224c77dda) + evidence commit stay on branch
  sim-partysize-b (tip 02117e2e8), worktree kept and heartbeated for
  the next adoption run; NOT merged this cycle. Next arm: repair the
  recorder, re-run this frozen band, then the fight-ally-cap build.
- The formation question is answered (quads form and launch); the
  damage question is unmeasured, not failed. Every size-4 fought
  meeting still fields exactly ONE joining ally — the fight engine
  caps expedition fights below the launch cap (filed as a finding
  by the coordinator; see below).
- Wall: national rank 0/8 (standing ≥200: 3/8 both legs), table
  0/8, wins 0/8, wave-4 unlock 8/8, wave-5 unlock 3/8, median
  survival ctl 151d / arm 149.5d.
- Evidence: evidence/2026-11-17/sim-partysize-b.md (in the held
  worktree, not on master); corpora perseed-partysize-b-ctl/ +
  -arm/; analysis partysize-b-analysis.json; panel
  partysize-b-panel.md (`review_required`).

## Findings

- #2476 / #2481 / #2482 → [fixed] (arm 1; #2482 duplicate corrected
  by the adoption worker).
- [open] village talk after non-death removal (arm 1 evidence) —
  stays open, Steve-call.
- [open] recorder HP gap (arm 2, sim-findings.md line 2488) — the
  repair is specified in the arm evidence.
- [open] fight-engine ally cap (appended by the COORDINATOR — the
  worker's handoff cited lines 2487–2488 for both findings, but
  only the recorder gap was in the file; the ally-cap observation
  lived only in the arm evidence): a 4th member travels but cannot
  join the fight; raising the cap needs a second ally slot in the
  fight engine. Next arm after the recorder re-run.

## Telemetry deviation check

`telemetry-check.js` on the partysize arm corpus: REFUSED
recorder-corpus input (exit 2) — "all 8 --current rows carry
top-level anchorCommit, so they are sweep recorder rows, not runs."
Same documented refusal as the last several rounds; baseline NOT
rolled, no investigation item. (First attempt pointed at the main
tree by mistake — ENOENT, corpora live in the held worktree —
retried with the worktree path; the refusal is the outcome.)

## Infrastructure

- Git is very slow under sibling load this run (ship bump, journey
  merge, part2target sweep, worktree removals all concurrent):
  a backgrounded `git status` ran 176s with no output and was
  SIGTERM'd; merge-base + heartbeat calls took ~4.6 min; a plain
  `git status --porcelain --untracked-files=no` took ~109s once.
  No lock was held — it is load, not a hang. The
  `git status --short` in the ship loop's own closeout was the same
  shape. No action taken.
- safe-commit index clobber struck the nondeathplan arm commit, both
  partysize commits, and the safe-commit on the partysize lever
  initially refused on 63 deleted lines (shared-scan refactor —
  verified false positive, fixed by restoring the pick's full
  contract comment, 63→50 deletions, no --force-delete used).
  All repaired via the documented `ls-tree -r | update-index`
  pipe; commits verified correct.
- Rebase stop-at-pick quirk struck the nondeathplan arm pick
  (recovered with verify-unapplied + `git rebase --continue`).
- Reaper skipped at pre-flight (registry lock held, consecutive
  skips 2). Partysize worker's heartbeat queued ~11 min on the
  registry lock before landing 18:45:19Z.
- No EPERM write flap observed this run.
- AGENTS.md gained a lesson mid-run (crisis r230 adoption): never
  chain merge + release + rotation + lock in one `;` command —
  followed from here on (each closeout step its own call, exit
  verified). The nondeathplan merge+release above was chained
  before the lesson landed; it succeeded, but the partysize
  closeout and this file's commit are step-by-step.

## Metric review

- Arm 1: bars judged exactly as frozen; the prereg deviation
  (allowlist amended for test-deadplan-b.js) stands as documented.
- Arm 2: B2's baseline (a single 1-round meeting) makes the 2× bar
  a coin flip, not a measurement — the next prereg should bar B2
  on an absolute share or require a minimum n on both legs, but
  that revision belongs to the NEXT run, not this one; B2 is
  reported as computed. The instrument bar ("every encounter row
  carries mHpStart") is wrong in two directions (demands HP where
  none can exist on no-contact evades; driver cannot supply it on
  the agency path) — both halves fixed by the specified repair.
- The drift rule held: the five no-fire seeds are
  trajectory-identical across legs, so the 103602/103604/103606
  divergences are lever effects, not instrument defects.

## Convergence state

Winnability chain stays converging (NOT converged): the non-death
cleanup is now live-proven, the party of 4 forms and launches, but
wins are still 0 on competent legs, the table still unreached, and
the damage question is unmeasured pending the recorder repair.
Scale-onramp stays converging (untouched; Loop A live on
poolshape-a/part2target-a). Food-economy stays converging (parked).
Next blanks, in order: (1) recorder repair + frozen-band re-run
(partysize next step); (2) fight-ally-cap build (second ally slot
in the fight engine); (3) planignite-fix CONFIRM with
kills-per-departure + deaths bars; (4) trick question, profile-gate
design call, veterans alive together (Steve-calls); (5)
answercourt landing decision, competent seat-taking BUILD, family-7
program decision (Steve-calls).

Claim + lock deleted at closeout. Arm 1 merged locally, pending
ship. Arm 2 HELD on branch sim-partysize-b (tip 02117e2e8),
worktree kept + heartbeated for the next adoption run.
