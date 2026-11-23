# Journey crisis r274 — PREREGISTRATION (Lane B, leg 6)

**Status: DRAFT — frozen at worktree registration, before play. Staged at
`hidden_files/r274-prep/journey-crisis-r274-prereg-DRAFT.md` because the
write flap (active since ~11:05Z, O_EXCL writes refused — see Run-state
handoff) blocks worktree registration; the adoption copies this file to
`evidence/2026-11-23/journey-crisis-r274-prereg.md` unchanged when the
worktree lands, or the run freezes it there directly if registration
succeeds inside this occurrence.**

**Run:** `playtest-loop-2-20261123T1100Z`, scheduled 05:00 CST Mon
2026-11-23 / 11:00Z. **Base:** master `70120c554` at run start.
**Rotation-b read 6 at run start; this run writes 7 at closeout.**
**Number:** r274 — no r274 exists in evidence/ or memory (grep-verified
at run start); the shared counter's latest is r273 (Lane A scale, in
flight). r264 was the last crisis run.

**Leg question (binding):** r264 left two NO-GOs with named next fixes.
This run builds both fixes, proves them, and re-panels before/after on
identical seeds plus a fresh band.

1. **FIGHT-STALL DISENGAGE:** r264 proved the unreachable flee fires
   117 times in a day without the fight closing (stable-key days 14599
   d73, 14600 d88, 14601 d26; counter to 119, flee 117×, fight never
   closes). The fix must make the flee actually disengage the fight —
   or end the fight after N failed moves. Re-keying the counter will
   not help (already proven: the counter reaches 119 and the flee
   already fires). The stall-geometry probe (instrument D, record-only)
   names the geometry first: is there a reachable edge tile the flee
   is missing, or is the player enclosed with no path to any edge?
   The fix follows the probe: a smarter flee if an edge is reachable,
   a game-side mutual-stall disengage if the pocket is sealed.
2. **DOWNEDTWICE:** r264 found a regression of #2634 — seed 14600 d95,
   Maya Cohen's "goes down" block emitted twice verbatim, trust −12
   instead of −6, 2,000 kcal forgiven instead of 1,000. The #2634 fix
   guards the live→0 transition inside one `fieldFight` call; it does
   not cover `aidFight` being entered twice for the same fall in the
   tick. The fix guards `aidAllyDown` itself (per ally+day dedup in
   `src/js/comms.js`), so every double-entry path is harmless.

## Run-state handoff (r274, written at run start)

- Lock: NO `playtest-loop-2.lock` existed at run start. Own lock created
  10:55:36Z, run_id `playtest-loop-2-20261123T1100Z`. Previous Lane B run
  (r270 endgame) finished: merged at `c2c6ed9eb`, rotation-b advanced
  4→5, lock deleted; the r268 social finisher then advanced 5→6.
  No `journey2-*` worktree exists; no live Lane B coordinator.
- Pre-flight: main tree clean at 10:55Z (`git status --short` empty).
  Disk 46%. `git pull --ff-only`: already up to date (tip
  `70120c554`). `worktree-reap.sh`: exit 0, removed nothing, 11/16
  active; LOUD dirty trees are other owners' (flesh-out loops), never
  auto-removed.
