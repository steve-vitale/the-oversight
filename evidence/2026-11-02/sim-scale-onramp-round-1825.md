# Loop 1825Z coordinator evidence — scale-onramp round (run fleshout-20261102T1825Z) — LANDING PARTIAL + WON-FLAG CLARIFICATION

## Pre-registration (this round)

- Axis: scale-onramp (topmost non-converged axis; sibling Loop B 1730Z live
  on food-economy at run start, NOT touched — its trees, branches, lock, and
  evidence file were never written by this run).
- Arms (claim written before any sims, run_id fleshout-20261102T1825Z):
  - sim-npcdeadconf-landing: land the 1715Z npcdeadfilter-confirm branch.
  - sim-fightoutrec-landing: land the 1715Z fightoutcome-recorder branch.
  - sim-wonflag-clarify: resolve the 1715Z open caveat (Game.won=true with
    endReason over-other on 5/12 clean seeds) before any win claim.
- Standing directive: rotation file reads 3 but rotation stays suspended by
  the directive for this run (not advanced). Scale-onramp is NOT converged
  at closeout (see below) — the directive is not lifted by this run.
- Master at run start: 82b9d8649 (1715Z closeout tip). Master moved under
  this run by a concurrent landing agent (see Infrastructure).

## What this run PROVED (new measurement, not a re-score)

The 1715Z caveat is RESOLVED. Game.won=true + endReason over-other is a real
lesser-seat table win, not a flag artifact:

- The harness label 'over-other' (sim-harness.js:638-640) means only
  "engine ended, not village-lost" — it collapses table wins and nomad-road
  wins into one bucket, and the 1715Z driver never recorded tableProg, so
  the 5 clean wins looked ambiguous. The 1715Z driver's sayKept filter
  (succession/death lines + injection window only) also cannot show an
  ending scene, so absence of ending lines in those JSONs proves nothing.
- Probe: /tmp/wonflag-probe.js, saved as hidden_files/wonflag-probe-20261102.js.
  Same closecommit policy stack as the 1715Z driver (tribfloor leadfeast +
  windefer + seatdrive + fullseat-diag + titanroute + musterclose +
  mustergap), same env flags, mode 'herald', 250d cap, FULL say capture,
  output to stdout only (no repo writes). One process per seed.
- All 5 clean won seeds re-run individually, each reproducing its branch
  band row EXACTLY (days / endReason / won / scaleRank / maxWave):
  - 97333: 92d, regional, LESSER seat, phase done, path feared, taker
    Ruby Callaghan (self), final mercy ("Show mercy."). Full transcript
    ends with the table audit, the feared path, "You won. Say it plainly:
    you won. The village endures. The table signed."
  - 97336: 110d, regional, lesser, feared, mercy, Nadia Khoury (self).
  - 97338: 90d, regional, lesser, feared, mercy, Nkosinathi Olivier (self).
  - 97339: 92d, NATIONAL, lesser, feared, mercy, Elif Demir (self).
  - 97342: 90d, regional, lesser, feared, mercy, Zoltan Nagy (self).
- Road state was inactive (roadActive false) on all 5; the endings are
  table endings, not nomad-road endings. The only won=true setters in code
  are table.js (4 sites) and nomad.js endRoad (non-wiped); the transcripts
  + tableProg settle it as table.
- NOT proven: the filtered/control bands' won counts (4/12 each in 1715Z)
  were not re-run with tableProg and are NOT claimed here. The fightoutcome
  pilot's won counts (4/8) are likewise unjudged by this probe.

## Corrected wall numbers (1715Z clean band, now credible)

- National 1/12 (97339). Lesser-seat table wins 5/12. FULL seat 0/12.
  Wave-5 unlocks 0/12, wave 5 fought 0 (maxWave 4 on all won seeds).
  Median survival 90d (1715Z band figure, consistent with re-run days).
