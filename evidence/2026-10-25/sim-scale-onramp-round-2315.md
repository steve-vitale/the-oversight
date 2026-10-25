# sim-scale-onramp-round-2315 — ADOPTION RUN (axis scale-onramp)

Run: flesh-out loop A, 2026-10-25, run fleshout-20261025T2315Z.
No new sim arm was briefed. This run adopted and landed the two
DIAG arms stranded by the dead 2115Z run. Zero game-code change in
this run (both arms are DIAG-only, zero src/js diff), so no lever
was played and no wall number moved — the adoption itself, with
both verdicts verified on current master, is the deliverable.

## STALE-LOCK RECOVERY (at run start)

- Lock fleshout-20261025T2115Z found, created 21:17:39Z — 118 min
  old at run start (past the 90-min fallback), and both of its
  trees' heartbeats were 59 min stale (past the 15-min guard):
  sim-nonworldkill-a 22:16:42Z, sim-fieldpos-a 22:16:41Z.
  Previous run DEAD by both rules. Lock deleted, 2115Z claim
  retired to .DEAD, this run's lock + claim written before any
  sim or merge work.
- Loop B's live claim (fleshout-loop-b-20261025T2230Z,
  food-economy) was NOT touched — different loop, different axis.
- Pre-flight: main tree clean (0 lines), disk 27%. Reap ran clean
  (4 LOUD "uncommitted changes" notes, all other owners' trees,
  left alone; both adoption trees intact).

## ARMS ADOPTED (both DIAG-GO on their own pre-registered headers)

### Arm 1 — sim-nonworldkill-a (commit acbc0c933 on master)

- Question: which initiation door produced the band's only wave-4
  kill (seed 73678, day 115, strike, scholar, via 'player')?
- Verdict (arm's own header, adopted unchanged): DIAG-GO.
  113/113 TB-fight initiations classified, 0 unclassified; the
  strike kill's door identified with the full join (start row +
  tbEnd row + waveKillLog delta); wave-4 TB kills by door counted
  band-wide: feast-draw 1, all else 0.
- Plain words: the band's single veteran came from feast smoke —
  a feast-draw monster fight — not from the world funnel (raids,
  arrivals, wandering monsters) at all. The world funnel produced
  zero veterans on this band. Any lever that tunes the world
  funnel is tuning a path that produced nothing here.
- Side finding (already in the backlog): TB-fight bystander melt —
  when a TB fight starts while an unrelated world monster sits on
  the player tile, the bystander melts unfought unless it is
  lingering/titan (4 melted across 5 mismatch fights). Whether a
  lifted bystander should be spared is a Steve design ruling, not
  a silent lever — recorded as such, not fixed here.
- Landing verification: rebased in its worktree onto master
  43a0786f8 (clean, 1 commit); the arm's own diff before vs after
  rebase is byte-identical; unit proof re-run in the worktree:
  test-nonworldkill-a 26/26. Merged --ff-only, main tree clean.

### Arm 2 — sim-fieldpos-a (commit 6545ca016 on master)

