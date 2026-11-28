# Journey succession r293 — Lane B, leg 7 (succession) ADOPTION — EVIDENCE

Run lineage: r291 (1855Z play + 2200Z adoption + 2300Z adoption: 26-seed
panel, mourning-above-naming fix `07906b8ca`, tooling `ff06c3199`, postfix
panel launched 23:16Z, check.js launched 23:23Z) → r292 (0000Z adoption:
postfix panel resumed, check relaunched, died ~00:21Z) → this run (0100Z
adoption: stale-lock recovery, panel + check relaunched after a machine
restart).

- Prereg: r291's `journey-succession-r291-prereg.md` (frozen before any
  judged sim; seeds FRESH band 34590–34613, EARLY_KILL_DAY=40,
  POST_DAYS=70, + positive control 34403 + smoke 33998).
- Rotation-b reads 7 (succession); advances 7 → 4 only on a landed run.
- Worktree `~/workspace/worktrees/journey2-7`, branch `journey2-7`.
- Commits adopted (NOT on master yet): `07906b8ca` (fix + proof +
  postfix runner), `ff06c3199` (panel tooling). Evidence corpus commit
  still pending (see closeout).
- Main tree verified CLEAN at ~01:00Z (background `git status --short`,
  exit 0, empty output). Disk 57%.

## Stale-lock recovery (this run)

Lock `playtest-loop-2-20261128T0000Z` (created 00:05:30Z) deleted after
the full check: registry heartbeat for journey2-7 was 00:17:47Z
(>15 min stale), no live coordinator process, no live subagent for
this loop, no file writes in the tree after 00:21:28Z (r292.md +
r292 check log). The 0000Z run died ~00:21Z, 16 minutes in — cause
unestablished (no restart: uptime at 00:56Z was 1:48, machine up since
~23:08Z; its exec was likely SIGTERMed by the run limit machinery or
the turn ended). New lock `playtest-loop-2-20261128T0100Z` created
00:58:25Z. Heartbeat landed 00:58:25Z (manual), hbloop restarted,
registry beat confirmed 01:06:00Z.

## Machine restart mid-run (this run)

At ~01:09:44Z the machine restarted (uptime 2 min at 01:11:36Z). It
killed the relaunched r291fix panel mid-seed-34599 (stdout.json 0
bytes), the relaunched check.js --quick mid-run (~280 tests in, 5 F's
visible, no summary), the hbloop, and my own background sleep exec
(SIGTERM). Recovery, same pattern as the r246 adoption: heartbeat
re-established FIRST (01:12Z), write probe OK (fresh file written +
read + removed), panel + check relaunched with absolute paths.
Lesson recorded: the `cd X && setsid ... &` form backgrounds the
whole AND-list, so the `setsid` ran in the wrong cwd — the first
relaunch attempt ran check.js against the MAIN tree and the panel
resume failed with "No such file". Relaunched with absolute paths;
check.js resolves its ROOT from `__dirname`, so the absolute launch
tests the worktree correctly (dots appearing, workers spawning under
the worktree).

## What this run did

- Resumed the postfix panel: `scripts/run-journey-succession-r291fix-resume-20261128.sh`
  (skip-if-valid). Relaunched 01:12Z after the restart; 34590–34598
  skipped as valid, 34599 (first witness seed) re-running from
  01:12:56Z. Pace ~3.5 min/seed under load (panel + check concurrent);
  15 band seeds + 2 controls remain (~60 min) — the panel will NOT
  complete inside this run's remaining clock; the next run re-resumes
  with the same script.
- check.js --quick relaunched to a FRESH log
  `journey-succession-r293-check-quick.log` (the pre-restart partial
  log is superseded; its 5 F's were never identified — no summary
  printed. The F count is NOT carried as a verdict; the fresh run
  must go green or name its failures).
- Proofs re-verified by r292 on this exact tip (ff06c3199): r291
  mourn-above-naming 4/4, r280 mourn-shape-steer ALL PASS, r280
  driftnote-stage ALL PASS. No code changed since; not re-run this
  run.
- No new leg played; no new village assessment. r291's assessment
  stands. REL-WIT still unjudged until the r291fix analyzer lands.

## Panel / check status at closeout (01:44Z)

