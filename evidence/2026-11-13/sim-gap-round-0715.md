# sim-gap-round-0715 — Loop A adoption round (run fleshout-20261113T0915Z)

Run: oversight-flesh-out-loop, run fleshout-20261113T0915Z (scheduled 0315 CST).
Axis: scale-onramp (converging, NOT converged). Base master at run start
`f7352f946`. This run is an ADOPTION run for the dead 0715Z run — it spawned
no new arms.

## Stale-lock recovery (guard)

Lock at run start: run_id `fleshout-20261113T0715Z`, created
2026-11-13T07:35:00Z (~100 min old at 09:15Z, past the 90-min fallback).
No registry tree or heartbeat exists for that run_id — the 0715Z
coordinator died in a VM restart (~09:16Z, new boot `ca9ae69c`; the
flap-watch log shows boot `d4581308` until 09:09:38Z, then boot
`ca9ae69c` from 09:16:59Z). Per the guard the lock was stale-lock
recovered — deleted at run start, this run's lock
(`fleshout-20261113T0915Z`) created in its place.

The 0715Z coordinator's death did NOT kill its workers. Verified at
09:18Z via `subagent.list`: the burnoffsets-a worker (agent
`3306e435`) and the freezeline-a worker (agent `78ec984b`) were both
still RUNNING under dead run `eca5b969` (last activity 19–68s; the
burnoffsets b251 driver node process pid 3324 live, the freezeline
`check.js --quick` pid 1930 live), with file writes under 15 minutes
old in both trees. Per the loop-closeout skill those trees were NOT
touched this run — no re-spawn, no adoption mid-flight, no
`git status` writes. The tendshift-a worker (agent `8f2115ac`) was
DONE with its report delivered — adopted and landed below.

Loop B LIVE on its 0630Z claim (winnability chain: mirror-cap
follow-up panel) — NOT touched. A chat agent closed out that run
during this run (agent `6f3ff334`, done 09:37Z); its claim/trees are
that closeout's, not this run's.

## Arm 1 — sim-tendshift-a (ADOPTED, LANDED 0b22103b0)

Worker report delivered before this run started; branch clean with
3 commits on master `f7352f946`. Adoption verified, not assumed:
proof test re-run by the coordinator on the branch tip —
`node scripts/test-tendshift-a.js` **124/0 green, exit 0** — then
the three root driver/deepdiff logs (worker's §9) committed as
adoption commit `0b22103b0`, merged `--ff-only` (no pipe, strict
chain), ancestry verified (`git merge-base --is-ancestor
sim-tendshift-a HEAD`), main tree clean after. Tree released as
done-merged, worktree removed, branch deleted (`git worktree list`
shows 0 tendshift entries; master tip `0b22103b0`).

**Verdict: NO-GO — the tendexact × stream-shift interaction does NOT
save a gap seed on current master.** Interaction leg 1/8 survived vs
baseline 1/8 (different seed); neither gap seed saved (190392 d143→d81,
190394 d128→d127); the baseline's only survivor lost (190395
survived→lost d80); median 102d vs 139d (bar ≥111.2d); starvation 1 vs
0 (pass). Full evidence: `evidence/2026-11-13/sim-tendshift-a.md`
(+ prereg, corpora `perseed-tendshift-a-baseline/` +
`perseed-tendshift-a-interaction/`, 8 seeds each, band 190391–190398,
competent, 150d).

**The loud finding (worker's, adopted): current master is harsher
than the far end on this band.** Fresh baseline on the matched band:
master survives **1/8** where the far end survived 4/8 and the
healthy pole 6/8. Master loses three seeds the far end survived
(190393 d126, 190397 d135, 190398 d139) and loses 190391 much earlier
(d65 vs d86). The pole comparison the option-B search has been
running (pole 6/8 vs far-end 4/8) no longer describes the live game:
against current master the gap to the pole is 1/8 → 6/8, and it is
not a tendexact × stream-shift gap. The cause of master's regression
on this band is NOT chased here (out of scope for the arm) — it is
the next run's diagnostic question. Kill taxonomy (worker's §14):
CONCEPT-DEAD for tendexact × 997-burn as the +1-gap carrier on
current master. Do not retry tendexact × 997.

Sense-testing (from the arm evidence, adopted): voiceless collapses
confirmed on current master (interaction 190394 d115–130: ZERO
vetSays lines while the village dies; baseline 190392 d135–143: 1
line); the survivor seed's dialogue works (named veteran kills on
camera). New finding filed in the backlog: COMBAT LINES REPEAT
(identical combat lines 5–14× in a single day; freeze line itself
fires 0× on current master — the current-master check the pack-leader
finding asked for is now done).

## Arm 2 — sim-burnoffsets-a (STILL LIVE — NOT adopted this run)

Worker alive at last check (09:37Z, last activity seconds-old). The
bash loop (pid 2082) was running the remaining legs b251 → b499 →
b1999. Read-only progress snapshot at 09:37Z: b251 leg COMPLETE
(8/8 seeds, all village-lost, 0 wins, maxWave 4 on all 8, standing
199, regional); leg dirs b0/b1/b13/b251/b499/b1999 all exist. No
evidence .md has been written yet; the worker's analysis, proof and
commits are still ahead of it. DO NOT touch tree
`~/workspace/worktrees/sim-burnoffsets-a` until its report lands
(check `subagent.list` for agent `3306e435` + file-write freshness
first, per the closeout skill). Next run adopts it the same way
tendshift was adopted here: verify proof, merge --ff-only, release.

## Arm 3 — sim-freezeline-a (STILL LIVE — NOT adopted this run)