- This OVERTURNS the 1715Z review's "no credible national/table/win reach
  demonstrated" for the clean band: national + lesser table + wins ARE
  demonstrated on the closecommit stack. It does NOT overturn the deeper
  wall picture: the full seat is still unwon and wave 5 still unfought in
  normal play, so scale-onramp stays converging (NOT converged).
- Sense note (open finding, appended to sim-findings.md): all 5 wins are
  the SAME path and final (feared / mercy, self-taken lesser seat). The
  seatdrive stack's win funnel is narrow — win-path variety (other paths,
  other finals, full seat) is unproven, not just the full seat.

## Arm sim-npcdeadconf-landing — LANDED BY A CONCURRENT AGENT, VERIFIED BY THIS RUN

- At run start the branch was sim-npcdeadconf at 14b5c0674 (prereg
  8eaf5b629 + results 14b5c0674), worktree present and clean.
- During this run (between ~18:26Z and ~18:38Z) a concurrent landing agent
  merged npcdeadconf to master: reflog shows "merge sim-npcdeadconf:
  Fast-forward" to 6a7a6e454 (rebased equivalents of the same 2 commits),
  then journey-landing r88, sim-destfirst-b, and sim-collapseband-b merges
  to master 61e019a85. The npcdeadconf branch and worktree were deleted by
  that agent. This run did not perform that merge and did not race it.
- Verification by this run (read-only + pure proof scripts, no ref writes):
  - Arm-file diff 14b5c0674 vs 6a7a6e454 over ledger.js, both proof tests,
    the driver, and both evidence md files: EMPTY (rebase preserved content).
  - Master src/js/ledger.js contains the deadMarked guard.
  - Proofs re-run on master, all green: npcdeadfilter-confirm-test 18/18,
    npcdeadfilter-confirm-deadspeak-test 9/9, test-npcdeadfilter-a 14/14.
    The proof scripts contain no file writes (grep verified), so running
    them in the main tree left it clean.
  - Verdict: npcdeadfilter-confirm is LANDED (master 6a7a6e454, inside
    61e019a85). The 1715Z CONFIRM PASS stands; the dead neither inherit
    nor speak on master.
- The concurrent agent did NOT commit coord-1715-pending-evidence.md as
  evidence/2026-11-02/sim-scale-onramp-round-1715.md and did NOT add the
  tracker landing addendum. Both are still owed (see Recovery).

## Arm sim-fightoutrec-landing — NOT LANDED, FRESH REBASE OWED

- At run start: branch sim-fightoutrec at 6ad9d537d (5 commits), worktree
  present, clean, with the stale rebase-merge dir (0-byte head-name +
  interactive, HEAD unchanged) left by the 1715Z flap.
- During this run the concurrent landing agent rebased fightoutrec onto
  82b9d8649 (reflog: "rebase (finish) ... onto 82b9d8649"), new tip
  66be62122 (same 5 messages, new hashes), then removed the worktree and
  its .git admin dir. It did NOT merge fightoutrec.
- Verification by this run: arm-file diff 6ad9d537d vs 66be62122 over the
  recorder, driver, analyzer, proof test, and both evidence md files:
  EMPTY (rebase preserved content). Proof files exist on 66be62122.
- Why this run did not finish it: (1) 66be62122 is now stale-based — master
  moved to 61e019a85, so --ff-only merge of 66be62122 FAILS; it needs a
  FRESH rebase onto current master + proof re-run first. (2) Sibling Loop B
  is LIVE in closeout at this run's end (lock fleshout-loop-b-20261102T1730Z
  held since 17:30Z; registry writes at 18:42Z; B's evidence file
  evidence/2026-11-02/sim-food-round-1730.md appeared in the main tree
  during this run). Rebasing/merging into the main tree while B closes out
  risks racing its closeout. Per the closeout rule, re-check liveness
  immediately before any rebase/merge; this run chose not to race.
