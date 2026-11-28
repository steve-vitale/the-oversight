# Journey succession r292 — Lane B, leg 7 (succession) ADOPTION — EVIDENCE

Run lineage: r291 (1855Z play + 2200Z adoption + 2300Z adoption: 26-seed
panel, mourning-above-naming fix `07906b8ca`, tooling `ff06c3199`, postfix
panel launched 23:16Z, check.js launched 23:23Z) → this run (0000Z
adoption: stale-lock recovery, postfix panel resumed, check relaunched).

- Prereg: r291's `journey-succession-r291-prereg.md` (frozen before any
  judged sim; seeds FRESH band 34590–34613, EARLY_KILL_DAY=40,
  POST_DAYS=70, + positive control 34403 + smoke 33998).
- Rotation-b reads 7 (succession); advances 7 → 4 only on a landed run.
- Worktree `~/workspace/worktrees/journey2-7`, branch `journey2-7`.
- Commits adopted (NOT on master yet): `07906b8ca` (fix + proof +
  postfix runner), `ff06c3199` (panel tooling). Evidence corpus commit
  still pending (see closeout).

## Stale-lock recovery (this run)

Lock `playtest-loop-2-20261127T2300Z` (created 22:59:03Z) deleted after
the full check: registry heartbeat for journey2-7 was 22:40:20Z
(>15 min stale), no live coordinator process, no live subagent for
this loop, no file writes in the tree after 23:34:10Z (check-quick
log), machine restarted ~23:08Z (uptime 49 min at 23:57Z) — the 2300Z
run died ~23:34Z when its exec was SIGTERMed, tearing down its
detached panel + check mid-run (same SIGTERM-tears-down-setsid-children
lesson as 2026-11-24). New lock `playtest-loop-2-20261128T0000Z`
created 00:05:30Z. Heartbeat landed 00:06:12Z, refreshed 00:10:19Z
(readback confirmed both times).

## What the 2300Z death left behind

- Postfix panel (`r291fix`) died after 4 seeds: 34590–34592 exit=0 with
  valid JSON; **34593 stdout.json TRUNCATED** (mid-write kill, "Unexpected
  end of JSON input", no tele file). No r291fix analyzer — the panel
  never reached it. The witness seeds (34599/34604/34605) never ran, so
  REL-WIT is still unjudged on the fixed tip.
- check.js --quick died ~11 min in, 186-byte log, **4 F's in the first
  ~50 tests, failing tests unidentified** (summary never printed). The
  merge gate stays closed until a full green run identifies or clears
  them.

## What this run did

- Resumed the postfix panel: `scripts/run-journey-succession-r291fix-resume-20261128.sh`
  (skip-if-valid: 34590–34592 skipped, 34593 re-run, then 34594–34613 +
  34403 + 33998 + analyzer; baseline PREFIX=r291 never touched).
  Launched detached (setsid nohup, pid 62986) 00:09Z, appending to the
  existing `journey-succession-r291fix-panel.log`. Verified live:
  34593 re-ran clean (valid JSON, 582,793 bytes), 34594 exit=0
  (669,174 bytes), 34595 in progress at 00:15Z. Pace ~2 min/seed;
  ~19 seeds + 2 controls remain (~45–60 min). It may die with this
  occurrence like its predecessor — the next run re-resumes with the
  same script if so.
- Proof tests re-run on the current tip, ALL PASS: r291
  mourn-above-naming 4/4 cases; r280 mourn-shape-steer ALL PASS; r280
  driftnote-stage ALL PASS.
- check.js --quick relaunched detached (setsid nohup, pid 66822,
  `--cacheDirectory=/tmp/jest-cache-playtest2`) to a FRESH log
  `journey-succession-r292-check-quick.log` (the 2300Z partial log is
  superseded, kept for the F-count record above). 71 dots, 0 F's at
  00:16Z — too early to judge.
- Main-tree `git status --short` (pre-flight): STILL RUNNING after
  ~15 min in the background (113,157 tracked files + heavy load; two
  sibling loops' statuses also spinning). INCONCLUSIVE this run —
  reported as such, not as clean. The merge is deferred to the next
  run anyway; that run must get a completed status before merging.
  Disk 54% — fine.
  UPDATE 00:20:55Z: the background status COMPLETED, exit 0, EMPTY
  output — main tree verified CLEAN at 00:20:55Z (took ~18.5 min).
  Pre-flight clean check now satisfied as of that timestamp; the next
  run should still re-verify before merging, since siblings land
  constantly.

## Village assessment / people check / verdicts

None new this run — no new leg played; this run adopted r291's
succession leg. r291's assessment stands (see
`journey-succession-r291.md`): mantle passes cleanly in every village,
158 mourning sittings by name, witness-grief hole pinned 3/3 and fixed
by the reorder; REL-WIT still unjudged until the postfix analyzer
lands. Reachable/fun/winnable verdicts unchanged from r291.

## Metric review

Nothing re-scored this run. r291's metric review stands (LATELY-DISPLACER
descriptive by design; WITNESS-CENSUS wording fix proposed for next
run; pilot-branch rule never fired — stage the supply screen so pilot
seeds carry a witness sitting, or drop the pilot branch).

## Telemetry deviation check (step 14)

Not run this run: r291's verdict was EXPLAINED (sum-vs-mean checker
artifact + band variance), baseline NOT rolled per r280. The telemetry
check belongs with the merge — next run runs it on the completed
r291fix tele corpus before merging.

## Closeout state (for the next Lane B run)

- HOLD the lock and the tree: merge waits on the postfix panel verdict
  AND a green check. Lock `playtest-loop-2-20261128T0000Z` held
  deliberately (same sanctioned pattern as r288/r279/r291).
- Next run: (1) confirm a heartbeat landed; (2) read the `r291fix`
  analyzer — judge REL-WIT on the post-fix panel (3-draw floor) and
  record the new smoke-33998 snapshot as moved-by-design; (3) read the
  r292 check log — must be green; if F's, identify the failing tests
  and whether the fix caused them; (4) commit the baseline corpus +
  r291.md + r292.md + the postfix corpus + the resume script
  (explicit file lists, NOT the whole evidence dir); watch for the
  safe-commit clobber and repair it the same way; (5) get a COMPLETED
  main-tree git status (clean) before touching master; rebase
  journey2-7 onto current master (branch base c1ff05ed6 is behind
  master bf21c02bb), re-run the r291 proof + carried proofs on the
  rebased tip, then `git merge --ff-only journey2-7`; (6) run the
  telemetry check on the r291fix tele corpus; (7) release the tree,
  write rotation-b 7 → 4, delete the lock.
- If the postfix panel died with this occurrence, re-run the resume
  script (it skips valid seeds) rather than starting over.