- Panel: seed 34603 running (started 01:37:19Z). Completed on the
  fixed tip so far: 34590–34602 (13 seeds). Witness seed 34599 DONE
  (exit=0); witness seeds 34604/34605 NOT yet run. Remaining: 34603–
  34613 (11) + controls 34403/33998 + analyzer (~40 min). The panel
  will die with this run's limit; the next run re-resumes with the
  same script (skip-if-valid).
- Check: `check.js --quick` COMPLETED 01:41Z — **333 passed, 11
  failed in 1499s** (log `journey-succession-r293-check-quick.log`).
  - 7× 120s TIMEOUTS (exit null, all with progressing ok/seed
    output, zero assertion failures): living-garden-deed-attainment,
    occupation-panels, one-person-army-deed-attainment,
    trust-observer-neutrality, synergy-stall, throttlefeast-20261014,
    capable-bot-20261014. Load flakes: the check ran concurrently
    with the panel right after a machine restart (load 16.83 at
    01:11Z). Same family as r287's adjudicated flakes.
  - 3× STANDING STALENESS (exit 1, fast, carried pre-existing per
    r287): measurement-proof-update ("Proof source inputs are not
    current"), measurement-workflow, phone-frame-proof ("every
    retained browser input matches current source" — branch behind
    master, proof hashes stale). NOT caused by the fix; NOT
    re-adjudicated here.
  - 1× measurement-cache-flags (exit 1, 81.8s, "FAIL two flags
    create four independent observer-on/off cache entries") —
    ADJUDICATED STANDALONE this run: **4/4 PASS, exit 0, 63s**
    (01:43Z). Load flake, confirmed; matches r287's 4/4.
- Gate adjudication batch launched 01:44Z
  (`scripts/run-r293-gate-standalone.sh`, log
  `journey-succession-r293-gate-standalone.log`): standalone re-runs
  of the 7 timeouts, sequential, 600s cap each. It will die with
  this run's limit partway through; the next run reads the log and
  finishes any test without a PASS line. Do NOT re-run
  measurement-cache-flags (done 4/4) or the 3 staleness tests (carried).

## Metric review

Nothing re-scored this run. r291's metric review stands (LATELY-DISPLACER
descriptive by design; WITNESS-CENSUS wording fix proposed for next
run; pilot-branch rule never fired).

## Telemetry deviation check (step 14)

Not run this run: belongs with the merge, on the completed r291fix
tele corpus. r291's verdict was EXPLAINED (sum-vs-mean checker
artifact + band variance), baseline NOT rolled per r280. Next run
runs it on the r291fix tele corpus before merging.

## Closeout state (final, 01:44Z)

- HOLD the lock and the tree: merge waits on the postfix panel verdict
  AND a green/adjudicated check. Lock `playtest-loop-2-20261128T0100Z`
  held deliberately (same sanctioned pattern as r288/r279/r291/r292).
  Heartbeat re-landed at closeout (see memory log).
- Next run: (1) confirm a heartbeat landed; (2) read the gate
  standalone batch log — finish any of the 7 timeout tests without a
  PASS line, then the gate is adjudicated (cache-flags already 4/4;
  3 staleness carried); (3) re-resume the postfix panel with the
  resume script if it died (skip-if-valid); (4) read the `r291fix`
  analyzer — judge REL-WIT on the post-fix panel (3-draw floor) and
  record the new smoke-33998 snapshot as moved-by-design; (5) commit
  the baseline corpus + r291.md + r292.md + r293.md + the postfix
  corpus + the resume script + the gate-standalone script (explicit
  file lists, NOT the whole evidence dir — ~700 files, 26M; consider
  chunked safe-commit.sh calls: scripts+md first, then corpus by
  prefix); watch for the safe-commit clobber and repair it the same
  way; (6) get a COMPLETED main-tree git status (clean) before
  touching master; rebase journey2-7 onto current master (branch
  base c1ff05ed6 is behind master 4504aa4d4), re-run the r291 proof +
  carried proofs on the rebased tip, then `git merge --ff-only
  journey2-7`; (7) run the telemetry check on the r291fix tele
  corpus; (8) release the tree, write rotation-b 7 → 4, delete
  the lock.
- NOTE: the witness seeds 34604/34605 have NOT run on the fixed tip
  yet — REL-WIT cannot be judged until the panel reaches them and
  the analyzer lands. Do not merge on the 34599 draw alone.
