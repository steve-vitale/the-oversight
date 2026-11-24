# Journey — Crisis r278

**Run:** `playtest-loop-2-20261124T0200Z`, scheduled 20:00 CST Mon 2026-11-23 / 02:00Z Tue 2026-11-24.
**Seeds:** after-panel 14599–14604 (same-seed before/after; r274 AFTER is the BEFORE) + fresh band 14605–14607. **Base:** master `7344d8a56`.
**Rotation-b read 6 at run start; this run writes 7 at closeout.**
**Prereg (frozen):** `evidence/2026-11-24/journey-crisis-r278-prereg.md`.

## Leg question (prereg)

Build r274's three named residual FIGHT-STALL levers plus the C3b
false-settlement gate, prove each, and re-panel before/after on
identical seeds plus a fresh band: (1) sealed-pocket strike instead of
flee; (2) sealed-arena no-flee, close and fight instead; (3)
partial-progress flee; (4) gate the "settled" closer on the ledger
favor when the thread label is 'that debt'.

## Run-state handoff

- Lock: NO `playtest-loop-2.lock` existed at run start. Own lock created
  01:58:28Z, run_id `playtest-loop-2-20261124T0200Z`. Previous Lane B run
  (r277 social) finished and merged (`f0398bba6`); rotation-b advanced
  5→6. No `journey2-*` worktree existed; no live Lane B coordinator.
