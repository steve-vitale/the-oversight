# Coordinator evidence — run fleshout-20261112T1815Z (Loop A, axis scale-onramp)

STALE-LOCK RECOVERY + ADOPTION of the dead 1715Z run. Three arms
LANDED, merged locally, pending ship. Master tip after this run:
`1033f4e7b`.

## Run start

Lock `fleshout-20261112T1715Z` (created 17:16:25Z, ~59 min old at run
start) had no registry entry, no tree, no heartbeat → DEAD per the
guard. Deleted the lock; retired its claim to `.DEAD`. The 1715Z
run's three worktrees all had heartbeats > 15 min stale
(sim-bisect-r10-a 17:28:10Z, sim-stallcut57-a 17:35:28Z,
sim-pairarming-a 17:31:28Z). This run's claim
`fleshout-20261112T1815Z.json` (loop oversight-flesh-out-loop, axis
scale-onramp, arms sim-bisect-r10-a, sim-stallcut57-a,
sim-pairarming-a, started 18:18:00Z) replaces it. Pre-flight: main
tree clean, disk 40%, HEAD `5f7250e26`; origin/master `839250558`
verified an ancestor of HEAD; local 47 ahead (pending-ship state).
Loop B's tree `sim-fleerepair-adopt-b` was stale at first check but a
Loop B agent was seen actively working in it at 18:39Z — NOT touched
(no live B claim file exists; B later claimed its 1830Z run at
18:40).

## Arm 1 — sim-stallcut57-a: LANDED `993513eb5`

**Verdict (committed):** STALLCUT57_COLLAPSED 1/8 survived +
STALL_STILL_IN 0/8 regional. Stall transition in commits **58–65**.
Median 102d, deaths 661, standing 145–199 (7/8 seeds at exactly
199), wave-5 0/8, 0 phantom days, blooded 2/8. Day-identical to the
stallcut49 leg on 8/8 seeds. Proof 63/63 on the rebased tree.
Evidence `evidence/2026-11-12/sim-stallcut57-a.md` (+ prereg,
summary, 8 per-seed JSONs).