- Question: do defender-wounded entities get re-met more because
  of where field fights happen (the wound-echo gap's position leg)?
- Verdict (arm's own header, adopted unchanged): DIAG-GO,
  COUNTING-STRUCTURE CONFIRMED. Defender-first field re-meets at
  Haven 3.8% vs field-first 7.7%, medians both 2, exposure ratio
  1.06; entity-counted re-meets per entity 4.41 vs 4.43 — equal.
- Plain words: the echo gap is counting, not position. Wounded
  beasts are not re-met more because they linger near Haven;
  counted per beast, both groups meet the same number of times.
  The "mill" of repeat meetings is phantom re-meets of beasts
  already dropped below the line, not beasts camping the wall.
- Landing verification: rebased in its worktree onto master
  acbc0c933 (clean, 1 commit, on top of arm 1); arm diff before
  vs after rebase byte-identical; unit proof re-run in the
  worktree: test-fieldpos-a 15/15. Merged --ff-only, main tree
  clean. Both trees released, worktrees removed, branches deleted.
  Final reap clean; main tree 0 status lines.

## WALL NUMBERS (unchanged — no game code changed)

Shared band seeds 73671–73678, tableseat-nowait, 180d death-aware
(the arms' published control band, reproduced exactly twice):
national-ever 7/8, wins 4/8, wave-4 6/8, wave-5 0/8, deaths 234,
median survival 135d. Table: 4/8 entered (fieldpos progState
flags). Nothing here moved, because nothing in the game moved —
these are the standing numbers the next lever arm must beat.

## VILLAGE ASSESSMENT (plain words)

The village on this band is a place that survives and sometimes
wins, but its path upward runs through smoke, not through the
world. Its one veteran — the one villager who killed a wave-4
monster and lived to count — did it at a feast, not on a raid
or a hunt. Out in the world, wave-4 monsters arrive, are mostly
never fought, and the fights that happen leave wounded beasts
that keep shambling back into meetings without ever fighting,
dying, or leaving — crippled phantoms the village meets again
and again. The two arms adopted here settle two mechanism
questions: the veteran door is the feast draw, and the phantom
mill is a counting artifact, not a position problem. What is
still missing is a way for the world itself to produce veterans,
and a ruling on whether anything should ever close the phantom
mill (healing, departure, or finishing a crippled beast — the
defender-finish rule stays KILLED on cost guards).

## SENSE CHECK (SENSE-TESTING LAW)

Read the fieldpos sense trace (sim-fieldpos-a-sense.txt): the
most re-met wounded entity on seed 73671 was wounded at the wall
on day 8, then met 17 more times over 146 days — every single
meeting a 0-round flee at 2% health, wandering the Haven ring
(tiles 1–5 away) without ever fighting, dying, or departing.
That reads as a ghost, not a beast: a villager meeting it would
reasonably ask why it is still there. This is the wound-closure
blank in miniature, and it is a design-ruling question, not a
numbers question.

## METRIC REVIEW (§14 — binding, no mid-run re-scores)

No metric was re-scored. Both arms were judged only against
their own pre-registered DIAG-GO headers (written by the 2115Z
run before its sweeps); this adoption re-verified the proofs on
current master (26/26, 15/15) and the rebase diffs, and changed
no verdict. No game code changed, so no before/after panel
comparison applies — the balanced panel cannot ingest per-seed
recorder corpora (standing exception, twelfth sighting); the
sweep-compare tables + analyzer outputs in the arm evidence
files are the comparison of record. The telemetry baseline was
NOT rolled (see below).

## TELEMETRY DEVIATION CHECK (§10 step)

Ran telemetry-check.js (scale-wall baseline vs the nonworldkill
per-seed corpus, metrics national,table,wins,exiled). 3 LOUD lines:
national 12 -> 0, table -75% (16 -> 4), wins 16 -> 0 (n=10 files,
which includes summary.json + analysis.json — the documented
glob quirk). VERDICT: all three are ingestion/regime artifacts,
NOT real deviations — (a) this run changed zero game code, so
telemetry cannot have moved; (b) recorder rows do not carry
national/table/wins in baseline shape; (c) the scale-wall
baseline is a stale-regime snapshot (same class as the
leg2drift run's LOUD lines). Baseline NOT rolled. No investigation
beyond this note is warranted; the next game-code arm re-runs
this check on its own corpus.

## NEXT BLANKS (in order, for the next run)

1. Feast-draw yield measurement (from nonworldkill-a): the only
   veteran came from feast smoke — measure that door's yield
   (draw frequency / draw-wave targeting vs lottery ticket: 1
   wave-4 draw in 5?) before any lever touches the world funnel.
2. Wound-closure pricing, paper arm first (from fieldpos-a): price
   the closure options against this corpus (how many phantom
   meetings each removes) before any rule arm is briefed; the
   met-below-line finishing rule itself needs Steve's ruling
   (steve-call item from defwound, still open). Do NOT re-run the
   draft, position, or entity-count legs — all three are settled.
3. Do NOT touch the defender-finish rule: it stays KILLED.

## CONVERGENCE

scale-onramp stays converging (NOT converged): two mechanism
questions settled, no lever moved, no new content reached,
wave 5 still 0/8 on this band. food-economy untouched (sibling
loop B). Merged locally, pending ship. No [needs-eyes]:
diagnosis-only work, no feel/combat/UI change.
