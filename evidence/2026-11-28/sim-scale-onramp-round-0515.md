# sim-scale-onramp-round-0515 — coordinator record (ADOPTION RUN)

**Run:** fleshout-20261128T0515Z · **Loop:** A · **Axis:** scale-onramp (converging)
**Type:** ADOPTION + CLOSEOUT of dead run fleshout-20261128T0315Z, plus one
reconstruction arm. No new lever round was planned: this run's job was to
land the dead run's stranded work, not to start fresh arms.
**Master at closeout:** `fb12ee7db` (corpus restore). No push, no version
bump, no live verification — merged locally, pending ship.

## Run-start closeout (stale-lock recovery)

Lock `fleshout-20261128T0315Z` (created 03:22:17Z) was 118 min old at
05:19Z. Recovery checks, all recorded before deletion: no registry entry
for the run itself; its arms' heartbeats 04:53Z (~27 min stale, past the
15-min guard); no live coordinator process in `ps`; all three 0315Z
workers `done` in the subagent list; machine restarted 05:15Z (uptime 5
min at 05:19Z), which killed the coordinator mid-closeout. Lock deleted,
0315Z claim retired to `.DEAD`, my lock + claim written (0515Z).
Loop B 0430Z was possibly live at run start (agent running, sim-emptybow-b
heartbeat 05:04Z) — NOT touched. B has since finished on its own
(emptybow-b pilot NO-GO, fleerepair-b held unmerged at 7f228e1e5);
B's next run owns those branches.

Pre-flight: main tree clean (`git status --short` empty), disk 54%,
worktree reap at closeout (see §8). `git fetch origin master` at run
start: origin/master bf21c02bb (batch ship bump) — local master ahead
throughout; no stale-base risk on any merge here.

## Arm 1 — sim-fleefloor-a (adoption, NO-GO, merged fb4b4dcc8)

Adopted from the dead 0015Z run via the dead 0315Z run. Worker done,
NO-GO (primary + vDie), kill taxonomy METRIC-BROKEN. Band 112301–112308,
150d, competent verbatim, substrate SENSEEXPED=1 PARTYSIZE4=1
VETREENGAGE=1 FLEEREPAIR2=1 FIGHTALLY2=1. Armed wave-4 vKills 0 (bar ≥2),
floor-flees within one round 0/37 meetings, 0 holds in 177 recorded
wave-4+ fights, vDie 4 vs 2 (bar ≤ ctl+1 — failed on butterfly
divergence from low-wave holds, one of which directly killed).
Mechanism proven (proof 51/51) but the population it converts does not
exist on this band: wave-4 monsters carry 500–1,400 HP against ~40–100
dpr. Lever reverted per kill protocol (zero src/js in the merge).
Evidence: evidence/2026-11-27/sim-fleefloor-a.md (+ prereg, analysis
JSON, §15 panel compare: decision review_required on the two diverged
seeds only). Coordinator rebase onto master 2b25d4be0 clean, ff-only
merge, tree released, branch deleted.

**Corpus loss + reconstruction (this run's own incident, owned here).**
The worker's evidence §7 claimed the three per-seed corpora (ctl / arm /
ctl-rerun, 24 JSONs) were committed. They were not: commit fb4b4dcc8
holds 10 files, no perseed dirs. The coordinator (me) merged after
checking the 11-file diff stat without cross-checking §7's file list,
then `git worktree remove --force` deleted the untracked corpora. The
verdict survived (analysis.json + panels committed); the raw rows were
lost. Recovery, same run, fresh worktree sim-fleefloor-corpus-a:
reconstruction worker regenerated all three corpora (ctl deterministic,
rerun byte-identical 8/8; arm via FLOORFINISH lever re-applied from
prereg §1 + committed proof test, 51/51 green, lever reverted after),
analyzer re-run reproduces fleefloor-a-analysis.json exactly in every
field except `dir` paths, verdict unchanged NO-GO. Committed fb12ee7db
(25 files, zero src/js), merged, tree released, branch deleted.
Record: evidence/2026-11-27/sim-fleefloor-a-corpus-note.md.
**Lesson (coordinator discipline, add to the runbook):** `git show
--stat` every worker commit against the evidence file's own
committed-files list before merging, and never `worktree remove --force`
a tree whose `git status` never completed clean.