- Status: recorder RECORDER GO stands, but do NOT cite it as landed until
  merged. Registry still lists sim-fightoutrec as active with a stale path
  (worktree removed without release) — the recovery run must release it
  (or correct the registry) after merging; do not let the reaper's
  stale-tree handling delete the branch (branches are not trees).

## Telemetry deviation check

Prescribed invocation on the (now master) npcdeadfilter-confirm corpus
(36 per-seed JSONs, evidence/2026-11-02/perseed-npcdeadfilter-confirm/):
REFUSED with the same class as 1715Z — "all 36 --current rows carry
top-level anchorCommit, so they are sweep recorder rows, not runs."
No LOUD lines. Baseline NOT rolled. No --update-baseline, no
--allow-recorder-corpus used.

## Infrastructure — flap cleared mid-run; concurrent landing; incomplete lock check (this run's miss)

- EPERM flap ACTIVE at run start (18:26Z): worktree-reap.sh failed on the
  registry atomic write (PermissionError) and a main-tree probe ref write
  failed (.git/refs/heads/probe-flap-1825.lock). Flap CLEAR by 18:38Z
  (probe branch create+delete succeeded). No ref surgery was attempted
  by this run while the flap was active.
- Concurrent landing agent merged 4 branches (npcdeadconf, journey-landing
  r88, destfirst-b, collapseband-b) and rebased fightoutrec during this
  run. This run's merges were verified, not repeated — a successor landing
  is the system working.