**What went wrong, and the recovery.** The dead 1715Z worker had
verified the arm and rebased clean onto `5f7250e26` →
`e1443c826`, proof 63/63 — but the ff-only merge failed because
master had moved to `b91014c86` (journey establishment r134) under
the rebase. The chained command then wrongly ran
`worktree-release.sh` (registry marked done-merged while unmerged)
and `git worktree remove --force` (worktree deleted). `git branch
-d` correctly refused — **branch `sim-stallcut57-a` was KEPT,
unmerged at `e1443c826`**. This repeats the 2026-11-09 lesson:
never chain release steps after a merge with `;`; verify `git
merge-base --is-ancestor <branch> HEAD` before releasing. My
registry-fix script failed with an AssertionError (a reaper had
already removed the done-merged + pathless entry before it ran — no
write happened, nothing corrupted). Recovery: registered fresh slug
**`sim-stallcut57-land`** (worktree at `b91014c86`, heartbeat
18:34:37Z), checked out `sim-stallcut57-a`, rebased onto current
master (`90f5d8298`, Loop B's evidence-only commit), re-proved
63/63, merged ff-only with strict `&&` chaining, verified
ancestry, then released + removed the tree + deleted both branches
in a separate call. No work lost.

## Arm 2 — sim-bisect-r10-a: LANDED `5bb5b58f7`

**Verdict (committed):** survived **4/8 → INCONCLUSIVE** (expected
band, revised decision table: CUT_HEALTHY impossible; ≥5/8 →
CUT10_ABOVE_FAR_END; ≤2/8 → CUT10_COLLAPSED); regional **7/8 →
REGIONAL_INTACT**. Wins 0, national 0, table 0, wave-5 2/8, wave-4
8/8, median 150d, deaths 639, standing 150–425, blooded 4/8,
instrumentErrors 0. Per-seed days: 190391: 86 lost/regional/199/w4;
190392: 144 lost/regional/199/w4; 190393: 150 survived/regional/425/
w5, tribute-ready; 190394: 43 lost/village/150/w4; 190395: 150
survived/regional/199/w4; 190396: 87 lost/regional/199/w4; 190397:
150 survived/regional/225/w5; 190398: 150 survived/regional/199/w4.
**Deep-identity vs the r9 corpus on master: 0 4-field signature
diffs, 0 full daily deep-diffs on all 8 seeds** (day counts
85/143/149/42/149/86/148/149) — commits 386–389 hold no game code;
the 190393/190397 remainder localizes to commits 390–393. Wave-5
choke peaks (living w4+ vets): 1, 1, 4, 0, 1, 1, 2, 2; 190398 holds
the pair but never unlocks (the pair-arming case — see arm 3).
Phantom days 0; 5 shadow-prevented days on dying 190394 (same as
r9). 190393 tribute-ready with **0 mentions of
tribute/table/seat** in vetSays/casts/killCalls — voiceless tribute
witnessed twice. Proof 63/63 on the rebased tree. Evidence
`evidence/2026-11-12/sim-bisect-r10-cut-a.md` (+ prereg, summary,
8 per-seed JSONs).

**What went wrong, and the recovery.** The dead 1715Z worker had
committed the arm (`0c8b32aa2`, 10 files) and rebased clean →
`1fa857558` (parent `50c6e7fc8`), proof 63/63. The ff-only merge
printed "Updating 50c6e7fc8..1fa857558" and then failed on a
main-tree `index.lock` held by a concurrent git process (the ship
loop's long `git status` + Loop B's commit landing at the same
time). The merge did NOT land — HEAD stayed `50c6e7fc8`, then Loop
B committed `90f5d8298` onto it. Branch intact at `1fa857558`.
Recovery: rebased onto `993513eb5` (current master after the
stallcut57 landing — B's commit touches only
`sim-fleerepair-adopt-b.md`, no overlap), re-proved 63/63, merged
ff-only with strict `&&` chaining, verified ancestry, then released
+ removed the tree + deleted the branch in a separate call.

## Arm 3 — sim-pairarming-a: LANDED `1033f4e7b` (finished by the coordinator)

The dead worker left only the prereg + instrument (512 lines). The
coordinator wrote the driver, analyzer, and proof (72 legs), applied
the fix swap + vetfirst scratch, ran the band, and landed it.
**Verdict: GO** on instrument validity only — unattributed armed
drops **0** (bar ≤ 1), gear coverage **100%**, replay identity
**100%** (0 mismatched days on all 8 seeds, occurrence-aligned),
instrument errors **0**, analyzer exit 0. Proof 72/72 green before
any judged sim. Evidence `evidence/2026-11-12/sim-pairarming-a.md`
(+ prereg, summary, 8 run-2 per-seed JSONs, 8 run-1 per-seed JSONs
archived under `perseed-pairarming-a-v1/`).

**Mechanism finding (reported, not judged):** seed 190398 is the
only seed that holds a pair — one block, d131–149 (19 days),
veterans 2 throughout, capped standing 515–540, peak wave 4. Armed
never reaches the demand of 6. Two layers: (a) **headcount ceiling,
the binding constraint** — the living roster is 3–5 on 19/19 hold
days, always below the 6 the bar demands; even with every living
person armed, armed ≤ roster < 6; (b) **deaths are the drops** —
all three armed drops on hold days are deaths (2 scholar-deaths in
the wild, d131 Kebede Balcha and d139 Boris Kowalski; 1 visiting
joiner killed by a monster, d138 Alberto Palacios); **0 gear-loss
events** on hold days — the gear-loss hypothesis the instrument
was built to distinguish is rejected by the data. Scholar churn:
three scholars die in 19 days; the third death (d150, Amine
Touimi) ends the pair because the scholar was himself a veteran.
Ingrid Vik makes the pair (d131 veteran kill, on camera) and
inherits the scholarship on d150. **The shortfall is entirely
voiceless:** six vetSays lines in the hold are System
kill-announcements and fight reports; nobody names the shortfall,
the scholar deaths, or the shut wave-5 door. Three findings
appended to `sim-findings.md` (headcount ceiling, scholar churn,
voiceless shortfall — all `[open]`).

**Three instrument bugs found mid-run, all fixed and proven
before the judged corpus was finalized:**

1. Over-explained check ignored simultaneous gains (190391 d75:
   3 deaths + 1 armed joiner = net drop 2, 3 explained events —
   flagged a false instrument error). Fix: a day explains
   (drop + gains) loss events.
2. Replay comparison collapsed duplicate days (190394 d43): both
   drivers emit TWO snapshots for the village-loss day (in-day,
   then a post-loss flush with the roster emptied) and both skip
   day 3. A plain day→entry map compared this run's in-day
   snapshot (roster 1) against r9's post-loss flush (roster 0).
   Fix: occurrence-aware alignment. The r10 deep-diff was
   index-aligned and found 0 diffs for the same reason.
3. `loadR9Daily` hit execSync's 1 MB maxBuffer: seven of the eight
   r9 per-seed files are 1.1–2.2 MB (only 190394, 349 KB, loaded);
   the catch silently reported the other seven "unreadable" and
   the per-seed lines read as 0 mismatches — which looked clean
   but meant no comparison had run. Fix: 64 MB maxBuffer. Lesson:
   a "0 mismatches" line is meaningless without a days-compared
   count next to it.

**Band re-run.** Run 1's verdict was already GO, but its stored
corpus carried the stale false error from bug 1, so the analyzer
exited 1. Rather than rewriting evidence post-hoc, run 1 was
archived to `perseed-pairarming-a-v1/` and the band re-run with
the fixed instrument. The re-run was SIGTERM'd mid-way (~7 min in,
cause unobserved — the tree stayed registered and active, heartbeat
fresh; no reaper removal); 5 of 8 seeds were already written, and
the remaining 3 were run on their own. Run 2 reproduces run 1
exactly on every wall number and on the mechanism finding, with
instrument errors 0 and analyzer exit 0.