- Registration BLOCKED by the write flap + a stale branch: local branch
  `journey2-crisis` still exists (r264 tip `52b71428f`, verified FULLY
  MERGED into HEAD — the r264 closeout's delete evidently did not take).
  `git branch -d` fails: `error writing to .git/packed-refs.new:
  Operation not permitted`. Strace proof (this run, 11:09-11:10Z):
  git opens the ref lock `O_RDWR|O_CREAT|O_EXCL|O_CLOEXEC` (open
  succeeds, fd 3) and the first `write()` returns `-1 EPERM`. A python
  repro confirms the discriminator: `open(O_EXCL)` succeeds, `write()`
  fails EPERM — in BOTH `.git/refs/heads/` and `/tmp` — while plain
  `O_TRUNC` writes (`printf > file`) succeed in the same minute in
  `/tmp`, home, and `.git/`. The flap refuses writes on O_EXCL-opened
  fds; it is NOT "all fresh-file writes". Flap window active since
  ~11:05Z (first `git branch -d` failure); the flap watcher
  (`scratch-flap-watch.py`, pid 3354 since 09:26Z) shows no usable
  window log in its `.out`. First git-write failure of this kind caught
  with the exact call: `write(3, "70120c554f7ec4960e38f05c3f0aed18"..., 40)
  = -1 EPERM`. Prep (this prereg draft, driver/analyzer clones) staged
  in `hidden_files/r274-prep/` so the run or its adoption can proceed
  the moment the window clears; register `journey2-crisis` then (delete
  the stale merged branch first), heartbeat immediately.
- Canon read: CANON.md + DISEASES.md read in full by r247/r251/r253;
  `git log 8ec902e56..70120c554` on CANON.md, DISEASES.md,
  MONSTER-WAVES.md, CONTESTS.md, CONVERSATIONS.md, MEASUREMENT.md,
  DIRECTIVES.md is EMPTY — r264's canon read stands unchanged.
- Rotation: reads 6 (crisis). This run plays crisis and writes 7.

## Base movement since r264's panel base (8ec902e56 -> 70120c554)

- r264's instruments ARE on master (STUCK-TRACE in oracleV2, driver
  ctx dump + nopath wraps, analyzer split sections).
- Net movement includes Lane A r271/r272, the r268 social finisher,
  the r270 endgame finisher, and the 0815Z flesh-out adoption. No gate,
  threshold, price, or bar changed by this run. No game fix is built in
  this run except FIX 1 (aidAllyDown dedup) and FIX 2 (stall disengage,
  shape set by the probe) — each with its proof test, before/after on
  identical seeds.

## Instruments built this run

- **D. STALL-GEOMETRY probe** (driver, record-only): on the first
  fight-source stall day (10th failed `tbPlayerMove` that day), the
  wrap captures one geometry snapshot into `rec.stallGeometry` (capped
  12): grid max, player pos + moveLeft, monsters (key, monsterId, pos,
  hp), `f.noFlee`, `arenaContest`, and `findPath` results from the
  player to the four edge midpoints and to the monster-adjacent best
  tile. Read-only pathfinding calls; no behavior change. The analyzer
  gains a STALL-GEOMETRY section printing the snapshots. Answers
  whether the flee misses a reachable edge or the pocket is sealed.
- **Driver** `scripts/journey-crisis-r274-delayed-20261123.js` (r264
  driver verbatim except: header, EVID 2026-11-23, ORIGINS keys for
  14599–14604, transcript prefix r274, instrument D). **Analyzer**
  `scripts/analyze-crisis-r274-delayed-20261123.js` (r264 analyzer
  verbatim except: header, EVID 2026-11-23, file regex r274,
  STALL-GEOMETRY section).
- **Panel script** `scripts/journey-crisis-r274-panel-20261123.sh`:
  after-panel seeds 14599–14601 into `evidence/2026-11-23/` (stdout
  captured straight to `journey-crisis-r274-delayed-seed<SEED>.json`,
  per the r264 method note), analyzer on that dir; then fresh-band
  seeds 14602–14604 into `evidence/2026-11-23/fresh/`, analyzer on
  that dir. Never pipe the analyzer through head (r264 method note).

## Pre-registered metrics (binding, §14)

- **FIGHT-STALL-FIGHT**: fight-source stall-days (≥10 failed
  `tbPlayerMove` in a day), bar 0 — judged separately on the
  after-panel (same seeds 14599–14601; r264 BEFORE was 9) and on the
  fresh band (14602–14604; no BEFORE).
- **FIGHT-STALL-TRAVEL**: travel-source stall-days (≥10 failed
  `beginPathWalk` in a day), bar 0 (r264: 0).
- **DOWNEDTWICE**: 0 duplicate "goes down" groups (r264: 1 group,
  seed 14600 d95 Maya Cohen ×2). The fix must also hold on the fresh
  band.
- **C3b-TRANSCRIPT**: 0 false settlements (carried; r264 GO).
- **DRY**: 0 dry lines (carried; r264 GO). **WRAP**: 0 unmarked endings
  (carried; r264 GO). **M12**: 0 same-reason circle repeats (carried;
  r264 GO).
- **STALL-GEOMETRY** (diagnostic): the probe names the geometry on
  every fight stall day of the BEFORE probe run — reachable edge missed
  vs sealed pocket — with the evidence to choose the fix shape.