- Pre-flight: main tree clean at 01:55Z. Disk 50%. `git pull --ff-only`:
  already up to date (tip `7344d8a56`). `worktree-reap.sh`: exit 0,
  removed nothing, 14/16 active (LOUD dirty trees are other owners').
- Registration landed (~7 min under load; registry-lock jam — a live
  Loop A registration holding REGISTRY.lock — also delayed heartbeats
  repeatedly this run: "registry lock held > 120s — heartbeat skipped"
  at the hbloop's first cycle and again after the fix commit. The
  hbloop retries every 10 min; manual heartbeats landed between jams.
  The jam is the known ongoing registry contention, not a dead run —
  a later occurrence MUST check for live coordinator processes before
  treating a stale heartbeat as death (this run's hbloop pid + panel
  pid are live; see Closeout).
- Worktree verified clean at `7344d8a56` (an early `git status` during
  the still-running checkout showed phantom deletions — the checkout
  was mid-flight; re-check after completion: status empty,
  `git diff HEAD` empty, all files present).
- Canon read: `git log 70120c554..7344d8a56` on CANON.md, DISEASES.md,
  MONSTER-WAVES.md, CONTESTS.md, CONVERSATIONS.md, MEASUREMENT.md,
  DIRECTIVES.md is EMPTY — r274's canon read stands unchanged.

## FIX 1 — SEALED POCKET (strike instead of flee)

`scripts/policies/oracleV2.js`, `pocketSealedFight` + `fleeBlocked`:
when no edge tile is affordable AND a live monster is in weapon range
(and the player is not already on an edge, and the fight is not an
arena), the flee is blocked and the fight code strikes instead. The
seal test reuses the flee's own cheapest-edge scan (memoized per
position+moveLeft), so the gate and the flee agree on what "affordable"
means.
Proof: `scripts/test-journey-crisis-r278-fight-levers-20261124.js`
§1 — RED before (flee fires, moves to (0,4), no strike), **GREEN
after** (fled 0, fledBlocked_neardeath ≥ 1, struck 1 on the adjacent
monster, no move attempted).

## FIX 2 — SEALED ARENA (no flee; close instead)

`scripts/policies/oracleV2.js`, `barrierSealed` + `fleeBlocked` +
`altClose`: the game's own sealed condition (`state.arenaContest ||
f.noFlee` — the exact condition tbBarrierExit uses to hold the
barrier) blocks every flee call site. When the unreachable-flee is
blocked in a sealed arena, the policy closes instead: `altClose` tries
the target's other adjacent tiles nearest-first and steps along the
first reachable path (partial progress via `stepAlong`). A successful
step resets the stuck counter; a wholly unpathable ring leaves the
counter up and the turn ends (the monster must come to the player).
The normal close path is untouched — altClose only runs when the flee
is blocked.
Proof: same test file §2 — RED before (unreachable flee fires, player
stays (4,7), barrier attempted), **GREEN after** (fled_unreachable 0,
fledBlocked_unreachable ≥ 1, altCloses 1, player stepped to (4,6),
barrier never attempted).
Mechanism note (from the r274 d100 evidence, re-verified this run):
the close fails with "No path there." on the FIRST-choice adjacent
tile — the monster sits across unpathable ground. The alt-close is
what makes "close and fight instead" real; blocking the flee alone
would leave the 13 failed closes in place (each turn already spends
its close attempt before the flee fires).

## FIX 3 — PARTIAL-PROGRESS FLEE

`scripts/policies/oracleV2.js`, `stepAlong` + flee rewrite: when no
edge tile is affordable, the flee walks as far along the cheapest
edge's path as moveLeft allows (tbPlayerMove's own cost accounting)
instead of failing in place against the old target. Only when no step
at all is affordable does it fall back to the old target (fails
honestly — the stall is still reported, not hidden). The flee's edge
scan is now the shared `cheapestEdge` helper (same scan the pocket
gate uses).
Proof: same test file §3 — RED before (flee aims at old target (8,4),
player stays (7,4)), **GREEN after** (fled_neardeath 1, flee steps to
(7,5), moveLeft 0, old target never aimed at).
Full file: **15/15 GREEN** (was 2 pass / 13 fail RED before the fixes).

## FIX 4 — 'THAT DEBT' CLOSER GATE

`src/js/conversation.js`, `convoCloseLine`: the want-thread gate now
anchors on the ledger favor whenever the thread label is 'that debt'
(the repay label IS the favor's debt label), in addition to the
sitting-favor anchor (r263) and the kind-label match (r201).
Mechanism (diagnosed from the wild transcript, seed 14603 d84): the
sitting opened with a RESUME of the old favor thread, so the fresh
want's opener never ran and `c.want.favor` was never set — the r263
anchor requires it, and the kind-label match fails ('that debt' ≠
'that water haul'). The closer fired while the recap still said
"Still on that debt" and the NPC had just said "The debt stays on
their face."
Proof: `scripts/test-journey-crisis-r278-debt-closer-20261124.js` —
RED before (A1 + E1 fail: the closer fires on the favorless shapes),
**GREEN after (PASS, 0 failed)**. Controls hold: fulfilled favor
still closes (B1), unrelated 'that visit' thread still settles despite
the pending broken favor (C1, r201 anchor protection), favor-carrying
repay still withheld (D1, r263 regression guard).

## Regression proofs (re-run on the fixed tree)

- r264 stuck-trace: **16/16 GREEN**.
- r274 nearest-edge: **8/8 GREEN**.
- r274 aidallydown: **19/19 GREEN**.
- r263 settled-closer: **PASS, 0 failed**.
- check-wired: conversation.js 0 unwired; oracleV2.js 23 unwired, all
  pre-existing policy helpers (none of the new closures — they live
  inside v2Fight and are called from within).

## Commit

`76ecf5edbbc0b1e78361f492dabb77843ce32a2a` (safe-commit): FIX 1–4 in
`scripts/policies/oracleV2.js` (+228/−37) and `src/js/conversation.js`
(+11/−2), both proof tests, the r278 driver/analyzer/panel clones,
and the frozen prereg.
- INDEX CLOBBER (known class, AGENTS.md 2026-10-22/23): after the
  commit, the worktree's MAIN index showed the 8 committed files
  staged-as-deleted (D) plus MM on the two modified files, while the
  worktree files are byte-identical to HEAD — the commit itself is
  correct. Resync via `git read-tree HEAD` was running at timeout
  (the prescribed post-private-index step); the finisher MUST verify
  `git status --short` is empty before any rebase/merge, and if the
  clobber persists use the ls-tree repair pipe
  (`git ls-tree HEAD -- <paths> | git update-index --add
  --index-info`), never a reset.

## Panel — PENDING (finisher handoff)

- After-panel launched detached: `setsid nohup bash
  scripts/journey-crisis-r278-panel-20261124.sh after` (pid 23439),
  seeds 14599–14604 into
  `hidden_files/evidence/2026-11-24/`, analyzer on that dir. The
  occurrence timed out before the panel finished; the panel keeps
  running detached. The finisher MUST check the panel log
  (`hidden_files/evidence/2026-11-24/journey-crisis-r278-panel-after.nohup.log`)
  and the per-seed JSONs before judging — do NOT re-run seeds that
  already completed.
- EARLY (seed 14599, finished exit 0, 112 days, game-over): 0 fight
  stall days, 0 travel stall days (same as r274 AFTER on this seed);
  oracleCtx fled 45 / fled_unreachable 8 / struck 23 (r274: 50 / 3 /
  27 — one seed, do not over-read); stuckTrace carries 7
  'flee-blocked' entries (3 neardeath:pocket, 2 nodeed:pocket, 2
  outmatched:pocket, 1 nodeed:arena at d119) — the fixes ARE engaging
  in the wild.
- INSTRUMENT GAP (this run, corrects the prereg): the analyzer's
  ORACLE-CTX section gained the `fledBlocked_*` counters, but the
  driver's `mergePolicyCtx` sums a FIXED key list that does not
  include them (or `altCloses`) — so the per-seed JSONs' oracleCtx
  has no fledBlocked keys and the analyzer prints null/0 for them.
  The signal is NOT lost: `traceStuck` records every block as a
  'flee-blocked' entry (why:seal) in `rec.stuckTrace`, which the
  driver DOES dump. The finisher should count 'flee-blocked' entries
  in stuckTrace per seed for the FIX 1/2 signal (and add the keys to
  `mergePolicyCtx` in a follow-up commit if the counters are wanted
  in oracleCtx — do NOT restart the running panel for it).
- Fresh band (14605–14607) NOT yet run — the finisher runs
  `bash scripts/journey-crisis-r278-panel-20261124.sh fresh` after
  the after-panel completes.
- Panel numbers, village assessment, people check, metric review, and
  the reachable/fun/winnable verdict are ALL owed by the finisher —
  they depend on the panel output, which did not exist at timeout.
- Gate (`check.js --quick`) NOT run — owed by the finisher on the
  rebased tip.

## Metric review (partial — panel-dependent items owed by finisher)

1. The bar counts failed closes, not unresolved fights (carried) —
   FIX 1–3 must show fights resolving, not just fewer failed calls;
   STUCK-TRACE + ORACLE-CTX (incl. the new `fledBlocked_*` counters)
   are the check.
2. C3b's "true" bucket needs the adjudication step every run — keep it.
3. `fled_unreachable` + `fledBlocked_*` are the FIX 1/2 signals
   (preregistered secondary metrics).
4. The r274 closer gate misses the repay label when the sitting
   carries no favor — FIXED this run (FIX 4); the r263 test's staged
   shape (favor-carrying repay) never covered the wild shape.

## Gate — PENDING (finisher)

Not run in this occurrence (panel unfinished at timeout). Owed on the
rebased tip before merge.

## Closeout — PENDING (finisher handoff)

- Worktree: `~/workspace/worktrees/journey2-crisis`, branch
  `journey2-crisis`, base `7344d8a56`. Committed below (safe-commit);
  NOT merged. Lock `hidden_files/playtest-loop-2.lock` still held
  (run_id `playtest-loop-2-20261124T0200Z`) — DO NOT delete until the
  merge lands; the lock protects the unmerged worktree from the next
  Lane B run. Heartbeat loop `journey2-crisis-hbloop-r278.sh`
  (setsid nohup, 10-min cycle) is live — check it is still running
  before trusting the registry heartbeat; the registry lock has been
  jammed by a live Loop A registration for much of this run.
- Finisher steps, in order: (1) verify the detached after-panel
  finished (or wait for it — do NOT kill it and re-run completed
  seeds); run the analyzer if the panel script did not; (2) run the
  fresh band; (3) write the panel numbers + village assessment +
  people check + metric review + verdict into this run note (commit
  2); (4) gate on the rebased tip if master moved (rebase + re-run
  proofs first); (5) `git merge --ff-only journey2-crisis` in the
  main tree; (6) `bash scripts/worktree-release.sh journey2-crisis
  merged`, `git worktree remove --force` + `git branch -d
  journey2-crisis`, `bash scripts/worktree-reap.sh`; verify main tree
  clean; (7) write rotation-b 6→7 (read back); (8) telemetry check
  (`--baseline .../telemetry-baselines/crisis.json --metrics
  defendedFights`); (9) delete the lock LAST, same-call per-line
  run_id match; (10) append to `~/memory/2026-11-23.md` and the goal
  tracking entry.
- Do NOT bump, push, or verify live — the ship loop owns those.

---

## Adoption — 0300Z finisher (INTERIM, panel still running)

**Stale-lock recovery.** Lock `playtest-loop-2-20261124T0200Z`
(created 01:58:28Z) was 65+ min old; registry heartbeat for
`journey2-crisis` was 02:43:34Z (17+ min stale, past the 15-min bar);
no live `oversight-playtest-loop-2` coordinator exists (subagent list:
only flesh-out workers live); the detached after-panel pid 23439 is
dead; seed 14603's JSON was 0 bytes and 14604 never ran. The r278
hbloop (pid 14979) is still alive but its beats are not landing
(registry-lock jam — a manual heartbeat also failed: "registry lock
held > 120s"). Per the 2026-11-18 lesson the live-process check came
first: only the heartbeat loop survives, not a coordinator. Lock
deleted after run_id match (same call); new lock
`playtest-loop-2-20261124T0300Z` created 03:04:37Z. VM restart ~01:31Z
(uptime 1:35 at 03:06Z) predates the 0200Z run; the panel died with
the coordinator's timeout, not the restart. Load 12–23 during this
run; plain `git status` hangs on restat, so tree state was verified
with index-only commands.

**Worktree verified (nothing taken on trust).** HEAD `76ecf5edb` on
master `7344d8a56` (== current master HEAD, no rebase needed). All 8
committed files hash-match HEAD (`git hash-object` vs `git ls-tree
HEAD`). **`git diff --cached` is EMPTY — the index is clean.**
The index clobber the 0200Z run left pending is RESOLVED: the
`git read-tree HEAD` resync evidently completed before the timeout
killed the run (or the restart let it finish); no ls-tree repair was
needed and none was applied. The pending verification is closed.

**Proofs re-run independently on this tree:** fight-levers **15/15**;
debt-closer **PASS, 0 failed**; regressions r264 stucktrace **16/16**,
r274 nearest-edge **8/8**, r274 aidallydown **19/19**, r263
settled-closer **PASS**. All match the 0200Z run's numbers.

**Panel resume launched detached** (setsid nohup, pid 34230, script
`hidden_files/journey-crisis-r278-panel-resume.sh`, log
`hidden_files/evidence/2026-11-24/journey-crisis-r278-panel-resume.nohup.log`):
re-runs ONLY seed 14603 (killed mid-run) + 14604, then the
after-analyzer; then fresh 14605–14607 + the fresh-analyzer.
Transcripts overwrite (`fs.writeFileSync`), so the 14603 re-run is
clean. The analyzer cannot run on a partial dir — it crashes on the
empty 14603 JSON (`JSON.parse`, analyzer:29); the resume overwrites
14603 first, then runs it.

### Interim panel analysis (4/6 after seeds complete: 14599–14602)

Computed from the per-seed JSONs with the analyzer's own rule
(stall-day = day with ≥10 failed `tbPlayerMove` by source, from
`nopathBySource.fight`). **Interim only; the analyzer's verdict is
the judge.**

- **FIGHT-STALL-FIGHT: 3 stall days, 0 travel (interim NO-GO vs bar
  0).** 14600 d43: 236 failed calls; 14600 d73: 22; 14601 d52: 236.
  r274's after-panel on the same seeds was 2 (14600 d78, 14601 d100).
- **The named r274 residual days are clean on the new code:** 14600
  d78 and 14601 d100 show 0 failed calls. The fixes engage in the
  wild: stuckTrace `flee-blocked` entries 7 (14599), 5 (14600), 8
  (14601). But the stall count moved 2→3 via NEW mechanisms on
  different days. (Same-seed comparison is confounded by the base
  move 70120c554→7344d8a56 — a panel comparison, not a bit-identical
  replay.)
- **NEW MECHANISM A — flee with moveLeft 0 (14600 d43, 14601 d52;
  236 fails each).** Snapshot at the 10th failure: player already ON
  an edge ((0,1) / (3,0)), moveLeft 0, edges reachable (west cost 1 /
  north cost 1), monster far (`spool` (7,5) hp 325 /
  `congregation` (3,7) hp 900), noFlee false, arenaContest false.
  Code path (`scripts/policies/oracleV2.js`, `flee()`): with moveLeft
  0, `cheapestEdge().best` is null (no cost-0 edge); the cheapest
  path has length 1 (the player already stands on the edge tile), so
  FIX 3's partial-progress branch (`cheapestPath.length > 1`) never
  engages and the flee falls to the old target — the tile the player
  already stands on — failing honestly 236 times in the day. `flee()`
  never checks moveLeft. Open sub-questions for the next run: why the
  turn starts with moveLeft 0 (exhausted/slowed fighter?), and why
  the flee's opening `pushThrough()` does not end the fight when the
  player already stands on the edge.
- **NEW MECHANISM B — sealed pocket, monster out of strike range
  (14600 d73; 22 fails).** Player (4,7) moveLeft 3, `influencer`
  (4,5) hp 696, ALL edge paths null. Distance 2 — outside weapon
  range 1 — so FIX 1's pocket gate (monster in range) does not
  engage; the close code (`v2Fight:587`, not the flee) tries to path
  to the monster's adjacent tiles and `findPath` returns null, 22×.
  Next lever: the policy has no working action here — wait for the
  monster to close, or the game-side mutual-stall disengage the r274
  prereg named as FIX 2's alternate shape.
- **ORACLE-CTX secondary (interim):** `fled_unreachable` 8 / 133 /
  120 / 2 vs r274's 3 / 4 / 21 / 2 on the same seeds. The counter now
  counts flees fired while no edge is affordable — including
  moveLeft-0 flees and partial-progress flees — so it is NOT a
  failure count under the new code and is not comparable to r274's
  618→28 as a "collapse". `fledBlocked_*` / `altCloses` are null in
  the per-seed JSONs (the `mergePolicyCtx` gap noted above); the
  signal is recoverable from stuckTrace `flee-blocked` entries (see
  above). Total `fled` is roughly flat (14600: 173→166; 14601:
  88→151 — the fight mix moved with the base). `struck` 23/16/50/5.
- **DOWNEDTWICE (interim):** 0 "goes down" lines in the completed
  transcripts → 0 duplicate groups. Analyzer to confirm.
- **C3b-TRANSCRIPT (interim):** no "that debt, settled" lines in the
  completed transcripts. Analyzer + sitting-read adjudication to
  confirm (the prereg requires the adjudication step).
- **Ends:** 14599 game-over day 112; 14600/14601/14602 horizon 150.

### TODO for the closing finisher (supersedes the 0200Z handoff's panel items)

1. Wait for / check the resume panel (pid 34230): seeds 14603+14604,
   analyzer-after, fresh 14605–14607, analyzer-fresh. Read
   `journey-crisis-r278-analyzer-after.log` +
   `fresh/journey-crisis-r278-analyzer-fresh.log` (in
   `hidden_files/evidence/2026-11-24/`).
2. Adjudicate C3b from the analyzer's hits (sitting read); read the
   stall-day transcripts in full (people check: all transcripts,
   fabricHits 0 bar).
3. Replace the interim section above with the analyzer verdicts +
   village assessment + reachable/fun/winnable verdict; extend the
   metric review (see below); add the Gate section.
4. Run `node scripts/check.js --quick` on the tip; adjudicate
   failures against the standing-5.
5. `git merge --ff-only journey2-crisis` in the main tree (base is
   current; if master moved, rebase first + re-run proofs), rotation-b
   6→7, telemetry check (crisis baseline, `defendedFights`), release
   the worktree + delete the branch, delete the lock LAST (same-call
   read + run_id match, lock is now
   `playtest-loop-2-20261124T0300Z`).
6. No push, no bump, no live verification — ship loop's job. Report
   "merged locally, pending ship".

### Metric review (added by the 0300Z finisher)

5. The `fled_unreachable` secondary metric changed meaning under FIX
   3: it now counts flees fired while no edge is affordable (incl.
   working partial-progress flees), so the r274 "618→28 collapse"
   framing no longer reads as a fix signal. Propose for the next run:
   judge the secondary on stall-days + `fledBlocked_*` (once the
   `mergePolicyCtx` key list carries them) instead.
6. The analyzer cannot run on a partial panel dir (crashes on an
   empty per-seed JSON). A skip-empty-file guard would let a finisher
   read interim verdicts without waiting for the full panel.
7. The two new residual mechanisms above (moveLeft-0 flee; sealed
   pocket with monster out of range) are the named next levers — do
   not re-score this run against them; the frozen bar (0 stall days)
   already judges the run NO-GO on the interim count.

---

## Restart + relaunch (0300Z finisher, 03:27Z VM restart)

- **VM restart ~03:27Z** (uptime 9 min at 03:36Z; third restart of
  the day after ~01:31Z and the ~03:05Z runtime restart) killed the
  relaunched resume panel (pid 34230) mid-seed-14603 AND the r278
  hbloop (pid 14979). No work lost: seed 14603's JSON was still 0
  bytes (written only at process end) and its partial transcripts
  overwrite on re-run.
- **Relaunched 03:37Z (setsid, both verified alive):** hbloop pid
  3662 (`~/workspace/journey2-crisis-hbloop-r278.sh`, 10-min cycle);
  resume panel pid 3663 (seed 14603 again, then 14604, analyzer,
  fresh 14605–14607, analyzer). If the machine restarts again, the
  next occurrence relaunches the same way — the resume is idempotent.
- **Registry-lock jam persists after the restart:** manual heartbeat
  at ~03:38Z failed again ("registry lock held > 120s"). The lock is
  genuinely held, not stale — `REGISTRY.lock` mtime 03:38:50Z and
  `fuser` lists live holders (pids 2070, 2072, 3958, 3960, 3994,
  3995). No action: the hbloop retries every 10 min. Registry
  heartbeat for `journey2-crisis` still 02:43:34Z (~57 min stale at
  03:40Z; reaper threshold ~4h, tree safe for now).
- **The 0300Z finisher's window ends with the panel still running**
  (seed 14603 re-run in flight). Everything above is the handoff:
  the closing finisher picks up at "TODO for the closing finisher".
  Lock `playtest-loop-2-20261124T0300Z` is HELD (created 03:04:37Z)
  — do NOT delete until the merge lands.

---

## Closing finisher — 0500Z (panel complete, verdicts + closeout)

**Stale-lock recovery (0400Z run dead).** Lock
`playtest-loop-2-20261124T0400Z` (created 04:02:40Z); registry
heartbeat for `journey2-crisis` 04:27:41Z (33+ min stale, past the
15-min bar); no live `oversight-playtest-loop-2` coordinator (ps
clean; subagent list: no active loop-2 agents — only Lane A
`journey-deepening` live at 05:00Z, a different job). The 0400Z run
finished the panel (see below) but timed out before writing its
note section or closing out; its resume2 panel and hbloop are both
dead (no node processes). Per the 2026-11-18 lesson the
live-process check came first. Lock deleted after run_id match
(same call); new lock `playtest-loop-2-20261124T0500Z` created
05:06:02Z. VM up since the 03:27Z restart (uptime 1:36 at 05:03Z)
— no new restart. Registry heartbeat re-landed manually 05:07:53Z
(registry-lock jam had cleared; Lane A's 05:00Z registration done).

**0400Z run's recovered work (no note section left; reconstructed
from file timestamps + logs).** Resume2 panel
(`journey-crisis-r278-panel-resume2.nohup.log`): seeds 14603
(04:30) + 14604 (04:37) complete, analyzer-after ran 04:37; fresh
14605–14607 complete (04:40/04:45/04:48), analyzer-fresh ran 04:48.
All 9 seeds + both analyzers done — nothing re-run, nothing
re-scored.

## Panel verdicts (analyzer is the judge; frozen bars from prereg)

**After-panel (seeds 14599–14604, same seeds as r274):**
- FIGHT-STALL-FIGHT (R262, ≥10 "No path there."/day): **3 stall
  days — NO-GO vs bar 0.** 14600 d43 (119), d73 (22); 14601 d52 (11).
- FIGHT-STALL SPLIT (R264, failed calls by source): **4 fight / 0
  travel — NO-GO.** Adds 14603 d83 (30).
- FIGHT-STALL-TRAVEL: 0 — GO.
- DOWNEDTWICE: GO (5 lines, 0 dups). DRY: GO (48 transcripts, 0
  dry). M12: GO (8 circles, 0 repeats). DODGE-ARTICLE: GO (0).
  LINK-ACCEPT parrot: GO (0 parrots; 4 accepts). STRANGER: VACUOUS
  (0 kills — no signal either way).
- C3b-TRANSCRIPT: **TRUE 4 — adjudicated below, CONFIRMED defects
  — NO-GO vs bar 0.**

**Fresh band (seeds 14605–14607):**
- FIGHT-STALL-FIGHT: **1 stall day — NO-GO.** 14606 d104 (11).
- FIGHT-STALL SPLIT: **2 fight / 0 travel — NO-GO.** Adds 14606
  d108 (235).
- DOWNEDTWICE GO (1 line, 0 dups), DRY GO, M12 GO, DODGE GO,
  LINK-ACCEPT GO, STRANGER VACUOUS.
- C3b-TRANSCRIPT: **TRUE 4 — adjudicated below — NO-GO.**

**The named r274 residual days are clean.** 14600 d78 and 14601
d100 show 0 failed calls on the new code. The fixes engage in the
wild: **99 flee-blocked entries across the 9 seeds** (after 45,
fresh 54; `w` values pocket/arena × neardeath/nodeed/outmatched/
unreachable), altClose resets present (14603 ×2, 14604, 14605,
14606 ×2), struck 274 after / 150 fresh. But the stall count moved
2→3/4 via NEW days on different fights. (Same-seed comparison is
confounded by the base move 70120c554→7344d8a56 — a panel
comparison, not a bit-identical replay.)

## Stall-day fight reads (all six days read from stuckTrace + geometry + stacks)

- **Mechanism A — already standing on the edge tile (14600 d43,
  14601 d52, 14603 d83):** player stands ON an edge tile
  ((0,1)/(3,0)/(0,4)) with moveLeft 0; monster far (spool (7,5) hp
  325 / congregation (3,7) hp 900 / buffering (6,5) hp 193). The
  flee's cheapest path is length 1 (the tile it stands on), so FIX
  3's partial-progress branch (`cheapestPath.length > 1`) never
  engages and the flee falls to the old target — its own tile —
  failing 236/236/30 times (117/117/13 flees, stuck counter to
  119/119/14). The close fails alongside (inc+flee alternate all
  day). The fight never resolves.
- **Mechanism B — sealed pocket, monster out of range (14600 d73,
  14606 d104):** all edge paths null; player (4,7) moveLeft 3;
  monster 2 away (influencer hp 696 / eulogy hp 554) — outside
  weapon range 1, so FIX 1's pocket gate never engages; the close
  path (v2Fight:587) `findPath` returns null, 22/11 fails. No
  working action: wait for the monster to close, or a mutual-stall
  disengage (the r274 prereg's named alternate).
- **Mechanism A+B combined (14606 d108, fresh):** player (2,8)
  moveLeft 3 — already on the bottom edge; monster influencer (3,2)
  hp 850, 6 away across unpathable ground; edges north:10/south:1
  reachable. Close fails (:587) AND flee fails (own tile) 235
  times — 119 incs, 117 flees, stuck to 119, fight never resolves
  all day.
- **Next levers (for the next crisis run, NOT re-scored here):**
  (1) the flee must treat "already standing on an edge tile" as an
  exit (barrier exit / pushThrough) instead of pathing to its own
  tile — this one change covers d43/d52/d83/d108; (2) the close must
  give up after `findPath` null instead of retrying 100+ times a
  day (cap, or wait-for-monster); (3) mechanism B's disengage.

## C3b adjudication (all 8 TRUE lines read in full sittings)

- **After TRUE 4 — Alba Lindqvist, 14600 d32 + d33: CONFIRMED
  FALSE SETTLEMENT.** Favor `forage_help` BROKEN in both sittings
  ("You said you'd help with the pantry run. ...It's handled now,
  not by you. Forget it."). The sitting says "that one's settled" /
  "settled, and counted" and closes "Good — what's been happening,
  settled" — while the recap in the SAME sitting says "Still on
  that debt" (twice in d33). Closer and recap disagree about one
  debt in one conversation.
- **Fresh TRUE 4 — split.** Yutong Jiang, 14607 d33: CONFIRMED
  FALSE SETTLEMENT (same shape: favor BROKEN, "that one's
  settled", recap "still on that debt" ×2). Felix Khan, 14606 d47:
  the favor (`sick_help`) is THANKED — the player did come through
  on the sickness, so "we're square" / "that debt, settled" is TRUE
  for the favor — but the recap still says "Still on that debt"
  twice: a STALE RECAP, the same contradiction from the other side.
- **FIX 4 coverage gap, named:** (a) the mid-sitting dlg:cant
  settle lines ("No — that one's settled. I just like saying it
  out loud.") are not `convoCloseLine`, so the gate never sees
  them; (b) Alba d33's closing line carries the label 'what's been
  happening', not 'that debt', so FIX 4's label anchor misses while
  the debt thread stays open per recap; (c) the recap reads the
  thread label, not the favor state, so it goes stale when a favor
  closes (Felix). C3b bar (0 false settlements) NOT met. The r274
  Raul shape is fixed for the exact label; the family persists.

## Village assessment (plain words)

Nine villages, 150-day horizon except two that died out. **14599:
wiped out day 112, nobody left. 14605: wiped out day 137, nobody
left.** The seven survivors ended thin: 14600 down to one person
(Thien) with an empty pantry; 14601 the bloodiest (14 deaths) yet
the most alive (7: Gladys, Sigrun, Olivia, Fatima, Omar, Amelia,
Raj) with 555 in the pantry; 14602 three left (Maya, Valeria,
Mateo), pantry empty, Luis died of thirst day 48; 14603 six left
(Raul, Victoria, Dumisani, Ines, Greta, Adaeze), pantry 4826;
14604 six left (Gaya, Ines, Raj, Ella, Petra, Benoit), pantry
16352 — the best-fed village; 14606 two left (Aki, Nikolai),
pantry 6500, Ben Garcia died in the arena day 34; 14607 three left
(Vasyl, Tangaroa, Siphokazi), pantry empty, Oscar Costa died in the
arena day 46. **66 deaths recorded across the nine villages**; most
death records carry no name ("Someone", "A person, maybe 30s") —
the census knows people died, not who. The scholar died mid-run in
two villages (Mateo Wang on expedition day 8 in 14601; Omar Sato of
sickness day 5 in 14607) and the village carried on. Every village
faced 7–13 raids; the villages that lived did so hungry — four of
nine ended with an empty pantry.

## People check

72 transcripts read by the analyzer (48 after + 24 fresh);
fabricHits 0; DRY/M12/DODGE/LINK-ACCEPT all GO. The four C3b
sittings above were read in full: the people in them talk like
people — Alba nursing a grudge about a pantry run someone else
finished ("It's handled now, not by you"), Felix genuinely grateful
about the sickness ("You came through... I won't forget it"),
Yutong trusting the player with a secret about stolen rations —
but the game's own bookkeeping contradicts them mid-conversation
(settled vs still-on-debt in the same sitting). The defect is in
the wiring between the recap and the closer, not in the voices.
The stall-day fights are the opposite: nobody talks, the fighter
just fails to move 100+ times a day — the village's defender stuck
in place while a monster waits is a person-shaped hole in the day,
not a conversation.

## Metric review (extends the 0300Z items 5–7)

8. **R262 and R264 disagree on 14603 d83 (5 lines vs 30 failed
   calls)** — the line counter understates; the split (failed
   calls) is the stricter instrument. Propose for the next run:
   judge FIGHT-STALL on the split, keep R262 as the cross-check.
9. **`fled_unreachable` secondary retired as a fix signal** (per
   0300Z item 5): after-panel 288 vs r274's 28 — the counter now
   counts working partial-progress flees too. Judge the secondary
   on stall-days + `fledBlocked_*` from stuckTrace (99 this run)
   instead. The `mergePolicyCtx` gap (fledBlocked_* null in
   oracleCtx) stands — fix in a follow-up commit, do NOT restart
   the panel for it.
10. **C3b's "true" bucket needs the sitting-read adjudication
    every run (kept):** this run the TRUE hits split 3
    false-settlement + 1 stale-recap — the bucket is not a
    false-positive filter, it is the finding.
11. **The analyzer still crashes on a partial panel dir** (empty
    per-seed JSON) — the skip-empty guard proposed in item 6 is
    still owed.

## Reachable / fun / winnable verdict (leg 6, crisis)

- **REACHABLE: yes** — crisis content (raids, sieges, arena,
  favors, debts) fires on every seed; 7–13 raids per village, 8
  driven conversations per seed, defense beats throughout. Nothing
  in this run was unreachable.
- **FUN: mixed.** The conversations are the fun — real grudges,
  gratitude, secrets, and the village carrying on after the scholar
  dies. The fights are not: a defender spending a whole day failing
  to move 100+ times while a monster waits is the opposite of a
  fight — it is a stuck screen the player watches. The stall days
  are the fun-killer in this leg, and they survived four fixes.
- **WINNABLE: no verdict from this leg** — crisis is the middle of
  the run, not the win; no village here reached the table. What this
  run shows is that the crisis middle is survivable (7/9 villages
  reached day 150) but thin (1–3 alive in 4 of them, pantries empty
  in 4 of 9) — the village that reaches the endgame arrives
  exhausted, which is the winnability question, not a crisis verdict.

## Overall run verdict: NO-GO on the frozen bar

FIGHT-STALL 3/4 after + 1/2 fresh vs bar 0; C3b TRUE hits
confirmed as defects vs bar 0. The four fixes land (proofs green,
99 flee-blocked engagements, named residual days clean) and are
worth shipping as progress — the stall fight is narrower than
r274's (the same 2 residual days gone; the new days are the
already-on-edge trap) — but the bar is the bar. Next levers named
above (edge-tile exit, close give-up, disengage, recap/closer
agreement).

## Gate — 339 passed, 5 failed in 679s, 0 attributable

On the rebased tip `0ebfffe1b` (base master `88d63d9fc`):
`node scripts/check.js --quick --cacheDirectory=/tmp/jest-cache-playtest2`.
Log: goal `hidden_files/check-quick-r278-rebased.log`.

Failures (all 5 adjudicated, 0 attributable):
1. `test-measurement-proof-update.js` — "Proof source inputs are not
   current" (balance-proof manifest vs retained panel).
2. `test-measurement-workflow.js` — "retained neutrality proof covers
   the current Game/controller/harness inputs" (same manifest
   comparison).
3. `test-phone-frame-proof.js` — retained browser inputs stale:
   index.html, alienPlayers.json, build-notes.json, foreignSpeech.json,
   regions.json, statusEffects.js.
4. `test-living-garden-deed-attainment.js` — TIMEOUT after 120s.
5. `test-one-person-army-deed-attainment.js` — TIMEOUT after 120s.

Attribution (verified, not assumed): the retained panel's recorded
hashes match NEITHER base NOR tip — conversation.js recorded
`30bcf3c3…` vs base `73081e4e…` vs tip `e7d5b1ff…`; oracleV2.js
recorded `919da88a…` vs base `4e488e8c…` vs tip `5454f682…`. The
proof was already stale on master (manifest 534 keys vs panel 532
sources — the comparison fails on base regardless of this run), so
failures 1–2 are pre-existing. Failure 3's stale inputs are files
this run never touched. Failures 4–5 are load timeouts (load 6–7,
4 parallel; the r277 gate had 9 failures under its load).

Proofs re-run on the rebased tip: fight-levers 15/15, debt-closer
PASS, r264 stucktrace 16/16, r274 nearest-edge 8/8, r274
aidallydown 19/19, r263 settled-closer PASS; check-wired
conversation.js 0 unwired, oracleV2.js 23 unwired (same pre-existing
count as the 0200Z run).

Telemetry: quiet on both panels (`defendedFights`, 6 after + 3 fresh
files, no large deviations). Baseline NOT rolled forward — no LOUD
lines, nothing to investigate.

## Closeout — PENDING (merge + release + rotation in the main session; recorded in the memory log)

