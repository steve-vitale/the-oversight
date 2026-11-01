# sim-fullseat-recheck-a — PRE-REGISTRATION (written BEFORE any judged sims, 2026-11-01)

Run: Loop A worker, arm sim-fullseat-recheck-a, axis scale-onramp, run
fleshout-loop-a-20261101T0615Z. Sibling loop work NOT touched.
Arm type: DIAG ONLY — measurement, zero src/js changes, zero
policy-default flips, zero gate/demand numbers moved, zero edits to
existing policy files. New files only: one sweep (2115Z pattern, new
name), one analyzer, one proof test, this prereg, and the evidence
file. No docs fixes in this arm (TABLE.md's stage>=3 claim is stale
per the brief, backlog #1328; the code below is authoritative).

## Question

The 0515Z closeout's blank (3): national is reached, the lesser seat
is sat, the full seat is still 0 — the full-seat path remains the
blocker. With the contact-finish rule (plus twoblow and chorus-hold)
now landed, does the full-seat path move at all on the
tableseat-nowait substrate? This arm re-measures the 2115Z diag on
current master with FRESH seeds and answers: which component blocks,
by how far, on each seed's end AND closest approach — and whether
the veteran count (the 2115Z/#1649 story) has moved.

## Code canon (read before sims — not invented)

- src/js/progression.js:613 deedGateReady() — verified by reading
  the code in this worktree before writing this prereg. FULL seat
  (`ok`) requires: w1>=5, w2>=5, w3>=4, w4>=3, w5>=2 distinct fought
  blow-by-blow; contests>=3; crises>=3; stage>=2; foodDeeds
  (sentimentTaught && feastSurgeUsed); AND scale national/global
  (Steve ruling 2026-10-27, enforced in `ok`). docs/TABLE.md's
  stage>=3 line is STALE (backlog #1328) and is NOT used.
- src/js/table.js tableSeat() — full first (deedGateReady().ok);
  failing that, LESSER iff w1>=4, w2>=4, w3>=3, contests>=2,
  crises>=2, scale regional+, stage>=2, foodDeeds.
- docs/MONSTER-WAVES.md: wave-5 gate standing>=200 AND wave-4
  faced; wave-4 gate standing>=100 + combat-readiness bars
  (armored/armed/tricks/veterans; wave-5 demand veterans 2 living
  wave-4+ killers). Readiness deferral holds villageStandingTotal()
  at t5-1 (199) while any bar is short.
- Veterans rule (standing.js isLiving, as implemented by
  vet2-diag, reused unchanged): a killer counts only while living
  at the daily snapshot. This arm reports TWO veteran sets from
  vet2-diag daily rows: vet4 = living wave-3+ killers, vet5 =
  living wave-4+ killers — at END and at MAX (max daily set size).
  "Living wave-3 killers" in the brief is read as the vet4 set
  (wave-3+ killers, the wave-4 readiness bar's population); the
  exact-wave-3-only end count is also reported from the final
  waveKillLog as a supplement, never as a substitute.

## Base pin

- Worktree HEAD at prereg time: 1c21a87fd7ccb44e12516271bd629bdab44d55b1
  (2026-11-01 06:19Z, sim-eveningstep-b). Contact-finish rule is an
  ancestor of HEAD (verified: git merge-base --is-ancestor
  759dd7263 HEAD). This base is NEWER than the 2115Z base, so
  trajectories on any seed may differ from the 2115Z corpus. This
  arm judges ONLY its own corpus on THIS base; 2115Z numbers are
  quoted as prior-base context, never as current data.

## Prior baselines (context only, never re-judged here)

- 2115Z fullseat-diag (seeds 73641–73648, tableseat-nowait
  substrate, 180d death-aware): ranked binding blockers w5 8/8
  median distance 2, w4 6/8 distance 3, w3 6/8 distance 2,
  foodDeeds 6/8 distance 1; full seat 0/16 (paired rows), wave 5
  0/32 (paired rows).
- 2026-10-31 fullseat-a: closest seeds hold 1 living wave-4+
  killer vs demand 2; only 4 wave-4+ kills in 19 runs; wave 5 never
  unlocks because the readiness deferral's only short bar is
  veterans (backlog #1649, manufacture gap not counting gap).

## Seed plan (fixed now; no band-shopping)

Fresh 8 seeds: 78201, 78202, 78203, 78204, 78205, 78206, 78207, 78208.

AMENDMENT (appended BEFORE any judged sims; no sim has run yet):
the originally preregistered band 76201–76208 FAILED the freshness
grep — those seeds were already used by sim-witnesource (2026-10-17)
and sim-linkgen-a (2026-10-30, 76201–76208 x 2 legs). The band is
replaced wholesale by 78201–78208. The 7820x band's md check finds
only a git-hash substring (7e326ff9…7820a435 in sim-woodshortline-b),
not a seed; the full-tree exact-seed grep for 78201–78208 must still
return clean before the sweep runs.

FRESHNESS VERIFIED (before any judged sim): full-tree exact-string
hits for 78201–78208 are only numeric substrings (pantryKcal 78201,
float 0.78678206…, 3786378204), never seed uses; the seed-token grep
(s7820[1-8], "seed": 7820[1-8]) returns zero hits; no s7820x filename
exists in any perseed corpus dir; the band intersects none of the
forbidden bands. 78201–78208 are fresh.

Freshness verification (must complete clean BEFORE the sweep runs;
if it fails, this prereg is amended before any judged sim):
- Committed per-seed corpus filenames: 73601–73608, 73641–73648
  (tableseat/fullseat-diag bands), 74501–74508, 75101–75108
  (fullseatgate bands), 87103–87141 band (fullseat-a /
  contactfinish / contactrec corpora) — none of 76201–76208
  appears in any of these filename sets.
- Forbidden bands from the brief: 73641–73648, 73671–73678, the
  871xx contact-finish confirm band (87103, 87107, 87120, 87121,
  87126, 87128, 87132, 87134, 87135, 87137, 87138, 87141) —
  76201–76208 intersects none.
- Dated evidence .md files: grep for the 76201–76208 seed strings
  across evidence/ dated .md files must return no judged-corpus
  hit before the sweep runs.

## Policy stack (2115Z substrate, exactly)

- baseline = scripts/policies/tableseat-nowait.js
  (LEANLINKRESCUE=1, TABLESEATNOWAIT=1, FULLSEAT unset, VET2 unset).
- armed = tableseat-nowait wrapped OUTSIDE by
  scripts/policies/fullseat-diag.js (FULLSEAT=1) and, outside
  that, scripts/policies/vet2-diag.js (VET2=1). Both recorders
  reused UNMODIFIED — pure-read, no game-state writes, no RNG.
  Composition order: withVet2Diag(withFullseatDiag(tableseatNowait)).
- Horizon: 180d death-aware cap (runDays days=180; Game.over
  stops the run; dead villages stop simulating — the cap is a
  ceiling, never a fixed-horizon target).
- Paired design (2115Z G2): baseline and armed run on IDENTICAL
  seeds; trajectories must be identical (recorder neutrality).

## Census per seed (all from the judged corpus — no other source)

1. Wall numbers: won, national ever/final, table reached/entered,
   seat at end (none/lesser/full), wave reach (unlockedWave),
   survival days/gameDays, endReason.
2. Full-seat snapshot at END (snapFullSeat) and at WIN (recorder
   winSnap where won): per-component distances for w1..w5,
   contests, crises, stage, foodDeeds (split: which half missing),
   plus seat, ok, rank, indispensable sub-gates.
3. Closest approach: per-component MAX over recorder daily rows
   (w1..w5, contests, crises, stage), foodDeeds ever true?,
   firstFullSeatDay / firstLesserDay. Max-vector distances
   computed from the max vector.
4. Ranked binding-blocker list: components ordered by (seeds
   blocked desc, median end distance desc) over the 8 armed rows,
   using END-snapshot binding lists; max-distance medians also
   reported. UNCLASSIFIED = an armed row with no endSnap, no
   dist vector, a seat outside {none, lesser, full}, or a null
   binding list. Zero UNCLASSIFIED is required for DIAG-GO.
5. Veteran counts: living vet4 (wave-3+) and vet5 (wave-4+) set
   sizes at END and at MAX (max daily set size over vet2 rows),
   with holder names at max where recorded; vet2 errs must be 0.
6. Wave-5 fight counts: distinct wave-5 types fought at END (w5)
   and at MAX (diag.max.w5); wave-5 kills (count + killers) from
   the final waveKillLog; wave-5 unlock chain (unlockedWave,
   standing peak, holdKind: cap / defer5 / released / below-bar).
7. Death-cause shares (armed rows) and median/max survival.

## Sense read (SENSE-TESTING LAW)

Two transcripts, read for MEANING, not counts, via the sweep's
--sense narration replay (scratch only — narration shifts
trajectories, so sense output NEVER enters the census):
(a) the closest-to-full seed's endgame (smallest total end
distance-to-full); (b) one blocker seed (a seed whose binding
list is headed by w5/veterans). Notes go in the evidence file.

## Primary metric + DIAG-GO threshold (binding)

DIAG-GO iff ALL of:
- Usable judged seeds 8/8 armed (+ 8/8 baseline pairs).
- 8/8 armed rows carry an end snapshot with per-component
  distances for all 9 components (w1..w5, contests, crises,
  stage, foodDeeds); every WON armed row carries a win snapshot.
- Ranked binding-blocker list computable; zero UNCLASSIFIED.
- Veteran counts (end + max, vet4 and vet5) present on 8/8;
  wave-5 fight counts (distinct end/max + kills) present on 8/8.
- G1 det-gate PASSED: recorder OFF vs ON delegation proof on one
  seed (tableseat-nowait daily byte-identical with FULLSEAT/VET2
  unset, no recorder surface).
- G2 recorder neutrality PASSED: baseline vs armed days,
  gameDays, ts counters, starvation identical on 8/8 seeds.
- G3 corpus integrity PASSED: every config produced a row, no
  zero-day rows, endSnap with dist on every armed row, diag
  block + vet2 block on every armed row, vet2 errs 0, fullseat
  errs 0.
- Determinism leg PASSED: one armed seed re-run to a worktree
  scratch dir (never /tmp, never the judged corpus) is
  byte-identical to its judged JSON (anchorCommit stamp line
  excepted only if an instruments-only commit landed between
  runs, stated explicitly).
- Verdict sections stated: (a) full seat reached or not, with
  seed/day evidence; (b) ranked binding blockers with distances;
  (c) veteran counts vs 2115Z/#1649; (d) wall numbers.

A miss on any gate item is NO-GO for the DIAG-GO verdict (the
census tables may still be reported, but the verdict line reads
NO-GO with the failing item named). No re-scoring against a
friendlier metric mid-run; metric doubts go under "metric
review" for the NEXT run.

## Panel (§15)

NOT APPLICABLE — single-base DIAG census, no before/after lever
comparison exists in this arm; none fabricated. The baseline-vs-
armed pair compares recorder-on vs recorder-off trajectories of
the SAME stack; it is a neutrality proof, not a panel
comparison, and its numbers never enter the census tables.

## Runner discipline (binding)

Stdout runner + chunked-writer corpus writes throughout (the
2115Z precedent — a sweep killed mid-run must not lose
completed configs). Judged corpora are NEVER staged in /tmp.
Scratch dirs live in the worktree and are deleted before commit.

## Metric review (for the NEXT run — mandatory section in evidence)

To be filled at evidence time, including: whether the
max-vector definition changed any seed's verdict, and whether
the vet4 (wave-3+) vs exact-wave-3-only distinction mattered
for any seed's veteran story.