## Arm 2 — sim-capstoneready-a legs 1+2 (adoption, DIAG-GO + DIAG-GO, merged d2c726f65)

Leg 1 (0315Z worker, committed before the restart): capstone-readiness
recorder, band 113301–113308, 150d, competent verbatim. DIAG-GO —
tribute ever-ready 4/8 seeds (108 ready-days), ever-deliverable 2/8
(80 days); charter/feast never ready (0 days); delivery never attempted
(the bot has no verb). Evidence: evidence/2026-11-28/sim-capstoneready-a.md.

Leg 2 (this run's continuation worker, same worktree): teach the
competent policy the delivery verb (one new policy file, zero src/js).
DIAG-GO — delivery fires exactly as leg 1 predicted (113302 d83,
Avery+DeAndre; 113305 d140, Mara+Xavier), both ok:true, clean payment
(exactly the 2 named veterans off the roster), zero attempts elsewhere
(incl. the ready-but-not-deliverable split windows, which stayed
undelivered); proof 32/32 green before the pilot and after each of two
rebases; determinism byte-identical. Capstone-delivered bar 0/8 → 2/8;
seat still lesser on all 8 (scale is now the ONLY remaining unmet
full-seat bar on both delivery seeds). No post-delivery death spiral.
Evidence: evidence/2026-11-28/sim-capstoneready-a-leg2.md (+ analysis
JSON + leg-2 corpus). Worker merged ff-only to master (d2c726f65);
coordinator released the tree and deleted the branch.

New finding from leg 2 (filed, sim-findings.md:2782): the delivery
announcement "The seat is open" (table.js:218/:232/:246, all three
kinds) overclaims while the deed gate is still closed; the mercy-window
line "Nothing out there can take this from you" overpromises on food
while raids keep taking it (15 post-delivery raid lines on 113302, all
"Nobody's dead"). Small voicing fix, flag `[needs-eyes]` if landed.
Trailer spam reproduced with identical counts (already filed, not
re-filed); holdVoice collision gone on the delivery seed because the
delivery removed its speaker (already filed, not re-filed).

## Arm 3 — sim-scalerank-a (already landed by the dead run)

Verified on master, no action this run: commits 7b51cc891 / 805181149 /
a0e98dcf8 / 5c17676fa (DIAG-GO — stage 0 on 8/8, one link per village,
no polity ever; deaths 103/103 named). Branch already deleted by the
0315Z coordinator. Also verified on master: fourthseat-a (c52b0eb27),
callfirst-a landing (ab3c2637a; branch sim-callfirst-a deliberately
held per its landing note), scalecensus-a (6697c420f, c1b3f9121).

## Wall (this run's judged corpora, 48 configs)

| Corpus | national | table | wins | wave-4 | wave-5 | median |
|---|---|---|---|---|---|---|
| fleefloor ctl+arm (16) | 0/16 | 0/16 | 0/16 | 16/16 | 6/16 | 150d |
| capstoneready leg 1 (8) | 0/8 | 0/8 | 0/8 | 8/8 | 3/8 waves-bar-met | 150d |
| capstoneready leg 2 (8) | 0/8 | 0/8 | 0/8 | 8/8 | 4/8 reached | 150d |
| **pooled judged** | **0/32** | **0/32** | **0/32** | **32/32** | — | **150d** |

The scale wall stands in the same shape as every run since October:
villages reach wave 5, survive to day 150 at regional standing, and
never touch national. What moved this run is the seat road, not the
wall: the capstone bar is now 2/8 delivered (was 0/8, half artifact),
and on both delivery seeds scale is the single remaining unmet bar.
The floor branch is exonerated as a flee lever (fleefloor NO-GO); the
fights end on the hopeless read and on damage, not on the floor.

## Telemetry deviation check

Run by each worker on its own corpus (not re-run by the coordinator):
- fleefloor (reconstruction worker, `--allow-recorder-corpus`): 3 LOUD
  lines, identical both legs — national 12→0, table 16→0, wins 16→0.
- capstoneready leg 2 (continuation worker): 2 LOUD lines — national
  12→0, wins 16→0.
Verdict in both: **regime artifacts, no investigation item, baseline
NOT rolled.** The scale-wall baseline is the winseat regime (16-seed
runs with a seat stack); these are competent-verbatim pilots with no
seat stack, where the committed analyses record 0s on both legs. The
one wall movement this run (capstone-delivered 0/8 → 2/8) is the
delivery verb working as designed, not a regression.

## Metric review

- Pre-registered metrics bound every arm; no re-scoring happened in
  this run. Fleefloor's metric failure was itself the finding (the
  primary bar assumed a floor-within-one-round population that does
  not exist; the cost bar conflated lever cost with butterfly
  divergence) — its evidence §5 carries the revision proposal for the
  NEXT run (gate the override to wave ≥ 4; judge cost on held fights
  only; primary on the hold population). Not re-scored here.