- THIS RUN'S MISS, recorded honestly: the run-start concurrency check
  read only fleshout-loop.lock (absent) and missed fleshout-loop-b.lock
  (held by B since 17:30Z). No harm resulted (different axis, nothing of
  B's touched), but future runs must check ALL lock names
  (fleshout-loop.lock, fleshout-loop-b.lock, playtest-loop-2.lock) before
  acting, not just their own loop's name.
- B's evidence file appeared in the main tree during this run and was
  committed by B before this run's final status check (status empty at
  closeout apart from B's own activity window). This run wrote nothing
  into the repo tree.
- Rotation file left at 3 (not advanced; directive suspended rotation).

## Findings backlog changes by this run

- Won-flag item (measurement, 2026-11-02, sim-npcdeadfilter-confirm):
  [open] -> [fixed] — resolved by the 5-seed tableProg probe above.
- Recorder item wording corrected: the recorder is rebased (66be62122),
  NOT landed — "landed" in the 1715Z item was premature.
- New [open] item: win-funnel narrowness — all 5 proven wins are
  feared/mercy self-taken lesser seats; other paths/finals/full seat
  unproven.

## RECOVERY (next run — scale-onramp blank 0, do NOT re-run judged sims)

1. Re-check liveness FIRST: all lock files + registry heartbeats + recent
   main-tree writes. If any coordinator is live, do not rebase/merge.
2. Verify flap clear with a probe branch create+delete (remove the probe).
3. Register a worktree for sim-fightoutrec ONLY if its admin dir is truly
   gone (worktree-register.sh, do not bare `git worktree add`); otherwise
   work from the branch with a fresh checkout. Rebase sim-fightoutrec
   (tip 66be62122) onto current master, re-run scripts/test-fightoutcome-a.js
   (expect 40/40), then in main: git merge --ff-only sim-fightoutrec,
   verify commits, worktree-release.sh sim-fightoutrec merged, remove
   worktree, delete branch. Correct the stale registry entry if release
   does not clear it.
4. Commit hidden_files/coord-1715-pending-evidence.md as
   evidence/2026-11-02/sim-scale-onramp-round-1715.md WITH a landing
   addendum naming BOTH merges (npcdeadconf 6a7a6e454 verified by run
   1825Z with proofs 18/18 + 9/9 + 14/14 on master; fightoutrec merge tip
   + proof count from step 3). Add the short landing addendum line to
   the 1715Z tracker review (do NOT re-append the review or findings).
5. Commit this file as evidence/2026-11-02/sim-scale-onramp-round-1825.md
   (with its own landing addendum if step 3 lands in the same run).
   Do NOT re-append this run's tracker review or findings items.
6. Telemetry check on any newly landed corpus only if the tool gains a
   shape for it; otherwise record the refusal class again, baseline NOT
   rolled.
7. worktree-reap, verify main tree clean, delete claim + lock.

## Tracker review text (append verbatim on recovery — this run appends its own review below; the recovery run must NOT re-append it)

## Latest review — run fleshout-20261102T1825Z (axis scale-onramp — 1 arm LANDED-BY-SUCCESSOR and verified + 1 arm REBASED-BUT-UNMERGED + won-flag caveat RESOLVED, flap cleared mid-run)

Run fleshout-20261102T1825Z, axis scale-onramp (topmost non-converged axis; sibling Loop B 1730Z live on food-economy, NOT touched). Claim written before any sims; retired to .DEAD at closeout with a recovery note; lock deleted. Pre-flight: main tree clean at 82b9d8649, disk 24%, reaper flap-blocked (registry atomic write EPERM). Master moved under this run by a concurrent landing agent (npcdeadconf + journey-landing r88 + destfirst-b + collapseband-b merges to 61e019a85); main tree clean at closeout.

Arm sim-npcdeadconf-landing: LANDED BY SUCCESSOR, VERIFIED BY THIS RUN (rebased 6a7a6e454 inside master 61e019a85; arm-file diff vs original branch tip EMPTY; proofs on master green 18/18 + 9/9 + 14/14). Dead neither inherit nor speak on master.

Arm sim-fightoutrec-landing: REBASED BUT NOT MERGED by the concurrent agent (tip 66be62122 onto stale base 82b9d8649; arm-file diff vs original tip EMPTY; worktree + admin dir removed without release; registry entry stale-active). Fresh rebase onto current master + proof re-run + merge owed; deliberately NOT raced against live Loop B closeout (B lock held since 17:30Z, registry writes 18:42Z).

Arm sim-wonflag-clarify: CAVEAT RESOLVED — Game.won + over-other IS a lesser-seat table win. All 5 clean won seeds re-run individually with full transcripts + tableProg on master code, each reproducing its branch row exactly: 97333/97336/97338/97342 regional + 97339 national, ALL lesser seat, path feared, final mercy, self-takers. Wall now credible: national 1/12, lesser wins 5/12, FULL seat 0/12, wave-5 0/12. Filtered/control won counts NOT re-proven and NOT claimed.

Telemetry: prescribed invocation REFUSED the npcdeadfilter corpus (anchorCommit recorder-row class, same as 1715Z). No LOUD lines, baseline NOT rolled.

Infrastructure: flap active at start (reap + probe ref write EPERM), clear by 18:38Z. This run's miss: run-start lock check read only fleshout-loop.lock and missed fleshout-loop-b.lock (B live throughout) — no harm (other axis, nothing of B's touched), but future runs must check all lock names. Rotation left at 3 (not advanced).

scale-onramp stays converging (NOT converged): national + lesser table now demonstrated, overturning the 1715Z "no credible reach" line for the clean band — but full seat 0 and wave 5 unfought keep the axis open. Next blanks, in order: (0) fightoutrec fresh-rebase landing + commit both pending evidences (coord-1715 as round-1715, coord-1825 as round-1825); (1) re-screened fight-positive herald-chain band judged from outcome rows (now possible once the recorder lands — require scripts/fightoutcome-recorder.js, judge from outcome rows not won flags); (2) full-seat reach: why a national village (97339) still takes the lesser seat; (3) win-funnel variety: feared/mercy is the only proven path/final — other paths, finals, and non-self takers unproven; (4) heralddepart departure-telegraph design question (Steve-call territory if it touches feel); (5) npcdeadfilter follow-ups: live-sim transcript of the accepted-before-death refusal line, debate-notices-death design question; (6) STEVE-CALL: committed blade as bearer (options a–d, unchanged); (7) stores-draw upkeep proposal (Steve-call, unchanged).

