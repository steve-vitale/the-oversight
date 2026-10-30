# Loop B run fleshout-loop-b-20261029T2330Z — axis food-economy
## STALE-LOCK RECOVERY + 1 arm LANDED + 1 arm HELD UNMERGED (base drift), merged locally pending ship (arm 1 only)

Run: oversight-flesh-out-loop-b, scheduled 18:30 CDT (23:30Z) 2026-10-29.
Axis: food-economy (second non-converged axis; loop A live on scale-onramp
the whole run under its 2115Z claim — w5counts + shoutrec — NOT touched;
A landed shoutrec mid-run as 2192ff080, which is what drifted arm 2's base).

## Stale-lock recovery at start (dead B run 2030Z)

The previous B run's lock (fleshout-loop-b-20261029T2030Z) and both its
worktree heartbeats (20:59Z / 21:03Z) were >2h stale at 23:36Z, no
lackingline3/raidname processes were running, its raidname-collision arm
was committed-but-unmerged and its lackingline3 arm was mid-screen
(262/400). Per the body guard both rules agreed the run was DEAD: lock
deleted, claim retired to .DEAD with a note, both arms ADOPTED by this
run (not dropped). Pre-flight: main tree clean, disk 21%, reaper removed
nothing (all flagged trees carry uncommitted changes and were left alone;
active trees 8/16, under cap).

## Arm 1 — sim-raidname-collision-b-land: LANDED (backlog #1451 residual (2))

Adoption of the dead run's finished arm (evidence commit 33122091d).
Rebase onto master: first attempt stopped in the known corrupted-todo
state (same pick listed as done and remaining, clean tree) — aborted to
the worker's exact commits and re-ran clean with GIT_SEQUENCE_EDITOR=true
(second attempt green, same precedent as the 2130Z run). Arm files
byte-identical across the rebase (scripts + evidence + analyses diff
empty). Proof re-run post-rebase AND post-merge, full corpus mode:
**33 pass / 0 fail / 0 skip**. Merged --ff-only as a051538aa (4 commits:
prereg, amendment, proof, evidence); tree released done-merged, branch
deleted. No src/js change (the arm's only game-adjacent file,
scripts/fightorigin-trace-b.js, is a COLLISION_TRACE-gated instrument,
default OFF).

Verdict (worker's, judged against its prereg + amendment):
**MECHANISM-PROVEN / FREQUENCY-OPEN.** v2 all-fights census, 40 seeds:
0 collisions (COLLISION-A 0, COLLISION-B 0) on 134 fights, 95 raid
lines, 0 unclassified, 61 dawn-raid mornings; opportunities OPP-B 0,
OPP-A-WINDOW 0; shadows 65 set / 65 consumed / 0 orphaned. Both misfire
mechanisms are fixture-proven given their configurations (B1: non-raid
pending resolving while a same-species raidBorn lingerer sits on the
player tile; A1: orphaned shadow after a non-matching fight). So the
caveat is real but did not fire once on the band — a frequency
measurement (zero in 40 villages x 30 days), NOT a closure. Named next
measurement (not this arm's work): a TARGETED leg staging the B1
configuration in live sims and counting B-collisions per staged
configuration. More blind seeds are NOT the next step. Fix
recommendation documented, NOT built: gate path (b) on provenance,
consume-or-clear the shadow on ANY startCombat pending-clear, clear the
shadow on exile/succession pending clears. Residual (3) (browser
ordering) stays open; [needs-eyes] stays on the raidname wording commit.

Telemetry deviation check on the landed corpus: 3 LOUD lines (national
12->0, table 16->0, wins 16->0) — the KNOWN WINSEAT-baseline vs pre-seat
regime artifact (30d insideevening legs; exiled clean). Baseline NOT
rolled.

## Arm 2 — sim-lackingline3-b: DIAG-GO ON ITS BASE, HELD UNMERGED (base drift)

Adoption + completion of the dead run's sixth lacking-line run (backlog
#1450), finished by a worker in the existing worktree
(sim-lackingline3-b) under the binding prereg d401cd489 (continuation
bank: prior 7 + fresh screen 13800-14199, ticks-short named primary
hunt, floor 8). Worker report, verified by the coordinator except where
noted:

- Dead worker's 262 screen files verified (contiguous 13800-14061, no
  gaps, no 0-byte/corrupt files, errs 0); remaining 138 seeds run with
  the identical driver/env (two interruptions — an exec-session reap at
  14087, a service restart at 14179 — left no partial files; resumes
  started at the next missing seed only). Final screen 400/400, errs 0.
- Combined bank 13 (prior 7 + fresh qualifiers 13869, 13899, 14041,
  14089, 14125, 14137; 39 fresh creek evenings; combined 73 creek
  evenings, 14 episodes) — above the 8-seed floor.
- Judged ON legs for the full 13-seed bank: 18 ON creek evenings,
  10 still-refused, 8 rescued (44.4%); skip breakdown ticks-short 4,
  kcal-short 6, wood-short 0, build/retry 0.
- **Staged seed/evening: 13421, loop-day 18, ticks-short.** Line
  played: "No bridge tonight — 95 ticks left in the day, and a bridge
  takes 96 ticks." — 95 = the classification's live ticksToDayEnd,
  wood 4, kcal 2297. Exactly one "No bridge" line in the judged day's
  full 21-line tail; engine creek lines agree; no contradiction.
- All prereg bars (a)-(g) held ON THE WORKER'S BASE: staged evening
  exists; line present with correct number; no contradicting lever
  line; errs 0 / unclassified 0 / no probe-route error; determinism
  re-run of 13421 ON byte-identical (staging dir deleted); OFF guard
  0 lever lines over 390 combined-bank OFF evenings; sense-test
  passes (reads as a person one tick short of a bridge, not a debug
  string).
- Correction recorded in the worker evidence (not used to re-score):
  the prereg's 2-tick carry-cost guess was wrong in mechanism — all
  four first-episode ticks-short mornings were already-carrying skips
  (pack already 4 logs), so ON ticks equal OFF ticks exactly.
  Wood-short remains unplayed (pack is 4 on all 18 ON creek evenings);
  the evidence proposes a pile-floor route or an
  unplayable-by-construction close for a future prereg, never
  weakening the carry.
- Worker commit 4cd8b8c70 (25 files); safe-commit index clobber hit
  after the commit (staged deletions in the main index) — repaired
  via cacheinfo with HEAD blobs, verified status empty + diff HEAD
  empty. Worktree contains only committed work. Non-qualifier fresh
  OFF corpora (394 files) deleted after census verification, per
  prereg; the census JSON is the committed record of the full screen.

**Coordinator landing gate — FAILED on determinism after rebase, arm
HELD.** The branch rebased clean onto master 2192ff080 (A's shoutrec
landing) as bde92b27a; arm files byte-identical across the rebase
(scripts + evidence + census diff empty); all static proof legs pass.
But the proof's live determinism leg FAILS on the new base: a fresh ON
re-run of 13421 diverges from the judged corpus from day 3 (28/30
evenings differ; deaths and waveKills differ; woodcarryStore records
0 vs 3 — on the new base the seed produces NO creek evenings at all,
so the staged evening does not exist there). A second re-run on the
new base is byte-identical to the first: the trajectory is
deterministic ON EACH BASE and different ACROSS bases. This is base
drift, not a worker error and not a flaky leg — game-affecting
landings between the worker's base and 2192ff080 (notably the
gaps2-knower per-knower ledger + peer knowledge gate, plus A's
instrumentation) moved competent-play trajectories. Per the loop's
proof-green-after-rebase rule the branch is NOT merged and its
verdict is NOT re-scored: **DIAG-GO stands as a result on its base
and is NOT current-master evidence.** The branch (bde92b27a) and its
worktree are left registered with a FRESH heartbeat so the reaper
will not touch them; the worktree is clean; staging dirs deleted.

**Next run (not this run's work):** re-judge the bank on current
master under a prereg amendment that pins the base commit — fresh ON
legs for the combined bank, staged seed re-determined AFTER the full
ON census in bank order (never cherry-picked). If a staged evening
re-appears, re-judge bars (a)-(g) on the new corpus; if none appears,
the verdict is INSUFFICIENT-DATA on the new base with the gate
distributions as the diagnosis. Do NOT merge this branch as a
current-master result, and do NOT quote the staged line as
current-master behavior until it re-plays on current master.
Backlog #1450 stays OPEN.

Telemetry deviation check on the (unmerged) ON corpus: 3 LOUD lines
(national 12->0, table 16->0, wins 16->0), same known regime artifact;
baseline NOT rolled. Wall numbers on these 30d evening legs: national
/ table / wins NOT OBSERVABLE (reported, never zeros); wave 4-5
reach 0 on this substrate.

Village assessment (worker, plain words): all 13 banked villages
survived 30 days on both legs; wave 2 reached in 10 of 13, wave 3 in 1
(13421); 82 monster kills vs 17 villager deaths. The blank filled on
its base: the lacking-line, unit-proven but unplayed after five runs,
has now been heard in a played night out.

## Infrastructure notes

- Main-tree git is very slow under sibling load (a plain `git status`
  took ~5 min; worktree git ~3-10s). Batch git calls; do not mistake
  slowness for a hang.
- A service restart interrupted one coordinator exec mid-run
  (heartbeat + post-merge proof); heartbeat had landed (23:49Z) and
  the proof was re-run clean after the restart. No state was lost.
- No EPERM flap blocked this run's commits or merges.
- Loop A landed shoutrec (2192ff080) mid-run; zero file overlap with
  either B arm; B never touched A's trees, claims, or lock.

## Disposition

- food-economy stays converging (NOT converged): one narration caveat
  measured to mechanism-proven/frequency-open and landed as
  measurement, one six-run measurement blank proven on its base but
  held by base drift — no food-economy default flipped, no balance
  change landed.
- scale-onramp stays converging (untouched; sibling loop A lane).
- Claim deleted; lock deleted. Raidname branch deleted after merge.
  Lackingline3 branch + worktree HELD (see above) — the next B run
  owns its re-judgment, not a silent merge.
- Evidence: this file (coordinator) + sim-raidname-collision-b.md +
  sim-lackingline3-b.md (on branch sim-lackingline3-b, NOT on master
  yet) + their corpora, censuses, analyzers, and proof scripts.
  Merged locally, pending ship (arm 1 only).