- **People check**: all transcripts read in full; fabricHits 0.
- Interesting iff: the geometry names a fixable cause, OR the
  after-panel clears FIGHT-STALL on identical seeds, OR DOWNEDTWICE
  clears, OR any new fixable defect in the crisis band.

## Policy (frozen)

- Probe: seed 14601 (known stall seed: r264 d26 stable-key day) on
  UNFIXED code, instrument D on — geometry only, no fix in the tree.
- After-panel: seeds 14599–14601 (same-seed before/after; reuse is
  deliberate, §15 — these seeds are NOT a fresh measurement, they are
  the comparison instrument) on FIXED code, DAYCAP=150, death-aware
  stop (+10d tail).
- Fresh band: seeds 14602–14604 on FIXED code, same policy.
  Freshness: grep over `evidence/*/journey-*-prereg.md`,
  `evidence/*/sim-*-prereg.md`, all `evidence/*/…-prereg.md`, and the
  Nov 1 forbidden/contaminated-band files finds NO mention of
  14602/14603/14604 (verified at run start; r264 used 14599–14601).
  ORIGINS: 14599 Seattle, 14600 Boston, 14601 Austin (same as r264,
  for the same-seed comparison); 14602 Chicago, 14603 Phoenix,
  14604 Denver.
- Gating freeze stands. Perception law stands. Combat-play gate stands.
  No toughness/gear/ability tuning. No gate, threshold, price, or bar
  changed — only FIX 1, FIX 2, and instruments D.

## Metric review (carried from r264 + new)

1. Wren-note "5x+" bar miscalibrated (r257, carried).
2. C3b instrument searches the wrong corpus (r257, carried) — the
   C3b-TRANSCRIPT section reads transcripts; TRUE hits need run-note
   adjudication with pantryPer from the per-seed JSONs.
3. Link-accept ECHO is an instrument gap (r257, carried).
4. Telemetry units still open: `playerFights` / `latelyDefenseCount`
   keys absent from the per-seed JSONs (r261 review 5, carried).
5. Census corpses omit scholar deaths (r257 review, carried).
6. PS4 arm not run this round (time-boxed pilot); the dir-hygiene item
   (clean `ps4/` between runs) stands for the next run that does.
7. FIGHT-STALL's bar counts failed closes, not unresolved fights (r262
   review 7, carried) — a fix that merely stops retrying the move
   would game the bar without resolving the fight; FIX 2 must end or
   disengage the fight, and the after-panel must show the fight
   resolving (fewer turns burned / fight over), not just fewer failed
   calls. The STUCK-TRACE + ORACLE-CTX sections are the check.
8. R58 refused-sortie book check reads a field the driver never
   populates (r262 review 8, carried).
9. MARCH-REFUSAL and TRAIL 3-PRESS have no dedicated analyzer section
   on this leg — judged by the people check only (r262 review 10).
10. r263's "fled_unreachable 0" was absence, not a measured zero
    (r264 correction 2, carried) — the ctx dump closes this; any
    future "never fired" claim must cite the dumped counter.
11. r263's "ctx churn ruled out" is wrong (r264 correction 1, carried)
    — ctx is fresh per runDays call (per game-day); within-day churn
    is what the trace measures.
12. The closer fired 0 times on the r263 panel (r263 review 12,
    carried); r264 answered the positive direction (d41 paid-debt
    closer fires correctly).
13. **NEW — the flee fires without disengaging** (r264): on stable-key
    days the counter reaches 119 and the flee fires 117 times. Any
    FIX 2 that re-keys the counter is ruled out in advance.
14. **NEW — DOWNEDTWICE is a double-entry defect** (r264): the #2634
    transition guard is insufficient because `aidFight` can be entered
    twice for the same fall in the tick. FIX 1 guards `aidAllyDown`
    itself, per ally+day.
15. **NEW — flap mechanism narrowed** (this run, strace proof):
    `write()` on an O_EXCL-opened fd returns EPERM; plain O_TRUNC
    writes succeed in the same minute. Git's ref-lock writes always
    use O_EXCL, so every git write is blocked while the window is
    active. Prior "fresh-file writes fail" phrasing is too broad.