Claim retired to .DEAD (with recovery note); lock deleted.
Merged locally, pending ship (npcdeadconf arm only, by successor + verified here; fightoutrec pending fresh-rebase landing).
Coordinator evidence: PENDING at hidden_files/coord-1825-pending-evidence.md (repo commit owed by the recovery run — this run wrote nothing into the repo tree while Loop B closed out).

## ADDENDUM 2026-11-02 ~18:57Z — sim-findings.md LOSS + RESTORE STATUS (read this before touching sim-findings.md)

LOSS: during this run's findings update (~18:48Z), python open('w') truncated live sim-findings.md and the content write failed with EPERM (container flap). Live file left at 0 bytes. This run caused it and reports it loudly.
BACKUP VERIFIED: sim-findings.md.bak-20261031T1830Z, 1,317,730 bytes, 1651 lines, sha256 6179b4dd9e7e11f55f268b4167236a92120646c78eec31f1009c65b9f8844fa4, tail ends cleanly. Live file was 1,416,841 bytes at 18:24Z, so ~99KB of items appended 2026-10-31T1830Z–2026-11-02T18:48Z are missing from the backup.
RESTORE ATTEMPTED AND BLOCKED: at ~18:56Z this run attempted the flap-safe restore (cp backup to sim-findings.restored, cmp, build sim-findings.new with banner + re-appended items, mv over live file). The cp itself failed with EPERM mid-write and the .new write flushed 0 bytes; the LIVE file was NOT touched by the attempt (still 0 bytes) and the partial temp files were removed. The procedure is sound — it needs a proven-clear write window.
RE-APPLY ON RESTORE (exact texts in run 1825Z final report; do not re-derive from memory): banner line + 1715Z 5 items (from coord-1715-pending-evidence.md "Findings backlog items", backticks stripped) with 2 substitutions — won item replaced by its [fixed] resolution (5/5 lesser-seat table wins proven, probe hidden_files/wonflag-probe-20261102.js), recorder item corrected from premature 'landed' to 'rebased (66be62122) but NOT merged as of run 1825Z' — plus the 1825Z win-funnel-variety [open] item. All other Nov 1–2 items: reconstruct from repo evidence files + tracker reviews where sourceable; list anything unrecoverable as an explicit gap line, NEVER as invented content.
RULE FROM NOW ON: never open('w') the live sim-findings.md or convergence-tracker.md — append-only or copy-temp-verify-rename. This is the same flap class that destroyed the tracker three times (2026-10-18/19/24).
ALSO STILL OWED (from this run, flap-blocked at first attempt, tracker review itself DID land on retry): commit this file as evidence/2026-11-02/sim-scale-onramp-round-1825.md + commit coord-1715 as round-1715.md with landing addendum (npcdeadconf 6a7a6e454 verified 18/18+9/9+14/14; fightoutrec merge from fresh rebase) + fightoutrec fresh-rebase landing (tip 66be62122 is stale-based; rebase onto current master, proof 40/40, merge --ff-only, release, delete branch). Re-check liveness (all lock names) before any rebase/merge.


## LANDING ADDENDUM — run fleshout-20261102T2215Z (coordinator landing)

- This evidence file was committed by the 2215Z recovery run from the
  pending coordinator copy; the won-flag probe and verdicts were NOT
  re-run. fightoutrec (the recorder this evidence depends on) was
  fresh-rebased this run from 66be62122 onto master 76d8b68fa, proof
  40/40 on the rebased tip, merged --ff-only to master 19ad05107,
  ancestor-verified in the same call. Recorder is LANDED.
- sim-findings.md restore and the heraldband pilot are handled
  separately in the 2215Z run record; see the tracker review for
  run fleshout-20261102T2215Z.