- Capstoneready leg 2's frozen bars held on first read; its evidence
  §6 notes the attempt-log is the instrument for bar (b), and the
  d+1 snapshot lag is a recorder property the next arm must know.
- Coordinator lesson from the corpus loss (above): verify worker
  commits against the evidence file's own file list before merging.
  The reconstruction's verification standard (analyzer re-run
  reproducing the committed analysis exactly) is the bar for any
  future regeneration.

## Infrastructure

- Machine restart 05:15Z killed the 0315Z coordinator mid-closeout;
  this run is the adoption. Second restart-free window after that.
- Box load 11+ early in the run: `git status --short` timed out at
  280s twice (inconclusive, never treated as clean). Cause found: an
  orphaned `git status` (pid 20211, child of a killed exec) was still
  running and burning CPU — killed; subsequent git ops ran in seconds.
  The fleefloor rebase's first attempt died at its 280s timeout with
  its exit code masked by a `| tail` pipe (reported 0 falsely) — the
  rebase had not run at all. Re-ran without the pipe: clean in 15s.
  Lesson: never read a piped command's exit code as the git exit code.
- Registry lock held most of the morning by sibling playtest
  registration/reap; heartbeats skipped twice each on both adoption
  trees, all landed on retry. No reaper action touched any adoption
  tree. Reap at closeout: 13/16 active, LOUD lines only for other
  loops' dirty trees (departsafe-a, journey-deepening, winflee-b) —
  correctly not auto-removed, not mine to touch.
- Safe-commit index clobber struck the leg-2 worker 3× and the corpus
  worker 1× — repaired via the ls-tree pipe each time, commits
  verified correct. No clobber on the coordinator commits (fleefloor
  merge was a pure ff-only; this record is the first coordinator
  commit). No EPERM flap observed this run. Write-flap probes passed.
- `check.js --quick` NOT re-run on merged master: zero src/js changed
  across all three landings (fleefloor evidence/scripts only,
  capstoneready policy/scripts/evidence only, corpus evidence only);
  both workers' proof tests ran green on their rebased branches
  (fleefloor 51/51 pre-revert by design, capstoneready2 32/32 twice
  post-rebase). Standing profile from sibling runs: 337 passed / 7
  failed (120s timeouts under load, pre-existing).

## Convergence state

scale-onramp stays **converging** (NOT converged): the delivery verb
is proven and the capstone bar moves, but wins are still 0 everywhere,
national is still 0 everywhere, and the seat road now waits on a
single named wall — scale. The directive stands until the tracker
records this axis converged on measured evidence. food-economy stays
converging (untouched; sibling loop B). Rotation left at 3
(convergence work does not cycle it).

Next blanks, in order (from capstoneready leg-2 §7 + fleefloor §5):
1. **Sitting policy + national road** — the seat, at last: on both
   delivery seeds scale is the only unmet bar; the sibling
   scalerank-a arm is the live attempt at the road, the sitting
   policy is the missing half. Needs its own prereg.
2. **"The seat is open" voicing fix** (table.js:218/:232/:246) —
   small, `[needs-eyes]` if landed.
3. Charter-readiness diagnostic — still blocked until a band reaches
   national; do not run it on a competent band that never gets there.
4. Feast-bundle completion (open finding 2026-11-11).
5. Waiting-talk variety (scalecensus §7 arm #3, still open).
6. Death-cause recorder (scalecensus §7 arm #4, still open).
7. If the floor idea is ever revisited: gate to wave ≥ 4, judge cost
   on held fights only, primary on the hold population (fleefloor §5).

Claim deleted; lock deleted.
Evidence: evidence/2026-11-28/sim-scale-onramp-round-0515.md (this file).