## Wall numbers (all three arms, same band, 150d, seeds 190391–190398)

Survived **4/8**, regional **7/8**, village 1/8. Wins **0**,
national **0**, table **0**. Wave-5 **2/8**, wave-4 8/8. Median
**150d**, deaths **639**, standing 150–425, blooded 4/8. The wall
does not move on any leg this run. Scale-onramp stays converging
(NOT converged).

## Infrastructure

- **Box extremely loaded all run** (journey2-succession node
  tests, cron reaper, Loop B fleerepair work, ship-loop bumps).
  Git ops take minutes (rebase 122s, heartbeats ~2 min, worktree
  add ~5–12 min). Do not kill slow git ops; do not poll in loops.
- **Faulty merge chains, twice.** The stallcut57 chain (from the
  dead run) released a tree while unmerged; the r10 merge failed on
  a concurrent index lock after printing "Updating". Both recovered
  because the branches were kept and the merges were re-attempted
  with strict `&&` chaining and ancestry verification before any
  release step. The 2026-11-09 lesson holds: never chain release
  steps after a merge with `;`.
- **Safe-commit index clobber** struck the pairarming commit (24
  files shown `D` + `??`); repaired via `git ls-tree -r HEAD --
  evidence/2026-11-12/ scripts/ | git update-index --add
  --index-info`; verified status empty + diff HEAD empty before
  rebasing. The r10 commit (10 files) clobbered the same way in the
  dead run and was repaired identically.
- **Reaper sweep at closeout:** 11/16 active, no dead trees of
  mine. Two LOUD notes about other loops' trees with uncommitted
  changes (sim-proofrefresh-b10, Loop B; journey-deepening,
  playtest loop) — not touched.
- **No EPERM write flap this run.** No rebase stop-at-pick quirk
  (all rebases clean first attempt).
- **Telemetry deviation check REFUSED on all three corpora**
  (recorder-corpus class, exit 2) — recorded in each arm's
  evidence appendix; baseline NOT rolled.

## Blanks filled / next blanks

Filled this run: (1) bisect ROUND 10 decision — INCONCLUSIVE 4/8,
final localizing cut; the remainder is in commits 390–393 and the
healthy pole is NOT in this window (option-b re-derivation owed —
what `5157782a4` carries that the far end does not). (2) stall cut
at ~57th/58th — transition in commits 58–65; the next natural cut
is commit 61 or 62. (3) wave-5 choke is a pair-arming problem —
answered: it is a headcount problem with death churn on top, not
a gear problem; the next readiness arm should look at the demand
vs the living roster (and at scholar exposure in the wild), not at
gear retention. (4) voiceless tribute — witnessed a second time
(r10 190393) and a third family member found (pairarming shortfall
voiceless).

Next blanks, in order: (1) option-b re-derivation (what the
vetphantom fix carries that the far end does not) — the next
bisect-style arm; (2) stall cut at commit 61 or 62; (3) proof
refresh round 10 on the next manifest change (Loop B owns round 9
— do not pre-claim); (4) regression_watch named-class (13/16→
10/16); (5) headcount-ceiling design question — whether the wave-5
armed demand (6) or the village's living roster is the wrong lever
(Steve-call; sim-findings.md `[open]` 2026-11-12); (6) scholar
churn in the wild (sim-findings.md `[open]` 2026-11-12); (7) a
third fresh band on the r7 base to test whether 25% is the true
collapse rate or the edge of it, plus a band with village-rank
seeds to test the ARC negative half (carried from 1630Z).

Claim deleted; lock deleted.