Worker alive at last check (09:37Z). Its evidence .md is WRITTEN
(last modified 09:08Z) and reads complete — verdict GO (fix), check
REPRODUCES on current master (44 freeze lines, worst 9 on one
seed-day), fix lands (44→21, worst same-text group 9→1, survival/wave
numbers byte-identical on all 9 seeds), proof 19/19 instrument +
12/12 game-level with RED→GREEN demonstrated — but the worker was
still running `node scripts/check.js --quick` (rerun, pid 11439,
started ~09:25Z) and its `src/js/game.js` change + tooling + evidence
are UNCOMMITTED. The evidence .md itself says "Check:
`node scripts/check.js --quick` — <result appended below>" and
"Inffight regression — <result appended below>" — those results are
the worker's to append before it commits. DO NOT touch tree
`~/workspace/worktrees/sim-freezeline-a` until its report lands
(agent `78ec984b`). Next run adopts it: verify the check.js result
is in the evidence, re-run `test-freezeline-a.js` (+ `--game`) and
`test-inffight-20261014.js` on the tree, commit via the tree's
safe-commit.sh (message carries `[needs-eyes]` — narration/feel
change), merge --ff-only, release. The fix is narration-only and
trajectory-identical, so no rebase risk beyond master movement.

New sense findings from this arm, already filed in the shared
`sim-findings.md` by the worker (verified in this run): APPLYSTATUS
FREEZE LINE REPEATS PER BELLOW (the stun-application line, one layer
down from the fixed line — next blank for a future arm); STRIKE
NARRATED AFTER THE KILL (one instance, 190396 d130, pre-existing
coherence glitch); the "square SCREAMS" double-fire is evidence-only
in the arm file, not filed (needs a look before any claim).

## Wall (this run's judged corpora)

Tendshift baseline (current master `f7352f946`, band 190391–190398,
competent, 150d): survived 1/8, regional 8/8, national 0/8, table
0/8, wins 0/8, wave-4 unlock 8/8, wave-5 unlock 1/8 (190398),
median survival 139d. Interaction leg: survived 1/8, national 0/8,
table 0/8, wins 0/8, wave-5 1/8, median 102d. No other judged corpus
this run (burnoffsets + freezeline still in flight).

## Telemetry deviation check

Attempted per loop body step 10 by the coordinator on the tendshift
baseline corpus: REFUSED by the tool ("refusing recorder-corpus
input: all 8 --current rows carry top-level anchorCommit, so they
are sweep recorder rows, not runs"), exactly as the arm's prereg
predicted and as prior bisect arms were refused. Recorded, not
waived; the baseline was NOT rolled. No LOUD lines exist to
investigate (the tool refused the input class entirely). No balanced
panel (§15 precedent: the panel takes no corpus input; the
before/after here is identical seeds, same driver, fix/interaction
as the only change).

## Metric review

The tendshift arm's primary metric held (gap save + no regression +
median + starvation, judged against a MEASURED baseline on identical
seeds) and separated the legs cleanly; no re-scoring happened. The
worker's scoping correction stands: the exact far-end-base cell
(203a32775 + tendexact + 997 burn) remains untested — worth exactly
one arm if the coordinator wants the historical pole closed rather
than the live-game answer. The rank read (1/8 vs pole 6/8) misleads
if read naively across bases; the count is comparable only within
this run.

## Infrastructure

- Host write flap: ALL-OK for the whole run (flap-watch log
  09:07–09:17Z, probe `git update-ref` successes; no EPERM
  anywhere). A VM replacement happened ~09:16Z (boot `d4581308` →
  `ca9ae69c`) — that is what killed the 0715Z coordinator; its two
  workers survived it.
- Reaper lock self-contention, again: `worktree-reap.sh` held
  REGISTRY.lock for 12+ min (started ~09:11Z, still holding at
  09:37Z); my heartbeat call queued 5+ min behind it and was killed
  by me; my tendshift release call queued 11+ min behind it at
  closeout. The reaper's own log (09:26Z pass) shows active 14/16,
  no removals, LOUD lines only for trees with uncommitted changes
  (mirrorcap-base-b, burnoffsets-a, freezeline-a, journey-landing)
  — NOT touched. The reaper fix (release the lock during scans /
  already-running guard) is still owed and still needs a Steve nod.
- Safe-commit index clobber: NOT hit on the tendshift adoption
  commit (0b22103b0) — status empty + diff HEAD empty after.
- Master moved 0 times under this run (tip `f7352f946` at start,
  `0b22103b0` after the tendshift merge, still tip at closeout).
  No pushes, no version bumps. Ship loop owns deploys.

## Convergence state

scale-onramp stays converging (NOT converged): the tendshift
interaction is CONCEPT-DEAD as the +1-gap carrier, no RNG-only or
interaction leg saves a gap seed, the healthy pole's 6/8 is not
re-derived by any tested combination, and national/table/wins are 0
on every judged corpus — and now the wall on current master reads
LOWER than the collapse-window numbers said (baseline 1/8, median
139d). The directive stands until the tracker records this axis
converged on measured evidence. Next blanks, in order: (1) adopt
burnoffsets-a + freezeline-a when their reports land (both live at
closeout — CHECK subagent.list + write freshness before touching
either tree); (2) the master regression on the matched band (1/8 vs
the far end's 4/8 — what moved between 203a32775 and f7352f946);
(3) the far-end-base interaction cell (203a32775 + tendexact + 997
burn) if the historical pole is to be closed; (4) headcount-ceiling
(Steve-call); (5) Reunion mirror pack in the wild (Steve design
call). food-economy stays converging (untouched; parked). Claim
fleshout-20261113T0715Z retired to .DEAD at closeout (its arms
adopted or carried by this run's claim); this run's claim
(fleshout-20261113T0915Z) stays LIVE until burnoffsets-a +
freezeline-a land — the next run adopts them under it. Lock deleted.
